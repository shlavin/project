from django.contrib import admin
from django.urls import path, include
from chatbot.views import MoodHistoryView 
from chatbot.views import MoodDailyView, MoodFrequencyView
from chatbot.views import MoodStreakView
from chatbot.views import RequestPasswordResetView, ResetPasswordView
from chatbot import views 

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
   
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('chatbot.urls')), 
    path('chat/', views.chatbot_view, name='chatbot_view'),  
    path('chatbot-response/', views.ChatbotResponse.as_view(), name='chatbot_response'),  
    path('', views.homepage_view, name='homepage'), 
    path('register/', views.RegisterUserView.as_view(), name='register'), 
    path("api/login/", views.LoginUserView.as_view(), name="login"), 
    path("api/get-user-name/", views.GetUserNameView.as_view(), name="get-user-name"), 
    path('api/mood-history/', MoodHistoryView.as_view(), name='mood-history'),
    path('api/mood-daily/', MoodDailyView.as_view(), name='mood-daily'),
    path('api/mood-frequency/', MoodFrequencyView.as_view(), name='mood-frequency'),
    path('api/mood-streak/', MoodStreakView.as_view(), name='mood-streak'),
    path("api/password-reset/request/", RequestPasswordResetView.as_view(), name="password-reset-request"),
    path("api/password-reset/confirm/", ResetPasswordView.as_view(), name="password-reset-confirm"),
]
