import {
  AdaptiveTestSession,
  AdaptiveSessionStatus,
  QuestionSelectionResult,
  ExtendedQuestion,
  QuestionResponse,
  difficultyToTheta,
  thetaToPerformanceLevel,
  DEFAULT_TERMINATION_CRITERIA
} from '../types';

/**
 * Create a new adaptive test session
 */
export const createAdaptiveSession = (
  studentId: string,
  subject: string,
  gradeLevel: string
): AdaptiveTestSession => {
  const now = new Date().toISOString();

  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    studentId,
    subject,
    gradeLevel,
    currentAbilityEstimate: 0, // Start at average ability
    standardError: 1.0,        // High initial uncertainty
    questionHistory: [],
    strandsTouch: {},
    formatsUsed: {},
    difficultiesUsed: {},
    standardsCovered: [],
    startTime: now,
    lastUpdateTime: now,
    status: AdaptiveSessionStatus.IN_PROGRESS
  };
};

/**
 * Process a student's response and update ability estimate
 */
export const processResponse = (
  session: AdaptiveTestSession,
  question: ExtendedQuestion,
  isCorrect: boolean,
  timeSpent: number,
  questionsMap: Map<string, ExtendedQuestion>
): AdaptiveTestSession => {
  const response: QuestionResponse = {
    questionId: question.id,
    studentAnswer: isCorrect ? 'correct' : 'incorrect',
    isCorrect,
    timeSpentSeconds: timeSpent,
    timestamp: new Date().toISOString()
  };

  // Update session with response
  const updatedHistory = [...session.questionHistory, response];

  // Update strand coverage
  const updatedStrands = { ...session.strandsTouch };
  updatedStrands[question.strand] = (updatedStrands[question.strand] || 0) + 1;

  // Update format usage
  const updatedFormats = { ...session.formatsUsed };
  updatedFormats[question.format] = (updatedFormats[question.format] || 0) + 1;

  // Update difficulty usage
  const updatedDifficulties = { ...session.difficultiesUsed };
  updatedDifficulties[question.difficulty] = (updatedDifficulties[question.difficulty] || 0) + 1;

  // Update standards coverage
  const updatedStandards = [...session.standardsCovered];
  question.ccssStandards.forEach(std => {
    if (!updatedStandards.includes(std)) {
      updatedStandards.push(std);
    }
  });

  // Calculate new ability estimate using simplified IRT
  const newAbility = estimateAbility(updatedHistory, questionsMap);
  const newSE = calculateStandardError(updatedHistory.length);

  return {
    ...session,
    questionHistory: updatedHistory,
    strandsTouch: updatedStrands,
    formatsUsed: updatedFormats,
    difficultiesUsed: updatedDifficulties,
    standardsCovered: updatedStandards,
    currentAbilityEstimate: newAbility,
    standardError: newSE,
    lastUpdateTime: new Date().toISOString()
  };
};

/**
 * Estimate ability using Maximum Likelihood Estimation (simplified)
 */
export const estimateAbility = (
  responses: QuestionResponse[],
  questionsMap: Map<string, ExtendedQuestion>
): number => {
  if (responses.length === 0) return 0;

  let totalCorrect = 0;
  let totalDifficulty = 0;

  responses.forEach(response => {
    const question = questionsMap.get(response.questionId);
    if (question) {
      const theta = difficultyToTheta(question.difficulty);
      totalDifficulty += theta;
      if (response.isCorrect) {
        totalCorrect++;
      }
    }
  });

  const avgDifficulty = totalDifficulty / responses.length;
  const correctRate = totalCorrect / responses.length;

  // Simple logit-based estimate
  // Adjust ability based on performance relative to difficulty
  const adjustment = (correctRate - 0.5) * 2;
  return Math.max(-3, Math.min(3, avgDifficulty + adjustment));
};

/**
 * Calculate standard error based on number of responses
 */
const calculateStandardError = (numResponses: number): number => {
  // SE decreases as more questions are answered
  return Math.max(0.2, 1.0 / Math.sqrt(numResponses + 1));
};

/**
 * Select the next question based on current ability estimate
 * IMPORTANT: Only selects from available questions - never tries to go below
 * the minimum difficulty level in the question bank
 */
