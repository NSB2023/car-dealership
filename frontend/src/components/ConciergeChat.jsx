import { useEffect, useMemo, useRef, useState } from "react"
import {
  Calculator,
  CalendarDays,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { sendConciergeMessage } from "../api/concierge"
import { getCars } from "../api/inventory"

const cn = (...classes) => classes.filter(Boolean).join(" ")

const FALLBACK_CARS = [
  {
    id: "m5-competition",
    make: "BMW",
    model: "M5 Competition",
    year: 2024,
    price: 115000,
    mileage: 0,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "new",
  },
  {
    id: "gle-63",
    make: "Mercedes-Benz",
    model: "GLE 63 AMG",
    year: 2024,
    price: 132000,
    mileage: 1200,
    fuel: "hybrid",
    transmission: "automatic",
    condition: "certified",
  },
  {
    id: "cayenne-turbo",
    make: "Porsche",
    model: "Cayenne Turbo",
    year: 2023,
    price: 147500,
    mileage: 8400,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "certified",
  },
  {
    id: "rs7",
    make: "Audi",
    model: "RS7 Sportback",
    year: 2024,
    price: 126900,
    mileage: 0,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "new",
  },
  {
    id: "lc-500",
    make: "Lexus",
    model: "LC 500",
    year: 2023,
    price: 98500,
    mileage: 5200,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "certified",
  },
  {
    id: "model-s-plaid",
    make: "Tesla",
    model: "Model S Plaid",
    year: 2024,
    price: 108990,
    mileage: 0,
    fuel: "electric",
    transmission: "single_speed",
    condition: "new",
  },
]

const SUGGESTIONS = [
  { label: "Find a luxury SUV", value: "Find me a luxury SUV under 130k" },
  { label: "Estimate payment", value: "Estimate payment on a 100k car with 20k down" },
  { label: "Value my trade", value: "Value my trade with 42000 miles in good condition" },
  { label: "Book viewing", value: "I want to book a private viewing" },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const normalizeCar = (car) => ({
  ...car,
  price: Number(car.price || 0),
  mileage: Number(car.mileage || 0),
})

const parseBudget = (text) => {
  const lower = text.toLowerCase()
  const kMatch = lower.match(/(?:under|below|around|about|max|budget|less than)\s*\$?(\d+(?:\.\d+)?)\s*k/)
  if (kMatch) return Number(kMatch[1]) * 1000

  const moneyMatch = lower.match(/\$?(\d{5,6})/)
  if (moneyMatch) return Number(moneyMatch[1])

  return null
}

const extractNumberBefore = (text, words, fallback) => {
  const lower = text.toLowerCase()
  for (const word of words) {
    const match = lower.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(k)?\\s*${word}`))
    if (match) return Number(match[1]) * (match[2] ? 1000 : 1)
  }
  return fallback
}

const estimateMonthlyPayment = ({ price, downPayment, tradeValue, rate = 6.4, term = 72 }) => {
  const principal = Math.max(price - downPayment - tradeValue, 0)
  const monthlyRate = rate / 100 / 12
  if (!principal) return 0
  if (!monthlyRate) return principal / term
  return principal * (monthlyRate * (1 + monthlyRate) ** term) / ((1 + monthlyRate) ** term - 1)
}

const estimateTradeValue = ({ mileage, condition }) => {
  const conditionMultiplier = condition.includes("excellent") ? 1 : condition.includes("fair") ? 0.78 : 0.9
  const mileageMultiplier = Math.max(0.58, 1 - mileage / 230000)
  return Math.round(32000 * conditionMultiplier * mileageMultiplier)
}

function buildInventoryReply(text, cars) {
  const lower = text.toLowerCase()
  const budget = parseBudget(lower)
  const wantsElectric = lower.includes("electric") || lower.includes("ev")
  const wantsHybrid = lower.includes("hybrid")
  const wantsSuv = lower.includes("suv")
  const mentionedMake = cars.find((car) => lower.includes(String(car.make).toLowerCase()))?.make

  let matches = cars

  if (budget) matches = matches.filter((car) => car.price <= budget)
  if (wantsElectric) matches = matches.filter((car) => String(car.fuel).toLowerCase() === "electric")
  if (wantsHybrid) matches = matches.filter((car) => String(car.fuel).toLowerCase() === "hybrid")
  if (mentionedMake) matches = matches.filter((car) => car.make === mentionedMake)
  if (wantsSuv) {
    matches = matches.filter((car) =>
      ["suv", "gle", "cayenne", "x5", "range", "lx", "gx"].some((term) =>
        `${car.make} ${car.model}`.toLowerCase().includes(term)
      )
    )
  }

  matches = matches.sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 3)

  if (!matches.length) {
    return {
      text: "I did not find an exact match in the current collection. I would loosen one filter first: budget, fuel type, or body style. The closest premium options are available on the inventory page.",
      actions: [{ label: "Open inventory", href: "/inventory" }],
    }
  }

  return {
    text: `I found ${matches.length} strong match${matches.length > 1 ? "es" : ""}:\n\n${matches
      .map((car, index) => `${index + 1}. ${car.year} ${car.make} ${car.model} - ${formatCurrency(car.price)} - ${car.mileage ? `${car.mileage.toLocaleString()} mi` : "delivery mileage"}`)
      .join("\n")}\n\nWould you like me to estimate payments or help arrange a private viewing?`,
    actions: [
      { label: "Estimate payment", prompt: "Estimate payment for this car" },
      { label: "Book viewing", prompt: "I want to book a private viewing" },
      { label: "Open inventory", href: "/inventory" },
    ],
  }
}

function buildFinanceReply(text) {
  const price = parseBudget(text) || extractNumberBefore(text, ["car", "vehicle", "price"], 100000)
  const downPayment = extractNumberBefore(text, ["down", "down payment"], 20000)
  const tradeValue = extractNumberBefore(text, ["trade", "trade in", "trade-in"], 0)
  const payment = estimateMonthlyPayment({ price, downPayment, tradeValue })

  return {
    text: `A planning estimate for ${formatCurrency(price)} with ${formatCurrency(downPayment)} down${tradeValue ? ` and ${formatCurrency(tradeValue)} trade credit` : ""} is about ${formatCurrency(payment)}/month over 72 months at 6.4% APR.\n\nFor premium buyers, I would compare 60 and 72 month terms before choosing the vehicle.`,
    actions: [
      { label: "Browse cars in range", href: `/inventory?max_price=${price}` },
      { label: "Book finance consult", prompt: "I want to book a private viewing" },
    ],
  }
}

function buildTradeReply(text) {
  const mileage = extractNumberBefore(text, ["miles", "mi", "mileage"], 42000)
  const condition = text.toLowerCase().includes("excellent")
    ? "excellent"
    : text.toLowerCase().includes("fair")
      ? "fair"
      : "good"
  const offer = estimateTradeValue({ mileage, condition })

  return {
    text: `Based on ${mileage.toLocaleString()} miles and ${condition} condition, I would pencil the trade estimate around ${formatCurrency(offer)}.\n\nA final offer would depend on service history, accident record, tires, paintwork, and market demand.`,
    actions: [
      { label: "Use as down payment", prompt: `Estimate payment on a 100k car with ${offer} trade` },
      { label: "Request exact offer", prompt: "I want to book a private viewing" },
    ],
  }
}

function MessageBubble({ message, onAction }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[86%] rounded-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
          isUser
            ? "bg-[#C9A84C] text-black"
            : "border border-white/10 bg-white/[0.045] text-white/72"
        )}
      >
        {message.text}
        {!!message.actions?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              action.href ? (
                <a
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center rounded-sm border border-[#C9A84C]/30 px-3 py-1.5 text-xs text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-colors"
                >
                  {action.label}
                </a>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onAction(action.prompt)}
                  className="inline-flex items-center rounded-sm border border-[#C9A84C]/30 px-3 py-1.5 text-xs text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-colors"
                >
                  {action.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LeadForm({ onSubmit }) {
  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    time: "",
  })

  const update = (key, value) => setLead((current) => ({ ...current, [key]: value }))

  return (
    <div className="border border-[#C9A84C]/25 bg-[#C9A84C]/[0.055] rounded-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.6} />
        <p className="text-white text-sm font-semibold">Private viewing request</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {[
          ["name", "Name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["vehicle", "Vehicle of interest"],
          ["time", "Preferred time"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={lead[key]}
            onChange={(event) => update(key, event.target.value)}
            placeholder={label}
            className="w-full bg-black/25 border border-white/10 rounded-sm px-3 py-2.5 text-sm text-white placeholder-white/28 outline-none focus:border-[#C9A84C]/70 transition-colors"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(lead)}
        className="mt-3 w-full bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold rounded-sm px-4 py-2.5 text-sm transition-colors"
      >
        Prepare request
      </button>
    </div>
  )
}

export default function ConciergeChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [cars, setCars] = useState(FALLBACK_CARS)
  const [isThinking, setIsThinking] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Good evening. I can help compare vehicles, estimate payments, value a trade, or arrange a private viewing.",
      actions: SUGGESTIONS.map((item) => ({ label: item.label, prompt: item.value })),
    },
  ])
  const scrollRef = useRef(null)

  useEffect(() => {
    let active = true

    getCars()
      .then((data) => {
        const apiCars = normalizeList(data).map(normalizeCar)
        if (active && apiCars.length) setCars(apiCars)
      })
      .catch(() => {
        if (active) setCars(FALLBACK_CARS)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, showLeadForm])

  const inventoryCount = useMemo(() => cars.length, [cars])

  const respond = (text) => {
    const lower = text.toLowerCase()
    const trimmed = lower.trim()

    if (["hi", "hello", "hey", "how are you?", "hi how are you?", "how are you"].includes(trimmed)) {
      return {
        text: "I am doing well, thank you. I can help you compare vehicles, estimate payments, value a trade, or arrange a private viewing.",
        actions: SUGGESTIONS.map((item) => ({ label: item.label, prompt: item.value })),
      }
    }

    if (lower.includes("book") || lower.includes("appointment") || lower.includes("viewing") || lower.includes("visit")) {
      setShowLeadForm(true)
      return {
        text: "Absolutely. Share a few details and I will prepare a private viewing request for the showroom team.",
      }
    }

    if (lower.includes("finance") || lower.includes("payment") || lower.includes("emi") || lower.includes("monthly") || lower.includes("apr")) {
      return buildFinanceReply(text)
    }

    if (lower.includes("trade") || lower.includes("offer") || lower.includes("value my") || lower.includes("sell")) {
      return buildTradeReply(text)
    }

    return buildInventoryReply(text, cars)
  }

  const sendMessage = async (value = input) => {
    const text = value.trim()
    if (!text || isThinking) return

    setInput("")
    const userMessage = { id: Date.now(), role: "user", text }
    const history = [...messages, userMessage]
    setMessages((current) => [...current, userMessage])
    setIsThinking(true)

    try {
      const data = await sendConciergeMessage({
        message: text,
        history: history.map((item) => ({ role: item.role, text: item.text })),
      })
      const lower = text.toLowerCase()
      if (lower.includes("book") || lower.includes("appointment") || lower.includes("viewing") || lower.includes("visit")) {
        setShowLeadForm(true)
      }
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply || respond(text).text,
          actions: data.actions || (data.provider === "ollama" ? undefined : respond(text).actions),
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", ...respond(text) },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const submitLead = (lead) => {
    setShowLeadForm(false)
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "assistant",
        text: `I prepared the request for ${lead.name || "you"}${lead.vehicle ? ` regarding ${lead.vehicle}` : ""}. The next backend step is saving this as a lead and sending it to the selected dealership.\n\nFor now, you can send this through the contact page.`,
        actions: [{ label: "Open contact", href: "/contact" }],
      },
    ])
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {open && (
        <section className="mb-4 w-[calc(100vw-2.5rem)] max-w-[350px] overflow-hidden rounded-2xl border border-[#4a4a4a] bg-[#2f3032] shadow-2xl">
          <div className="border-b border-white/10 bg-[#353638] px-4 py-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.7} />
                  <p className="text-[11px] uppercase tracking-[0.22em]">AutoLux concierge</p>
                </div>
                <p className="mt-1.5 text-xs text-white/45">{inventoryCount} vehicles available</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-[#C9A84C]/50 transition-colors"
                aria-label="Close concierge"
              >
                <X className="w-4 h-4" strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="h-[340px] overflow-y-auto px-4 py-3.5 space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onAction={sendMessage} />
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-sm border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/55">
                  Concierge is thinking...
                </div>
              </div>
            )}
            {showLeadForm && <LeadForm onSubmit={submitLead} />}
          </div>

          <div className="border-t border-white/10 bg-[#353638] p-3">
            <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => sendMessage(item.value)}
                  className="shrink-0 rounded-full border border-white/10 bg-[#2b2c2e] px-3 py-1.5 text-[11px] text-white/55 hover:text-white hover:border-[#C9A84C]/40 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage()
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-[#292a2c] px-3 py-2.5 focus-within:border-[#C9A84C]/70 transition-colors">
                <Search className="w-4 h-4 text-white/25" strokeWidth={1.6} />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isThinking}
                  placeholder="Ask about cars, finance, trade..."
                  className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isThinking}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C] text-black hover:bg-[#D4B86A] transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" strokeWidth={1.9} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex h-13 items-center gap-3 rounded-full border border-[#C9A84C]/35 bg-[#303133] px-4 py-3 text-white shadow-2xl hover:border-[#C9A84C]/70 transition-colors"
      >
        {open ? (
          <X className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.7} />
        ) : (
          <MessageCircle className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.7} />
        )}
        <span className="text-sm font-semibold">Concierge</span>
        <Calculator className="w-4 h-4 text-white/30" strokeWidth={1.5} />
      </button>
    </div>
  )
}
