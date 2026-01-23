/**
 * Adaptive testing types for Computerized Adaptive Testing (CAT)
 * Uses Item Response Theory (IRT) for ability estimation
 */

import { QuestionResponse, ExtendedQuestion, DifficultyLevel } from './questions';

/**
 * Adaptive test session tracking
 */
export interface AdaptiveTestSession {
  id: string;
  studentId: string;
  subject: string;
  gradeLevel: string;
  currentAbilityEstimate: number;  // theta: -3 to +3 scale
  standardError: number;           // Standard error of ability estimate
  questionHistory: QuestionResponse[];
  strandsTouch: Record<string, number>;  // strand -> count of questions asked
  formatsUsed: Record<string, number>;   // format -> count of questions asked
  difficultiesUsed: Record<number, number>; // difficulty -> count of questions asked
  standardsCovered: string[];
  startTime: string;
  lastUpdateTime: string;
  status: AdaptiveSessionStatus;
  // Final results (when completed)
  finalAbilityEstimate?: number;
  finalStandardError?: number;
  totalQuestionsAnswered?: number;
  totalCorrect?: number;
  completionTime?: string;
}

export enum AdaptiveSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  TIMED_OUT = 'timed_out'
}

/**
 * Question selection criteria for adaptive algorithm
 */
export interface QuestionSelectionCriteria {
  targetAbility: number;
  subject: string;
  gradeLevel: string;
  excludeQuestionIds: string[];
  preferredStrands?: string[];
  requiredStandards?: string[];
  maxDifficulty?: DifficultyLevel;
  minDifficulty?: DifficultyLevel;
}

/**
 * Item Response Theory parameters for a question
 * Uses 3-parameter logistic model (3PL)
 */
export interface IRTParameters {
  a: number;  // Discrimination parameter (how well the item differentiates)
  b: number;  // Difficulty parameter (theta level where P(correct) = 0.5)
  c: number;  // Guessing parameter (probability of guessing correctly)
}

/**
 * Extended question with IRT parameters
 */
export interface CalibratedQuestion extends ExtendedQuestion {
  irtParameters: IRTParameters;
  informationAtTheta?: Record<number, number>;  // precomputed information values
}

/**
 * Ability estimate with confidence interval
 */
export interface AbilityEstimate {
  studentId: string;
  subject: string;
  gradeLevel: string;
  theta: number;           // Point estimate
  standardError: number;   // SE of the estimate
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number;  // e.g., 0.95 for 95% CI
  };
  numResponses: number;
  lastUpdated: string;
}

/**
 * Student ability tracking across subjects
 */
export interface StudentAbilityProfile {
  studentId: string;
  abilities: Record<string, AbilityEstimate>;  // subject -> estimate
  strandMastery: Record<string, Record<string, number>>;  // subject -> strand -> mastery level
  testHistory: TestSessionSummary[];
}

/**
 * Summary of a completed test session
 */
export interface TestSessionSummary {
  sessionId: string;
  subject: string;
  gradeLevel: string;
  date: string;
  questionsAnswered: number;
  correctCount: number;
  finalAbility: number;
  standardError: number;
  durationMinutes: number;
}

/**
 * Content balancing configuration
 */
export interface ContentBalancingConfig {
  strands: StrandConfig[];
  minimumQuestionsPerStrand: number;
  maximumQuestionsPerStrand: number;
  enforceCoverage: boolean;
}

export interface StrandConfig {
  name: string;
  targetProportion: number;  // 0-1, proportions should sum to 1
  minimumQuestions: number;
  standards: string[];
}

/**
 * Termination criteria for adaptive test
 */
export interface TerminationCriteria {
  maxQuestions: number;           // Maximum questions to ask
  minQuestions: number;           // Minimum questions before can terminate
  maxTimeMinutes: number;         // Maximum test duration
  targetStandardError: number;    // Stop when SE falls below this
  requireAllStrands: boolean;     // Must cover all strands before stopping
}

/**
 * Default termination criteria for ~20 minute test
 * Configured for grade-level screener to get clear picture of student ability
 */
export const DEFAULT_TERMINATION_CRITERIA: TerminationCriteria = {
  maxQuestions: 25,           // Allow up to 25 questions for comprehensive coverage
  minQuestions: 15,           // At least 15 questions for reliable measurement
  maxTimeMinutes: 20,         // Hard limit of 20 minutes
  targetStandardError: 0.30,  // Lower SE for more precise ability estimate
  requireAllStrands: true     // Must cover all content strands for complete picture
};

/**
 * Format distribution targets for question variety
 */
export const FORMAT_DISTRIBUTION = {
  multiple_choice: 0.60,  // 60% multiple choice
  true_false: 0.15,       // 15% true/false
  matching: 0.15,         // 15% matching
  drag_and_drop: 0.10     // 10% drag and drop
};

/**
 * Difficulty distribution targets for adaptive balance
 */
export const DIFFICULTY_DISTRIBUTION = {
  1: 0.15,  // 15% very easy
  2: 0.25,  // 25% easy
  3: 0.30,  // 30% medium
  4: 0.20,  // 20% hard
  5: 0.10   // 10% very hard
};

/**
 * Question selection result from adaptive algorithm
 */
export interface QuestionSelectionResult {
  selectedQuestion: ExtendedQuestion;
  informationValue: number;
  selectionReason: string;
  alternativesConsidered: number;
  contentBalanceScore: number;
}

/**
 * Adaptive test configuration
 */
export interface AdaptiveTestConfig {
  subject: string;
  gradeLevel: string;
  terminationCriteria: TerminationCriteria;
  contentBalancing: ContentBalancingConfig;
  startingAbility: number;  // Initial theta (usually 0)
  questionSourceRatio: {
    static: number;      // Proportion from static bank
    aiGenerated: number; // Proportion from AI generation
  };
}

/**
 * Helper function to convert difficulty level to IRT b-parameter estimate
 */
export function difficultyToTheta(difficulty: DifficultyLevel): number {
  const mapping: Record<DifficultyLevel, number> = {
    [DifficultyLevel.VERY_EASY]: -2.0,
    [DifficultyLevel.EASY]: -1.0,
    [DifficultyLevel.MEDIUM]: 0.0,
    [DifficultyLevel.HARD]: 1.0,
    [DifficultyLevel.VERY_HARD]: 2.0
  };
  return mapping[difficulty];
}

/**
 * Helper function to convert theta to approximate performance level
 */
export function thetaToPerformanceLevel(theta: number): 'far_below' | 'below' | 'on_level' | 'above' {
  if (theta < -1.0) return 'far_below';
  if (theta < 0.0) return 'below';
  if (theta < 1.0) return 'on_level';
  return 'above';
}
