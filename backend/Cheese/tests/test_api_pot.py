from datetime import date, datetime, timedelta

from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from core.helpers import date_to_string
from pot.models import Pot, Currency
from transaction.models import Transaction, Outflow, Inflow


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

    def test_create_currency_object(self):
        """Currency object can be created"""
        url = reverse('pot:currency-list')
        currency_data = {'code': "NGN", 'symbol': "₦", "rate": "500"}
        response = self.client.post(url, currency_data)
        currency = Currency.objects.all().last()

        self.assertEquals(currency.code, 'NGN')
        self.assertEquals(currency.symbol, '₦')
        self.assertEquals(currency.rate, 500)

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

  
class PotTest(APITestCase):
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

    def test_create_pot(self):
        """New Pot object can be created"""
        url = reverse('pot:pot-list')
        pot_data = {"name": "Monzo", "currency": 2, "amount": 200}
        self.client.post(url, pot_data)
        pot = Pot.objects.all().last()

        self.assertEquals(pot.name, 'Monzo')
        self.assertEquals(pot.currency, Currency.objects.get(code="GBP"))
        self.assertEquals(pot.amount, 200)

    def test_list_pots(self):
        """Pots are listed"""
        url = reverse('pot:pot-list') 
        response = self.client.get(url)
        self.assertEqual(len(response.data), len(Pot.objects.all()))
    
    def test_get_pot_object(self):
        """Fetches a single pot by its id"""
        url = reverse('pot:pot-detail', kwargs={'pk': 1})
        response = self.client.get(url)
        pot = Pot.objects.get(id=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(pot.name, 'Pot1')
    
    def test_update_pot_object(self):
        """Pot object can be updated, amount updates creates relevant transaction objects"""
        url = reverse('pot:pot-detail', kwargs={'pk': 1})
        response = self.client.patch(url, {'name': 'Monzo', 'amount': 20, 'color_code': 3, 'currency':2})
        pot = Pot.objects.get(id=1)
        outflow = Outflow.objects.get_or_create(pot=pot, amount=80)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(pot.name, 'Monzo')
        self.assertEqual(pot.color_code, 3)
        self.assertEqual(pot.currency, Currency.objects.get(id=2))
        self.assertFalse(outflow[1])
    
    def test_delete_pot_object(self):
        """Pot objects can be deleted"""
        url = reverse('pot:pot-detail', kwargs={'pk':1})
        self.client.delete(url)
        self.assertEqual(len(Pot.objects.all()), 1)
    
    def test_pot_networth(self):
        """Networth is properly calulated and returned"""
        url = reverse('pot:pot-networth')
        response = self.client.get(url)

        pot1 = Pot.objects.get(name="Pot1")
        pot2 = Pot.objects.get(name="Pot2")
 
        expected_usd_total = pot1.amount + Currency.convert(pot2.amount, pot2.currency, pot1.currency )
        self.assertEqual(response.data[0]['amount'], expected_usd_total)

    def test_pot_balance_range(self):
        """Pot returns a range of amounts given a from and to date with granularity"""
        UserModel = get_user_model()
        user = UserModel.objects.get(username='admin')
        pot = Pot.objects.get(name="Pot1")
        five_days_ago = (datetime.now() - timedelta(days=5)).date()
        yesterday = (datetime.now() - timedelta(days=1)).date()
        last_week = (datetime.now() - timedelta(days=7))

        transaction0 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_treated=False,
            start_date=five_days_ago
        )

        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday
        )

        transaction2 = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=50,
            pot=pot,
            is_treated=False,
            start_date=yesterday
        )

        transaction3 = Inflow.objects.create(
            user=user,
            title="Test3",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=yesterday
        )
        Transaction.treat_list([transaction1, transaction0, transaction3, transaction2])

        url = reverse('pot:pot-record-range', kwargs={'pk': 1})
        range_data = {
            "from": date_to_string(last_week.date()),
            "granularity": Transaction.Period.DAY
        }
        response = self.client.get(url, data=range_data)

        expected_list_amounts = [100, 100, 110, 110, 110, 110, 200, 200]
        expected_list_dates = []
        while last_week <= datetime.now():
            expected_list_dates.append(last_week.day)
            last_week += timedelta(days=1)
        
        self.assertEquals(expected_list_amounts, response.data['amounts'])
        self.assertEquals(expected_list_dates, response.data['dates'])
         
    def test_networth_range(self):
        """Networth range can be gotten as pot balance range is also retreived"""
        UserModel = get_user_model()
        user = UserModel.objects.get(username='admin')
        pot = Pot.objects.get(name="Pot1")
        five_days_ago = (datetime.now() - timedelta(days=5)).date()
        yesterday = (datetime.now() - timedelta(days=1)).date()
        last_week = (datetime.now() - timedelta(days=7))

        transaction0 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_treated=False,
            start_date=five_days_ago
        )

        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday
        )

        transaction2 = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=50,
            pot=pot,
            is_treated=False,
            start_date=yesterday
        )

        transaction3 = Inflow.objects.create(
            user=user,
            title="Test3",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=yesterday
        )
        Transaction.treat_list([transaction1, transaction0, transaction3, transaction2])

        url = reverse('pot:pot-networth-range')
        range_data = {
            "from": date_to_string(last_week.date()),
            "granularity": Transaction.Period.DAY
        }
        response = self.client.get(url, data=range_data)

        expected_list_amounts = [300, 300, 310, 310, 310, 310, 400, 400]
        expected_list_dates = []
        while last_week <= datetime.now():
            expected_list_dates.append(last_week.day)
            last_week += timedelta(days=1)

        self.assertEquals(expected_list_amounts, response.data['amounts'])
        self.assertEquals(expected_list_dates, response.data['dates'])
