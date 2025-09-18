import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  taskCount: number;
  showTasksAnimation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ taskCount, showTasksAnimation }) => {
  const location = useLocation();

  return (
    <nav className="bg-black border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                DueList
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'text-white bg-blue-600/20 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/tasks"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                location.pathname === '/tasks'
                  ? 'text-white bg-blue-600/20 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              } ${showTasksAnimation ? 'animate-pulse' : ''}`}
            >
              Tasks
              {taskCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {taskCount > 99 ? '99+' : taskCount}
                </span>
              )}
              {showTasksAnimation && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-md animate-ping"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};