from decimal import Decimal
from datetime import date
from turtle import color

from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.constants import DEFAULT_POT_COLOR_CODE
from core.helpers import string_to_date
from transaction.models import Transaction,Inflow, Outflow, Record
from .models import Currency, Pot
from .serializers import CurrencySerializer, PotSerializer


class CurrencyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CurrencySerializer

    def get_queryset(self):
        user = self.request.user
        return Currency.objects.all().filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        currency = Currency(user=request.user, **serializer.data)
        currency.save()
        serializer = self.get_serializer(currency)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, *args, **kwargs):
        currency_object = Currency.objects.get(id=pk)
        serializer = self.get_serializer(
            currency_object, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(data=serializer.data, status=status.HTTP_202_ACCEPTED)


class PotViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PotSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Pot.objects.all().filter(user=user)
        return queryset

    @action(detail=False, methods=['get'], url_path="networth")
    def networth(self, request, *args, **kwargs):
        networth_list = Pot.get_networth_for_user(request.user)
        for networth_bundle in networth_list:
            serialized_currency = CurrencySerializer(networth_bundle['currency'], many=False).data
            networth_bundle['currency'] = serialized_currency
        return Response(data=networth_list, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path="networthrange")
    def networth_range(self, request, *args, **kwargs):
        from_date = request.GET.get('from')
        granularity = request.GET.get('granularity')

        try:
            from_date = string_to_date(from_date)
        except:
            return Response(data={"message": "Dates should be in ISO format. (yyyy-mm-dd)"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if granularity not in (Transaction.Period.DAY, Transaction.Period.MONTH, Transaction.Period.YEAR):
                raise Exception("Wrong Granularity")
        except:
           return Response(data={"message": "Granularity should be day, month, or year"}, status=status.HTTP_400_BAD_REQUEST)

        pots = self.get_queryset()
        all_pots_ranges = [Record.fetch_pot_total_from(pot, from_date, granularity) for pot in pots]

        amounts_super_list = [range_dictionary['amounts'] for range_dictionary in all_pots_ranges]
        zipped_list = list(zip(*amounts_super_list))
        amounts_list = [sum(tup) for tup in zipped_list]
        dates_list = all_pots_ranges[0]['dates']
        data = {"dates": dates_list,
                "amounts": amounts_list}
        return Response(data=data, status=status.HTTP_200_OK)
        

    
    @action(detail=True, methods=['get'], url_path="range")
    def record_range(self, request, pk=None, *args, **kwargs):
        from_date = request.GET.get('from')
        granularity = request.GET.get('granularity')

        try:
            from_date = string_to_date(from_date)
        except:
            return Response(data={"message": "Dates should be in ISO format. (yyyy-mm-dd)"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if granularity not in (Transaction.Period.DAY, Transaction.Period.MONTH, Transaction.Period.YEAR):
                raise Exception("Wrong Granularity")
        except:
           return Response(data={"message": "Granularity should be day, month, or year"}, status=status.HTTP_400_BAD_REQUEST)

        pot = Pot.objects.get(id=pk)
        data = Record.fetch_pot_total_from(pot, from_date, granularity)
        
        return Response(data=data, status=status.HTTP_200_OK)


    def create(self, request, *args, **kwargs):
        name: str = self.request.data["name"]
        amount: str = self.request.data["amount"]
        currency_id = self.request.data["currency"]
        
        try:
            color_code = self.request.data["color_code"]
        except:
            color_code = DEFAULT_POT_COLOR_CODE

        try:
            currency = Currency.objects.get(id=currency_id, user=request.user)
        except Exception:
            return Response(data={"message": "Error: Currency with id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if self.get_queryset().filter(name=name):
            return Response(data={"message": "Error: Pot already exists"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pot = Pot.objects.create(
                user=request.user,
                name=name, 
                amount=amount, 
                currency=currency,
                color_code = color_code
                )
        except:
            return Response(data={"message": "Error: Pot not created"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(pot)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, *args, **kwargs):
        pot: Pot = Pot.objects.get(id=pk)
        new_amount = request.POST.get('amount')

        if new_amount:
            try:
                new_amount = Decimal(new_amount)
            except:
                return Response(data={"message": "Error: Amount entered is not a number"}, status=status.HTTP_400_BAD_REQUEST)

        if new_amount and new_amount != pot.amount:
            if new_amount > pot.amount:
                Inflow.objects.create(
                    user = request.user,
                    title = "deposit",
                    amount=new_amount - pot.amount,
                    pot=pot,
                    is_recurring=False,
                    start_date = date.today()
                )
            else:
                Outflow.objects.create(
                    user = request.user,
                    title = "withdrawal",
                    amount = pot.amount - new_amount,
                    pot=pot,
                    is_recurring=False,
                    start_date=date.today()
                )
        return super().partial_update(request, *args, **kwargs)
