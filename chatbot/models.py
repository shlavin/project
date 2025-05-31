from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.timezone import now
from django.utils import timezone  
from datetime import datetime, timedelta
import uuid




class CustomUserManager(BaseUserManager):
    def create_user(self, name, password=None, email=None):
        if not name:
            raise ValueError('The Name field must be set')
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)
        user = self.model(name=name, email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, password=None, email=None):
        user = self.create_user(name, password, email)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.name


class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    title = models.CharField(max_length=255, default='Conversation')
    created_at = models.DateTimeField(default=now)

    def __str__(self):
        return f'{self.title} ({self.created_at})'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    sender = models.CharField(max_length=50)  
    text = models.TextField()
    timestamp = models.DateTimeField(default=now)
    mood = models.CharField(max_length=20, default="neutral")  

    def __str__(self):
        return f'[{self.timestamp}] {self.sender}: {self.text[:50]}'

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=15)