from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import build_concierge_reply


class ConciergeChatView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        message = request.data.get("message", "")
        history = request.data.get("history", [])

        if not message.strip():
            return Response({"reply": "Tell me what you are looking for and I will help."}, status=400)

        reply = build_concierge_reply(message=message, history=history)
        return Response(reply)

