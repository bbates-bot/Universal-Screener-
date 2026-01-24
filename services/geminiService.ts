import { GoogleGenAI } from '@google/genai';
import {
  Question,
  Subject,
  ExtendedQuestion,
  QuestionFormat,
  QuestionSubject,
  DifficultyLevel
} from '../types';
import {
  MATH_STRANDS,
  READING_STRANDS,
  ELA_STRANDS,
  AP_MATH_STRANDS,
  AP_ENGLISH_STRANDS,
  EDEXCEL_MATH_STRANDS,
  EDEXCEL_ENGLISH_STRANDS
} from '../constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Get strands for a subject
 */
const getStrandsForSubject = (subject: Subject | QuestionSubject): string[] => {
  if (subject === 'Math' || subject === 'Mathematics') return MATH_STRANDS;
  if (subject === 'Reading' || subject === 'Reading Foundations' || subject === 'Reading Comprehension') return READING_STRANDS;
  if (subject === 'ELA') return ELA_STRANDS;
  if (subject.includes('AP') && (subject.includes('Calculus') || subject.includes('Statistics') || subject.includes('Precalculus'))) {
    return AP_MATH_STRANDS;
  }
  if (subject.includes('AP') && subject.includes('English')) return AP_ENGLISH_STRANDS;
  if (subject.includes('Edexcel Math')) return EDEXCEL_MATH_STRANDS;
  if (subject.includes('Edexcel English')) return EDEXCEL_ENGLISH_STRANDS;
  return MATH_STRANDS;
};

/**
 * Generate screener questions using Gemini AI
 */
export const generateScreenerQuestions = async (
  grade: string,
  subject: Subject,
  count: number = 10
): Promise<Question[]> => {
  if (!genAI) {
    console.warn('Gemini API key not configured, using fallback questions');
    return generateFallbackQuestions(grade, subject, count);
  }

  const strands = getStrandsForSubject(subject);
  const prompt = buildQuestionPrompt(grade, subject, strands, count);

  try {
    const model = genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    const response = await model;
    const text = response.text || '';

    return parseGeneratedQuestions(text, strands);
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    return generateFallbackQuestions(grade, subject, count);
  }
};

/**
 * Generate hybrid question set (static + AI generated)
 */
export const generateHybridQuestionSet = async (
  grade: string,
  subject: QuestionSubject,
  targetCount: number,
  existingQuestions: ExtendedQuestion[]
): Promise<ExtendedQuestion[]> => {
  const neededCount = targetCount - existingQuestions.length;

  if (neededCount <= 0) {
    return existingQuestions.slice(0, targetCount);
  }

  // Map QuestionSubject to Subject
  const subjectMap: Record<QuestionSubject, Subject> = {
    'Mathematics': 'Math',
    'Reading': 'Reading Foundations',
    'ELA': 'ELA'
  };

  const aiQuestions = await generateScreenerQuestions(grade, subjectMap[subject], neededCount);

  // Convert Question[] to ExtendedQuestion[]
  const extendedAiQuestions: ExtendedQuestion[] = aiQuestions.map((q, idx) => ({
    id: `ai-${Date.now()}-${idx}`,
    bankId: `ai-generated-${grade}-${subject}`,
    text: q.text,
    format: QuestionFormat.MULTIPLE_CHOICE,
    questionOptions: {
      choices: q.options,
      correctAnswer: q.correctAnswer
    },
    subject,
    gradeLevel: grade,
    strand: q.strand,
    difficulty: DifficultyLevel.MEDIUM,
    ccssStandards: [],
    primaryStandard: '',
    source: 'ai_generated',
    reviewStatus: 'draft',
    timesUsed: 0,
    correctRate: 0,
    averageTimeSeconds: 0
  }));

  return [...existingQuestions, ...extendedAiQuestions];
};

/**
 * Build prompt for question generation
 */
const buildQuestionPrompt = (
  grade: string,
  subject: Subject,
  strands: string[],
  count: number
): string => {
  return `Generate ${count} multiple choice assessment questions for Grade ${grade} ${subject}.

Requirements:
- Questions should align with grade-level standards
- Include questions from these strands: ${strands.join(', ')}
- Each question should have 4 answer choices
- Mark the correct answer
- Vary difficulty levels

Format your response as JSON array:
[
  {
    "text": "Question text here",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "strand": "Strand name"
  }
]

Generate exactly ${count} questions.`;
};

/**
 * Parse generated questions from AI response
 */
const parseGeneratedQuestions = (text: string, strands: string[]): Question[] => {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return parsed.map((q: any, idx: number) => ({
      id: `gen-${Date.now()}-${idx}`,
      text: q.text || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer || q.options?.[0] || '',
      strand: q.strand || strands[idx % strands.length] || 'General'
    }));
  } catch (error) {
    console.error('Error parsing generated questions:', error);
    return [];
  }
};

/**
 * Generate fallback questions when AI is unavailable
 */
const generateFallbackQuestions = (
  grade: string,
  subject: Subject,
  count: number
): Question[] => {
  const strands = getStrandsForSubject(subject);
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const strand = strands[i % strands.length];
    questions.push({
      id: `fallback-${Date.now()}-${i}`,
      text: `Sample ${subject} question ${i + 1} for Grade ${grade} (${strand})`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      strand
    });
  }

  return questions;
};
