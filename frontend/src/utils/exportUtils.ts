import { Evaluation } from '@/types';

export function exportToCSV(evaluations: Evaluation[], filename: string = 'evaluations-export.csv') {
  if (evaluations.length === 0) {
    console.warn('No evaluations to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Timestamp',
    'Question Text',
    'Question Category', 
    'Question Difficulty',
    'Chatbot Answer',
    'Manual Answer',
    'ML Score',
    'Gemini Score',
    'Combined Score',
    'Processing Time',
    // Core dimension scores
    'Similarity',
    'Accuracy',
    'Completeness', 
    'Relevance',
    'Clarity',
    'Readability',
    'Toxicity',
    'Bias',
    'Sentiment',
    'Intent Match',
    'Factual Consistency',
    'Entity F1',
    'Refusal Compliance',
    'Numeric Consistency',
    'Length Adequacy',
    // ML Metrics
    'ROUGE-1 F1',
    'ROUGE-2 F1',
    'ROUGE-L F1',
    'Entity Precision',
    'Entity Recall',
    'Entity F1 Score',
    'Type-Token Ratio',
    'Repetition Score',
    'Formatting Score',
    'Grammar Errors',
    'Sentiment Compound',
    'Toxicity Hits Count',
    'Missing Entities Count',
    'Numeric Issues Count',
    'Category Detected',
    // Gemini Metrics
    'Gemini Strengths',
    'Gemini Weaknesses',
    'Hallucination Detected',
    // Trace Info
    'Refusal Detected',
    'Instruction Count',
    'Methods Available'
  ];

  // Convert evaluations to CSV rows
  const rows = evaluations.map(evaluation => {
    const results = evaluation.evaluation_results;
    const mlDetails = results.ml_details || results.details;
    const geminiDetails = results.gemini_details || {};
    const mlMetrics = results.ml_metrics || {};
    const geminiMetrics = results.gemini_metrics || {};
    const trace = results.trace || {};
    const refusalInfo = trace.ml?.refusal_info || {};
    const fallbacks = trace.ml?.fallbacks_used || {};

    return [
      evaluation.id,
      new Date(evaluation.timestamp).toISOString(),
      `"${evaluation.question.text.replace(/"/g, '""')}"`,
      evaluation.question.category,
      evaluation.question.difficulty,
      `"${evaluation.chatbot_answer.replace(/"/g, '""')}"`,
      `"${evaluation.manual_answer.replace(/"/g, '""')}"`,
      results.ml_score || '',
      results.gemini_score || '',
      results.combined_score || '',
      results.processing_time || '',
      // Core dimensions
      mlDetails.similarity || '',
      mlDetails.accuracy || '',
      mlDetails.completeness || '',
      mlDetails.relevance || '',
      mlDetails.clarity || '',
      mlDetails.readability || '',
      mlDetails.toxicity || '',
      mlDetails.bias || '',
      mlDetails.sentiment || '',
      mlDetails.intent_match || '',
      mlDetails.factual_consistency || '',
      mlDetails.entity_f1 || '',
      mlDetails.refusal_compliance || '',
      mlDetails.numeric_consistency || '',
      mlDetails.length_adequacy || '',
      // ML metrics
      mlMetrics.rouge_scores?.rouge1_f || '',
      mlMetrics.rouge_scores?.rouge2_f || '',
      mlMetrics.rouge_scores?.rougeL_f || '',
      mlMetrics.entity_metrics?.precision || '',
      mlMetrics.entity_metrics?.recall || '',
      mlMetrics.entity_metrics?.f1 || '',
      mlMetrics.structure_metrics?.type_token_ratio || '',
      mlMetrics.structure_metrics?.repetition_score || '',
      mlMetrics.structure_metrics?.formatting_score || '',
      mlMetrics.grammar_errors || '',
      mlMetrics.sentiment_compound || '',
      (mlMetrics.toxicity_hits as string[])?.length || '',
      mlMetrics.missing_entities_count || '',
      mlMetrics.numeric_issues_count || '',
      mlMetrics.category || '',
      // Gemini metrics
      `"${(geminiMetrics.strengths as string[])?.join('; ') || ''}"`,
      `"${(geminiMetrics.weaknesses as string[])?.join('; ') || ''}"`,
      geminiMetrics.hallucination_flags?.is_hallucinated || '',
      // Trace info
      refusalInfo.refusal_detected || '',
      refusalInfo.instruction_count || '',
      `spaCy:${fallbacks.spacy_available || false} ROUGE:${fallbacks.rouge_available || false} VADER:${fallbacks.vader_available || false}`
    ];
  });

  // Create CSV content
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportChartDataToCSV(data: any[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    console.warn('No chart data to export');
    return;
  }

  // If headers not provided, use keys from first data item
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Convert data to CSV rows
  const rows = data.map(item => 
    csvHeaders.map(header => {
      const value = item[header];
      // Handle strings that might contain commas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    })
  );

  // Create CSV content
  const csvContent = [csvHeaders.join(','), ...rows.map(row => row.join(','))].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Helper to format timestamp for filename
export function getTimestampedFilename(baseName: string, extension: string = 'csv'): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
  return `${baseName}-${timestamp}.${extension}`;
}