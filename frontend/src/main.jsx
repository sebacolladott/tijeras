import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App.jsx';
import { AppProvider } from './contexts/AppContext';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AppProvider>
    </StrictMode>,
);
