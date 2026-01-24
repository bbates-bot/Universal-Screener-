import jsPDF from 'jspdf';
import {
  ExtendedQuestion,
  QuestionFormat,
  isMultipleChoiceOptions,
  isTrueFalseOptions,
  isMatchingOptions,
  isDragDropOptions
} from '../types';
import { Student, StudentResult, School } from '../types';

interface TestPDFOptions {
  includeAnswerKey: boolean;
  gradeLevel: string;
  subject: string;
}

interface MasteryReportData {
  student: Student;
  results: StudentResult[];
  school?: School;
}

/**
 * Download test questions as PDF
 */
export const downloadTestPDF = (
  questions: ExtendedQuestion[],
  options: TestPDFOptions
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 30;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${options.subject} Assessment`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grade Level: ${options.gradeLevel}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Questions
  questions.forEach((question, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${question.text}`, margin, yPos, { maxWidth: pageWidth - 2 * margin });
    yPos += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Render options based on format
    if (isMultipleChoiceOptions(question.questionOptions)) {
      const opts = question.questionOptions;
      opts.choices.forEach((choice, i) => {
        const letter = String.fromCharCode(65 + i);
        const prefix = options.includeAnswerKey && choice === opts.correctAnswer ? '* ' : '  ';
        doc.text(`${prefix}${letter}. ${choice}`, margin + 5, yPos);
        yPos += 7;
      });
    } else if (isTrueFalseOptions(question.questionOptions)) {
      const opts = question.questionOptions;
      const correct = opts.correctAnswer;
      doc.text(`${options.includeAnswerKey && correct ? '* ' : '  '}A. True`, margin + 5, yPos);
      yPos += 7;
      doc.text(`${options.includeAnswerKey && !correct ? '* ' : '  '}B. False`, margin + 5, yPos);
      yPos += 7;
    } else if (isMatchingOptions(question.questionOptions)) {
      const opts = question.questionOptions;
      doc.text('Match the items:', margin + 5, yPos);
      yPos += 7;
      opts.leftItems.forEach((item, i) => {
        doc.text(`${i + 1}. ${item}`, margin + 5, yPos);
        yPos += 7;
      });
      yPos += 5;
      opts.rightItems.forEach((item, i) => {
        const letter = String.fromCharCode(65 + i);
        doc.text(`${letter}. ${item}`, margin + 50, yPos - (opts.rightItems.length - i) * 7);
      });
    } else if (isDragDropOptions(question.questionOptions)) {
      const opts = question.questionOptions;
      doc.text('Place the items in the correct zones:', margin + 5, yPos);
      yPos += 7;
      doc.text(`Items: ${opts.draggableItems.join(', ')}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`Zones: ${opts.dropZones.map(z => z.label).join(', ')}`, margin + 5, yPos);
      yPos += 7;
    }

    yPos += 10;
  });

  // Answer key on separate page if included
  if (options.includeAnswerKey) {
    doc.addPage();
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANSWER KEY', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    questions.forEach((question, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }

      let answer = '';
      if (isMultipleChoiceOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const idx = opts.choices.indexOf(opts.correctAnswer);
        answer = `${String.fromCharCode(65 + idx)}. ${opts.correctAnswer}`;
      } else if (isTrueFalseOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        answer = opts.correctAnswer ? 'True' : 'False';
      } else if (isMatchingOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const matches = Object.entries(opts.correctMatches)
          .map(([l, r]) => `${parseInt(l) + 1}-${String.fromCharCode(65 + r)}`)
          .join(', ');
        answer = matches;
      } else if (isDragDropOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const placements = Object.entries(opts.correctPlacements)
          .map(([i, z]) => `${opts.draggableItems[parseInt(i)]} → ${opts.dropZones[z].label}`)
          .join(', ');
        answer = placements;
      }

      doc.text(`${index + 1}. ${answer}`, margin, yPos);
      yPos += 8;
    });
  }

  // Save
  const filename = options.includeAnswerKey
    ? `${options.subject}_${options.gradeLevel}_AnswerKey.pdf`
    : `${options.subject}_${options.gradeLevel}_Test.pdf`;
  doc.save(filename);
};

/**
 * Download student mastery report as PDF
 */
export const downloadStudentMasteryReportPDF = (data: MasteryReportData): void => {
  const { student, results, school } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 30;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Mastery Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Student Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${student.firstName} ${student.lastName}`, margin, yPos);
  yPos += 8;
  doc.text(`Grade: ${student.grade}`, margin, yPos);
  yPos += 8;
  if (school) {
    doc.text(`School: ${school.name}`, margin, yPos);
    yPos += 8;
  }
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 20;

  // Results Summary
  if (results.length === 0) {
    doc.text('No assessment results available.', margin, yPos);
  } else {
    results.forEach(result => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${result.subject}`, margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Test Date: ${result.testDate}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`Overall Level: ${result.overallLevel}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`Percentile: ${result.percentile}%`, margin + 5, yPos);
      yPos += 10;

      // Strand Scores
      doc.setFont('helvetica', 'bold');
      doc.text('Strand Performance:', margin + 5, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      Object.entries(result.strandScores).forEach(([strand, score]) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 30;
        }
        const level = score >= 70 ? 'Proficient' : score >= 40 ? 'Developing' : 'Needs Support';
        doc.text(`  - ${strand}: ${score}% (${level})`, margin + 10, yPos);
        yPos += 7;
      });

      yPos += 10;
    });
  }

  // Save
  const filename = `MasteryReport_${student.firstName}_${student.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
