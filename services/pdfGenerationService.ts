import jsPDF from 'jspdf';
import {
  ExtendedQuestion,
  QuestionFormat,
  isMultipleChoiceOptions,
  isTrueFalseOptions,
  isMatchingOptions,
  isDragDropOptions,
  isPictureChoiceOptions
} from '../types';
import { Student, StudentResult, School } from '../types';

interface TestPDFOptions {
  includeAnswerKey: boolean;
  gradeLevel: string;
  subject: string;
}

// Helper to check if grade is K-2 (young learners need larger fonts and more spacing)
const isK2Grade = (gradeLevel: string): boolean => {
  const grade = gradeLevel.toUpperCase().trim();
  return grade === 'K' || grade === '1' || grade === '2' ||
         grade === 'KINDERGARTEN' || grade === 'YEAR 1' || grade === 'YEAR 2';
};

// Convert emoji to descriptive text for PDF (jsPDF doesn't render emoji well)
const convertEmojiToText = (text: string): string => {
  const emojiMap: Record<string, string> = {
    '🍎': '[apple]',
    '⭐': '[star]',
    '🌟': '[star]',
    '🍊': '[orange]',
    '🍌': '[banana]',
    '🐱': '[cat]',
    '🐶': '[dog]',
    '🐦': '[bird]',
    '🌸': '[flower]',
    '🌺': '[flower]',
    '🏠': '[house]',
    '🚗': '[car]',
    '📚': '[book]',
    '✏️': '[pencil]',
    '🔴': '[red circle]',
    '🔵': '[blue circle]',
    '🟢': '[green circle]',
    '🟡': '[yellow circle]',
    '⬛': '[black square]',
    '⬜': '[white square]',
    '❤️': '[heart]',
    '👍': '[thumbs up]',
    '👎': '[thumbs down]',
  };

  let result = text;
  for (const [emoji, replacement] of Object.entries(emojiMap)) {
    result = result.split(emoji).join(replacement);
  }
  return result;
};

// Count repeated emoji patterns for visual descriptions
const describeVisualPattern = (text: string): string => {
  // Match repeated emoji patterns like 🍎🍎🍎
  const emojiPattern = /(\p{Emoji})\1+/gu;
  let result = text;

  const matches = text.match(emojiPattern);
  if (matches) {
    matches.forEach(match => {
      const emoji = [...match][0];
      const count = [...match].length;
      const emojiName = convertEmojiToText(emoji).replace(/\[|\]/g, '');
      result = result.replace(match, `(${count} ${emojiName}s)`);
    });
  }

  return convertEmojiToText(result);
};

