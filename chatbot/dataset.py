

import pandas as pd
from datasets import load_dataset
from sklearn.model_selection import train_test_split


print("Downloading GoEmotions dataset...")
dataset = load_dataset("go_emotions")


data = dataset["train"]


df = pd.DataFrame(data)


df["label"] = df["labels"].apply(lambda x: x[0] if x else None)


df = df.dropna(subset=["label"])


emotion_names = dataset["train"].features["labels"].feature.names

df["emotion"] = df["label"].apply(lambda x: emotion_names[x])


relevant_emotions = ["sadness", "anger", "joy", "fear", "neutral", "confusion"]
df = df[df["emotion"].isin(relevant_emotions)]


df = df.rename(columns={"text": "prompt"})
df = df[["prompt", "emotion"]]


train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

train_df.to_csv("goemotions_train.csv", index=False)
test_df.to_csv("goemotions_test.csv", index=False)

print(" GoEmotions dataset prepared and saved as:")
print(" - goemotions_train.csv")
print(" - goemotions_test.csv")
