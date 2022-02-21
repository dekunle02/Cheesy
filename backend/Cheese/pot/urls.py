from django.urls import path, include

from rest_framework.routers import DefaultRouter

# local imports
from . import views, apps

app_name= apps.PotConfig.name

router = DefaultRouter()
router.register(r'pots', views.PotViewSet, basename="pot")
router.register(r'currencies', views.CurrencyViewSet, basename="currency")

urlpatterns = [
    path('', include(router.urls))
]

