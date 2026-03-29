from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "id", "car", "dealership", "firebase_uid",
            "reviewer_name", "rating", "title", "body", "created_at",
        ]
        read_only_fields = ["firebase_uid", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "firebase_user"):
            validated_data["firebase_uid"] = request.firebase_user["uid"]
        return super().create(validated_data)
