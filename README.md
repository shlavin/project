 Mental Health Chatbot

An AI-powered chatbot that detects user emotions and provides supportive mental health conversations.

Overview

This is a full-stack web application built with:
- Django for the backend
- React for the frontend
- MySQL for the database
- Transformer models for emotion classification

It allows users to chat with a bot that responds empathetically based on detected emotions.


 How to Run the Project
 Backend (Django)

cd chatbot_project
python -m venv venv
venv\Scripts\activate       (Windows)
source venv/bin/activate  (macOS/Linux)

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend (React)
cd chatbot-frontend
npm install
npm run dev

Project Structure
chatbot_project/
├── chatbot/               Django app with models, views, AI logic
├── chatbot_project/       Django settings
├── chatbot-frontend/      React-based frontend UI


Author
Shayani Nyambura Kahumu
LinkedIn Profile - https://www.linkedin.com/in/shayani-kahumu-267983260/



