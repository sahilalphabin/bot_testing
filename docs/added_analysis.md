## Evaluation System – Detailed Documentation (No PyTorch)

This document explains what we compute, how we compute it (lightweight ML + LLM judge), how the score is formed, and the exact API fields returned to the frontend.

---

## 1) Core Evaluation Dimensions

All dimensions are normalized to 0–100 unless noted.

### A) Correctness (Similarity/Accuracy)

* **What**: Whether the output matches factual ground truth or expected answers.
* **How to do it**:

  * Exact string match.
  * Levenshtein distance for near-match.
  * Semantic similarity (embedding distance).
  * Retrieval-Augmented Verification (look up references).
* **Tech**:

  * **sentence-transformers** (without torch, use `onnxruntime` or `sentence-transformers` with TF backends)
  * **FAISS** (approx nearest neighbors)
  * **ElasticSearch / OpenSearch** (vector similarity search)

---

### B) Relevance

* **What**: Whether the output is on-topic and addresses the prompt.
* **How to do it**:

  * Embedding cosine similarity with query.
  * Keyword matching.
  * Topic modeling (LDA).
* **Tech**:

  * **scikit-learn** (LDA, TF-IDF)
  * **spaCy** (embeddings)
  * **TensorFlow** (embedding models)

---

### C) Clarity & Readability

* **What**: Whether the text is easy to read.
* **How to do it**:

  * Readability metrics (Flesch, Gunning Fog).
  * Grammar and spelling checks.
* **Tech**:

  * **textstat** (readability)
  * **LanguageTool** (grammar)

---

### D) Factual Consistency

* **What**: Whether the content contradicts known facts.
* **How to do it**:

  * Use retrieval-based QA over a knowledge base.
  * Check for hallucination markers.
* **Tech**:

  * **Haystack** (retrieval pipelines)
  * **ElasticSearch + BM25**
  * **Transformers with TensorFlow backend**

---

### E) Toxicity & Bias

* **What**: Whether the text contains hate speech, bias, offensive content.
* **How to do it**:

  * Classification models (e.g., Detoxify).
  * Rule-based heuristics.
* **Tech**:

  * **TensorFlow Detoxify port**
  * **Perspective API** (Google)
  * **scikit-learn**

---

### F) Sentiment

* **What**: Emotional tone of the response.
* **How to do it**:

  * Sentiment classifiers.
  * Lexicon-based scoring.
* **Tech**:

  * **VADER**
  * **TextBlob**
  * **Hugging Face models with TensorFlow**

---

### G) Intent Matching

* **What**: Whether output matches expected intent.
* **How to do it**:

  * Intent classifier trained on labeled intents.
  * Rule-based mapping.
* **Tech**:

  * **scikit-learn**
  * **TensorFlow Keras**

---

---

## 2) Architecture & Components

To **scale** evaluations dynamically, consider these components:

| Layer            | Options                                         |
| ---------------- | ----------------------------------------------- |
| Compute          | Kubernetes (HPA) / AWS Lambda / GCP Cloud Run   |
| Storage          | PostgreSQL / ElasticSearch / Redis              |
| Embedding Store  | ElasticSearch with dense vector support / FAISS |
| Orchestration    | Celery / Argo Workflows / Airflow               |
| API              | FastAPI / Flask                                 |
| Batch Processing | Apache Beam / Spark                             |

This way, **each evaluator** (e.g., Clarity, Sentiment) is a microservice.

---

## 3) Additional Capabilities

Here’s a **checklist of extra modules** to consider building:

### 📌 **Explainability & Trace**

* Save intermediate outputs: embeddings, token matches, classification probabilities.
* Generate per-dimension reports.

**Tech**: JSON logs, Elasticsearch Kibana dashboards.

---

### 📌 **Temporal Drift Monitoring**

* Detect if model answers degrade over time.

**Tech**: Time series metrics, Prometheus, Grafana.

---

### 📌 **Diversity Scoring**

* Measure variation in answers to similar prompts.

**How**: Jaccard similarity across outputs.

---

### 📌 **Prompt Sensitivity**

* Slight prompt changes → big answer change?
* Useful for robustness scoring.

---

### 📌 **Length and Conciseness**

* Penalize overly long / short answers.

---

### 📌 **Entity Consistency**

* Named entities in the output match known references.

**Tech**: spaCy NER.

---

### 📌 **Custom Business Rules**

* E.g., no disclaimers, must cite sources.

---

---

## 4) Technologies (No Torch)

**Embedding + ML**:

* TensorFlow / TF Lite
* ONNX Runtime (convert models)
* scikit-learn
* spaCy

**Vector Search**:

* ElasticSearch (dense vectors)
* FAISS

