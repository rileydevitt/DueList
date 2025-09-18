import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Task } from '../types/Task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks.map(task => ({
      Title: task.title,
      'Due Date': task.due_date,
      Description: task.description,
      Status: task.completed ? 'Completed' : 'Pending',
      'Created At': new Date(task.created_at).toLocaleDateString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'tasks.xlsx');
  };

  const exportToCalendar = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const calendarEvents = tasks.filter(task => !task.completed).map(task => {
      const dueDate = formatDate(task.due_date);
      return ['BEGIN:VEVENT', `DTSTART:${dueDate}`, `DTEND:${dueDate}`, `SUMMARY:${task.title}`, `DESCRIPTION:${task.description}`, `UID:task-${task.id}@duelist.app`, 'END:VEVENT'].join('\\r\\n');
    }).join('\\r\\n');
    const icalContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DueList//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', calendarEvents, 'END:VCALENDAR'].join('\\r\\n');
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, 'tasks.ics');
  };

  const exportToGoogleCalendar = () => {
    const pendingTasks = tasks.filter(task => !task.completed);
    if (pendingTasks.length === 0) {
      alert('No pending tasks to export to Google Calendar');
      return;
    }
    exportToCalendar();
    setTimeout(() => {
      alert('iCal file downloaded! To import to Google Calendar:\\n\\n1. Go to calendar.google.com\\n2. Click the "+" next to "Other calendars"\\n3. Select "Import"\\n4. Choose the downloaded tasks.ics file\\n5. Click "Import"');
    }, 500);
  };

  const exportToOutlook = () => {
    const pendingTasks = tasks.filter(task => !task.completed);
    if (pendingTasks.length === 0) {
      alert('No pending tasks to export to Outlook');
      return;
    }
    exportToCalendar();
    setTimeout(() => {
      alert('iCal file downloaded! To import to Outlook:\\n\\n1. Open Outlook\\n2. Go to File > Open & Export > Import/Export\\n3. Select "Import an iCalendar (.ics) or vCalendar file (.vcs)"\\n4. Choose the downloaded tasks.ics file\\n5. Click "Import"');
    }, 500);
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      default: return true;
    }
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const pendingCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Tasks</h2>
              <p className="text-gray-400">{pendingCount} pending • {completedCount} completed</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={exportToExcel} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Excel</span>
                </button>
                <button onClick={exportToGoogleCalendar} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Google</span>
                </button>
                <button onClick={exportToOutlook} className="px-3 py-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Outlook</span>
                </button>
                <button onClick={exportToCalendar} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Apple Calendar</span>
                </button>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%</div>
                <div className="text-sm text-gray-400">Complete</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}></div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setFilter('all')} className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>All Tasks ({tasks.length})</button>
            <button onClick={() => setFilter('pending')} className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 ${filter === 'pending' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/25' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>Pending ({pendingCount})</button>
            <button onClick={() => setFilter('completed')} className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 ${filter === 'completed' ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>Completed ({completedCount})</button>
          </div>
        </div>
        <div className="space-y-0">
          {sortedTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{filter === 'all' && 'No tasks found'}{filter === 'pending' && 'No pending tasks'}{filter === 'completed' && 'No completed tasks'}</h3>
              <p className="text-gray-400">{filter === 'all' && 'Upload a document to get started'}{filter === 'pending' && 'Great job! All tasks are completed'}{filter === 'completed' && 'Complete some tasks to see them here'}</p>
            </div>
          ) : (
            sortedTasks.map((task, index) => <TaskItem key={task.id} task={task} onUpdate={onTaskUpdate} onDelete={onTaskDelete} index={index} />)
          )}
        </div>
      </div>
    </div>
  );
};