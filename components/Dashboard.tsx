
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { StudentResult, ScreenerLevel, School, Subject, StandardPerformance } from '../types';
import { MATH_STRANDS, READING_STRANDS, AP_MATH_STRANDS, AP_ENGLISH_STRANDS, CCSS_LEARNING_OBJECTIVES } from '../constants';
import { CurriculumBadge, getCurriculumFromSubject } from './CurriculumBadge';
import { useCurriculumGrades } from '../hooks/useCurriculumGrades';

// Map strand names to relevant CCSS standards by grade and subject
// This function finds ALL matching standards from CCSS_LEARNING_OBJECTIVES
const getStandardsForStrand = (strand: string, grade: string, subject: string): string[] => {
  const gradeNum = grade === 'K' ? 'K' : grade;
  const allStandardKeys = Object.keys(CCSS_LEARNING_OBJECTIVES);

  // Helper to find standards matching a pattern
  const findMatchingStandards = (patterns: string[]): string[] => {
    return allStandardKeys.filter(key =>
      patterns.some(pattern => key.includes(pattern))
    );
  };

  // ELA/Language standards
  if (strand === 'Language' || subject === 'ELA') {
    // Handle grade ranges like 9-10, 11-12
    const gradePatterns = gradeNum === '9' || gradeNum === '10'
      ? ['L.9-10']
      : gradeNum === '11' || gradeNum === '12'
      ? ['L.11-12']
      : [`L.${gradeNum}.`];
    return findMatchingStandards(gradePatterns.map(p => `ELA-LITERACY.${p}`));
  }

  // Reading Literature standards
  if (strand === 'Key Ideas & Details' || strand === 'Reading Literature' || strand === 'Craft & Structure' || strand === 'Integration of Knowledge') {
    const gradePatterns = gradeNum === '9' || gradeNum === '10'
      ? ['RL.9-10']
      : gradeNum === '11' || gradeNum === '12'
      ? ['RL.11-12']
      : [`RL.${gradeNum}.`];
    return findMatchingStandards(gradePatterns.map(p => `ELA-LITERACY.${p}`));
  }

  // Reading Informational Text
  if (strand === 'Informational Text' || strand === 'Reading Informational Text') {
    const gradePatterns = gradeNum === '9' || gradeNum === '10'
      ? ['RI.9-10']
      : gradeNum === '11' || gradeNum === '12'
      ? ['RI.11-12']
      : [`RI.${gradeNum}.`];
    return findMatchingStandards(gradePatterns.map(p => `ELA-LITERACY.${p}`));
  }

  // Reading Foundational Skills (K-5 only)
  if (strand === 'Phonics & Word Recognition' || strand === 'Phonological Awareness' || strand === 'Reading Foundational Skills' || strand === 'Fluency') {
    return findMatchingStandards([`ELA-LITERACY.RF.${gradeNum}.`]);
  }

  // Math - Fractions
  if (strand === 'Fractions' || strand === 'Number & Operations - Fractions') {
    return findMatchingStandards([`MATH.CONTENT.${gradeNum}.NF.`]);
  }

  // Math - Operations & Algebraic Thinking
  if (strand === 'Numbers & Operations' || strand === 'Algebra & Algebraic Thinking' || strand === 'Operations & Algebraic Thinking') {
    return findMatchingStandards([`MATH.CONTENT.${gradeNum}.OA.`]);
  }

  // Math - Counting & Cardinality (K only)
  if (strand === 'Counting & Cardinality') {
    return findMatchingStandards([`MATH.CONTENT.K.CC.`]);
  }

  // Math - Number & Operations in Base Ten
  if (strand === 'Number & Operations in Base Ten' || strand === 'Place Value') {
    return findMatchingStandards([`MATH.CONTENT.${gradeNum}.NBT.`]);
  }

  // Math - Geometry
  if (strand === 'Geometry') {
    // Check for grade-level and high school geometry
    const results = findMatchingStandards([`MATH.CONTENT.${gradeNum}.G.`]);
    if (results.length === 0 && parseInt(gradeNum) >= 9) {
      return findMatchingStandards(['MATH.CONTENT.HSG']);
    }
    return results;
  }

  // Math - Measurement & Data
  if (strand === 'Data & Measurement' || strand === 'Measurement & Data' || strand === 'Statistics & Probability') {
    const results = findMatchingStandards([`MATH.CONTENT.${gradeNum}.MD.`]);
    if (results.length === 0) {
      return findMatchingStandards([`MATH.CONTENT.${gradeNum}.SP.`, 'MATH.CONTENT.HSS']);
    }
    return results;
  }

  // Math - Ratios & Proportional Relationships (6-7)
  if (strand === 'Ratios & Proportional Relationships') {
    return findMatchingStandards([`MATH.CONTENT.${gradeNum}.RP.`]);
  }

  // Math - The Number System (6-8)
  if (strand === 'The Number System') {
    return findMatchingStandards([`MATH.CONTENT.${gradeNum}.NS.`]);
  }

  // Math - Expressions & Equations (6-8)
  if (strand === 'Expressions & Equations') {
    return findMatchingStandards([`MATH.CONTENT.${gradeNum}.EE.`]);
  }

  // Math - Functions (8+)
  if (strand === 'Functions') {
    const results = findMatchingStandards([`MATH.CONTENT.${gradeNum}.F.`]);
    if (results.length === 0 && parseInt(gradeNum) >= 9) {
      return findMatchingStandards(['MATH.CONTENT.HSF']);
    }
    return results;
  }

  // High School Math - Algebra
  if (strand === 'Algebra' || strand === 'Seeing Structure in Expressions') {
    return findMatchingStandards(['MATH.CONTENT.HSA']);
  }

  // Fallback: try to find any standards containing the grade number for math or ELA
  if (subject === 'Math' || subject === 'Mathematics') {
    const fallback = findMatchingStandards([`MATH.CONTENT.${gradeNum}.`]);
    if (fallback.length > 0) return fallback.slice(0, 5);
  }

  return [];
};

