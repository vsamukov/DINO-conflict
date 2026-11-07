import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline PWA functionality
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New Dino Conflict update available.');
  },
  onOfflineReady() {
    console.log('Dino Conflict is ready for full offline play.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

