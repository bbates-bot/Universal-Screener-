
import React, { useState } from 'react';
import { School, Student } from '../types';

interface SchoolManagerProps {
  schools: School[];
  students: Student[];
  onAddSchool: (school: School) => void;
  onUpdateSchool: (school: School) => void;
}

const SchoolManager: React.FC<SchoolManagerProps> = ({ schools, students, onAddSchool, onUpdateSchool }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<Partial<School>>({
    name: '',
    district: '',
    principal: '',
    schoolCode: '',
    address: '',
    status: 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchool) {
      onUpdateSchool({ ...editingSchool, ...formData } as School);
      setEditingSchool(null);
    } else {
      onAddSchool({
        id: `sch-${Date.now()}`,
        ...formData,
        status: 'Active'
      } as School);
    }
    setIsAdding(false);
    setFormData({ name: '', district: '', principal: '', schoolCode: '', address: '' });
  };

  const startEdit = (school: School) => {
    setEditingSchool(school);
    setFormData(school);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">School Directory</h2>
          <p className="text-slate-500 text-sm">Configure and manage individual campuses within the district.</p>
        </div>
        <button 
          onClick={() => {
            setEditingSchool(null);
            setFormData({ name: '', district: '', principal: '', schoolCode: '', address: '' });
            setIsAdding(true);
          }}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          <span>Setup New School</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map(school => {
          const studentCount = students.filter(s => s.schoolId === school.id).length;
          return (
            <div key={school.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="h-2 bg-indigo-500 w-full" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${school.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                    {school.status}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{school.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">{school.district}</p>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Principal</span>
                    <span className="font-medium text-slate-800">{school.principal || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">School Code</span>
                    <span className="font-mono text-indigo-600 font-bold">{school.schoolCode || '---'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Students</span>
                    <span className="font-bold text-slate-800">{studentCount}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <button 
                    onClick={() => startEdit(school)}
                    className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    Edit Config
                  </button>
                  <button className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                    View Data
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">{editingSchool ? 'Edit School Configuration' : 'Setup Individual School'}</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">SCHOOL NAME</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">DISTRICT</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">SCHOOL CODE</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.schoolCode} onChange={e => setFormData({...formData, schoolCode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">PRINCIPAL NAME</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.principal} onChange={e => setFormData({...formData, principal: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">STATUS</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">CAMPUS ADDRESS</label>
                  <textarea rows={2} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingSchool ? 'Update School' : 'Register Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManager;
