from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from pot.models import Pot, Currency
"""
currencies = list, get, update, delete
pot = list, get, update, delete
"""

class CurrenciesTest(APITestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        currency1 = Currency.objects.get(user=user, code="USD")
        Pot.objects.create(
            user=user,
            name="Pot1",
            currency=currency1,
            amount=100.00
        )
        currency2 = Currency.objects.get(user=user, code="GBP")
        Pot.objects.create(
            user=user,
            name="Pot2",
            currency=currency2,
            amount=200.00
        )
        return super().setUp()