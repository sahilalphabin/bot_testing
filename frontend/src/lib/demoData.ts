import { Evaluation } from '@/types';
import { LocalStorageManager } from './localStorage';

export const generateDemoData = () => {
  const demoEvaluations: Evaluation[] = [
    {
      id: 'demo_1',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      question: {
        id: 'q1',
        text: 'How do you evaluate the factual accuracy of LLM responses?',
        category: 'general',
        difficulty: 'medium'
      },
      chatbot_answer: 'To evaluate factual accuracy of LLM responses, you can use automated fact-checking tools, compare against reliable sources, implement retrieval-augmented generation, and use human evaluation benchmarks.',
      manual_answer: 'Evaluating factual accuracy in LLM responses requires multiple approaches: automated fact-checking systems, verification against authoritative knowledge bases, retrieval-augmented generation for source verification, human evaluation benchmarks, and consistency checks across multiple generations.',
      evaluation_results: {
        ml_score: 85.2,
        gemini_score: 88.5,
        combined_score: 86.85,
        details: {
          similarity: 87.3,
          completeness: 82.1,
          accuracy: 89.4,
          relevance: 91.2
        },
        explanations: {
          ml_explanation: 'High semantic similarity with ground truth, good lexical overlap, comprehensive coverage of key concepts.',
          gemini_explanation: 'Excellent definition that captures the core essence of AI. Well-structured and accurate response with good coverage of key concepts.'
        }
      },
      metadata: {
        processing_time: 2.34,
        created_by: 'demo'
      }
    },
    {
      id: 'demo_2', 
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      question: {
        id: 'q2',
        text: 'How do you test for hallucination in language model outputs?',
        category: 'technical',
        difficulty: 'hard'
      },
      chatbot_answer: 'Testing for hallucination involves comparing generated content against verified sources, using consistency checks, implementing retrieval-augmented approaches, and deploying automated detection systems.',
      manual_answer: 'Testing for hallucination in LLM outputs requires multiple strategies: source verification against authoritative databases, consistency checking across multiple generations, retrieval-augmented validation, automated hallucination detection models, human evaluation protocols, and factual accuracy benchmarks.',
      evaluation_results: {
        ml_score: 76.8,
        gemini_score: 79.2,
        combined_score: 78.0,
        details: {
          similarity: 78.5,
          completeness: 71.2,
          accuracy: 82.3,
          relevance: 85.7
        },
        explanations: {
          ml_explanation: 'Moderate semantic similarity, adequate coverage of concepts, could benefit from more detail about learning mechanisms.',
          gemini_explanation: 'Good foundational explanation but lacks depth in describing the learning process and layer organization.'
        }
      },
      metadata: {
        processing_time: 3.12,
        created_by: 'demo'
      }
    },
    {
      id: 'demo_3',
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      question: {
        id: 'q3',
        text: 'What are red teaming techniques for LLM safety evaluation?',
        category: 'safety',
        difficulty: 'medium'
      },
      chatbot_answer: 'Red teaming for LLM safety involves adversarial prompting, jailbreaking attempts, bias testing, and systematic exploration of harmful output generation.',
      manual_answer: 'Red teaming techniques for LLM safety evaluation include adversarial prompting to elicit harmful content, jailbreaking attempts to bypass safety guardrails, systematic bias testing across demographics, prompt injection testing, social engineering simulations, and coordinated multi-turn attack scenarios.',
      evaluation_results: {
        ml_score: 72.4,
        gemini_score: 75.8,
        combined_score: 74.1,
        details: {
          similarity: 74.8,
          completeness: 68.5,
          accuracy: 79.2,
          relevance: 82.3
        },
        explanations: {
          ml_explanation: 'Good coverage of main safety topics but missing some critical concerns like autonomous weapons and transparency.',
          gemini_explanation: 'Solid overview of key safety issues but could be more comprehensive in covering all major risks.'
        }
      },
      metadata: {
        processing_time: 2.87,
        created_by: 'demo'
      }
    },
    {
      id: 'demo_4',
      timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      question: {
        id: 'q4',
        text: 'What is few-shot prompting and how does it work?',
        category: 'general',
        difficulty: 'easy'
      },
      chatbot_answer: 'Few-shot prompting is providing a language model with a few examples of the desired task format before asking it to perform a similar task.',
      manual_answer: 'Few-shot prompting is a technique where you provide a language model with a small number of examples (typically 1-10) of the desired input-output format in the prompt, allowing the model to understand and replicate the pattern for new inputs without additional training.',
      evaluation_results: {
        ml_score: 91.3,
        gemini_score: 93.7,
        combined_score: 92.5,
        details: {
          similarity: 92.1,
          completeness: 88.9,
          accuracy: 94.2,
          relevance: 95.3
        },
        explanations: {
          ml_explanation: 'Excellent semantic similarity, clear and concise explanation that captures the essence of machine learning.',
          gemini_explanation: 'Outstanding simple explanation that perfectly captures what machine learning is in accessible terms.'
        }
      },
      metadata: {
        processing_time: 1.95,
        created_by: 'demo'
      }
    },
    {
      id: 'demo_5',
      timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      question: {
        id: 'q5',
        text: 'Design a comprehensive test suite for evaluating chatbot empathy.',
        category: 'creative',
        difficulty: 'hard'
      },
      chatbot_answer: 'A comprehensive empathy test suite would include emotional recognition tasks, appropriate response scenarios, tone matching exercises, and contextual understanding assessments.',
      manual_answer: 'A comprehensive empathy evaluation framework should include: emotional state recognition tasks, contextual appropriateness assessments, tone and sentiment matching exercises, supportive response generation tests, crisis scenario handling, cultural sensitivity evaluations, and longitudinal empathy consistency measurements across diverse conversation contexts.',
      evaluation_results: {
        ml_score: 81.6,
        gemini_score: 84.2,
        combined_score: 82.9,
        details: {
          similarity: 83.4,
          completeness: 79.1,
          accuracy: 86.7,
          relevance: 88.2
        },
        explanations: {
          ml_explanation: 'Good technical accuracy and relevance, but could benefit from mentioning the relationship to machine learning.',
          gemini_explanation: 'Accurate but somewhat brief. Good core explanation but missing context about being a subset of ML.'
        }
      },
      metadata: {
        processing_time: 2.65,
        created_by: 'demo'
      }
    }
  ];

  // Save demo data to localStorage
  LocalStorageManager.saveEvaluations(demoEvaluations);
  
  return demoEvaluations;
};