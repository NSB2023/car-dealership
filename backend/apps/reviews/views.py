from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("car", "dealership")
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        car_id = self.request.query_params.get("car")
        dealership_id = self.request.query_params.get("dealership")
        if car_id:
            qs = qs.filter(car_id=car_id)
        if dealership_id:
            qs = qs.filter(dealership_id=dealership_id)
        return qs
