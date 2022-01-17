from datetime import date

from django.db import models
from django.utils.translation import gettext_lazy as _


from core.constants import Period

from account.models import User
from pot.models import Pot
# Create your models here.

class Transaction(models.Model):

    class Kind(models.TextChoices):
        INFLOW = "inflow"  
        OUTFLOW = "outflow" 

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, unique=False)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pot = models.ForeignKey(Pot, on_delete=models.CASCADE, null=False, blank=False)
    kind = models.CharField(_('Kind'), max_length=8, choices=Kind.choices, null=False)
    base_kind = Kind.INFLOW

    is_recurring = models.BooleanField(default=False) 
    is_processed = models.BooleanField(default=False)
    is_transfer = models.BooleanField(default=False)
    
    start_date = models.DateField(default=date.today)
    treat_date = models.DateField(blank=True, null=True)

    def __str__(self) -> str:
        return ("transaction:{self.title} amount:{self.amount} pot:{self.pot.id}")
    
    def save(self, *args, **kwargs):
        self.kind = self.base_kind
        super().save(*args, **kwargs)


class InflowManager(models.Manager):
    def get_queryset(self, *args, **kwargs): 
        return super().get_queryset(*args, **kwargs).filter(kind=Transaction.Kind.INFLOW) 

class Inflow(Transaction):
    objects = InflowManager()
    base_kind = Transaction.Kind.INFLOW

    class Meta:
        proxy = True

class OutflowManager(models.Manager):
    def get_queryset(self, *args, **kwargs): 
        return super().get_queryset(*args, **kwargs).filter(kind=Transaction.Kind.OUTFLOW) 

class Outflow(Transaction):
    objects = OutflowManager()
    base_kind = Transaction.Kind.OUTFLOW

    class Meta:
        proxy = True


class Record(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pot = models.ForeignKey(Pot, on_delete=models.CASCADE)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    old_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    new_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    date = models.DateField(blank=False, null=False)

    def __str__(self):
        return f"user:{self.user.username} pot:{self.pot.id} transaction:{self.transaction.id} old:{self.old_amount} new:{self.new_amount} date:{self.date}"



class Transfer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, unique=False)
    from_pot = models.ForeignKey(Pot, on_delete=models.CASCADE, related_name="transfer_from_pot")
    to_pot = models.ForeignKey(Pot, on_delete=models.CASCADE, related_name="transfer_to_pot")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    is_recurring = models.BooleanField(default=False)
    start_date = models.DateField(default=date.today)

    def __str__(self):
        return f"user:{self.user.username} from:{self.from_pot} to:{self.to_pot} amount:{self.amount}"
    
    def save(self, *args, **kwargs):
        Inflow.objects.create(
            user=self.user,
            title=self.title,
            amount=self.amount,
            pot=self.to_pot,
            is_recurring=self.is_recurring,
            start_date=self.start_date
        )
        Outflow.objects.create(
            user=self.user,
            title=self.title,
            amount=self.amount,
            pot=self.from_pot,
            is_recurring=self.is_recurring,
            start_date=self.start_date
        )
        super().save(*args, **kwargs)
 