from datetime import date, datetime, timedelta

from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

from core.helpers import date_to_string, string_to_date
from pot.models import Pot, Currency
from transaction.models import Transaction, Transfer, Outflow, Inflow, Record


class RecordAPITestCase(APITestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(
            username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        url = reverse('account:signin')
        data = {'email': 'admin@admin.com', 'password': '2@tW&AYhLXW7'}
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

        Transaction.treat_list(
            [transaction3, transaction2, transaction0, transaction1])

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
                      "kind": Transaction.Kind.INFLOW}
        response = self.client.get(url, query_data)

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 1)

    def test_get_records_object(self):
        """A single record object can be gotten by it's id"""
        url = reverse('transaction:record-detail', kwargs={'pk': 1})
        response = self.client.get(url)
        expected_record_new_amount = Record.objects.get(id=1).new_amount

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(float(response.data['new_amount']), float(
            expected_record_new_amount))

    def test_record_summary_range(self):
        """Records can be gotten in summary containing in,out,net pay datepoint given a time and granularity"""
        url = reverse('transaction:record-transaction-range')
        three_days_ago = datetime.now() - timedelta(days=3)
        range_data = {"from": date_to_string(
            three_days_ago.date()), "granularity": "day"}
        response = self.client.get(url, range_data)

        expected_net_on_first_day = 10

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(expected_net_on_first_day,
                          response.data['summaries'][0]['net'])


