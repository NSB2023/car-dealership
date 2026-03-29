from django.urls import path
from .views import MeView, SavedCarsView

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
    path("saved/<int:car_id>/", SavedCarsView.as_view(), name="user-saved-car"),
]
