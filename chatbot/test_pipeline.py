import unittest
from pipeline import analyze_mood, generate_response, predict_emotion
from label_map import label_map

class TestChatbotPipeline(unittest.TestCase):

    def test_predict_emotion_valid(self):
        text = "I’m feeling really sad and down today."
        emotion = predict_emotion(text)
        self.assertIn(emotion.lower(), label_map.keys(), "Emotion not in label map")

    def test_analyze_mood_sadness(self):
        text = "I’m feeling really sad and down today."
        mood = analyze_mood(text)
        self.assertEqual(mood, "sadness", "Expected mood to be sadness")

    def test_analyze_mood_joy(self):
        text = "I'm so excited about my graduation!"
        mood = analyze_mood(text)
        self.assertEqual(mood, "joy", "Expected mood to be joy")

    def test_crisis_detection(self):
        text = "I want to end my life"
        result = generate_response(text)
        self.assertIn("Emergency Mental Health Contacts", result["explanation"])

    def test_generate_response_normal(self):
        text = "I'm just feeling stressed with school work."
        result = generate_response(text)
        self.assertIn("friend", result["explanation"].lower())
        self.assertTrue(len(result["explanation"]) > 20)

if __name__ == "__main__":
    unittest.main()
