const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// File upload configuration
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Supabase (or use in-memory storage for testing)
let supabase = null;
let inMemoryTasks = [];
let taskIdCounter = 1;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_URL !== 'your_supabase_project_url_here') {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log('Using Supabase database');
} else {
  console.log('Using in-memory storage (for testing without Supabase)');
}

// Helper function to extract text from different file types
async function extractTextFromFile(file) {
  const { buffer, mimetype } = file;

  try {
    switch (mimetype) {
      case 'application/pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxData = await mammoth.extractRawText({ buffer });
        return docxData.value;

      case 'text/plain':
        return buffer.toString('utf-8');

      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Helper function to process text with Gemini (with retry logic)
async function extractTasksFromText(text) {
  const prompt = `You are given the text of a college syllabus.
Extract all assignments, quizzes, exams, and projects with their due dates.
Return the result as JSON in this format:
[
  {
    "title": "Assignment 1",
    "due_date": "2025-09-25",
    "description": "Read chapters 1-3 and submit reflection"
  }
]

Important:
- Only include items with clear due dates
- Format dates as YYYY-MM-DD
- Extract concise, descriptive titles
- Include brief descriptions when available
- If no year is specified, assume 2025
- Return ONLY the JSON array, no additional text or formatting

Syllabus text:
${text}`;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Clean up the response to ensure it's valid JSON
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();

      return JSON.parse(cleanContent);
    } catch (error) {
      lastError = error;
      console.log(`Gemini API attempt ${attempt} failed:`, error.message);

      // Check if it's a rate limit or overload error
      if (error.message.includes('overloaded') || error.message.includes('503') ||
          error.message.includes('429') || error.message.includes('rate limit')) {

        if (attempt < maxRetries) {
          // Exponential backoff: wait 2^attempt seconds
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // If it's not a retryable error, throw immediately
      throw new Error(`Failed to process with Gemini: ${error.message}`);
    }
  }

  throw new Error(`Failed to process with Gemini after ${maxRetries} attempts: ${lastError.message}`);
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Upload and process syllabus
app.post('/api/upload-syllabus', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(req.file);

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No text found in the uploaded file' });
    }

    // Process with OpenAI
    const extractedTasks = await extractTasksFromText(extractedText);

    // Get existing tasks to check for duplicates
    let existingTasks = [];
    if (supabase) {
      const { data: existingData } = await supabase
        .from('tasks')
        .select('title, due_date');
      existingTasks = existingData || [];
    } else {
      existingTasks = inMemoryTasks;
    }

    // Filter out duplicates based on title and due_date
    const filteredTasks = extractedTasks.filter(newTask => {
      return !existingTasks.some(existing =>
        existing.title.toLowerCase().trim() === newTask.title.toLowerCase().trim() &&
        existing.due_date === newTask.due_date
      );
    });

    // Store new tasks in database or memory (merge with existing tasks)
    const tasksToInsert = filteredTasks.map(task => ({
      title: task.title,
      due_date: task.due_date,
      description: task.description || '',
      completed: false,
      created_at: new Date().toISOString()
    }));

    let data = [];
    if (tasksToInsert.length > 0) {
      if (supabase) {
        const { data: supabaseData, error } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
        data = supabaseData;
      } else {
        // Use in-memory storage
        data = tasksToInsert.map(task => ({
          id: taskIdCounter++,
          ...task
        }));
        inMemoryTasks.push(...data);
      }
    }

    const duplicatesSkipped = extractedTasks.length - filteredTasks.length;
    let message = `Syllabus processed successfully - ${filteredTasks.length} new tasks added`;
    if (duplicatesSkipped > 0) {
      message += `, ${duplicatesSkipped} duplicate${duplicatesSkipped !== 1 ? 's' : ''} skipped`;
    }

    res.json({
      message,
      tasks: data,
      extractedText: extractedText.substring(0, 500) + '...' // Preview
    });

  } catch (error) {
    console.error('Error processing syllabus:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    let data;
    if (supabase) {
      const { data: supabaseData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      data = supabaseData;
    } else {
      // Use in-memory storage
      data = [...inMemoryTasks].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let data;
    if (supabase) {
      const { data: supabaseData, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (supabaseData.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      data = supabaseData[0];
    } else {
      // Use in-memory storage
      const taskIndex = inMemoryTasks.findIndex(task => task.id === parseInt(id));
      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }

      inMemoryTasks[taskIndex] = { ...inMemoryTasks[taskIndex], ...updates };
      data = inMemoryTasks[taskIndex];
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } else {
      // Use in-memory storage
      const taskIndex = inMemoryTasks.findIndex(task => task.id === parseInt(id));
      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }
      inMemoryTasks.splice(taskIndex, 1);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;