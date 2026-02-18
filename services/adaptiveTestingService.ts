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
 * Grade order for determining grade level bounds
 */
const GRADE_ORDER = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/**
 * Maximum grade level deviation allowed during adaptive testing
 * This ensures tests never adapt more than 1 grade level away from the student's grade
 */
const MAX_GRADE_DEVIATION = 1;

/**
 * Check if a question's grade level is within allowed bounds
 */
const isWithinGradeBounds = (questionGrade: string, sessionGrade: string): boolean => {
  const sessionIndex = GRADE_ORDER.indexOf(sessionGrade);
  const questionIndex = GRADE_ORDER.indexOf(questionGrade);

  // If either grade isn't in the standard order (e.g., AP courses), allow it
  if (sessionIndex === -1 || questionIndex === -1) {
    return true;
  }

  const deviation = Math.abs(questionIndex - sessionIndex);
  return deviation <= MAX_GRADE_DEVIATION;
};

/**
 * Get required strands for comprehensive assessment coverage
 */
const getRequiredStrands = (subject: string): string[] => {
  const strandsBySubject: Record<string, string[]> = {
    'Mathematics': [
      'Operations & Algebraic Thinking',
      'Number & Operations in Base Ten',
      'Number & Operations - Fractions',
      'Measurement & Data',
      'Geometry'
    ],
    'Math': [
      'Operations & Algebraic Thinking',
      'Number & Operations in Base Ten',
      'Measurement & Data',
      'Geometry'
    ],
    'Reading': [
      'Key Ideas & Details',
      'Craft & Structure',
      'Integration of Knowledge'
    ],
    'Reading Comprehension': [
      'Key Ideas & Details',
      'Craft & Structure',
      'Integration of Knowledge'
    ],
    'ELA': [
      'Key Ideas & Details',
      'Craft & Structure',
      'Integration of Knowledge',
      'Phonics & Word Recognition'
    ]
  };

  return strandsBySubject[subject] || [];
};

/**
 * Minimum questions required per strand for comprehensive coverage
 */
const MIN_QUESTIONS_PER_STRAND = 2;

/**
 * Select the next question based on current ability estimate
 * IMPORTANT:
 * - Only selects from available questions within ±1 grade level
 * - Prioritizes strand coverage for comprehensive assessment
 * - Never adapts more than one grade level away
 */
export const selectNextQuestion = (
  availableQuestions: ExtendedQuestion[],
  session: AdaptiveTestSession
): QuestionSelectionResult | null => {
  // Filter out already-answered questions
  const answeredIds = new Set(session.questionHistory.map(r => r.questionId));
  let unanswered = availableQuestions.filter(q => !answeredIds.has(q.id));

  if (unanswered.length === 0) return null;

  // CRITICAL: Filter to only questions within ±1 grade level
  // This ensures we never adapt more than one grade level away
  const withinBounds = unanswered.filter(q =>
    isWithinGradeBounds(q.gradeLevel, session.gradeLevel)
  );

  if (withinBounds.length > 0) {
    unanswered = withinBounds;
    console.log(`Adaptive: Filtered to ${unanswered.length} questions within ±${MAX_GRADE_DEVIATION} grade levels`);
  } else {
    console.log(`Adaptive: Warning - no questions within grade bounds, using all ${unanswered.length} available`);
  }

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

  // Check for underrepresented strands for comprehensive coverage
  const requiredStrands = getRequiredStrands(session.subject);
  const underrepresentedStrands = requiredStrands.filter(strand =>
    (session.strandsTouch[strand] || 0) < MIN_QUESTIONS_PER_STRAND
  );

  const scored = unanswered.map(q => {
    const questionTheta = difficultyToTheta(q.difficulty);
    const distance = Math.abs(questionTheta - targetTheta);

    // Prefer questions from underrepresented strands (stronger bonus for required strands)
    let strandBonus = 0;
    const strandUsage = session.strandsTouch[q.strand] || 0;

    if (underrepresentedStrands.includes(q.strand)) {
      // High priority: required strand not yet covered enough
      strandBonus = 1.0 - (strandUsage * 0.3);
    } else if (strandUsage < MIN_QUESTIONS_PER_STRAND) {
      // Medium priority: any strand not yet covered
      strandBonus = 0.5;
    }

    // Calculate information value (higher = better)
    const information = 1 / (1 + distance) + strandBonus;

    return { question: q, information, distance, strandBonus };
  });

  // Sort by information value (descending)
  scored.sort((a, b) => b.information - a.information);

  const selected = scored[0];

  // Provide more detailed selection reason
  let reason = `Selected based on ability match (distance: ${selected.distance.toFixed(2)})`;
  if (selected.strandBonus > 0.5) {
    reason = `Prioritizing strand coverage: ${selected.question.strand}`;
  } else if (originalTarget < minTheta) {
    reason = `Selected easiest available question (student ability below question bank range)`;
  } else if (originalTarget > maxTheta) {
    reason = `Selected hardest available question (student ability above question bank range)`;
  }

  // Log strand coverage status
  const strandsCount = Object.keys(session.strandsTouch).length;
  console.log(`Adaptive: Strands covered: ${strandsCount}, Underrepresented: ${underrepresentedStrands.length}`);

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
 * Ensures comprehensive coverage of learning objectives before allowing early termination
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

  // Check strand coverage for comprehensive assessment
  const requiredStrands = getRequiredStrands(session.subject);
  const strandsCovered = Object.keys(session.strandsTouch);
  const strandsWithMinCoverage = strandsCovered.filter(
    strand => (session.strandsTouch[strand] || 0) >= MIN_QUESTIONS_PER_STRAND
  );

  // Calculate how many required strands have minimum coverage
  const requiredStrandsCovered = requiredStrands.filter(
    strand => strandsWithMinCoverage.includes(strand)
  ).length;

  const requiredCoveragePercentage = requiredStrands.length > 0
    ? requiredStrandsCovered / requiredStrands.length
    : 1;

  // SE threshold met - but also check strand coverage
  if (session.standardError <= criteria.targetStandardError) {
    // Require at least 75% of required strands to be covered with minimum questions
    if (criteria.requireAllStrands && requiredCoveragePercentage < 0.75) {
      console.log(`Adaptive: SE target met but strand coverage at ${Math.round(requiredCoveragePercentage * 100)}% (need 75%)`);
      return {
        shouldStop: false,
        reason: `Strand coverage incomplete: ${requiredStrandsCovered}/${requiredStrands.length} required strands covered`
      };
    }

    // Also require at least 3 different strands for general coverage
    if (strandsCovered.length < 3) {
      return { shouldStop: false, reason: 'Need at least 3 strands for comprehensive assessment' };
    }

    return { shouldStop: true, reason: 'Target precision achieved with comprehensive coverage' };
  }

  // Log progress for debugging
  console.log(`Adaptive: Questions: ${numQuestions}, SE: ${session.standardError.toFixed(3)}, Strands: ${strandsCovered.length}, Required coverage: ${Math.round(requiredCoveragePercentage * 100)}%`);

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
