/**
 * Extended question types for Universal Screener Question Bank
 * Supports multiple question formats and CCSS alignment
 */

export enum QuestionFormat {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  MATCHING = 'matching',
  DRAG_AND_DROP = 'drag_and_drop'
}

export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM = 3,
  HARD = 4,
  VERY_HARD = 5
}

export type QuestionSubject = 'Mathematics' | 'Reading' | 'Reading Comprehension' | 'ELA';

export type ReviewStatus = 'draft' | 'reviewed' | 'approved';

export type QuestionSource = 'static' | 'ai_generated';

// Multiple Choice Options
export interface MultipleChoiceOptions {
  choices: string[];
  correctAnswer: string;
}

// True/False Options
export interface TrueFalseOptions {
  correctAnswer: boolean;
}

// Matching Options
export interface MatchingOptions {
  leftItems: string[];
  rightItems: string[];
  correctMatches: Record<number, number>; // left index -> right index
}

// Drag and Drop Options
export interface DragDropOptions {
  draggableItems: string[];
  dropZones: DropZone[];
  correctPlacements: Record<number, number>; // item index -> zone index
}

export interface DropZone {
  id: string;
  label: string;
  description?: string;
}

// Union type for all question options
export type QuestionOptions =
  | MultipleChoiceOptions
  | TrueFalseOptions
  | MatchingOptions
  | DragDropOptions;

/**
 * Extended Question interface for the question bank
 * Includes full metadata, analytics, and CCSS alignment
 */
export interface ExtendedQuestion {
  id: string;
  bankId: string;
  text: string;
  format: QuestionFormat;
  questionOptions: QuestionOptions;
  subject: QuestionSubject;
  gradeLevel: string;
  strand: string;
  difficulty: DifficultyLevel;
  ccssStandards: string[];       // e.g., ["CCSS.MATH.CONTENT.3.NF.A.1"]
  primaryStandard: string;
  source: QuestionSource;
  reviewStatus: ReviewStatus;
  // Analytics fields
  timesUsed: number;
  correctRate: number;
  averageTimeSeconds: number;
  // Optional metadata
  explanation?: string;
  hints?: string[];
  imageUrl?: string;
  audioUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  // Reading comprehension passage fields
  passage?: string;        // Passage identifier (e.g., "G5-L1: The Treasure of Willow Creek")
  passageText?: string;    // Full passage text for reading comprehension questions
}

/**
 * Question bank file metadata
 */
export interface QuestionBankMetadata {
  subject: QuestionSubject;
  gradeLevel: string;
  domain: string;
  domainName: string;
  lastUpdated?: string;
  totalQuestions?: number;
}

/**
 * Question bank file structure
 */
export interface QuestionBankFile {
  metadata: QuestionBankMetadata;
  questions: ExtendedQuestion[];
}

/**
 * Response from a question (for tracking)
 */
export interface QuestionResponse {
  questionId: string;
  studentAnswer: string | boolean | Record<number, number>;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timestamp: string;
}

/**
 * Type guards for question options
 */
export function isMultipleChoiceOptions(options: QuestionOptions): options is MultipleChoiceOptions {
  return 'choices' in options && 'correctAnswer' in options && typeof options.correctAnswer === 'string';
}

export function isTrueFalseOptions(options: QuestionOptions): options is TrueFalseOptions {
  return 'correctAnswer' in options && typeof options.correctAnswer === 'boolean';
}

export function isMatchingOptions(options: QuestionOptions): options is MatchingOptions {
  return 'leftItems' in options && 'rightItems' in options && 'correctMatches' in options;
}

export function isDragDropOptions(options: QuestionOptions): options is DragDropOptions {
  return 'draggableItems' in options && 'dropZones' in options && 'correctPlacements' in options;
}
