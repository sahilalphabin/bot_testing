import asyncio
import re
import math
from typing import Dict, Any

class MLEvaluator:
    def __init__(self):
        # Initialize models - using lightweight fallbacks for demo
        self.sentence_model = None
        self.initialize_models()
    
    def initialize_models(self):
        """Initialize ML models - using lightweight fallbacks"""
        try:
            # Try to import heavy dependencies
            import numpy as np
            from sentence_transformers import SentenceTransformer
            from sklearn.metrics.pairwise import cosine_similarity
            import nltk
            
            # Download NLTK data if not present
            nltk.download('punkt', quiet=True)
            
            # Initialize sentence transformer
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("ML models initialized successfully")
        except Exception as e:
            print(f"Using lightweight ML evaluation (install sentence-transformers, sklearn, nltk for full features): {e}")
            self.sentence_model = None
    
    async def evaluate(self, question: str, chatbot_answer: str, manual_answer: str) -> Dict[str, Any]:
        """Evaluate chatbot answer against manual answer using ML/NLP techniques"""
        
        # Preprocess texts
        chatbot_clean = self._preprocess_text(chatbot_answer)
        manual_clean = self._preprocess_text(manual_answer)
        
        # Calculate various similarity metrics
        semantic_similarity = self._calculate_semantic_similarity(chatbot_clean, manual_clean)
        bleu_score = self._calculate_bleu_score(chatbot_clean, manual_clean)
        lexical_similarity = self._calculate_lexical_similarity(chatbot_clean, manual_clean)
        
        # Calculate individual scores
        similarity_score = semantic_similarity * 100
        accuracy_score = bleu_score * 100
        completeness_score = self._calculate_completeness(chatbot_clean, manual_clean)
        relevance_score = self._calculate_relevance(question, chatbot_clean)
        
        # Calculate overall score (weighted average)
        overall_score = (
            similarity_score * 0.3 +
            accuracy_score * 0.25 +
            completeness_score * 0.25 +
            relevance_score * 0.2
        )
        
        # Generate explanation
        explanation = self._generate_explanation(
            similarity_score, accuracy_score, completeness_score, relevance_score
        )
        
        return {
            "score": round(overall_score, 2),
            "details": {
                "similarity": round(similarity_score, 2),
                "accuracy": round(accuracy_score, 2),
                "completeness": round(completeness_score, 2),
                "relevance": round(relevance_score, 2)
            },
            "explanation": explanation,
            "metrics": {
                "semantic_similarity": round(semantic_similarity, 4),
                "bleu_score": round(bleu_score, 4),
                "lexical_similarity": round(lexical_similarity, 4)
            }
        }
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        return text
    
    def _calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity using sentence transformers or fallback method"""
        try:
            if self.sentence_model is None:
                # Fallback to simple word overlap similarity
                return self._simple_word_overlap_similarity(text1, text2)
            
            import numpy as np
            from sklearn.metrics.pairwise import cosine_similarity
            
            embeddings = self.sentence_model.encode([text1, text2])
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return max(0.0, similarity)  # Ensure non-negative
        except Exception as e:
            print(f"Error calculating semantic similarity, using fallback: {e}")
            return self._simple_word_overlap_similarity(text1, text2)
    
    def _simple_word_overlap_similarity(self, text1: str, text2: str) -> float:
        """Simple word overlap similarity as fallback"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if len(words1) == 0 and len(words2) == 0:
            return 1.0
        if len(words1) == 0 or len(words2) == 0:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if len(union) > 0 else 0.0
    
    def _calculate_bleu_score(self, candidate: str, reference: str) -> float:
        """Calculate BLEU score or simple n-gram similarity"""
        try:
            # Try to use NLTK BLEU
            import nltk
            from nltk.translate.bleu_score import sentence_bleu
            
            candidate_tokens = candidate.split()
            reference_tokens = [reference.split()]  # BLEU expects list of references
            
            if len(candidate_tokens) == 0 or len(reference_tokens[0]) == 0:
                return 0.0
            
            # Calculate BLEU score with smoothing
            score = sentence_bleu(reference_tokens, candidate_tokens, smoothing_function=nltk.translate.bleu_score.SmoothingFunction().method1)
            return score
        except Exception as e:
            print(f"NLTK not available, using simple n-gram similarity: {e}")
            return self._simple_ngram_similarity(candidate, reference)
    
    def _simple_ngram_similarity(self, candidate: str, reference: str) -> float:
        """Simple n-gram similarity as fallback for BLEU"""
        candidate_words = candidate.lower().split()
        reference_words = reference.lower().split()
        
        if len(candidate_words) == 0 or len(reference_words) == 0:
            return 0.0
        
        # Calculate 1-gram, 2-gram precision
        scores = []
        
        for n in [1, 2]:
            candidate_ngrams = self._get_ngrams(candidate_words, n)
            reference_ngrams = self._get_ngrams(reference_words, n)
            
            if len(candidate_ngrams) == 0:
                scores.append(0.0)
                continue
            
            matches = sum(min(candidate_ngrams.count(ngram), reference_ngrams.count(ngram)) 
                         for ngram in set(candidate_ngrams))
            precision = matches / len(candidate_ngrams)
            scores.append(precision)
        
        # Return average of 1-gram and 2-gram precision
        return sum(scores) / len(scores) if scores else 0.0
    
    def _get_ngrams(self, words, n):
        """Get n-grams from word list"""
        return [tuple(words[i:i+n]) for i in range(len(words)-n+1)]
    
    def _calculate_lexical_similarity(self, text1: str, text2: str) -> float:
        """Calculate lexical similarity using word overlap"""
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if len(words1) == 0 and len(words2) == 0:
            return 1.0
        if len(words1) == 0 or len(words2) == 0:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if len(union) > 0 else 0.0
    
    def _calculate_completeness(self, chatbot_answer: str, manual_answer: str) -> float:
        """Calculate completeness based on length and content coverage"""
        manual_words = set(manual_answer.split())
        chatbot_words = set(chatbot_answer.split())
        
        if len(manual_words) == 0:
            return 100.0 if len(chatbot_words) == 0 else 50.0
        
        # Calculate coverage of manual answer concepts
        coverage = len(manual_words.intersection(chatbot_words)) / len(manual_words)
        
        # Consider length ratio
        length_ratio = min(len(chatbot_answer) / max(len(manual_answer), 1), 1.0)
        
        # Combine coverage and length
        completeness = (coverage * 0.7 + length_ratio * 0.3) * 100
        return min(completeness, 100.0)
    
    def _calculate_relevance(self, question: str, answer: str) -> float:
        """Calculate relevance of answer to question"""
        try:
            if self.sentence_model is None:
                # Fallback to simple word overlap
                question_words = set(question.lower().split())
                answer_words = set(answer.lower().split())
                
                if len(question_words) == 0:
                    return 100.0
                
                overlap = len(question_words.intersection(answer_words))
                return (overlap / len(question_words)) * 100
            
            # Use semantic similarity between question and answer
            embeddings = self.sentence_model.encode([question.lower(), answer.lower()])
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return max(0.0, similarity * 100)
        except Exception as e:
            print(f"Error calculating relevance: {e}")
            return 50.0  # Default moderate relevance
    
    def _generate_explanation(self, similarity: float, accuracy: float, 
                            completeness: float, relevance: float) -> str:
        """Generate human-readable explanation of the evaluation"""
        explanations = []
        
        # Similarity assessment
        if similarity >= 80:
            explanations.append("High semantic similarity with ground truth")
        elif similarity >= 60:
            explanations.append("Moderate semantic similarity")
        else:
            explanations.append("Low semantic similarity with ground truth")
        
        # Accuracy assessment
        if accuracy >= 70:
            explanations.append("good lexical overlap")
        elif accuracy >= 40:
            explanations.append("moderate lexical overlap")
        else:
            explanations.append("limited lexical overlap")
        
        # Completeness assessment
        if completeness >= 80:
            explanations.append("comprehensive coverage of key concepts")
        elif completeness >= 60:
            explanations.append("adequate coverage of concepts")
        else:
            explanations.append("incomplete coverage of key concepts")
        
        # Relevance assessment
        if relevance >= 80:
            explanations.append("highly relevant to the question")
        elif relevance >= 60:
            explanations.append("moderately relevant")
        else:
            explanations.append("limited relevance to the question")
        
        return f"ML Analysis: {', '.join(explanations)}."