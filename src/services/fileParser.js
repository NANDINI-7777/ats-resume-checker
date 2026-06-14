/**
 * Client-side resume file parser.
 * Uses pdfjs-dist for PDFs and mammoth for DOCX files.
 */

// Import worker URL at build time so Vite bundles it correctly
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const MAX_MB = 5;

/**
 * Extract text from a PDF File object using pdfjs-dist
 */
export async function extractTextFromPDF(file) {
  const pdfjsLib = await import("pdfjs-dist");

  // Use the locally bundled worker (avoids CDN fetch failures)
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item) => item.str)
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

/**
 * Extract text from a DOCX File object using mammoth
 */
export async function extractTextFromDOCX(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Main file parser — routes based on file extension / MIME type
 */
export async function parseResumeFile(file) {
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`File size exceeds ${MAX_MB}MB. Please upload a smaller file.`);
  }

  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return await extractTextFromPDF(file);
  }

  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractTextFromDOCX(file);
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}
