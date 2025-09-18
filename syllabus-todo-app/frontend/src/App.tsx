import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Task } from './types/Task';
import { Navbar } from './components/Navbar';
import { UploadPage } from './pages/UploadPage';
import { TasksPage } from './pages/TasksPage';
import { localStorageService } from './services/localStorage';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTasksAnimation, setShowTasksAnimation] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadTasks = () => {
      try {
        const storedTasks = localStorageService.getTasks();
        setTasks(storedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorageService.saveTasks(tasks);
  }, [tasks]);

  const handleFileProcessed = async (newTasks: Task[]) => {
    // Add new tasks with unique IDs
    const tasksWithIds = newTasks.map(task => ({
      ...task,
      id: task.id || Date.now() + Math.random(), // Ensure unique ID
    }));

    setTasks(prevTasks => [...prevTasks, ...tasksWithIds]);

    // Trigger animation on Tasks nav item
    setShowTasksAnimation(true);
    setTimeout(() => setShowTasksAnimation(false), 3000);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleTaskDelete = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navbar
          taskCount={tasks.length}
          showTasksAnimation={showTasksAnimation}
        />

        <Routes>
          <Route
            path="/"
            element={
              <UploadPage
                onFileProcessed={handleFileProcessed}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TasksPage
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;