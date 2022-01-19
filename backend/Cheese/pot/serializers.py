from rest_framework.serializers import ModelSerializer

from .models import Pot, Currency

class CurrencySerializer(ModelSerializer):
    class Meta:
        model = Currency
        fields = ['code', 'symbol', 'rate']

class PotSerializer(ModelSerializer):
    class Meta:
        model = Pot
        fields = ['name', 'currency', 'amount', 'color_code']