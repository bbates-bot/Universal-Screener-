import { ScreenerLevel, School, Student, StudentResult, DifficultyLevel, QuestionFormat } from './types';

export const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Advanced Placement (AP) course options
export const AP_COURSES = [
  'AP Pre-Calculus',
  'AP Calculus AB',
  'AP Calculus BC',
  'AP Statistics',
  'AP Macroeconomics',
  'AP English Language',
  'AP English Literature'
];

// All available subjects including AP
export const ALL_SUBJECTS = [
  'Mathematics',
  'Reading',
  'Reading Comprehension',
  'ELA',
  'AP Pre-Calculus',
  'AP Statistics',
  'AP Macroeconomics'
];

export const MATH_STRANDS = [
  'Numbers & Operations',
  'Algebra & Algebraic Thinking',
  'Fractions',
  'Geometry',
  'Data & Measurement'
];

export const READING_STRANDS = [
  'Phonological Awareness',
  'Phonics & Word Recognition',
  'Vocabulary Acquisition',
  'Key Ideas & Details',
  'Craft & Structure'
];

export const ELA_STRANDS = [
  'Language',
  'Writing',
  'Speaking & Listening'
];

export const AP_MATH_STRANDS = [
  'Polynomial & Rational Functions',
  'Exponential & Logarithmic Functions',
  'Trigonometric Functions',
  'Limits & Continuity',
  'Statistical Inference',
  'Data Exploration'
];

export const AP_ENGLISH_STRANDS = [
  'Rhetorical Situation',
  'Claims & Evidence',
  'Reasoning & Organization',
  'Style & Citation',
  'Literary Analysis',
  'Structural Interpretation'
];

// AP Macroeconomics Prerequisite Assessment Strands
export const AP_MACROECONOMICS_STRANDS = [
  'Mathematical Skills',
  'Graph Interpretation',
  'Basic Economic Concepts',
  'Analytical Reasoning'
];

// Pearson Edexcel IGCSE Mathematics Strands
export const EDEXCEL_MATH_STRANDS = [
  'Number',
  'Algebra',
  'Ratio, Proportion & Rates of Change',
  'Geometry & Measures',
  'Probability',
  'Statistics'
];

// Pearson Edexcel IGCSE English Language Strands
export const EDEXCEL_ENGLISH_STRANDS = [
  'Reading Comprehension',
  'Transactional Writing',
  'Imaginative Writing',
  'Grammar & Vocabulary',
  'Text Analysis',
  'Spoken Language'
];

// CCSS Domain Codes by Grade Level
export const CCSS_MATH_DOMAINS: Record<string, { code: string; name: string }[]> = {
  K: [
    { code: 'CC', name: 'Counting & Cardinality' },
    { code: 'OA', name: 'Operations & Algebraic Thinking' },
    { code: 'NBT', name: 'Number & Operations in Base Ten' },
    { code: 'MD', name: 'Measurement & Data' },
    { code: 'G', name: 'Geometry' }
  ],
  '1': [
    { code: 'OA', name: 'Operations & Algebraic Thinking' },
    { code: 'NBT', name: 'Number & Operations in Base Ten' },
    { code: 'MD', name: 'Measurement & Data' },
    { code: 'G', name: 'Geometry' }
  ],
  '2': [
    { code: 'OA', name: 'Operations & Algebraic Thinking' },
    { code: 'NBT', name: 'Number & Operations in Base Ten' },
    { code: 'MD', name: 'Measurement & Data' },
    { code: 'G', name: 'Geometry' }
  ],
  '3': [
    { code: 'OA', name: 'Operations & Algebraic Thinking' },
    { code: 'NBT', name: 'Number & Operations in Base Ten' },
    { code: 'NF', name: 'Number & Operations - Fractions' },
    { code: 'MD', name: 'Measurement & Data' },
    { code: 'G', name: 'Geometry' }
  ],
  '4': [
    { code: 'OA', name: 'Operations & Algebraic Thinking' },
    { code: 'NBT', name: 'Number & Operations in Base Ten' },
    { code: 'NF', name: 'Number & Operations - Fractions' },
    { code: 'MD', name: 'Measurement & Data' },
    { code: 'G', name: 'Geometry' }
  ],
  '5': [
    { code: 'OA', name: 'Operations & Algebraic Thinking' },
    { code: 'NBT', name: 'Number & Operations in Base Ten' },
    { code: 'NF', name: 'Number & Operations - Fractions' },
    { code: 'MD', name: 'Measurement & Data' },
    { code: 'G', name: 'Geometry' }
  ],
  '6': [
    { code: 'RP', name: 'Ratios & Proportional Relationships' },
    { code: 'NS', name: 'The Number System' },
    { code: 'EE', name: 'Expressions & Equations' },
    { code: 'G', name: 'Geometry' },
    { code: 'SP', name: 'Statistics & Probability' }
  ],
  '7': [
    { code: 'RP', name: 'Ratios & Proportional Relationships' },
    { code: 'NS', name: 'The Number System' },
    { code: 'EE', name: 'Expressions & Equations' },
    { code: 'G', name: 'Geometry' },
    { code: 'SP', name: 'Statistics & Probability' }
  ],
  '8': [
    { code: 'NS', name: 'The Number System' },
    { code: 'EE', name: 'Expressions & Equations' },
    { code: 'F', name: 'Functions' },
    { code: 'G', name: 'Geometry' },
    { code: 'SP', name: 'Statistics & Probability' }
  ],
  '9': [
    { code: 'N-RN', name: 'Real Number System' },
    { code: 'A-SSE', name: 'Seeing Structure in Expressions' },
    { code: 'A-CED', name: 'Creating Equations' },
    { code: 'F-IF', name: 'Interpreting Functions' },
    { code: 'F-BF', name: 'Building Functions' }
  ],
  '10': [
    { code: 'N-RN', name: 'Real Number System' },
    { code: 'A-SSE', name: 'Seeing Structure in Expressions' },
    { code: 'A-CED', name: 'Creating Equations' },
    { code: 'F-IF', name: 'Interpreting Functions' },
    { code: 'G-CO', name: 'Congruence' }
  ],
  '11': [
    { code: 'N-CN', name: 'Complex Number System' },
    { code: 'A-APR', name: 'Arithmetic with Polynomials' },
    { code: 'F-TF', name: 'Trigonometric Functions' },
    { code: 'G-SRT', name: 'Similarity, Right Triangles' },
    { code: 'S-ID', name: 'Interpreting Data' }
  ],
  '12': [
    { code: 'N-CN', name: 'Complex Number System' },
    { code: 'A-APR', name: 'Arithmetic with Polynomials' },
    { code: 'F-TF', name: 'Trigonometric Functions' },
    { code: 'G-SRT', name: 'Similarity, Right Triangles' },
    { code: 'S-IC', name: 'Making Inferences' }
  ]
};

export const CCSS_READING_DOMAINS: Record<string, { code: string; name: string }[]> = {
  default: [
    { code: 'RL', name: 'Reading Literature' },
    { code: 'RI', name: 'Reading Informational Text' },
    { code: 'RF', name: 'Reading Foundational Skills' }
  ]
};

export const CCSS_ELA_DOMAINS: Record<string, { code: string; name: string }[]> = {
  default: [
    { code: 'W', name: 'Writing' },
    { code: 'SL', name: 'Speaking & Listening' },
    { code: 'L', name: 'Language' }
  ]
};

