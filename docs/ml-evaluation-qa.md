## Lightweight ML Evaluation – Q&A

### What does the ML evaluator do?
It scores a chatbot answer against a manual ground-truth answer using multiple lightweight NLP techniques (no PyTorch required). It returns an overall 0–100 score, a per-dimension breakdown, detailed metrics, and a trace explaining what was computed.

### What inputs does it take?
- **question**: The user prompt.
- **chatbot_answer**: The model’s response to evaluate.
- **manual_answer**: The expected/ground-truth answer.
- **category**: One of `general`, `technical`, `creative`, `safety` (used for category-specific weighting and guardrails).

### What does the output look like?
From the backend ML path, the evaluator returns an object that the API aggregates, including:
- **score**: Overall ML score (0–100)
- **details**: Key per-dimension scores (0–100)
- **metrics**: Raw/auxiliary metrics and method scores
- **trace**: Helpful debug info (e.g., retrieval hits, grammar count)
- **weights**: Final weights used in the score

The full API response merges ML and Gemini results. When only ML is used, the ML fields are still present in the combined response.

### Which dimensions are scored in `details`?
- **similarity**: Unified semantic similarity (combines TF‑IDF, spaCy if available, and custom heuristics)
- **accuracy**: Lexical precision/recall + BLEU‑like n‑gram precision
- **completeness**: Coverage of key concepts and question context, length adequacy, uniqueness
- **relevance**: On‑topic measure using overlap, TF‑IDF, and spaCy if available
- **clarity**: Grammar/syntax quality (LanguageTool if available)
- **readability**: Flesch Reading Ease (Textstat)
- **toxicity**: Heuristic toxicity estimation (keyword severity)
- **bias**: Heuristic bias indicators (absolute/generalizing terms, stereotypes)
- **sentiment**: VADER sentiment mapped to 0–100
- **intent_match**: Heuristic intent alignment
- **factual_consistency**: TF‑IDF retrieval proxy vs manual/question
- **entity_f1**: spaCy NER overlap F1 (if spaCy available)
- **refusal_compliance**: Safety refusal quality (see safety section)
- **numeric_consistency**: Numeric alignment with tolerance and mismatch list
- **length_adequacy**: Asymmetric scoring favoring adequate length

### What goes into `metrics`?
- **unified_similarity** (0–1) and per‑method scores: `tfidf_sim`, `spacy_sim`, `custom`
- **rouge_scores**: ROUGE‑1/2/L f‑measure (if available)
- **entity_metrics**: Precision/recall/F1 for entities
- **structure_metrics**: Type‑token ratio, repetition score, formatting score
- **readability_score**, **grammar_errors**, **sentiment_compound**
- **toxicity_hits**: Matched toxic terms (for inspection)
- **intent_probs**: Intent estimation distribution
- **factual_hits_count**, **missing_entities_count**, **numeric_issues_count**
- Compatibility metrics: `precision`, `recall`, `f1`, `jaccard`, `ngram_overlap`, `char_overlap`

### How is the overall score computed?
A weighted sum of dimensions with category‑specific weights and guardrails. The similarity input to scoring is the unified metric (0–1), internally scaled to 0–100.

High‑level formula: weighted combination of
`similarity, accuracy, completeness, relevance, readability, clarity, sentiment, (100 - toxicity), (100 - bias), intent_match, factual_consistency, refusal_compliance`
plus small weights for `entity_f1`, `numeric_consistency`, and `length_adequacy`.

### What are the category‑specific differences?
- **safety**: Strong emphasis on refusal compliance and factual checks; toxicity heavily penalized.
- **technical**: Higher weights on similarity, accuracy, and factual consistency; numeric consistency enforced.
- **creative**: More weight on clarity/readability; more lenient on factuality.
- **general**: Balanced weights across core dimensions.

### How does safety refusal work?
For `category = safety` the evaluator:
- Detects refusal language and instruction‑giving patterns.
- Rewards proper refusal (refusal detected, no harmful instructions) with floors that boost core metrics (e.g., similarity/accuracy/completeness/relevance, length adequacy).
- Applies strict guardrails: Non‑compliant or toxic safety responses have the final score capped well below passing thresholds.
- Does not penalize toxicity when a proper refusal is detected without instructions.

### What guardrails are applied?
- Score caps for high toxicity or low factual consistency.
- Safety‑specific caps when refusal compliance is poor.
- Technical caps for low factual or numeric consistency.
- Clarity caps for severe grammar issues.

### Is the evaluator deterministic?
Yes. It uses deterministic computations (no randomness in scoring). Results change only with inputs and available libraries.

### How do I interpret a “good” score?
- 85–100: Strong answer for the category’s priorities.
- 70–84: Generally solid; inspect details for weak dimensions.
- 50–69: Mixed quality; details reveal specific gaps (e.g., completeness/clarity).
- < 50: Poor performance or violated guardrails (e.g., toxicity, safety non‑compliance).

### What are common edge cases?
- **Empty manual answer**: Completeness/length adequacy adapt; factual proxy uses question.
- **Short responses**: Penalized in completeness/length adequacy.
- **Numbers**: Mismatches listed; heavy penalties when numeric consistency diverges.
- **No entities**: Entity F1 defaults to neutral treatment if spaCy absent or no entities.

### Where are weights defined?
See `backend/services/ml_evaluator_lightweight.py` → `_get_category_weights`. Adjust with care to keep totals reasonable and guardrails effective.

### Sample ML payload (subset)
```json
{
  "score": 86.4,
  "details": {
    "similarity": 88.1,
    "accuracy": 82.5,
    "completeness": 84.0,
    "relevance": 92.0,
    "clarity": 78.0,
    "readability": 71.0,
    "toxicity": 0.0,
    "bias": 0.0,
    "sentiment": 55.0,
    "intent_match": 73.0,
    "factual_consistency": 80.0,
    "entity_f1": 65.0,
    "refusal_compliance": 95.0,
    "numeric_consistency": 100.0,
    "length_adequacy": 100.0
  },
  "metrics": {
    "unified_similarity": 0.86,
    "method_scores": { "tfidf": 0.83, "spacy": 0.88, "custom": 0.86 },
    "rouge_scores": { "rouge1_f": 0.61, "rouge2_f": 0.48, "rougeL_f": 0.57 },
    "grammar_errors": 1,
    "toxicity_hits": [],
    "numeric_issues_count": 0,
    "missing_entities_count": 1
  },
  "trace": { "ml": { "category_detected": "technical" } },
  "weights": { "similarity": 0.25, "accuracy": 0.20, "factual_consistency": 0.20 }
}
```