**NLP Utilities**:

* NLTK
* TextBlob
* textstat
* LanguageTool

**Distributed / Batch Processing**:

* Apache Beam
* Dask
* Spark NLP (on Spark clusters)

**Serving / APIs**:

* FastAPI (async)
* Flask

---

## 5) Pipeline (end-to-end)

Here’s a typical **evaluation flow**:

1. **Preprocess**: Clean & normalize text.
2. **Embed**: Generate vector representations.
3. **Similarity**: Compare to expected answers.
4. **Classify**: Toxicity, sentiment, correctness.
5. **Score**: Weight & combine metrics.
6. **Store**: Save evaluations.
7. **Report**: ElasticSearch + Kibana dashboards.

---

## 6) Improving Accuracy & Reliability

To **improve evaluation quality**, you can:

* Use **ensemble models**: combine multiple classifiers.
* Keep an **evolving reference set** of correct answers.
* Allow **human-in-the-loop correction**.
* Regularly retrain embedding and classification models.
* Use **external APIs** (e.g., Perspective API) for specialized scoring.

---

## 7) API Schema & Returned Fields

POST `/api/evaluate`

Request
```
{
  "question": string,
  "chatbot_answer": string,
  "manual_answer": string,
  "evaluation_type": "ml" | "gemini" | "both" (optional, default "both")
}
```

Response (core)
```
{
  "ml_score": number | null,
  "gemini_score": number | null,
  "combined_score": number | null,
  "details": { "similarity": number, "completeness": number, "accuracy": number, "relevance": number },
  "explanations": { "ml_explanation": string, "gemini_explanation": string },
  "processing_time": number
}
```

Response (extended)
```
{
  "ml_details": { similarity, accuracy, completeness, relevance, clarity, readability, toxicity, bias, sentiment, intent_match, factual_consistency },
  "ml_metrics": { unified_similarity, method_scores, tfidf_sim, spacy_sim, jaccard, ngram_overlap, char_overlap, precision, recall, f1, readability_raw, grammar_errors, sentiment_compound, toxicity_hits, intent_probs, factual_hits_count },
  "gemini_details": { similarity, accuracy, completeness, relevance, clarity, readability, toxicity, bias, sentiment, intent_match, factual_consistency },
  "gemini_metrics": { method_scores, strengths, weaknesses },
  "trace": { ml: { retrieval_hits, grammar_issues_count }, gemini: { top_k_evidence, hallucination_flags } },
  "weights": { similarity, accuracy, completeness, relevance, readability, clarity, sentiment, toxicity, bias, intent_match, factual_consistency }
}
```

Notes
- `combined_score` currently averages the ML and Gemini overall scores when both are present. Guardrails already applied in the ML path (toxicity/factual caps). This can be replaced by a learned/calibrated scorer later.
- Fields may be null if a path is disabled or the provider is unavailable.

## 8) ML Evaluator Details
File: `backend/services/ml_evaluator_lightweight.py`
- Preprocessing: case-folding, cleanup, filler removal
- Similarity: TF‑IDF cosine + spaCy (if available) + custom multi-metric → unified similarity
- Accuracy: precision/recall/F1 + simple BLEU‑like
- Completeness: manual coverage, question coverage, length adequacy, unique word ratio
- Relevance: overlap + TF‑IDF + spaCy (if available)
- Readability: textstat Flesch
- Clarity: LanguageTool errors → clarity
- Sentiment: VADER
- Toxicity/Bias: heuristics
- Factual: TF‑IDF similarity to manual/question; returns `retrieval_hits`
- Scoring: weighted sum with penalties (toxicity/bias) and guardrails (caps)

## 9) Gemini Evaluator Details
File: `backend/services/gemini_evaluator.py`
- Strict-JSON rubric with dimension scores, method_scores, strengths/weaknesses, evidence, hallucination_flags
- Parser extracts/normalizes and provides structured `details`, `method_scores`, and evidence
- Fallback to mock if API key missing

## 10) Frontend Visualization
- Evaluate page: scores, per-dimension details, method scores, evidence, radar and method charts, toxicity trend
- Dashboard: KPI cards, distribution, ML vs AI chart; uses theme tokens for light/dark

---

This system is torch-free, explainable, and ready for incremental upgrades (RAG verification, learned scorer, self-consistency, calibration).
You can build a robust, elastic NLP/ML evaluation system **without PyTorch** by combining:

✅ scikit-learn for classifiers
✅ TensorFlow/ONNX for embedding models
✅ ElasticSearch for vector similarity
✅ Readability/toxicity/sentiment libraries
✅ Microservices architecture for scalability

---

If you’d like, I can help **design the architecture diagrams, sample code, or scoring formulas** for these modules!
