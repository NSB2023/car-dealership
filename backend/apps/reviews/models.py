from django.db import models


class Review(models.Model):
    car = models.ForeignKey(
        "inventory.Car",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    dealership = models.ForeignKey(
        "dealerships.Dealership",
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )
    firebase_uid = models.CharField(max_length=128)
    reviewer_name = models.CharField(max_length=100)
    rating = models.PositiveSmallIntegerField()  # 1–5
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reviewer_name} — {self.rating}★ on {self.car}"
