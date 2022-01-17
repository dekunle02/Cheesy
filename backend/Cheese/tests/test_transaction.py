from datetime import date, datetime, timedelta

from dateutil.relativedelta import relativedelta

from django.test import TestCase
from django.contrib.auth import get_user_model

from pot.models import Pot, Currency
from transaction.models import Transaction, Inflow, Outflow, Transfer, Record


class TransactionTestCase(TestCase):

    def setUp(self):
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

        currency2 = Currency.objects.create(
            user=user,
            code="GBP",
            symbol="£",
            rate=0.70
        )

        pot1 = Pot.objects.create(
            user=user,
            name="SamplePot1",
            currency=currency1,
            amount=100.00
        )
        pot2 = Pot.objects.create(
            user=user,
            name="SamplePot2",
            currency=currency1,
            amount=200.00
        )

    def test_transaction_created_with_proper_kind(self):
        """Transactions of appropriate kind are created"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        Outflow.objects.create(
            user=user,
            title="test",
            amount=10.50,
            pot=pot,
        )
        test_transaction = Transaction.objects.get(title="test")
        self.assertEquals(test_transaction.kind, Transaction.Kind.OUTFLOW)

    def test_transfer_creates_inflow_outflow(self):
        """Transfers create neccessary inflows and outflows"""
        user = get_user_model().objects.get(username='samad')
        pot1 = Pot.objects.get(name="SamplePot1")
        pot2 = Pot.objects.get(name="SamplePot2")

        test_transfer = Transfer.objects.create(
            user=user,
            title="sampleTransfer",
            from_pot=pot1,
            to_pot=pot2,
            amount=10.50,
            is_recurring=False
        )
        test_inflow = Inflow.objects.get_or_create(title="sampleTransfer", defaults={
                                                   'user': user, 'amount': 10.50, 'pot': pot1})
        test_outflow = Outflow.objects.get_or_create(title="sampleTransfer", defaults={
                                                     'user': user, 'amount': 10.50, 'pot': pot1})

        self.assertFalse(test_inflow[1])
        self.assertFalse(test_outflow[1])


class TreatmentTestCase(TestCase):
    def setUp(self) -> None:
        UserModel = get_user_model()
        user = UserModel.objects.create_user(
            username="samad", email="qwerty", password="qwerty")
        user.is_superuser = True
        user.is_staff = True
        user.save()

        Pot.objects.create(
            user=user,
            name="SamplePot1",
            currency=Currency.objects.get(code="USD"),
            amount=100.00
        )
        Pot.objects.create(
            user=user,
            name="SamplePot2",
            currency=Currency.objects.get(code="EUR"),
            amount=200.00
        )
        return super().setUp()

    def test_one_off_transaction_already_treated(self):
        """Skips a one-off transaction if it was already treated"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        inflow = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=True,
            start_date=date.today()
        )
        inflow.treat()
        record = Record.objects.get_or_create(
            user=user,
            transaction=inflow,
            pot=pot,
            date=date.today(),
            defaults={'old_amount': 100, 'new_amount': 200}
        )

        self.assertEquals(pot.amount, 100.00)
        self.assertTrue(record[1])

    def test_one_off_transaction_still_in_future(self):
        """Skips a one-off transaction if it's not yet time for it's processing"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        tomorrow = datetime.now() + timedelta(days=1)
        inflow = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=tomorrow.date()
        )
        inflow.treat()
        record = Record.objects.get_or_create(
            user=user,
            transaction=inflow,
            pot=pot,
            date=date.today(),
            defaults={'old_amount': 100, 'new_amount': 200}
        )

        self.assertEquals(pot.amount, 100.00)
        self.assertTrue(record[1])

    def test_one_off_due_for_treatment(self):
        """treats a one-off transaction that is meant to be treated"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        yesterday = datetime.now() - timedelta(days=1)
        inflow = Inflow.objects.create(
            user=user,
            title="Test",
            amount=100,
            pot=pot,
            is_treated=False,
            start_date=yesterday.date()
        )
        inflow.treat()
        record = Record.objects.get_or_create(
            user=user,
            transaction=inflow,
            pot=pot,
            date=yesterday.date(),
            defaults={'old_amount': 100, 'new_amount': 200}
        )
        self.assertTrue(inflow.is_treated)
        self.assertEquals(pot.amount, 200.00)
        self.assertFalse(record[1])

    """
    one off: has been processed already, still in future, should be processed and now in past
    when processed, generates a record
    
    recurring: has yet to reach start date,
    has reached start date and some are due,
    has a last process date and none is due
    has a last process date and some are due
    """

    def test_recurring_yet_to_reach_start_date(self):
        """Recurring transaction not processed if start date is not yet reached"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        tomorrow = datetime.now() + timedelta(days=1)
        outflow = Outflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_recurring=True,
            start_date=tomorrow.date(),
            period=Transaction.Period.DAY
        )
        outflow.treat()

        record = Record.objects.get_or_create(
            user=user,
            transaction=outflow,
            pot=pot,
            date=tomorrow.date(),
            defaults={'old_amount': 100, 'new_amount': 90}
        )
        self.assertEquals(pot.amount, 100.00)
        self.assertTrue(record[1])

    def test_recurring_reach_start_some_due(self):
        """Recurring transactions processed if has reached start date, but never processed"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        pot2 = Pot.objects.get(name="SamplePot2")
        two_days_ago = datetime.now() - timedelta(days=2)
        five_months_ago = datetime.now() - relativedelta(months=5)

        outflow = Outflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_recurring=True,
            start_date=two_days_ago.date(),
            period=Transaction.Period.DAY
        )
        outflow.treat()
        records = Record.objects.all().filter(transaction=outflow)

        inflow = Outflow.objects.create(
            user=user,
            title="Test2",
            amount=10,
            pot=pot2,
            is_recurring=True,
            start_date=five_months_ago.date(),
            period=Transaction.Period.MONTH,
            period_count=2,
        )

        inflow.treat()

        self.assertEquals(pot.amount, 70)
        self.assertEquals(len(records), 3)
        self.assertEquals(pot2.amount, 170)

    def test_recurring_has_last_treat_none_due(self):
        """Recurring transaction not treated, has none due from last treatment"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        five_months_ago = datetime.now() - relativedelta(months=5)
        two_days_ago = datetime.now() - timedelta(days=2)
        
        inflow = Outflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_recurring=True,
            start_date=five_months_ago.date(),
            treat_date=two_days_ago.date(),
            period=Transaction.Period.MONTH,
            period_count=2,
        )
        inflow.treat()

        self.assertEquals(pot.amount, 100)

    def test_recurring_has_last_treat_some_due(self):
        """Recurring transaction treated, has some due from last treatment"""
        user = get_user_model().objects.get(username="samad")
        pot = Pot.objects.get(name="SamplePot1")
        five_days_ago = datetime.now() - timedelta(days=5)

        inflow = Outflow.objects.create(
            user=user,
            title="Test",
            amount=10,
            pot=pot,
            is_recurring=True,
            treat_date=five_days_ago.date(),
            period=Transaction.Period.DAY,
            period_count=1,
        )
        inflow.treat()

        self.assertEquals(pot.amount, 50)