// Helper to parse CCSS standard codes into readable learning objectives
const parseStandardCode = (code: string): { domain: string; objective: string; description: string; shortCode: string } => {
  // Check if we have a specific learning objective for this standard
  const specificObjective = CCSS_LEARNING_OBJECTIVES[code];

  // Extract short code for display (e.g., "L.3.1.A" from "CCSS.ELA-LITERACY.L.3.1.A")
  let shortCode = code;
  if (code.includes('MATH.CONTENT')) {
    // CCSS.MATH.CONTENT.3.NF.A.1 -> 3.NF.A.1
    shortCode = code.replace('CCSS.MATH.CONTENT.', '');
  } else if (code.includes('ELA-LITERACY')) {
    // CCSS.ELA-LITERACY.L.3.1.A -> L.3.1.A
    shortCode = code.replace('CCSS.ELA-LITERACY.', '');
  } else if (code.includes('HSA') || code.includes('HSF') || code.includes('HSG') || code.includes('HSS')) {
    // High school standards
    shortCode = code.replace('CCSS.MATH.CONTENT.', '');
  }

  // Examples: CCSS.MATH.CONTENT.3.NF.A.1, CCSS.ELA-LITERACY.RL.3.1
  const parts = code.split('.');

  // Math standards
  if (code.includes('MATH')) {
    const gradeMatch = parts.find(p => /^\d+$/.test(p));
    const domainMatch = parts.find(p => /^[A-Z]{1,3}$/.test(p) && p !== 'MATH' && p !== 'CONTENT');
    const grade = gradeMatch || 'HS';
    const domain = domainMatch || 'MATH';

    const domainNames: Record<string, string> = {
      'CC': 'Counting & Cardinality',
      'OA': 'Operations & Algebraic Thinking',
      'NBT': 'Number & Operations in Base Ten',
      'NF': 'Number & Operations - Fractions',
      'MD': 'Measurement & Data',
      'G': 'Geometry',
      'RP': 'Ratios & Proportional Relationships',
      'NS': 'The Number System',
      'EE': 'Expressions & Equations',
      'F': 'Functions',
      'SP': 'Statistics & Probability',
      'HSS': 'Statistics',
      'IC': 'Making Inferences',
      'SSE': 'Seeing Structure in Expressions',
      'CED': 'Creating Equations',
      'REI': 'Reasoning with Equations',
      'IF': 'Interpreting Functions',
      'BF': 'Building Functions',
      'CO': 'Congruence',
      'SRT': 'Similarity & Right Triangles',
      'ID': 'Interpreting Data'
    };

    return {
      domain: domainNames[domain] || domain,
      objective: specificObjective || `Grade ${grade} ${domainNames[domain] || domain}`,
      description: code,
      shortCode
    };
  }

  // ELA/Reading standards
  if (code.includes('ELA') || code.includes('LITERACY')) {
    const domainMatch = code.match(/\.(RL|RI|RF|W|SL|L)\./);
    const gradeMatch = code.match(/\.(\d+)\./);
    const domain = domainMatch ? domainMatch[1] : 'ELA';
    const grade = gradeMatch ? gradeMatch[1] : '';

    const domainNames: Record<string, string> = {
      'RL': 'Reading Literature',
      'RI': 'Reading Informational Text',
      'RF': 'Reading Foundational Skills',
      'W': 'Writing',
      'SL': 'Speaking & Listening',
      'L': 'Language'
    };

    return {
      domain: domainNames[domain] || domain,
      objective: specificObjective || `Grade ${grade} ${domainNames[domain] || domain}`,
      description: code,
      shortCode
    };
  }

  return { domain: 'Standard', objective: specificObjective || code, description: code, shortCode };
};

