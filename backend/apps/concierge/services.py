import json
import os
import urllib.error
import urllib.request
from decimal import Decimal

from django.conf import settings

from apps.inventory.models import Car


SYSTEM_PROMPT = """
You are AutoLux Concierge, a premium automotive assistant for a luxury car dealership.
Help users search inventory, understand financing, value trade-ins, and arrange private viewings.
Use only the inventory context provided by the backend. Do not invent vehicles, prices, availability, or dealership facts.
Keep replies polished, concise, calm, and practical. If the user wants to book a visit, ask for name, phone/email, vehicle, and preferred time.
""".strip()


def money(value):
    try:
        return f"${int(Decimal(value)):,}"
    except Exception:
        return "$0"


def serialize_car(car):
    return {
        "id": car.id,
        "year": car.year,
        "make": car.make,
        "model": car.model,
        "price": float(car.price),
        "mileage": car.mileage,
        "fuel": car.fuel,
        "transmission": car.transmission,
        "condition": car.condition,
        "dealership": car.dealership.name if car.dealership else "AutoLux showroom",
    }


def inventory_context(limit=8):
    cars = Car.objects.filter(is_available=True).select_related("dealership").order_by("-is_featured", "-created_at")[:limit]
    rows = [serialize_car(car) for car in cars]

    if not rows:
        rows = [
            {"year": 2024, "make": "BMW", "model": "M5 Competition", "price": 115000, "mileage": 0, "fuel": "gasoline", "condition": "new", "dealership": "AutoLux Madison"},
            {"year": 2024, "make": "Mercedes-Benz", "model": "GLE 63 AMG", "price": 132000, "mileage": 1200, "fuel": "hybrid", "condition": "certified", "dealership": "AutoLux Beverly"},
            {"year": 2023, "make": "Porsche", "model": "Cayenne Turbo", "price": 147500, "mileage": 8400, "fuel": "gasoline", "condition": "certified", "dealership": "AutoLux Design District"},
            {"year": 2024, "make": "Tesla", "model": "Model S Plaid", "price": 108990, "mileage": 0, "fuel": "electric", "condition": "new", "dealership": "AutoLux Design District"},
        ]

    return rows


def parse_budget(message):
    import re

    lower = message.lower()
    k_match = re.search(r"(?:under|below|around|about|max|budget|less than)\s*\$?(\d+(?:\.\d+)?)\s*k", lower)
    if k_match:
        return float(k_match.group(1)) * 1000

    money_match = re.search(r"\$?(\d{5,6})", lower)
    if money_match:
        return float(money_match.group(1))

    return None


def filtered_inventory(message):
    lower = message.lower()
    budget = parse_budget(lower)
    cars = inventory_context(limit=12)

    if budget:
        cars = [car for car in cars if float(car.get("price", 0)) <= budget]

    if "electric" in lower or " ev" in f" {lower}":
        cars = [car for car in cars if str(car.get("fuel", "")).lower() == "electric"]

    if "hybrid" in lower:
        cars = [car for car in cars if str(car.get("fuel", "")).lower() == "hybrid"]

    if "suv" in lower:
        suv_terms = ("suv", "gle", "cayenne", "x5", "range", "lx", "gx")
        cars = [
            car for car in cars
            if any(term in f"{car.get('make', '')} {car.get('model', '')}".lower() for term in suv_terms)
        ]

    return sorted(cars, key=lambda car: float(car.get("price", 0)))


def build_prompt(message, history):
    cars = inventory_context()
    car_lines = "\n".join(
        f"- {car['year']} {car['make']} {car['model']}: {money(car['price'])}, "
        f"{car['mileage']:,} mi, {car['fuel']}, {car['condition']}, at {car['dealership']}"
        for car in cars
    )
    recent_history = history[-8:] if isinstance(history, list) else []
    history_lines = "\n".join(
        f"{item.get('role', 'user')}: {item.get('text', '')}"
        for item in recent_history
        if isinstance(item, dict) and item.get("text")
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Current inventory:\n{car_lines}\n\n"
                f"Recent conversation:\n{history_lines or 'No prior conversation.'}\n\n"
                f"User message: {message}\n\n"
                "Reply as AutoLux Concierge. If useful, mention specific matching vehicles from the inventory."
            ),
        },
    ]


def call_ollama(messages):
    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.35,
            "num_predict": 280,
        },
    }
    request = urllib.request.Request(
        f"{settings.OLLAMA_BASE_URL}/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=settings.OLLAMA_TIMEOUT_SECONDS) as response:
        data = json.loads(response.read().decode("utf-8"))

    return data.get("message", {}).get("content", "").strip()


def fallback_reply(message):
    lower = message.lower()
    budget = parse_budget(lower)

    if lower.strip() in {"hi", "hello", "hey", "how are you?", "hi how are you?", "how are you"}:
        return "I am doing well, thank you. I can help you compare vehicles, estimate payments, value a trade, or arrange a private viewing."

    if "payment" in lower or "finance" in lower or "emi" in lower:
        return "For a quick planning estimate, a $100,000 vehicle with $20,000 down is roughly $1,340/month over 72 months at 6.4% APR. I can also help compare options from the current inventory."

    if "trade" in lower or "offer" in lower or "sell" in lower:
        return "For trade-ins, I would start with mileage, condition, service history, accident record, and market demand. Share those details and I can prepare an estimated range before a final showroom review."

    cars = filtered_inventory(message)
    if not cars:
        if budget and budget < 70000:
            payment_power = budget * 4.5
            return (
                f"With {money(budget)}, I would treat that as a strong down payment rather than a full purchase budget for this AutoLux collection. "
                f"Used as a down payment, it could support vehicles roughly around {money(payment_power)} depending on term, APR, taxes, and trade value.\n\n"
                "If you want to stay cash-only, I do not currently see an exact match under that amount in this premium inventory."
            )

        return "I did not find an exact match in the current inventory. I would loosen one filter first, such as budget, fuel type, or body style. You can also open inventory to browse the full collection."

    car_lines = "\n".join(
        f"{idx + 1}. {car['year']} {car['make']} {car['model']} - {money(car['price'])}"
        for idx, car in enumerate(cars[:3])
    )
    return f"I can help with that. A few strong current options are:\n\n{car_lines}\n\nWould you like payment estimates or a private viewing request?"


def build_concierge_reply(message, history):
    provider = os.getenv("AI_PROVIDER", "ollama").lower()

    if provider != "ollama":
        return {"reply": fallback_reply(message), "provider": "fallback"}

    try:
        reply = call_ollama(build_prompt(message, history))
        return {
            "reply": reply or fallback_reply(message),
            "provider": "ollama",
            "model": settings.OLLAMA_MODEL,
        }
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        return {
            "reply": fallback_reply(message),
            "provider": "fallback",
            "error": str(exc),
        }