class TransactionAPITest(APITestCase):

    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(
            username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        url = reverse('account:signin')
        data = {'email': 'admin@admin.com', 'password': '2@tW&AYhLXW7'}
        response = self.client.post(url, data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)

        Pot.objects.create(
            user=user,
            name="Pot1",
            currency=Currency.objects.get(id=1),
            amount=100.00
        )
        Pot.objects.create(
            user=user,
            name="Pot2",
            currency=Currency.objects.get(id=2),
            amount=100.00
        )

        return super().setUp()

    def test_transaction_create(self):
        """Transactions of either type can be created"""
        today = date.today()
        create_data = {
            "title": 'Sample',
            "amount": 50,
            "pot": 1,
            "kind": "outflow",
            "is_recurring": 'true',
            "is_transfer": 'true',
            "start_date": date_to_string(today),
            "period": "day",
            "period_count": 2
        }
        create_url = reverse('transaction:transaction-list')
        self.client.post(create_url, create_data)

        transactions = Transaction.objects.all()
        self.assertNotEquals(len(transactions), 0)

        transaction = transactions[0]

        self.assertEquals(transaction.title, 'Sample')
        self.assertEquals(transaction.pot, Pot.objects.get(id=1))
        self.assertTrue(transaction.is_recurring)
        self.assertTrue(transaction.is_transfer)
        self.assertEquals(transaction.kind, Transaction.Kind.OUTFLOW)
        self.assertEquals(transaction.period_count, 2)
        self.assertEquals(transaction.start_date, today)

    def test_transaction_item_read(self):
        """Transaction item gotten with id"""
        Transaction.objects.create(
            user=get_user_model().objects.get(id=1),
            title='Sample',
            amount=50,
            pot=Pot.objects.get(id=1),
            kind=Transaction.Kind.INFLOW,
            is_recurring=True,
            is_transfer=True,
            start_date=date_to_string(date.today()),
            period="day",
            period_count=2
        )
        url = reverse('transaction:transaction-detail', kwargs={'pk': 1})
        response = self.client.get(url)

        self.assertEquals(response.data['title'], 'Sample')
        self.assertEquals(float(response.data['amount']), float(50))
        self.assertEquals(response.data['is_recurring'], True)

    def test_transaction_list_read(self):
        """List of transactions can be read"""
        Transaction.objects.create(
            user=get_user_model().objects.get(id=1),
            title='Sample',
            amount=50,
            pot=Pot.objects.get(id=1),
            kind=Transaction.Kind.INFLOW,
            is_recurring=True,
            is_transfer=True,
            start_date=date_to_string(date.today()),
            period="day",
            period_count=2
        )
        url = reverse('transaction:transaction-list')
        response = self.client.get(url)

        self.assertEquals(response.data[0]['title'], 'Sample')

    def test_transaction_update(self):
        """Transaction can be edited and saved"""
        Transaction.objects.create(
            user=get_user_model().objects.get(id=1),
            title='Sample',
            amount=50,
            pot=Pot.objects.get(id=1),
            kind=Transaction.Kind.INFLOW,
            is_recurring=True,
            is_transfer=True,
            start_date=date_to_string(date.today()),
            period="day",
            period_count=2
        )
        update_data = {
            "title": 'Sample2',
            "amount": 500,
            "pot": 2,
            "kind": "outflow",
            "is_recurring": 'false',
            "is_transfer": 'false',
            "start_date": date_to_string((datetime.now() - timedelta(days=1)).date()),
            "period": "week",
            "period_count": 1
        }

        url = reverse('transaction:transaction-detail', kwargs={'pk': 1})
        self.client.patch(url, update_data)
        transaction = Transaction.objects.get(id=1)

        self.assertEquals(transaction.title, 'Sample2')
        self.assertEquals(transaction.pot, Pot.objects.get(id=2))
        self.assertEquals(transaction.kind, Transaction.Kind.OUTFLOW)
        self.assertFalse(transaction.is_recurring)
        self.assertEquals(transaction.period, Transaction.Period.WEEK)

    def test_transaction_delete(self):
        """Transactions are marked as deleted upon deletion"""
        Transaction.objects.create(
            user=get_user_model().objects.get(id=1),
            title='Sample',
            amount=50,
            pot=Pot.objects.get(id=1),
            kind=Transaction.Kind.INFLOW,
            is_recurring=True,
            is_transfer=True,
            start_date=date_to_string(date.today()),
            period="day",
            period_count=2
        )
        url = reverse('transaction:transaction-detail', kwargs={'pk': 1})
        self.client.delete(url)

        transaction = Transaction.objects.get(id=1)
        transaction.treat()

        self.assertTrue(transaction.is_deleted)
        self.assertEquals(Pot.objects.get(id=1).amount, 100)

    def test_transaction_records(self):
        """Records from Transaction gotten within from_date to present"""
        one_week_ago = datetime.now() - timedelta(days=7)
        transaction = Transaction.objects.create(
            user=get_user_model().objects.get(id=1),
            title='Sample',
            amount=50,
            pot=Pot.objects.get(id=1),
            kind=Transaction.Kind.INFLOW,
            is_recurring=True,
            is_transfer=False,
            start_date=one_week_ago.date(),
            period="day",
            period_count=1
        )
        transaction.treat()

        url = reverse(
            'transaction:transaction-completed-records', kwargs={'pk': 1})
        record_data = {"from": date_to_string(one_week_ago)}
        response = self.client.get(url, record_data)
        records = response.data

        self.assertEquals(len(records), 8)

    def test_transfer_create(self):
        """Transfer object created"""
        transfer_data = {
            "title": "Test",
            "from_pot": 1,
            "to_pot": 2,
            "amount": 10,
            "is_recurring" : "false",
            "start_date" : date_to_string(date.today())
            }
        transfer_url = reverse('transaction:transfer-list')
        self.client.post(transfer_url, transfer_data)

        self.assertEquals(Transfer.objects.get(id=1).title, "Test")
        self.assertEquals(len(Transaction.objects.all()), 2)

    def test_transfer_list(self):
        """Transfer object List fetched"""
        Transfer.objects.create(
            user=get_user_model().objects.get(id=1),
            title="test",
            from_pot=Pot.objects.get(id=1),
            to_pot=Pot.objects.get(id=2),
            amount=100,
            is_recurring=True,
            start_date=date.today()
        )
        Transfer.objects.create(
            user=get_user_model().objects.get(id=1),
            title="test2",
            from_pot=Pot.objects.get(id=2),
            to_pot=Pot.objects.get(id=1),
            amount=100,
            is_recurring=False,
            start_date=date.today()
        )

        url = reverse('transaction:transfer-list')
        response = self.client.get(url)

        self.assertEquals(len(response.data), 2)
