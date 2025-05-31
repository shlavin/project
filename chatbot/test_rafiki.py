from pipeline import generate_response

# Sample prompts covering realistic student mental health scenarios
test_cases = [
    "hello rafiki",
    "I got my internship today and I'm really excited!",
    "My parents argue every night and it’s affecting my sleep.",
    "I’ve been feeling so low lately, I can’t even get out of bed.",
    "I look in the mirror and hate what I see.",
    "I don’t feel like I belong anywhere.",
    "I failed my last exam and I’m scared of failing again.",
    "Everyone else seems happy and I feel broken.",
    "I just want someone to talk to about how overwhelmed I am.",
    "Sometimes I think people would be better off without me.",
    "I'm scared that I’ll never get better.",
    "I want to quit school. I can’t do this anymore.",
    "I’m anxious about my final presentation tomorrow.",
    "I don’t even know what I’m feeling — I’m just numb.",
    "I was body shamed today and it ruined my entire mood.",
    "I’m proud I finally opened up to a friend about my depression.",
    "I haven’t eaten in two days. I don’t feel hungry anymore.",
    "I just miss being happy. I don’t know how to feel that way again.",
    "I’m worried about a friend who’s showing signs of depression.",
    "I feel ashamed about how I look. I wish I looked like others."
]

print("\n🧪 Testing Rafiki's Emotional Intelligence:\n")

for i, prompt in enumerate(test_cases):
    print(f"🟦 User {i+1}: {prompt}")
    response = generate_response(prompt, user_name="peter")
    print(f"🟨 Rafiki: {response}\n{'-'*60}")
