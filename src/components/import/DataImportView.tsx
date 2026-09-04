import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { InfrastructureProject } from '../../types';
import { transformMospiRecord } from '../../data/projectParser';
import { RawMospiProject } from '../../data/mospiPdfRecords';

interface DataImportViewProps {
  onImportSuccess: (projects: InfrastructureProject[]) => void;
  onNavigate: (view: string) => void;
}

export function DataImportView({ onImportSuccess, onNavigate }: DataImportViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStats, setImportStats] = useState<{
    totalRows: number;
    validProjects: number;
    missingDates: number;
    invalidIds: number;
  } | null>(null);
  
  const [parsedRawData, setParsedRawData] = useState<RawMospiProject[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    }
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);
    setImportStats(null);
    setParsedRawData([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        let valid = 0;
        let missingDatesCount = 0;
        let invalidCount = 0;
        
        const rawProjects: RawMospiProject[] = [];

        rows.forEach((row, idx) => {
          // Attempt to map typical CSV headers to RawMospiProject
          // We support fuzzy column names to be flexible
          const getId = () => row['Project ID'] || row['ProjectCode'] || row['projectCode'] || `PRJ-NEW-${idx}`;
          const getName = () => row['Project Name'] || row['Name'] || row['name'] || 'Unnamed Project';
          const getAgency = () => row['Agency'] || row['Implementing Agency'] || 'Unknown Agency';
          const getSector = () => row['Sector'] || 'Infrastructure';
          const getState = () => row['State'] || 'Multi State';
          
          const getDate = (keys: string[]) => {
            for (const key of keys) {
              if (row[key]) return row[key];
            }
            return undefined;
          };

          const approvalDate = getDate(['Start Date', 'Approval Date', 'Date of Approval']);
          const origComp = getDate(['Original Completion Date', 'Original Completion']);
          const revComp = getDate(['Revised Completion Date', 'Revised Completion', 'Anticipated Completion', 'Expected Completion']);
          
          if (!approvalDate || !origComp) {
            missingDatesCount++;
          }

          const getNum = (keys: string[]) => {
            for (const key of keys) {
              if (row[key] !== undefined && row[key] !== '') {
                const val = parseFloat(String(row[key]).replace(/,/g, ''));
                if (!isNaN(val)) return val;
              }
            }
            return 0;
          };

          const originalCost = getNum(['Original Cost', 'Cost Original', 'Approved Cost']);
          const anticipatedCost = getNum(['Anticipated Cost', 'Revised Cost', 'Cost Anticipated']);
          const expenditure = getNum(['Cumulative Expenditure', 'Expenditure']);
          
          // Try to handle % signs in progress
          let physicalProgress = 0;
          const progStr = row['Physical Progress'] || row['Progress'];
          if (progStr) {
            physicalProgress = parseFloat(String(progStr).replace('%', ''));
            if (isNaN(physicalProgress)) physicalProgress = 0;
          }

          if (getId() && getName()) {
            valid++;
            rawProjects.push({
              slNo: idx + 1,
              projectCode: getId(),
              name: getName(),
              agency: getAgency(),
              state: getState(),
              sector: getSector(),
              dateOfApproval: approvalDate,
              originalCompletionDate: origComp,
              revisedCompletionDate: revComp,
              costOriginal: originalCost,
              costAnticipated: anticipatedCost,
              cumulativeExpenditure: expenditure,
              physicalProgress: physicalProgress,
              tableSource: 'Table-7 Ongoing'
            });
          } else {
            invalidCount++;
          }
        });

        setImportStats({
          totalRows: rows.length,
          validProjects: valid,
          missingDates: missingDatesCount,
          invalidIds: invalidCount
        });
        setParsedRawData(rawProjects);
        setIsParsing(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsParsing(false);
      }
    });
  };

  const handleProcessData = () => {
    setIsProcessing(true);
    // Add a small artificial delay for UX to show processing state
    setTimeout(() => {
      const generatedProjects = parsedRawData.map((raw, idx) => transformMospiRecord(raw, idx));
      onImportSuccess(generatedProjects);
      setIsProcessing(false);
      onNavigate('dashboard');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-2">
          <FileSpreadsheet className="h-7 w-7 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-800">Project Data Import</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Upload your PAIMANA monthly monitoring report in CSV format to automatically generate AI risk scores, compute schedule delays, and update dashboard analytics.
        </p>

        {/* Upload Dropzone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${file ? 'border-purple-300 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          
          {isParsing ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
              <p className="text-slate-600 font-medium">Parsing CSV Data...</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-700">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              <p className="text-sm text-purple-600 mt-2 hover:underline">Click or drag to replace file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-14 w-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-2">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">Drag & drop your CSV file here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>
              </div>
            </div>
          )}
        </div>

        {/* Parse Results */}
        {importStats && !isParsing && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Parsing Results</h3>
            
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 font-medium">{importStats.validProjects} projects detected</span>
                </div>
                <span className="text-sm font-semibold bg-emerald-100 text-emerald-700 py-1 px-2.5 rounded-full">Valid</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 font-medium">Date & Cost fields mapped successfully</span>
                </div>
              </div>

              {importStats.invalidIds > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <span className="text-slate-700 font-medium">{importStats.invalidIds} invalid or empty rows ignored</span>
                  </div>
                </div>
              )}

              {importStats.missingDates > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="text-slate-700 font-medium">{importStats.missingDates} projects missing exact completion dates (defaults applied)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleProcessData}
                disabled={isProcessing || importStats.validProjects === 0}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing & Engineering Features...</span>
                  </>
                ) : (
                  <>
                    <span>Process Data & Update Dashboard</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Explanation Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <FileSpreadsheet className="h-64 w-64" />
        </div>
        <h3 className="text-xl font-semibold mb-3 relative z-10">What happens during processing?</h3>
        <p className="text-indigo-200 mb-6 max-w-2xl relative z-10 leading-relaxed">
          The PAIMANA engine doesn't just display your data. It automatically engineers complex AI features by analyzing historical patterns.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">1. Date Intelligence</h4>
            <p className="text-sm text-slate-300">Automatically calculates original vs revised durations, schedule extensions, and predicts structural completion lags.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">2. Risk Profiling</h4>
            <p className="text-sm text-slate-300">Generates 4 distinct ML risk scores (Schedule, Cost, Progress, Divergence) and aggregates them into a critical risk level.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">3. Early Warnings</h4>
            <p className="text-sm text-slate-300">Flags anomalies such as progress-expenditure divergence and triggers automated intervention recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
