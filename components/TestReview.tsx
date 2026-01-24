import React, { useState, useEffect, useMemo } from 'react';
import {
  ExtendedQuestion,
  QuestionFormat,
  QuestionSubject,
  isMultipleChoiceOptions,
  isTrueFalseOptions,
  isMatchingOptions,
  isDragDropOptions
} from '../types';
import { UserRole, Subject } from '../types';
import { loadAllQuestionsForGrade, getDomainsForGrade } from '../services/questionBankService';
import { downloadTestPDF } from '../services/pdfGenerationService';
import { updateQuestion } from '../services/firestoreService';
import { GRADES, EDEXCEL_MATH_STRANDS, EDEXCEL_ENGLISH_STRANDS, getStrandsForSubject } from '../constants';
import QuestionEditor from './QuestionEditor';

interface TestReviewProps {
  userRole: UserRole;
}

type CurriculumType = 'CCSS' | 'Edexcel' | 'AP';

const SUBJECTS: QuestionSubject[] = ['Mathematics', 'Reading', 'ELA'];

const AP_COURSES = [
  { value: 'ap-precalculus', label: 'AP Precalculus', subject: 'Mathematics' as QuestionSubject },
  { value: 'ap-calculus-ab', label: 'AP Calculus AB', subject: 'Mathematics' as QuestionSubject },
  { value: 'ap-calculus-bc', label: 'AP Calculus BC', subject: 'Mathematics' as QuestionSubject },
  { value: 'ap-statistics', label: 'AP Statistics', subject: 'Mathematics' as QuestionSubject },
  { value: 'ap-macroeconomics', label: 'AP Macroeconomics', subject: 'Mathematics' as QuestionSubject }
];

const EDEXCEL_STAGES = [
  { value: 'Pre-IG1', label: 'Pre-IG Stage 1', grade: '7' },
  { value: 'Pre-IG2', label: 'Pre-IG Stage 2', grade: '8' },
  { value: 'IG1', label: 'IG Stage 1', grade: '9' },
  { value: 'IG2', label: 'IG Stage 2', grade: '10' }
];

const EDEXCEL_SUBJECT_OPTIONS = [
  { value: 'Math', label: 'Mathematics' },
  { value: 'English', label: 'English Language' }
];

