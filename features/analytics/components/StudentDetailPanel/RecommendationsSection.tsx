/**
 * RecommendationsSection Component
 * Displays actionable recommendations for the student
 */

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { GradeCategory, ReadinessStatus } from '../../types';

interface MasteredStandard {
  code: string;
  name: string;
}

interface SkillGap {
  code: string;
  standard: string;
  description: string;
  domain: string;
}

interface StudentInfo {
  firstName: string;
  lastName: string;
  grade: string;
  schoolName: string;
  testDate?: string;
  subject?: string;
}

interface RecommendationsSectionProps {
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  recommendations: string[];
  skillGapCount: number;
  masteredStandards?: MasteredStandard[];
  skillGaps?: SkillGap[];
  studentInfo?: StudentInfo;
  isLoading?: boolean;
}

// Icon components for different recommendation types
const RecommendationIcon: React.FC<{ type: 'focus' | 'practice' | 'support' | 'advance' }> = ({ type }) => {
  switch (type) {
    case 'focus':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'practice':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'support':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'advance':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
  }
};

// Generate default recommendations based on status
const getDefaultRecommendations = (
  screenerStatus: GradeCategory,
  readinessStatus: ReadinessStatus | null,
  skillGapCount: number
): Array<{ text: string; type: 'focus' | 'practice' | 'support' | 'advance'; priority: 'high' | 'medium' | 'low' }> => {
  const recommendations: Array<{ text: string; type: 'focus' | 'practice' | 'support' | 'advance'; priority: 'high' | 'medium' | 'low' }> = [];

  if (screenerStatus === 'far-below') {
    recommendations.push({
      text: 'Provide intensive intervention with targeted small-group instruction',
      type: 'support',
      priority: 'high',
    });
    recommendations.push({
      text: 'Focus on foundational skill gaps before introducing grade-level content',
      type: 'focus',
      priority: 'high',
    });
  } else if (screenerStatus === 'below') {
    recommendations.push({
      text: 'Implement supplemental support during core instruction time',
      type: 'support',
      priority: 'medium',
    });
    recommendations.push({
      text: 'Use scaffolded practice to build toward grade-level expectations',
      type: 'practice',
      priority: 'medium',
    });
  } else if (screenerStatus === 'on-or-above') {
    recommendations.push({
      text: 'Provide enrichment opportunities and extension activities',
      type: 'advance',
      priority: 'low',
    });
    recommendations.push({
      text: 'Consider peer tutoring roles to reinforce mastery',
      type: 'practice',
      priority: 'low',
    });
  }

  if (readinessStatus === 'not-yet-ready' && skillGapCount > 0) {
    recommendations.push({
      text: `Address ${skillGapCount} identified prerequisite skill gap${skillGapCount > 1 ? 's' : ''} before course enrollment`,
      type: 'focus',
      priority: 'high',
    });
  } else if (readinessStatus === 'approaching') {
    recommendations.push({
      text: 'Provide just-in-time support for prerequisite skills during instruction',
      type: 'support',
      priority: 'medium',
    });
  }

  return recommendations;
};

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  screenerStatus,
  readinessStatus,
  recommendations: customRecommendations,
  skillGapCount,
  masteredStandards = [],
  skillGaps = [],
  studentInfo,
  isLoading = false,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePDF = async () => {
    if (!studentInfo) return;

    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;
      const leftMargin = 20;
      const lineHeight = 7;

      // Header
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('COMPASS STUDENT ASSESSMENT REPORT', leftMargin, yPosition);
      yPosition += lineHeight * 2;

      // Student Name
      doc.setFontSize(24);
      doc.setTextColor(30, 41, 59);
      doc.text(`${studentInfo.firstName} ${studentInfo.lastName}`, leftMargin, yPosition);
      yPosition += lineHeight * 1.5;

      // Grade and School
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Grade ${studentInfo.grade} • ${studentInfo.schoolName}`, leftMargin, yPosition);
      yPosition += lineHeight;

      if (studentInfo.testDate) {
        doc.text(`Assessment Date: ${new Date(studentInfo.testDate).toLocaleDateString()}`, leftMargin, yPosition);
        yPosition += lineHeight;
      }

      if (studentInfo.subject) {
        doc.text(`Subject: ${studentInfo.subject}`, leftMargin, yPosition);
        yPosition += lineHeight;
      }

      // Status
      yPosition += lineHeight;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      const statusLabel = screenerStatus === 'on-or-above' ? 'On/Above Grade Level' :
                          screenerStatus === 'below' ? 'Below Grade Level' :
                          screenerStatus === 'far-below' ? 'Far Below Grade Level' : 'Not Assessed';
      doc.text(`Status: ${statusLabel}`, leftMargin, yPosition);
      yPosition += lineHeight * 2;

      // Standards Met Section
      if (masteredStandards.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129); // Emerald color
        doc.text('STANDARDS MET', leftMargin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);

        masteredStandards.forEach((standard) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`${standard.code}`, leftMargin, yPosition);
          doc.setFont('helvetica', 'normal');
          const nameText = doc.splitTextToSize(standard.name, pageWidth - leftMargin - 60);
          doc.text(nameText, leftMargin + 50, yPosition);
          yPosition += lineHeight * Math.max(nameText.length, 1) + 2;
        });

        yPosition += lineHeight;
      }

      // Skill Gaps Section
      if (skillGaps.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68); // Rose color
        doc.text('SKILL GAPS', leftMargin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);

        skillGaps.forEach((gap) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`${gap.code}`, leftMargin, yPosition);
          doc.setFont('helvetica', 'normal');
          const standardText = doc.splitTextToSize(gap.standard, pageWidth - leftMargin - 60);
          doc.text(standardText, leftMargin + 50, yPosition);
          yPosition += lineHeight * Math.max(standardText.length, 1);

          if (gap.description) {
            doc.setTextColor(100);
            const descText = doc.splitTextToSize(gap.description, pageWidth - leftMargin - 30);
            doc.text(descText, leftMargin + 10, yPosition);
            doc.setTextColor(30, 41, 59);
            yPosition += lineHeight * descText.length;
          }
          yPosition += 3;
        });

        yPosition += lineHeight;
      }

      // Recommendations Section
      if (defaultRecs.length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229); // Indigo color
        doc.text('RECOMMENDATIONS', leftMargin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);

        defaultRecs.forEach((rec, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          const recText = doc.splitTextToSize(`${index + 1}. ${rec.text}`, pageWidth - leftMargin - 20);
          doc.text(recText, leftMargin, yPosition);
          yPosition += lineHeight * recText.length + 2;
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Generated by Compass • Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`${studentInfo.firstName}_${studentInfo.lastName}_Assessment_Report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  const defaultRecs = getDefaultRecommendations(screenerStatus, readinessStatus, skillGapCount);

  // Combine custom and default recommendations
  const allRecommendations = customRecommendations.length > 0
    ? customRecommendations.map((text) => ({ text, type: 'focus' as const, priority: 'medium' as const }))
    : defaultRecs;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedRecommendations = [...allRecommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  if (isLoading) {
    return (
      <div className="p-6 border-t border-slate-100 animate-pulse">
        <div className="h-5 w-36 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (sortedRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="p-6 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
        Recommendations
      </h3>

      <div className="space-y-3">
        {sortedRecommendations.map((rec, index) => {
          const priorityColors = {
            high: 'border-l-rose-500 bg-rose-50',
            medium: 'border-l-amber-500 bg-amber-50',
            low: 'border-l-emerald-500 bg-emerald-50',
          };

          const iconColors = {
            high: 'text-rose-600 bg-rose-100',
            medium: 'text-amber-600 bg-amber-100',
            low: 'text-emerald-600 bg-emerald-100',
          };

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${priorityColors[rec.priority]}`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${iconColors[rec.priority]}`}>
                <RecommendationIcon type={rec.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{rec.text}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {rec.priority} priority
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate PDF button */}
      {studentInfo && (
        <div className="mt-4">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl transition-colors"
          >
            {isGeneratingPdf ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF Report
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;
