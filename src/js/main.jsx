// import "../index.css";
import '../scss/styles.scss';

import * as bootstrap from 'bootstrap';

import App from '../App.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
