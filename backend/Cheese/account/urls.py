from django.urls import path, include
from django.shortcuts import render
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView

from . import views, apps

app_name= apps.AccountConfig.name

urlpatterns = [
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('signup/', views.SignUpView.as_view(), name='signup'),
    path('signin/', views.SignInView.as_view(), name='signin'),
    path('protected/', views.ProtectedView.as_view(), name='protected')
]
