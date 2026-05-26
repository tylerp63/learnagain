import { extractTextFromPdf } from "./pdf-parser";
import { extractTextFromDocx } from "./docx-parser";

export async function parseFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return extractTextFromDocx(file);
  }

  throw new Error(
    "Unsupported file type. Please upload a PDF or DOCX file."
  );
}
