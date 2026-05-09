import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import os


class FirebaseUser:
    """Small user-like wrapper so DRF permissions treat Firebase users as authenticated."""

    is_authenticated = True

    def __init__(self, token):
        self.token = token
        self.uid = token["uid"]
        self.email = token.get("email", "")
        self.display_name = token.get("name", "")

    def __str__(self):
        return self.email or self.uid


# Initialize Firebase Admin SDK once
if not firebase_admin._apps:
    cred_path = settings.FIREBASE_CREDENTIALS
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)


class FirebaseAuthentication(BaseAuthentication):
    """
    Validates Firebase ID tokens sent in the Authorization: Bearer <token> header.
    Sets request.user to a FirebaseUser and request.firebase_user to the decoded token.
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None

        id_token = auth_header.split("Bearer ")[1].strip()
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
        except Exception:
            raise AuthenticationFailed("Invalid or expired Firebase token.")

        # Attach decoded token to request for use in views
        request.firebase_user = decoded_token

        return (FirebaseUser(decoded_token), decoded_token)
