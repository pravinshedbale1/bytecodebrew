import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/global.css';
import './styles/glass.css';
import { App } from './App';
// the Claude API key follows the account from the moment of sign-in (moving an old browser-only key, clearing it on sign-out)
import './lib/claude';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
