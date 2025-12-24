
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("EduSpend: Initializing application...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("EduSpend: Critical Error - Could not find root element '#root' in the DOM.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("EduSpend: Application mounted successfully.");
  } catch (error) {
    console.error("EduSpend: Failed to mount application:", error);
  }
}