// Pearson Edexcel IGCSE Mathematics Domains by Stage
export const EDEXCEL_MATH_DOMAINS: Record<string, { code: string; name: string }[]> = {
  'Pre-IG1': [
    { code: 'N1', name: 'Number Operations & Place Value' },
    { code: 'A1', name: 'Algebraic Notation & Expressions' },
    { code: 'R1', name: 'Fractions, Decimals & Percentages' },
    { code: 'G1', name: 'Properties of Shapes' },
    { code: 'S1', name: 'Data Handling & Representation' }
  ],
  'Pre-IG2': [
    { code: 'N2', name: 'Factors, Multiples & Primes' },
    { code: 'A2', name: 'Equations & Formulae' },
    { code: 'R2', name: 'Ratio & Proportion' },
    { code: 'G2', name: 'Angles & Transformations' },
    { code: 'P1', name: 'Probability Fundamentals' },
    { code: 'S2', name: 'Statistical Measures' }
  ],
  'IG1': [
    { code: 'N3', name: 'Surds & Indices' },
    { code: 'A3', name: 'Linear & Quadratic Equations' },
    { code: 'R3', name: 'Compound Measures & Scale' },
    { code: 'G3', name: 'Congruence & Similarity' },
    { code: 'G4', name: 'Pythagoras & Trigonometry' },
    { code: 'P2', name: 'Combined Events & Tree Diagrams' },
    { code: 'S3', name: 'Cumulative Frequency & Box Plots' }
  ],
  'IG2': [
    { code: 'N4', name: 'Standard Form & Bounds' },
    { code: 'A4', name: 'Functions & Graph Transformations' },
    { code: 'A5', name: 'Simultaneous & Quadratic Equations' },
    { code: 'G5', name: 'Circle Theorems' },
    { code: 'G6', name: 'Vectors' },
    { code: 'G7', name: 'Advanced Trigonometry' },
    { code: 'P3', name: 'Conditional Probability' },
    { code: 'S4', name: 'Histograms & Correlation' }
  ]
};

// Pearson Edexcel IGCSE English Language Domains by Stage
export const EDEXCEL_ENGLISH_DOMAINS: Record<string, { code: string; name: string }[]> = {
  'Pre-IG1': [
    { code: 'RC1', name: 'Literal Comprehension' },
    { code: 'RC2', name: 'Inference & Deduction' },
    { code: 'W1', name: 'Sentence Structure & Paragraphing' },
    { code: 'G1', name: 'Grammar Foundations' },
    { code: 'V1', name: 'Vocabulary Development' }
  ],
  'Pre-IG2': [
    { code: 'RC3', name: 'Analysis of Language Effects' },
    { code: 'RC4', name: 'Comparison of Texts' },
    { code: 'W2', name: 'Transactional Writing Formats' },
    { code: 'W3', name: 'Descriptive & Narrative Writing' },
    { code: 'G2', name: 'Punctuation & Sentence Variety' },
    { code: 'V2', name: 'Word Classes & Connotation' }
  ],
  'IG1': [
    { code: 'RC5', name: 'Evaluating Writer\'s Purpose' },
    { code: 'RC6', name: 'Synthesising Information' },
    { code: 'W4', name: 'Argue, Persuade & Advise' },
    { code: 'W5', name: 'Creative Writing Techniques' },
    { code: 'TA1', name: 'Structural Analysis' },
    { code: 'G3', name: 'Advanced Grammar & Style' }
  ],
  'IG2': [
    { code: 'RC7', name: 'Critical Evaluation' },
    { code: 'RC8', name: 'Analysing Perspectives & Bias' },
    { code: 'W6', name: 'Extended Transactional Writing' },
    { code: 'W7', name: 'Extended Imaginative Writing' },
    { code: 'TA2', name: 'Language & Form Analysis' },
    { code: 'SL1', name: 'Spoken Language Skills' }
  ]
};

// Question Format Distribution (recommended percentages)
export const QUESTION_FORMAT_DISTRIBUTION = {
  [QuestionFormat.MULTIPLE_CHOICE]: 0.60,
  [QuestionFormat.TRUE_FALSE]: 0.15,
  [QuestionFormat.MATCHING]: 0.15,
  [QuestionFormat.DRAG_AND_DROP]: 0.10
};

// Difficulty Distribution (recommended percentages)
export const DIFFICULTY_DISTRIBUTION = {
  [DifficultyLevel.VERY_EASY]: 0.15,
  [DifficultyLevel.EASY]: 0.25,
  [DifficultyLevel.MEDIUM]: 0.30,
  [DifficultyLevel.HARD]: 0.20,
  [DifficultyLevel.VERY_HARD]: 0.10
};

// Adaptive Testing Defaults
export const ADAPTIVE_TEST_CONFIG = {
  MIN_QUESTIONS: 15,
  MAX_QUESTIONS: 25,
  TARGET_STANDARD_ERROR: 0.3,
  MAX_TIME_MINUTES: 25,
  STARTING_THETA: 0,
  STATIC_QUESTION_RATIO: 0.7,
  AI_QUESTION_RATIO: 0.3
};

// Question counts per grade/subject
export const TARGET_QUESTIONS_PER_GRADE_SUBJECT = {
  elementary: 150, // K-5
  middle: 175,     // 6-8
  high: 200        // 9-12
};

