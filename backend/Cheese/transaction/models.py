from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
from collections import deque

from django.db import models
from django.utils.translation import gettext_lazy as _

from account.models import User
from pot.models import Pot
# Create your models here.

class Transaction(models.Model):

    class Kind(models.TextChoices):
        INFLOW = "inflow"  
        OUTFLOW = "outflow" 
    
    class Period(models.TextChoices):
        DAY = 'day'
        WEEK = 'week'
        MONTH = 'month'
        YEAR = 'year'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, unique=False)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pot = models.ForeignKey(Pot, on_delete=models.CASCADE, null=False, blank=False)
    
    kind = models.CharField(_('Kind'), max_length=8, choices=Kind.choices, null=False)
    base_kind = Kind.INFLOW

    is_recurring = models.BooleanField(default=False) 
    is_treated = models.BooleanField(default=False)
    is_transfer = models.BooleanField(default=False)
    
    start_date = models.DateField(default=date.today)
    treat_date = models.DateField(blank=True, null=True)

    period = models.CharField(_('Period'), max_length=8, choices=Period.choices, null=True, blank=True)
    period_count = models.IntegerField(null=True, blank=True, default=1)

    def __str__(self) -> str:
        return ("transaction:{self.title} amount:{self.amount} pot:{self.pot.id}")
    
    def save(self, *args, **kwargs):
        self.kind = self.base_kind
        super().save(*args, **kwargs)

    def treat(self):
        if self.is_recurring:
            self.treat_recurring()
        else:
            self.treat_one_off()
    
    def treat_one_off(self):
        if self.is_treated:
            return
        
        today = date.today()
        
        if today < self.start_date:
            return
        else:
            old_amount = self.pot.amount
            if self.kind == self.Kind.INFLOW:
                new_amount = old_amount + self.amount
            else:
                new_amount = old_amount - self.amount
            # update pot
            self.pot.amount = new_amount
            record = Record.objects.create(
                user = self.user,
                pot = self.pot,
                transaction = self,
                old_amount = old_amount,
                new_amount = new_amount,
                date = self.start_date
            )
            self.pot.records.add(record)
            self.pot.save()
            
            # update self
            self.is_treated = True
            self.save()     

    def treat_recurring(self):
        today = datetime.today().date()
        if not self.treat_date and self.start_date > today:
            return        
        if self.treat_date == today:
            return
        outstanding_dates = self.get_recurring_dates()
        if len(outstanding_dates) == 0:
            return

        for date in outstanding_dates:
            old_amount = self.pot.amount
            if self.kind == self.Kind.INFLOW:
                new_amount = old_amount + self.amount
            else:
                new_amount = old_amount - self.amount
            
            # update pot
            self.pot.amount = new_amount
            record = Record.objects.create(
                user = self.user,
                pot = self.pot,
                transaction = self,
                old_amount = old_amount,
                new_amount = new_amount,
                date = date
            )
            self.pot.records.add(record)
            self.pot.save()

        # update self
        self.treat_date = today
        self.save()
        
    def get_recurring_dates(self):
        dates = []
        today = date.today()
        time_increment = self.get_time_increment()
        last_treat_date = self.treat_date if self.treat_date else self.start_date - time_increment
        
        while last_treat_date < today:
            last_treat_date += time_increment
            dates.append(last_treat_date)
        return list(filter(lambda date: date <= today, dates))

    def get_time_increment(self):
        if self.period == self.Period.DAY:
            return relativedelta(days=self.period_count)
        elif self.period == self.Period.WEEK:
            return relativedelta(weeks=self.period_count)
        elif self.period == self.Period.MONTH:
            return relativedelta(months=self.period_count)
        elif self.period == self.Period.YEAR:
            return relativedelta(years=self.period_count)
    

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

    @staticmethod
    def fetch_pot_total_from(pot, from_date, granularity):
        today = date.today()
        records_deck = deque()
        dates =[]
        amounts =[]

        if granularity == Transaction.Period.DAY:
            while from_date <= today:
                records = pot.records.all().filter(date=from_date)
                records_deck.append(list(records))
                dates.append(from_date)
                from_date += relativedelta(days=1)
            amounts = Record.get_amount_list_from_records_deck(records_deck, pot.amount)
        
        elif granularity == Transaction.Period.MONTH:
            pass
        elif granularity == Transaction.Period.YEAR:
            pass
                    
        return {"dates": dates, "amounts": amounts}
        
    @staticmethod
    def get_amount_list_from_records_deck(deck, last_amount):
        """Given the most recent amount, it gets all the ending pot amounts in the deck containing record lists"""
        amount_list = []
        while len(deck) > 0:
            amount_list.append(float(last_amount))
            current_list = deck[-1]
            last_amount = Record.get_oldest_amount_from_list(current_list, last_amount)
            deck.pop()
        del amount_list[-1]
        amount_list.reverse()
        return amount_list

    @staticmethod
    def get_oldest_amount_from_list(records, new_amount):
        """Given the most recent amount in a record, this function recursively finds the oldest amount"""
        if len(records) == 0:
            return new_amount

        elif len(records) == 1:
            return records[0].old_amount
        
        else:
            for index, record in enumerate(records):
                if record.new_amount == new_amount:
                    del records[index]
                    return Record.get_oldest_amount_from_list(records, record.old_amount)


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
 