// Async function to load image as base64 for embedding in PDF
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Failed to load image: ${url}`, error);
    return null;
  }
};

interface MasteryReportData {
  student: Student;
  results: StudentResult[];
  school?: School;
}

/**
 * Download test questions as PDF
 * Enhanced for K-2 with larger fonts, more spacing, and image support
 */
export const downloadTestPDF = async (
  questions: ExtendedQuestion[],
  options: TestPDFOptions
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // K-2 specific settings: larger fonts and more spacing for young children
  const isYoungLearner = isK2Grade(options.gradeLevel);
  const margin = isYoungLearner ? 25 : 20;
  const titleFontSize = isYoungLearner ? 24 : 18;
  const questionFontSize = isYoungLearner ? 16 : 11;
  const optionFontSize = isYoungLearner ? 14 : 10;
  const questionSpacing = isYoungLearner ? 25 : 15;
  const optionSpacing = isYoungLearner ? 12 : 7;
  const betweenQuestionSpacing = isYoungLearner ? 20 : 10;
  const pageBreakThreshold = isYoungLearner ? 220 : 260;

  let yPos = isYoungLearner ? 40 : 30;

  // Title - larger for K-2
  doc.setFontSize(titleFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(`${options.subject} Assessment`, pageWidth / 2, yPos, { align: 'center' });
  yPos += isYoungLearner ? 15 : 10;

  doc.setFontSize(isYoungLearner ? 16 : 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grade Level: ${options.gradeLevel}`, pageWidth / 2, yPos, { align: 'center' });

  // Add visual header decoration for K-2
  if (isYoungLearner) {
    // Draw colorful header bar
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Add friendly message
    yPos += 12;
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Take your time and do your best!', pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  yPos += isYoungLearner ? 25 : 20;

  // Questions
  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];

    // Page break check - more generous for K-2
    if (yPos > pageBreakThreshold) {
      doc.addPage();
      yPos = isYoungLearner ? 40 : 30;

      // Add header bar to new pages for K-2
      if (isYoungLearner) {
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, pageWidth, 8, 'F');
      }
    }

    // Question number box for K-2 (visual aid)
    if (isYoungLearner) {
      doc.setFillColor(243, 244, 246); // Light gray background
      doc.roundedRect(margin - 5, yPos - 8, pageWidth - 2 * margin + 10, questionSpacing + 10, 5, 5, 'F');

      // Question number in a circle
      doc.setFillColor(79, 70, 229); // Indigo
      doc.circle(margin + 8, yPos, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}`, margin + 8, yPos + 1, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(questionFontSize);
    doc.setFont('helvetica', 'bold');

    // Process question text - convert emoji for PDF
    const questionText = isYoungLearner
      ? describeVisualPattern(question.text)
      : question.text;

    const xOffset = isYoungLearner ? margin + 20 : margin;
    const lines = doc.splitTextToSize(
      isYoungLearner ? questionText : `${index + 1}. ${questionText}`,
      pageWidth - 2 * margin - (isYoungLearner ? 20 : 0)
    );
    doc.text(lines, xOffset, yPos, { maxWidth: pageWidth - 2 * margin - (isYoungLearner ? 20 : 0) });
    yPos += lines.length * (isYoungLearner ? 10 : 7) + (isYoungLearner ? 10 : 5);

    // Handle image if present (for PICTURE_CHOICE or imageUrl)
    if (question.imageUrl) {
      try {
        const imageData = await loadImageAsBase64(question.imageUrl);
        if (imageData) {
          const imgWidth = isYoungLearner ? 80 : 50;
          const imgHeight = isYoungLearner ? 60 : 40;
          const imgX = (pageWidth - imgWidth) / 2;

          doc.addImage(imageData, 'JPEG', imgX, yPos, imgWidth, imgHeight);
          yPos += imgHeight + (isYoungLearner ? 15 : 10);
        }
      } catch (e) {
        console.warn('Could not add image to PDF:', e);
      }
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(optionFontSize);

    // Render options based on format - with K-2 enhancements
    if (isMultipleChoiceOptions(question.questionOptions)) {
      const opts = question.questionOptions;
      opts.choices.forEach((choice, i) => {
        const letter = String.fromCharCode(65 + i);
        const isCorrect = options.includeAnswerKey && choice === opts.correctAnswer;

        if (isYoungLearner) {
          // Draw option box for young learners
          const optionWidth = pageWidth - 2 * margin - 10;
          if (isCorrect) {
            doc.setFillColor(209, 250, 229);
            doc.setDrawColor(16, 185, 129);
          } else {
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(209, 213, 219);
          }
          doc.roundedRect(margin + 5, yPos - 6, optionWidth, optionSpacing + 4, 3, 3, 'FD');

          // Letter in circle
          if (isCorrect) {
            doc.setFillColor(16, 185, 129);
          } else {
            doc.setFillColor(156, 163, 175);
          }
          doc.circle(margin + 15, yPos, 5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text(letter, margin + 15, yPos + 1, { align: 'center' });

          // Choice text
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(optionFontSize);
          doc.text(describeVisualPattern(choice), margin + 28, yPos + 2);
        } else {
          const prefix = isCorrect ? '* ' : '  ';
          doc.text(`${prefix}${letter}. ${choice}`, margin + 5, yPos);
        }
        yPos += optionSpacing;
      });
    } else if (isTrueFalseOptions(question.questionOptions)) {
      const opts = question.questionOptions;
      const correct = opts.correctAnswer;

      if (isYoungLearner) {
        // Large YES/NO buttons for K-2
        const buttonWidth = 60;
        const buttonHeight = 30;
        const buttonY = yPos;
        const showCorrectYes = options.includeAnswerKey && correct;
        const showCorrectNo = options.includeAnswerKey && !correct;

        // YES button (with thumbs up indicator)
        if (showCorrectYes) {
          doc.setFillColor(209, 250, 229);
          doc.setDrawColor(16, 185, 129);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(209, 213, 219);
        }
        doc.roundedRect(margin + 10, buttonY, buttonWidth, buttonHeight, 5, 5, 'FD');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        if (showCorrectYes) {
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setTextColor(100, 116, 139);
        }
        doc.text('YES', margin + 10 + buttonWidth / 2, buttonY + buttonHeight / 2 + 2, { align: 'center' });
        // Draw thumbs up indicator
        doc.setFontSize(10);
        doc.text('[thumbs up]', margin + 10 + buttonWidth / 2, buttonY + buttonHeight + 8, { align: 'center' });

        // NO button (with thumbs down indicator)
        if (showCorrectNo) {
          doc.setFillColor(254, 226, 226);
          doc.setDrawColor(239, 68, 68);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(209, 213, 219);
        }
        doc.roundedRect(pageWidth / 2 + 10, buttonY, buttonWidth, buttonHeight, 5, 5, 'FD');
        doc.setFontSize(16);
        if (showCorrectNo) {
          doc.setTextColor(239, 68, 68);
        } else {
          doc.setTextColor(100, 116, 139);
        }
        doc.text('NO', pageWidth / 2 + 10 + buttonWidth / 2, buttonY + buttonHeight / 2 + 2, { align: 'center' });
        // Draw thumbs down indicator
        doc.setFontSize(10);
        doc.text('[thumbs down]', pageWidth / 2 + 10 + buttonWidth / 2, buttonY + buttonHeight + 8, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        yPos += buttonHeight + 20;
      } else {
        doc.text(`${options.includeAnswerKey && correct ? '* ' : '  '}A. True`, margin + 5, yPos);
        yPos += optionSpacing;
        doc.text(`${options.includeAnswerKey && !correct ? '* ' : '  '}B. False`, margin + 5, yPos);
        yPos += optionSpacing;
      }
    } else if (isPictureChoiceOptions(question.questionOptions)) {
      // PICTURE_CHOICE format - show images in a grid
      const opts = question.questionOptions;
      const imageSize = isYoungLearner ? 50 : 35;
      const imageSpacing = isYoungLearner ? 15 : 10;
      const totalWidth = opts.images.length * (imageSize + imageSpacing) - imageSpacing;
      let imgX = (pageWidth - totalWidth) / 2;

      for (let i = 0; i < opts.images.length; i++) {
        const img = opts.images[i];
        const isCorrect = options.includeAnswerKey && i === opts.correctAnswerIndex;

        // Draw selection box
        if (isCorrect) {
          doc.setFillColor(209, 250, 229);
          doc.setDrawColor(16, 185, 129);
          doc.setLineWidth(2);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(209, 213, 219);
          doc.setLineWidth(0.5);
        }
        doc.roundedRect(imgX - 5, yPos - 5, imageSize + 10, imageSize + 25, 5, 5, 'FD');

        // Try to load and add image
        if (img.imageUrl) {
          try {
            const imageData = await loadImageAsBase64(img.imageUrl);
            if (imageData) {
              doc.addImage(imageData, 'JPEG', imgX, yPos, imageSize, imageSize);
            } else {
              // Placeholder if image fails to load
              doc.setFontSize(10);
              doc.setTextColor(150);
              doc.text('[Image]', imgX + imageSize / 2, yPos + imageSize / 2, { align: 'center' });
            }
          } catch (e) {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('[Image]', imgX + imageSize / 2, yPos + imageSize / 2, { align: 'center' });
          }
        }

        // Label below image
        if (img.label) {
          doc.setFontSize(isYoungLearner ? 14 : 10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(img.label, imgX + imageSize / 2, yPos + imageSize + 12, { align: 'center' });
        }

        imgX += imageSize + imageSpacing;
      }

      yPos += imageSize + 35;
      doc.setLineWidth(0.5);
    } else if (isMatchingOptions(question.questionOptions)) {
      const opts = question.questionOptions;

      if (isYoungLearner) {
        doc.setFontSize(12);
        doc.text('Draw a line to match:', margin + 5, yPos);
        yPos += 15;

        // Draw matching columns with more space
        const leftX = margin + 20;
        const rightX = pageWidth - margin - 60;

        opts.leftItems.forEach((item, i) => {
          // Left item box
          doc.setFillColor(243, 244, 246);
          doc.roundedRect(leftX, yPos - 6, 60, 15, 3, 3, 'F');
          doc.setFontSize(12);
          doc.text(`${i + 1}. ${describeVisualPattern(item)}`, leftX + 5, yPos + 2);

          // Right item box
          doc.setFillColor(243, 244, 246);
          doc.roundedRect(rightX, yPos - 6, 60, 15, 3, 3, 'F');
          const letter = String.fromCharCode(65 + i);
          doc.text(`${letter}. ${describeVisualPattern(opts.rightItems[i] || '')}`, rightX + 5, yPos + 2);

          yPos += 20;
        });
      } else {
        doc.text('Match the items:', margin + 5, yPos);
        yPos += optionSpacing;
        opts.leftItems.forEach((item, i) => {
          doc.text(`${i + 1}. ${item}`, margin + 5, yPos);
          yPos += optionSpacing;
        });
        yPos += 5;
        opts.rightItems.forEach((item, i) => {
          const letter = String.fromCharCode(65 + i);
          doc.text(`${letter}. ${item}`, margin + 50, yPos - (opts.rightItems.length - i) * optionSpacing);
        });
      }
    } else if (isDragDropOptions(question.questionOptions)) {
      const opts = question.questionOptions;

      if (isYoungLearner) {
        doc.setFontSize(12);
        doc.text('Put these in the right boxes:', margin + 5, yPos);
        yPos += 15;

        // Items to drag
        doc.setFillColor(254, 243, 199); // Yellow
        doc.roundedRect(margin + 5, yPos - 5, pageWidth - 2 * margin - 10, 25, 5, 5, 'F');
        doc.setFontSize(11);
        doc.text(`Items: ${opts.draggableItems.map(i => describeVisualPattern(i)).join('  •  ')}`, margin + 12, yPos + 8);
        yPos += 35;

        // Drop zones
        const zoneWidth = (pageWidth - 2 * margin - 20) / opts.dropZones.length;
        opts.dropZones.forEach((zone, i) => {
          const zoneX = margin + 10 + i * zoneWidth;
          doc.setFillColor(243, 244, 246);
          doc.setDrawColor(156, 163, 175);
          doc.roundedRect(zoneX, yPos, zoneWidth - 10, 30, 5, 5, 'FD');
          doc.setFontSize(10);
          doc.text(zone.label, zoneX + (zoneWidth - 10) / 2, yPos + 18, { align: 'center' });
        });
        yPos += 40;
      } else {
        doc.text('Place the items in the correct zones:', margin + 5, yPos);
        yPos += optionSpacing;
        doc.text(`Items: ${opts.draggableItems.join(', ')}`, margin + 5, yPos);
        yPos += optionSpacing;
        doc.text(`Zones: ${opts.dropZones.map(z => z.label).join(', ')}`, margin + 5, yPos);
        yPos += optionSpacing;
      }
    }

    yPos += betweenQuestionSpacing;
  }

  // Answer key on separate page if included
  if (options.includeAnswerKey) {
    doc.addPage();
    yPos = isYoungLearner ? 40 : 30;

    if (isYoungLearner) {
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 8, 'F');
    }

    doc.setFontSize(isYoungLearner ? 20 : 14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANSWER KEY', pageWidth / 2, yPos, { align: 'center' });
    yPos += isYoungLearner ? 25 : 20;

    doc.setFontSize(isYoungLearner ? 14 : 10);
    doc.setFont('helvetica', 'normal');

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      if (yPos > 270) {
        doc.addPage();
        yPos = isYoungLearner ? 40 : 30;
        if (isYoungLearner) {
          doc.setFillColor(79, 70, 229);
          doc.rect(0, 0, pageWidth, 8, 'F');
        }
      }

      let answer = '';
      if (isMultipleChoiceOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const idx = opts.choices.indexOf(opts.correctAnswer);
        answer = `${String.fromCharCode(65 + idx)}. ${describeVisualPattern(opts.correctAnswer)}`;
      } else if (isTrueFalseOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        answer = opts.correctAnswer ? 'YES (True)' : 'NO (False)';
      } else if (isPictureChoiceOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const correctImg = opts.images[opts.correctAnswerIndex];
        answer = correctImg?.label || `Image ${opts.correctAnswerIndex + 1}`;
      } else if (isMatchingOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const matches = Object.entries(opts.correctMatches)
          .map(([l, r]) => `${parseInt(l) + 1}-${String.fromCharCode(65 + r)}`)
          .join(', ');
        answer = matches;
      } else if (isDragDropOptions(question.questionOptions)) {
        const opts = question.questionOptions;
        const placements = Object.entries(opts.correctPlacements)
          .map(([i, z]) => `${describeVisualPattern(opts.draggableItems[parseInt(i)])} → ${opts.dropZones[z].label}`)
          .join(', ');
        answer = placements;
      }

      if (isYoungLearner) {
        // Nicer answer display for K-2
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 14, 3, 3, 'F');
        doc.setTextColor(22, 101, 52);
        doc.text(`${index + 1}. ${answer}`, margin + 8, yPos + 4);
        doc.setTextColor(0, 0, 0);
        yPos += 18;
      } else {
        doc.text(`${index + 1}. ${answer}`, margin, yPos);
        yPos += 8;
      }
    }
  }

  // Footer for K-2
  if (isYoungLearner) {
    const currentPage = doc.getNumberOfPages();
    for (let i = 1; i <= currentPage; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        'Great job! Keep learning!',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
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