const COLORS = {
  [ScreenerLevel.ON_ABOVE]: '#10b981',
  [ScreenerLevel.BELOW]: '#fbbf24',
  [ScreenerLevel.FAR_BELOW]: '#f87171',
  [ScreenerLevel.NOT_STARTED]: '#9ca3af',
  [ScreenerLevel.IN_PROGRESS]: '#60a5fa',
};

// AP Readiness level descriptions
const READINESS_DESCRIPTIONS = {
  [ScreenerLevel.ON_ABOVE]: {
    label: 'Ready for AP',
    shortLabel: 'Ready',
    description: 'Has prerequisite skills needed for success in AP coursework',
    color: 'emerald',
    percentileRange: '70th percentile or higher'
  },
  [ScreenerLevel.BELOW]: {
    label: 'Approaching Readiness',
    shortLabel: 'Developing',
    description: 'Shows foundational skills but may need additional support in AP course',
    color: 'amber',
    percentileRange: '40th-69th percentile'
  },
  [ScreenerLevel.FAR_BELOW]: {
    label: 'Not Yet Ready',
    shortLabel: 'Needs Prep',
    description: 'Significant prerequisite gaps - consider foundational coursework first',
    color: 'rose',
    percentileRange: 'Below 40th percentile'
  },
  [ScreenerLevel.NOT_STARTED]: {
    label: 'Not Assessed',
    shortLabel: 'Pending',
    description: 'Readiness assessment not yet begun',
    color: 'gray',
    percentileRange: 'N/A'
  },
  [ScreenerLevel.IN_PROGRESS]: {
    label: 'In Progress',
    shortLabel: 'Active',
    description: 'Currently taking the readiness assessment',
    color: 'blue',
    percentileRange: 'N/A'
  }
};

interface DashboardProps {
  results: StudentResult[];
  subject: string;
  schools: School[];
}

