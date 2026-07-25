import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@/lib/api-client';
import App from './App';
import './index.css';

// Point the API client at the Render backend.
// Set VITE_API_URL in your .env (or Vercel env vars) to your Render service URL.
// Example: VITE_API_URL=https://ward-copilot-api.onrender.com
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(<App />);
