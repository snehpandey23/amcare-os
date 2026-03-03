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
  signatureImage: LetterheadImage | null;
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

const sanitizeText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, "").trim();

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const centeredX = (
  text: string,
  font: PDFFont,
  fontSize: number,
  pageWidth: number
) => (pageWidth - font.widthOfTextAtSize(text, fontSize)) / 2;

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
  const minContentBottom = marginBottom + 80;

  let cursorY = height - marginTop;

  const nameFontSize = 30;
  const doctorFontSize = Math.round(nameFontSize * 0.75);
  const headerLineHeight = 19;

  const safePractice = {
    name: sanitizeText(PRACTICE_INFO.name),
    address: sanitizeText(PRACTICE_INFO.address),
    contact: sanitizeText(PRACTICE_INFO.contact),
    doctorLine: sanitizeText(PRACTICE_INFO.doctorLine),
    regNo: sanitizeText(PRACTICE_INFO.regNo),
  };

  if (input.letterheadImage) {
    const { mime, bytes } = input.letterheadImage;
    let image = null as Awaited<ReturnType<typeof pdfDoc.embedPng>> | null;
    try {
      if (mime.includes("jpeg") || mime.includes("jpg")) {
        image = await pdfDoc.embedJpg(bytes);
      } else {
        image = await pdfDoc.embedPng(bytes);
      }
    } catch {
      image = null;
    }

    if (image) {
      const maxHeight = 120;
      const maxWidth = 200;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
      const imgWidth = clamp(image.width * scale, 60, maxWidth);
      const imgHeight = clamp(image.height * scale, 40, maxHeight);
      const headerStartX = (width - imgWidth) / 2;
      const headerTopY = cursorY;
      page.drawImage(image, {
        x: headerStartX,
        y: headerTopY - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });
      let textY = headerTopY - imgHeight - 6;

      page.drawText(safePractice.name, {
        x: centeredX(safePractice.name, serifBold, nameFontSize, width),
        y: textY,
        size: nameFontSize,
        font: serifBold,
        color: rgb(0, 0, 0),
      });
      textY -= nameFontSize + 12;
      const addressLines = wrapText(safePractice.address, serif, 10.5, contentWidth);
      addressLines.forEach((line) => {
        page.drawText(line, {
          x: centeredX(line, serif, 10.5, width),
          y: textY,
          size: 10.5,
          font: serif,
          color: rgb(0.2, 0.2, 0.2),
        });
        textY -= headerLineHeight;
      });
      page.drawText(`Contact: ${safePractice.contact}`, {
        x: centeredX(
          `Contact: ${safePractice.contact}`,
          serif,
          10.5,
          width
        ),
        y: textY,
        size: 10.5,
        font: serif,
        color: rgb(0.2, 0.2, 0.2),
      });
      textY -= headerLineHeight + 4;
      page.drawText(safePractice.doctorLine, {
        x: centeredX(safePractice.doctorLine, serifBold, doctorFontSize, width),
        y: textY,
        size: doctorFontSize,
        font: serifBold,
        color: rgb(0, 0, 0),
      });
      textY -= headerLineHeight;
      page.drawText(safePractice.regNo, {
        x: centeredX(safePractice.regNo, serif, 10.5, width),
        y: textY,
        size: 10.5,
        font: serif,
        color: rgb(0.2, 0.2, 0.2),
      });

      const headerHeight = imgHeight + (headerTopY - textY) + 18;
      cursorY -= headerHeight + 2;
    } else {
      input.letterheadImage = null;
    }
  }

  if (!input.letterheadImage) {
    page.drawText(safePractice.name, {
      x: centeredX(safePractice.name, serifBold, nameFontSize, width),
      y: cursorY,
      size: nameFontSize,
      font: serifBold,
      color: rgb(0, 0, 0),
    });
    cursorY -= nameFontSize + 12;
    const addressLines = wrapText(
      safePractice.address,
      serif,
      10.5,
      contentWidth
    );
    addressLines.forEach((line) => {
      page.drawText(line, {
        x: centeredX(line, serif, 10.5, width),
        y: cursorY,
        size: 10.5,
        font: serif,
        color: rgb(0.2, 0.2, 0.2),
      });
      cursorY -= headerLineHeight;
    });
    page.drawText(`Contact: ${safePractice.contact}`, {
      x: centeredX(
        `Contact: ${safePractice.contact}`,
        serif,
        10.5,
        width
      ),
      y: cursorY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= headerLineHeight + 4;
    page.drawText(safePractice.doctorLine, {
      x: centeredX(safePractice.doctorLine, serifBold, doctorFontSize, width),
      y: cursorY,
      size: doctorFontSize,
      font: serifBold,
      color: rgb(0, 0, 0),
    });
    cursorY -= headerLineHeight;
    page.drawText(safePractice.regNo, {
      x: centeredX(safePractice.regNo, serif, 10.5, width),
      y: cursorY,
      size: 10.5,
      font: serif,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= 6;
  }
  page.drawLine({
    start: { x: marginX, y: cursorY },
    end: { x: width - marginX, y: cursorY },
    thickness: 1.6,
    color: rgb(0.1, 0.1, 0.1),
  });
  cursorY -= 12;

  const leftX = marginX;
  const safePatientName = sanitizeText(input.patientName || "--");
  const safeDob = sanitizeText(input.dob || "--");
  const safeGender = sanitizeText(input.gender || "--");

  page.drawText(`Patient: ${safePatientName || "--"}`, {
    x: leftX,
    y: cursorY,
    size: 11,
    font: serifBold,
  });
  page.drawText(`DOB: ${safeDob || "--"}`, {
    x: leftX + 260,
    y: cursorY,
    size: 11,
    font: serif,
  });
  cursorY -= 14;
  page.drawText(`Gender: ${safeGender || "--"}`, {
    x: leftX,
    y: cursorY,
    size: 11,
    font: serif,
  });
  cursorY -= 18;

  page.drawText("Brief History", {
    x: leftX,
    y: cursorY,
    size: 11,
    font: serifBold,
  });
  cursorY -= 14;
  const historyLines = wrapText(
    sanitizeText(input.briefHistory || "--"),
    serif,
    10.5,
    contentWidth
  );
  for (const line of historyLines) {
    if (cursorY <= minContentBottom) break;
    page.drawText(line, {
      x: leftX,
      y: cursorY,
      size: 10.5,
      font: serif,
    });
    cursorY -= 12;
  }

  cursorY -= 10;
  page.drawText("Rx", {
    x: leftX,
    y: cursorY,
    size: 14,
    font: serifBold,
  });
  cursorY -= 18;

  input.medications.forEach((medication, index) => {
    if (cursorY <= minContentBottom) return;
    const safeMedName = sanitizeText(medication.name || "");
    const safeDosage = sanitizeText(medication.dosage || "");
    const safeFrequency = sanitizeText(medication.frequency || "");
    const safeInstructions = sanitizeText(medication.instructions || "");

    page.drawText(`${index + 1}. ${safeMedName || "--"}`, {
      x: leftX,
      y: cursorY,
      size: 11,
      font: serifBold,
    });
    cursorY -= 14;

    const medLines = [
      safeDosage ? `Dosage: ${safeDosage}` : null,
      safeFrequency ? `Frequency: ${safeFrequency}` : null,
      safeInstructions ? `Instructions: ${safeInstructions}` : null,
    ].filter(Boolean) as string[];

    medLines.forEach((line) => {
      const wrapped = wrapText(line, serif, 10.5, contentWidth - 10);
      wrapped.forEach((wrappedLine) => {
        if (cursorY <= minContentBottom) return;
        page.drawText(wrappedLine, {
          x: leftX + 10,
          y: cursorY,
          size: 10.5,
          font: serif,
        });
        cursorY -= 12;
      });
    });

    cursorY -= 8;
  });

  if (input.lifestyleAdvice) {
    page.drawText("Lifestyle & Follow-up", {
      x: leftX,
      y: cursorY,
      size: 11,
      font: serifBold,
    });
    cursorY -= 14;
    const lifestyleLines = wrapText(
      sanitizeText(input.lifestyleAdvice),
      serif,
      10.5,
      contentWidth
    );
    for (const line of lifestyleLines) {
      if (cursorY <= minContentBottom) break;
      page.drawText(line, {
        x: leftX,
        y: cursorY,
        size: 10.5,
        font: serif,
      });
      cursorY -= 12;
    }
  }

  const dateText = `Date: ${new Date().toLocaleDateString("en-GB")}`;
  page.drawText(dateText, {
    x: marginX,
    y: marginBottom + 16,
    size: 10.5,
    font: serif,
  });
  page.drawText("Electronically signed", {
    x: marginX,
    y: marginBottom + 2,
    size: 9.5,
    font: serif,
    color: rgb(0.35, 0.35, 0.35),
  });

  const signatureX = width - marginX - 190;
  const signatureY = marginBottom + 30;
  let signatureDrawn = false;

  if (input.signatureImage) {
    const { mime, bytes } = input.signatureImage;
    try {
      const sigImage =
        mime.includes("jpeg") || mime.includes("jpg")
          ? await pdfDoc.embedJpg(bytes)
          : await pdfDoc.embedPng(bytes);
      const sigMaxWidth = 160;
      const sigMaxHeight = 40;
      const sigScale = Math.min(
        sigMaxWidth / sigImage.width,
        sigMaxHeight / sigImage.height
      );
      const sigWidth = sigImage.width * sigScale;
      const sigHeight = sigImage.height * sigScale;
      page.drawImage(sigImage, {
        x: signatureX,
        y: signatureY - sigHeight + 12,
        width: sigWidth,
        height: sigHeight,
      });
      signatureDrawn = true;
    } catch {
      signatureDrawn = false;
    }
  }

  if (!signatureDrawn) {
    page.drawText("Sneh Pandey", {
      x: signatureX,
      y: signatureY,
      size: 16,
      font: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    });
  }

  page.drawText(safePractice.doctorLine, {
    x: signatureX,
    y: signatureY - 30,
    size: 10.5,
    font: serif,
  });
  page.drawText(safePractice.regNo, {
    x: signatureX,
    y: signatureY - 44,
    size: 9.5,
    font: serif,
    color: rgb(0.2, 0.2, 0.2),
  });
  const footerLineY = marginBottom - 40;
  page.drawLine({
    start: { x: marginX, y: footerLineY },
    end: { x: width - marginX, y: footerLineY },
    thickness: 1.6,
    color: rgb(0, 0, 0),
  });

  return pdfDoc.save();
};
