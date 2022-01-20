from rest_framework.serializers import ModelSerializer

from .models import Record

class RecordSerializer(ModelSerializer):
    class Meta:
        model = Record
        fields = ['id', 'user', 'transaction', 'old_amount', 'new_amount', 'date']
