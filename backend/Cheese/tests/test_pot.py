from decimal import Decimal

from django.test import TestCase
from django.contrib.auth import get_user_model


from pot.models import Currency


class PotTestCase(TestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(username="samad", email="qwerty", password="qwerty")
        user.is_superuser=True
        user.is_staff=True
        user.save()
        
        return super().setUp()
    
    def test_default_currencies_created(self):
        """Default currencies gets created with new User saved"""
        user = get_user_model().objects.get(username="samad")
        usd = Currency.objects.get_or_create(
            user=user,
            code="USD",
            defaults={
                "code": "USD",
                "symbol":"$",
                "rate":1
            }
        )
        self.assertFalse(usd[1])
    
    def test_currency_conversion(self):
        """currency can be converted from one amount to another"""
        usd = Currency.objects.get(code="USD")
        gbp = Currency.objects.get(code="GBP")
        eur = Currency.objects.get(code="EUR")

        # similar currency, one to dollar, one from dollar, one to another no dollar
        similar_currency = Currency.convert(amount=100, from_currency=gbp, to_currency=gbp)   
        gbp_to_dollar = Currency.convert(amount=100, from_currency=gbp, to_currency=usd)
        dollar_to_eur = Currency.convert(amount=100, from_currency=usd, to_currency=eur)
        eur_to_gbp = Currency.convert(amount=100, from_currency=eur, to_currency=gbp)

        self.assertEquals(similar_currency, 100)
        self.assertEquals(gbp_to_dollar, Decimal(str(136.99)))
        self.assertEquals(dollar_to_eur, Decimal(str(88)))
        self.assertEquals(eur_to_gbp, Decimal(str(82.95)))

