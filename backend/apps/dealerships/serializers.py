from rest_framework import serializers
from .models import Dealership


class DealershipSerializer(serializers.ModelSerializer):
    inventory_count = serializers.SerializerMethodField()

    class Meta:
        model = Dealership
        fields = "__all__"

    def get_inventory_count(self, obj):
        return obj.inventory.filter(is_available=True).count()
