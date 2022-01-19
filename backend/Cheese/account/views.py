from django.shortcuts import render
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer


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
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)

            response_data = {
                'message': "User created successfully",
                'token': {'refresh': str(refresh), 'access': str(refresh.access_token)},
                'user': serializer.data
            }
            return Response(data=response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            response_data = {"message": f"Unable to create user. {e}"}
            return Response(data=response_data, status=status.HTTP_406_NOT_ACCEPTABLE)

class SignInView(APIView):
    def post(self, request):
        email: str = self.request.data["email"]
        password: str = self.request.data["password"]

        try:
            validate_email(email)
        except ValidationError:
            return Response(data={"message": "Invalid email"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except:
            return Response(data={"message": "No user matches email"}, status=status.HTTP_400_BAD_REQUEST)

        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            token = {'refresh': str(refresh), 'access': str(
                refresh.access_token)}
            serializer = UserSerializer(user)
            return Response(data={"message": "Sign In Successful", "token": token, "user": {'username': user.username, 'email': user.email, 'image_url': user.image_url}}, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
         return Response(status=status.HTTP_200_OK)
