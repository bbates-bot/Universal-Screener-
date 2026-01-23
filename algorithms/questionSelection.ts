/**
 * Question Selection Algorithm
 * Implements CAT (Computerized Adaptive Testing) question selection
 * with content balancing and exposure control
 */

import {
  ExtendedQuestion,
  AdaptiveTestSession,
  DifficultyLevel,
  QuestionFormat,
  ContentBalancingConfig,
  StrandConfig,
  difficultyToTheta
} from '../types';

/**
 * Question selection strategy options
 */
export enum SelectionStrategy {
  MAX_INFORMATION = 'max_information',      // Pure maximum Fisher information
  BALANCED = 'balanced',                    // Balance info with content coverage
  CONTENT_FIRST = 'content_first',          // Prioritize content coverage
  EXPOSURE_CONTROLLED = 'exposure_controlled' // Include exposure control
}

/**
 * Selection configuration
 */
export interface SelectionConfig {
  strategy: SelectionStrategy;
  informationWeight: number;        // 0-1, weight for information criterion
  contentWeight: number;            // 0-1, weight for content balance
  exposureWeight: number;           // 0-1, weight for exposure control
  formatDistribution?: Record<QuestionFormat, number>;
  randomizationFactor: number;      // 0-1, add randomness to selection
}

const DEFAULT_CONFIG: SelectionConfig = {
  strategy: SelectionStrategy.BALANCED,
  informationWeight: 0.6,
  contentWeight: 0.3,
  exposureWeight: 0.1,
  formatDistribution: {
    [QuestionFormat.MULTIPLE_CHOICE]: 0.6,
    [QuestionFormat.TRUE_FALSE]: 0.15,
    [QuestionFormat.MATCHING]: 0.15,
    [QuestionFormat.DRAG_AND_DROP]: 0.1
  },
  randomizationFactor: 0.1
};

/**
 * Calculate item information using 3PL IRT model
 */
function calculateItemInformation(theta: number, question: ExtendedQuestion): number {
  const b = difficultyToTheta(question.difficulty);
  const a = getDiscrimination(question);
  const c = getGuessingParameter(question);

  const expTerm = Math.exp(-a * (theta - b));
  const p = c + (1 - c) / (1 + expTerm);
  const q = 1 - p;
  const pStar = (p - c) / (1 - c);

  // Fisher information for 3PL model
  const info = (a * a * q * pStar * pStar) / (p * (1 - c) * (1 - c));

  return isFinite(info) ? info : 0;
}

/**
 * Get discrimination parameter based on question characteristics
 */
function getDiscrimination(question: ExtendedQuestion): number {
  // Base discrimination
  let a = 1.0;

  // Higher discrimination for well-calibrated questions
  if (question.timesUsed > 100) {
    a *= 1.2;
  }

  // Adjust based on format
  if (question.format === QuestionFormat.MATCHING) {
    a *= 1.1; // Matching tends to discriminate well
  } else if (question.format === QuestionFormat.TRUE_FALSE) {
    a *= 0.9; // T/F tends to discriminate less
  }

  return Math.max(0.5, Math.min(2.0, a));
}

/**
 * Get guessing parameter based on question format
 */
function getGuessingParameter(question: ExtendedQuestion): number {
  switch (question.format) {
    case QuestionFormat.MULTIPLE_CHOICE:
      return 0.25; // 1 in 4 chance
    case QuestionFormat.TRUE_FALSE:
      return 0.5;  // 1 in 2 chance
    case QuestionFormat.MATCHING:
      return 0.1;  // Low guessing due to multiple pairs
    case QuestionFormat.DRAG_AND_DROP:
      return 0.1;  // Low guessing
    default:
      return 0.2;
  }
}

/**
 * Calculate content balance score for a question
 */