const TestReview: React.FC<TestReviewProps> = ({ userRole }) => {
  // Curriculum type selection
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('CCSS');

  // CCSS state
  const [selectedGrade, setSelectedGrade] = useState<string>('K');
  const [selectedSubject, setSelectedSubject] = useState<QuestionSubject>('Mathematics');

  // Edexcel state
  const [edexcelStage, setEdexcelStage] = useState<string>('Pre-IG1');
  const [edexcelSubject, setEdexcelSubject] = useState<string>('Math');

  // AP state
  const [apCourse, setApCourse] = useState<string>('ap-macroeconomics');

  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<ExtendedQuestion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const canEdit = userRole === UserRole.ADMIN || userRole === UserRole.TEACHER;

  // Get effective grade and subject based on curriculum type
  const effectiveGrade = useMemo(() => {
    if (curriculumType === 'Edexcel') {
      return EDEXCEL_STAGES.find(s => s.value === edexcelStage)?.grade || '7';
    }
    if (curriculumType === 'AP') {
      return apCourse;
    }
    return selectedGrade;
  }, [curriculumType, edexcelStage, selectedGrade, apCourse]);

  const effectiveSubject = useMemo((): QuestionSubject | string => {
    if (curriculumType === 'Edexcel') {
      // Return full subject name for question bank routing
      return `Edexcel ${edexcelSubject} ${edexcelStage}`;
    }
    if (curriculumType === 'AP') {
      // Return AP course name for question bank routing
      return AP_COURSES.find(c => c.value === apCourse)?.label || apCourse;
    }
    return selectedSubject;
  }, [curriculumType, edexcelSubject, edexcelStage, selectedSubject, apCourse]);

  // Get the full Edexcel subject name for display
  const edexcelFullSubject = useMemo((): Subject | null => {
    if (curriculumType !== 'Edexcel') return null;
    return `Edexcel ${edexcelSubject} ${edexcelStage}` as Subject;
  }, [curriculumType, edexcelSubject, edexcelStage]);

  // Get strands based on curriculum type
  const currentStrands = useMemo(() => {
    if (curriculumType === 'Edexcel') {
      return edexcelSubject === 'Math' ? EDEXCEL_MATH_STRANDS : EDEXCEL_ENGLISH_STRANDS;
    }
    return null; // CCSS strands come from the questions themselves
  }, [curriculumType, edexcelSubject]);

  // Load questions when grade or subject changes
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // For Edexcel, pass the stage directly (e.g., 'Pre-IG1')
        // For AP, pass the course directly (e.g., 'ap-macroeconomics')
        // For CCSS, pass the grade (e.g., '7')
        let gradeOrStage: string;
        if (curriculumType === 'Edexcel') {
          gradeOrStage = edexcelStage;
        } else if (curriculumType === 'AP') {
          gradeOrStage = apCourse;
        } else {
          gradeOrStage = selectedGrade;
        }
        const loadedQuestions = await loadAllQuestionsForGrade(effectiveSubject, gradeOrStage);

        setQuestions(loadedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      }
      setLoading(false);
    };

    loadQuestions();
  }, [selectedGrade, effectiveSubject, curriculumType, edexcelStage, edexcelSubject, apCourse]);

  // Group questions by strand
  const questionsByStrand = useMemo(() => {
    const grouped: Record<string, ExtendedQuestion[]> = {};
    questions.forEach(q => {
      if (!grouped[q.strand]) {
        grouped[q.strand] = [];
      }
      grouped[q.strand].push(q);
    });
    return grouped;
  }, [questions]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedQuestions(new Set(questions.map(q => q.id)));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const handleDownloadPDF = (includeAnswerKey: boolean) => {
    if (questions.length === 0) return;

    let gradeLevel: string;
    let subject: any;

    if (curriculumType === 'Edexcel') {
      gradeLevel = edexcelStage;
      subject = `Edexcel ${edexcelSubject === 'Math' ? 'Mathematics' : 'English'} ${edexcelStage}`;
    } else if (curriculumType === 'AP') {
      gradeLevel = apCourse;
      subject = AP_COURSES.find(c => c.value === apCourse)?.label || 'AP Course';
    } else {
      gradeLevel = selectedGrade;
      subject = selectedSubject;
    }

    downloadTestPDF(questions, {
      includeAnswerKey,
      gradeLevel,
      subject
    });
  };

  const handleEditClick = (question: ExtendedQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuestion(question);
  };

  const handleSaveQuestion = async (updatedQuestion: ExtendedQuestion) => {
    setIsSaving(true);
    try {
      await updateQuestion(updatedQuestion);
      // Update local state
      setQuestions(prev => prev.map(q =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ));
      setEditingQuestion(null);
      setSaveSuccess(updatedQuestion.id);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getFormatBadge = (format: QuestionFormat) => {
    const styles: Record<QuestionFormat, { bg: string; text: string; label: string }> = {
      [QuestionFormat.MULTIPLE_CHOICE]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Multiple Choice' },
      [QuestionFormat.TRUE_FALSE]: { bg: 'bg-green-100', text: 'text-green-700', label: 'True/False' },
      [QuestionFormat.MATCHING]: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Matching' },
      [QuestionFormat.DRAG_AND_DROP]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Drag & Drop' }
    };
    const style = styles[format] || { bg: 'bg-gray-100', text: 'text-gray-700', label: format };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: number) => {
    const labels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    const colors = ['', 'bg-emerald-100 text-emerald-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700'];
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colors[difficulty] || 'bg-gray-100 text-gray-700'}`}>
        {labels[difficulty] || `Level ${difficulty}`}
      </span>
    );
  };

  const renderAnswer = (question: ExtendedQuestion) => {
    const { questionOptions, format } = question;

    if (format === QuestionFormat.MULTIPLE_CHOICE && isMultipleChoiceOptions(questionOptions)) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 mb-2">Options:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {questionOptions.choices.map((choice, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 ${
                  choice === questionOptions.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    choice === questionOptions.correctAnswer
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={choice === questionOptions.correctAnswer ? 'font-medium text-green-700' : 'text-gray-600'}>
                    {choice}
                  </span>
                  {choice === questionOptions.correctAnswer && (
                    <svg className="w-5 h-5 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (format === QuestionFormat.TRUE_FALSE && isTrueFalseOptions(questionOptions)) {
      return (
        <div className="flex gap-4">
          <div className={`px-6 py-3 rounded-lg border-2 font-bold ${
            questionOptions.correctAnswer === true
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-50 text-gray-400'
          }`}>
            True {questionOptions.correctAnswer === true && '✓'}
          </div>
          <div className={`px-6 py-3 rounded-lg border-2 font-bold ${
            questionOptions.correctAnswer === false
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-50 text-gray-400'
          }`}>
            False {questionOptions.correctAnswer === false && '✓'}
          </div>
        </div>
      );
    }

    if (format === QuestionFormat.MATCHING && isMatchingOptions(questionOptions)) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 mb-2">Correct Matches:</div>
          <div className="space-y-2">
            {questionOptions.leftItems.map((left, idx) => {
              const rightIdx = questionOptions.correctMatches[idx];
              const right = questionOptions.rightItems[rightIdx];
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-gray-700">{left}</span>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="font-medium text-green-700">{right}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (format === QuestionFormat.DRAG_AND_DROP && isDragDropOptions(questionOptions)) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 mb-2">Correct Placements:</div>
          <div className="space-y-2">
            {questionOptions.dropZones.map((zone, zoneIdx) => {
              const itemIdx = Object.entries(questionOptions.correctPlacements).find(
                ([_, zIdx]) => zIdx === zoneIdx
              )?.[0];
              const item = itemIdx !== undefined ? questionOptions.draggableItems[parseInt(itemIdx)] : null;
              return (
                <div key={zoneIdx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded font-medium">{item || '?'}</span>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="font-medium text-green-700">{zone.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return <div className="text-gray-500 italic">Answer format not available</div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Bank Review</h2>
          <p className="text-gray-500">Review all test questions and answers by grade and subject</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm">
            {questions.length} Questions
          </span>
          {/* PDF Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadPDF(false)}
              disabled={questions.length === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download test without answers"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Student PDF
            </button>
            <button
              onClick={() => handleDownloadPDF(true)}
              disabled={questions.length === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl font-medium text-sm text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download test with answer key"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Answer Key PDF
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Type Toggle */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase mr-2">Curriculum:</span>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setCurriculumType('CCSS')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                curriculumType === 'CCSS'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              CCSS Aligned
            </button>
            <button
              onClick={() => setCurriculumType('AP')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                curriculumType === 'AP'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              AP Courses
            </button>
            <button
              onClick={() => setCurriculumType('Edexcel')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                curriculumType === 'Edexcel'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Edexcel IGCSE
            </button>
          </div>
          {curriculumType === 'Edexcel' && edexcelFullSubject && (
            <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
              {edexcelFullSubject}
            </span>
          )}
          {curriculumType === 'AP' && (
            <span className="ml-4 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">
              {AP_COURSES.find(c => c.value === apCourse)?.label || 'AP Course'}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curriculumType === 'CCSS' ? (
            <>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Grade Level</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  {GRADES.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Subject</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as QuestionSubject)}
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </>
          ) : curriculumType === 'AP' ? (
            <>
              <div>
                <label className="text-xs font-bold text-emerald-400 uppercase block mb-2">AP Course</label>
                <select
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={apCourse}
                  onChange={(e) => setApCourse(e.target.value)}
                >
                  {AP_COURSES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-400 uppercase block mb-2">Assessment Type</label>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-medium text-emerald-700">
                  Prerequisite Assessment
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-purple-400 uppercase block mb-2">IGCSE Stage</label>
                <select
                  className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={edexcelStage}
                  onChange={(e) => setEdexcelStage(e.target.value)}
                >
                  {EDEXCEL_STAGES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-purple-400 uppercase block mb-2">Subject</label>
                <select
                  className="w-full bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={edexcelSubject}
                  onChange={(e) => setEdexcelSubject(e.target.value)}
                >
                  {EDEXCEL_SUBJECT_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={expandAll}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                curriculumType === 'Edexcel'
                  ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  : curriculumType === 'AP'
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading questions...</p>
        </div>
      )}

      {/* No Questions */}
      {!loading && questions.length === 0 && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            curriculumType === 'Edexcel' ? 'bg-purple-100' : curriculumType === 'AP' ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-8 h-8 ${curriculumType === 'Edexcel' ? 'text-purple-400' : curriculumType === 'AP' ? 'text-emerald-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            {curriculumType === 'Edexcel'
              ? `No questions found for Edexcel ${edexcelSubject === 'Math' ? 'Mathematics' : 'English'} ${edexcelStage}`
              : curriculumType === 'AP'
              ? `No questions found for ${AP_COURSES.find(c => c.value === apCourse)?.label || 'AP Course'}`
              : `No questions found for Grade ${selectedGrade} ${selectedSubject}`
            }
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {curriculumType === 'Edexcel'
              ? 'Try selecting a different stage or subject'
              : curriculumType === 'AP'
              ? 'Try selecting a different AP course'
              : 'Try selecting a different grade or subject'
            }
          </p>
        </div>
      )}

      {/* Questions by Strand */}
      {!loading && (Object.entries(questionsByStrand) as [string, ExtendedQuestion[]][]).map(([strand, strandQuestions]) => (
        <div key={strand} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Strand Header */}
          <div className={`px-6 py-4 border-b border-gray-100 ${
            curriculumType === 'Edexcel'
              ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50'
              : curriculumType === 'AP'
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold ${curriculumType === 'Edexcel' ? 'text-purple-900' : curriculumType === 'AP' ? 'text-emerald-900' : 'text-indigo-900'}`}>
                {strand}
              </h3>
              <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm">
                {strandQuestions.length} question{strandQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Questions List */}
          <div className="divide-y divide-gray-100">
            {strandQuestions.map((question, idx) => (
              <div key={question.id} className="p-6">
                {/* Question Header */}
                <div
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => toggleQuestion(question.id)}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-600 text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getFormatBadge(question.format)}
                      {getDifficultyBadge(question.difficulty)}
                      {question.ccssStandards.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          {question.ccssStandards[0].replace('CCSS.MATH.CONTENT.', '').replace('CCSS.ELA-LITERACY.', '')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 font-medium text-lg">{question.text}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <button
                        onClick={(e) => handleEditClick(question, e)}
                        className="flex-shrink-0 p-2 hover:bg-indigo-100 rounded-lg transition-colors group"
                        title="Edit question"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    {saveSuccess === question.id && (
                      <span className="text-xs text-green-600 font-medium animate-pulse">Saved!</span>
                    )}
                    <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions.has(question.id) ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Section */}
                {expandedQuestions.has(question.id) && (
                  <div className="mt-4 ml-12 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                    {renderAnswer(question)}
                    {question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">Explanation</div>
                        <p className="text-blue-700">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setEditingQuestion(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default TestReview;
