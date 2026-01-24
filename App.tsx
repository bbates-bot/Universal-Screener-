
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_RESULTS, INITIAL_SCHOOLS, INITIAL_STUDENTS, GRADES } from './constants';
import { StudentResult, Subject, School, Student, UserRole, User } from './types';
import Dashboard from './components/Dashboard';
import ScreenerTest from './components/ScreenerTest';
import EnrollmentManager from './components/EnrollmentManager';
import ScreenerDashboard from './components/ScreenerDashboard';
import SchoolManager from './components/SchoolManager';
import UserManager from './components/UserManager';
import TestReview from './components/TestReview';
import { CurriculumSelector } from './components/CurriculumSelector';
import { RegionSelector } from './components/RegionSelector';
import { CurriculumProvider, useCurriculum } from './contexts/CurriculumContext';
import { GRADE_MAPPINGS } from './constants/gradeMappings';
import {
  subscribeToSchools,
  subscribeToStudents,
  subscribeToResults,
  subscribeToUsers,
  addSchool,
  updateSchool,
  addStudent,
  updateStudent,
  deleteStudent,
  addResult,
  addUser,
  deleteUser,
  initializeData
} from './services/firestoreService';
import { initAnalytics } from './services/firebase';

const INITIAL_USERS: User[] = [
  { id: 'u-1', name: 'System Admin', email: 'admin@crimsonglobalacademy.com', role: UserRole.ADMIN }
];

