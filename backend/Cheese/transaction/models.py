from datetime import date, datetime
from decimal import Decimal
from dateutil.relativedelta import relativedelta
from collections import deque

from django.db import models
from django.db.models import QuerySet
from django.utils.translation import gettext_lazy as _

from account.models import User
from pot.models import Pot, Currency


class Transaction(models.Model):

    class Kind(models.TextChoices):
        """Established the 2 fundamental types of Transactions"""
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
    pot = models.ForeignKey(
        Pot, on_delete=models.CASCADE, null=False, blank=False)

    kind = models.CharField(_('Kind'), max_length=8,
                            choices=Kind.choices, null=False)
    base_kind = Kind.INFLOW

    is_recurring = models.BooleanField(default=False)
    is_treated = models.BooleanField(default=False)
    is_transfer = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    start_date = models.DateField(default=date.today)
    treat_date = models.DateField(blank=True, null=True)

    period = models.CharField(
        _('Period'), max_length=8, choices=Period.choices, null=True, blank=True)
    period_count = models.IntegerField(null=True, blank=True, default=1)

    def __str__(self) -> str:
        return ("transaction:{self.title} amount:{self.amount} pot:{self.pot.id}")

    def save(self, *args, **kwargs)->None:
        self.kind = self.kind if self.kind else self.base_kind
        super().save(*args, **kwargs)

    def get_treatment_records_from(self, from_date: date) -> QuerySet:
        """
            Returns a list of completed records of the transaction given a date till the present day
        """
        return Record.objects.all().filter(user=self.user, date__gte=from_date)

    """
    @desc Gets a summary of the effects of a list of transactions. Should be used on transactions of similar pot due to currency calculations
    @params (List) list of transactions
    @returns (dict) dictionary containing keys for all the inflows, outflows and net on the pot
    @example [transaction, transaction] -> {inflow: amount, outflow:amount, net:amount}
    """
    @staticmethod
    def get_transaction_summary_net_from_list(transaction_list: list) -> dict:
        inflow_list: list = [transaction for transaction in transaction_list if transaction.kind == Transaction.Kind.INFLOW]
        sum_inflow: Decimal = sum([transaction.amount for transaction in inflow_list])
        outflow_list: list = [transaction for transaction in transaction_list if transaction.kind == Transaction.Kind.OUTFLOW]
        sum_outflow: Decimal = sum([transaction.amount for transaction in outflow_list])
        
        return {'inflow': sum_inflow, 'outflow': sum_outflow, 'net': sum_inflow - sum_outflow}

    """
    @desc Treats a list of transactions sequentially in the order of the dates they should be treated
    """
    @staticmethod
    def treat_list(transactions_list: list) -> None:
        transactions_list.sort(
            key=lambda transaction: transaction.defacto_last_date, reverse=False)
        [transaction.treat() for transaction in transactions_list]

    """
    @desc Resolves the last_date a transaction was treated.
    """
    @property
    def defacto_last_date(self) -> date:
        if self.is_recurring:
            if self.treat_date:
                return self.treat_date
            else:
                return self.start_date
        else:
            return self.start_date

    """
    @desc Treat function allows for the transaction to be carried out on the Pot
    """
    def treat(self)-> None:
        if self.is_deleted: # Only transactions not marked as deleted can be treated
            return
        if self.is_recurring:
            self.treat_recurring()
        else:
            self.treat_one_off()


    def treat_one_off(self) -> None:
        if self.is_treated:
            return
        today: date = date.today()
        if today < self.start_date:
            return
        else:
            old_amount = self.pot.amount
            if self.kind == self.Kind.INFLOW:
                new_amount = old_amount + self.amount
            else:
                new_amount = old_amount - self.amount
            # update pot and create record
            self.pot.amount = new_amount
            record = Record.objects.create(
                user=self.user,
                pot=self.pot,
                transaction=self,
                old_amount=old_amount,
                new_amount=new_amount,
                date=self.start_date
            )
            self.pot.records.add(record)
            self.pot.save()

            # update self
            self.is_treated = True
            self.save()

    def treat_recurring(self) -> None:
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
                user=self.user,
                pot=self.pot,
                transaction=self,
                old_amount=old_amount,
                new_amount=new_amount,
                date=date
            )
            self.pot.records.add(record)
            self.pot.save()

        # update self
        self.treat_date = today
        self.save()

    """
    @desc Gets a list of days that a transaction can be treated from it's defactor last process date
    """
    def get_recurring_dates(self) -> list:
        dates = []
        today = date.today()
        time_increment = self.get_time_increment()
        last_treat_date = self.treat_date if self.treat_date else self.start_date - time_increment

        while last_treat_date < today:
            last_treat_date += time_increment
            dates.append(last_treat_date)
        
        return list(filter(lambda date: date <= today, dates))

    """
    @desc Gets the timedelta of increment using the period information of the transaction
    """
    def get_time_increment(self) -> relativedelta:
        if self.period == self.Period.DAY:
            return relativedelta(days=self.period_count)
        elif self.period == self.Period.WEEK:
            return relativedelta(weeks=self.period_count)
        elif self.period == self.Period.MONTH:
            return relativedelta(months=self.period_count)
        elif self.period == self.Period.YEAR:
            return relativedelta(years=self.period_count)


