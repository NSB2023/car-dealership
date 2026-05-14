from django.urls import path
from .views import ConciergeChatView

urlpatterns = [
    path("chat/", ConciergeChatView.as_view(), name="concierge-chat"),
]

