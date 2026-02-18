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

// Helper to check if grade is K-2 (young learners need larger fonts and visual elements)
const isK2Grade = (gradeLevel: string): boolean => {
  const grade = gradeLevel.toUpperCase().trim();
  return grade === 'K' || grade === '1' || grade === '2' ||
         grade === 'KINDERGARTEN' || grade === 'YEAR 1' || grade === 'YEAR 2';
};

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
      const pageHeight = doc.internal.pageSize.getHeight();

      // K-2 specific settings: larger fonts and visual elements for young children
      const isYoungLearner = isK2Grade(studentInfo.grade);
      const leftMargin = isYoungLearner ? 18 : 15;
      const rightMargin = isYoungLearner ? 18 : 15;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      let yPosition = isYoungLearner ? 15 : 12;

      // Helper to draw rounded rectangle
      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fillColor: [number, number, number]) => {
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.roundedRect(x, y, w, h, r, r, 'F');
      };

      // Header bar (indigo) - larger for K-2
      const headerHeight = isYoungLearner ? 50 : 38;
      drawRoundedRect(0, 0, pageWidth, headerHeight, 0, [79, 70, 229]);

      // Header text
      doc.setFontSize(isYoungLearner ? 10 : 8);
      doc.setTextColor(199, 210, 254);
      doc.text('COMPASS STUDENT ASSESSMENT REPORT', leftMargin, isYoungLearner ? 12 : 10);

      // Student Name (white on indigo) - larger for K-2
      doc.setFontSize(isYoungLearner ? 22 : 16);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`${studentInfo.firstName} ${studentInfo.lastName}`, leftMargin, isYoungLearner ? 28 : 22);

      // Grade and School (light text)
      doc.setFontSize(isYoungLearner ? 11 : 9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(199, 210, 254);
      doc.text(`Grade ${studentInfo.grade}  •  ${studentInfo.schoolName}`, leftMargin, isYoungLearner ? 42 : 32);

      // Add encouraging message for K-2
      if (isYoungLearner) {
        doc.setFontSize(10);
        doc.setTextColor(254, 240, 138); // Yellow
        doc.text('Great work! Keep learning and growing!', pageWidth - rightMargin - 80, 42);
      }

      yPosition = headerHeight + (isYoungLearner ? 12 : 8);

      // Status boxes row - larger for K-2
      const boxWidth = (contentWidth - (isYoungLearner ? 12 : 8)) / 2;
      const boxHeight = isYoungLearner ? 28 : 20;
      const boxSpacing = isYoungLearner ? 12 : 8;

      // Screener Status box
      const statusConfig: Record<string, { bg: [number, number, number]; text: [number, number, number]; label: string }> = {
        'on-or-above': { bg: [209, 250, 229], text: [4, 120, 87], label: 'On/Above Grade Level' },
        'below': { bg: [254, 243, 199], text: [180, 83, 9], label: 'Below Grade Level' },
        'far-below': { bg: [254, 226, 226], text: [185, 28, 28], label: 'Far Below Grade Level' },
        'non-applicable': { bg: [241, 245, 249], text: [100, 116, 139], label: 'Not Yet Assessed' },
      };

      const status = statusConfig[screenerStatus] || statusConfig['non-applicable'];
      drawRoundedRect(leftMargin, yPosition, boxWidth, boxHeight, isYoungLearner ? 5 : 3, status.bg);

      doc.setFontSize(isYoungLearner ? 9 : 7);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text('SCREENER STATUS', leftMargin + (isYoungLearner ? 8 : 6), yPosition + (isYoungLearner ? 10 : 7));

      doc.setFontSize(isYoungLearner ? 12 : 9);
      doc.setTextColor(status.text[0], status.text[1], status.text[2]);
      doc.text(status.label, leftMargin + (isYoungLearner ? 8 : 6), yPosition + (isYoungLearner ? 22 : 15));

      // Readiness box
      const readinessConfig: Record<string, { dot: [number, number, number]; text: [number, number, number]; label: string }> = {
        'ready': { dot: [16, 185, 129], text: [4, 120, 87], label: 'Ready' },
        'approaching': { dot: [245, 158, 11], text: [180, 83, 9], label: 'Approaching' },
        'not-yet-ready': { dot: [239, 68, 68], text: [185, 28, 28], label: 'Not Yet Ready' },
      };

      drawRoundedRect(leftMargin + boxWidth + boxSpacing, yPosition, boxWidth, boxHeight, isYoungLearner ? 5 : 3, [248, 250, 252]);

      doc.setFontSize(isYoungLearner ? 9 : 7);
      doc.setTextColor(100, 116, 139);
      doc.text('READINESS', leftMargin + boxWidth + boxSpacing + (isYoungLearner ? 8 : 6), yPosition + (isYoungLearner ? 10 : 7));

      if (readinessStatus && readinessConfig[readinessStatus]) {
        const readiness = readinessConfig[readinessStatus];
        doc.setFillColor(readiness.dot[0], readiness.dot[1], readiness.dot[2]);
        doc.circle(leftMargin + boxWidth + boxSpacing + (isYoungLearner ? 10 : 8), yPosition + (isYoungLearner ? 20 : 14), isYoungLearner ? 3 : 2, 'F');
        doc.setFontSize(isYoungLearner ? 12 : 9);
        doc.setTextColor(readiness.text[0], readiness.text[1], readiness.text[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(readiness.label, leftMargin + boxWidth + boxSpacing + (isYoungLearner ? 17 : 13), yPosition + (isYoungLearner ? 22 : 15));
      } else {
        doc.setFontSize(isYoungLearner ? 12 : 9);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'bold');
        doc.text('Not Assessed', leftMargin + boxWidth + boxSpacing + (isYoungLearner ? 8 : 6), yPosition + (isYoungLearner ? 22 : 15));
      }

      yPosition += boxHeight + (isYoungLearner ? 12 : 8);

      // Assessment info line - compact
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const infoText = [];
      if (studentInfo.subject) infoText.push(studentInfo.subject);
      if (studentInfo.testDate) infoText.push(`Assessed: ${new Date(studentInfo.testDate).toLocaleDateString()}`);
      if (infoText.length > 0) {
        doc.text(infoText.join('  •  '), leftMargin, yPosition);
        yPosition += 8;
      }

      // Standards Met Section - larger for K-2
      if (masteredStandards.length > 0) {
        doc.setFontSize(isYoungLearner ? 12 : 9);
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.text(isYoungLearner ? 'WHAT YOU LEARNED' : 'STANDARDS BEING MET', leftMargin, yPosition);
        yPosition += isYoungLearner ? 10 : 6;

        masteredStandards.forEach((standard) => {
          const standardText = standard.code;
          const boxH = isYoungLearner ? 10 : 6;

          drawRoundedRect(leftMargin, yPosition, contentWidth, boxH, isYoungLearner ? 4 : 2, [220, 252, 231]);

          doc.setFillColor(16, 185, 129);
          doc.roundedRect(leftMargin, yPosition, isYoungLearner ? 4 : 2, boxH, 2, 2, 'F');

          doc.setFontSize(isYoungLearner ? 10 : 8);
          doc.setTextColor(22, 101, 52);
          doc.setFont('helvetica', 'normal');
          doc.text(standardText, leftMargin + (isYoungLearner ? 10 : 6), yPosition + (isYoungLearner ? 7 : 4.5));

          yPosition += boxH + (isYoungLearner ? 4 : 2);
        });

        yPosition += isYoungLearner ? 8 : 4;
      }

      // Skill Gaps Section - larger for K-2
      if (skillGaps.length > 0) {
        doc.setFontSize(isYoungLearner ? 12 : 9);
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.text(isYoungLearner ? 'WHAT TO PRACTICE' : 'SKILL GAPS', leftMargin, yPosition);
        yPosition += isYoungLearner ? 10 : 6;

        skillGaps.forEach((gap) => {
          const gapText = gap.code;
          const boxH = isYoungLearner ? 10 : 6;

          drawRoundedRect(leftMargin, yPosition, contentWidth, boxH, isYoungLearner ? 4 : 2, [254, 242, 242]);

          doc.setFillColor(239, 68, 68);
          doc.roundedRect(leftMargin, yPosition, isYoungLearner ? 4 : 2, boxH, 2, 2, 'F');

          doc.setFontSize(isYoungLearner ? 10 : 8);
          doc.setTextColor(153, 27, 27);
          doc.setFont('helvetica', 'normal');
          doc.text(gapText, leftMargin + (isYoungLearner ? 10 : 6), yPosition + (isYoungLearner ? 7 : 4.5));

          yPosition += boxH + (isYoungLearner ? 4 : 2);
        });

        yPosition += isYoungLearner ? 8 : 4;
      }

      // Recommendations Section - larger for K-2
      if (defaultRecs.length > 0) {
        doc.setFontSize(isYoungLearner ? 12 : 9);
        doc.setTextColor(79, 70, 229);
        doc.setFont('helvetica', 'bold');
        doc.text(isYoungLearner ? 'NEXT STEPS' : 'RECOMMENDATIONS', leftMargin, yPosition);
        yPosition += isYoungLearner ? 10 : 6;

        const priorityColors: Record<string, [number, number, number]> = {
          high: [254, 242, 242],
          medium: [255, 251, 235],
          low: [236, 253, 245],
        };
        const borderColors: Record<string, [number, number, number]> = {
          high: [239, 68, 68],
          medium: [245, 158, 11],
          low: [16, 185, 129],
        };

        defaultRecs.forEach((rec, index) => {
          const recText = doc.splitTextToSize(`${index + 1}. ${rec.text}`, contentWidth - (isYoungLearner ? 15 : 10));
          const lineHeight = isYoungLearner ? 6 : 4;
          const boxH = (isYoungLearner ? 8 : 4) + (recText.length * lineHeight);

          drawRoundedRect(leftMargin, yPosition, contentWidth, boxH, isYoungLearner ? 4 : 2, priorityColors[rec.priority]);

          doc.setFillColor(borderColors[rec.priority][0], borderColors[rec.priority][1], borderColors[rec.priority][2]);
          doc.roundedRect(leftMargin, yPosition, isYoungLearner ? 4 : 2, boxH, 2, 2, 'F');

          doc.setFontSize(isYoungLearner ? 10 : 8);
          doc.setTextColor(30, 41, 59);
          doc.setFont('helvetica', 'normal');
          doc.text(recText, leftMargin + (isYoungLearner ? 10 : 6), yPosition + (isYoungLearner ? 6 : 3.5));

          yPosition += boxH + (isYoungLearner ? 4 : 2);
        });
      }

      // Footer - encouraging for K-2
      doc.setFontSize(isYoungLearner ? 10 : 7);
      doc.setTextColor(150);
      doc.text(
        isYoungLearner ? 'Keep up the great work!' : 'Generated by Compass',
        pageWidth / 2,
        pageHeight - (isYoungLearner ? 12 : 8),
        { align: 'center' }
      );

      // Add star decorations for K-2 footer
      if (isYoungLearner) {
        doc.setFontSize(8);
        doc.setTextColor(245, 158, 11); // Amber
        doc.text('★', leftMargin + 10, pageHeight - 12);
        doc.text('★', pageWidth - rightMargin - 15, pageHeight - 12);
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
