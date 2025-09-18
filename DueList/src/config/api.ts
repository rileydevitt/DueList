const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

export const API_ENDPOINTS = {
  TASKS: `${API_BASE_URL}/api/tasks`,
  UPLOAD_DOCUMENT: `${API_BASE_URL}/api/upload-syllabus`,
} as const;

export { API_BASE_URL };