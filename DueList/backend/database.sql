-- Supabase Database Schema for Syllabus-to-Todo App

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Optional: Add Row Level Security (RLS) for multi-tenant support
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Insert sample data for testing (optional)
INSERT INTO tasks (title, due_date, description) VALUES
  ('Sample Assignment 1', '2025-09-25', 'Complete reading assignment and submit report'),
  ('Midterm Exam', '2025-10-15', 'Study chapters 1-5'),
  ('Final Project', '2025-12-10', 'Submit final research paper');

-- Grant permissions (adjust based on your security needs)
-- GRANT ALL ON tasks TO authenticated;
-- GRANT ALL ON tasks TO anon;