export const selectNextQuestion = (
  availableQuestions: ExtendedQuestion[],
  session: AdaptiveTestSession
): QuestionSelectionResult | null => {
  // Filter out already-answered questions
  const answeredIds = new Set(session.questionHistory.map(r => r.questionId));
  const unanswered = availableQuestions.filter(q => !answeredIds.has(q.id));

  if (unanswered.length === 0) return null;

  // Find the difficulty bounds of available questions
  const difficulties = unanswered.map(q => q.difficulty);
  const minDifficulty = Math.min(...difficulties);
  const maxDifficulty = Math.max(...difficulties);
  const minTheta = difficultyToTheta(minDifficulty);
  const maxTheta = difficultyToTheta(maxDifficulty);

  // Clamp target ability to available question range
  // This ensures we never try to select questions below/above what's available
  let targetTheta = session.currentAbilityEstimate;
  const originalTarget = targetTheta;

  if (targetTheta < minTheta) {
    targetTheta = minTheta;
    console.log(`Adaptive: Clamping target ability from ${originalTarget.toFixed(2)} to min available ${minTheta.toFixed(2)}`);
  } else if (targetTheta > maxTheta) {
    targetTheta = maxTheta;
    console.log(`Adaptive: Clamping target ability from ${originalTarget.toFixed(2)} to max available ${maxTheta.toFixed(2)}`);
  }

  const scored = unanswered.map(q => {
    const questionTheta = difficultyToTheta(q.difficulty);
    const distance = Math.abs(questionTheta - targetTheta);

    // Prefer questions from underrepresented strands
    const strandBonus = (session.strandsTouch[q.strand] || 0) < 2 ? 0.5 : 0;

    // Calculate information value (higher = better)
    const information = 1 / (1 + distance) + strandBonus;

    return { question: q, information, distance };
  });

  // Sort by information value (descending)
  scored.sort((a, b) => b.information - a.information);

  const selected = scored[0];

  // Provide more detailed selection reason
  let reason = `Selected based on ability match (distance: ${selected.distance.toFixed(2)})`;
  if (originalTarget < minTheta) {
    reason = `Selected easiest available question (student ability below question bank range)`;
  } else if (originalTarget > maxTheta) {
    reason = `Selected hardest available question (student ability above question bank range)`;
  }

  return {
    selectedQuestion: selected.question,
    informationValue: selected.information,
    selectionReason: reason,
    alternativesConsidered: scored.length,
    contentBalanceScore: selected.information
  };
};

/**
 * Check if test should terminate
 */
export const shouldTerminate = (
  session: AdaptiveTestSession
): { shouldStop: boolean; reason: string } => {
  const criteria = DEFAULT_TERMINATION_CRITERIA;
  const numQuestions = session.questionHistory.length;

  // Max questions reached
  if (numQuestions >= criteria.maxQuestions) {
    return { shouldStop: true, reason: 'Maximum questions reached' };
  }

  // Minimum questions not yet reached
  if (numQuestions < criteria.minQuestions) {
    return { shouldStop: false, reason: 'Minimum questions not reached' };
  }

  // SE threshold met
  if (session.standardError <= criteria.targetStandardError) {
    // Check strand coverage if required
    if (criteria.requireAllStrands) {
      const strandsCount = Object.keys(session.strandsTouch).length;
      if (strandsCount < 3) { // Require at least 3 strands
        return { shouldStop: false, reason: 'Strand coverage incomplete' };
      }
    }
    return { shouldStop: true, reason: 'Target precision achieved' };
  }

  return { shouldStop: false, reason: 'Continuing assessment' };
};

/**
 * Finalize the test session
 */
export const finalizeSession = (session: AdaptiveTestSession): AdaptiveTestSession => {
  const totalCorrect = session.questionHistory.filter(r => r.isCorrect).length;

  return {
    ...session,
    status: AdaptiveSessionStatus.COMPLETED,
    finalAbilityEstimate: session.currentAbilityEstimate,
    finalStandardError: session.standardError,
    totalQuestionsAnswered: session.questionHistory.length,
    totalCorrect,
    completionTime: new Date().toISOString()
  };
};

/**
 * Convert ability estimate to percentile
 */
export const abilityToPercentile = (theta: number): number => {
  // Map theta (-3 to +3) to percentile (1 to 99)
  // Using normal distribution approximation
  const z = theta;
  const percentile = 50 + 50 * erf(z / Math.sqrt(2));
  return Math.round(Math.max(1, Math.min(99, percentile)));
};

/**
 * Error function approximation for normal distribution
 */
const erf = (x: number): number => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

/**
 * Convert ability to performance level string
 */
export const abilityToPerformanceLevel = (theta: number): 'far_below' | 'below' | 'on_level' | 'above' => {
  return thetaToPerformanceLevel(theta);
};

// Re-export types
export type { AdaptiveTestSession };
export { AdaptiveSessionStatus };
