import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Question,
  Subject,
  ScreenerLevel,
  StudentResult,
  ExtendedQuestion,
  QuestionFormat,
  AdaptiveTestSession,
  AdaptiveSessionStatus,
  DifficultyLevel
} from '../types';
import { generateScreenerQuestions, generateHybridQuestionSet } from '../services/geminiService';
import { QuestionRenderer } from './questions';
import {
  createAdaptiveSession,
  processResponse,
  selectNextQuestion,
  shouldTerminate,
  finalizeSession,
  abilityToPercentile,
  abilityToPerformanceLevel,
  estimateAbility
} from '../services/adaptiveTestingService';
import {
  loadAllQuestionsForGrade,
  getQuestionsWithFormatDistribution
} from '../services/questionBankService';
import { ADAPTIVE_TEST_CONFIG, CCSS_LEARNING_OBJECTIVES } from '../constants';

// Helper function to derive CCSS standards from strand name and grade
const getStandardsForStrand = (strand: string, gradeLevel: string, subjectName: string): string[] => {
  const allStandardKeys = Object.keys(CCSS_LEARNING_OBJECTIVES);
  const grade = gradeLevel === 'K' ? 'K' : gradeLevel;

  // Helper to find standards matching patterns
  const findMatching = (patterns: string[]): string[] => {
    return allStandardKeys.filter(key => patterns.some(p => key.includes(p)));
  };

  // Math strands
  if (subjectName === 'Math' || subjectName === 'Mathematics') {
    if (strand === 'Fractions' || strand === 'Number & Operations - Fractions') {
      return findMatching([`MATH.CONTENT.${grade}.NF.`]);
    }
    if (strand === 'Numbers & Operations' || strand === 'Operations & Algebraic Thinking' || strand === 'Algebra & Algebraic Thinking') {
      const results = findMatching([`MATH.CONTENT.${grade}.OA.`]);
      if (results.length === 0) return findMatching(['MATH.CONTENT.HSA']);
      return results;
    }
    if (strand === 'Counting & Cardinality') {
      return findMatching([`MATH.CONTENT.K.CC.`]);
    }
    if (strand === 'Geometry') {
      const results = findMatching([`MATH.CONTENT.${grade}.G.`]);
      if (results.length === 0) return findMatching(['MATH.CONTENT.HSG']);
      return results;
    }
    if (strand === 'Data & Measurement' || strand === 'Measurement & Data') {
      return findMatching([`MATH.CONTENT.${grade}.MD.`]);
    }
    if (strand === 'Expressions & Equations') {
      return findMatching([`MATH.CONTENT.${grade}.EE.`]);
    }
    if (strand === 'Ratios & Proportional Relationships') {
      return findMatching([`MATH.CONTENT.${grade}.RP.`]);
    }
    if (strand === 'Functions') {
      const results = findMatching([`MATH.CONTENT.${grade}.F.`]);
      if (results.length === 0) return findMatching(['MATH.CONTENT.HSF']);
      return results;
    }
    // Fallback for math - try to find any standards for this grade
    const fallback = findMatching([`MATH.CONTENT.${grade}.`]);
    if (fallback.length > 0) return fallback.slice(0, 3);
  }

  // ELA/Reading strands
  if (subjectName === 'Reading' || subjectName === 'ELA') {
    const gradePattern = grade === '9' || grade === '10' ? '9-10'
      : grade === '11' || grade === '12' ? '11-12' : grade;

    if (strand === 'Key Ideas & Details' || strand === 'Reading Literature') {
      return findMatching([`ELA-LITERACY.RL.${gradePattern}.`]);
    }
    if (strand === 'Craft & Structure' || strand === 'Vocabulary Acquisition') {
      return findMatching([`ELA-LITERACY.L.${gradePattern}.`]);
    }
    if (strand === 'Phonics & Word Recognition' || strand === 'Fluency') {
      return findMatching([`ELA-LITERACY.RF.${grade}.`]);
    }
    if (strand === 'Language') {
      return findMatching([`ELA-LITERACY.L.${gradePattern}.`]);
    }
    // Fallback for ELA
    const fallback = findMatching([`ELA-LITERACY.RL.${gradePattern}.`, `ELA-LITERACY.L.${gradePattern}.`]);
    if (fallback.length > 0) return fallback.slice(0, 3);
  }

  // Edexcel Math strands
  if (subjectName.includes('Edexcel Math')) {
    const stage = subjectName.includes('Pre-IG1') ? 'PRE-IG1'
                : subjectName.includes('Pre-IG2') ? 'PRE-IG2'
                : subjectName.includes('IG1') ? 'IG1' : 'IG2';

    if (strand === 'Number') {
      return findMatching([`EDEXCEL.MATH.${stage}.N`]);
    }
    if (strand === 'Algebra') {
      return findMatching([`EDEXCEL.MATH.${stage}.A`]);
    }
    if (strand === 'Ratio, Proportion & Rates of Change') {
      return findMatching([`EDEXCEL.MATH.${stage}.R`]);
    }
    if (strand === 'Geometry & Measures') {
      return findMatching([`EDEXCEL.MATH.${stage}.G`]);
    }
    if (strand === 'Probability') {
      return findMatching([`EDEXCEL.MATH.${stage}.P`]);
    }
    if (strand === 'Statistics') {
      return findMatching([`EDEXCEL.MATH.${stage}.S`]);
    }
    // Fallback for Edexcel Math
    const fallback = findMatching([`EDEXCEL.MATH.${stage}.`]);
    if (fallback.length > 0) return fallback.slice(0, 3);
  }

  // Edexcel English strands
  if (subjectName.includes('Edexcel English')) {
    const stage = subjectName.includes('Pre-IG1') ? 'PRE-IG1'
                : subjectName.includes('Pre-IG2') ? 'PRE-IG2'
                : subjectName.includes('IG1') ? 'IG1' : 'IG2';

    if (strand === 'Reading Comprehension') {
      return findMatching([`EDEXCEL.ENG.${stage}.RC`]);
    }
    if (strand === 'Transactional Writing' || strand === 'Imaginative Writing') {
      return findMatching([`EDEXCEL.ENG.${stage}.W`]);
    }
    if (strand === 'Grammar & Vocabulary') {
      return findMatching([`EDEXCEL.ENG.${stage}.G`, `EDEXCEL.ENG.${stage}.V`]);
    }
    if (strand === 'Text Analysis') {
      return findMatching([`EDEXCEL.ENG.${stage}.TA`]);
    }
    if (strand === 'Spoken Language') {
      return findMatching([`EDEXCEL.ENG.${stage}.SL`]);
    }
    // Fallback for Edexcel English
    const fallback = findMatching([`EDEXCEL.ENG.${stage}.`]);
    if (fallback.length > 0) return fallback.slice(0, 3);
  }

  return [];
};

