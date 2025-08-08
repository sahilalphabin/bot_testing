import asyncio
import re
import math
import os
import json
from typing import Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import textstat
from contextlib import suppress

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer  # type: ignore
except Exception:
    SentimentIntensityAnalyzer = None  # type: ignore

try:
    import language_tool_python  # type: ignore
except Exception:
    language_tool_python = None  # type: ignore

class LightweightMLEvaluator:
    def __init__(self):
        """Initialize lightweight ML evaluator with multiple approaches"""
        self.onnx_model = None
        self.spacy_model = None
        self.tfidf_vectorizer = None
        self.initialize_models()
    
    def initialize_models(self):
        """Initialize all lightweight models"""
        print("Initializing lightweight ML models...")
        
        # Initialize TF-IDF vectorizer (always available)
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            lowercase=True
        )
        
        # Try to initialize ONNX Runtime model
        self._initialize_onnx_model()
        
        # Try to initialize spaCy model
        self._initialize_spacy_model()
        
        print(f"Models initialized - ONNX: {self.onnx_model is not None}, spaCy: {self.spacy_model is not None}")
    
    def _initialize_onnx_model(self):
        """Initialize ONNX Runtime sentence transformer"""
        try:
            import onnxruntime as ort
            import requests
            
            # Download ONNX model if not exists (all-MiniLM-L6-v2)
            model_path = "models/sentence_model.onnx"
            tokenizer_path = "models/tokenizer.json"
            
            if not os.path.exists(model_path):
                print("ONNX model not found. Using other methods.")
                return
                
            # Load ONNX model
            self.onnx_session = ort.InferenceSession(model_path)
            print("ONNX model loaded successfully")
            
        except Exception as e:
            print(f"ONNX Runtime not available: {e}")
            self.onnx_model = None
    
    def _initialize_spacy_model(self):
        """Initialize spaCy medium model"""
        try:
            import spacy
            
            # Try to load medium model
            try:
                self.spacy_model = spacy.load("en_core_web_md")
                print("spaCy medium model loaded successfully")
            except OSError:
                print("spaCy medium model not found. Install with: python -m spacy download en_core_web_md")
                self.spacy_model = None
                
        except ImportError:
            print("spaCy not available")
            self.spacy_model = None
    
    async def evaluate(self, question: str, chatbot_answer: str, manual_answer: str) -> Dict[str, Any]:
        """Evaluate using all available lightweight methods and average results"""
        
        # Preprocess texts
        chatbot_clean = self._preprocess_text(chatbot_answer)
        manual_clean = self._preprocess_text(manual_answer)
        question_clean = self._preprocess_text(question)
        
        # Collect similarity scores from all methods
        similarities = []
        method_scores = {}
        
        # Method 1: ONNX Runtime embeddings
        onnx_score = self._calculate_onnx_similarity(chatbot_clean, manual_clean)
        if onnx_score is not None:
            similarities.append(onnx_score)
            method_scores['onnx'] = onnx_score
        
        # Method 2: spaCy embeddings
        spacy_score = self._calculate_spacy_similarity(chatbot_clean, manual_clean)
        if spacy_score is not None:
            similarities.append(spacy_score)
            method_scores['spacy'] = spacy_score
        
        # Method 3: TF-IDF similarity (always available)
        tfidf_score = self._calculate_tfidf_similarity(chatbot_clean, manual_clean)
        similarities.append(tfidf_score)
        method_scores['tfidf'] = tfidf_score
        
        # Method 4: Custom lightweight scoring
        custom_score = self._calculate_custom_similarity(chatbot_clean, manual_clean)
        similarities.append(custom_score)
        method_scores['custom'] = custom_score
        
        # Calculate unified similarity score
        unified_similarity = np.mean(similarities) if similarities else 0.0
        
        # Calculate other metrics
        accuracy_score = self._calculate_accuracy_score(chatbot_clean, manual_clean)
        completeness_score = self._calculate_completeness(chatbot_clean, manual_clean, question_clean)
        relevance_score = self._calculate_relevance(question_clean, chatbot_clean)
        readability_score = self._calculate_readability(chatbot_answer)

        # Additional lightweight dimensions
        clarity_score, grammar_issues_count = self._calculate_clarity(chatbot_answer)
        sentiment_score, sentiment_compound = self._calculate_sentiment(chatbot_answer)
        toxicity_score, toxicity_hits = self._estimate_toxicity(chatbot_answer)
        bias_score = self._estimate_bias(chatbot_answer)
        intent_match_score, intent_probs = self._estimate_intent(question_clean, chatbot_clean)
        factual_consistency_score, retrieval_hits = self._estimate_factual_consistency(question_clean, chatbot_clean, manual_clean)
        
        # Calculate weighted overall score
        weights = {
            'similarity': 0.25,
            'accuracy': 0.15,
            'completeness': 0.15,
            'relevance': 0.10,
            'readability': 0.05,
            'clarity': 0.10,
            'sentiment': 0.05,
            'toxicity': -0.10,
            'bias': -0.05,
            'intent_match': 0.05,
            'factual_consistency': 0.15,
        }

        overall_score = self._calculate_unified_score(
            unified_similarity,
            accuracy_score,
            completeness_score,
            relevance_score,
            readability_score,
            clarity_score,
            sentiment_score,
            toxicity_score,
            bias_score,
            intent_match_score,
            factual_consistency_score,
            weights
        )
        
        # Generate explanation
        explanation = self._generate_explanation(
            unified_similarity * 100,
            accuracy_score,
            completeness_score,
            relevance_score,
            method_scores
        )
        
        ml_details = {
            "similarity": round(unified_similarity * 100, 2),
            "accuracy": round(accuracy_score, 2),
            "completeness": round(completeness_score, 2),
            "relevance": round(relevance_score, 2),
            "clarity": round(clarity_score, 2),
            "readability": round(readability_score, 2),
            "toxicity": round(toxicity_score, 2),
            "bias": round(bias_score, 2),
            "sentiment": round(sentiment_score, 2),
            "intent_match": round(intent_match_score, 2),
            "factual_consistency": round(factual_consistency_score, 2),
        }

        ml_metrics = {
            "unified_similarity": round(unified_similarity, 4),
            "readability_score": round(readability_score, 2),
            "method_scores": {k: round(v, 4) for k, v in method_scores.items()},
            "methods_used": len(similarities),
            "tfidf_sim": round(tfidf_score, 4),
            "spacy_sim": round(spacy_score, 4) if spacy_score is not None else None,
            "precision": None,  # filled below
            "recall": None,
            "f1": None,
            "jaccard": None,
            "ngram_overlap": None,
            "char_overlap": None,
            "readability_raw": round(readability_score, 2),
            "grammar_errors": grammar_issues_count,
            "sentiment_compound": round(sentiment_compound, 4),
            "toxicity_hits": toxicity_hits,
            "intent_probs": intent_probs,
            "factual_hits_count": len(retrieval_hits),
        }

        # Fill metric internals where computable
        with suppress(Exception):
            words1 = set(chatbot_clean.split()); words2 = set(manual_clean.split())
            inter = len(words1.intersection(words2)); union = max(len(words1.union(words2)), 1)
            jacc = inter / union
            ml_metrics["jaccard"] = round(jacc, 4)
        with suppress(Exception):
            # 2-gram overlap as representative ngram measure
            n1 = set(self._get_ngrams(chatbot_clean.split(), 2)); n2 = set(self._get_ngrams(manual_clean.split(), 2))
            ml_metrics["ngram_overlap"] = round(len(n1.intersection(n2)) / max(len(n1.union(n2)), 1), 4)
        with suppress(Exception):
            # char overlap already done in custom similarity but compute again quickly
            chars1 = set(chatbot_clean); chars2 = set(manual_clean)
            ml_metrics["char_overlap"] = round(len(chars1.intersection(chars2)) / max(len(chars1.union(chars2)), 1), 4)
        with suppress(Exception):
            chatbot_words = set(chatbot_clean.split()); manual_words = set(manual_clean.split())
            precision = len(chatbot_words.intersection(manual_words)) / max(len(chatbot_words), 1)
            recall = len(chatbot_words.intersection(manual_words)) / max(len(manual_words), 1)
            f1 = (2 * precision * recall) / max((precision + recall), 1e-6)
            ml_metrics["precision"] = round(precision, 4)
            ml_metrics["recall"] = round(recall, 4)
            ml_metrics["f1"] = round(f1, 4)

        trace = {
            "ml": {
                "retrieval_hits": retrieval_hits,
                "grammar_issues_count": grammar_issues_count,
            },
        }

        return {
            "score": round(overall_score, 2),
            "details": ml_details,
            "explanation": explanation,
            "metrics": ml_metrics,
            "trace": trace,
            "weights": weights,
        }
    
    def _preprocess_text(self, text: str) -> str:
        """Enhanced text preprocessing"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:-]', '', text)
        # Remove common filler words
        text = re.sub(r'\b(um|uh|like|you know|actually|basically)\b', '', text)
        
        return text
    
    def _calculate_onnx_similarity(self, text1: str, text2: str) -> Optional[float]:
        """Calculate similarity using ONNX Runtime model"""
        try:
            if self.onnx_model is None:
                return None
            
            # This would require actual ONNX model implementation
            # For now, return None to use other methods
            return None
            
        except Exception as e:
            print(f"ONNX similarity calculation failed: {e}")
            return None
    
    def _calculate_spacy_similarity(self, text1: str, text2: str) -> Optional[float]:
        """Calculate similarity using spaCy word vectors"""
        try:
            if self.spacy_model is None:
                return None
            
            doc1 = self.spacy_model(text1)
            doc2 = self.spacy_model(text2)
            
            # Use spaCy's built-in similarity
            similarity = doc1.similarity(doc2)
            
            return max(0.0, similarity)
            
        except Exception as e:
            print(f"spaCy similarity calculation failed: {e}")
            return None
    
    def _calculate_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity using TF-IDF vectors"""
        try:
            if not text1.strip() or not text2.strip():
                return 0.0
            
            # Fit TF-IDF on both texts
            tfidf_matrix = self.tfidf_vectorizer.fit_transform([text1, text2])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return max(0.0, similarity)
            
        except Exception as e:
            print(f"TF-IDF similarity calculation failed: {e}")
            return 0.0
    
    def _calculate_custom_similarity(self, text1: str, text2: str) -> float:
        """Custom lightweight similarity calculation"""
        if not text1 or not text2:
            return 0.0
        
        # Multiple similarity measures
        scores = []
        
        # 1. Word overlap similarity
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if words1 or words2:
            jaccard = len(words1.intersection(words2)) / len(words1.union(words2))
            scores.append(jaccard)
        
        # 2. N-gram overlap (2-grams and 3-grams)
        for n in [2, 3]:
            ngrams1 = self._get_ngrams(text1.split(), n)
            ngrams2 = self._get_ngrams(text2.split(), n)
            
            if ngrams1 or ngrams2:
                ngram_jaccard = len(set(ngrams1).intersection(set(ngrams2))) / max(len(set(ngrams1).union(set(ngrams2))), 1)
                scores.append(ngram_jaccard)
        
        # 3. Character-level similarity (for typos and variations)
        char_sim = self._calculate_character_similarity(text1, text2)
        scores.append(char_sim)
        
        # 4. Length ratio similarity
        len1, len2 = len(text1), len(text2)
        if len1 > 0 and len2 > 0:
            length_sim = min(len1, len2) / max(len1, len2)
            scores.append(length_sim)
        
        return np.mean(scores) if scores else 0.0
    
    def _calculate_character_similarity(self, text1: str, text2: str) -> float:
        """Calculate character-level similarity using simple edit distance"""
        if not text1 or not text2:
            return 0.0
        
        # Simple character overlap
        chars1 = set(text1)
        chars2 = set(text2)
        
        if not chars1 and not chars2:
            return 1.0
        
        if not chars1 or not chars2:
            return 0.0
        
        return len(chars1.intersection(chars2)) / len(chars1.union(chars2))
    
    def _get_ngrams(self, words, n):
        """Get n-grams from word list"""
        return [tuple(words[i:i+n]) for i in range(len(words)-n+1)]
    
    def _calculate_accuracy_score(self, chatbot_answer: str, manual_answer: str) -> float:
        """Calculate accuracy using multiple lexical measures"""
        if not chatbot_answer or not manual_answer:
            return 0.0
        
        scores = []
        
        # Word-level precision and recall
        chatbot_words = set(chatbot_answer.split())
        manual_words = set(manual_answer.split())
        
        if manual_words:
            precision = len(chatbot_words.intersection(manual_words)) / max(len(chatbot_words), 1)
            recall = len(chatbot_words.intersection(manual_words)) / len(manual_words)
            f1 = 2 * precision * recall / max(precision + recall, 0.001)
            scores.extend([precision, recall, f1])
        
        # BLEU-like score
        bleu_score = self._simple_bleu_score(chatbot_answer, manual_answer)
        scores.append(bleu_score)
        
        return np.mean(scores) * 100 if scores else 0.0
    
    def _simple_bleu_score(self, candidate: str, reference: str) -> float:
        """Simple BLEU-like score"""
        candidate_words = candidate.split()
        reference_words = reference.split()
        
        if not candidate_words or not reference_words:
            return 0.0
        
        # 1-gram and 2-gram precision
        scores = []
        for n in [1, 2]:
            candidate_ngrams = self._get_ngrams(candidate_words, n)
            reference_ngrams = self._get_ngrams(reference_words, n)
            
            if candidate_ngrams:
                matches = sum(1 for ngram in candidate_ngrams if ngram in reference_ngrams)
                precision = matches / len(candidate_ngrams)
                scores.append(precision)
        
        return np.mean(scores) if scores else 0.0
    
    def _calculate_completeness(self, chatbot_answer: str, manual_answer: str, question: str) -> float:
        """Calculate completeness based on content coverage and context"""
        if not manual_answer:
            return 100.0 if not chatbot_answer else 50.0
        
        # Key concept coverage
        manual_words = set(manual_answer.split())
        chatbot_words = set(chatbot_answer.split())
        question_words = set(question.split())
        
        # Coverage of manual answer concepts
        concept_coverage = len(manual_words.intersection(chatbot_words)) / max(len(manual_words), 1)
        
        # Question context coverage
        question_coverage = len(question_words.intersection(chatbot_words)) / max(len(question_words), 1)
        
        # Length adequacy
        length_ratio = min(len(chatbot_answer) / max(len(manual_answer), 1), 2.0) / 2.0
        
        # Information density
        unique_words_ratio = len(set(chatbot_answer.split())) / max(len(chatbot_answer.split()), 1)
        
        completeness = (
            concept_coverage * 0.4 +
            question_coverage * 0.2 +
            length_ratio * 0.2 +
            unique_words_ratio * 0.2
        ) * 100
        
        return min(completeness, 100.0)
    
    def _calculate_relevance(self, question: str, answer: str) -> float:
        """Calculate relevance using multiple approaches"""
        if not question or not answer:
            return 0.0
        
        scores = []
        
        # Word overlap relevance
        question_words = set(question.lower().split())
        answer_words = set(answer.lower().split())
        
        if question_words:
            word_overlap = len(question_words.intersection(answer_words)) / len(question_words)
            scores.append(word_overlap)
        
        # TF-IDF relevance
        try:
            tfidf_sim = self._calculate_tfidf_similarity(question, answer)
            scores.append(tfidf_sim)
        except:
            pass
        
        # spaCy relevance if available
        spacy_sim = self._calculate_spacy_similarity(question, answer)
        if spacy_sim is not None:
            scores.append(spacy_sim)
        
        return np.mean(scores) * 100 if scores else 50.0
    
    def _calculate_readability(self, text: str) -> float:
        """Calculate readability score"""
        try:
            if not text:
                return 0.0
            
            # Use textstat for readability
            flesch_score = textstat.flesch_reading_ease(text)
            
            # Convert to 0-100 scale where higher is better
            readability = max(0, min(100, flesch_score))
            
            return readability
            
        except Exception as e:
            print(f"Readability calculation failed: {e}")
            return 50.0
    
    def _calculate_unified_score(self, similarity: float, accuracy: float, 
                               completeness: float, relevance: float, readability: float,
                               clarity: float, sentiment: float, toxicity: float, bias: float,
                               intent_match: float, factual_consistency: float,
                               weights: Dict[str, float]) -> float:
        """Calculate unified score using weighted average"""
        # Base weighted sum
        score = (
            similarity * 100 * weights['similarity'] +
            accuracy * weights['accuracy'] +
            completeness * weights['completeness'] +
            relevance * weights['relevance'] +
            readability * weights['readability'] +
            clarity * weights['clarity'] +
            sentiment * weights['sentiment'] +
            (100 - toxicity) * abs(weights['toxicity']) +  # penalize toxicity
            (100 - bias) * abs(weights['bias']) +           # penalize bias
            intent_match * weights['intent_match'] +
            factual_consistency * weights['factual_consistency']
        )

        # Guardrails
        if toxicity > 60:
            score = min(score, 40.0)
        if factual_consistency < 30:
            score = min(score, 50.0)

        return float(min(max(score, 0.0), 100.0))

    def _calculate_clarity(self, text: str) -> tuple[float, int]:
        """Estimate clarity via grammar error rate using LanguageTool if available."""
        if not text:
            return 0.0, 0
        if language_tool_python is None:
            return 70.0, 0
        try:
            tool = language_tool_python.LanguageToolPublicAPI('en-US')
            matches = tool.check(text)
            count = len(matches)
            # Normalize to 0-100 where fewer errors -> higher clarity
            length = max(len(text.split()), 1)
            error_rate = count / length
            clarity = max(0.0, 100.0 - min(100.0, error_rate * 400))
            return clarity, count
        except Exception:
            return 70.0, 0

    def _calculate_sentiment(self, text: str) -> tuple[float, float]:
        """VADER sentiment mapped to 0-100."""
        if not text or SentimentIntensityAnalyzer is None:
            return 50.0, 0.0
        try:
            analyzer = SentimentIntensityAnalyzer()
            compound = analyzer.polarity_scores(text).get('compound', 0.0)
            score = (compound + 1) * 50.0
            return float(score), float(compound)
        except Exception:
            return 50.0, 0.0

    def _estimate_toxicity(self, text: str) -> tuple[float, list[str]]:
        """Lightweight heuristic toxicity estimate using a small lexicon."""
        if not text:
            return 0.0, []
        toxic_terms = [
            "stupid","idiot","hate","kill","racist","sexist","dumb","trash","shut up"
        ]
        found = [w for w in toxic_terms if w in text.lower()]
        score = min(100.0, len(found) * 15.0)
        return score, found

    def _estimate_bias(self, text: str) -> float:
        """Very rough bias proxy via keyword hits; extend with better lists later."""
        if not text:
            return 0.0
        biased_terms = ["always", "never", "obviously", "clearly"]
        hits = sum(1 for w in biased_terms if w in text.lower())
        return min(100.0, hits * 10.0)

    def _estimate_intent(self, question: str, answer: str) -> tuple[float, Dict[str, float]]:
        """Heuristic intent match: overlap-based probabilities among a small label set."""
        labels = ["qa","safety","creative","technical"]
        q = set(question.split()); a = set(answer.split())
        probs = {
            "qa": float(len(q.intersection(a)) / max(len(q), 1)),
            "safety": 0.1 if any(w in a for w in ["danger","illegal","harm"]) else 0.0,
            "creative": 0.2 if any(w in a for w in ["story","poem","creative"]) else 0.0,
            "technical": 0.2 if any(w in a for w in ["algorithm","complexity","code","api"]) else 0.0,
        }
        # Normalize simplistic distribution
        total = sum(probs.values()) or 1.0
        probs = {k: v / total for k, v in probs.items()}
        intent_match = probs.get("qa", 0.0) * 100.0
        return intent_match, probs

    def _estimate_factual_consistency(self, question: str, answer: str, manual: str) -> tuple[float, list[Dict[str, Any]]]:
        """Quick retrieval proxy using TF-IDF over provided texts (manual as KB)."""
        try:
            docs = [manual, question]
            if not any(docs):
                return 50.0, []
            vec = TfidfVectorizer(stop_words='english')
            mat = vec.fit_transform(docs + [answer])
            sim_to_manual = cosine_similarity(mat[2:3], mat[0:1])[0][0]
            sim_to_question = cosine_similarity(mat[2:3], mat[1:2])[0][0]
            score = float(np.mean([sim_to_manual, sim_to_question]) * 100.0)
            hits = [
                {"source": "manual", "title": "Ground Truth", "snippet": manual[:160], "score": round(sim_to_manual, 4)},
                {"source": "question", "title": "Prompt", "snippet": question[:160], "score": round(sim_to_question, 4)},
            ]
            return score, hits
        except Exception:
            return 50.0, []
    
    def _generate_explanation(self, similarity: float, accuracy: float, 
                            completeness: float, relevance: float, method_scores: Dict[str, float]) -> str:
        """Generate comprehensive explanation"""
        
        explanations = []
        
        # Overall similarity assessment
        if similarity >= 80:
            explanations.append("Excellent semantic similarity")
        elif similarity >= 60:
            explanations.append("Good semantic similarity")
        elif similarity >= 40:
            explanations.append("Moderate semantic similarity")
        else:
            explanations.append("Low semantic similarity")
        
        # Method-specific insights
        methods_used = []
        if 'spacy' in method_scores:
            methods_used.append("spaCy embeddings")
        if 'tfidf' in method_scores:
            methods_used.append("TF-IDF analysis")
        if 'onnx' in method_scores:
            methods_used.append("ONNX embeddings")
        methods_used.append("custom similarity")
        
        explanations.append(f"analyzed using {', '.join(methods_used)}")
        
        # Performance insights
        if accuracy >= 70:
            explanations.append("strong lexical overlap")
        elif accuracy >= 50:
            explanations.append("moderate lexical overlap")
        else:
            explanations.append("limited lexical overlap")
        
        if completeness >= 80:
            explanations.append("comprehensive content coverage")
        elif completeness >= 60:
            explanations.append("adequate content coverage")
        else:
            explanations.append("incomplete content coverage")
        
        if relevance >= 80:
            explanations.append("highly relevant to question")
        elif relevance >= 60:
            explanations.append("moderately relevant")
        else:
            explanations.append("limited relevance")
        
        return f"Lightweight ML Analysis: {', '.join(explanations)}."