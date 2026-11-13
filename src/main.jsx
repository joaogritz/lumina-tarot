import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import './mobile.css';
// Experimental art direction (branch experimento/maison).
import './maison.css';
import { getLocale, t } from './i18n';
import { loadDataLocale } from './data/localize';

// Register PWA Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service Worker registration notice:', err);
    });
  });
}

function render() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// The page's static title and description are in Portuguese (for crawlers); show the visitor's language.
document.title = t('meta.title');
document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));

// Card texts for languages other than Portuguese load before the first render. If they fail to
// load (offline, for example), the cards stay in Portuguese and the interface still works.
loadDataLocale(getLocale())
  .catch((err) => console.warn('Card texts for this language could not be loaded:', err))
  .finally(render);
