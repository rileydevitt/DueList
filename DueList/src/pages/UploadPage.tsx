import React from 'react';
import { Task } from '../types/Task';
import { FileUpload } from '../components/FileUpload';

interface UploadPageProps {
  onFileProcessed: (tasks: Task[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onFileProcessed, isLoading, setIsLoading }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
              Transform your<br />documents into action
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
              Upload any document and let AI instantly convert it into an organized, actionable to-do list.
              Never miss another assignment or deadline.
            </p>
            <div className="max-w-4xl mx-auto mb-16">
              <FileUpload onFileProcessed={onFileProcessed} isLoading={isLoading} setIsLoading={setIsLoading} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};