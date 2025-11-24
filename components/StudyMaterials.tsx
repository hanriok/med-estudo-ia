
import React, { useCallback, useRef, useState } from 'react';
import { StudyMaterial, Language, View } from '../types';
import { translations } from '../lib/translations';
import { generateSummary } from '../services/geminiService';
import { ArrowLeftIcon, UploadCloudIcon, FileIcon, TrashIcon, PaperclipIcon, SparklesIcon, Loader2, XIcon, FileTextIcon, ImageIcon } from './icons';

interface StudyMaterialsProps {
  materials: StudyMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<StudyMaterial[]>>;
  language: Language;
  onNavigate: (view: View) => void;
}

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ materials, setMaterials, language, onNavigate }) => {
  const T = translations[language].materials;
  const commonT = translations[language].common;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ id: string, name: string, text: string } | null>(null);

  const processFile = (file: File) => {
    // Validate file type
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        alert("Only PNG, JPEG, and PDF files are supported.");
        return;
    }
    
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        // Strip the data:image/png;base64, part
        const base64Data = result.split(',')[1];
        
        const newMaterial: StudyMaterial = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            data: base64Data
        };
        setMaterials(prev => [...prev, newMaterial]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach(processFile);
    }
  };

  const handleDelete = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };
  
  const handleSummarize = async (material: StudyMaterial) => {
      setSummarizingId(material.id);
      try {
          const result = await generateSummary(material, language);
          setSummary({
              id: material.id,
              name: material.name,
              text: result
          });
      } catch (error) {
          console.error(error);
          alert("Failed to generate summary. Please try again.");
      } finally {
          setSummarizingId(null);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
        Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const getFileIcon = (mimeType: string) => {
      if (mimeType === 'application/pdf') {
          return <FileTextIcon className="w-5 h-5" />;
      }
      return <ImageIcon className="w-5 h-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12 relative">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 font-medium transition-opacity">
                <ArrowLeftIcon className="w-5 h-5" />
                {commonT.backButton}
            </button>
        </div>

        <h1 className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{T.title}</h1>
        <p className="mt-1 text-[#8E8E93] mb-8">{T.subtitle}</p>

        {/* Upload Area */}
        <div 
            className="border-2 border-dashed border-[#C7C7CC] rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-[#F2F2F7] transition-colors cursor-pointer bg-white"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf, .png, .jpg, .jpeg, image/png, image/jpeg, application/pdf"
                onChange={handleFileChange}
            />
            <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center text-[#007AFF] mb-4">
                <UploadCloudIcon className="w-8 h-8" />
            </div>
            <p className="text-lg font-semibold text-[#1C1C1E]">{T.uploadArea}</p>
            <p className="text-[#8E8E93] mt-2 text-sm">{T.uploadSubtext}</p>
        </div>

        {/* File List */}
        <div className="mt-10">
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-4 px-1">{T.uploadedFiles}</h2>
            {materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map(file => (
                        <div key={file.id} className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center justify-between group relative overflow-hidden">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-[#F2F2F7] rounded-xl flex items-center justify-center text-[#8E8E93] flex-shrink-0">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-[#1C1C1E] truncate">{file.name}</p>
                                    <p className="text-xs text-[#8E8E93] uppercase">{file.type.split('/')[1]}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleSummarize(file)}
                                    disabled={summarizingId === file.id}
                                    className="p-2 text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors flex items-center gap-1"
                                    title={T.summarizeButton}
                                >
                                    {summarizingId === file.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <SparklesIcon className="w-5 h-5" />
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleDelete(file.id)}
                                    className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors"
                                    title="Delete"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-[#F2F2F7] rounded-2xl border border-dashed border-[#C7C7CC]">
                    <PaperclipIcon className="w-8 h-8 text-[#C7C7CC] mx-auto mb-2" />
                    <p className="text-[#8E8E93] italic">{T.noFiles}</p>
                </div>
            )}
        </div>

        {/* Summary Modal */}
        {summary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-[#E5E5EA] flex items-center justify-between bg-[#F9F9F9]">
                        <div>
                             <h3 className="text-lg font-bold text-[#1C1C1E]">{T.summaryTitle}</h3>
                             <p className="text-sm text-[#8E8E93] truncate max-w-[300px]">{summary.name}</p>
                        </div>
                        <button 
                            onClick={() => setSummary(null)}
                            className="p-2 rounded-full hover:bg-[#E5E5EA] transition-colors text-[#8E8E93] hover:text-[#1C1C1E]"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <div className="prose prose-blue max-w-none text-[#1C1C1E] leading-relaxed whitespace-pre-line">
                            {summary.text}
                        </div>
                    </div>
                    <div className="p-4 border-t border-[#E5E5EA] flex justify-end">
                        <button 
                            onClick={() => setSummary(null)}
                            className="px-6 py-2.5 bg-[#007AFF] text-white font-semibold rounded-xl hover:bg-[#0062cc] transition-colors"
                        >
                            {T.closeButton}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default StudyMaterials;
