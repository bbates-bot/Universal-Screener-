import {
  ExtendedQuestion,
  QuestionSubject,
  QuestionFormat,
  QuestionBankFile
} from '../types';

// In-memory cache for loaded questions
const questionCache: Map<string, ExtendedQuestion[]> = new Map();

// Map of grade levels to their domain files
const MATH_DOMAINS: Record<string, string[]> = {
  'K': ['cc'],
  '1': ['oa'],
  '2': ['oa'],
  '3': ['nf'],
  '4': ['nf'],
  '5': ['nf'],
  '6': ['ee'],
  '7': ['rp'],
  '8': ['ee'],
  '9': ['a-sse'],
  '10': ['g-srt'],
  '11': ['f-if'],
  '12': ['s-id'],
  'ap-precalculus': ['functions'],
  'ap-calculus-ab': ['functions'],
  'ap-calculus-bc': ['functions'],
  'ap-statistics': ['inference'],
  'ap-macroeconomics': ['prerequisite']
};

const READING_DOMAINS: Record<string, string[]> = {
  'K': ['rf', 'rc'],
  '1': ['rf', 'rc'],
  '2': ['rl', 'rc'],
  '3': ['rl', 'rc'],
  '4': ['ri', 'rc'],
  '5': ['rl', 'rc'],
  '6': ['ri', 'rc'],
  '7': ['rl', 'rc'],
  '8': ['ri', 'rc'],
  '9': ['rl', 'rc'],
  '10': ['rl', 'rc'],
  '11': ['ri', 'rc'],
  '12': ['rl', 'rc']
};

const EDEXCEL_MATH_STAGES = ['pre-ig1', 'pre-ig2', 'ig1', 'ig2'];
const EDEXCEL_ENGLISH_STAGES = ['pre-ig1', 'ig2'];

/**
 * Normalize a question from different formats to ExtendedQuestion
 * Handles legacy formats that use questionText/options instead of text/questionOptions
 */
const normalizeQuestion = (q: any): ExtendedQuestion | null => {
  // If already in correct format with valid questionOptions, return as-is
  if (q.text && q.questionOptions) {
    return q as ExtendedQuestion;
  }

  const format = q.format || 'multiple_choice';
  let questionOptions: any = null;

  // Build questionOptions based on the format
  switch (format) {
    case 'multiple_choice':
      if (q.questionOptions) {
        questionOptions = q.questionOptions;
      } else if (q.options && q.correctAnswer) {
        questionOptions = {
          choices: q.options,
          correctAnswer: q.correctAnswer
        };
      }
      break;

    case 'true_false':
      if (q.questionOptions) {
        questionOptions = q.questionOptions;
      } else if (q.correctAnswer !== undefined) {
        // Convert string "True"/"False" to boolean
        let boolAnswer: boolean;
        if (typeof q.correctAnswer === 'boolean') {
          boolAnswer = q.correctAnswer;
        } else if (typeof q.correctAnswer === 'string') {
          boolAnswer = q.correctAnswer.toLowerCase() === 'true';
        } else {
          return null; // Invalid true_false question
        }
        questionOptions = {
          correctAnswer: boolAnswer
        };
      }
      break;

    case 'matching':
      if (q.questionOptions) {
        questionOptions = q.questionOptions;
      } else if (q.matchingPairs && Array.isArray(q.matchingPairs)) {
        // Convert matchingPairs array to leftItems/rightItems/correctMatches
        const leftItems: string[] = [];
        const rightItems: string[] = [];
        const correctMatches: Record<number, number> = {};

        q.matchingPairs.forEach((pair: { left: string; right: string }, index: number) => {
          leftItems.push(pair.left);
          rightItems.push(pair.right);
          correctMatches[index] = index; // Matching pairs are 1:1 in original order
        });

        questionOptions = {
          leftItems,
          rightItems,
          correctMatches
        };
      }
      break;

    case 'drag_and_drop':
      if (q.questionOptions) {
        questionOptions = q.questionOptions;
      } else if (q.dragItems && q.dropZones && q.correctArrangement) {
        // Convert drag_and_drop format
        const draggableItems: string[] = q.dragItems;
        const dropZones = q.dropZones.map((zone: string, idx: number) => ({
          id: `zone-${idx}`,
          label: zone
        }));

        // correctArrangement is the items in the order they should be placed
        const correctPlacements: Record<number, number> = {};
        q.correctArrangement.forEach((item: string, zoneIdx: number) => {
          const itemIdx = draggableItems.indexOf(item);
          if (itemIdx !== -1) {
            correctPlacements[itemIdx] = zoneIdx;
          }
        });

        questionOptions = {
          draggableItems,
          dropZones,
          correctPlacements
        };
      }
      break;

    case 'picture_choice':
      if (q.questionOptions) {
        questionOptions = q.questionOptions;
      } else if (q.images && q.correctAnswerIndex !== undefined) {
        // Convert legacy picture_choice format
        questionOptions = {
          images: q.images,
          correctAnswerIndex: q.correctAnswerIndex
        };
      }
      break;

    default:
      // Unknown format, skip this question
      return null;
  }

  // If we couldn't build valid questionOptions, skip this question
  if (!questionOptions) {
    console.warn(`Skipping question ${q.id}: couldn't build valid questionOptions for format ${format}`);
    return null;
  }

  // Normalize from legacy format
  const normalized: ExtendedQuestion = {
    id: q.id,
    bankId: q.bankId || q.id,
    text: q.text || q.questionText || '',
    format: format,
    questionOptions: questionOptions,
    subject: q.subject || 'Mathematics',
    gradeLevel: q.gradeLevel || '',
    strand: q.strand || '',
    difficulty: q.difficulty || 3,
    ccssStandards: q.ccssStandards || [],
    primaryStandard: q.primaryStandard || (q.ccssStandards?.[0] || ''),
    source: q.source || 'static',
    reviewStatus: q.reviewStatus || 'approved',
    timesUsed: q.timesUsed || 0,
    correctRate: q.correctRate || 0,
    averageTimeSeconds: q.averageTimeSeconds || 0,
    explanation: q.explanation
  };

  return normalized;
};

