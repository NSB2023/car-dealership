from django.db import models


class Car(models.Model):
    FUEL_CHOICES = [
        ("gasoline", "Gasoline"),
        ("diesel", "Diesel"),
        ("hybrid", "Hybrid"),
        ("electric", "Electric"),
    ]
    TRANSMISSION_CHOICES = [
        ("automatic", "Automatic"),
        ("manual", "Manual"),
        ("single_speed", "Single-speed"),
    ]
    CONDITION_CHOICES = [
        ("new", "New"),
        ("certified", "Certified Pre-Owned"),
        ("used", "Used"),
    ]

    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.PositiveIntegerField(default=0)
    fuel = models.CharField(max_length=20, choices=FUEL_CHOICES, default="gasoline")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default="automatic")
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default="new")
    color = models.CharField(max_length=50, blank=True)
    vin = models.CharField(max_length=17, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    dealership = models.ForeignKey(
        "dealerships.Dealership",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"


class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="cars/")
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Image for {self.car}"
