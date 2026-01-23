
import React, { useState, useMemo } from 'react';
import { StudentResult, ScreenerLevel, Student, School } from '../types';
import { GRADES } from '../constants';
import { downloadStudentMasteryReportPDF } from '../services/pdfGenerationService';
import { useCurriculumGrades } from '../hooks/useCurriculumGrades';
import { CurriculumBadge, getCurriculumFromSubject } from './CurriculumBadge';

interface ScreenerDashboardProps {
  students: Student[];
  results: StudentResult[];
  schools: School[];
}

const LEVEL_COLORS = {
  [ScreenerLevel.ON_ABOVE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [ScreenerLevel.BELOW]: 'bg-amber-50 text-amber-700 border-amber-200',
  [ScreenerLevel.FAR_BELOW]: 'bg-rose-50 text-rose-700 border-rose-200',
  [ScreenerLevel.NOT_STARTED]: 'bg-slate-50 text-slate-500 border-slate-200',
  [ScreenerLevel.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
};

const GENERAL_SUBJECTS = ['Math', 'Reading Foundations', 'Reading Comprehension', 'ELA'] as const;

const EDEXCEL_SUBJECTS = [
  'Edexcel Math Pre-IG1', 'Edexcel Math Pre-IG2', 'Edexcel Math IG1', 'Edexcel Math IG2',
  'Edexcel English Pre-IG1', 'Edexcel English Pre-IG2', 'Edexcel English IG1', 'Edexcel English IG2'
] as const;

const ScreenerDashboard: React.FC<ScreenerDashboardProps> = ({ students, results, schools }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [filterSchool, setFilterSchool] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Curriculum-aware grade utilities
  const {
    currentSystem,
    gradeLevelLabel,
    gradeOptions,
    formatGrade,
    filterResultsByCurriculum,
    getSubjectsForCurrentCurriculum,
  } = useCurriculumGrades();

  // Get subjects for current curriculum
  const curriculumSubjects = useMemo(() => getSubjectsForCurrentCurriculum(), [getSubjectsForCurrentCurriculum]);

  // Filter results by current curriculum system
  const curriculumResults = useMemo(() => filterResultsByCurriculum(results), [results, filterResultsByCurriculum]);

  const getStudentLatestStatus = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return ScreenerLevel.NOT_STARTED;

    // Match results by studentId first (new), fallback to username (legacy)
    let studentResults = results.filter(r =>
      (r as any).studentId === studentId || r.username === student.username
    );

    // Filter by subject if specified
    if (filterSubject !== 'All') {
      studentResults = studentResults.filter(r => r.subject === filterSubject);
    }

    if (studentResults.length === 0) return ScreenerLevel.NOT_STARTED;

    const latest = [...studentResults].sort((a, b) =>
      new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
    )[0];

    return latest.overallLevel;
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSchool = filterSchool === 'All' || s.schoolId === filterSchool;
      const matchGrade = filterGrade === 'All' || s.grade === filterGrade;
      const matchSearch = searchQuery === '' ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSchool && matchGrade && matchSearch;
    });
  }, [students, filterSchool, filterGrade, searchQuery]);

  const groupedStudents = {
    [ScreenerLevel.ON_ABOVE]: filteredStudents.filter(s => getStudentLatestStatus(s.id) === ScreenerLevel.ON_ABOVE),
    [ScreenerLevel.BELOW]: filteredStudents.filter(s => getStudentLatestStatus(s.id) === ScreenerLevel.BELOW),
    [ScreenerLevel.FAR_BELOW]: filteredStudents.filter(s => getStudentLatestStatus(s.id) === ScreenerLevel.FAR_BELOW),
    'Non-Applicable': filteredStudents.filter(s => getStudentLatestStatus(s.id) === ScreenerLevel.NOT_STARTED),
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  // Match results by studentId first (new), fallback to username (legacy)
  const selectedStudentResults = useMemo(() => {
    if (!selectedStudent) return [];
    let studentResults = results.filter(r =>
      (r as any).studentId === selectedStudentId || r.username === selectedStudent.username
    );
    // Filter by subject if specified
    if (filterSubject !== 'All') {
      studentResults = studentResults.filter(r => r.subject === filterSubject);
    }
    return studentResults;
  }, [selectedStudent, selectedStudentId, results, filterSubject]);
  const selectedSchool = selectedStudent ? schools.find(sc => sc.id === selectedStudent.schoolId) : undefined;

  const handleExportReport = () => {
    if (!selectedStudent) return;
    downloadStudentMasteryReportPDF({
      student: selectedStudent,
      results: selectedStudentResults,
      school: selectedSchool
    });
  };

  // Calculate summary stats for selected student
  const studentSummary = useMemo(() => {
    if (selectedStudentResults.length === 0) return null;
    const totalAssessments = selectedStudentResults.length;
    const avgPercentile = Math.round(selectedStudentResults.reduce((sum, r) => sum + r.percentile, 0) / totalAssessments);
    const latestResult = [...selectedStudentResults].sort((a, b) =>
      new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
    )[0];
    return { totalAssessments, avgPercentile, latestResult };
  }, [selectedStudentResults]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Search Student</label>
          <div className="relative">
            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or username..."
              className="w-full bg-slate-50 border-none rounded-xl font-medium py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter By School</label>
          <select
            className="w-full bg-slate-50 border-none rounded-xl font-bold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
          >
            <option value="All">All Campuses</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter By {gradeLevelLabel}</label>
          <select
            className="w-full bg-slate-50 border-none rounded-xl font-bold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="All">All {gradeLevelLabel}s</option>
            {gradeOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter By Subject</label>
          <select
            className="w-full bg-slate-50 border-none rounded-xl font-bold py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {currentSystem === 'US_COMMON_CORE_AP' ? (
              <>
                <optgroup label="CCSS Aligned">
                  {GENERAL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              </>
            ) : currentSystem === 'EDEXCEL_INTERNATIONAL' ? (
              <>
                <optgroup label="Edexcel IGCSE">
                  {EDEXCEL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              </>
            ) : (
              <>
                <optgroup label="CCSS Aligned">
                  {GENERAL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
                <optgroup label="Edexcel IGCSE Aligned">
                  {EDEXCEL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(groupedStudents).map(([level, list]) => (
          <div key={level} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{level}</p>
            <p className="text-3xl font-black text-slate-800">{list.length}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedStudents).map(([level, list]) => (
            <div key={level} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className={`px-4 py-2 border-b font-bold text-sm ${LEVEL_COLORS[level as ScreenerLevel] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                {level.toUpperCase()}
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {list.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">No students match these filters.</p>
                ) : (
                  list.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${selectedStudentId === student.id ? 'border-indigo-600 ring-2 ring-indigo-50 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-sm">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-slate-500">{formatGrade(student.grade)} • {schools.find(sc => sc.id === student.schoolId)?.name}</p>
                      </div>
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 h-fit sticky top-24">
          {!selectedStudent ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <p className="text-slate-500 font-medium text-sm">Select a student to view their<br/>readiness objectives and learning paths.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-800">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    {selectedStudent.curriculumSystem && (
                      <CurriculumBadge curriculum={selectedStudent.curriculumSystem} size="sm" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{formatGrade(selectedStudent.grade)} Student</p>
                  {selectedSchool && (
                    <p className="text-xs text-slate-400">{selectedSchool.name}</p>
                  )}
                </div>
              </div>

              {/* Assessment Summary Stats */}
              {studentSummary && (
                <div className="grid grid-cols-3 gap-2 pb-4 border-b">
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider">Assessments</p>
                    <p className="text-xl font-black text-blue-600">{studentSummary.totalAssessments}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl text-center">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Avg Percentile</p>
                    <p className="text-xl font-black text-emerald-600">{studentSummary.avgPercentile}%</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${
                    studentSummary.latestResult.overallLevel === ScreenerLevel.ON_ABOVE ? 'bg-emerald-50' :
                    studentSummary.latestResult.overallLevel === ScreenerLevel.BELOW ? 'bg-amber-50' :
                    studentSummary.latestResult.overallLevel === ScreenerLevel.FAR_BELOW ? 'bg-rose-50' :
                    'bg-slate-50'
                  }`}>
                    <p className={`text-[9px] font-black uppercase tracking-wider ${
                      studentSummary.latestResult.overallLevel === ScreenerLevel.ON_ABOVE ? 'text-emerald-400' :
                      studentSummary.latestResult.overallLevel === ScreenerLevel.BELOW ? 'text-amber-400' :
                      studentSummary.latestResult.overallLevel === ScreenerLevel.FAR_BELOW ? 'text-rose-400' :
                      'text-slate-400'
                    }`}>Current Level</p>
                    <p className={`text-sm font-black ${
                      studentSummary.latestResult.overallLevel === ScreenerLevel.ON_ABOVE ? 'text-emerald-600' :
                      studentSummary.latestResult.overallLevel === ScreenerLevel.BELOW ? 'text-amber-600' :
                      studentSummary.latestResult.overallLevel === ScreenerLevel.FAR_BELOW ? 'text-rose-600' :
                      'text-slate-500'
                    }`}>
                      {studentSummary.latestResult.overallLevel === ScreenerLevel.ON_ABOVE ? 'On/Above' :
                       studentSummary.latestResult.overallLevel === ScreenerLevel.BELOW ? 'Below' :
                       studentSummary.latestResult.overallLevel === ScreenerLevel.FAR_BELOW ? 'Far Below' :
                       'N/A'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Objective Breakdown</h4>
                {selectedStudentResults.length === 0 ? (
                  <div className="p-8 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-slate-100">
                    <p className="text-sm text-slate-500">No screenings completed yet.</p>
                  </div>
                ) : (
                  selectedStudentResults.map(res => {
                    // Fix: explicitly casting value 's' to number in filters to resolve TypeScript operator comparison error on unknown types
                    const categorizedStrands = {
                      [ScreenerLevel.ON_ABOVE]: Object.entries(res.strandScores).filter(([_, s]) => (s as number) >= 70),
                      [ScreenerLevel.BELOW]: Object.entries(res.strandScores).filter(([_, s]) => (s as number) >= 40 && (s as number) < 70),
                      [ScreenerLevel.FAR_BELOW]: Object.entries(res.strandScores).filter(([_, s]) => (s as number) < 40),
                    };

                    return (
                      <div key={res.subject} className="space-y-4">
                        <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-indigo-900 text-xs uppercase tracking-wide">{res.subject}</p>
                            <CurriculumBadge curriculum={getCurriculumFromSubject(res.subject)} size="sm" showLabel={false} />
                          </div>
                          <span className="text-lg font-black text-indigo-600">{res.percentile}%</span>
                        </div>
                        
                        <div className="space-y-4 pl-2 border-l-2 border-slate-100">
                          {/* Categorized Strand Lists */}
                          {categorizedStrands[ScreenerLevel.ON_ABOVE].length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                                On or Above Grade Level
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {categorizedStrands[ScreenerLevel.ON_ABOVE].map(([name]) => (
                                  <span key={name} className="px-2 py-1 bg-white border border-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold shadow-sm">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {categorizedStrands[ScreenerLevel.BELOW].length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                                Below Grade Level
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {categorizedStrands[ScreenerLevel.BELOW].map(([name]) => (
                                  <span key={name} className="px-2 py-1 bg-white border border-amber-100 text-amber-800 rounded-lg text-[10px] font-bold shadow-sm">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {categorizedStrands[ScreenerLevel.FAR_BELOW].length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                                Far Below Grade Level
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {categorizedStrands[ScreenerLevel.FAR_BELOW].map(([name]) => (
                                  <span key={name} className="px-2 py-1 bg-white border border-rose-100 text-rose-800 rounded-lg text-[10px] font-bold shadow-sm">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={handleExportReport}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Mastery Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenerDashboard;
