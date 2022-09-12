import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

//import "primereact/resources/themes/md-dark-indigo/theme.css";    //theme
import "primereact/resources/themes/lara-dark-blue/theme.css"
import "primereact/resources/primereact.min.css";                 //core css
import "primeicons/primeicons.css";                               //icons


import PrimeReact from 'primereact/api';

PrimeReact.ripple = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
