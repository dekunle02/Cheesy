from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

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
        pots = self.get_queryset()
        currencies = Currency.objects.all().filter(user=request.user)
        networth = []
        first_currency = currencies[0]
        amounts = [Currency.convert(pot.amount, pot.currency, first_currency) for pot in pots]
        total_amount = sum(amounts)
        for currency in currencies:
            amount_in_currency = Currency.convert(
                total_amount, first_currency, currency)
            networth.append(
                {
                    'currency': CurrencySerializer(currency, many=False).data,
                    'amount': amount_in_currency
                }
            )

        return Response(data=networth, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        title: str = request.POST.get("title")
        description: str = request.POST.get("description")
        amount: str = request.POST.get("amount")
        denomination = request.POST.get("denomination")

        try:
            denomination = Currency.objects.filter(
                user=request.user).get(code=denomination)
        except Exception:
            return Response(data={"message": "Error: Currency does not exist. Send the currency code in the request body. eg USD"}, status=status.HTTP_400_BAD_REQUEST)

        if (Pot.objects.all().filter(user=request.user).filter(title=title)):
            return Response(data={"message": "Error: Pot already exists"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pot = Pot.objects.create(title=title, description=description,
                                     amount=amount, denomination=denomination, user=request.user)
            pot.save()
        except:
            return Response(data={"message": "Error: Pot not created"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(pot)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None, *args, **kwargs):
        pot: Pot = Pot.objects.get(id=pk)
        old_amount = float(pot.amount)
        new_amount = request.POST.get('amount')
        if new_amount:
            try:
                new_amount = float(new_amount)
            except:
                return Response(data={"message": "Error: Amount entered is not a number"}, status=status.HTTP_400_BAD_REQUEST)

        if new_amount and new_amount != old_amount:
            if old_amount > new_amount:
                transaction = Outflow(
                    user=request.user,
                    title=constants.DEFAULT_CATEGORY_TITLE,
                    description=f"Removed from {pot.title}",
                    category=Category.objects.get(
                        title=constants.DEFAULT_CATEGORY_TITLE),
                    amount=old_amount-new_amount,
                    pot=pot,
                    is_recurring=False,
                    is_pending=True,
                    date_to_start=date.today()
                )
            else:
                transaction = Inflow(
                    user=request.user,
                    title=constants.DEFAULT_CATEGORY_TITLE,
                    description=f"Added to {pot.title}",
                    category=Category.objects.get(
                        title=constants.DEFAULT_CATEGORY_TITLE),
                    amount=new_amount-old_amount,
                    pot=pot,
                    is_recurring=False,
                    is_pending=True,
                    date_to_start=date.today())

                transaction.save()
                transaction.process()
            pot: Pot = Pot.objects.get(id=pk)
            serializer = self.get_serializer(pot)
            return Response(data=serializer.data, status=status.HTTP_202_ACCEPTED)

        return super().partial_update(request, *args, **kwargs)
