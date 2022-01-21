from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save

from core.constants import DEFAULT_POT_COLOR_CODE
from account.models import User
# Create your models here.


class Currency(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=3, blank=False, unique=False)
    symbol = models.CharField(max_length=1, blank=False, unique=False)
    rate = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self) -> str:
        return f"user:{self.user.username} currency:{self.code}"

    @staticmethod
    def convert(amount, from_currency, to_currency):
        if (from_currency.id == to_currency.id):
            return amount
        amount_in_dollars = amount / from_currency.rate
        return round(amount_in_dollars * to_currency.rate, 2)


class Pot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, unique=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    records = models.ManyToManyField(
        "transaction.Record", related_name="pot_records")
    color_code = models.IntegerField(default=DEFAULT_POT_COLOR_CODE)

    def __str__(self):
        return f"user:{self.user.username} pot:{self.name} amount:{self.amount}"

    @staticmethod
    def get_networth_for_user(user):
        pots = Pot.objects.all().filter(user=user)
        currencies = Currency.objects.all().filter(user=user)
        networth = []
        first_currency = currencies[0]
        amounts = [Currency.convert(pot.amount, pot.currency, first_currency) for pot in pots]
        total_amount = sum(amounts)
        for currency in currencies:
            amount_in_currency = Currency.convert(
                total_amount, first_currency, currency)
            networth.append(
                {
                    'currency': currency,
                    'amount': amount_in_currency
                }
            )
        return networth
    

# SIGNALS to create default currencies
@receiver(post_save, sender=User)
def create_default_currencies(sender, instance, created, **kwargs):
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
