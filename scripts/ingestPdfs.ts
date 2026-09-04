import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'projectdate');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'extractedMospiRecords.json');

// Get Gemini Client
function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

const ai = getGeminiClient();

async function extractTextFromPdf(pdfPath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  try {
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${pdfPath}:`, error);
    return '';
  }
}

const SYSTEM_PROMPT = `
You are a data extraction assistant. Your job is to extract infrastructure project data from the provided text, which is parsed from a MoSPI Flash Report PDF.
Extract the data into a JSON array of objects matching the following TypeScript interface exactly:

export interface RawMospiProject {
  slNo: number;
  projectCode: string; // Typically starting with N or a number
  name: string; // The project name
  agency: string; // Implementing agency
  ministry?: string; // Ministry
  state: string; // The State or "Multi State"
  sector: string; // The Sector (e.g. "Road Transport & Highways", "Power", "Railways")
  dateOfApproval?: string; // Date of Approval (e.g. MM/YYYY or DD/MM/YYYY)
  originalCompletionDate?: string; // Original / Target Date of Completion
  revisedCompletionDate?: string; // Revised Date of Completion
  costOriginal: number; // in ₹ Cr (Original Cost)
  costRevised?: number; // in ₹ Cr (Revised Cost if available, else omit)
  costAnticipated: number; // in ₹ Cr (Anticipated Cost)
  cumulativeExpenditure: number; // in ₹ Cr (Cumulative Expenditure)
  physicalProgress: number; // percentage (0 to 100)
  tableSource: 'Table-3 Completed' | 'Table-4 Added' | 'Table-5 Dropped' | 'Table-6 North-East' | 'Table-7 Ongoing'; // Classify as best as possible, default to 'Table-7 Ongoing'
}

Return ONLY a valid JSON array. Do not include markdown formatting like \`\`\`json.
If the text is too large or contains multiple tables, try to extract at least 5-10 key projects.
`;

async function processPdf(pdfPath: string): Promise<any[]> {
  console.log(`\n📄 Processing ${path.basename(pdfPath)}...`);
  const text = await extractTextFromPdf(pdfPath);
  
  if (!text) {
    console.log(`Failed to extract text from ${pdfPath}`);
    return [];
  }

  // To avoid hitting context limits, we might only take the first chunk or let the model handle it.
  // We'll limit the text to ~100k characters for the prompt to be safe.
  const truncatedText = text.substring(0, 100000);
  
  console.log(`🤖 Extracted ${text.length} characters (Sending ${truncatedText.length} characters to Gemini).`);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nPDF Text Content:\n${truncatedText}` }] }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    if (!responseText) return [];
    
    try {
      const parsed = JSON.parse(responseText.trim());
      if (Array.isArray(parsed)) {
        console.log(`✅ Extracted ${parsed.length} projects successfully.`);
        return parsed;
      }
    } catch (parseError) {
      console.error(`Error parsing Gemini JSON response for ${pdfPath}:`, parseError);
      console.log('Raw response:', responseText);
    }
  } catch (error) {
    console.error(`Error communicating with Gemini API for ${pdfPath}:`, error);
  }
  
  return [];
}

async function main() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`Directory not found: ${PDF_DIR}`);
    return;
  }

  const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${files.length} PDF files in ${PDF_DIR}`);

  let allProjects: any[] = [];
  
  // Process all files as requested by user
  const processAll = true;
  const filesToProcess = processAll ? files : files.slice(0, 1);
  
  if (!processAll) {
    console.log(`⚠️ Processing only the first file (${filesToProcess[0]}) as a proof-of-concept.`);
    console.log(`⚠️ Run with 'npm run ingest -- --all' to process all files (takes much longer).`);
  }

  for (const file of filesToProcess) {
    const pdfPath = path.join(PDF_DIR, file);
    const projects = await processPdf(pdfPath);
    allProjects = allProjects.concat(projects);
  }

  if (allProjects.length > 0) {
    // If we already have some in the JSON, we might want to append, but for this demo we just overwrite
    // Or if processAll is false, we might not want to overwrite existing if it has more. 
    // We will just write it.
    
    // Validate and clean up
    const cleanProjects = allProjects.map((p, index) => {
      // Ensure all fields are present
      return {
        slNo: p.slNo || index + 1,
        projectCode: p.projectCode || `N-GEN-${Math.floor(Math.random() * 10000)}`,
        name: p.name || 'Unknown Project',
        agency: p.agency || 'Unknown',
        ministry: p.ministry || '',
        state: p.state || 'Multi State',
        sector: p.sector || 'Miscellaneous',
        dateOfApproval: p.dateOfApproval || '',
        originalCompletionDate: p.originalCompletionDate || '',
        revisedCompletionDate: p.revisedCompletionDate || '',
        costOriginal: Number(p.costOriginal) || 0,
        costRevised: p.costRevised ? Number(p.costRevised) : undefined,
        costAnticipated: Number(p.costAnticipated) || 0,
        cumulativeExpenditure: Number(p.cumulativeExpenditure) || 0,
        physicalProgress: Number(p.physicalProgress) || 0,
        tableSource: p.tableSource || 'Table-7 Ongoing'
      };
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanProjects, null, 2), 'utf-8');
    console.log(`\n🎉 Successfully saved ${cleanProjects.length} projects to ${OUTPUT_FILE}`);
  } else {
    console.log('\n❌ No projects were extracted.');
  }
}

main().catch(console.error);
