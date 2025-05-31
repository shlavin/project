from django.urls import path
from .views import LogoutUserView, LoginUserView
from .views import ConversationListView, ConversationDetailView, MessageSaveView
from .views import MoodHistoryView, MoodDailyView, MoodFrequencyView
from .views import MoodStreakView
from .views import RequestPasswordResetView, ResetPasswordView

urlpatterns = [
    path('login/', LoginUserView.as_view(), name='login'), 
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('messages/', MessageSaveView.as_view(), name='message-save'),  
    path('mood-history/', MoodHistoryView.as_view(), name='mood-history'),
    path('mood-daily/', MoodDailyView.as_view(), name='mood-daily'),
    path('mood-frequency/', MoodFrequencyView.as_view(), name='mood-frequency'),
    path('mood-streak/', MoodStreakView.as_view(), name='mood-streak'),
    path("password-reset/request/", RequestPasswordResetView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", ResetPasswordView.as_view(), name="password-reset-confirm"),
]
