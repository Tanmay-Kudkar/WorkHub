import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx';
import { ServerStateProvider } from './context/ServerStateContext.jsx';
import ServerWakeupScreen from './components/ui/ServerWakeupScreen.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <ServerStateProvider>
        <ServerWakeupScreen />
        <App />
      </ServerStateProvider>
    </BrowserRouter>
);
