import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

async function renderPdfPageToDataUrl(
  pdf: pdfjs.PDFDocumentProxy,
  pageNumber: number,
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to render PDF page.");
  }
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL("image/png");
}

export async function renderPdfFirstPageToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  return renderPdfPageToDataUrl(pdf, 1);
}

export async function renderPdfPagesToDataUrls(file: File): Promise<string[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  return Promise.all(pages.map((pageNumber) => renderPdfPageToDataUrl(pdf, pageNumber)));
}
