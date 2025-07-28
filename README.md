 Mental Health Chatbot

This chatbot was developed to provide emotional support and mental health resources to university students in a safe, judgment-free space. Its purpose is to help students manage stress, anxiety, and isolation by offering friendly conversations, helpful coping tips, and access to mental health information. The chatbot uses basic natural language processing to recognize emotional cues and respond empathetically. Its impact lies in making mental health support more accessible, especially for students who may be hesitant to seek help in person. The project reflects my commitment to using technology for social good and promoting emotional well-being among young people.



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



