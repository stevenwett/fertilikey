import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react-app-root');
  
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});