from django.urls import path, include

from rest_framework.routers import DefaultRouter

# local imports
from . import views, apps

app_name= apps.TransactionConfig.name

router = DefaultRouter()
router.register(r'records', views.RecordViewSet, basename="record")
router.register(r'transactions', views.TransactionViewSet, basename="transaction")
router.register(r'transfers', views.TransferViewSet, basename="transfer")

urlpatterns = [
    path('', include(router.urls))
]


