from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

class AccountTest(APITestCase):

    def test_create_user(self):
        """New User object are created"""
        UserModel = get_user_model()
        url = reverse('account:signup')
        data = {'username': 'admin', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserModel.objects.count(), 1)
        self.assertEqual(UserModel.objects.get().username, 'admin')
    
    def test_create_user_validation(self):
        """User object not created with similar username/email or poor email/password"""
        UserModel = get_user_model()
        user0=UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')

        similar_username_data = {'username': 'admin', 'email':'admin1@admin.com', 'password':'2@tW&AYhLXW7'}
        similar_email_data = {'username': 'admin1', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        poor_email_data = {'username': 'admin2', 'email':'adminadmin.com', 'password':'2@tW&AYhLXW7'}
        poor_password_data = {'username': 'admin3', 'email':'admin3@admin.com', 'password':'qwerty'}

        url = reverse('account:signup')
        response_similar_username = self.client.post(url, similar_username_data)
        response_similar_email = self.client.post(url,similar_email_data)
        response_poor_email = self.client.post(url, poor_email_data)
        response_poor_password = self.client.post(url, poor_password_data)

        self.assertNotEqual(response_similar_username.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response_similar_email.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response_poor_email.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response_poor_password.status_code, status.HTTP_201_CREATED)

    def test_token_created_with_user_creation(self):
        """Auth Token is returned with user creation"""
        url = reverse('account:signup')
        data = {'username': 'admin', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        response = self.client.post(url, data)
                
        verify_url = reverse('account:token_verify')
        verify_response = self.client.post(verify_url, {'token': response.data['token']['access']})
        
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)

    def test_sign_in_user(self):
        """User signs in with correct email and password"""
        UserModel = get_user_model()
        UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        url = reverse('account:signin')
        response = self.client.post(url, {'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'admin')
    
    def test_token_grants_access(self):
        """Access Token grants access to Protected View"""
        url = reverse('account:signup')
        data = {'username': 'admin', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        response = self.client.post(url, data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        protected_url = reverse('account:protected')
        
        protected_response = self.client.get(protected_url)
        self.assertEqual(protected_response.status_code, status.HTTP_200_OK)

    
    def test_user_change_username_password(self):
        """Username, email and password can be changed"""
        UserModel = get_user_model()
        UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')

        login_data = {'username': 'admin', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        login_url = reverse('account:signin')
        response = self.client.post(login_url, login_data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)

        change_data = {"username":"admin2", "email":"admin2@admin.com"}
        change_url = reverse('account:user-detail', kwargs={'pk': 1})
        self.client.patch(change_url, change_data)

        password_data = {"password": "2@tW&AYhLXW8"}
        password_url = reverse('account:user-set-password', kwargs={'pk': 1})
        self.client.post(password_url, password_data)

        user = UserModel.objects.get(id=1)
        self.assertEquals(user.username, 'admin2')
        self.assertEquals(user.email, 'admin2@admin.com')
        self.assertTrue(user.check_password("2@tW&AYhLXW8"))


    def test_user_not_edit_another_user(self):
        """User unable to edit another user details"""
        UserModel = get_user_model()
        UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        UserModel.objects.create_user(username='admin2', email='admin2@admin.com', password='2@tW&AYhLXW8')

        login_data = {'username': 'admin', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        login_url = reverse('account:signin')
        response = self.client.post(login_url, login_data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)

        change_data = {"username":"admin3"}
        change_url = reverse('account:user-detail', kwargs={'pk': 2})
        self.client.patch(change_url, change_data)

        user2 = UserModel.objects.get(id=2)

        self.assertEquals(user2.username, 'admin2')

    def test_user_delete(self):
        """User can delete their own account"""
        UserModel = get_user_model()
        UserModel.objects.create_user(username='admin', email='admin@admin.com', password='2@tW&AYhLXW7')
        
        login_data = {'username': 'admin', 'email':'admin@admin.com', 'password':'2@tW&AYhLXW7'}
        login_url = reverse('account:signin')
        response = self.client.post(login_url, login_data)
        access_token = response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)

        delete_url = reverse('account:user-detail', kwargs={'pk': 1})
        self.client.delete(delete_url)

        users = UserModel.objects.all()

        self.assertEquals(len(users), 0)

