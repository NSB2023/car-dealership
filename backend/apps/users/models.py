from django.db import models


class UserProfile(models.Model):
    """
    Stores extra info for Firebase-authenticated users.
    firebase_uid links to the Firebase Auth user.
    """
    firebase_uid = models.CharField(max_length=128, unique=True)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    saved_cars = models.ManyToManyField("inventory.Car", blank=True, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.display_name or self.email}"