class InflowManager(models.Manager):
    def get_queryset(self, *args, **kwargs) -> QuerySet:
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
    old_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    new_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    date = models.DateField(blank=False, null=False)

    def __str__(self)-> str:
        return f"user:{self.user.username} pot:{self.pot.id} transaction:{self.transaction.id} old:{self.old_amount} new:{self.new_amount} date:{self.date}"

    """
    @desc Gets the amounts in a pot from a given date
    @param (Pot) pot the pot to fetch from
    @param (from_date) date
    @param (str) granularity
    @return (dict) {dates: [], amounts: []}
    """
    @staticmethod
    def fetch_pot_total_from(pot: Pot, from_date: date, granularity: str) -> dict:
        today: date = date.today()
        records_deck: deque = deque()
        dates = []
        amounts = []

        if granularity == Transaction.Period.DAY:
            while from_date <= today:
                records = pot.records.all().filter(date=from_date)
                records_deck.append(list(records))
                dates.append(from_date.day)
                from_date += relativedelta(days=1)
            amounts = Record.get_amount_list_from_records_deck(
                records_deck, pot.amount)

        elif granularity == Transaction.Period.MONTH:
            from_date = date(from_date.year, from_date.month, 1)
            today = date(today.year, today.month, 1)
            while from_date <= today:
                records = pot.records.all().filter(
                    date__month=from_date.month, date__year=from_date.year)
                records_deck.append(list(records))
                dates.append(from_date.month)
                from_date += relativedelta(months=1)
            amounts = Record.get_amount_list_from_records_deck(
                records_deck, pot.amount)
        
        elif granularity == Transaction.Period.YEAR:
            from_date = date(from_date.year, from_date.month, 1)
            today = date(today.year, today.month, 1)
            while from_date <= today:
                records = pot.records.all().filter(date__year=from_date.year)
                records_deck.append(list(records))
                dates.append(from_date.year)
                from_date += relativedelta(years=1)
            amounts = Record.get_amount_list_from_records_deck(
                records_deck, pot.amount)
        return {"dates": dates, "amounts": amounts}
    
    """
    @desc Given the latest amount in a decque where each element is itself a list of sequential records, 
                it gets a list of the pot's amounts at each index of the original list of decques
    """
    @staticmethod
    def get_amount_list_from_records_deck(deck: deque, last_amount: Decimal) -> list:
        amount_list = [float(last_amount)]
        while len(deck) > 1:
            current_list = deck[-1]
            last_amount = Record.get_oldest_amount_from_list(
                current_list, last_amount)
            amount_list.append(float(last_amount))
            deck.pop()
        amount_list.reverse()
        return amount_list

    """
    @desc Given the latest amount in collection of squential linked records, it recursively gets the oldest amount
    """
    @staticmethod
    def get_oldest_amount_from_list(records, new_amount) -> Decimal:
        if len(records) == 0:
            return new_amount
        elif len(records) == 1:
            return records[0].old_amount
        else:
            for index, record in enumerate(records):
                if record.new_amount == new_amount:
                    del records[index]
                    return Record.get_oldest_amount_from_list(records, record.old_amount)

    """
    @return {date: , record: in, out, net}
    """
    @staticmethod
    def fetch_record_total_from(user:User, from_date:date, granularity:str) -> dict: 
        records = Record.objects.all().filter(user=user)
        today = date.today()
        dates = []
        summaries = []
    
        if granularity == Transaction.Period.DAY:
            while from_date <= today:
                date_records = records.filter(date=from_date)
                date_transactions = [record.transaction for record in date_records]
                transactions_summary = Transaction.get_transaction_summary_net_from_list(date_transactions)
                dates.append(from_date)
                summaries.append(transactions_summary)
                from_date += relativedelta(days=1)
                        
        elif granularity == Transaction.Period.MONTH:
            from_date = date(from_date.year, from_date.month, 1)
            today = date(today.year, today.month, 1)
            while from_date <= today:
                date_records = records.filter(date__month=from_date.month,  date__year=from_date.year)
                date_transactions = [record.transaction for record in date_records]
                transactions_summary = Transaction.get_transaction_summary_net_from_list(date_transactions)
                dates.append(from_date.month)
                summaries.append(transactions_summary)
                from_date += relativedelta(months=1)
        elif granularity == Transaction.Period.YEAR:
            from_date = date(from_date.year, from_date.month, 1)
            today = date(today.year, today.month, 1)
            while from_date <= today:
                date_records = records.filter(date__year=from_date.year)
                date_transactions = [record.transaction for record in date_records]
                transactions_summary = Transaction.get_transaction_summary_net_from_list(date_transactions)
                dates.append(from_date.year)
                summaries.append(transactions_summary)
                from_date += relativedelta(years=1)
        return {"dates": dates, "summaries":summaries}
        

class Transfer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, unique=False)
    from_pot = models.ForeignKey(
        Pot, on_delete=models.CASCADE, related_name="transfer_from_pot")
    to_pot = models.ForeignKey(
        Pot, on_delete=models.CASCADE, related_name="transfer_to_pot")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_recurring = models.BooleanField(default=False)
    start_date = models.DateField(default=date.today)

    def __str__(self):
        return f"user:{self.user.username} from:{self.from_pot} to:{self.to_pot} amount:{self.amount}"

    def save(self, *args, **kwargs):
        """Converts from the currency of the from_pot into the equivalent currency of the to pot and creates Inflow/Ouflow"""
        amount_for_receiving_pot = Currency.convert(self.amount, self.from_pot.currency, self.to_pot.currency)
        Inflow.objects.create(
            user=self.user,
            title=self.title,
            amount=amount_for_receiving_pot,
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
