import React, { useState, useRef } from 'react';
import { Task } from '../types/Task';
import { API_ENDPOINTS } from '../config/api';

interface FileUploadProps {
  onFileProcessed: (tasks: Task[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setError(null);
    setUploadSuccess(false);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('syllabus', file);
      const response = await fetch(API_ENDPOINTS.UPLOAD_DOCUMENT, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }
      const data = await response.json();
      onFileProcessed(data.tasks);
      setUploadSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8" id="upload">
      <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 backdrop-blur-sm ${dragActive ? 'border-blue-400 bg-blue-500/10 scale-105' : isLoading ? 'border-blue-300 bg-gray-900/50' : uploadSuccess ? 'border-green-400 bg-green-500/10' : 'border-gray-600 bg-gray-900/30 hover:border-blue-500 hover:bg-gray-900/50'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        <input ref={fileInputRef} type="file" multiple={false} className="hidden" onChange={(e) => handleFiles(e.target.files)} accept=".pdf,.docx,.txt" disabled={isLoading} />
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mb-6"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Processing your document...</h3>
            <p className="text-gray-300">AI is extracting assignments and deadlines</p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-gray-300 mb-4">Your document has been processed</p>
            <button onClick={() => { setUploadSuccess(false); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">Upload Another Document</button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Drop your document here</h3>
            <p className="text-lg text-gray-300 mb-8 max-w-md">Upload documents and watch AI transform them into an organized task list</p>
            <button onClick={() => fileInputRef.current?.click()} className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Choose File
              <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>
            <p className="text-sm text-gray-400 mt-4">Supports PDF, DOCX, and TXT files up to 10MB</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-6 p-6 bg-red-900/50 border border-red-500/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            </div>
            <div className="ml-3">
              <h4 className="text-red-300 font-medium">Upload Error</h4>
              <p className="text-red-200 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};