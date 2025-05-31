from pipeline import generate_response, analyze_mood
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter


test_cases = [
    ("I can't stop overthinking everything I do.", "fear"),
    ("I’ve been feeling down lately and can’t find the motivation to do anything.", "sadness"),
    ("My parents keep fighting and it’s stressing me out.", "fear"),
    ("I’m really happy today! I got my scholarship!", "joy"),
    ("I don’t feel like myself lately. Everything feels off.", "sadness"),
    ("I feel anxious about going to school tomorrow.", "fear"),
    ("How can I maintain good mental health every day?", "neutral"),
    ("I want to talk to someone but I don't know how to start.", "fear"),
]

true_labels = []
pred_labels = []
pred_responses = []
expected_responses = []

print("\n\n🧪 EVALUATION RESULTS")
for idx, (text, expected) in enumerate(test_cases):
    print(f"\n🧪 Test {idx+1}: {text}")
    
    
    mood = analyze_mood(text)
    print(f"Predicted Mood: {mood} | Expected: {expected}")
    
    
    true_labels.append(expected)
    pred_labels.append(mood)
    
    
    response = generate_response(text) 
    pred_responses.append(response)
    expected_responses.append(expected) 


print("\n Classification Report:")
print(classification_report(true_labels, pred_labels, labels=["joy", "sadness", "fear", "anger", "neutral"], zero_division=0))


labels = ["joy", "sadness", "fear", "anger", "neutral"]
cm = confusion_matrix(true_labels, pred_labels, labels=labels)
sns.set(style="whitegrid")
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.savefig("confusion_matrix.png")
plt.close()
print(" Confusion matrix saved as confusion_matrix.png")


pred_counts = Counter(pred_labels)
plt.figure(figsize=(8, 4))
sns.barplot(x=list(pred_counts.keys()), y=list(pred_counts.values()))
plt.title("Distribution of Predicted Labels")
plt.xlabel("Emotion")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig("prediction_distribution.png")
plt.close()
print(" Prediction distribution saved as prediction_distribution.png")


print("\n🔍 Misclassified 'sadness' examples:")
for i in range(len(true_labels)):
    if true_labels[i] == "sadness" and pred_labels[i] != "sadness":
        print(f"[MISS] Text: {test_cases[i][0]}")
        print(f"  → Predicted: {pred_labels[i]}, Expected: sadness\n") 


mood_accuracy = sum([1 for t, p in zip(true_labels, pred_labels) if t == p]) / len(true_labels) * 100
print(f"\n Mood Detection Accuracy: {mood_accuracy:.2f}%")


response_accuracy_count = sum([1 for r, er in zip(pred_responses, expected_responses) if r.lower() == er.lower()])
response_accuracy = (response_accuracy_count / len(test_cases)) * 100

print(f"📊 Response Accuracy: {response_accuracy:.2f}%")
