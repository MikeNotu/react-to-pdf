import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
} from "../constants/letterPage";
import { savePdfWithPicker } from "./savePdf";

const waitForPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

export async function captureLetterPageElement(
  element: HTMLElement,
): Promise<string> {
  await waitForPaint();

  const canvas = await html2canvas(element, {
    scale: 2,
    width: LETTER_WIDTH_PX,
    height: LETTER_HEIGHT_PX,
    windowWidth: LETTER_WIDTH_PX,
    windowHeight: LETTER_HEIGHT_PX,
  });

  return canvas.toDataURL("image/png");
}

function addImageToPdf(pdf: jsPDF, data: string) {
  const imgProperties = pdf.getImageProperties(data);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
  pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
}

export async function exportLetterPageToPdf(
  element: HTMLElement,
  filename: string,
) {
  const data = await captureLetterPageElement(element);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: "letter",
  });
  addImageToPdf(pdf, data);
  await savePdfWithPicker(pdf.output("blob"), filename);
}

export async function exportLetterPagesFromDataUrls(
  pageDataUrls: string[],
  filename: string,
) {
  if (pageDataUrls.length === 0) return;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: "letter",
  });

  for (const [index, data] of pageDataUrls.entries()) {
    if (index > 0) {
      pdf.addPage("letter", "portrait");
    }
    addImageToPdf(pdf, data);
  }

  await savePdfWithPicker(pdf.output("blob"), filename);
}

export async function exportLetterPagesToPdf(
  elements: HTMLElement[],
  filename: string,
) {
  const pageDataUrls: string[] = [];
  for (const element of elements) {
    pageDataUrls.push(await captureLetterPageElement(element));
  }
  await exportLetterPagesFromDataUrls(pageDataUrls, filename);
}
