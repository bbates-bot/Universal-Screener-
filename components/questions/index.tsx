import React, { useState } from 'react';
import {
  ExtendedQuestion,
  QuestionFormat,
  isMultipleChoiceOptions,
  isTrueFalseOptions,
  isMatchingOptions,
  isDragDropOptions,
  isPictureChoiceOptions
} from '../../types';

// Helper to check if grade is K-2
const isK2Grade = (gradeLevel?: string): boolean => {
  if (!gradeLevel) return false;
  const grade = gradeLevel.toUpperCase();
  return grade === 'K' || grade === '1' || grade === '2';
};

// Inline SVG Icons for K-2 Yes/No buttons
const ThumbsUpIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto"
  >
    <path
      d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThumbsDownIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto"
  >
    <path
      d="M17 2V13M22 11V4C22 2.89543 21.1046 2 20 2H6.57385C5.09303 2 3.83383 3.08031 3.60863 4.54379L2.53175 11.5438C2.25217 13.3611 3.65823 15 5.49682 15H9C9.55228 15 10 15.4477 10 16V19.5342C10 20.896 11.104 22 12.4658 22C12.7907 22 13.085 21.8087 13.2169 21.5119L16.7361 13.5939C16.8966 13.2327 17.2547 13 17.6499 13H20C21.1046 13 22 12.1046 22 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const [pictureChoiceSelection, setPictureChoiceSelection] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleMultipleChoiceSelect = (choice: string) => {
    if (answered) return;
    setSelectedAnswer(choice);
  };

  const handleMultipleChoiceSubmit = () => {
    if (answered || selectedAnswer === null) return;

    setAnswered(true);

    if (isMultipleChoiceOptions(question.questionOptions)) {
      const isCorrect = selectedAnswer === question.questionOptions.correctAnswer;
      onAnswer(selectedAnswer, isCorrect);
    }
  };

  const handleTrueFalseSelect = (value: boolean) => {
    if (answered) return;
    setSelectedAnswer(value);
  };

  const handleTrueFalseSubmit = () => {
    if (answered || selectedAnswer === null) return;

    setAnswered(true);

    if (isTrueFalseOptions(question.questionOptions)) {
      const isCorrect = selectedAnswer === question.questionOptions.correctAnswer;
      onAnswer(selectedAnswer, isCorrect);
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

  const handlePictureChoiceSelect = (index: number) => {
    if (answered) return;
    setPictureChoiceSelection(index);
  };

  const handlePictureChoiceSubmit = () => {
    if (answered || pictureChoiceSelection === null) return;

    setAnswered(true);

    if (isPictureChoiceOptions(question.questionOptions)) {
      const isCorrect = pictureChoiceSelection === question.questionOptions.correctAnswerIndex;
      onAnswer(pictureChoiceSelection, isCorrect);
    }
  };

  // Render passage section if passage text exists (for reading comprehension)
  const PassageSection = () => {
    if (!question.passageText) return null;

    return (
      <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        {question.passage && (
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            {question.passage}
          </p>
        )}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {question.passageText}
        </p>
      </div>
    );
  };

  // Render based on question format
  if (question.format === QuestionFormat.MULTIPLE_CHOICE && isMultipleChoiceOptions(question.questionOptions)) {
    // K-2 gets larger text and spacing for better visibility (especially for emoji visuals)
    const isYoungLearner = isK2Grade(gradeLevel || question.gradeLevel);

    return (
      <div className={`bg-white ${isYoungLearner ? 'p-10' : 'p-8'} rounded-3xl shadow-xl border border-gray-100`}>
        <PassageSection />
        <div className={isYoungLearner ? 'space-y-8' : 'space-y-6'}>
          {/* Question text - larger for K-2 to display emoji visuals (🍎⭐) better */}
          <p className={`${isYoungLearner ? 'text-3xl md:text-4xl' : 'text-2xl'} font-semibold text-gray-800 leading-relaxed ${isYoungLearner ? 'text-center' : ''}`}>
            {question.text}
          </p>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${isYoungLearner ? 'gap-6' : 'gap-4'}`}>
            {question.questionOptions.choices.map((choice, i) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectAnswer = showFeedback && answered && choice === question.questionOptions.correctAnswer;

              return (
                <button
                  key={i}
                  onClick={() => handleMultipleChoiceSelect(choice)}
                  disabled={answered}
                  className={`${isYoungLearner ? 'p-6' : 'p-5'} text-left border-2 rounded-2xl transition-all text-gray-700 font-medium ${isYoungLearner ? 'text-xl md:text-2xl' : 'text-lg'}
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
                  <span className={`inline-flex items-center justify-center ${isYoungLearner ? 'w-10 h-10' : 'w-8 h-8'} rounded-full bg-gray-100 text-gray-600 font-bold mr-3`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice}
                </button>
              );
            })}
          </div>
          {!answered && selectedAnswer !== null && (
            <div className={isYoungLearner ? 'flex justify-center' : 'flex justify-end'}>
              <button
                onClick={handleMultipleChoiceSubmit}
                className={`${isYoungLearner ? 'px-12 py-4 text-xl' : 'px-8 py-3 text-lg'} bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors`}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (question.format === QuestionFormat.TRUE_FALSE && isTrueFalseOptions(question.questionOptions)) {
    // Use K-2 visual Yes/No buttons for young grades
    const useK2Visual = isK2Grade(gradeLevel || question.gradeLevel);

    if (useK2Visual) {
      // K-2 Visual Yes/No with large buttons and icons
      // Extra large for young children to easily tap/click
      return (
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <PassageSection />
          <div className="space-y-10">
            {/* Larger question text for K-2 with emoji support */}
            <p className="text-3xl md:text-4xl font-semibold text-gray-800 leading-relaxed text-center">
              {question.text}
            </p>
            <div className="flex gap-8 md:gap-12 justify-center">
              {[
                { value: true, label: 'YES', Icon: ThumbsUpIcon, color: 'green' },
                { value: false, label: 'NO', Icon: ThumbsDownIcon, color: 'red' }
              ].map(({ value, label, Icon, color }) => {
                const isSelected = selectedAnswer === value;
                const isCorrectAnswer = showFeedback && answered && value === question.questionOptions.correctAnswer;

                return (
                  <button
                    key={String(value)}
                    onClick={() => handleTrueFalseSelect(value)}
                    disabled={answered}
                    className={`w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 flex flex-col items-center justify-center border-4 rounded-3xl transition-all
                      ${isSelected
                        ? isCorrectAnswer || !showFeedback
                          ? `border-${color}-500 bg-${color}-50 ring-4 ring-${color}-200`
                          : 'border-red-500 bg-red-50 ring-4 ring-red-200'
                        : isCorrectAnswer
                          ? `border-${color}-500 bg-${color}-50`
                          : `border-gray-200 hover:border-${color}-400 hover:bg-${color}-50`
                      }
                      ${answered ? 'cursor-default' : 'active:scale-95'}
                    `}
                    style={{
                      backgroundColor: isSelected
                        ? (isCorrectAnswer || !showFeedback)
                          ? color === 'green' ? '#f0fdf4' : '#fef2f2'
                          : '#fef2f2'
                        : isCorrectAnswer
                          ? color === 'green' ? '#f0fdf4' : '#fef2f2'
                          : undefined,
                      borderColor: isSelected
                        ? (isCorrectAnswer || !showFeedback)
                          ? color === 'green' ? '#22c55e' : '#ef4444'
                          : '#ef4444'
                        : isCorrectAnswer
                          ? color === 'green' ? '#22c55e' : '#ef4444'
                          : '#e5e7eb'
                    }}
                  >
                    {/* Larger icon for K-2 */}
                    <span className={`${isSelected ? (color === 'green' ? 'text-green-600' : 'text-red-600') : (color === 'green' ? 'text-green-500' : 'text-red-500')} transform scale-125 md:scale-150`}>
                      <Icon />
                    </span>
                    <span
                      className="mt-3 md:mt-4 font-bold text-3xl md:text-4xl"
                      style={{
                        color: isSelected
                          ? color === 'green' ? '#16a34a' : '#dc2626'
                          : color === 'green' ? '#22c55e' : '#ef4444'
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            {!answered && selectedAnswer !== null && (
              <div className="flex justify-center">
                <button
                  onClick={handleTrueFalseSubmit}
                  className="px-14 py-5 bg-blue-600 text-white rounded-2xl font-bold text-2xl hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Standard True/False for grade 3+
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <PassageSection />
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
          {!answered && selectedAnswer !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleTrueFalseSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (question.format === QuestionFormat.MATCHING && isMatchingOptions(question.questionOptions)) {
    const { leftItems, rightItems } = question.questionOptions;

    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <PassageSection />
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
            <div className="flex justify-end">
              <button
                onClick={handleMatchingComplete}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (question.format === QuestionFormat.DRAG_AND_DROP && isDragDropOptions(question.questionOptions)) {
    const { draggableItems, dropZones } = question.questionOptions;

    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <PassageSection />
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
            <div className="flex justify-end">
              <button
                onClick={handleDragDropComplete}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PICTURE_CHOICE format for visual K-2 questions
  // Enhanced with larger images and more spacing for young learners
  if (question.format === QuestionFormat.PICTURE_CHOICE && isPictureChoiceOptions(question.questionOptions)) {
    const { images, correctAnswerIndex } = question.questionOptions;
    const isYoungLearner = isK2Grade(question.gradeLevel);

    // K-2 gets larger images with more spacing
    const imageClasses = isYoungLearner
      ? 'w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60'
      : 'w-32 h-32 md:w-40 md:h-40';
    const gapClass = isYoungLearner ? 'gap-8 md:gap-10' : 'gap-6';
    const labelClasses = isYoungLearner
      ? 'mt-4 font-bold text-2xl md:text-3xl text-gray-700'
      : 'mt-3 font-bold text-xl md:text-2xl text-gray-700';
    const paddingClasses = isYoungLearner ? 'p-6' : 'p-4';

    return (
      <div className={`bg-white ${isYoungLearner ? 'p-10' : 'p-8'} rounded-3xl shadow-xl border border-gray-100`}>
        <PassageSection />
        <div className={isYoungLearner ? 'space-y-10' : 'space-y-8'}>
          <p className={`${isYoungLearner ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'} font-semibold text-gray-800 leading-tight text-center`}>
            {question.text}
          </p>
          <div className={`grid ${gapClass} justify-center ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
            {images.map((image, index) => {
              const isSelected = pictureChoiceSelection === index;
              const isCorrectAnswer = showFeedback && answered && index === correctAnswerIndex;

              return (
                <button
                  key={index}
                  onClick={() => handlePictureChoiceSelect(index)}
                  disabled={answered}
                  className={`flex flex-col items-center ${paddingClasses} border-4 rounded-3xl transition-all
                    ${isSelected
                      ? isCorrectAnswer || !showFeedback
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200'
                        : 'border-red-500 bg-red-50 ring-4 ring-red-200'
                      : isCorrectAnswer
                        ? 'border-green-500 bg-green-50 ring-4 ring-green-200'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }
                    ${answered ? 'cursor-default' : 'active:scale-95'}
                  `}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className={`${imageClasses} object-contain rounded-xl`}
                    loading="eager"
                  />
                  {image.label && (
                    <span className={labelClasses}>
                      {image.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!answered && pictureChoiceSelection !== null && (
            <div className="flex justify-center">
              <button
                onClick={handlePictureChoiceSubmit}
                className={`${isYoungLearner ? 'px-14 py-5 text-2xl' : 'px-10 py-4 text-xl'} bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors`}
              >
                Submit
              </button>
            </div>
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
