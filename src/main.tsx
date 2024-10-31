import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlatformSettingsProvider } from './context/PlatformSettingsContext';
import { QuizProvider } from './context/QuizContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlatformSettingsProvider>
          <QuizProvider>
            <App />
          </QuizProvider>
        </PlatformSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);