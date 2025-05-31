import random
import re
import torch
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from collections import defaultdict
from collections import Counter
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .pipeline import generate_response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.utils.timezone import localtime
from datetime import datetime
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from .pipeline import analyze_mood, generate_response
from django.db.models import Count,  Max, Q
from django.utils.timezone import localdate
from django.utils.timezone import make_aware
from django.utils.timezone import get_current_timezone
from .models import PasswordResetToken
from django.contrib.auth import get_user_model
import os
import joblib
from requests.exceptions import RequestException
import traceback




User = get_user_model()
MODEL_PATH = os.path.join(os.path.dirname(__file__), "emotions_model")


label_encoder = joblib.load(os.path.join(MODEL_PATH, "label_encoder.pkl"))

def homepage_view(request):
    return render(request, 'chatbot/homepage.html')


def chatbot_view(request):
    return JsonResponse({"message": "Chatbot is ready to chat!"})

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        name = request.data.get("name")
        try:
            user = User.objects.get(name=name)
            token = PasswordResetToken.objects.create(user=user)
            return Response({"reset_token": str(token.token)}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        try:
            reset_token = PasswordResetToken.objects.get(token=token)

           
            if reset_token.is_expired():
                reset_token.delete()
                return Response(
                    {"message": "Token has expired. Please request a new one."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = reset_token.user
            user.set_password(new_password)
            user.save()
            reset_token.delete() 
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)

        except PasswordResetToken.DoesNotExist:
            return Response({"message": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user).order_by('-created_at')
        
        grouped_conversations = {}
        for conversation in conversations:
            date = localtime(conversation.created_at).strftime('%Y-%m-%d') 
            if date not in grouped_conversations:
                grouped_conversations[date] = []
            grouped_conversations[date].append(conversation)

        response_data = [
            {
                "date": date,
                "conversations": ConversationSerializer(convs, many=True).data
            }
            for date, convs in grouped_conversations.items()
        ]
        return Response(response_data)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
            serializer = MessageSerializer(messages, many=True)
            return Response({"messages": serializer.data}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)



class MessageSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            user = request.user
            print(f"Authenticated user: {user}")  

            
            conversation_id = data.get('conversation_id')
            sender = data.get('sender')
            text = data.get('text')

            if not conversation_id or not sender or not text:
                return Response({'error': 'Missing conversation_id, sender, or text'}, status=status.HTTP_400_BAD_REQUEST)

            
            with transaction.atomic():
                
                conversation, _ = Conversation.objects.get_or_create(id=conversation_id, user=user)

                
                message = Message(
                    conversation=conversation,
                    sender=sender,
                    text=text,
                    user=user,
                    mood=analyze_mood(text),  
                    timestamp=timezone.now()   
                )
                message.save()

            return Response({'status': 'Message saved successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in MessageSaveView: {str(e)}")
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        password = request.data.get("password")

        if not name or not password:
            return Response({"message": "Name and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(name=name)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "message": f"Welcome back, {user.name}!"
                }, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
           
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
           
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetUserNameView(APIView):
    def get(self, request):
        user_name = request.GET.get("name")
        if not user_name:
            return Response({"message": "Please provide your name to get started."}, status=status.HTTP_400_BAD_REQUEST)
        
        request.session['name'] = user_name
        return Response({"message": f"Hi {user_name}, how can I assist you today?"}, status=status.HTTP_200_OK)



class RegisterUserView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        name = request.data.get("name")
        password = request.data.get("password")
        email = request.data.get("email")

       
        if not name or not password or not email:
            return Response({"message": "Name, password, and email are required."}, status=status.HTTP_400_BAD_REQUEST)

       
        if User.objects.filter(name=name).exists():
            return Response({"message": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

        try:
           
            user = User.objects.create_user(name=name, password=password, email=email)
            return Response({"message": f"Welcome {user.name}! You have successfully registered."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating user: {str(e)}")  
            return Response({"message": f"Error creating user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MoodDailyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        date_str = request.GET.get('date')
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        else:
            from django.utils.timezone import localdate
            target_date = localdate()

        tz = get_current_timezone()
        start_dt = make_aware(datetime.combine(target_date, datetime.min.time()), timezone=tz)
        end_dt = make_aware(datetime.combine(target_date + timedelta(days=1), datetime.min.time()), timezone=tz)

        print(f"📅 Checking from {start_dt} to {end_dt} for user {user}")

        messages = Message.objects.filter(
            user=user,
            sender="user",
            timestamp__gte=start_dt,
            timestamp__lt=end_dt
        )

        print(" Matched Messages:", messages.count())
        for m in messages:
            print(f" - {m.timestamp} | {m.mood} | {m.text}")

        mood_counts = messages.values("mood").annotate(count=Count("mood"))
        mood_distribution = {m['mood']: m['count'] for m in mood_counts}

        return Response({"mood_distribution": mood_distribution})


class MoodFrequencyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        period = request.GET.get('period', 'week')  

       
        if period == 'week':
            start_date = datetime.now() - timedelta(days=7)
        elif period == 'month':
            start_date = datetime.now() - timedelta(days=30)
        else:
            return Response({"error": "Invalid period specified."}, status=400)

       
        messages = Message.objects.filter(user=user, timestamp__gte=start_date)
        mood_counts = messages.values('mood').annotate(count=Count('mood'))

        mood_frequency = {mood['mood']: mood['count'] for mood in mood_counts}

        return Response({"mood_frequency": mood_frequency})

class MoodHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            messages = Message.objects.filter(user=user).order_by('-timestamp')
            mood_history = [
                {
                    "text": message.text,
                    "mood": message.mood,
                    "timestamp": message.timestamp,
                }
                for message in messages
            ]
            return Response({"mood_history": mood_history}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error fetching mood history: {str(e)}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MoodStreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = localdate()

       
        daily_moods = (
            Message.objects
            .filter(user=user, sender="user")
            .values('timestamp__date')
            .annotate(latest_id=Max('id'))
            .order_by('-timestamp__date')
        )

       
        message_ids = [entry['latest_id'] for entry in daily_moods]
        messages = Message.objects.filter(id__in=message_ids).order_by('-timestamp__date')

        streak_mood = None
        streak_count = 0
        streak_broken = False

        for i, msg in enumerate(messages):
            if i == 0:
                streak_mood = msg.mood
                streak_count = 1
                expected_date = msg.timestamp.date()
            else:
                expected_date = expected_date - timedelta(days=1)
                if msg.timestamp.date() == expected_date and msg.mood == streak_mood:
                    streak_count += 1
                else:
                    break  
        return Response({
            "mood": streak_mood,
            "streak_count": streak_count,
            "message": f"You've had {streak_count} {streak_mood} day(s) in a row!"
        })



class ChatbotResponse(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            user_input = request.data.get("message", "").strip()
            print(f"Received input from user '{user}': {user_input}")

           
            if not user_input:
                return Response({"error": "User input cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

            
            
           
            ai_response = generate_response(user_input, user_name=user.name, user=user)

            print(f"Raw AI response: {ai_response}")

            
            if isinstance(ai_response, dict) and 'explanation' in ai_response:
                clean_response = re.sub(r".*/think>\n\n", "", ai_response['explanation'], flags=re.DOTALL)
            elif isinstance(ai_response, str):
                clean_response = ai_response
            else:
                clean_response = "Sorry, I couldn't understand that."

            print(f"Bot reply to '{user}': {clean_response}")
            return Response({"reply": clean_response})

        except RequestException as e:
           
            print(f" API Request Failed: {str(e)}")
            return Response({"error": "External API request failed. Please try again later."}, status=status.HTTP_502_BAD_GATEWAY)

        except KeyError as e:
            
            print(f" Missing data in AI response: {str(e)}")
            return Response({"error": "Response data is incomplete. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
           
            print(" Internal Server Error:")
            traceback.print_exc()
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)