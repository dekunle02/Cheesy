from rest_framework.serializers import ModelSerializer

from .models import Record, Transaction, Transfer


class RecordSerializer(ModelSerializer):
    class Meta:
        model = Record
        fields = ['id', 'user', 'transaction',
                  'old_amount', 'new_amount', 'date']
        depth = 3


class TransactionSerializer(ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'title', 'amount', 'pot', 'kind', 'is_recurring',
                  'is_transfer', 'start_date', 'treat_date', 'period', 'period_count']

class TransferSerializer(ModelSerializer):
    class Meta:
        model = Transfer
        fields= ['id', 'title', 'from_pot', 'to_pot', 'amount', 'is_recurring', 'start_date']
