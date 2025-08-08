#!/usr/bin/env python3
"""
Test script for the lightweight ML evaluator
"""
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.ml_evaluator_lightweight import LightweightMLEvaluator

async def test_evaluator():
    print("🔧 Testing Lightweight ML Evaluator...")
    print("=" * 60)
    
    # Initialize evaluator
    evaluator = LightweightMLEvaluator()
    
    # Test data
    test_cases = [
        {
            "question": "What is artificial intelligence?",
            "chatbot_answer": "Artificial intelligence is a field of computer science that aims to create machines capable of intelligent behavior, learning, and decision-making similar to humans.",
            "manual_answer": "AI is the simulation of human intelligence in machines that are programmed to think and learn like humans, including reasoning, learning, and self-correction."
        },
        {
            "question": "How does machine learning work?",
            "chatbot_answer": "Machine learning uses algorithms to automatically learn patterns from data without being explicitly programmed for every task.",
            "manual_answer": "Machine learning is a method of data analysis that automates analytical model building using algorithms that iteratively learn from data."
        },
        {
            "question": "What is the capital of France?",
            "chatbot_answer": "Paris is the capital city of France.",
            "manual_answer": "The capital of France is Paris."
        }
    ]
    
    # Test each case
    for i, case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}:")
        print(f"Question: {case['question']}")
        print(f"Chatbot: {case['chatbot_answer']}")
        print(f"Manual: {case['manual_answer']}")
        print("-" * 60)
        
        try:
            result = await evaluator.evaluate(
                case['question'],
                case['chatbot_answer'],
                case['manual_answer']
            )
            
            print(f"📊 Results:")
            print(f"Overall Score: {result['score']:.2f}/100")
            print(f"Similarity: {result['details']['similarity']:.2f}")
            print(f"Accuracy: {result['details']['accuracy']:.2f}")
            print(f"Completeness: {result['details']['completeness']:.2f}")
            print(f"Relevance: {result['details']['relevance']:.2f}")
            print(f"Methods used: {result['metrics']['methods_used']}")
            print(f"Method scores: {result['metrics']['method_scores']}")
            print(f"Explanation: {result['explanation']}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("=" * 60)
    
    print("\n✅ Testing completed!")

if __name__ == "__main__":
    asyncio.run(test_evaluator())