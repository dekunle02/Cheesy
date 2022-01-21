from decimal import Decimal
from datetime import datetime, timedelta

from django.test import TestCase
from django.contrib.auth import get_user_model


from pot.models import Currency, Pot
from transaction.models import Transaction, Record, Inflow, Outflow


class PotTestCase(TestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(
            username="samad", email="qwerty", password="qwerty")
        user.is_superuser = True
        user.is_staff = True
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
                "symbol": "$",
                "rate": 1
            }
        )
        self.assertFalse(usd[1])

    def test_currency_conversion(self):
        """currency can be converted from one amount to another"""
        usd = Currency.objects.get(code="USD")
        gbp = Currency.objects.get(code="GBP")
        eur = Currency.objects.get(code="EUR")

        # similar currency, one to dollar, one from dollar, one to another no dollar
        similar_currency = Currency.convert(
            amount=100, from_currency=gbp, to_currency=gbp)
        gbp_to_dollar = Currency.convert(
            amount=100, from_currency=gbp, to_currency=usd)
        dollar_to_eur = Currency.convert(
            amount=100, from_currency=usd, to_currency=eur)
        eur_to_gbp = Currency.convert(
            amount=100, from_currency=eur, to_currency=gbp)

        self.assertEquals(similar_currency, 100)
        self.assertEquals(gbp_to_dollar, Decimal(str(136.99)))
        self.assertEquals(dollar_to_eur, Decimal(str(88)))
        self.assertEquals(eur_to_gbp, Decimal(str(82.95)))


class RecordTestCase(TestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(
            username="samad", email="qwerty", password="qwerty")
        user.is_superuser = True
        user.is_staff = True
        user.save()

        currency1 = Currency.objects.create(
            user=user,
            code="USD",
            symbol="$",
            rate=1.00
        )

        pot1 = Pot.objects.create(
            user=user,
            name="SamplePot1",
            currency=currency1,
            amount=100.00
        )

        return super().setUp()

    def test_record_gets_pot_amount_before_after_all_records_for_day(self):
        """Can get the amount in a pot before and after all records of the day have run"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        yesterday = datetime.now() - timedelta(days=1)

        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction2 = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=50,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction3 = Inflow.objects.create(
            user=user,
            title="Test3",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction1.treat()
        transaction2.treat()
        transaction3.treat()

        expected_amount = 100
        records = list(pot.records.all())

        recursive_result = Record.get_oldest_amount_from_list(
            records, pot.amount)

        self.assertEquals(recursive_result, expected_amount)

        pass

    def test_pot_gets_total_records_summaries_day(self):
        """Pot can be return pot amounts from particular dates for days"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        five_days_ago = datetime.now() - timedelta(days=5)
        yesterday = datetime.now() - timedelta(days=1)
        last_week = datetime.now() - timedelta(days=7)

        transaction0 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_treated=False,
            start_date=five_days_ago.date()
        )

        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction2 = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=50,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction3 = Inflow.objects.create(
            user=user,
            title="Test3",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )
        Transaction.treat_list(
            [transaction1, transaction0, transaction3, transaction2])

        result = Record.fetch_pot_total_from(
            pot, last_week.date(), Transaction.Period.DAY)
        expected_list_amounts = [100, 100, 110, 110, 110, 110, 200, 200]

        self.assertEquals(result['amounts'], expected_list_amounts)

    def test_pot_gets_total_records_summaries_month(self):
        """Pot can be return pot amounts from particular dates for months"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        five_months_ago = datetime.now() - timedelta(days=5*30)
        yesterday = datetime.now() - timedelta(days=1)
        last_month = datetime.now() - timedelta(days=30)

        transaction0 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_treated=False,
            start_date=five_months_ago.date()
        )

        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction2 = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=50,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction3 = Inflow.objects.create(
            user=user,
            title="Test3",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=last_month.date()
        )
        Transaction.treat_list([transaction0, transaction1, transaction2, transaction3])
        result = Record.fetch_pot_total_from(pot, five_months_ago.date(), Transaction.Period.MONTH)
        expected_list_amounts = [110, 110, 110, 110, 150, 200]

        self.assertEquals(result['amounts'], expected_list_amounts)
    
    def test_pot_gets_total_records_summaries_year(self):
        """Pot can be return pot amounts from particular dates for years"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        one_year_ago = datetime.now() - timedelta(days=5*30)
        yesterday = datetime.now() - timedelta(days=1)
        two_years_ago = datetime.now() - timedelta(days=2*365)

        transaction0 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_treated=False,
            start_date=two_years_ago.date()
        )

        transaction1 = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction2 = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=50,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )

        transaction3 = Inflow.objects.create(
            user=user,
            title="Test3",
            amount=40,
            pot=pot,
            is_treated=False,
            start_date=one_year_ago.date()
        )
        Transaction.treat_list([transaction0, transaction1, transaction2, transaction3])
        result = Record.fetch_pot_total_from(pot, two_years_ago, Transaction.Period.YEAR)
        expected_list_amounts = [110, 150, 200]

        self.assertEquals(result['amounts'], expected_list_amounts)



