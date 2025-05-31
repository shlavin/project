import os
import torch
import requests
import joblib
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from .models import Conversation, Message 

SUICIDE_KEYWORDS = [
    "kill myself", "suicidal", "end it all", "hurt myself", "take my life", "i don’t want to live",
    "i want to die", "i’m done", "can’t go on", "ending it", "want to end my life", "no reason to live"
]

HELP_KEYWORDS = ["help", "support", "talk", "problem", "stressed", "overwhelmed"]

TOGETHER_API_KEY = "fa20ad3dfe3d291b50e64458793d32066b7d7ed7240d3fef4009b305d15b3e5f"

model_dir = os.path.join(os.path.dirname(__file__), "emotions_model")
tokenizer = None
model = None
label_encoder = None

try:
    tokenizer = AutoTokenizer.from_pretrained(model_dir, local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir, local_files_only=True)
    label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.pkl"))
    model.eval()
    print(" Custom GoEmotions model loaded successfully.")
except Exception as e:
    print(f" Failed to load emotion model: {e}")


def contains_suicidal_thoughts(text):
    text = text.lower()
    return any(keyword in text for keyword in SUICIDE_KEYWORDS)

def is_help_request(text):
    text = text.lower()
    return any(word in text for word in HELP_KEYWORDS)


def analyze_mood(text):
    if model is None or tokenizer is None or label_encoder is None:
        return "neutral"
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = F.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probs, dim=1).item()
    emotion = label_encoder.inverse_transform([predicted_class])[0]

    mood_map = {
        "joy": "joy", "sadness": "sadness", "anger": "anger", "fear": "fear",
        "confusion": "confusion", "neutral": "neutral",
        "grief": "sadness", "disgust": "disgust", "embarrassment": "embarrassment"
    }
    return mood_map.get(emotion.lower(), "neutral")


def build_prompt(mood, message, user_name="friend"):
    prompt = (
        f"You are Rafiki, a supportive and friendly chatbot for university students.\n"
        f"You talk casually, empathetically, and never exaggerate or invent things.\n"
        f"Your goal is to respond to the student's message with emotional awareness.\n"
        f"Keep responses helpful, clear, and conversational — like a supportive friend.\n"
        f"If the user expresses joy, you celebrate with them. If they feel down, you uplift gently.\n"
        f"Avoid dramatic or overly cheerful responses. Always stay grounded.\n"
        f"\n"
        f"The user's mood is: {mood}.\n"
        f"\n"
        f"User: {message}\n"
        f"Rafiki:"
    )
    return prompt



def generate_llama_response(prompt):
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta-llama/Llama-Vision-Free",
        "prompt": prompt,
        "max_tokens": 300,
        "temperature": 0.7,
        "top_p": 0.9,
        "stop": ["###", "User:", "Rafiki:"]
    }
    try:
        response = requests.post(
            "https://api.together.xyz/v1/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        if response.status_code == 200:
            raw_text = response.json()["choices"][0]["text"].strip()
            if "```" in raw_text:
                raw_text = raw_text.split("```", 1)[0].strip()
            if "Rafiki:" in raw_text:
                raw_text = raw_text.split("Rafiki:", 1)[-1].strip()
            if raw_text.endswith("...") or raw_text.endswith(",") or raw_text.endswith(".."):
                raw_text = raw_text.rstrip(",. ") + ". Would you like to talk more about that?"
            return raw_text
        else:
            print(f" API error: {response.status_code}, {response.text}")
            return "I'm here for you, but I had trouble responding clearly. Could you try again?"
    except requests.exceptions.Timeout:
        print(" Together API request timed out.")
        return "Sorry, I took too long to respond. Please try again in a moment."
    except Exception as e:
        print(f" Exception during API call: {e}")
        return "Something went wrong while generating my response, but I'm here for you."

def generate_response(user_input, user_name="friend", user=None):
    if contains_suicidal_thoughts(user_input):
        return (
            f" I'm really sorry you're feeling this way, {user_name}. You're not alone.\n\n"
            "**Please consider talking to someone immediately.**\n\n"
            "**Kenya Mental Health Emergency Contacts:**\n"
            "-  Befrienders Kenya: +254 722 178177\n"
            "-  Amani Centre: +254 722 509226\n"
            "-  Chuka University Counseling Services Contact: +254 123 456 789\n"
            "-  Red Cross Mental Health Line: 1199 (Toll Free)\n\n"
            "You're important and you matter. Talking to a professional can help — I'm here to support you in any way I can."
        )

    history = ""
    conversation = None

    if user:
        conversation, _ = Conversation.objects.get_or_create(user=user, title="Default")
        recent = Message.objects.filter(conversation=conversation).order_by('-timestamp')[:5][::-1]

        for msg in recent:
            # Only include meaningful entries (e.g., more than 1 word or not greetings)
            if msg.text.lower().strip() in ["hello", "hi", "hey"]:
                continue
            speaker = "User" if msg.sender == "user" else "Rafiki"
            history += f"### {speaker}:\n{msg.text.strip()}\n\n"

    mood = analyze_mood(user_input)

    prompt = (
        f"You are Rafiki, an emotionally intelligent chatbot for university students.\n"
        f"Your goal is to respond empathetically and helpfully to each new message.\n"
        f"Use the past conversation only for light context — never repeat or continue old topics unless the user asks.\n\n"
        f"### Recent Conversation:\n\n"
        f"{history}"
        f"### New Message from {user_name}:\n{user_input.strip()}\n\n"
        f"### Rafiki's Reply:"
    )

    ai_response = generate_llama_response(prompt)

    if user and conversation:
        Message.objects.create(conversation=conversation, user=user, sender="user", text=user_input, mood=mood)
        Message.objects.create(conversation=conversation, user=user, sender="bot", text=ai_response, mood=analyze_mood(ai_response))

    return ai_response
