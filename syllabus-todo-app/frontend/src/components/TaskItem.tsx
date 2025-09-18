import React, { useState } from 'react';
import { Task } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
  index?: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete, index = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    due_date: task.due_date,
    description: task.description
  });

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = () => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && !task.completed;
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleToggleComplete = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const handleSave = () => {
    onUpdate({ ...task, ...editedTask });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div className={`group relative border-b border-gray-700/30 hover:bg-gray-700/20 transition-all duration-300 ${task.completed ? 'opacity-60' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <button onClick={handleToggleComplete} className={`relative mt-2 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 hover:scale-110 ${task.completed ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 shadow-lg shadow-green-500/25' : 'border-gray-500 hover:border-blue-400 bg-transparent'}`}>
            {task.completed && (
              <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <input type="text" value={editedTask.title} onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Task title" />
                <input type="date" value={editedTask.due_date} onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })} className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <textarea value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} placeholder="Description (optional)" rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <div className="flex space-x-3">
                  <button onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">Save Changes</button>
                  <button onClick={() => { setEditedTask({ title: task.title, due_date: task.due_date, description: task.description }); setIsEditing(false); }} className="px-6 py-2 bg-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-xl font-semibold transition-all duration-300 ${task.completed ? 'text-gray-400 line-through' : 'text-white group-hover:text-blue-300'}`}>{task.title}</h3>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded-lg transition-all duration-300" title="Edit task">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-all duration-300" title="Delete task">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className={`text-sm font-medium ${isOverdue() ? 'text-red-400' : daysUntilDue === 0 ? 'text-orange-400' : daysUntilDue <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>{formatDate(task.due_date)}</span>
                  </div>
                  {!task.completed && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${isOverdue() ? 'bg-red-500/20 text-red-300 border border-red-500/30' : daysUntilDue === 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : daysUntilDue <= 3 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                      {isOverdue() ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue` : daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left`}
                    </span>
                  )}
                </div>
                {task.description && <p className={`text-sm leading-relaxed ${task.completed ? 'text-gray-500' : 'text-gray-300'}`}>{task.description}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`absolute left-0 top-0 w-1 h-full transition-all duration-300 ${task.completed ? 'bg-green-500' : isOverdue() ? 'bg-red-500 opacity-100' : daysUntilDue <= 3 ? 'bg-yellow-500 opacity-0 group-hover:opacity-100' : 'bg-blue-500 opacity-0 group-hover:opacity-100'}`}></div>
    </div>
  );
};