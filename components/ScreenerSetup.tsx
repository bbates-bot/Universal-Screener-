
import React, { useState } from 'react';
import { GRADES } from '../constants';
import { Subject, ScreenerWindow } from '../types';

interface ScreenerSetupProps {
  onSave: (window: ScreenerWindow) => void;
  onCancel: () => void;
}

const ScreenerSetup: React.FC<ScreenerSetupProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ScreenerWindow>>({
    name: 'BoY Universal Screener',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    grades: ['K', '1', '2', '3'],
    subject: 'Math'
  });

  const handleGradeToggle = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades?.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...(prev.grades || []), grade]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Create a screener window</h2>
          <button onClick={onCancel} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...formData, id: Date.now().toString() } as ScreenerWindow);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="col-span-full">
               <label className="block text-sm font-semibold text-gray-700 mb-1">NAME</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
               />
             </div>

             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">SUBJECT</label>
               <select 
                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 value={formData.subject}
                 onChange={e => setFormData({...formData, subject: e.target.value as Subject})}
               >
                 <option value="Math">Math</option>
                 <option value="Reading Foundations">Reading Foundations (K-3)</option>
                 <option value="Reading Comprehension">Reading Comprehension (3-12)</option>
               </select>
             </div>

             <div className="flex space-x-2">
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">START DATE</label>
                 <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
               </div>
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">END DATE</label>
                 <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
               </div>
             </div>

             <div className="col-span-full">
               <label className="block text-sm font-semibold text-gray-700 mb-1">GRADE LEVELS</label>
               <div className="flex flex-wrap gap-2 mt-2">
                 {GRADES.map(grade => (
                   <button
                     key={grade}
                     type="button"
                     onClick={() => handleGradeToggle(grade)}
                     className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                       formData.grades?.includes(grade) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                     }`}
                   >
                     {grade}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md shadow-blue-200"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScreenerSetup;
