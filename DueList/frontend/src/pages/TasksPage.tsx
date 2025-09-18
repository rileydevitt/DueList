import React from 'react';
import { Task } from '../types/Task';
import { TaskList } from '../components/TaskList';

interface TasksPageProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {tasks.length > 0 ? (
            <TaskList tasks={tasks} onTaskUpdate={onTaskUpdate} onTaskDelete={onTaskDelete} />
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">No tasks yet</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
                Upload a document to get started with your organized task list.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Document
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};