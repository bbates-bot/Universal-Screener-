import React, { useState } from 'react';
import {
  ExtendedQuestion,
  QuestionFormat,
  isMultipleChoiceOptions,
  isTrueFalseOptions,
  isMatchingOptions,
  isDragDropOptions
} from '../../types';

interface QuestionRendererProps {
  question: ExtendedQuestion;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
  questionNumber: number;
  showFeedback?: boolean;
  gradeLevel?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  questionNumber,
  showFeedback = false,
  gradeLevel
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [matchingSelections, setMatchingSelections] = useState<Record<number, number>>({});
  const [dragDropPlacements, setDragDropPlacements] = useState<Record<number, number>>({});
  const [answered, setAnswered] = useState(false);

  const handleMultipleChoiceSelect = (choice: string) => {
    if (answered) return;

    setSelectedAnswer(choice);
    setAnswered(true);

    if (isMultipleChoiceOptions(question.questionOptions)) {
      const isCorrect = choice === question.questionOptions.correctAnswer;
      onAnswer(choice, isCorrect);
    }
  };

  const handleTrueFalseSelect = (value: boolean) => {
    if (answered) return;

    setSelectedAnswer(value);
    setAnswered(true);

    if (isTrueFalseOptions(question.questionOptions)) {
      const isCorrect = value === question.questionOptions.correctAnswer;
      onAnswer(value, isCorrect);
    }
  };

  const handleMatchingComplete = () => {
    if (answered) return;

    setAnswered(true);

    if (isMatchingOptions(question.questionOptions)) {
      const correctMatches = question.questionOptions.correctMatches;
      let correct = 0;
      let total = Object.keys(correctMatches).length;

      Object.entries(matchingSelections).forEach(([left, right]) => {
        if (correctMatches[parseInt(left)] === right) {
          correct++;
        }
      });

      const isCorrect = correct === total;
      onAnswer(matchingSelections, isCorrect);
    }
  };

  const handleDragDropComplete = () => {
    if (answered) return;

    setAnswered(true);

    if (isDragDropOptions(question.questionOptions)) {
      const correctPlacements = question.questionOptions.correctPlacements;
      let correct = 0;
      let total = Object.keys(correctPlacements).length;

      Object.entries(dragDropPlacements).forEach(([item, zone]) => {
        if (correctPlacements[parseInt(item)] === zone) {
          correct++;
        }
      });

      const isCorrect = correct === total;
      onAnswer(dragDropPlacements, isCorrect);
    }
  };

  // Render based on question format
  if (question.format === QuestionFormat.MULTIPLE_CHOICE && isMultipleChoiceOptions(question.questionOptions)) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="space-y-6">
          <p className="text-2xl font-semibold text-gray-800 leading-tight">{question.text}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.questionOptions.choices.map((choice, i) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectAnswer = showFeedback && answered && choice === question.questionOptions.correctAnswer;

              return (
                <button
                  key={i}
                  onClick={() => handleMultipleChoiceSelect(choice)}
                  disabled={answered}
                  className={`p-5 text-left border-2 rounded-2xl transition-all text-gray-700 font-medium text-lg
                    ${isSelected
                      ? isCorrectAnswer || !showFeedback
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-red-500 bg-red-50'
                      : isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-blue-500 hover:bg-blue-50'
                    }
                    ${answered ? 'cursor-default' : 'active:scale-[0.98]'}
                  `}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold mr-3">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (question.format === QuestionFormat.TRUE_FALSE && isTrueFalseOptions(question.questionOptions)) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="space-y-6">
          <p className="text-2xl font-semibold text-gray-800 leading-tight">{question.text}</p>
          <div className="flex gap-4 justify-center">
            {[true, false].map((value) => {
              const isSelected = selectedAnswer === value;
              const isCorrectAnswer = showFeedback && answered && value === question.questionOptions.correctAnswer;

              return (
                <button
                  key={String(value)}
                  onClick={() => handleTrueFalseSelect(value)}
                  disabled={answered}
                  className={`px-12 py-6 border-2 rounded-2xl transition-all font-bold text-xl
                    ${isSelected
                      ? isCorrectAnswer || !showFeedback
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : isCorrectAnswer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
                    }
                    ${answered ? 'cursor-default' : 'active:scale-[0.98]'}
                  `}
                >
                  {value ? 'True' : 'False'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (question.format === QuestionFormat.MATCHING && isMatchingOptions(question.questionOptions)) {
    const { leftItems, rightItems } = question.questionOptions;

    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="space-y-6">
          <p className="text-2xl font-semibold text-gray-800 leading-tight">{question.text}</p>
          <p className="text-gray-500">Match each item on the left with the correct item on the right.</p>

          <div className="space-y-4">
            {leftItems.map((left, leftIdx) => (
              <div key={leftIdx} className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-blue-50 rounded-xl font-medium">
                  {leftIdx + 1}. {left}
                </div>
                <span className="text-gray-400">→</span>
                <select
                  value={matchingSelections[leftIdx] ?? ''}
                  onChange={(e) => setMatchingSelections(prev => ({
                    ...prev,
                    [leftIdx]: parseInt(e.target.value)
                  }))}
                  disabled={answered}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-xl font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select...</option>
                  {rightItems.map((right, rightIdx) => (
                    <option key={rightIdx} value={rightIdx}>
                      {String.fromCharCode(65 + rightIdx)}. {right}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {!answered && Object.keys(matchingSelections).length === leftItems.length && (
            <button
              onClick={handleMatchingComplete}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>
    );
  }

  if (question.format === QuestionFormat.DRAG_AND_DROP && isDragDropOptions(question.questionOptions)) {
    const { draggableItems, dropZones } = question.questionOptions;

    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="space-y-6">
          <p className="text-2xl font-semibold text-gray-800 leading-tight">{question.text}</p>
          <p className="text-gray-500">Place each item in the correct zone.</p>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-400 uppercase">Items</p>
              {draggableItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl font-medium"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-400 uppercase">Zones</p>
              {dropZones.map((zone, zoneIdx) => (
                <div key={zoneIdx} className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{zone.label}</p>
                  <select
                    value={Object.entries(dragDropPlacements).find(([_, z]) => z === zoneIdx)?.[0] ?? ''}
                    onChange={(e) => {
                      const itemIdx = parseInt(e.target.value);
                      setDragDropPlacements(prev => {
                        const updated = { ...prev };
                        // Remove item from previous zone
                        Object.entries(updated).forEach(([key, val]) => {
                          if (val === zoneIdx) delete updated[parseInt(key)];
                        });
                        // Place in new zone
                        if (!isNaN(itemIdx)) {
                          updated[itemIdx] = zoneIdx;
                        }
                        return updated;
                      });
                    }}
                    disabled={answered}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                  >
                    <option value="">Select item...</option>
                    {draggableItems.map((item, itemIdx) => (
                      <option key={itemIdx} value={itemIdx}>{item}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {!answered && Object.keys(dragDropPlacements).length === draggableItems.length && (
            <button
              onClick={handleDragDropComplete}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback for unknown format
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <p className="text-gray-500">Unknown question format</p>
    </div>
  );
};

export default QuestionRenderer;
