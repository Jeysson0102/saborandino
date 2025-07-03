// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

// 1) Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// 2) Tus estilos
import './App.css';       // o './custom.css'
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
