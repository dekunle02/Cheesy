from django.db import models

from account.models import User

# Create your models here.

class Currency(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=3, blank=False, unique=False)
    symbol = models.CharField(max_length=1, blank=False, unique=False)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    
    def __str__(self) -> str:
        return f"user:{self.user.username} currency:{self.code}"


class Pot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, unique=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    records = models.ManyToManyField("transaction.Record", related_name="pot_records")
    colorCode = models.IntegerField(default=1)

    def __str__(self):
        return f"user:{self.user.username} pot:{self.name} amount:{self.amount}"