function calculateContentScore(
  question: ExtendedQuestion,
  session: AdaptiveTestSession,
  config: ContentBalancingConfig
): number {
  let score = 0;

  // Strand balance
  const strandConfig = config.strands.find(s => s.name === question.strand);
  if (strandConfig) {
    const currentCount = session.strandsTouch[question.strand] || 0;
    const targetCount = Math.ceil(session.questionHistory.length * strandConfig.targetProportion);

    if (currentCount < strandConfig.minimumQuestions) {
      score += 1.0; // High priority for minimum coverage
    } else if (currentCount < targetCount) {
      score += 0.5; // Medium priority for target proportion
    } else if (currentCount >= config.maximumQuestionsPerStrand) {
      score -= 0.5; // Penalize over-covered strands
    }
  } else {
    // Unknown strand - give neutral score
    score += 0.3;
  }

  // Standard coverage bonus
  const uncoveredStandards = question.ccssStandards.filter(
    s => !session.standardsCovered.includes(s)
  );
  score += uncoveredStandards.length * 0.2;

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate exposure control score
 * Prevents over-exposure of frequently used questions
 */
function calculateExposureScore(question: ExtendedQuestion): number {
  const maxExposure = 1000; // Threshold for high exposure

  if (question.timesUsed >= maxExposure) {
    return 0.2; // Low score for highly exposed items
  }

  // Inverse relationship with exposure
  return 1 - (question.timesUsed / maxExposure);
}

/**
 * Calculate format preference score
 */
function calculateFormatScore(
  question: ExtendedQuestion,
  session: AdaptiveTestSession,
  targetDistribution: Record<QuestionFormat, number>
): number {
  const questionsAsked = session.questionHistory.length;
  if (questionsAsked === 0) return 0.5;

  const targetProportion = targetDistribution[question.format] || 0.25;

  // Count current format distribution
  // Note: We'd need to track format in history for accurate calculation
  // For now, give slight preference to less common formats
  if (question.format === QuestionFormat.DRAG_AND_DROP ||
      question.format === QuestionFormat.MATCHING) {
    return 0.6;
  }

  return 0.5;
}

/**
 * Main question selection function
 */
export function selectQuestion(
  availableQuestions: ExtendedQuestion[],
  session: AdaptiveTestSession,
  contentConfig: ContentBalancingConfig,
  selectionConfig: SelectionConfig = DEFAULT_CONFIG
): ExtendedQuestion | null {
  const theta = session.currentAbilityEstimate;
  const askedIds = new Set(session.questionHistory.map(r => r.questionId));

  // Filter out already-asked questions
  const candidates = availableQuestions.filter(q => !askedIds.has(q.id));

  if (candidates.length === 0) return null;

  // Score each candidate
  const scoredCandidates = candidates.map(question => {
    const infoScore = calculateItemInformation(theta, question);
    const contentScore = calculateContentScore(question, session, contentConfig);
    const exposureScore = calculateExposureScore(question);
    const formatScore = calculateFormatScore(
      question,
      session,
      selectionConfig.formatDistribution || DEFAULT_CONFIG.formatDistribution!
    );

    // Normalize information score (typical range 0-1)
    const normalizedInfo = Math.min(1, infoScore);

    // Combined score based on weights
    let combinedScore =
      normalizedInfo * selectionConfig.informationWeight +
      contentScore * selectionConfig.contentWeight +
      exposureScore * selectionConfig.exposureWeight +
      formatScore * 0.1;

    // Add randomization
    if (selectionConfig.randomizationFactor > 0) {
      combinedScore += (Math.random() - 0.5) * selectionConfig.randomizationFactor;
    }

    return {
      question,
      infoScore: normalizedInfo,
      contentScore,
      exposureScore,
      formatScore,
      combinedScore
    };
  });

  // Sort by combined score (descending)
  scoredCandidates.sort((a, b) => b.combinedScore - a.combinedScore);

  // Select from top candidates with some randomization
  const topN = Math.min(5, scoredCandidates.length);
  const selectedIndex = Math.floor(Math.random() * topN);

  return scoredCandidates[selectedIndex].question;
}

/**
 * Select initial question for a new test
 */
export function selectInitialQuestion(
  availableQuestions: ExtendedQuestion[],
  targetDifficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
  preferredStrand?: string
): ExtendedQuestion | null {
  let candidates = availableQuestions.filter(q => q.difficulty === targetDifficulty);

  if (candidates.length === 0) {
    // Expand to adjacent difficulties
    candidates = availableQuestions.filter(q =>
      Math.abs(q.difficulty - targetDifficulty) <= 1
    );
  }

  if (candidates.length === 0) {
    candidates = availableQuestions;
  }

  // Prefer specified strand if provided
  if (preferredStrand) {
    const strandCandidates = candidates.filter(q => q.strand === preferredStrand);
    if (strandCandidates.length > 0) {
      candidates = strandCandidates;
    }
  }

  // Prefer multiple choice for initial question (most familiar format)
  const mcCandidates = candidates.filter(q => q.format === QuestionFormat.MULTIPLE_CHOICE);
  if (mcCandidates.length > 0) {
    candidates = mcCandidates;
  }

  if (candidates.length === 0) return null;

  // Random selection from candidates
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Get questions for a specific strand to ensure coverage
 */
export function getStrandCoverageQuestions(
  availableQuestions: ExtendedQuestion[],
  session: AdaptiveTestSession,
  requiredStrands: string[],
  minQuestionsPerStrand: number = 2
): string[] {
  const underCoveredStrands: string[] = [];

  for (const strand of requiredStrands) {
    const count = session.strandsTouch[strand] || 0;
    if (count < minQuestionsPerStrand) {
      underCoveredStrands.push(strand);
    }
  }

  return underCoveredStrands;
}

/**
 * Adjust difficulty based on recent performance
 */
export function getAdaptiveDifficultyRange(
  session: AdaptiveTestSession
): { min: DifficultyLevel; max: DifficultyLevel } {
  const theta = session.currentAbilityEstimate;

  // Map theta to difficulty range
  if (theta < -1.5) {
    return { min: DifficultyLevel.VERY_EASY, max: DifficultyLevel.EASY };
  } else if (theta < -0.5) {
    return { min: DifficultyLevel.VERY_EASY, max: DifficultyLevel.MEDIUM };
  } else if (theta < 0.5) {
    return { min: DifficultyLevel.EASY, max: DifficultyLevel.HARD };
  } else if (theta < 1.5) {
    return { min: DifficultyLevel.MEDIUM, max: DifficultyLevel.VERY_HARD };
  } else {
    return { min: DifficultyLevel.HARD, max: DifficultyLevel.VERY_HARD };
  }
}

/**
 * Create default content balancing config for a subject
 */
export function createDefaultContentConfig(subject: string): ContentBalancingConfig {
  const mathStrands: StrandConfig[] = [
    { name: 'Numbers & Operations', targetProportion: 0.25, minimumQuestions: 3, standards: [] },
    { name: 'Algebra & Algebraic Thinking', targetProportion: 0.25, minimumQuestions: 3, standards: [] },
    { name: 'Fractions', targetProportion: 0.2, minimumQuestions: 2, standards: [] },
    { name: 'Geometry', targetProportion: 0.15, minimumQuestions: 2, standards: [] },
    { name: 'Data & Measurement', targetProportion: 0.15, minimumQuestions: 2, standards: [] }
  ];

  const readingStrands: StrandConfig[] = [
    { name: 'Key Ideas & Details', targetProportion: 0.3, minimumQuestions: 4, standards: [] },
    { name: 'Craft & Structure', targetProportion: 0.25, minimumQuestions: 3, standards: [] },
    { name: 'Vocabulary Acquisition', targetProportion: 0.25, minimumQuestions: 3, standards: [] },
    { name: 'Phonics & Word Recognition', targetProportion: 0.2, minimumQuestions: 2, standards: [] }
  ];

  const elaStrands: StrandConfig[] = [
    { name: 'Language', targetProportion: 0.4, minimumQuestions: 5, standards: [] },
    { name: 'Writing', targetProportion: 0.35, minimumQuestions: 4, standards: [] },
    { name: 'Speaking & Listening', targetProportion: 0.25, minimumQuestions: 3, standards: [] }
  ];

  let strands: StrandConfig[];
  switch (subject.toLowerCase()) {
    case 'mathematics':
    case 'math':
      strands = mathStrands;
      break;
    case 'reading':
      strands = readingStrands;
      break;
    case 'ela':
    case 'english language arts':
      strands = elaStrands;
      break;
    default:
      strands = mathStrands;
  }

  return {
    strands,
    minimumQuestionsPerStrand: 2,
    maximumQuestionsPerStrand: 8,
    enforceCoverage: true
  };
}
