"""
Training script for OverseasJob AI Model
Fine-tunes sentence transformer for resume-job matching
"""

import os
import json
import torch
from datetime import datetime
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# Configuration
MODEL_NAME = 'all-MiniLM-L6-v2'
OUTPUT_PATH = 'models/overseas_resume_model'
BATCH_SIZE = 16
EPOCHS = 3
WARMUP_STEPS = 100
EVAL_STEPS = 500
SAVE_STEPS = 500

def load_training_data():
    """Load training data from JSON file"""
    data_path = 'data/training_data.json'
    
    if not os.path.exists(data_path):
        print(f"Training data not found at {data_path}")
        print("Creating sample training data...")
        create_sample_training_data()
    
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    return data

def create_sample_training_data():
    """Create sample training data for demonstration"""
    os.makedirs('data', exist_ok=True)
    
    sample_data = [
        {
            "resume_text": "Software engineer with 5 years experience in Python, Django, and React. Led team of 3 developers.",
            "job_text": "Looking for senior software engineer with Python, Django experience. Team leadership skills required.",
            "label": 1.0
        },
        {
            "resume_text": "Data analyst proficient in SQL, Python, pandas, and Tableau. 3 years experience.",
            "job_text": "Data analyst position requiring SQL, Python, and visualization skills.",
            "label": 1.0
        },
        {
            "resume_text": "Marketing manager with expertise in digital marketing, SEO, and content strategy.",
            "job_text": "Software developer position requiring Java, Spring Boot, and microservices.",
            "label": 0.0
        },
        {
            "resume_text": "Full stack developer with React, Node.js, MongoDB experience. Built 10+ web applications.",
            "job_text": "Full stack engineer needed with React, Node.js skills. Database experience required.",
            "label": 1.0
        },
        {
            "resume_text": "Project manager with PMP certification. Managed $5M budgets and teams of 20+.",
            "job_text": "Senior project manager for tech projects. PMP certification preferred.",
            "label": 1.0
        }
    ]
    
    with open('data/training_data.json', 'w') as f:
        json.dump(sample_data, f, indent=2)
    
    print("Sample training data created at data/training_data.json")

def prepare_training_examples(data):
    """Convert data to InputExamples"""
    examples = []
    
    for item in data:
        examples.append(InputExample(
            texts=[item['resume_text'], item['job_text']],
            label=float(item['label'])
        ))
    
    return examples

def train_model():
    """Train the model"""
    print("=" * 50)
    print("OverseasJob AI Model Training")
    print("=" * 50)
    
    # Load base model
    print(f"\nLoading base model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    
    # Load training data
    print("Loading training data...")
    data = load_training_data()
    
    # Prepare training examples
    train_examples = prepare_training_examples(data)
    print(f"Loaded {len(train_examples)} training examples")
    
    # Create dataloader
    train_dataloader = DataLoader(
        train_examples,
        shuffle=True,
        batch_size=BATCH_SIZE
    )
    
    # Define loss function
    train_loss = losses.CosineSimilarityLoss(model)
    
    # Create output directory
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    
    # Training
    print("\nStarting training...")
    print(f"Epochs: {EPOCHS}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Warmup steps: {WARMUP_STEPS}")
    
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=EPOCHS,
        warmup_steps=WARMUP_STEPS,
        output_path=OUTPUT_PATH,
        show_progress_bar=True
    )
    
    # Save model info
    model_info = {
        "base_model": MODEL_NAME,
        "trained_at": datetime.now().isoformat(),
        "epochs": EPOCHS,
        "batch_size": BATCH_SIZE,
        "training_samples": len(train_examples),
        "version": "1.0.0"
    }
    
    with open(f'{OUTPUT_PATH}/model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print(f"\nTraining complete!")
    print(f"Model saved to: {OUTPUT_PATH}")
    print(f"Model info: {model_info}")
    
    return model

def evaluate_model(model):
    """Evaluate the trained model"""
    print("\n" + "=" * 50)
    print("Model Evaluation")
    print("=" * 50)
    
    test_pairs = [
        {
            "resume": "Python developer with Django and Flask experience",
            "job": "Looking for Python developer with web framework experience",
            "expected_similarity": "high"
        },
        {
            "resume": "Java developer with Spring Boot experience",
            "job": "Looking for Python data scientist",
            "expected_similarity": "low"
        },
        {
            "resume": "Full stack developer React Node.js MongoDB",
            "job": "Full stack engineer with React and Node.js",
            "expected_similarity": "high"
        }
    ]
    
    print("\nTest Results:")
    for test in test_pairs:
        emb1 = model.encode(test["resume"])
        emb2 = model.encode(test["job"])
        
        similarity = torch.nn.functional.cosine_similarity(
            torch.tensor(emb1).unsqueeze(0),
            torch.tensor(emb2).unsqueeze(0)
        ).item()
        
        print(f"\nResume: {test['resume'][:50]}...")
        print(f"Job: {test['job'][:50]}...")
        print(f"Expected: {test['expected_similarity']}")
        print(f"Similarity: {similarity:.3f}")

if __name__ == "__main__":
    # Train the model
    model = train_model()
    
    # Evaluate the model
    evaluate_model(model)
    
    print("\n" + "=" * 50)
    print("Training pipeline completed successfully!")
    print("=" * 50)
