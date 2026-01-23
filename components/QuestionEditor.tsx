import React, { useState, useEffect } from 'react';
import {
  ExtendedQuestion,
  QuestionFormat,
  QuestionOptions,
  MultipleChoiceOptions,
  TrueFalseOptions,
  MatchingOptions,
  DragDropOptions,
  DifficultyLevel,
  isMultipleChoiceOptions,
  isTrueFalseOptions,
  isMatchingOptions,
  isDragDropOptions
} from '../types';

interface QuestionEditorProps {
  question: ExtendedQuestion;
  onSave: (question: ExtendedQuestion) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onSave,
  onCancel,
  isSaving
}) => {
  const [editedQuestion, setEditedQuestion] = useState<ExtendedQuestion>({ ...question });

  // Reset when question changes
  useEffect(() => {
    setEditedQuestion({ ...question });
  }, [question]);

  const handleTextChange = (text: string) => {
    setEditedQuestion(prev => ({ ...prev, text }));
  };

  const handleDifficultyChange = (difficulty: number) => {
    setEditedQuestion(prev => ({ ...prev, difficulty }));
  };

  const handleCCSSChange = (standards: string) => {
    const ccssStandards = standards.split(',').map(s => s.trim()).filter(Boolean);
    setEditedQuestion(prev => ({
      ...prev,
      ccssStandards,
      primaryStandard: ccssStandards[0] || prev.primaryStandard
    }));
  };

  const handleExplanationChange = (explanation: string) => {
    setEditedQuestion(prev => ({ ...prev, explanation }));
  };

  const handleOptionsChange = (questionOptions: QuestionOptions) => {
    setEditedQuestion(prev => ({ ...prev, questionOptions }));
  };

  const handleSave = () => {
    onSave({
      ...editedQuestion,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Question</h2>
            <p className="text-sm text-gray-500">
              {question.subject} - Grade {question.gradeLevel} - {question.strand}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
            <textarea
              value={editedQuestion.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
              placeholder="Enter the question text..."
            />
          </div>

          {/* Format-specific Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Answer Options ({getFormatLabel(editedQuestion.format)})
            </label>
            <FormatSpecificEditor
              format={editedQuestion.format}
              options={editedQuestion.questionOptions}
              onChange={handleOptionsChange}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={editedQuestion.difficulty}
              onChange={(e) => handleDifficultyChange(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value={1}>1 - Very Easy</option>
              <option value={2}>2 - Easy</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - Hard</option>
              <option value={5}>5 - Very Hard</option>
            </select>
          </div>

          {/* CCSS Standards */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">CCSS Standards</label>
            <input
              type="text"
              value={editedQuestion.ccssStandards.join(', ')}
              onChange={(e) => handleCCSSChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., CCSS.MATH.CONTENT.3.NF.A.1"
            />
            <p className="text-xs text-gray-400 mt-1">Separate multiple standards with commas</p>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Explanation (Optional)</label>
            <textarea
              value={editedQuestion.explanation || ''}
              onChange={(e) => handleExplanationChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
              placeholder="Explain why this answer is correct..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function getFormatLabel(format: QuestionFormat): string {
  const labels: Record<QuestionFormat, string> = {
    [QuestionFormat.MULTIPLE_CHOICE]: 'Multiple Choice',
    [QuestionFormat.TRUE_FALSE]: 'True/False',
    [QuestionFormat.MATCHING]: 'Matching',
    [QuestionFormat.DRAG_AND_DROP]: 'Drag & Drop'
  };
  return labels[format] || format;
}

// Format-specific editor component
interface FormatSpecificEditorProps {
  format: QuestionFormat;
  options: QuestionOptions;
  onChange: (options: QuestionOptions) => void;
}

const FormatSpecificEditor: React.FC<FormatSpecificEditorProps> = ({
  format,
  options,
  onChange
}) => {
  switch (format) {
    case QuestionFormat.MULTIPLE_CHOICE:
      if (isMultipleChoiceOptions(options)) {
        return <MultipleChoiceEditor options={options} onChange={onChange} />;
      }
      break;
    case QuestionFormat.TRUE_FALSE:
      if (isTrueFalseOptions(options)) {
        return <TrueFalseEditor options={options} onChange={onChange} />;
      }
      break;
    case QuestionFormat.MATCHING:
      if (isMatchingOptions(options)) {
        return <MatchingEditor options={options} onChange={onChange} />;
      }
      break;
    case QuestionFormat.DRAG_AND_DROP:
      if (isDragDropOptions(options)) {
        return <DragDropEditor options={options} onChange={onChange} />;
      }
      break;
  }
  return <div className="text-gray-500 italic">Unsupported question format</div>;
};

// Multiple Choice Editor
interface MultipleChoiceEditorProps {
  options: MultipleChoiceOptions;
  onChange: (options: QuestionOptions) => void;
}

const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({ options, onChange }) => {
  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...options.choices];
    const wasCorrect = options.correctAnswer === options.choices[index];
    newChoices[index] = value;
    onChange({
      ...options,
      choices: newChoices,
      correctAnswer: wasCorrect ? value : options.correctAnswer
    });
  };

  const handleCorrectAnswerChange = (choice: string) => {
    onChange({ ...options, correctAnswer: choice });
  };

  const addChoice = () => {
    onChange({
      ...options,
      choices: [...options.choices, '']
    });
  };

  const removeChoice = (index: number) => {
    if (options.choices.length <= 2) return;
    const newChoices = options.choices.filter((_, i) => i !== index);
    const removedChoice = options.choices[index];
    onChange({
      ...options,
      choices: newChoices,
      correctAnswer: options.correctAnswer === removedChoice ? newChoices[0] : options.correctAnswer
    });
  };

  return (
    <div className="space-y-3">
      {options.choices.map((choice, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="radio"
            name="correctAnswer"
            checked={options.correctAnswer === choice}
            onChange={() => handleCorrectAnswerChange(choice)}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
            {String.fromCharCode(65 + index)}
          </span>
          <input
            type="text"
            value={choice}
            onChange={(e) => handleChoiceChange(index, e.target.value)}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              options.correctAnswer === choice ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
            placeholder={`Choice ${String.fromCharCode(65 + index)}`}
          />
          {options.choices.length > 2 && (
            <button
              onClick={() => removeChoice(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addChoice}
        className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Choice
      </button>
      <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
    </div>
  );
};

// True/False Editor
interface TrueFalseEditorProps {
  options: TrueFalseOptions;
  onChange: (options: QuestionOptions) => void;
}

const TrueFalseEditor: React.FC<TrueFalseEditorProps> = ({ options, onChange }) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange({ correctAnswer: true })}
        className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold text-lg transition-all ${
          options.correctAnswer === true
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
        }`}
      >
        True {options.correctAnswer === true && '✓'}
      </button>
      <button
        onClick={() => onChange({ correctAnswer: false })}
        className={`flex-1 px-6 py-4 rounded-xl border-2 font-bold text-lg transition-all ${
          options.correctAnswer === false
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
        }`}
      >
        False {options.correctAnswer === false && '✓'}
      </button>
    </div>
  );
};

// Matching Editor
interface MatchingEditorProps {
  options: MatchingOptions;
  onChange: (options: QuestionOptions) => void;
}

const MatchingEditor: React.FC<MatchingEditorProps> = ({ options, onChange }) => {
  const handleLeftItemChange = (index: number, value: string) => {
    const newLeftItems = [...options.leftItems];
    newLeftItems[index] = value;
    onChange({ ...options, leftItems: newLeftItems });
  };

  const handleRightItemChange = (index: number, value: string) => {
    const newRightItems = [...options.rightItems];
    newRightItems[index] = value;
    onChange({ ...options, rightItems: newRightItems });
  };

  const handleMatchChange = (leftIndex: number, rightIndex: number) => {
    const newMatches = { ...options.correctMatches };
    newMatches[leftIndex] = rightIndex;
    onChange({ ...options, correctMatches: newMatches });
  };

  const addPair = () => {
    const newLeftItems = [...options.leftItems, ''];
    const newRightItems = [...options.rightItems, ''];
    const newMatches = { ...options.correctMatches };
    newMatches[newLeftItems.length - 1] = newRightItems.length - 1;
    onChange({
      ...options,
      leftItems: newLeftItems,
      rightItems: newRightItems,
      correctMatches: newMatches
    });
  };

  const removePair = (index: number) => {
    if (options.leftItems.length <= 2) return;
    const newLeftItems = options.leftItems.filter((_, i) => i !== index);
    const newRightItems = options.rightItems.filter((_, i) => i !== index);
    // Rebuild matches with new indices
    const newMatches: Record<number, number> = {};
    newLeftItems.forEach((_, i) => {
      const oldLeftIndex = i >= index ? i + 1 : i;
      const oldRightIndex = options.correctMatches[oldLeftIndex] ?? i;
      const newRightIndex = oldRightIndex > index ? oldRightIndex - 1 : oldRightIndex >= index ? 0 : oldRightIndex;
      newMatches[i] = Math.min(newRightIndex, newRightItems.length - 1);
    });
    onChange({
      ...options,
      leftItems: newLeftItems,
      rightItems: newRightItems,
      correctMatches: newMatches
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr,auto,1fr,auto] gap-3 items-center">
        <div className="text-xs font-bold text-gray-400 uppercase">Left Items</div>
        <div></div>
        <div className="text-xs font-bold text-gray-400 uppercase">Right Items</div>
        <div></div>
      </div>
      {options.leftItems.map((left, leftIndex) => (
        <div key={leftIndex} className="grid grid-cols-[1fr,auto,1fr,auto] gap-3 items-center">
          <input
            type="text"
            value={left}
            onChange={(e) => handleLeftItemChange(leftIndex, e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Item ${leftIndex + 1}`}
          />
          <select
            value={options.correctMatches[leftIndex] ?? 0}
            onChange={(e) => handleMatchChange(leftIndex, parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-green-50 text-green-700 font-medium"
          >
            {options.rightItems.map((_, rightIndex) => (
              <option key={rightIndex} value={rightIndex}>
                {String.fromCharCode(65 + rightIndex)}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={options.rightItems[leftIndex] || ''}
            onChange={(e) => handleRightItemChange(leftIndex, e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Match ${String.fromCharCode(65 + leftIndex)}`}
          />
          {options.leftItems.length > 2 && (
            <button
              onClick={() => removePair(leftIndex)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addPair}
        className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Pair
      </button>
      <p className="text-xs text-gray-400">Use the dropdown to select which right item matches each left item</p>
    </div>
  );
};

// Drag & Drop Editor
interface DragDropEditorProps {
  options: DragDropOptions;
  onChange: (options: QuestionOptions) => void;
}

const DragDropEditor: React.FC<DragDropEditorProps> = ({ options, onChange }) => {
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...options.draggableItems];
    newItems[index] = value;
    onChange({ ...options, draggableItems: newItems });
  };

  const handleZoneLabelChange = (index: number, label: string) => {
    const newZones = [...options.dropZones];
    newZones[index] = { ...newZones[index], label };
    onChange({ ...options, dropZones: newZones });
  };

  const handlePlacementChange = (itemIndex: number, zoneIndex: number) => {
    const newPlacements = { ...options.correctPlacements };
    newPlacements[itemIndex] = zoneIndex;
    onChange({ ...options, correctPlacements: newPlacements });
  };

  const addItem = () => {
    const newItems = [...options.draggableItems, ''];
    const newZones = [...options.dropZones, { id: `zone-${Date.now()}`, label: '' }];
    const newPlacements = { ...options.correctPlacements };
    newPlacements[newItems.length - 1] = newZones.length - 1;
    onChange({
      ...options,
      draggableItems: newItems,
      dropZones: newZones,
      correctPlacements: newPlacements
    });
  };

  const removeItem = (index: number) => {
    if (options.draggableItems.length <= 2) return;
    const newItems = options.draggableItems.filter((_, i) => i !== index);
    const newZones = options.dropZones.filter((_, i) => i !== index);
    // Rebuild placements with new indices
    const newPlacements: Record<number, number> = {};
    newItems.forEach((_, i) => {
      const oldItemIndex = i >= index ? i + 1 : i;
      const oldZoneIndex = options.correctPlacements[oldItemIndex] ?? i;
      const newZoneIndex = oldZoneIndex > index ? oldZoneIndex - 1 : oldZoneIndex >= index ? 0 : oldZoneIndex;
      newPlacements[i] = Math.min(newZoneIndex, newZones.length - 1);
    });
    onChange({
      ...options,
      draggableItems: newItems,
      dropZones: newZones,
      correctPlacements: newPlacements
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr,auto,1fr,auto] gap-3 items-center">
        <div className="text-xs font-bold text-gray-400 uppercase">Draggable Items</div>
        <div></div>
        <div className="text-xs font-bold text-gray-400 uppercase">Drop Zones</div>
        <div></div>
      </div>
      {options.draggableItems.map((item, itemIndex) => (
        <div key={itemIndex} className="grid grid-cols-[1fr,auto,1fr,auto] gap-3 items-center">
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(itemIndex, e.target.value)}
            className="px-4 py-2 border border-orange-200 bg-orange-50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder={`Item ${itemIndex + 1}`}
          />
          <select
            value={options.correctPlacements[itemIndex] ?? 0}
            onChange={(e) => handlePlacementChange(itemIndex, parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-green-50 text-green-700 font-medium"
          >
            {options.dropZones.map((zone, zoneIndex) => (
              <option key={zoneIndex} value={zoneIndex}>
                Zone {zoneIndex + 1}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={options.dropZones[itemIndex]?.label || ''}
            onChange={(e) => handleZoneLabelChange(itemIndex, e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Zone ${itemIndex + 1} label`}
          />
          {options.draggableItems.length > 2 && (
            <button
              onClick={() => removeItem(itemIndex)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item/Zone
      </button>
      <p className="text-xs text-gray-400">Use the dropdown to select which zone each item should be placed in</p>
    </div>
  );
};

export default QuestionEditor;