/**
 * Load questions from a static JSON file
 */
const loadQuestionsFromFile = async (path: string): Promise<ExtendedQuestion[]> => {
  console.log(`[QuestionBank] Loading questions from: ${path}`);
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`[QuestionBank] Failed to load from ${path}: HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    const questions = data.questions || [];
    console.log(`[QuestionBank] Loaded ${questions.length} raw questions from ${path}`);

    // Normalize all questions to handle different formats, filter out invalid ones
    const normalized = questions
      .map(normalizeQuestion)
      .filter((q: ExtendedQuestion | null): q is ExtendedQuestion => q !== null);

    console.log(`[QuestionBank] After normalization: ${normalized.length} valid questions`);
    return normalized;
  } catch (error) {
    console.warn(`[QuestionBank] Error loading from ${path}:`, error);
    return [];
  }
};

/**
 * Load all questions for a specific grade and subject
 */
export const loadAllQuestionsForGrade = async (
  subject: QuestionSubject | string,
  gradeOrStage: string
): Promise<ExtendedQuestion[]> => {
  console.log(`[QuestionBank] loadAllQuestionsForGrade called with subject="${subject}", gradeOrStage="${gradeOrStage}"`);
  const cacheKey = `${subject}-${gradeOrStage}`;

  if (questionCache.has(cacheKey)) {
    console.log(`[QuestionBank] Returning ${questionCache.get(cacheKey)!.length} cached questions for ${cacheKey}`);
    return questionCache.get(cacheKey)!;
  }

  let questions: ExtendedQuestion[] = [];

  // Handle different subject types
  if (subject === 'Mathematics' || subject === 'Math') {
    const domains = MATH_DOMAINS[gradeOrStage] || MATH_DOMAINS[gradeOrStage.toLowerCase()];
    if (domains) {
      for (const domain of domains) {
        const path = `/data/question-bank/math/${gradeOrStage.toLowerCase()}/${domain}.json`;
        const domainQuestions = await loadQuestionsFromFile(path);
        questions.push(...domainQuestions);
      }
    }
  } else if (subject === 'Reading' || subject === 'Reading Foundations' || subject === 'Reading Comprehension' || subject === 'ELA') {
    // Determine which domains to load based on subject
    let domains: string[] | undefined;

    if (subject === 'Reading Comprehension') {
      // Reading Comprehension only loads 'rc' domain
      domains = ['rc'];
    } else {
      // Other reading/ELA subjects load all available domains for the grade
      domains = READING_DOMAINS[gradeOrStage] || READING_DOMAINS[gradeOrStage.toLowerCase()];
    }

    if (domains) {
      for (const domain of domains) {
        const path = `/data/question-bank/reading/${gradeOrStage.toLowerCase()}/${domain}.json`;
        const domainQuestions = await loadQuestionsFromFile(path);
        // Update subject to match what was requested for consistency
        const adjustedQuestions = domainQuestions.map(q => ({
          ...q,
          subject: subject as any
        }));
        questions.push(...adjustedQuestions);
      }
    }
  } else if (subject.includes('Edexcel Math')) {
    // Map subject to stage
    const stageMap: Record<string, string> = {
      'Edexcel Math Pre-IG1': 'pre-ig1',
      'Edexcel Math Pre-IG2': 'pre-ig2',
      'Edexcel Math IG1': 'ig1',
      'Edexcel Math IG2': 'ig2'
    };
    const stage = stageMap[subject] || gradeOrStage.toLowerCase();
    const path = `/data/question-bank/edexcel-math/${stage}/questions.json`;
    questions = await loadQuestionsFromFile(path);
  } else if (subject.includes('Edexcel English')) {
    const stageMap: Record<string, string> = {
      'Edexcel English Pre-IG1': 'pre-ig1',
      'Edexcel English Pre-IG2': 'pre-ig2',
      'Edexcel English IG1': 'ig1',
      'Edexcel English IG2': 'ig2'
    };
    const stage = stageMap[subject] || gradeOrStage.toLowerCase();
    const path = `/data/question-bank/edexcel-english/${stage}/questions.json`;
    questions = await loadQuestionsFromFile(path);
  } else if (subject.includes('AP')) {
    // AP courses
    const apMap: Record<string, string> = {
      'AP Pre-Calculus': 'ap-precalculus',
      'AP Precalculus': 'ap-precalculus',
      'AP Calculus AB': 'ap-calculus-ab',
      'AP Calculus BC': 'ap-calculus-bc',
      'AP Statistics': 'ap-statistics',
      'AP Macroeconomics': 'ap-macroeconomics'
    };
    const apPath = apMap[subject];
    if (apPath) {
      const domains = MATH_DOMAINS[apPath];
      if (domains) {
        for (const domain of domains) {
          const path = `/data/question-bank/math/${apPath}/${domain}.json`;
          const domainQuestions = await loadQuestionsFromFile(path);
          questions.push(...domainQuestions);
        }
      }
    }
  }

  console.log(`[QuestionBank] Total questions loaded for ${cacheKey}: ${questions.length}`);
  questionCache.set(cacheKey, questions);
  return questions;
};

/**
 * Get domains available for a specific grade
 */
export const getDomainsForGrade = (grade: string): string[] => {
  const elementaryDomains = [
    'Counting & Cardinality',
    'Operations & Algebraic Thinking',
    'Number & Operations in Base Ten',
    'Measurement & Data',
    'Geometry'
  ];

  const middleSchoolDomains = [
    'Ratios & Proportional Relationships',
    'The Number System',
    'Expressions & Equations',
    'Geometry',
    'Statistics & Probability'
  ];

  const highSchoolDomains = [
    'Number & Quantity',
    'Algebra',
    'Functions',
    'Geometry',
    'Statistics & Probability'
  ];

  const gradeNum = grade === 'K' ? 0 : parseInt(grade);

  if (gradeNum <= 5) return elementaryDomains;
  if (gradeNum <= 8) return middleSchoolDomains;
  return highSchoolDomains;
};

/**
 * Fetch questions from the question bank for a specific subject
 */
export const fetchQuestionBankForSubject = async (
  subject: QuestionSubject | string,
  grade: string
): Promise<ExtendedQuestion[]> => {
  return loadAllQuestionsForGrade(subject, grade);
};

/**
 * Fetch questions matching specific standards
 */
export const fetchQuestionsByStandards = async (
  standards: string[],
  subject: QuestionSubject
): Promise<ExtendedQuestion[]> => {
  // Load all questions for the subject across grades
  const allQuestions: ExtendedQuestion[] = [];
  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  for (const grade of grades) {
    const questions = await loadAllQuestionsForGrade(subject, grade);
    allQuestions.push(...questions);
  }

  // Filter by standards
  return allQuestions.filter(q =>
    q.ccssStandards?.some(std => standards.includes(std))
  );
};

/**
 * Get the grade range for a subject
 */
export const getGradeRange = (subject: QuestionSubject | string): string[] => {
  if (subject.includes('Edexcel')) {
    return ['pre-ig1', 'pre-ig2', 'ig1', 'ig2'];
  }
  if (subject.includes('AP')) {
    return ['11', '12'];
  }
  return ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
};

/**
 * Get questions with balanced format distribution
 */
export const getQuestionsWithFormatDistribution = (
  questions: ExtendedQuestion[],
  count: number
): ExtendedQuestion[] => {
  if (questions.length <= count) return questions;

  // Target distribution
  const targets: Record<QuestionFormat, number> = {
    [QuestionFormat.MULTIPLE_CHOICE]: Math.floor(count * 0.55),
    [QuestionFormat.TRUE_FALSE]: Math.floor(count * 0.15),
    [QuestionFormat.MATCHING]: Math.floor(count * 0.12),
    [QuestionFormat.DRAG_AND_DROP]: Math.floor(count * 0.10),
    [QuestionFormat.PICTURE_CHOICE]: Math.floor(count * 0.08)
  };

  const selected: ExtendedQuestion[] = [];
  const byFormat: Record<QuestionFormat, ExtendedQuestion[]> = {
    [QuestionFormat.MULTIPLE_CHOICE]: [],
    [QuestionFormat.TRUE_FALSE]: [],
    [QuestionFormat.MATCHING]: [],
    [QuestionFormat.DRAG_AND_DROP]: [],
    [QuestionFormat.PICTURE_CHOICE]: []
  };

  // Group questions by format
  questions.forEach(q => {
    const format = q.format as QuestionFormat;
    if (byFormat[format]) {
      byFormat[format].push(q);
    }
  });

  // Select questions based on target distribution
  Object.entries(targets).forEach(([format, target]) => {
    const formatQuestions = byFormat[format as QuestionFormat];
    const shuffled = [...formatQuestions].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, target));
  });

  // Fill remaining slots with any available questions
  const usedIds = new Set(selected.map(q => q.id));
  const remaining = questions.filter(q => !usedIds.has(q.id));
  const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);

  while (selected.length < count && shuffledRemaining.length > 0) {
    selected.push(shuffledRemaining.pop()!);
  }

  return selected;
};

/**
 * Clear the question cache (useful after updates)
 */
export const clearQuestionCache = (): void => {
  questionCache.clear();
};

/**
 * Get adjacent grade levels for comprehensive assessment
 * Returns current grade plus one grade above and below (when available)
 */
export const getAdjacentGradeLevels = (grade: string): string[] => {
  const gradeOrder = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const currentIndex = gradeOrder.indexOf(grade);

  if (currentIndex === -1) {
    // Handle AP/Edexcel or unknown grades
    return [grade];
  }

  const levels: string[] = [grade]; // Always include current grade

  // Add one grade below (for easier questions)
  if (currentIndex > 0) {
    levels.push(gradeOrder[currentIndex - 1]);
  }

  // Add one grade above (for challenge questions)
  if (currentIndex < gradeOrder.length - 1) {
    levels.push(gradeOrder[currentIndex + 1]);
  }

  return levels;
};

/**
 * Load questions from multiple grade levels for comprehensive screener assessment
 * This ensures students are tested across a range (current grade ±1) while
 * never adapting more than one grade level away
 */
export const loadQuestionsForScreener = async (
  subject: QuestionSubject | string,
  grade: string,
  options?: {
    includeAdjacentGrades?: boolean;
    minQuestionsPerStrand?: number;
  }
): Promise<ExtendedQuestion[]> => {
  const includeAdjacent = options?.includeAdjacentGrades ?? true;

  // Get all grades to load from
  const gradesToLoad = includeAdjacent ? getAdjacentGradeLevels(grade) : [grade];

  console.log(`[QuestionBank] Loading screener questions for grade ${grade}, including grades: ${gradesToLoad.join(', ')}`);

  // Load questions from all relevant grades
  const allQuestions: ExtendedQuestion[] = [];
  for (const g of gradesToLoad) {
    const questions = await loadAllQuestionsForGrade(subject, g);
    allQuestions.push(...questions);
  }

  // Deduplicate by question ID (in case same question appears in multiple banks)
  const uniqueQuestions = Array.from(
    new Map(allQuestions.map(q => [q.id, q])).values()
  );

  console.log(`[QuestionBank] Loaded ${uniqueQuestions.length} unique questions across ${gradesToLoad.length} grade levels`);

  return uniqueQuestions;
};

/**
 * Get questions ensuring coverage across all required strands
 * This ensures a complete snapshot of learner ability across learning objectives
 */
export const getQuestionsWithStrandCoverage = (
  questions: ExtendedQuestion[],
  targetCount: number,
  minPerStrand: number = 2
): ExtendedQuestion[] => {
  // Group questions by strand
  const byStrand: Map<string, ExtendedQuestion[]> = new Map();

  questions.forEach(q => {
    const strand = q.strand || 'General';
    if (!byStrand.has(strand)) {
      byStrand.set(strand, []);
    }
    byStrand.get(strand)!.push(q);
  });

  const strands = Array.from(byStrand.keys());
  console.log(`[QuestionBank] Found ${strands.length} unique strands: ${strands.join(', ')}`);

  const selected: ExtendedQuestion[] = [];
  const usedIds = new Set<string>();

  // First pass: ensure minimum coverage per strand
  strands.forEach(strand => {
    const strandQuestions = byStrand.get(strand)!;
    const shuffled = [...strandQuestions].sort(() => Math.random() - 0.5);

    let added = 0;
    for (const q of shuffled) {
      if (added >= minPerStrand) break;
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
        added++;
      }
    }
  });

  console.log(`[QuestionBank] Selected ${selected.length} questions for strand coverage (min ${minPerStrand} per strand)`);

  // Second pass: fill remaining slots with balanced difficulty
  if (selected.length < targetCount) {
    const remaining = questions.filter(q => !usedIds.has(q.id));

    // Sort by difficulty to get a good mix
    const byDifficulty = [...remaining].sort((a, b) => (a.difficulty || 3) - (b.difficulty || 3));

    // Take from different difficulty levels
    const easy = byDifficulty.filter(q => (q.difficulty || 3) <= 2);
    const medium = byDifficulty.filter(q => (q.difficulty || 3) === 3);
    const hard = byDifficulty.filter(q => (q.difficulty || 3) >= 4);

    const shuffleAndTake = (arr: ExtendedQuestion[], count: number) => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    };

    const slotsRemaining = targetCount - selected.length;
    const easyCount = Math.floor(slotsRemaining * 0.3);
    const hardCount = Math.floor(slotsRemaining * 0.2);
    const mediumCount = slotsRemaining - easyCount - hardCount;

    const additionalQuestions = [
      ...shuffleAndTake(easy, easyCount),
      ...shuffleAndTake(medium, mediumCount),
      ...shuffleAndTake(hard, hardCount)
    ];

    for (const q of additionalQuestions) {
      if (selected.length >= targetCount) break;
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }
  }

  // Shuffle final selection to avoid predictable ordering
  const finalSelection = [...selected].sort(() => Math.random() - 0.5);

  console.log(`[QuestionBank] Final selection: ${finalSelection.length} questions`);

  return finalSelection;
};

/**
 * Load all available questions for all grades of a subject
 */
export const loadAllQuestionsForSubject = async (
  subject: QuestionSubject | string
): Promise<ExtendedQuestion[]> => {
  const grades = getGradeRange(subject);
  const allQuestions: ExtendedQuestion[] = [];

  for (const grade of grades) {
    const questions = await loadAllQuestionsForGrade(subject, grade);
    allQuestions.push(...questions);
  }

  return allQuestions;
};