// Inner component that uses curriculum context
const AppContent: React.FC = () => {
  const { currentSystem, displayRegion } = useCurriculum();
  const isEdexcel = currentSystem === 'EDEXCEL_INTERNATIONAL';
  const isUS = currentSystem === 'US_COMMON_CORE_AP';

  // Get grade display based on curriculum
  const getGradeDisplay = (usGrade: string): string => {
    if (isUS) {
      return usGrade === 'K' ? 'Kindergarten' : `Grade ${usGrade}`;
    }
    // For Edexcel, show UK/NZ year
    const mapping = GRADE_MAPPINGS.find(m => m.us === usGrade);
    if (!mapping) return usGrade;
    return displayRegion === 'NZ' ? mapping.nz : mapping.uk;
  };

  const [view, setView] = useState<'admin' | 'student'>('admin');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'screener' | 'schools' | 'students' | 'users' | 'test-review'>('dashboard');
  const [loading, setLoading] = useState(true);

  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [studentTestMode, setStudentTestMode] = useState(false);

  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');

  // Student portal login state
  const [loginUsername, setLoginUsername] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Initialize Firebase and subscribe to data
  useEffect(() => {
    initAnalytics();

    // Initialize data if collections are empty
    const init = async () => {
      try {
        await initializeData(
          INITIAL_SCHOOLS.map(({ id, ...rest }) => rest),
          INITIAL_STUDENTS.map(({ id, ...rest }) => rest),
          INITIAL_RESULTS.map(({ id, ...rest }) => rest),
          INITIAL_USERS.map(({ id, ...rest }) => rest)
        );
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    init();

    // Subscribe to real-time updates
    const unsubSchools = subscribeToSchools((data) => {
      setSchools(data);
      setLoading(false);
    });
    const unsubStudents = subscribeToStudents(setStudents);
    const unsubResults = subscribeToResults(setResults);
    const unsubUsers = subscribeToUsers(setUsers);

    return () => {
      unsubSchools();
      unsubStudents();
      unsubResults();
      unsubUsers();
    };
  }, []);

  // Adjust sub-view when role changes if current view is restricted
  useEffect(() => {
    if (role === UserRole.TEACHER && (adminSubView === 'schools' || adminSubView === 'users')) {
      setAdminSubView('dashboard');
    }
    if (role === UserRole.ADMISSIONS && (adminSubView === 'dashboard' || adminSubView === 'schools' || adminSubView === 'users')) {
      setAdminSubView('students');
    }
  }, [role]);

  const AP_SUBJECTS_LIST: Subject[] = ['AP Precalculus', 'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP Macroeconomics', 'AP English Language', 'AP English Literature'];
  const GENERAL_SUBJECTS_LIST: Subject[] = ['Math', 'Reading Foundations', 'Reading Comprehension', 'ELA'];
  const EDEXCEL_SUBJECTS_LIST: Subject[] = [
    'Edexcel Math Pre-IG1', 'Edexcel Math Pre-IG2', 'Edexcel Math IG1', 'Edexcel Math IG2',
    'Edexcel English Pre-IG1', 'Edexcel English Pre-IG2', 'Edexcel English IG1', 'Edexcel English IG2'
  ];

  // AP Readiness results for Readiness Analytics dashboard
  const apReadinessResults = useMemo(() => {
    return results.filter(r => {
      const isAPSubject = AP_SUBJECTS_LIST.includes(r.subject);
      const matchSubject = filterSubject === 'All' || r.subject === filterSubject;
      const matchGrade = filterGrade === 'All' || r.grade === filterGrade;
      const matchSchool = filterSchool === 'All' || r.schoolId === filterSchool;
      return isAPSubject && matchSubject && matchGrade && matchSchool;
    });
  }, [results, filterSubject, filterGrade, filterSchool]);

  // All screener results for Screener Dashboard (includes both CCSS/General AND Edexcel)
  const screenerResults = useMemo(() => {
    return results.filter(r =>
      GENERAL_SUBJECTS_LIST.includes(r.subject) ||
      EDEXCEL_SUBJECTS_LIST.includes(r.subject)
    );
  }, [results]);

  const handleCompleteScreener = async (newResult: StudentResult) => {
    try {
      const student = students.find(s => s.id === selectedStudentId);
      console.log('Saving result - selectedStudentId:', selectedStudentId);
      console.log('Saving result - found student:', student);
      console.log('Saving result - newResult subject:', newResult.subject);

      if (!student) {
        console.error('Student not found for ID:', selectedStudentId);
        // Still save the result with the data we have from newResult
        const { id, ...resultData } = newResult;
        const savedId = await addResult({ ...resultData, studentId: selectedStudentId || undefined });
        console.log('Result saved without student match, ID:', savedId);
        alert('Results saved (note: student record not found)');
      } else {
        // Merge student data, preserving the new result's calculated fields
        // Important: explicitly set username and grade from student record
        const finalResult: StudentResult = {
          ...student,
          ...newResult,
          studentId: student.id, // Store reference to student
          username: student.username, // Preserve actual student username for matching
          grade: student.grade, // Preserve student's enrolled grade (not test calibration grade)
          id: newResult.id,
          testDate: new Date().toISOString().split('T')[0]
        };
        const { id, ...resultData } = finalResult;
        console.log('Final result to save:', { studentId: resultData.studentId, username: resultData.username, grade: resultData.grade, subject: resultData.subject });
        const savedId = await addResult(resultData);
        console.log('Result saved successfully with ID:', savedId);
        alert(`Results saved successfully for ${student.firstName}!`);
      }
      setStudentTestMode(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error saving test results:', error);
      alert('There was an error saving your results: ' + (error as Error).message);
    }
  };

  const handleLoginChange = (val: string) => {
    setLoginUsername(val);
    const found = students.find(s => s.username.toLowerCase() === val.toLowerCase().trim());
    if (found) {
      setSelectedStudentId(found.id);
    } else {
      setSelectedStudentId('');
    }
    setSelectedSubject(null);
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);

  const assignedGeneral = useMemo(() => {
    return currentStudent?.assignedAssessments?.filter(a => a.type === 'General') || [];
  }, [currentStudent]);

  const assignedAP = useMemo(() => {
    return currentStudent?.assignedAssessments?.filter(a => a.type === 'AP Readiness') || [];
  }, [currentStudent]);

  const assignedEdexcel = useMemo(() => {
    return currentStudent?.assignedAssessments?.filter(a => a.type === 'Edexcel IGCSE') || [];
  }, [currentStudent]);

  const canSeeDashboard = role === UserRole.ADMIN || role === UserRole.TEACHER;
  const canSeeScreener = true;
  const canSeeSchools = role === UserRole.ADMIN;
  const canSeeStudents = true;
  const canSeeUsers = role === UserRole.ADMIN;
  const canSeeTestReview = role === UserRole.ADMIN || role === UserRole.TEACHER;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 mx-auto mb-4 animate-pulse">IX</div>
          <p className="text-slate-500 font-medium">Loading CGA Screener...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">IX</div>
              <span className="text-xl font-extrabold tracking-tight text-indigo-900 uppercase">CGA Screener</span>
            </div>

            {/* Curriculum System Toggle with Region Selector */}
            <div className="flex items-center gap-2">
              <CurriculumSelector />
              <RegionSelector compact />
            </div>

            <div className="flex items-center space-x-4">
              {view === 'admin' && (
                <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Role:</span>
                  <select
                    className="bg-transparent border-none text-xs font-bold text-indigo-600 focus:ring-0 cursor-pointer"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value={UserRole.ADMIN}>Administrator</option>
                    <option value={UserRole.ADMISSIONS}>Admissions</option>
                    <option value={UserRole.TEACHER}>Teacher</option>
                  </select>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                <button onClick={() => { setView('admin'); setStudentTestMode(false); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>ADMIN</button>
                <button onClick={() => setView('student')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>STUDENT</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'admin' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-slate-900">District Oversight</h1>
                <p className="text-slate-500">Logged in as <span className="text-indigo-600 font-bold">{role}</span></p>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex space-x-1 max-w-fit flex-wrap gap-y-1">
               {canSeeDashboard && (
                 <button onClick={() => setAdminSubView('dashboard')} className={`px-6 py-2 font-bold rounded-xl text-xs transition-all ${adminSubView === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>READINESS ANALYTICS</button>
               )}
               {canSeeScreener && (
                 <button onClick={() => setAdminSubView('screener')} className={`px-6 py-2 font-bold rounded-xl text-xs transition-all ${adminSubView === 'screener' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>SCREENER DASHBOARD</button>
               )}
               {canSeeSchools && (
                 <button onClick={() => setAdminSubView('schools')} className={`px-6 py-2 font-bold rounded-xl text-xs transition-all ${adminSubView === 'schools' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>SCHOOLS</button>
               )}
               {canSeeStudents && (
                 <button onClick={() => setAdminSubView('students')} className={`px-6 py-2 font-bold rounded-xl text-xs transition-all ${adminSubView === 'students' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>STUDENT ROSTER</button>
               )}
               {canSeeUsers && (
                 <button onClick={() => setAdminSubView('users')} className={`px-6 py-2 font-bold rounded-xl text-xs transition-all ${adminSubView === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>MANAGE USERS</button>
               )}
               {canSeeTestReview && (
                 <button onClick={() => setAdminSubView('test-review')} className={`px-6 py-2 font-bold rounded-xl text-xs transition-all ${adminSubView === 'test-review' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>TEST REVIEW</button>
               )}
            </div>

            {adminSubView === 'dashboard' && canSeeDashboard ? (
              <>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">AP Course</label>
                    <select className="w-full bg-slate-50 border-none rounded-lg font-medium" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                      <option value="All">All AP Courses</option>
                      {AP_SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase block mb-1">{isEdexcel ? 'Year Group' : 'Grade Level'}</label>
                     <select className="w-full bg-slate-50 border-none rounded-lg font-medium" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                       <option value="All">All {isEdexcel ? 'Years' : 'Grades'}</option>
                       {GRADES.filter(g => ['9', '10', '11', '12'].includes(g)).map(g => <option key={g} value={g}>{getGradeDisplay(g)}</option>)}
                     </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Campus</label>
                    <select className="w-full bg-slate-50 border-none rounded-lg font-medium" value={filterSchool} onChange={e => setFilterSchool(e.target.value)}>
                      <option value="All">All Campuses</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <Dashboard results={apReadinessResults} subject={filterSubject === 'All' ? 'AP Precalculus' : filterSubject} schools={schools} />
              </>
            ) : adminSubView === 'screener' && canSeeScreener ? (
              <ScreenerDashboard
                students={students}
                results={screenerResults}
                schools={schools}
              />
            ) : adminSubView === 'schools' && canSeeSchools ? (
              <SchoolManager
                schools={schools}
                students={students}
                onAddSchool={async (s) => { const { id, ...data } = s; await addSchool(data); }}
                onUpdateSchool={async (updated) => { await updateSchool(updated); }}
              />
            ) : adminSubView === 'students' && canSeeStudents ? (
              <EnrollmentManager
                schools={schools}
                students={students}
                role={role}
                onEnrollStudent={async (s) => { const { id, ...data } = s; await addStudent(data); }}
                onUpdateStudent={async (updated) => { await updateStudent(updated); }}
                onRemoveStudent={async (id) => { await deleteStudent(id); }}
              />
            ) : adminSubView === 'users' && canSeeUsers ? (
              <UserManager
                users={users}
                schools={schools}
                onAddUser={async (u) => { const { id, ...data } = u; await addUser(data); }}
                onRemoveUser={async (id) => { await deleteUser(id); }}
              />
            ) : adminSubView === 'test-review' && canSeeTestReview ? (
              <TestReview userRole={role} />
            ) : (
              <div className="bg-white p-20 text-center rounded-3xl border border-slate-100 shadow-sm">
                 <p className="text-slate-400 font-medium italic">You do not have access to this section.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {!studentTestMode ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-black text-slate-900 leading-tight">Learner Assessment Portal</h1>
                  <p className="text-xl text-slate-500">Enter your assigned credentials to begin.</p>
                </div>

                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 space-y-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">ASSIGNED USERNAME</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Enter your username (e.g. j.smith123)"
                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-lg outline-none transition-all ${selectedStudentId ? 'border-emerald-500 ring-2 ring-emerald-50 bg-emerald-50/20' : 'border-slate-100 focus:border-indigo-500'}`}
                        value={loginUsername}
                        onChange={e => handleLoginChange(e.target.value)}
                      />
                      {selectedStudentId && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-emerald-600 animate-in fade-in slide-in-from-right-2">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedStudentId && currentStudent && (
                    <div className="space-y-6 animate-in slide-in-from-top duration-300">
                      <div className="bg-indigo-50 p-4 rounded-2xl flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg">
                          {currentStudent.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-indigo-900">Welcome back, {currentStudent.firstName}!</p>
                          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{getGradeDisplay(currentStudent.grade)} Learner</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">YOUR SCREENINGS</label>
                        
                        {currentStudent.assignedAssessments.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">No assessments have been assigned to your username.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* US Curriculum: Show General and AP Assessments */}
                            {isUS && assignedGeneral.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">General Assessment</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {assignedGeneral.map(a => (
                                    <button
                                      key={a.subject}
                                      onClick={() => setSelectedSubject(a.subject)}
                                      className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedSubject === a.subject ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'}`}
                                    >
                                      <p className={`font-bold ${selectedSubject === a.subject ? 'text-indigo-800' : 'text-slate-700'}`}>{a.subject}</p>
                                      <p className="text-xs text-slate-400">Universal Screener</p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {isUS && assignedAP.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AP Prerequisite Screening</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {assignedAP.map(a => (
                                    <button
                                      key={a.subject}
                                      onClick={() => setSelectedSubject(a.subject)}
                                      className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedSubject === a.subject ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'}`}
                                    >
                                      <p className={`font-bold ${selectedSubject === a.subject ? 'text-indigo-800' : 'text-slate-700'}`}>{a.subject}</p>
                                      <p className="text-xs text-slate-400">Readiness Evaluation</p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Edexcel Curriculum: Show IGCSE Assessments */}
                            {isEdexcel && assignedEdexcel.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Edexcel IGCSE Screening</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {assignedEdexcel.map(a => (
                                    <button
                                      key={a.subject}
                                      onClick={() => setSelectedSubject(a.subject)}
                                      className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedSubject === a.subject ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-100' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'}`}
                                    >
                                      <p className={`font-bold ${selectedSubject === a.subject ? 'text-purple-800' : 'text-slate-700'}`}>{a.subject}</p>
                                      <p className="text-xs text-slate-400">IGCSE Readiness</p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Show message if no assessments match current curriculum */}
                            {((isUS && assignedGeneral.length === 0 && assignedAP.length === 0) ||
                              (isEdexcel && assignedEdexcel.length === 0)) && (
                              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No {isEdexcel ? 'Edexcel' : 'US'} assessments assigned. Switch curriculum to see other assessments.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button 
                    disabled={!selectedStudentId || !selectedSubject} 
                    onClick={() => setStudentTestMode(true)} 
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 transition-all"
                  >
                    BEGIN ASSESSMENT
                  </button>
                  {!selectedStudentId && loginUsername.length > 0 && (
                    <p className="text-center text-xs text-rose-500 font-bold animate-pulse">Username not found. Please try again or contact your administrator.</p>
                  )}
                </div>
              </div>
            ) : (
              <ScreenerTest
                grade={currentStudent?.grade || '12'}
                subject={selectedSubject!}
                studentName={`${currentStudent?.firstName} ${currentStudent?.lastName}`}
                studentId={selectedStudentId}
                schoolId={currentStudent?.schoolId}
                onComplete={handleCompleteScreener}
                onExit={() => setStudentTestMode(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Main App component that provides curriculum context
const App: React.FC = () => {
  return (
    <CurriculumProvider>
      <AppContent />
    </CurriculumProvider>
  );
};

export default App;
