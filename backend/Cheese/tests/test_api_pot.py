from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from pot.models import Pot, Currency
"""
currencies = list, get, update, delete
pot = list, get, update, delete
networth = 'amount to currency'

"""

class CurrenciesTest(APITestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        url = reverse('account:signin')
        data = {'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        response = self.client.post(url, data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        
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

    def test_get_currency_list(self):
        """Currencies can be fetched appropriately"""
        url = reverse('pot:currency-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_get_currency_object(self):
        """A single currency can be gotten with it's id"""
        url = reverse('pot:currency-detail', kwargs={'pk': 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'USD')
        
    def test_update_currency_object(self):
        """Currency can be updated by the user"""
        url = reverse('pot:currency-detail', kwargs={'pk': 1})
        response = self.client.patch(url, {'code': 'NGN'})
        currency = Currency.objects.get(id=1, symbol="$")
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(currency.code, 'NGN')

    def test_delete_currency_object(self):
        """Currency can be deleted by user"""
        url = reverse('pot:currency-detail', kwargs={'pk':1})
        response = self.client.delete(url)
        currencies = Currency.objects.all()

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(currencies), 2)

    
    def test_list_pots(self):
        """Pots are listed"""
        url = reverse('pot:pot-list') 
        response = self.client.get(url)
        self.assertEqual(len(response.data), len(Pot.objects.all()))
    
    def test_pot_networth(self):
        """Networth is properly calulated and returned"""
        url = reverse('pot:pot-networth')
        response = self.client.get(url)

        pot1 = Pot.objects.get(name="Pot1")
        pot2 = Pot.objects.get(name="Pot2")
 
        expected_usd_total = pot1.amount + Currency.convert(pot2.amount, pot2.currency, pot1.currency )
        self.assertEqual(response.data[0]['amount'], expected_usd_total)

         