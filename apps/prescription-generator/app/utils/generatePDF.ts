import {
  PDFDocument,
  PageSizes,
  rgb,
  StandardFonts,
  type PDFFont,
} from "pdf-lib";

import type { PrescriptionFormData } from "../types";

type LetterheadImage = {
  bytes: Uint8Array;
  mime: string;
};

type GeneratePDFInput = PrescriptionFormData & {
  letterheadImage: LetterheadImage | null;
};

const wrapText = (
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
) => {
  if (!text) return [];
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word);
    }
  }

  if (current) lines.push(current);
  return lines;
};

const PRACTICE_INFO = {
  name: "Amcare India",
  address: "39 Mukta Vihar, Naini, Prayagraj 211009",
  contact: "9621550481",
  doctorLine: "Dr. SP Pandey MBBS MD Dipl. ABOM",
  regNo: "UPMC RegNo 91493",
};

export const generatePDF = async (input: GeneratePDFInput) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const marginX = 48;
  const marginTop = 48;
  const marginBottom = 60;
  const contentWidth = width - marginX * 2;

  let cursorY = height - marginTop;

  const nameFontSize = 28;
  const doctorFontSize = Math.round(nameFontSize * 0.75);
  const headerLineHeight = 14;

  if (input.letterheadImage) {
    const { mime, bytes } = input.letterheadImage;
    const image =
      mime === "image/jpeg"
        ? await pdfDoc.embedJpg(bytes)
        : await pdfDoc.embedPng(bytes);
    const maxHeight = 90;
    const maxWidth = 140;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const headerStartX = marginX;
    const headerTopY = cursorY;
    page.drawImage(image, {
      x: headerStartX,
      y: headerTopY - imgHeight,
      width: imgWidth,
      height: imgHeight,
    });
    const textX = headerStartX + imgWidth + 16;
    let textY = headerTopY - 4;

    page.drawText(PRACTICE_INFO.name, {
      x: textX,
      y: textY,
      size: nameFontSize,
      font: serifBold,
      color: rgb(0, 0, 0),
    });
    textY -= nameFontSize + 4;
    page.drawText(PRACTICE_INFO.address, {
      x: textX,
      y: textY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: contentWidth - imgWidth - 20,
    });
    textY -= headerLineHeight;
    page.drawText(`Phone: ${PRACTICE_INFO.contact}`, {
      x: textX,
      y: textY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });
    textY -= headerLineHeight;
    page.drawText(PRACTICE_INFO.doctorLine, {
      x: textX,
      y: textY,
      size: doctorFontSize,
      font: serifBold,
      color: rgb(0, 0, 0),
    });
    textY -= headerLineHeight;
    page.drawText(PRACTICE_INFO.regNo, {
      x: textX,
      y: textY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });

    const headerHeight = Math.max(imgHeight, headerTopY - textY + 8);
    cursorY -= headerHeight + 6;
  } else {
    page.drawText(PRACTICE_INFO.name, {
      x: marginX,
      y: cursorY,
      size: nameFontSize,
      font: serifBold,
      color: rgb(0, 0, 0),
    });
    cursorY -= nameFontSize + 6;
    page.drawText(PRACTICE_INFO.address, {
      x: marginX,
      y: cursorY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= headerLineHeight;
    page.drawText(`Phone: ${PRACTICE_INFO.contact}`, {
      x: marginX,
      y: cursorY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= headerLineHeight;
    page.drawText(PRACTICE_INFO.doctorLine, {
      x: marginX,
      y: cursorY,
      size: doctorFontSize,
      font: serifBold,
      color: rgb(0, 0, 0),
    });
    cursorY -= headerLineHeight;
    page.drawText(PRACTICE_INFO.regNo, {
      x: marginX,
      y: cursorY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= 10;
  }
  page.drawLine({
    start: { x: marginX, y: cursorY },
    end: { x: width - marginX, y: cursorY },
    thickness: 1.6,
    color: rgb(0.1, 0.1, 0.1),
  });
  cursorY -= 18;

  const leftX = marginX;
  const columnGap = 20;
  const columnWidth = (contentWidth - columnGap) / 2;
  const rightX = marginX + columnWidth + columnGap;

  page.drawText(`Patient: ${input.patientName || "--"}`, {
    x: leftX,
    y: cursorY,
    size: 11,
    font: serifBold,
  });
  page.drawText(`DOB: ${input.dob || "--"}`, {
    x: rightX,
    y: cursorY,
    size: 11,
    font: serif,
  });
  cursorY -= 14;
  page.drawText(`Gender: ${input.gender || "--"}`, {
    x: leftX,
    y: cursorY,
    size: 11,
    font: serif,
  });
  cursorY -= 18;

  const columnTop = cursorY;
  let leftCursor = columnTop - 10;
  let rightCursor = columnTop;

  page.drawText("Brief History", {
    x: rightX,
    y: rightCursor,
    size: 11,
    font: serifBold,
  });
  rightCursor -= 14;
  const historyLines = wrapText(
    input.briefHistory || "--",
    serif,
    10.5,
    columnWidth
  );
  for (const line of historyLines) {
    page.drawText(line, {
      x: rightX,
      y: rightCursor,
      size: 10.5,
      font: serif,
    });
    rightCursor -= 12;
  }

  leftCursor -= 8;
  page.drawText("Rx", {
    x: leftX,
    y: leftCursor,
    size: 14,
    font: serifBold,
  });
  leftCursor -= 18;

  input.medications.forEach((medication, index) => {
    page.drawText(`${index + 1}. ${medication.name}`, {
      x: leftX,
      y: leftCursor,
      size: 11,
      font: serifBold,
    });
    leftCursor -= 14;

    const medLines = [
      medication.dosage ? `Dosage: ${medication.dosage}` : null,
      medication.frequency ? `Frequency: ${medication.frequency}` : null,
      medication.instructions
        ? `Instructions: ${medication.instructions}`
        : null,
    ].filter(Boolean) as string[];

    medLines.forEach((line) => {
      const wrapped = wrapText(line, serif, 10.5, columnWidth - 10);
      wrapped.forEach((wrappedLine) => {
        page.drawText(wrappedLine, {
          x: leftX + 10,
          y: leftCursor,
          size: 10.5,
          font: serif,
        });
        leftCursor -= 12;
      });
    });

    leftCursor -= 8;
  });

  if (input.lifestyleAdvice) {
    page.drawText("Lifestyle & Follow-up", {
      x: leftX,
      y: leftCursor,
      size: 11,
      font: serifBold,
    });
    leftCursor -= 14;
    const lifestyleLines = wrapText(
      input.lifestyleAdvice,
      serif,
      10.5,
      columnWidth
    );
    for (const line of lifestyleLines) {
      page.drawText(line, {
        x: leftX,
        y: leftCursor,
        size: 10.5,
        font: serif,
      });
      leftCursor -= 12;
    }
  }

  const dateText = `Date: ${new Date().toLocaleDateString("en-GB")}`;
  page.drawText(dateText, {
    x: marginX,
    y: marginBottom - 18,
    size: 10.5,
    font: serif,
  });
  page.drawText("Electronically signed", {
    x: marginX,
    y: marginBottom - 34,
    size: 9.5,
    font: serif,
    color: rgb(0.35, 0.35, 0.35),
  });

  const signatureX = width - marginX - 190;
  const signatureY = marginBottom - 14;
  page.drawText("Sneh Pandey", {
    x: signatureX,
    y: signatureY,
    size: 16,
    font: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
  });
  page.drawText(PRACTICE_INFO.doctorLine, {
    x: signatureX,
    y: signatureY - 18,
    size: 10.5,
    font: serif,
  });
  page.drawText(PRACTICE_INFO.regNo, {
    x: signatureX,
    y: signatureY - 32,
    size: 9.5,
    font: serif,
    color: rgb(0.2, 0.2, 0.2),
  });
  const footerLineY = marginBottom - 44;
  page.drawLine({
    start: { x: marginX, y: footerLineY },
    end: { x: width - marginX, y: footerLineY },
    thickness: 1.6,
    color: rgb(0, 0, 0),
  });

  return pdfDoc.save();
};
