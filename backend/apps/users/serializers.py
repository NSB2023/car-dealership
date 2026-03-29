from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "id", "firebase_uid", "email",
            "display_name", "phone", "saved_cars", "created_at",
        ]
        read_only_fields = ["firebase_uid", "email", "created_at"]
