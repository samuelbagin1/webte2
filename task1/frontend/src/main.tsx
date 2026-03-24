import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="top-center" closeButton/>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