// Comprehensive CCSS Learning Objectives Mapping
// Maps specific standard codes to human-readable learning objective descriptions
export const CCSS_LEARNING_OBJECTIVES: Record<string, string> = {
  // ============================================
  // ELA - LANGUAGE STANDARDS (L)
  // ============================================
  // Grade 3 Language
  'CCSS.ELA-LITERACY.L.3.1': 'Demonstrate command of grammar and usage',
  'CCSS.ELA-LITERACY.L.3.1.A': 'Explain the function of nouns, pronouns, verbs, adjectives, and adverbs',
  'CCSS.ELA-LITERACY.L.3.1.B': 'Form and use regular and irregular plural nouns',
  'CCSS.ELA-LITERACY.L.3.1.C': 'Use abstract nouns (e.g., childhood)',
  'CCSS.ELA-LITERACY.L.3.1.D': 'Form and use regular and irregular verbs',
  'CCSS.ELA-LITERACY.L.3.1.E': 'Form and use simple verb tenses',
  'CCSS.ELA-LITERACY.L.3.1.F': 'Ensure subject-verb and pronoun-antecedent agreement',
  'CCSS.ELA-LITERACY.L.3.1.G': 'Form and use comparative and superlative adjectives',
  'CCSS.ELA-LITERACY.L.3.1.H': 'Use coordinating and subordinating conjunctions',
  'CCSS.ELA-LITERACY.L.3.1.I': 'Produce simple, compound, and complex sentences',
  'CCSS.ELA-LITERACY.L.3.2': 'Demonstrate command of capitalization, punctuation, and spelling',
  'CCSS.ELA-LITERACY.L.3.2.A': 'Capitalize appropriate words in titles',
  'CCSS.ELA-LITERACY.L.3.2.B': 'Use commas in addresses',
  'CCSS.ELA-LITERACY.L.3.2.C': 'Use commas and quotation marks in dialogue',
  'CCSS.ELA-LITERACY.L.3.2.D': 'Form and use possessives',
  'CCSS.ELA-LITERACY.L.3.2.E': 'Use spelling patterns and generalizations',
  'CCSS.ELA-LITERACY.L.3.2.F': 'Consult reference materials for spelling',
  'CCSS.ELA-LITERACY.L.3.3': 'Use knowledge of language and conventions',
  'CCSS.ELA-LITERACY.L.3.3.A': 'Choose words and phrases for effect',
  'CCSS.ELA-LITERACY.L.3.3.B': 'Recognize differences between spoken and written English',
  'CCSS.ELA-LITERACY.L.3.4': 'Determine meaning of unknown words',
  'CCSS.ELA-LITERACY.L.3.4.A': 'Use sentence-level context for word meaning',
  'CCSS.ELA-LITERACY.L.3.4.B': 'Determine meaning using prefixes and suffixes',
  'CCSS.ELA-LITERACY.L.3.4.C': 'Use root words to determine meaning',
  'CCSS.ELA-LITERACY.L.3.4.D': 'Use glossaries and dictionaries',
  'CCSS.ELA-LITERACY.L.3.5': 'Understand word relationships and nuances',
  'CCSS.ELA-LITERACY.L.3.5.A': 'Distinguish literal and nonliteral meanings',
  'CCSS.ELA-LITERACY.L.3.5.B': 'Identify real-life connections between words',
  'CCSS.ELA-LITERACY.L.3.5.C': 'Distinguish shades of meaning in related words',
  'CCSS.ELA-LITERACY.L.3.6': 'Acquire and use academic vocabulary',

  // Grades K-2 Language (common patterns)
  'CCSS.ELA-LITERACY.L.K.1': 'Demonstrate command of grammar (Kindergarten)',
  'CCSS.ELA-LITERACY.L.K.2': 'Demonstrate command of capitalization and spelling (K)',
  'CCSS.ELA-LITERACY.L.1.1': 'Demonstrate command of grammar (Grade 1)',
  'CCSS.ELA-LITERACY.L.1.2': 'Demonstrate command of conventions (Grade 1)',
  'CCSS.ELA-LITERACY.L.2.1': 'Demonstrate command of grammar (Grade 2)',
  'CCSS.ELA-LITERACY.L.2.2': 'Demonstrate command of conventions (Grade 2)',

  // Grades 4-5 Language
  'CCSS.ELA-LITERACY.L.4.1': 'Demonstrate command of grammar (Grade 4)',
  'CCSS.ELA-LITERACY.L.4.1.A': 'Use relative pronouns and adverbs',
  'CCSS.ELA-LITERACY.L.4.1.B': 'Form and use progressive verb tenses',
  'CCSS.ELA-LITERACY.L.4.2': 'Demonstrate command of conventions (Grade 4)',
  'CCSS.ELA-LITERACY.L.4.4.B': 'Use Greek and Latin affixes and roots',
  'CCSS.ELA-LITERACY.L.5.1': 'Demonstrate command of grammar (Grade 5)',
  'CCSS.ELA-LITERACY.L.5.2': 'Demonstrate command of conventions (Grade 5)',

  // Grades 6-8 Language
  'CCSS.ELA-LITERACY.L.6.1': 'Demonstrate command of grammar (Grade 6)',
  'CCSS.ELA-LITERACY.L.6.2': 'Demonstrate command of conventions (Grade 6)',
  'CCSS.ELA-LITERACY.L.7.1': 'Demonstrate command of grammar (Grade 7)',
  'CCSS.ELA-LITERACY.L.8.1': 'Demonstrate command of grammar (Grade 8)',

  // High School Language
  'CCSS.ELA-LITERACY.L.9-10.1': 'Demonstrate command of grammar (Grades 9-10)',
  'CCSS.ELA-LITERACY.L.11-12.1': 'Demonstrate command of grammar (Grades 11-12)',

  // ============================================
  // ELA - READING LITERATURE (RL)
  // ============================================
  'CCSS.ELA-LITERACY.RL.3.1': 'Ask and answer questions about text details',
  'CCSS.ELA-LITERACY.RL.3.2': 'Recount stories and determine central message/theme',
  'CCSS.ELA-LITERACY.RL.3.3': 'Describe characters and explain how actions contribute to events',
  'CCSS.ELA-LITERACY.RL.3.4': 'Determine meaning of words and phrases in text',
  'CCSS.ELA-LITERACY.RL.3.5': 'Refer to parts of stories using terms like chapter and scene',
  'CCSS.ELA-LITERACY.RL.3.6': 'Distinguish own point of view from narrator or characters',
  'CCSS.ELA-LITERACY.RL.3.7': 'Explain how illustrations contribute to story',
  'CCSS.ELA-LITERACY.RL.3.9': 'Compare and contrast themes in stories by same author',
  'CCSS.ELA-LITERACY.RL.3.10': 'Read and comprehend literature independently',

  // Other RL grades
  'CCSS.ELA-LITERACY.RL.K.1': 'Ask and answer questions about key details (K)',
  'CCSS.ELA-LITERACY.RL.1.1': 'Ask and answer questions about key details (Grade 1)',
  'CCSS.ELA-LITERACY.RL.2.1': 'Ask and answer questions about key details (Grade 2)',
  'CCSS.ELA-LITERACY.RL.4.1': 'Refer to details and examples when explaining text',
  'CCSS.ELA-LITERACY.RL.5.1': 'Quote accurately when explaining text',

  // ============================================
  // ELA - READING INFORMATIONAL TEXT (RI)
  // ============================================
  'CCSS.ELA-LITERACY.RI.3.1': 'Ask and answer questions using informational text',
  'CCSS.ELA-LITERACY.RI.3.2': 'Determine main idea and key details',
  'CCSS.ELA-LITERACY.RI.3.3': 'Describe relationship between events or ideas',
  'CCSS.ELA-LITERACY.RI.3.4': 'Determine meaning of academic vocabulary',
  'CCSS.ELA-LITERACY.RI.3.5': 'Use text features to locate information',
  'CCSS.ELA-LITERACY.RI.3.6': 'Distinguish own point of view from author',

  // ============================================
  // ELA - READING FOUNDATIONAL SKILLS (RF)
  // ============================================
  'CCSS.ELA-LITERACY.RF.K.1': 'Demonstrate understanding of print concepts',
  'CCSS.ELA-LITERACY.RF.K.2': 'Demonstrate understanding of spoken words and sounds',
  'CCSS.ELA-LITERACY.RF.K.3': 'Know and apply phonics and word analysis',
  'CCSS.ELA-LITERACY.RF.K.4': 'Read emergent-reader texts with understanding',
  'CCSS.ELA-LITERACY.RF.1.1': 'Demonstrate understanding of print concepts (Grade 1)',
  'CCSS.ELA-LITERACY.RF.1.2': 'Demonstrate understanding of phonemes',
  'CCSS.ELA-LITERACY.RF.1.3': 'Know and apply phonics (Grade 1)',
  'CCSS.ELA-LITERACY.RF.1.4': 'Read with accuracy and fluency (Grade 1)',
  'CCSS.ELA-LITERACY.RF.2.3': 'Know and apply phonics (Grade 2)',
  'CCSS.ELA-LITERACY.RF.2.4': 'Read with accuracy and fluency (Grade 2)',
  'CCSS.ELA-LITERACY.RF.3.3': 'Know and apply phonics (Grade 3)',
  'CCSS.ELA-LITERACY.RF.3.4': 'Read with accuracy and fluency (Grade 3)',

  // ============================================
  // MATH - NUMBER & OPERATIONS FRACTIONS (NF)
  // ============================================
  'CCSS.MATH.CONTENT.3.NF.A.1': 'Understand a fraction as equal parts of a whole',
  'CCSS.MATH.CONTENT.3.NF.A.2': 'Understand fractions as numbers on a number line',
  'CCSS.MATH.CONTENT.3.NF.A.2.A': 'Represent fractions on a number line from 0 to 1',
  'CCSS.MATH.CONTENT.3.NF.A.2.B': 'Represent fractions as points on a number line',
  'CCSS.MATH.CONTENT.3.NF.A.3': 'Explain equivalence and compare fractions',
  'CCSS.MATH.CONTENT.3.NF.A.3.A': 'Understand equivalent fractions',
  'CCSS.MATH.CONTENT.3.NF.A.3.B': 'Recognize and generate equivalent fractions',
  'CCSS.MATH.CONTENT.3.NF.A.3.C': 'Express whole numbers as fractions',
  'CCSS.MATH.CONTENT.3.NF.A.3.D': 'Compare fractions with same numerator or denominator',

  // Grade 4-5 Fractions
  'CCSS.MATH.CONTENT.4.NF.A.1': 'Explain equivalent fractions using visual models',
  'CCSS.MATH.CONTENT.4.NF.A.2': 'Compare fractions with different denominators',
  'CCSS.MATH.CONTENT.4.NF.B.3': 'Add and subtract fractions with like denominators',
  'CCSS.MATH.CONTENT.4.NF.B.4': 'Multiply a fraction by a whole number',
  'CCSS.MATH.CONTENT.4.NF.C.5': 'Express fractions with denominator 10 as equivalent',
  'CCSS.MATH.CONTENT.4.NF.C.6': 'Use decimal notation for fractions',
  'CCSS.MATH.CONTENT.4.NF.C.7': 'Compare decimals to hundredths',
  'CCSS.MATH.CONTENT.5.NF.A.1': 'Add and subtract fractions with unlike denominators',
  'CCSS.MATH.CONTENT.5.NF.A.2': 'Solve word problems with fraction addition/subtraction',
  'CCSS.MATH.CONTENT.5.NF.B.3': 'Interpret fractions as division',
  'CCSS.MATH.CONTENT.5.NF.B.4': 'Multiply fractions and whole numbers',
  'CCSS.MATH.CONTENT.5.NF.B.5': 'Interpret multiplication as scaling',
  'CCSS.MATH.CONTENT.5.NF.B.6': 'Solve real-world fraction multiplication problems',
  'CCSS.MATH.CONTENT.5.NF.B.7': 'Divide unit fractions by whole numbers and vice versa',

  // ============================================
  // MATH - OPERATIONS & ALGEBRAIC THINKING (OA)
  // ============================================
  'CCSS.MATH.CONTENT.K.OA.A.1': 'Represent addition and subtraction',
  'CCSS.MATH.CONTENT.K.OA.A.2': 'Solve addition and subtraction word problems',
  'CCSS.MATH.CONTENT.K.OA.A.3': 'Decompose numbers less than or equal to 10',
  'CCSS.MATH.CONTENT.K.OA.A.4': 'Find number pairs that make 10',
  'CCSS.MATH.CONTENT.K.OA.A.5': 'Fluently add and subtract within 5',
  'CCSS.MATH.CONTENT.1.OA.A.1': 'Use addition and subtraction within 20',
  'CCSS.MATH.CONTENT.1.OA.A.2': 'Solve word problems with three addends',
  'CCSS.MATH.CONTENT.1.OA.B.3': 'Apply properties of operations',
  'CCSS.MATH.CONTENT.1.OA.B.4': 'Understand subtraction as unknown-addend problem',
  'CCSS.MATH.CONTENT.1.OA.C.5': 'Relate counting to addition and subtraction',
  'CCSS.MATH.CONTENT.1.OA.C.6': 'Add and subtract within 20',
  'CCSS.MATH.CONTENT.1.OA.D.7': 'Understand meaning of equal sign',
  'CCSS.MATH.CONTENT.1.OA.D.8': 'Determine unknown whole number in equations',
  'CCSS.MATH.CONTENT.2.OA.A.1': 'Use addition and subtraction within 100',
  'CCSS.MATH.CONTENT.2.OA.B.2': 'Fluently add and subtract within 20',
  'CCSS.MATH.CONTENT.2.OA.C.3': 'Determine odd or even numbers',
  'CCSS.MATH.CONTENT.2.OA.C.4': 'Use addition to find total in rectangular array',
  'CCSS.MATH.CONTENT.3.OA.A.1': 'Interpret products of whole numbers',
  'CCSS.MATH.CONTENT.3.OA.A.2': 'Interpret quotients of whole numbers',
  'CCSS.MATH.CONTENT.3.OA.A.3': 'Use multiplication and division to solve problems',
  'CCSS.MATH.CONTENT.3.OA.A.4': 'Determine unknown number in multiplication equation',
  'CCSS.MATH.CONTENT.3.OA.B.5': 'Apply properties of multiplication',
  'CCSS.MATH.CONTENT.3.OA.B.6': 'Understand division as unknown-factor problem',
  'CCSS.MATH.CONTENT.3.OA.C.7': 'Fluently multiply and divide within 100',
  'CCSS.MATH.CONTENT.3.OA.D.8': 'Solve two-step word problems',
  'CCSS.MATH.CONTENT.3.OA.D.9': 'Identify arithmetic patterns',

  // ============================================
  // MATH - COUNTING & CARDINALITY (CC) - Kindergarten
  // ============================================
  'CCSS.MATH.CONTENT.K.CC.A.1': 'Count to 100 by ones and tens',
  'CCSS.MATH.CONTENT.K.CC.A.2': 'Count forward from any given number',
  'CCSS.MATH.CONTENT.K.CC.A.3': 'Write numbers from 0 to 20',
  'CCSS.MATH.CONTENT.K.CC.B.4': 'Understand relationship between numbers and quantities',
  'CCSS.MATH.CONTENT.K.CC.B.4.A': 'Count objects using one-to-one correspondence',
  'CCSS.MATH.CONTENT.K.CC.B.4.B': 'Understand last number tells count of objects',
  'CCSS.MATH.CONTENT.K.CC.B.4.C': 'Understand count stays same regardless of arrangement',
  'CCSS.MATH.CONTENT.K.CC.B.5': 'Count to answer "how many?" questions',
  'CCSS.MATH.CONTENT.K.CC.C.6': 'Identify whether number of objects is greater/less/equal',
  'CCSS.MATH.CONTENT.K.CC.C.7': 'Compare two numbers between 1 and 10',

  // ============================================
  // MATH - NUMBER & OPERATIONS BASE TEN (NBT)
  // ============================================
  'CCSS.MATH.CONTENT.K.NBT.A.1': 'Compose and decompose numbers 11-19',
  'CCSS.MATH.CONTENT.1.NBT.A.1': 'Count to 120 starting from any number',
  'CCSS.MATH.CONTENT.1.NBT.B.2': 'Understand place value (tens and ones)',
  'CCSS.MATH.CONTENT.1.NBT.B.3': 'Compare two-digit numbers',
  'CCSS.MATH.CONTENT.1.NBT.C.4': 'Add within 100',
  'CCSS.MATH.CONTENT.1.NBT.C.5': 'Given a two-digit number, mentally find 10 more or less',
  'CCSS.MATH.CONTENT.1.NBT.C.6': 'Subtract multiples of 10',
  'CCSS.MATH.CONTENT.2.NBT.A.1': 'Understand three-digit place value',
  'CCSS.MATH.CONTENT.2.NBT.A.2': 'Count within 1000; skip-count by 5s, 10s, 100s',
  'CCSS.MATH.CONTENT.2.NBT.A.3': 'Read and write numbers to 1000',
  'CCSS.MATH.CONTENT.2.NBT.A.4': 'Compare three-digit numbers',
  'CCSS.MATH.CONTENT.2.NBT.B.5': 'Fluently add and subtract within 100',
  'CCSS.MATH.CONTENT.2.NBT.B.6': 'Add up to four two-digit numbers',
  'CCSS.MATH.CONTENT.2.NBT.B.7': 'Add and subtract within 1000',
  'CCSS.MATH.CONTENT.2.NBT.B.8': 'Mentally add or subtract 10 or 100',
  'CCSS.MATH.CONTENT.2.NBT.B.9': 'Explain why addition and subtraction strategies work',

  // ============================================
  // MATH - GEOMETRY (G)
  // ============================================
  'CCSS.MATH.CONTENT.K.G.A.1': 'Describe objects using shape names',
  'CCSS.MATH.CONTENT.K.G.A.2': 'Name shapes regardless of size or orientation',
  'CCSS.MATH.CONTENT.K.G.A.3': 'Identify shapes as two-dimensional or three-dimensional',
  'CCSS.MATH.CONTENT.K.G.B.4': 'Analyze and compare two- and three-dimensional shapes',
  'CCSS.MATH.CONTENT.K.G.B.5': 'Model shapes in the world',
  'CCSS.MATH.CONTENT.K.G.B.6': 'Compose simple shapes to form larger shapes',
  'CCSS.MATH.CONTENT.1.G.A.1': 'Distinguish between defining and non-defining attributes',
  'CCSS.MATH.CONTENT.1.G.A.2': 'Compose two-dimensional and three-dimensional shapes',
  'CCSS.MATH.CONTENT.1.G.A.3': 'Partition circles and rectangles into equal shares',
  'CCSS.MATH.CONTENT.2.G.A.1': 'Recognize and draw shapes with specified attributes',
  'CCSS.MATH.CONTENT.2.G.A.2': 'Partition a rectangle into rows and columns of squares',
  'CCSS.MATH.CONTENT.2.G.A.3': 'Partition circles and rectangles into equal shares',
  'CCSS.MATH.CONTENT.3.G.A.1': 'Understand shapes with shared attributes',
  'CCSS.MATH.CONTENT.3.G.A.2': 'Partition shapes into equal parts with unit fractions',

  // ============================================
  // MATH - MEASUREMENT & DATA (MD)
  // ============================================
  'CCSS.MATH.CONTENT.K.MD.A.1': 'Describe measurable attributes of objects',
  'CCSS.MATH.CONTENT.K.MD.A.2': 'Compare two objects with measurable attribute',
  'CCSS.MATH.CONTENT.K.MD.B.3': 'Classify objects and count in each category',
  'CCSS.MATH.CONTENT.1.MD.A.1': 'Order objects by length',
  'CCSS.MATH.CONTENT.1.MD.A.2': 'Express length of object as number of units',
  'CCSS.MATH.CONTENT.1.MD.B.3': 'Tell and write time in hours and half-hours',
  'CCSS.MATH.CONTENT.1.MD.C.4': 'Organize and represent data',
  'CCSS.MATH.CONTENT.2.MD.A.1': 'Measure length using appropriate tools',
  'CCSS.MATH.CONTENT.2.MD.B.5': 'Use addition and subtraction to solve length problems',
  'CCSS.MATH.CONTENT.2.MD.C.7': 'Tell and write time to nearest five minutes',
  'CCSS.MATH.CONTENT.2.MD.C.8': 'Solve money word problems',
  'CCSS.MATH.CONTENT.2.MD.D.9': 'Generate measurement data and make a line plot',
  'CCSS.MATH.CONTENT.2.MD.D.10': 'Draw picture and bar graphs',
  'CCSS.MATH.CONTENT.3.MD.A.1': 'Tell and write time to nearest minute',
  'CCSS.MATH.CONTENT.3.MD.A.2': 'Measure and estimate liquid volumes and masses',
  'CCSS.MATH.CONTENT.3.MD.B.3': 'Draw scaled picture and bar graphs',
  'CCSS.MATH.CONTENT.3.MD.B.4': 'Generate measurement data and make line plots',
  'CCSS.MATH.CONTENT.3.MD.C.5': 'Understand area as covering a surface',
  'CCSS.MATH.CONTENT.3.MD.C.6': 'Measure area by counting unit squares',
  'CCSS.MATH.CONTENT.3.MD.C.7': 'Relate area to multiplication and addition',
  'CCSS.MATH.CONTENT.3.MD.D.8': 'Solve real-world perimeter problems',

  // ============================================
  // MATH - EXPRESSIONS & EQUATIONS (EE) - Middle School
  // ============================================
  'CCSS.MATH.CONTENT.6.EE.A.1': 'Write and evaluate numerical expressions with exponents',
  'CCSS.MATH.CONTENT.6.EE.A.2': 'Write, read, and evaluate algebraic expressions',
  'CCSS.MATH.CONTENT.6.EE.A.3': 'Apply properties of operations to generate equivalent expressions',
  'CCSS.MATH.CONTENT.6.EE.A.4': 'Identify equivalent expressions',
  'CCSS.MATH.CONTENT.6.EE.B.5': 'Understand solving an equation as finding values',
  'CCSS.MATH.CONTENT.6.EE.B.6': 'Use variables to represent numbers',
  'CCSS.MATH.CONTENT.6.EE.B.7': 'Solve real-world problems with equations',
  'CCSS.MATH.CONTENT.6.EE.B.8': 'Write inequalities to represent constraints',
  'CCSS.MATH.CONTENT.6.EE.C.9': 'Use variables to represent two quantities',
  'CCSS.MATH.CONTENT.7.EE.A.1': 'Apply properties to add, subtract, factor, and expand expressions',
  'CCSS.MATH.CONTENT.7.EE.A.2': 'Understand rewriting expressions in different forms',
  'CCSS.MATH.CONTENT.7.EE.B.3': 'Solve multi-step real-world problems with rational numbers',
  'CCSS.MATH.CONTENT.7.EE.B.4': 'Use variables to represent quantities and construct equations',
  'CCSS.MATH.CONTENT.8.EE.A.1': 'Know and apply properties of integer exponents',
  'CCSS.MATH.CONTENT.8.EE.A.2': 'Use square root and cube root symbols',
  'CCSS.MATH.CONTENT.8.EE.A.3': 'Use numbers expressed in scientific notation',
  'CCSS.MATH.CONTENT.8.EE.A.4': 'Perform operations with numbers in scientific notation',
  'CCSS.MATH.CONTENT.8.EE.B.5': 'Graph proportional relationships',
  'CCSS.MATH.CONTENT.8.EE.B.6': 'Use similar triangles to explain slope',
  'CCSS.MATH.CONTENT.8.EE.C.7': 'Solve linear equations in one variable',
  'CCSS.MATH.CONTENT.8.EE.C.8': 'Analyze and solve systems of linear equations',

  // ============================================
  // MATH - RATIOS & PROPORTIONAL RELATIONSHIPS (RP)
  // ============================================
  'CCSS.MATH.CONTENT.6.RP.A.1': 'Understand ratio concepts and use ratio language',
  'CCSS.MATH.CONTENT.6.RP.A.2': 'Understand unit rate concepts',
  'CCSS.MATH.CONTENT.6.RP.A.3': 'Use ratio and rate reasoning to solve problems',
  'CCSS.MATH.CONTENT.7.RP.A.1': 'Compute unit rates associated with ratios of fractions',
  'CCSS.MATH.CONTENT.7.RP.A.2': 'Recognize and represent proportional relationships',
  'CCSS.MATH.CONTENT.7.RP.A.3': 'Use proportional relationships to solve multi-step problems',

  // ============================================
  // MATH - HIGH SCHOOL ALGEBRA
  // ============================================
  'CCSS.MATH.CONTENT.HSA.SSE.A.1': 'Interpret the structure of expressions',
  'CCSS.MATH.CONTENT.HSA.SSE.A.2': 'Use structure of expression to identify ways to rewrite it',
  'CCSS.MATH.CONTENT.HSA.SSE.B.3': 'Choose and produce equivalent form of expression',
  'CCSS.MATH.CONTENT.HSA.CED.A.1': 'Create equations and inequalities in one variable',
  'CCSS.MATH.CONTENT.HSA.CED.A.2': 'Create equations in two or more variables',
  'CCSS.MATH.CONTENT.HSA.CED.A.3': 'Represent constraints by equations or inequalities',
  'CCSS.MATH.CONTENT.HSA.CED.A.4': 'Rearrange formulas to highlight a quantity of interest',
  'CCSS.MATH.CONTENT.HSA.REI.A.1': 'Explain each step in solving an equation',
  'CCSS.MATH.CONTENT.HSA.REI.B.3': 'Solve linear equations and inequalities in one variable',
  'CCSS.MATH.CONTENT.HSA.REI.B.4': 'Solve quadratic equations in one variable',

  // ============================================
  // MATH - HIGH SCHOOL FUNCTIONS
  // ============================================
  'CCSS.MATH.CONTENT.HSF.IF.A.1': 'Understand function notation',
  'CCSS.MATH.CONTENT.HSF.IF.A.2': 'Use function notation, evaluate functions',
  'CCSS.MATH.CONTENT.HSF.IF.A.3': 'Recognize sequences as functions',
  'CCSS.MATH.CONTENT.HSF.IF.B.4': 'Interpret key features of graphs and tables',
  'CCSS.MATH.CONTENT.HSF.IF.B.5': 'Relate domain of function to its graph',
  'CCSS.MATH.CONTENT.HSF.IF.B.6': 'Calculate and interpret average rate of change',
  'CCSS.MATH.CONTENT.HSF.IF.C.7': 'Graph functions and show key features',
  'CCSS.MATH.CONTENT.HSF.IF.C.8': 'Write function in equivalent forms to reveal properties',
  'CCSS.MATH.CONTENT.HSF.IF.C.9': 'Compare properties of functions represented differently',
  'CCSS.MATH.CONTENT.HSF.BF.A.1': 'Write a function that describes a relationship',
  'CCSS.MATH.CONTENT.HSF.BF.A.2': 'Write arithmetic and geometric sequences',
  'CCSS.MATH.CONTENT.HSF.BF.B.3': 'Identify effect of transformations on graphs',

  // ============================================
  // MATH - HIGH SCHOOL GEOMETRY
  // ============================================
  'CCSS.MATH.CONTENT.HSG.CO.A.1': 'Know precise definitions of geometric terms',
  'CCSS.MATH.CONTENT.HSG.CO.A.2': 'Represent transformations in the plane',
  'CCSS.MATH.CONTENT.HSG.CO.B.6': 'Use geometric descriptions of rigid motions',
  'CCSS.MATH.CONTENT.HSG.SRT.A.1': 'Verify properties of dilations',
  'CCSS.MATH.CONTENT.HSG.SRT.A.2': 'Use definition of similarity to decide if figures are similar',
  'CCSS.MATH.CONTENT.HSG.SRT.B.5': 'Use congruence and similarity criteria',
  'CCSS.MATH.CONTENT.HSG.SRT.C.6': 'Understand trigonometric ratios in right triangles',
  'CCSS.MATH.CONTENT.HSG.SRT.C.7': 'Explain relationship between sine and cosine',
  'CCSS.MATH.CONTENT.HSG.SRT.C.8': 'Use trigonometric ratios to solve right triangles',

  // ============================================
  // MATH - HIGH SCHOOL STATISTICS
  // ============================================
  'CCSS.MATH.CONTENT.HSS.ID.A.1': 'Represent data with plots on number line',
  'CCSS.MATH.CONTENT.HSS.ID.A.2': 'Use statistics to compare center and spread',
  'CCSS.MATH.CONTENT.HSS.ID.A.3': 'Interpret differences in shape, center, and spread',
  'CCSS.MATH.CONTENT.HSS.ID.B.5': 'Summarize categorical data in two-way tables',
  'CCSS.MATH.CONTENT.HSS.ID.B.6': 'Represent data on scatter plots and describe relationships',
  'CCSS.MATH.CONTENT.HSS.ID.C.7': 'Interpret slope and intercept of linear model',
  'CCSS.MATH.CONTENT.HSS.ID.C.8': 'Compute correlation coefficient',
  'CCSS.MATH.CONTENT.HSS.ID.C.9': 'Distinguish between correlation and causation',
  'CCSS.MATH.CONTENT.HSS.IC.A.1': 'Understand statistics as process for making inferences',
  'CCSS.MATH.CONTENT.HSS.IC.A.2': 'Decide if statistical model is consistent with results',
  'CCSS.MATH.CONTENT.HSS.IC.B.3': 'Recognize purposes of surveys, experiments, studies',
  'CCSS.MATH.CONTENT.HSS.IC.B.4': 'Use data from sample survey to estimate population mean',

  // ============================================
  // PEARSON EDEXCEL IGCSE MATHEMATICS
  // ============================================
  // Pre-IG Stage 1 - Number
  'EDEXCEL.MATH.PRE-IG1.N1.1': 'Order positive and negative integers, decimals and fractions',
  'EDEXCEL.MATH.PRE-IG1.N1.2': 'Apply the four operations to integers, decimals and fractions',
  'EDEXCEL.MATH.PRE-IG1.N1.3': 'Understand place value for decimals',
  'EDEXCEL.MATH.PRE-IG1.N1.4': 'Use index notation for squares and cubes',
  'EDEXCEL.MATH.PRE-IG1.N1.5': 'Recognise powers of 2, 3, 4, 5',
  // Pre-IG Stage 1 - Algebra
  'EDEXCEL.MATH.PRE-IG1.A1.1': 'Use and interpret algebraic notation',
  'EDEXCEL.MATH.PRE-IG1.A1.2': 'Substitute numerical values into formulae',
  'EDEXCEL.MATH.PRE-IG1.A1.3': 'Simplify expressions by collecting like terms',
  'EDEXCEL.MATH.PRE-IG1.A1.4': 'Multiply a single term over a bracket',
  'EDEXCEL.MATH.PRE-IG1.A1.5': 'Generate terms of a sequence from a term-to-term rule',
  // Pre-IG Stage 1 - Ratio
  'EDEXCEL.MATH.PRE-IG1.R1.1': 'Convert between fractions, decimals and percentages',
  'EDEXCEL.MATH.PRE-IG1.R1.2': 'Calculate percentages of amounts',
  'EDEXCEL.MATH.PRE-IG1.R1.3': 'Express one quantity as a fraction of another',
  'EDEXCEL.MATH.PRE-IG1.R1.4': 'Use ratio notation and simplify ratios',
  // Pre-IG Stage 1 - Geometry
  'EDEXCEL.MATH.PRE-IG1.G1.1': 'Identify properties of 2D shapes',
  'EDEXCEL.MATH.PRE-IG1.G1.2': 'Calculate perimeter and area of rectangles and triangles',
  'EDEXCEL.MATH.PRE-IG1.G1.3': 'Calculate volume of cuboids',
  'EDEXCEL.MATH.PRE-IG1.G1.4': 'Measure and draw angles accurately',
  'EDEXCEL.MATH.PRE-IG1.G1.5': 'Identify types of angles (acute, obtuse, reflex)',
  // Pre-IG Stage 1 - Statistics
  'EDEXCEL.MATH.PRE-IG1.S1.1': 'Interpret and construct bar charts and pictograms',
  'EDEXCEL.MATH.PRE-IG1.S1.2': 'Interpret and construct pie charts',
  'EDEXCEL.MATH.PRE-IG1.S1.3': 'Calculate mean, median, mode and range',
  'EDEXCEL.MATH.PRE-IG1.S1.4': 'Interpret tables and frequency diagrams',

  // Pre-IG Stage 2 - Number
  'EDEXCEL.MATH.PRE-IG2.N2.1': 'Find HCF and LCM using prime factorisation',
  'EDEXCEL.MATH.PRE-IG2.N2.2': 'Apply index laws for multiplication and division',
  'EDEXCEL.MATH.PRE-IG2.N2.3': 'Work with negative indices',
  'EDEXCEL.MATH.PRE-IG2.N2.4': 'Convert between ordinary numbers and standard form',
  // Pre-IG Stage 2 - Algebra
  'EDEXCEL.MATH.PRE-IG2.A2.1': 'Solve linear equations with unknowns on both sides',
  'EDEXCEL.MATH.PRE-IG2.A2.2': 'Rearrange formulae to change the subject',
  'EDEXCEL.MATH.PRE-IG2.A2.3': 'Expand and factorise single brackets',
  'EDEXCEL.MATH.PRE-IG2.A2.4': 'Generate sequences from nth term rules',
  'EDEXCEL.MATH.PRE-IG2.A2.5': 'Plot and interpret linear graphs',
  // Pre-IG Stage 2 - Ratio
  'EDEXCEL.MATH.PRE-IG2.R2.1': 'Divide a quantity in a given ratio',
  'EDEXCEL.MATH.PRE-IG2.R2.2': 'Calculate percentage increase and decrease',
  'EDEXCEL.MATH.PRE-IG2.R2.3': 'Solve direct proportion problems',
  'EDEXCEL.MATH.PRE-IG2.R2.4': 'Use scale factors in maps and drawings',
  // Pre-IG Stage 2 - Geometry
  'EDEXCEL.MATH.PRE-IG2.G2.1': 'Calculate angles in triangles and quadrilaterals',
  'EDEXCEL.MATH.PRE-IG2.G2.2': 'Understand and use angle facts on parallel lines',
  'EDEXCEL.MATH.PRE-IG2.G2.3': 'Describe and perform reflections and rotations',
  'EDEXCEL.MATH.PRE-IG2.G2.4': 'Describe and perform translations and enlargements',
  'EDEXCEL.MATH.PRE-IG2.G2.5': 'Calculate area of parallelograms and trapeziums',
  // Pre-IG Stage 2 - Probability
  'EDEXCEL.MATH.PRE-IG2.P1.1': 'Calculate theoretical probability',
  'EDEXCEL.MATH.PRE-IG2.P1.2': 'Use sample space diagrams',
  'EDEXCEL.MATH.PRE-IG2.P1.3': 'Calculate relative frequency from experiments',
  // Pre-IG Stage 2 - Statistics
  'EDEXCEL.MATH.PRE-IG2.S2.1': 'Compare distributions using averages and range',
  'EDEXCEL.MATH.PRE-IG2.S2.2': 'Draw and interpret scatter graphs',
  'EDEXCEL.MATH.PRE-IG2.S2.3': 'Identify correlation and draw lines of best fit',

  // IG Stage 1 - Number
  'EDEXCEL.MATH.IG1.N3.1': 'Simplify surds and rationalise denominators',
  'EDEXCEL.MATH.IG1.N3.2': 'Calculate with fractional and negative indices',
  'EDEXCEL.MATH.IG1.N3.3': 'Calculate upper and lower bounds',
  'EDEXCEL.MATH.IG1.N3.4': 'Convert recurring decimals to fractions',
  // IG Stage 1 - Algebra
  'EDEXCEL.MATH.IG1.A3.1': 'Expand double brackets and factorise quadratics',
  'EDEXCEL.MATH.IG1.A3.2': 'Solve quadratic equations by factorisation',
  'EDEXCEL.MATH.IG1.A3.3': 'Complete the square for quadratic expressions',
  'EDEXCEL.MATH.IG1.A3.4': 'Use the quadratic formula',
  'EDEXCEL.MATH.IG1.A3.5': 'Solve linear inequalities and show on number line',
  // IG Stage 1 - Ratio
  'EDEXCEL.MATH.IG1.R3.1': 'Calculate compound measures (speed, density, pressure)',
  'EDEXCEL.MATH.IG1.R3.2': 'Solve problems involving compound interest',
  'EDEXCEL.MATH.IG1.R3.3': 'Calculate reverse percentages',
  'EDEXCEL.MATH.IG1.R3.4': 'Solve inverse proportion problems',
  // IG Stage 1 - Geometry
  'EDEXCEL.MATH.IG1.G3.1': 'Prove triangles are congruent',
  'EDEXCEL.MATH.IG1.G3.2': 'Use similarity to find missing lengths',
  'EDEXCEL.MATH.IG1.G3.3': 'Calculate arc length and sector area',
  'EDEXCEL.MATH.IG1.G4.1': 'Use Pythagoras theorem in 2D and 3D',
  'EDEXCEL.MATH.IG1.G4.2': 'Use trigonometric ratios (sin, cos, tan)',
  'EDEXCEL.MATH.IG1.G4.3': 'Calculate angles of elevation and depression',
  // IG Stage 1 - Probability
  'EDEXCEL.MATH.IG1.P2.1': 'Calculate probability of combined events',
  'EDEXCEL.MATH.IG1.P2.2': 'Draw and use tree diagrams',
  'EDEXCEL.MATH.IG1.P2.3': 'Calculate probability with replacement',
  // IG Stage 1 - Statistics
  'EDEXCEL.MATH.IG1.S3.1': 'Construct and interpret cumulative frequency graphs',
  'EDEXCEL.MATH.IG1.S3.2': 'Draw and interpret box plots',
  'EDEXCEL.MATH.IG1.S3.3': 'Find quartiles and interquartile range',

  // IG Stage 2 - Number
  'EDEXCEL.MATH.IG2.N4.1': 'Calculate with numbers in standard form',
  'EDEXCEL.MATH.IG2.N4.2': 'Apply upper and lower bounds to calculations',
  'EDEXCEL.MATH.IG2.N4.3': 'Solve problems with compound units',
  // IG Stage 2 - Algebra
  'EDEXCEL.MATH.IG2.A4.1': 'Recognise and sketch graphs of functions',
  'EDEXCEL.MATH.IG2.A4.2': 'Apply transformations to graphs',
  'EDEXCEL.MATH.IG2.A4.3': 'Find inverse and composite functions',
  'EDEXCEL.MATH.IG2.A5.1': 'Solve simultaneous equations algebraically',
  'EDEXCEL.MATH.IG2.A5.2': 'Solve simultaneous equations graphically',
  'EDEXCEL.MATH.IG2.A5.3': 'Solve quadratic simultaneous equations',
  // IG Stage 2 - Geometry
  'EDEXCEL.MATH.IG2.G5.1': 'Apply circle theorem: angle at centre',
  'EDEXCEL.MATH.IG2.G5.2': 'Apply circle theorem: angles in same segment',
  'EDEXCEL.MATH.IG2.G5.3': 'Apply circle theorem: cyclic quadrilaterals',
  'EDEXCEL.MATH.IG2.G5.4': 'Apply circle theorem: tangent properties',
  'EDEXCEL.MATH.IG2.G6.1': 'Add and subtract vectors',
  'EDEXCEL.MATH.IG2.G6.2': 'Use vectors to prove geometric properties',
  'EDEXCEL.MATH.IG2.G7.1': 'Use sine rule to find missing sides and angles',
  'EDEXCEL.MATH.IG2.G7.2': 'Use cosine rule to find missing sides and angles',
  'EDEXCEL.MATH.IG2.G7.3': 'Calculate area of triangle using ½absinC',
  // IG Stage 2 - Probability
  'EDEXCEL.MATH.IG2.P3.1': 'Calculate conditional probability',
  'EDEXCEL.MATH.IG2.P3.2': 'Use set notation for probability',
  'EDEXCEL.MATH.IG2.P3.3': 'Draw and use Venn diagrams',
  // IG Stage 2 - Statistics
  'EDEXCEL.MATH.IG2.S4.1': 'Construct and interpret histograms',
  'EDEXCEL.MATH.IG2.S4.2': 'Calculate estimates of mean from grouped data',
  'EDEXCEL.MATH.IG2.S4.3': 'Understand and calculate correlation coefficient',

  // ============================================
  // PEARSON EDEXCEL IGCSE ENGLISH LANGUAGE
  // ============================================
  // Pre-IG Stage 1 - Reading Comprehension
  'EDEXCEL.ENG.PRE-IG1.RC1.1': 'Identify explicit information from a text',
  'EDEXCEL.ENG.PRE-IG1.RC1.2': 'Retrieve key details from fiction and non-fiction',
  'EDEXCEL.ENG.PRE-IG1.RC1.3': 'Understand vocabulary in context',
  'EDEXCEL.ENG.PRE-IG1.RC2.1': 'Make inferences based on textual evidence',
  'EDEXCEL.ENG.PRE-IG1.RC2.2': 'Deduce meaning from implicit information',
  'EDEXCEL.ENG.PRE-IG1.RC2.3': 'Explain how characters\' feelings are conveyed',
  // Pre-IG Stage 1 - Writing
  'EDEXCEL.ENG.PRE-IG1.W1.1': 'Write in complete sentences with correct punctuation',
  'EDEXCEL.ENG.PRE-IG1.W1.2': 'Organise writing into clear paragraphs',
  'EDEXCEL.ENG.PRE-IG1.W1.3': 'Use connectives to link ideas',
  // Pre-IG Stage 1 - Grammar
  'EDEXCEL.ENG.PRE-IG1.G1.1': 'Use correct verb tenses consistently',
  'EDEXCEL.ENG.PRE-IG1.G1.2': 'Ensure subject-verb agreement',
  'EDEXCEL.ENG.PRE-IG1.G1.3': 'Use pronouns correctly',
  // Pre-IG Stage 1 - Vocabulary
  'EDEXCEL.ENG.PRE-IG1.V1.1': 'Use a range of descriptive vocabulary',
  'EDEXCEL.ENG.PRE-IG1.V1.2': 'Select vocabulary appropriate to purpose',
  'EDEXCEL.ENG.PRE-IG1.V1.3': 'Understand synonyms and antonyms',

  // Pre-IG Stage 2 - Reading Comprehension
  'EDEXCEL.ENG.PRE-IG2.RC3.1': 'Analyse how writers use language for effect',
  'EDEXCEL.ENG.PRE-IG2.RC3.2': 'Identify and explain literary devices',
  'EDEXCEL.ENG.PRE-IG2.RC3.3': 'Explain the impact of word choices',
  'EDEXCEL.ENG.PRE-IG2.RC4.1': 'Compare ideas across two texts',
  'EDEXCEL.ENG.PRE-IG2.RC4.2': 'Compare writers\' perspectives',
  // Pre-IG Stage 2 - Writing
  'EDEXCEL.ENG.PRE-IG2.W2.1': 'Write formal letters with correct conventions',
  'EDEXCEL.ENG.PRE-IG2.W2.2': 'Write articles with appropriate structure',
  'EDEXCEL.ENG.PRE-IG2.W2.3': 'Write reports with clear organisation',
  'EDEXCEL.ENG.PRE-IG2.W3.1': 'Write descriptive pieces using sensory language',
  'EDEXCEL.ENG.PRE-IG2.W3.2': 'Write narratives with developed characters',
  'EDEXCEL.ENG.PRE-IG2.W3.3': 'Create atmosphere through word choice',
  // Pre-IG Stage 2 - Grammar
  'EDEXCEL.ENG.PRE-IG2.G2.1': 'Use a range of punctuation for effect',
  'EDEXCEL.ENG.PRE-IG2.G2.2': 'Vary sentence structures for impact',
  'EDEXCEL.ENG.PRE-IG2.G2.3': 'Use complex sentences accurately',
  // Pre-IG Stage 2 - Vocabulary
  'EDEXCEL.ENG.PRE-IG2.V2.1': 'Identify word classes and their functions',
  'EDEXCEL.ENG.PRE-IG2.V2.2': 'Understand connotation and denotation',
  'EDEXCEL.ENG.PRE-IG2.V2.3': 'Use subject-specific vocabulary accurately',

  // IG Stage 1 - Reading Comprehension
  'EDEXCEL.ENG.IG1.RC5.1': 'Evaluate how effectively writers achieve their purpose',
  'EDEXCEL.ENG.IG1.RC5.2': 'Analyse the effectiveness of text structure',
  'EDEXCEL.ENG.IG1.RC5.3': 'Evaluate the impact of rhetorical devices',
  'EDEXCEL.ENG.IG1.RC6.1': 'Synthesise information from multiple sources',
  'EDEXCEL.ENG.IG1.RC6.2': 'Select and integrate relevant evidence',
  // IG Stage 1 - Writing
  'EDEXCEL.ENG.IG1.W4.1': 'Write to argue with clear reasoning',
  'EDEXCEL.ENG.IG1.W4.2': 'Write to persuade using rhetorical techniques',
  'EDEXCEL.ENG.IG1.W4.3': 'Write to advise with appropriate register',
  'EDEXCEL.ENG.IG1.W5.1': 'Use narrative techniques (flashback, foreshadowing)',
  'EDEXCEL.ENG.IG1.W5.2': 'Craft openings and endings effectively',
  'EDEXCEL.ENG.IG1.W5.3': 'Control pace and tension in writing',
  // IG Stage 1 - Text Analysis
  'EDEXCEL.ENG.IG1.TA1.1': 'Analyse how structure contributes to meaning',
  'EDEXCEL.ENG.IG1.TA1.2': 'Explain the effect of paragraph organisation',
  'EDEXCEL.ENG.IG1.TA1.3': 'Identify narrative perspective and its effects',
  // IG Stage 1 - Grammar
  'EDEXCEL.ENG.IG1.G3.1': 'Use grammar creatively for stylistic effect',
  'EDEXCEL.ENG.IG1.G3.2': 'Control register consistently throughout',
  'EDEXCEL.ENG.IG1.G3.3': 'Use advanced punctuation (colons, semicolons, dashes)',

  // IG Stage 2 - Reading Comprehension
  'EDEXCEL.ENG.IG2.RC7.1': 'Critically evaluate texts with supporting evidence',
  'EDEXCEL.ENG.IG2.RC7.2': 'Assess the validity of writers\' arguments',
  'EDEXCEL.ENG.IG2.RC7.3': 'Evaluate the reliability of sources',
  'EDEXCEL.ENG.IG2.RC8.1': 'Analyse how perspective shapes meaning',
  'EDEXCEL.ENG.IG2.RC8.2': 'Identify and analyse bias in texts',
  'EDEXCEL.ENG.IG2.RC8.3': 'Compare how writers present different viewpoints',
  // IG Stage 2 - Writing
  'EDEXCEL.ENG.IG2.W6.1': 'Produce extended transactional writing with sophistication',
  'EDEXCEL.ENG.IG2.W6.2': 'Adapt style and format for different audiences',
  'EDEXCEL.ENG.IG2.W6.3': 'Use evidence and examples persuasively',
  'EDEXCEL.ENG.IG2.W7.1': 'Produce extended creative writing with controlled style',
  'EDEXCEL.ENG.IG2.W7.2': 'Use symbolic and figurative language effectively',
  'EDEXCEL.ENG.IG2.W7.3': 'Create complex narratives with multiple perspectives',
  // IG Stage 2 - Text Analysis
  'EDEXCEL.ENG.IG2.TA2.1': 'Analyse the relationship between language and form',
  'EDEXCEL.ENG.IG2.TA2.2': 'Evaluate how form contributes to meaning',
  'EDEXCEL.ENG.IG2.TA2.3': 'Compare treatment of themes across genres',
  // IG Stage 2 - Spoken Language
  'EDEXCEL.ENG.IG2.SL1.1': 'Present ideas clearly and confidently',
  'EDEXCEL.ENG.IG2.SL1.2': 'Respond appropriately in discussions',
  'EDEXCEL.ENG.IG2.SL1.3': 'Use Standard English in formal contexts'
};

