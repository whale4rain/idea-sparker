import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Request notification permission if available
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Set up global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
