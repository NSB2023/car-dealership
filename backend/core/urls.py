from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # API routes
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/dealerships/", include("apps.dealerships.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/users/", include("apps.users.urls")),
    path("api/concierge/", include("apps.concierge.urls")),
    # API docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