interface ScreenerTestProps {
  grade: string;
  subject: Subject;
  studentName: string;
  studentId?: string;
  schoolId?: string;
  onComplete: (result: StudentResult) => void;
  onExit: () => void;
  useAdaptive?: boolean; // Enable adaptive testing mode
}

const ScreenerTest: React.FC<ScreenerTestProps> = ({
  grade,
  subject,
  studentName,
  studentId,
  schoolId,
  onComplete,
  onExit,
  useAdaptive = true
}) => {
  // Legacy mode state (backward compatible)
  const [legacyQuestions, setLegacyQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [legacyAnswers, setLegacyAnswers] = useState<Record<string, string>>({});

  // Adaptive mode state
  const [session, setSession] = useState<AdaptiveTestSession | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<ExtendedQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ExtendedQuestion | null>(null);
  const [questionsMap, setQuestionsMap] = useState<Map<string, ExtendedQuestion>>(new Map());

  // Shared state
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Map subject to QuestionSubject
  const getQuestionSubject = useCallback(() => {
    if (subject === 'Math') return 'Mathematics';
    if (subject.includes('Reading')) return 'Reading';
    if (subject === 'ELA') return 'ELA';
    // AP subjects - preserve original name for question bank routing
    if (subject.includes('AP ')) return subject;
    // Edexcel subjects - preserve original name for question bank routing
    if (subject.includes('Edexcel Math')) return subject;
    if (subject.includes('Edexcel English')) return subject;
    if (subject.includes('English')) return 'ELA';
    return 'ELA';
  }, [subject]);

  // Check if this is an Edexcel subject
  const isEdexcelSubject = useCallback(() => {
    return subject.includes('Edexcel');
  }, [subject]);

  // Get Edexcel stage from subject name (e.g., 'Edexcel Math Pre-IG1' -> 'Pre-IG1')
  const getEdexcelStage = useCallback(() => {
    if (subject.includes('Pre-IG1')) return 'Pre-IG1';
    if (subject.includes('Pre-IG2')) return 'Pre-IG2';
    if (subject.includes('IG1')) return 'IG1';
    if (subject.includes('IG2')) return 'IG2';
    return null;
  }, [subject]);

  // Get effective grade for question generation (maps Edexcel stages to equivalent US grades for AI fallback)
  const getEffectiveGrade = useCallback(() => {
    if (subject.includes('Pre-IG1')) return '7';  // UK Year 7-8 → US Grade 7
    if (subject.includes('Pre-IG2')) return '8';  // UK Year 8-9 → US Grade 8
    if (subject.includes('IG1')) return '9';      // UK Year 10 → US Grade 9
    if (subject.includes('IG2')) return '10';     // UK Year 11 → US Grade 10
    return grade;  // Use actual grade for non-Edexcel subjects
  }, [subject, grade]);

  // Get the grade/stage to use for loading questions from the question bank
  const getQuestionBankGrade = useCallback(() => {
    // For Edexcel subjects, use the stage name directly
    const edexcelStage = getEdexcelStage();
    if (edexcelStage) return edexcelStage;
    // For other subjects, use the student's grade
    return grade;
  }, [getEdexcelStage, grade]);

  // Initialize test
  useEffect(() => {
    const initializeTest = async () => {
      setLoading(true);
      const effectiveGrade = getEffectiveGrade();
      const questionBankGrade = getQuestionBankGrade();

      if (useAdaptive) {
        // Adaptive mode: Load question bank and create session
        try {
          const questionSubject = getQuestionSubject();

          // Try to load from static question bank first
          // For Edexcel, this uses the stage (e.g., 'Pre-IG1')
          // For CCSS, this uses the grade (e.g., '7')
          let questions = await loadAllQuestionsForGrade(questionSubject, questionBankGrade);

          // If no static questions, generate with AI
          if (questions.length < 10) {
            questions = await generateHybridQuestionSet(effectiveGrade, questionSubject, 25, questions);
          } else {
            // Get a balanced set
            questions = getQuestionsWithFormatDistribution(questions, 30);
          }

          setAvailableQuestions(questions);

          // Create questions map for quick lookup
          const qMap = new Map<string, ExtendedQuestion>();
          questions.forEach(q => qMap.set(q.id, q));
          setQuestionsMap(qMap);

          // Create adaptive session
          const newSession = createAdaptiveSession(
            studentId || studentName.toLowerCase().replace(/\s+/g, '.'),
            questionSubject,
            effectiveGrade
          );
          setSession(newSession);

          // Select first question
          const firstQuestion = selectNextQuestion(questions, newSession);
          if (firstQuestion) {
            setCurrentQuestion(firstQuestion.selectedQuestion);
          }
        } catch (error) {
          console.error('Error initializing adaptive test:', error);
          // Fallback to legacy mode
          const generated = await generateScreenerQuestions(effectiveGrade, subject, 10);
          setLegacyQuestions(generated);
        }
      } else {
        // Legacy mode
        const generated = await generateScreenerQuestions(effectiveGrade, subject, 10);
        setLegacyQuestions(generated);
      }

      setLoading(false);
      setQuestionStartTime(Date.now());
    };

    initializeTest();
  }, [grade, subject, studentId, studentName, useAdaptive, getQuestionSubject, getEffectiveGrade, getQuestionBankGrade]);

  // Handle answer for adaptive mode
  const handleAdaptiveAnswer = useCallback((answer: unknown, isCorrect: boolean) => {
    if (!session || !currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    // Process response and update session
    const updatedSession = processResponse(
      session,
      currentQuestion,
      isCorrect,
      timeSpent,
      questionsMap
    );
    setSession(updatedSession);

    // Check termination criteria
    const termination = shouldTerminate(updatedSession);

    if (termination.shouldStop) {
      // Finalize and end test
      const finalSession = finalizeSession(updatedSession);
      setSession(finalSession);
      setIsFinished(true);
    } else {
      // Select next question
      const nextQuestion = selectNextQuestion(availableQuestions, updatedSession);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion.selectedQuestion);
        setQuestionStartTime(Date.now());
      } else {
        // No more questions available
        const finalSession = finalizeSession(updatedSession);
        setSession(finalSession);
        setIsFinished(true);
      }
    }
  }, [session, currentQuestion, questionStartTime, questionsMap, availableQuestions]);

  // Handle answer for legacy mode
  const handleLegacyAnswer = (answer: string) => {
    setLegacyAnswers(prev => ({ ...prev, [legacyQuestions[currentIdx].id]: answer }));
    if (currentIdx < legacyQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Calculate and submit results
  const finishTest = () => {
    let level = ScreenerLevel.ON_ABOVE;
    let percentile = 50;
    const strandScores: Record<string, number> = {};
    const standardsPerformance: Record<string, { attempted: number; correct: number; name: string }> = {};

    if (useAdaptive && session) {
      // Adaptive mode: Use ability estimate
      const theta = session.finalAbilityEstimate ?? session.currentAbilityEstimate;
      percentile = abilityToPercentile(theta);

      const perfLevel = abilityToPerformanceLevel(theta);
      if (perfLevel === 'far_below') level = ScreenerLevel.FAR_BELOW;
      else if (perfLevel === 'below') level = ScreenerLevel.BELOW;
      else level = ScreenerLevel.ON_ABOVE;

      // Calculate strand scores and standards performance from session
      Object.entries(session.strandsTouch).forEach(([strand, countValue]) => {
        const count = countValue as number;
        const strandResponses = session.questionHistory.filter(r => {
          const q = questionsMap.get(r.questionId);
          return q?.strand === strand;
        });
        const correct = strandResponses.filter(r => r.isCorrect).length;
        strandScores[strand] = count > 0 ? Math.round((correct / count) * 100) : 0;
      });

      // Track performance by learning standard/objective
      const subjectName = subject === 'Math' ? 'Mathematics' : subject;
      session.questionHistory.forEach(response => {
        const question = questionsMap.get(response.questionId);
        if (question) {
          // Use ccssStandards if available, otherwise derive from strand
          let standards = question.ccssStandards && question.ccssStandards.length > 0
            ? question.ccssStandards
            : getStandardsForStrand(question.strand, grade, subjectName);

          standards.forEach(standard => {
            if (!standardsPerformance[standard]) {
              standardsPerformance[standard] = { attempted: 0, correct: 0, name: question.strand };
            }
            standardsPerformance[standard].attempted++;
            if (response.isCorrect) {
              standardsPerformance[standard].correct++;
            }
          });
        }
      });

      // Fallback: If no standards tracked, derive from strand scores
      if (Object.keys(standardsPerformance).length === 0) {
        Object.entries(strandScores).forEach(([strand, score]) => {
          const standards = getStandardsForStrand(strand, grade, subjectName);
          const strandData = session.strandsTouch[strand] || 1;
          const count = typeof strandData === 'number' ? strandData : 1;
          const correct = Math.round((score / 100) * count);

          standards.forEach(standard => {
            if (!standardsPerformance[standard]) {
              standardsPerformance[standard] = { attempted: count, correct, name: strand };
            }
          });
        });
      }
    } else {
      // Legacy mode: Calculate from answers
      let correctCount = 0;
      const strandCounts: Record<string, number> = {};
      const strandCorrect: Record<string, number> = {};

      legacyQuestions.forEach(q => {
        const isCorrect = legacyAnswers[q.id] === q.correctAnswer;
        if (isCorrect) correctCount++;

        strandCounts[q.strand] = (strandCounts[q.strand] || 0) + 1;
        if (!strandCorrect[q.strand]) strandCorrect[q.strand] = 0;
        if (isCorrect) {
          strandCorrect[q.strand]++;
          strandScores[q.strand] = (strandScores[q.strand] || 0) +
            100 / (legacyQuestions.filter(qu => qu.strand === q.strand).length || 1);
        }
      });

      // Derive standards from strands for legacy mode
      const subjectName = subject === 'Math' ? 'Mathematics' : subject;
      Object.entries(strandCounts).forEach(([strand, count]) => {
        const standards = getStandardsForStrand(strand, grade, subjectName);
        const correct = strandCorrect[strand] || 0;
        const strandScore = count > 0 ? correct / count : 0;

        // Distribute performance across derived standards
        standards.forEach(standard => {
          if (!standardsPerformance[standard]) {
            standardsPerformance[standard] = { attempted: 0, correct: 0, name: strand };
          }
          standardsPerformance[standard].attempted += count;
          standardsPerformance[standard].correct += correct;
        });
      });

      const percent = (correctCount / legacyQuestions.length) * 100;
      if (percent < 40) level = ScreenerLevel.FAR_BELOW;
      else if (percent < 70) level = ScreenerLevel.BELOW;
      percentile = Math.round(percent * 0.9);
    }

    // Calculate mastered vs gap objectives
    const masteredObjectives: string[] = [];
    const gapObjectives: string[] = [];

    Object.entries(standardsPerformance).forEach(([standard, perf]) => {
      const score = perf.attempted > 0 ? (perf.correct / perf.attempted) * 100 : 0;
      if (score >= 70) {
        masteredObjectives.push(standard);
      } else if (score < 60) {
        gapObjectives.push(standard);
      }
    });

    const result: StudentResult = {
      id: Math.random().toString(36).substr(2, 9),
      username: studentName.toLowerCase().split(' ').join('.'),
      firstName: studentName.split(' ')[0],
      lastName: studentName.split(' ')[1] || 'Student',
      grade,
      schoolId: schoolId || 'unknown',
      subject,
      overallLevel: level,
      percentile,
      strandScores,
      language: 'English',
      testDate: new Date().toISOString().split('T')[0],
      assignedAssessments: [],
      masteredObjectives,
      gapObjectives,
      standardsPerformance: Object.entries(standardsPerformance).map(([code, perf]) => ({
        standardCode: code,
        standardName: perf.name,
        questionsAttempted: perf.attempted,
        questionsCorrect: perf.correct,
        mastery: perf.attempted > 0
          ? (perf.correct / perf.attempted) >= 0.7 ? 'proficient'
            : (perf.correct / perf.attempted) >= 0.5 ? 'developing'
            : 'needs-support'
          : 'needs-support'
      }))
    };

    onComplete(result);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">
          {useAdaptive ? 'Preparing your adaptive screener...' : 'Loading questions...'}
        </p>
      </div>
    );
  }

  // Finished state
  if (isFinished) {
    const questionsAnswered = useAdaptive && session
      ? session.questionHistory.length
      : legacyQuestions.length;

    const correctCount = useAdaptive && session
      ? session.questionHistory.filter(r => r.isCorrect).length
      : Object.entries(legacyAnswers).filter(([id, ans]) =>
          legacyQuestions.find(q => q.id === id)?.correctAnswer === ans
        ).length;

    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-in slide-in-from-bottom duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">All Done!</h2>
        <p className="text-gray-600">
          Great job, {studentName}! You've completed your {subject} screener.
        </p>

        {useAdaptive && session && (
          <div className="bg-blue-50 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Test Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Questions Answered:</div>
              <div className="font-medium">{questionsAnswered}</div>
              <div className="text-gray-600">Correct Answers:</div>
              <div className="font-medium">{correctCount}</div>
              <div className="text-gray-600">Estimated Percentile:</div>
              <div className="font-medium">{abilityToPercentile(session.currentAbilityEstimate)}%</div>
            </div>
          </div>
        )}

        <button
          onClick={finishTest}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Submit Results
        </button>
      </div>
    );
  }

  // Adaptive mode question display
  if (useAdaptive && currentQuestion) {
    const questionsAnswered = session?.questionHistory.length || 0;
    const maxQuestions = ADAPTIVE_TEST_CONFIG.MAX_QUESTIONS;
    const progress = (questionsAnswered / maxQuestions) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              {subject} • Grade {grade}
            </h2>
            <p className="text-gray-500 text-xs">
              Question {questionsAnswered + 1} • Adaptive Mode
            </p>
          </div>
          <button onClick={onExit} className="text-gray-400 hover:text-red-500 transition-colors">
            Exit
          </button>
        </div>

        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

        <QuestionRenderer
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAdaptiveAnswer}
          questionNumber={questionsAnswered + 1}
          showFeedback={false}
          gradeLevel={grade}
        />

        <div className="flex justify-between items-center text-xs text-gray-400 px-2">
          <span>Strand: {currentQuestion.strand}</span>
          <span>
            Difficulty: {'★'.repeat(currentQuestion.difficulty)}{'☆'.repeat(5 - currentQuestion.difficulty)}
          </span>
        </div>
      </div>
    );
  }

  // Legacy mode question display
  const q = legacyQuestions[currentIdx];
  const progress = ((currentIdx + 1) / legacyQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">
            {subject} • Grade {grade}
          </h2>
          <p className="text-gray-500 text-xs">Question {currentIdx + 1} of {legacyQuestions.length}</p>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-red-500 transition-colors">
          Exit
        </button>
      </div>

      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 min-h-[300px] flex flex-col justify-between">
        <div className="space-y-6">
          <p className="text-2xl font-semibold text-gray-800 leading-tight">{q.text}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleLegacyAnswer(opt)}
                className="p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-700 font-medium text-lg active:scale-[0.98]"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
          <span>Strand: {q.strand}</span>
          <span>Adaptive Level: {grade}</span>
        </div>
      </div>
    </div>
  );
};

export default ScreenerTest;
