

import pandas as pd
from sklearn.preprocessing import LabelEncoder
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from transformers import DataCollatorWithPadding
import torch
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support


df_train = pd.read_csv("goemotions_train.csv")
df_test = pd.read_csv("goemotions_test.csv")


label_encoder = LabelEncoder()
df_train["label"] = label_encoder.fit_transform(df_train["emotion"])
df_test["label"] = label_encoder.transform(df_test["emotion"])


train_dataset = Dataset.from_pandas(df_train)
test_dataset = Dataset.from_pandas(df_test)


tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(label_encoder.classes_)
)


def preprocess_function(examples):
    return tokenizer(examples["prompt"], truncation=True)

train_dataset = train_dataset.map(preprocess_function, batched=True)
test_dataset = test_dataset.map(preprocess_function, batched=True)

data_collator = DataCollatorWithPadding(tokenizer=tokenizer)



def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    acc = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average="weighted")
    return {
        "accuracy": acc,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


training_args = TrainingArguments(
    output_dir="./emotions_model",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    load_best_model_at_end=True,
    metric_for_best_model="f1"
)


trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics,
)


trainer.train()
trainer.evaluate()


model.save_pretrained("emotions_model")
tokenizer.save_pretrained("emotions_model")
import joblib
joblib.dump(label_encoder, "emotions_model/label_encoder.pkl")

print("✅ Fine-tuned model saved in ./emotions_model")