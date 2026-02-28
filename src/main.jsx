import React from 'react';
import ReactDOM from 'react-dom/client';
// Corrected path to find the file in your root directory
import ApiaryDashboard from './ApiaryDashboard.jsx'; 
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApiaryDashboard />
  </React.StrictMode>
);
