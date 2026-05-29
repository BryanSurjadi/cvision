import fs from "fs";

const pdfParse = require('pdf-parse')


export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text;
  return text
}