// Get strands for a subject
export const getStrandsForSubject = (subject: string): string[] => {
  switch (subject.toLowerCase()) {
    case 'math':
    case 'mathematics':
      return MATH_STRANDS;
    case 'reading':
    case 'reading foundations':
    case 'reading comprehension':
      return READING_STRANDS;
    case 'ela':
    case 'english language arts':
      return ELA_STRANDS;
    case 'ap precalculus':
    case 'ap calculus ab':
    case 'ap calculus bc':
    case 'ap statistics':
      return AP_MATH_STRANDS;
    case 'ap macroeconomics':
      return AP_MACROECONOMICS_STRANDS;
    case 'ap english language':
    case 'ap english literature':
      return AP_ENGLISH_STRANDS;
    // Pearson Edexcel IGCSE subjects
    case 'edexcel math pre-ig1':
    case 'edexcel math pre-ig2':
    case 'edexcel math ig1':
    case 'edexcel math ig2':
      return EDEXCEL_MATH_STRANDS;
    case 'edexcel english pre-ig1':
    case 'edexcel english pre-ig2':
    case 'edexcel english ig1':
    case 'edexcel english ig2':
      return EDEXCEL_ENGLISH_STRANDS;
    default:
      return MATH_STRANDS;
  }
};

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-1',
    name: 'EMI Primary',
    district: 'Crimson Global Academy',
    schoolCode: 'EMI-PRIMARY',
    status: 'Active'
  },
  {
    id: 'sch-2',
    name: 'CGA U.S. Diploma',
    district: 'Crimson Global Academy',
    schoolCode: 'CGA-USDIP',
    status: 'Active'
  },
  {
    id: 'sch-3',
    name: 'CGA A-Level Aoraki',
    district: 'Crimson Global Academy',
    schoolCode: 'CGA-AORAKI',
    status: 'Active'
  },
  {
    id: 'sch-4',
    name: 'CGA A-Level Greenwich',
    district: 'Crimson Global Academy',
    schoolCode: 'CGA-GREENWICH',
    status: 'Active'
  },
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_RESULTS: StudentResult[] = [];
