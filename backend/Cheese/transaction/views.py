from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response


from core.helpers import string_to_date
from pot.models import Pot
from .models import Record, Transaction, Transfer
from .serializers import RecordSerializer, TransactionSerializer, TransferSerializer


class RecordViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RecordSerializer

    def get_queryset(self):
        user = self.request.user
        return Record.objects.all().filter(user=user)

    def list(self, request):
        records = self.get_queryset()
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        kind = request.GET.get('kind')

        if from_date and to_date:
            try:
                from_date = string_to_date(from_date)
                to_date = string_to_date(to_date)
                records = records.filter(date__range=(from_date, to_date))
            except:
                return Response(data={"message": "Dates should be in ISO format.(yyyy-mm-dd)"}, status=status.HTTP_400_BAD_REQUEST)

        if kind:
            try:
                kind = kind.lower()
                if kind in (Transaction.Kind.INFLOW, Transaction.Kind.OUTFLOW):
                    records = records.filter(transaction__kind=kind)
                else:
                    raise Exception("Wrong Kind of Transaction")
            except:
                return Response(data={"message": "There are only 2 kinds of transactions: inflow, outflow"}, status=status.HTTP_400_BAD_REQUEST)
        
        serialized_records = self.get_serializer(records, many=True)
        return Response(data=serialized_records.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path="range")
    def transaction_range(self, request, pk=None, *args, **kwargs):
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
        
        data = Record.fetch_record_total_from(request.user, from_date, granularity)
        return Response(data = data, status=status.HTTP_200_OK)
         

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.all().filter(user=user, is_deleted=False)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)  
            transaction = Transaction.objects.create(user=self.request.user, **serializer.validated_data)          
            serializer = self.get_serializer(transaction, many=False)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(data={"message": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)  

    def partial_update(self, request, pk=None, *args, **kwargs):
        transaction = Transaction.objects.get(id=pk)
        serializer = self.get_serializer(
            transaction, data=request.data, partial=True)
        try: 
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(data=serializer.data, status=status.HTTP_202_ACCEPTED)
        except:
          return Response(data={"message": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST) 

    def list(self, request):
        transactions = self.get_queryset()
        kind = request.GET.get('from')
        pot = request.GET.get('pot')
        is_transfer = request.GET.get('is_transfer')

        if (is_transfer == 'true'):
            transactions.filter(is_transfer=True)


        if kind:
            try:
                kind = kind.lower()
                if kind in (Transaction.Kind.INFLOW, Transaction.Kind.OUTFLOW):
                    transactions = transactions.filter(kind=kind)
                else:
                    raise Exception("Wrong Kind of Transaction")
            except:
                return Response(data={"message": "There are only 2 kinds of transactions: inflow, outflow"}, status=status.HTTP_400_BAD_REQUEST)
        
        if pot:
            try:
                transactions.filter(pot=Pot.objects.get(id=pot))
            except:
                return Response(data={"message": "Enter Valid pot_id"}, status=status.HTTP_400_BAD_REQUEST)

        serialized_transactions = self.get_serializer(transactions, many=True)
        return Response(data=serialized_transactions.data, status=status.HTTP_200_OK) 

    def destroy(self, request, pk=None, *args, **kwargs):
        transaction = Transaction.objects.get(id=pk)
        transaction.is_deleted = True
        transaction.save()
        return Response(data={"message": "User Account Deleted"}, status=status.HTTP_200_OK)

        

    @action(detail=True, methods=['get'], url_path="records")
    def completed_records(self, request, pk=None, *args, **kwargs):
        transaction = self.get_queryset().filter(id=pk)
        from_date = self.request.query_params.get('from')
        if len(transaction) == 0:
            return Response(data={"message": "Enter Valid transaction_id"}, status=status.HTTP_400_BAD_REQUEST)
        transaction: Transaction = transaction[0]

        try:
            from_date = string_to_date(from_date)
        except:
            return Response(data={"message": 'Dates should be in ISO format.(yyyy-mm-dd)'}, status=status.HTTP_400_BAD_REQUEST)

        completed_records = transaction.get_treatment_records_from(from_date)
        serialized_records = RecordSerializer(completed_records, many=True)
        return Response(data=serialized_records.data, status=status.HTTP_200_OK) 


class TransferViewSet(mixins.CreateModelMixin,mixins.ListModelMixin,viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransferSerializer

    def get_queryset(self):
        user = self.request.user
        return Transfer.objects.all().filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)  
            transfer = Transfer.objects.create(user=self.request.user, **serializer.validated_data)          
            serializer = self.get_serializer(transfer, many=False)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        except:
            return Response(data={"message": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)
