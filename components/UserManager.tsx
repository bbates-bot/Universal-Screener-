
import React, { useState } from 'react';
import { User, UserRole, School } from '../types';

interface UserManagerProps {
  users: User[];
  schools: School[];
  onAddUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, schools, onAddUser, onRemoveUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: UserRole.TEACHER,
    schoolId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      id: `user-${Date.now()}`,
      ...formData
    } as User);
    setIsAdding(false);
    setFormData({ name: '', email: '', role: UserRole.TEACHER, schoolId: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">User Management</h2>
          <p className="text-slate-500 text-sm">Provision access for administrators, admissions staff, and teachers.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Name & Email</th>
              <th className="px-6 py-4">System Role</th>
              <th className="px-6 py-4">Assigned Campus</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
                    user.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600' :
                    user.role === UserRole.ADMISSIONS ? 'bg-emerald-50 text-emerald-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  {schools.find(s => s.id === user.schoolId)?.name || 'District Level'}
                </td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onRemoveUser(user.id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs">Revoke Access</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Create System User</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">FULL NAME</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">EMAIL ADDRESS</label>
                <input required type="email" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">ROLE</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.ADMIN}>Administrator</option>
                    <option value={UserRole.ADMISSIONS}>Admissions</option>
                    <option value={UserRole.TEACHER}>Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">ASSIGNED CAMPUS</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={formData.schoolId} onChange={e => setFormData({...formData, schoolId: e.target.value})}>
                    <option value="">District (All Schools)</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
