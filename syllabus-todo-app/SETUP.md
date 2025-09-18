# Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key
- Supabase account

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   PORT=5000
   ```

5. **Set up Supabase database:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL commands from `database.sql`

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Usage

1. Open your browser to `http://localhost:3000`
2. Upload a syllabus file (PDF, DOCX, or TXT)
3. Wait for the AI to process and extract tasks
4. Manage your tasks with the built-in to-do list

## API Endpoints

- `POST /api/upload-syllabus` - Upload and process syllabus
- `GET /api/tasks` - Get all tasks
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## File Support

- **PDF**: Full text extraction
- **DOCX**: Text content extraction
- **TXT**: Plain text files

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that Supabase database is properly configured
- Verify OpenAI API key has sufficient credits
- Make sure both frontend and backend servers are running