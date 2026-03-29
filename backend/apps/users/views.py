from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserProfile
from .serializers import UserProfileSerializer


class MeView(APIView):
    """Get or create the profile for the currently authenticated Firebase user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        firebase_user = request.firebase_user
        profile, _ = UserProfile.objects.get_or_create(
            firebase_uid=firebase_user["uid"],
            defaults={
                "email": firebase_user.get("email", ""),
                "display_name": firebase_user.get("name", ""),
            },
        )
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        firebase_user = request.firebase_user
        profile = UserProfile.objects.get(firebase_uid=firebase_user["uid"])
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SavedCarsView(APIView):
    """Toggle a car in the user's saved list."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, car_id):
        firebase_user = request.firebase_user
        profile, _ = UserProfile.objects.get_or_create(firebase_uid=firebase_user["uid"])
        if profile.saved_cars.filter(id=car_id).exists():
            profile.saved_cars.remove(car_id)
            return Response({"saved": False})
        profile.saved_cars.add(car_id)
        return Response({"saved": True})
