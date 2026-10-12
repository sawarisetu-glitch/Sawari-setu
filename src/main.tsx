import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseAppCheck } from './firebase.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';

// Initialize Firebase App Check on application mount
initFirebaseAppCheck();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

