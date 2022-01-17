from django.test import TestCase
from django.contrib.auth import get_user_model

from pot.models import Pot, Currency
from transaction.models import Transaction, Inflow, Outflow, Transfer

class TransactionTestCase(TestCase):
    
    def setUp(self):
        UserModel = get_user_model()
        user = UserModel.objects.create_user(username="samad", email="qwerty", password="qwerty")
        user.is_superuser=True
        user.is_staff=True
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
        
        Outflow.objects.create(
            user=user,
            title="test",
            amount=10.50,
            pot=pot1,
        )

    def test_transaction_created_with_proper_kind(self):
        """Transactions of appropriate kind are created"""
        test_transaction = Transaction.objects.get(title="test")
        self.assertEquals(test_transaction.kind, Transaction.Kind.OUTFLOW)
        
    def test_transfer_creates_inflow_outflow(self):
        """Transfers create neccessary inflows and outflows"""
        user = get_user_model().objects.get(username='samad')
        pot1 = Pot.objects.get(name="SamplePot1")
        pot2 = Pot.objects.get(name="SamplePot2")
        

        test_transfer = Transfer.objects.create(
            user = user,
            title = "sampleTransfer",
            from_pot = pot1,
            to_pot = pot2,
            amount=10.50,
            is_recurring=False
        )
        test_inflow = Inflow.objects.get_or_create(title="sampleTransfer", defaults={'user': user, 'amount':10.50, 'pot':pot1})
        test_outflow = Outflow.objects.get_or_create(title="sampleTransfer", defaults={'user': user, 'amount':10.50, 'pot':pot1})

        self.assertFalse(test_inflow[1])
        self.assertFalse(test_outflow[1])