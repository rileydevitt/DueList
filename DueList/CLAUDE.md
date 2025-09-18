# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DueList (formerly Syllabus-to-Todo App) is a full-stack application that converts document content into organized, actionable to-do lists using AI. The app supports PDF, DOCX, and TXT file uploads and extracts tasks with due dates automatically.

## Architecture

**Full-stack separation**: Frontend and backend are completely decoupled services
- **Frontend**: React + TypeScript + Tailwind CSS (port 3001)
- **Backend**: Node.js + Express API server (port 5001)
- **Database**: Supabase (PostgreSQL) with tasks table
- **AI Processing**: Google Gemini API for document analysis
- **File Processing**: pdf-parse, mammoth, multer for different file types

**Key architectural patterns**:
- Single-page React app with inline components in App.tsx
- RESTful API with Express endpoints
- File upload handling with multipart/form-data
- Real-time task CRUD operations
- Export functionality (Excel, iCal, Google Calendar, Outlook)

## Development Commands

### Backend Development
```bash
cd backend
npm install                # Install dependencies
npm run dev                # Start with nodemon (development)
npm start                  # Start production server
```

### Frontend Development
```bash
cd frontend
npm install                # Install dependencies
npm start                  # Start dev server (default port 3000)
PORT=3001 npm start        # Start on specific port (preferred for this project)
npm run build              # Build for production
npm test                   # Run React tests
```

### Database Setup
```bash
# Run the SQL commands from backend/database.sql in Supabase SQL Editor
# Required environment variables in backend/.env:
# - OPENAI_API_KEY (for AI processing)
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - PORT=5001
```

## Key Files and Structure

**Frontend (React)**:
- `src/App.tsx` - Main application with all components inline (TaskList, TaskItem, FileUpload)
- `public/index.html` - HTML template with DueList branding
- `public/favicon.svg` - Custom upload icon favicon

**Backend (Node.js)**:
- `index.js` - Express server with API endpoints and AI processing logic
- `database.sql` - Supabase schema with tasks table and triggers
- `.env.example` - Template for required environment variables

**API Endpoints**:
- `POST /api/upload-syllabus` - Process uploaded documents with AI
- `GET /api/tasks` - Retrieve all tasks
- `PUT /api/tasks/:id` - Update task (completion status, content)
- `DELETE /api/tasks/:id` - Delete task

## Important Implementation Details

**Task Management Flow**:
1. File upload → multipart parsing → document text extraction
2. AI processing (Google Gemini) → structured task extraction
3. Database insertion → frontend refresh → UI update

**Component Architecture**:
- All React components are defined inline within App.tsx
- TaskItem handles individual task CRUD operations
- TaskList manages filtering, sorting, and export functions
- FileUpload handles drag-and-drop and file processing UI

**Export Features**:
- Excel export using XLSX library
- Calendar exports (iCal format) for Google Calendar, Outlook, Apple Calendar
- Export buttons integrated into TaskList component

## Environment Setup

Backend requires these environment variables:
- `OPENAI_API_KEY` - For document processing with AI
- `SUPABASE_URL` - Database connection
- `SUPABASE_ANON_KEY` - Database authentication
- `PORT` - Server port (default 5001)

Frontend connects to backend at `http://localhost:5001` by default.

## Database Schema

Single `tasks` table with:
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(255))
- `due_date` (DATE)
- `description` (TEXT)
- `completed` (BOOLEAN)
- `created_at`/`updated_at` (TIMESTAMP)

Includes indexes on due_date, completed, and created_at for performance.