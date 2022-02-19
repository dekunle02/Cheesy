from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models.query import QuerySet

from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer
from pot.models import Currency
from transaction.models import Transaction


def treat_all_pending_transactions(user: User):
    all_transactions = list(Transaction.objects.filter(user=user))
    Transaction.treat_list(all_transactions)


class SignUpView(APIView):
    def post(self, request, format=None) -> Response:
        username: str = self.request.data["username"]
        email: str = self.request.data["email"]
        password: str = self.request.data["password"]

        try:
            validate_email(email)
        except ValidationError:
            return Response(data={"message": "Invalid email"}, status=status.HTTP_404_NOT_FOUND)

        try:
            user: User = User.objects.create_user(
                username=username, email=email, password=password)
            currency = Currency.objects.filter(user=user)[0]
            user.default_currency = currency
            user.save()
            refresh: any = RefreshToken.for_user(user)
            serializer: UserSerializer = UserSerializer(user)

            response_data: dict = {
                'token': {'refresh': str(refresh), 'access': str(refresh.access_token)},
                'user': serializer.data
            }
            return Response(data=response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            response_data: dict = {"message": f"Unable to create user. {e}"}
            return Response(data=response_data, status=status.HTTP_406_NOT_ACCEPTABLE)

class SignInView(APIView):
    def post(self, request) -> Response:
        email: str = self.request.data["email"]
        password: str = self.request.data["password"]

        try:
            validate_email(email)
        except ValidationError:
            return Response(data={"message": "Invalid email"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user: User = User.objects.get(email=email)
        except:
            return Response(data={"message": "No user matches email"}, status=status.HTTP_400_BAD_REQUEST)

        if user.check_password(password):
            treat_all_pending_transactions(user)
            refresh = RefreshToken.for_user(user)
            token: dict = {'refresh': str(refresh), 'access': str(
                refresh.access_token)}
            serializer: UserSerializer = UserSerializer(user)
            return Response(data={"token": token, "user": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    permission_classes : list = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset: QuerySet = User.objects.all()

    def partial_update(self, request, pk=None) -> Response:
        user: User = self.request.user
        try:
            serializer: UserSerializer = self.get_serializer(
                user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(data=serializer.data, status=status.HTTP_202_ACCEPTED)
        except:
            return Response(data={"message": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST) 
        

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None) -> Response:
        user: User = self.request.user
        try:
            user.set_password(self.request.data["password"])
            user.save()
            return Response(data=self.get_serializer(user, many=False).data, status=status.HTTP_202_ACCEPTED)
        except:
            return Response(data={"message": "Invalid parameters"},
                            status=status.HTTP_400_BAD_REQUEST)
        

    def destroy(self, request, pk=None) -> Response:
        user: User = self.request.user
        user.delete()
        return Response(data={"message": "User Account Deleted"}, status=status.HTTP_200_OK)
        

class ProtectedView(APIView):
    """
    View made solely for testing authentication
    """
    permission_classes = [IsAuthenticated]
    def get(self, request) -> Response:
         return Response(status=status.HTTP_200_OK)
