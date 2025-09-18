import { Task } from '../types/Task';

const STORAGE_KEY = 'duelist_tasks';

export const localStorageService = {
  // Get all tasks from localStorage
  getTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const tasks = JSON.parse(stored);
      // Ensure tasks is an array
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  },

  // Save all tasks to localStorage
  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  },

  // Add a new task
  addTask: (task: Omit<Task, 'id'>): Task => {
    const tasks = localStorageService.getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now(), // Simple ID generation using timestamp
    };
    tasks.push(newTask);
    localStorageService.saveTasks(tasks);
    return newTask;
  },

  // Update an existing task
  updateTask: (id: number, updates: Partial<Task>): Task | null => {
    const tasks = localStorageService.getTasks();
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) return null;

    tasks[index] = { ...tasks[index], ...updates };
    localStorageService.saveTasks(tasks);
    return tasks[index];
  },

  // Delete a task
  deleteTask: (id: number): boolean => {
    const tasks = localStorageService.getTasks();
    const filtered = tasks.filter(task => task.id !== id);

    if (filtered.length === tasks.length) return false;

    localStorageService.saveTasks(filtered);
    return true;
  },

  // Clear all tasks
  clearAllTasks: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Check if localStorage is available
  isAvailable: (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};