/**
 * CurriculumSelector Component
 * Toggle between curriculum systems (US vs Edexcel)
 */

import React from 'react';
import { CurriculumSystem } from '../../../../types/curriculum';

interface CurriculumSelectorProps {
  value: CurriculumSystem;
  onChange: (curriculum: CurriculumSystem) => void;
  className?: string;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const isEdexcel = value === 'EDEXCEL_INTERNATIONAL';
  const isUS = value === 'US_COMMON_CORE_AP';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 hidden sm:block">
        Curriculum
      </label>

      <div className="flex items-center bg-slate-100 p-1 rounded-xl">
        {/* Edexcel Button */}
        <button
          type="button"
          onClick={() => onChange('EDEXCEL_INTERNATIONAL')}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-bold transition-all
            flex items-center gap-1.5
            ${isEdexcel
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }
          `}
          aria-pressed={isEdexcel}
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-70" />
          Edexcel
        </button>

        {/* US Button */}
        <button
          type="button"
          onClick={() => onChange('US_COMMON_CORE_AP')}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-bold transition-all
            flex items-center gap-1.5
            ${isUS
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }
          `}
          aria-pressed={isUS}
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-70" />
          US CCSS
        </button>
      </div>
    </div>
  );
};

export default CurriculumSelector;
