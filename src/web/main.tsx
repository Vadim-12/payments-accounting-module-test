import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/web/app/App';
import '@/web/tailwind.css';
import '@/web/styles.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
