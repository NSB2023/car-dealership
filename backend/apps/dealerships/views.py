from rest_framework import viewsets
from .models import Dealership
from .serializers import DealershipSerializer


class DealershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dealership.objects.filter(is_active=True)
    serializer_class = DealershipSerializer
