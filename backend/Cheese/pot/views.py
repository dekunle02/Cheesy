from decimal import Decimal
from datetime import date

from django.db.models import QuerySet

from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.constants import DEFAULT_POT_COLOR_CODE
from core.helpers import string_to_date
from account.models import User
from transaction.models import Transaction,Inflow, Outflow, Record
from .models import Currency, Pot
from .serializers import CurrencySerializer, PotSerializer


class CurrencyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CurrencySerializer

    def get_queryset(self) -> QuerySet:
        user: User = self.request.user
        return Currency.objects.all().filter(user=user)

    def create(self, request, *args, **kwargs) -> Response:
        serializer: CurrencySerializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        currency: Currency = Currency.objects.create(user=request.user, **serializer.validated_data)
        serializer: CurrencySerializer = self.get_serializer(currency, many=False)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, *args, **kwargs) -> Response:
        currency_object: Currency = Currency.objects.get(id=pk)
        serializer: CurrencySerializer = self.get_serializer(
            currency_object, data=request.data, partial=True)
        try: 
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(data=serializer.data, status=status.HTTP_202_ACCEPTED)
        except:
          return Response(data={"message": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)  


class PotViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PotSerializer

    def get_queryset(self) -> QuerySet:
        user: User = self.request.user
        queryset: QuerySet = Pot.objects.all().filter(user=user)
        return queryset

    def list(self, request, *args, **kwargs):
        pots = self.get_queryset()        
        currency_id = request.GET.get("currency")
        if currency_id:
            try:
                currency = Currency.objects.get(id=currency_id)
                for pot in pots:
                    pot.amount = Currency.convert(pot.amount, pot.currency, currency)
            except:
                pass
        serializer = self.get_serializer(pots, many=True)
        return Response(serializer.data)

    """
    @desc View Function that returns a list of networths for the user.
    @returns {Response} Returns an array that contains dictionaries of currencies and equivalent amounts.
    @example returns [{currency: Currency(), amount: Digit}]
    """
    @action(detail=False, methods=['get'], url_path="networth")
    def networth(self, request, *args, **kwargs) -> Response:
        networth_list: QuerySet = Pot.get_networth_for_user(request.user)
        for networth_bundle in networth_list:
            serialized_currency: CurrencySerializer= CurrencySerializer(networth_bundle['currency'], many=False).data
            networth_bundle['currency'] = serialized_currency
        return Response(data=networth_list, status=status.HTTP_200_OK)

    
    """
    @desc View Function that returns a list of networths for the user from a given date to the present day.
    @params (from_date) Date - the date to start data fetching from
    @params (granularity) String - day/month/year used to describe time quanta to fetch 
    @returns {Response} Returns an array that contains dates quata against networth at that point in time, for all currencies.
    @example returns [{currency: Currency(), ranges:{dates: [], amounts: []}}]
    """
    @action(detail=False, methods=['get'], url_path="networthrange")
    def networth_range(self, request, *args, **kwargs) -> Response:
        from_date: str = request.GET.get('from')
        granularity: str = request.GET.get('granularity')

        try:
            from_date: date = string_to_date(from_date)
        except:
            return Response(data={"message": "Dates should be in ISO format. (yyyy-mm-dd)"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if granularity not in (Transaction.Period.DAY, Transaction.Period.MONTH, Transaction.Period.YEAR):
                raise Exception("Wrong Granularity")
        except:
           return Response(data={"message": "Granularity should be day, month, or year"}, status=status.HTTP_400_BAD_REQUEST)

        pots: QuerySet = self.get_queryset()
        networth_range_list: list = []
        for currency in Currency.objects.all().filter(user=self.request.user):
            all_pots_ranges: list = []
            for pot in pots: # cycles through each pot and gets it's own range of {dates, amounts} with amounts converted to the index currency
                range_dict_for_pot: dict = Record.fetch_pot_total_from(pot, from_date, granularity)
                range_dict_for_pot['amounts'] = Currency.convert_list(range_dict_for_pot['amounts'], pot.currency, currency)
                all_pots_ranges.append(range_dict_for_pot)
            amounts_super_list: list = [range_dictionary['amounts'] for range_dictionary in all_pots_ranges]
            zipped_list: list = list(zip(*amounts_super_list))
            amounts_list = [sum([Decimal(item) for item in tup]) for tup in zipped_list] # LOLOLOL Not a very readable line but efficient....
            dates_list = all_pots_ranges[0]['dates']
            currency_ranges = {
                "dates": dates_list,
                "amounts": amounts_list
                }
            networth_range_list.append(
                {
                    "currency": CurrencySerializer(currency, many=False).data, 
                    "ranges": currency_ranges
                }
                )
        return Response(data=networth_range_list, status=status.HTTP_200_OK)
    
    """
    @desc View Function that returns a list of balance for a pot from a given date to the present day.
    @params (from_date) Date - the date to start data fetching from.
    @params (granularity) String - day/month/year used to describe time quanta to fetch.
    @returns {Response} Returns an array that contains dates quata against balance at that point in time.
    @example returns {dates: [], amounts: []}
    """
    @action(detail=True, methods=['get'], url_path="range")
    def record_range(self, request, pk=None, *args, **kwargs) -> Response:
        from_date: str = request.GET.get('from')
        granularity: str = request.GET.get('granularity')

        try:
            from_date: date = string_to_date(from_date)
        except:
            return Response(data={"message": "Dates should be in ISO format. (yyyy-mm-dd)"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if granularity not in (Transaction.Period.DAY, Transaction.Period.MONTH, Transaction.Period.YEAR):
                raise Exception("Wrong Granularity")
        except:
           return Response(data={"message": "Granularity should be day, month, or year"}, status=status.HTTP_400_BAD_REQUEST)

        data = Record.fetch_pot_total_from(Pot.objects.get(id=pk), from_date, granularity)
        return Response(data=data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs) -> Response:
        name: str = self.request.data["name"]
        amount: str = self.request.data["amount"]
        currency_id = self.request.data["currency"]
        
        try:
            color_code: str = self.request.data["color_code"]
        except:
            color_code: str = DEFAULT_POT_COLOR_CODE

        try:
            currency: Currency = Currency.objects.get(id=currency_id, user=request.user)
        except Exception:
            return Response(data={"message": "Error: Currency with id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if self.get_queryset().filter(name=name):
            return Response(data={"message": "Error: Pot already exists"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pot: Pot = Pot.objects.create(
                user=request.user,
                name=name, 
                amount=amount, 
                currency=currency,
                color_code=color_code
                )
        except:
            return Response(data={"message": "Error: Pot not created"}, status=status.HTTP_400_BAD_REQUEST)
        serializer: PotSerializer = self.get_serializer(pot)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, *args, **kwargs) -> Response:
        pot: Pot = Pot.objects.get(id=pk)
        new_amount = request.POST.get('amount')

        if new_amount:
            try:
                new_amount: Decimal = Decimal(new_amount)
            except:
                return Response(data={"message": "Error: Amount entered is not a number"}, status=status.HTTP_400_BAD_REQUEST)

        if new_amount and new_amount != pot.amount:
            if new_amount > pot.amount:
                trans = Inflow.objects.create(
                    user = request.user,
                    title = "deposit",
                    amount=new_amount - pot.amount,
                    pot=pot,
                    is_recurring=False,
                    start_date = date.today()
                )
            else:
                trans = Outflow.objects.create(
                    user = request.user,
                    title = "withdrawal",
                    amount = pot.amount - new_amount,
                    pot=pot,
                    is_recurring=False,
                    start_date=date.today()
                )
                trans.treat()
        return super().partial_update(request, *args, **kwargs)
