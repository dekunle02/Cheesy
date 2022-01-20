from datetime import date

from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.helpers import string_to_date
from .models import Record, Transaction
from .serializers import RecordSerializer


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
                if kind.lower() in (Transaction.Kind.INFLOW, Transaction.Kind.OUTFLOW):
                    kind = kind.lower()
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
         
