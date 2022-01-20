from datetime import date, datetime, timedelta

from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from core.helpers import date_to_string, string_to_date
from pot.models import Pot, Currency
from transaction.models import Transaction, Outflow, Inflow, Record


class RecordTest(APITestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        url = reverse('account:signin')
        data = {'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        response = self.client.post(url, data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        
        today = date.today()
        yesterday = datetime.now() - timedelta(days=1)
        two_days_ago = datetime.now() - timedelta(days=2)
        three_days_ago = datetime.now() - timedelta(days=3)

        pot = Pot.objects.create(
            user=user,
            name="Pot1",
            currency=Currency.objects.get(user=user, code="USD"),
            amount=100.00)

        transaction0 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_treated=False,
            start_date=three_days_ago.date()
        )
        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=20,
            pot=pot,
            is_treated=False,
            start_date=two_days_ago.date()
        )
        transaction2 = Outflow.objects.create(
            user=user,
            title="Test",
            amount=30,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )
        transaction3 = Outflow.objects.create(
            user=user,
            title="Test",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=today
        )
        
        Transaction.treat_list([transaction3, transaction2, transaction0, transaction1])
 
        return super().setUp()

    def test_records_list_all(self):
        """All Records can be fetched without query params"""
        url = reverse('transaction:record-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_records_list_filter(self):
        """Records can be filtered by date and transaction kind"""
        url = reverse('transaction:record-list')
        two_days_ago = datetime.now() - timedelta(days=2)
        today = date.today()
        
        query_data = {"from": date_to_string(two_days_ago.date()),
                        "to": date_to_string(today),
                        "kind": Transaction.Kind.INFLOW }
        response = self.client.get(url, query_data)

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 1)
 
    def test_get_records_object(self):
        """A single record object can be gotten by it's id"""
        url = reverse('transaction:record-detail', kwargs={'pk': 1})
        response = self.client.get(url)
        expected_record_new_amount = Record.objects.get(id=1).new_amount

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(float(response.data['new_amount']), float(expected_record_new_amount))

    
    def test_record_summary_range(self):
        """Records can be gotten in summary containing in,out,net pay datepoint given a time and granularity"""
        url = reverse('transaction:record-transaction-range')
        three_days_ago = datetime.now() - timedelta(days=3)
        range_data = {"from": date_to_string(three_days_ago.date()), "granularity":"day"}
        response = self.client.get(url, range_data)

        expected_net_on_first_day = 10

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(expected_net_on_first_day, response.data['summaries'][0]['net'])
