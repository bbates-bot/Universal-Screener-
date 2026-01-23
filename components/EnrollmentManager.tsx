
import React, { useState, useEffect } from 'react';
import { School, Student, Subject, AssignedAssessment, UserRole } from '../types';
import { GRADES } from '../constants';

interface EnrollmentManagerProps {
  schools: School[];
  students: Student[];
  role: UserRole;
  onEnrollStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onRemoveStudent: (id: string) => void;
}

// Copy button component with hover and feedback
const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`transition-all duration-200 ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-xs font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </span>
      )}
    </button>
  );
};

const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({ schools, students, role, onEnrollStudent, onUpdateStudent, onRemoveStudent }) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    username: '',
    firstName: '',
    lastName: '',
    grade: 'K',
    schoolId: '',
    language: 'English' as 'English' | 'Spanish'
  });

  const [assignedAssessments, setAssignedAssessments] = useState<AssignedAssessment[]>([]);

  const GENERAL_SUBJECTS: Subject[] = ['Math', 'Reading Foundations', 'Reading Comprehension', 'ELA'];
  const AP_SUBJECTS: Subject[] = ['AP Precalculus', 'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP English Language', 'AP English Literature'];
  const EDEXCEL_SUBJECTS: Subject[] = [
    'Edexcel Math Pre-IG1', 'Edexcel Math Pre-IG2', 'Edexcel Math IG1', 'Edexcel Math IG2',
    'Edexcel English Pre-IG1', 'Edexcel English Pre-IG2', 'Edexcel English IG1', 'Edexcel English IG2'
  ];

  const canEnroll = role === UserRole.ADMIN || role === UserRole.ADMISSIONS;
  const canAssign = true;

  // Auto-generate username suggestion
  useEffect(() => {
    if (!editingStudent && newStudent.firstName && newStudent.lastName && !newStudent.username) {
      const suggested = `${newStudent.firstName[0].toLowerCase()}.${newStudent.lastName.toLowerCase()}${Math.floor(100 + Math.random() * 900)}`;
      setNewStudent(prev => ({ ...prev, username: suggested }));
    }
  }, [newStudent.firstName, newStudent.lastName, editingStudent]);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdateStudent({ ...editingStudent, ...newStudent, assignedAssessments });
      setEditingStudent(null);
    } else {
      if (!newStudent.schoolId) return alert("Please select a school");
      if (assignedAssessments.length === 0) return alert("Please assign at least one assessment");
      if (students.some(s => s.username === newStudent.username)) return alert("Username already exists");
      
      onEnrollStudent({ 
        id: `std-${Date.now()}`, 
        ...newStudent, 
        assignedAssessments 
      });
    }
    
    setNewStudent({ username: '', firstName: '', lastName: '', grade: 'K', schoolId: '', language: 'English' });
    setAssignedAssessments([]);
    setIsEnrolling(false);
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      username: student.username,
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      schoolId: student.schoolId,
      language: student.language
    });
    setAssignedAssessments(student.assignedAssessments || []);
    setIsEnrolling(true);
  };

  const toggleAssessment = (subject: Subject, type: 'General' | 'AP Readiness' | 'Edexcel IGCSE') => {
    const exists = assignedAssessments.find(a => a.subject === subject);
    if (exists) {
      setAssignedAssessments(prev => prev.filter(a => a.subject !== subject));
    } else {
      setAssignedAssessments(prev => [...prev, { subject, type }]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Student Roster</h2>
          <p className="text-slate-500 text-sm">Manage learners and assessment assignments.</p>
        </div>
        {canEnroll && (
          <button 
            onClick={() => {
              setEditingStudent(null);
              setNewStudent({ username: '', firstName: '', lastName: '', grade: 'K', schoolId: '', language: 'English' });
              setAssignedAssessments([]);
              setIsEnrolling(true);
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Enroll New Student
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Assigned Username</th>
              <th className="px-6 py-4">Grade</th>
              <th className="px-6 py-4">Assigned Campus</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No students enrolled yet.</td>
              </tr>
            ) : students.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <span className="font-bold text-slate-800">{s.firstName} {s.lastName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 group/username">
                    <code className="bg-slate-100 px-2 py-1 rounded text-indigo-600 font-bold text-xs">{s.username}</code>
                    <CopyButton text={s.username} className="opacity-0 group-hover/username:opacity-100" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold text-xs">Grade {s.grade}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  {schools.find(sc => sc.id === s.schoolId)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-end space-x-3">
                    {canAssign && (
                      <button onClick={() => startEdit(s)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs">Manage Student</button>
                    )}
                    {canEnroll && (
                      <button onClick={() => onRemoveStudent(s.id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs">Unenroll</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEnrolling && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">{editingStudent ? 'Manage Student' : 'Enroll New Learner'}</h3>
              <button onClick={() => setIsEnrolling(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleEnroll} className="p-8 space-y-6 overflow-y-auto">
              {canEnroll && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">FIRST NAME</label>
                      <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">LAST NAME</label>
                      <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">ASSIGNED LOGIN USERNAME</label>
                    <div className="relative group/input">
                      <input required type="text" placeholder="e.g. john.doe" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all font-mono pr-20" value={newStudent.username} onChange={e => setNewStudent({...newStudent, username: e.target.value})} />
                      {newStudent.username && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                          <CopyButton text={newStudent.username} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Students will use this username to log into the testing portal. <span className="text-indigo-500">Hover to copy.</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">GRADE</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">ASSIGNED SCHOOL</label>
                      <select required className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none transition-all" value={newStudent.schoolId} onChange={e => setNewStudent({...newStudent, schoolId: e.target.value})}>
                        <option value="">Select a school...</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {editingStudent && !canEnroll && (
                <div className="bg-indigo-50 p-4 rounded-xl flex items-center space-x-3">
                   <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">{editingStudent.firstName[0]}</div>
                   <div>
                     <p className="font-bold text-indigo-900">{editingStudent.firstName} {editingStudent.lastName}</p>
                     <p className="text-xs text-indigo-500 uppercase font-bold tracking-widest">Assigning tests for Grade {editingStudent.grade}</p>
                   </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-4">ASSIGN SCREENERS & PREREQUISITES</label>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">General Assessment</h4>
                    <div className="flex flex-wrap gap-2">
                      {GENERAL_SUBJECTS.map(subj => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => toggleAssessment(subj, 'General')}
                          className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${assignedAssessments.find(a => a.subject === subj) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AP Prerequisite Screening</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AP_SUBJECTS.map(subj => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => toggleAssessment(subj, 'AP Readiness')}
                          className={`px-3 py-2 rounded-xl border-2 font-bold text-xs text-left transition-all ${assignedAssessments.find(a => a.subject === subj) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Edexcel IGCSE Screening</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {EDEXCEL_SUBJECTS.map(subj => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => toggleAssessment(subj, 'Edexcel IGCSE')}
                          className={`px-3 py-2 rounded-xl border-2 font-bold text-xs text-left transition-all ${assignedAssessments.find(a => a.subject === subj) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                        >
                          {subj.replace('Edexcel ', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setIsEnrolling(false)} className="px-6 py-3 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingStudent ? 'Update Details' : 'Enroll & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManager;
