import './App';
import './styles.css';

'serviceWorker' in navigator &&
  navigator.serviceWorker.register('/service-worker.js');

declare global {
  interface Window {}
}
