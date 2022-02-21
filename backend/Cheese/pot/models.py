from decimal import Decimal
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from django.db.models.query import QuerySet
from core.constants import DEFAULT_POT_COLOR_CODE
from account.models import User


class Currency(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=3, blank=False, unique=False)
    symbol = models.CharField(max_length=1, blank=False, unique=False)
    rate = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self) -> str:
        return f"Currency:{self.code} user:{self.user.username} "

    """
    @desc This function converts an amount from one currency to another.
    @param {Decimal} amount- The amount to process.
    @param {Currency} from_currency, to_currency - The currency to process.
    @returns {float} Returns the resulting converted currency.
    """
    @staticmethod
    def convert(amount, from_currency, to_currency):
        if (from_currency.id == to_currency.id):
            return amount
        amount_in_dollars = Decimal(amount) / Decimal(from_currency.rate)
        return amount_in_dollars * to_currency.rate

    @staticmethod
    def convert_list(amount_list, from_currency, to_currency):
        return [Currency.convert(amount, from_currency, to_currency) for amount in amount_list]


class Pot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, unique=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    records = models.ManyToManyField(
        "transaction.Record", related_name="pot_records", blank=True)
    color_code = models.CharField(max_length=8, default=DEFAULT_POT_COLOR_CODE, unique=False)

    def __str__(self):
        return f"Pot:{self.name} amount:{self.amount} user:{self.user.username} "

    """
    @param {user} User- The user to process.
    @returns {List<dict>} Returns a list of the sum of amounts in all the pots in different currencies
    @example User(id=1) -> [{currency1: networth}, {currency2: networth}]
    """
    @staticmethod
    def get_networth_for_user(user: User) -> list:
        pots: QuerySet = Pot.objects.all().filter(user=user)
        currencies: QuerySet = Currency.objects.all().filter(user=user)
        networth: list = []
        first_currency: Currency = currencies[0]
        amounts: list = [Currency.convert(pot.amount, pot.currency, first_currency) for pot in pots]
        total_amount: Decimal = sum(amounts)
        for currency in currencies:
            amount_in_currency: Decimal = Currency.convert(
                total_amount, first_currency, currency)
            networth.append(
                {
                    'currency': currency,
                    'amount': amount_in_currency
                }
            )
        return networth
    

"""
    @descr This function uses SIGNALS to create default currencies when a new user object is saved
"""
@receiver(post_save, sender=User)
def create_default_currencies(sender, instance, created, **kwargs) -> None:
    if created:
        Currency.objects.create(
            user=instance,
            code="USD",
            symbol="$",
            rate=1
        )
        Currency.objects.create(
            user=instance,
            code="GBP",
            symbol="£",
            rate=0.73
        )
        Currency.objects.create(
            user=instance,
            code="EUR",
            symbol="€",
            rate=0.88
        )
