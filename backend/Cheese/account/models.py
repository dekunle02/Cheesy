from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(unique=True, max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True, blank=False, null=False)
    default_currency = models.ForeignKey("pot.Currency", on_delete=models.CASCADE, null=True, blank=True, related_name='default_currency')
    photo_url = models.URLField(null=True, blank=True)

    @property 
    def image_url(self) -> str:
        if self.photo_url:
            return self.photo.url
        else:
            return ""
            
    def __str__(self) -> str:
        return f"user:{self.username} email:{self.email}"