const Dashboard: React.FC<DashboardProps> = ({ results, subject, schools }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { formatGrade } = useCurriculumGrades();

  const filteredBySearch = useMemo(() => {
    return results.filter(r => 
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const pieData = Object.values(ScreenerLevel).map(level => ({
    name: level,
    value: filteredBySearch.filter(r => r.overallLevel === level).length
  })).filter(d => d.value > 0);

  let strands = MATH_STRANDS;
  if (subject.startsWith('AP')) {
    strands = subject.includes('English') ? AP_ENGLISH_STRANDS : AP_MATH_STRANDS;
  } else if (subject.includes('Reading')) {
    strands = READING_STRANDS;
  }
  
  const barData = strands.map(strand => {
    const strandResults = filteredBySearch.map(r => r.strandScores[strand] || 0);
    const avg = strandResults.length > 0 ? Math.round(strandResults.reduce((a, b) => a + b, 0) / strandResults.length) : 0;
    return {
      name: strand,
      score: avg
    };
  });

  const getSchoolName = (id: string) => schools.find(s => s.id === id)?.name || 'Unknown School';

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search student by name..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            Clear Search
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">AP Readiness Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Students grouped by prerequisite skill readiness</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as ScreenerLevel]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Readiness Level Legend */}
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AP Readiness Levels</div>
            {[ScreenerLevel.ON_ABOVE, ScreenerLevel.BELOW, ScreenerLevel.FAR_BELOW].map(level => {
              const desc = READINESS_DESCRIPTIONS[level];
              const count = filteredBySearch.filter(r => r.overallLevel === level).length;
              return (
                <div key={level} className="flex items-start gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0`} style={{ backgroundColor: COLORS[level] }}></div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-700">{desc.label} <span className="text-gray-400 font-normal">({count} students)</span></div>
                    <div className="text-gray-500 text-[10px]">{desc.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Prerequisite Skill Gaps by Domain</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">{filteredBySearch.length} results matching current view</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-black text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">AP Readiness Status</th>
                  <th className="px-4 py-4">Prerequisites Met</th>
                  <th className="px-4 py-4">Prerequisite Gaps</th>
                  <th className="px-4 py-4 text-center">Readiness Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBySearch.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400 font-medium">No assessment results match these filters.</td>
                  </tr>
                ) : filteredBySearch.map(student => {
                  // Proficient areas: strand scores >= 70% (grade-level proficiency)
                  const proficientAreas = Object.entries(student.strandScores).filter(([_, s]) => (s as number) >= 70).map(([n, s]) => ({ name: n, score: s as number }));
                  // Growth areas: strand scores < 60% (needs improvement)
                  const growthAreas = Object.entries(student.strandScores).filter(([_, s]) => (s as number) < 60).map(([n, s]) => ({ name: n, score: s as number }));
                  // Get proficiency description
                  const profDesc = READINESS_DESCRIPTIONS[student.overallLevel] || READINESS_DESCRIPTIONS[ScreenerLevel.NOT_STARTED];

                  // Derive mastered objectives from standardsPerformance if masteredObjectives is empty
                  let derivedMasteredObjectives = student.masteredObjectives || [];
                  let derivedGapObjectives = student.gapObjectives || [];

                  if (derivedMasteredObjectives.length === 0 && student.standardsPerformance && student.standardsPerformance.length > 0) {
                    derivedMasteredObjectives = student.standardsPerformance
                      .filter(sp => sp.questionsAttempted > 0 && (sp.questionsCorrect / sp.questionsAttempted) >= 0.7)
                      .map(sp => sp.standardCode);
                    derivedGapObjectives = student.standardsPerformance
                      .filter(sp => sp.questionsAttempted > 0 && (sp.questionsCorrect / sp.questionsAttempted) < 0.6)
                      .map(sp => sp.standardCode);
                  }

                  // If still no specific standards, derive from strand scores
                  if (derivedMasteredObjectives.length === 0 && proficientAreas.length > 0) {
                    proficientAreas.forEach(area => {
                      const standards = getStandardsForStrand(area.name, student.grade, student.subject);
                      derivedMasteredObjectives.push(...standards);
                    });
                  }
                  if (derivedGapObjectives.length === 0 && growthAreas.length > 0) {
                    growthAreas.forEach(area => {
                      const standards = getStandardsForStrand(area.name, student.grade, student.subject);
                      derivedGapObjectives.push(...standards);
                    });
                  }

                  return (
                    <tr key={`${student.id}-${student.subject}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 align-top">
                        <div className="font-black text-slate-800">{student.firstName} {student.lastName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{formatGrade(student.grade)}</span>
                          <CurriculumBadge curriculum={getCurriculumFromSubject(student.subject)} size="sm" showLabel={false} />
                        </div>
                        <div className="text-[10px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {getSchoolName(student.schoolId)}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-indigo-900">{student.subject}</span>
                          <CurriculumBadge curriculum={getCurriculumFromSubject(student.subject)} size="sm" showLabel={false} />
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          student.overallLevel === ScreenerLevel.ON_ABOVE
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : student.overallLevel === ScreenerLevel.BELOW
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {profDesc.label}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-500">
                          {student.overallLevel === ScreenerLevel.ON_ABOVE
                            ? `Ready for ${student.subject} coursework`
                            : student.overallLevel === ScreenerLevel.BELOW
                            ? `May need support in ${student.subject}`
                            : `Recommend prerequisite courses first`}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {/* Prerequisites Met */}
                        {(() => {
                          const objectivesWithText = derivedMasteredObjectives.filter(obj => CCSS_LEARNING_OBJECTIVES[obj]);
                          return objectivesWithText.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="text-[10px] text-emerald-600 font-bold mb-2">
                                {objectivesWithText.length} prerequisite{objectivesWithText.length !== 1 ? 's' : ''} met
                              </div>
                              {objectivesWithText.slice(0, 5).map(obj => {
                                const parsed = parseStandardCode(obj);
                                const objectiveText = CCSS_LEARNING_OBJECTIVES[obj];
                                return (
                                  <div key={obj} className="px-2 py-1.5 bg-emerald-50 rounded text-[10px] border border-emerald-200">
                                    <div className="font-black text-emerald-700 mb-0.5">{parsed.shortCode}</div>
                                    <div className="text-emerald-600 leading-tight">{objectiveText}</div>
                                  </div>
                                );
                              })}
                              {objectivesWithText.length > 5 && (
                                <div className="text-[10px] text-emerald-500 font-medium pt-1">
                                  +{objectivesWithText.length - 5} more objectives
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">Prerequisites not yet assessed</div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 align-top">
                        {/* Prerequisite Gaps */}
                        {(() => {
                          const gapsWithText = derivedGapObjectives.filter(obj => CCSS_LEARNING_OBJECTIVES[obj]);
                          return gapsWithText.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="text-[10px] text-rose-600 font-bold mb-2">
                                {gapsWithText.length} prerequisite gap{gapsWithText.length !== 1 ? 's' : ''}
                              </div>
                              {gapsWithText.slice(0, 5).map(obj => {
                                const parsed = parseStandardCode(obj);
                                const objectiveText = CCSS_LEARNING_OBJECTIVES[obj];
                                return (
                                  <div key={obj} className="px-2 py-1.5 bg-rose-50 rounded text-[10px] border border-rose-200">
                                    <div className="font-black text-rose-700 mb-0.5">{parsed.shortCode}</div>
                                    <div className="text-rose-600 leading-tight">{objectiveText}</div>
                                  </div>
                                );
                              })}
                              {gapsWithText.length > 5 && (
                                <div className="text-[10px] text-rose-500 font-medium pt-1">
                                  +{gapsWithText.length - 5} more gaps
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-500 font-medium">All prerequisites met</div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 align-top text-center">
                        <div className={`text-xl font-black ${
                          student.percentile >= 70 ? 'text-emerald-600'
                          : student.percentile >= 40 ? 'text-amber-600'
                          : 'text-rose-600'
                        }`}>{student.percentile}<span className="text-sm">%</span></div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          {student.percentile >= 70 ? 'Above Average' : student.percentile >= 40 ? 'Average' : 'Below Average'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{student.testDate}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
