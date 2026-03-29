from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Car
from .serializers import CarListSerializer, CarDetailSerializer
from .filters import CarFilter


class CarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Car.objects.filter(is_available=True).prefetch_related("images")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ["make", "model", "year", "color", "description"]
    ordering_fields = ["price", "year", "mileage", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CarDetailSerializer
        return CarListSerializer

    @action(detail=False, methods=["get"])
    def featured(self, request):
        featured = self.get_queryset().filter(is_featured=True)[:6]
        serializer = CarListSerializer(featured, many=True, context={"request": request})
        return Response(serializer.data)
