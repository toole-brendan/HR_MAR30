import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import Workbox for registration logic
// Use workbox-window for easier registration and update handling
import { Workbox } from 'workbox-window';
// Import the specific lifecycle event types
import type { WorkboxLifecycleEvent, WorkboxLifecycleWaitingEvent } from 'workbox-window';
// Import seedDatabase function to initialize data
import { seedDatabase } from './lib/seedDB';

// Seed the database with initial data
seedDatabase().then(() => {
  console.log('Database seeding completed successfully');
}).catch(error => {
  console.error('Database seeding failed:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  // Use Workbox window library for registration
  const wb = new Workbox('/service-worker.js', { scope: '/' }); // Register with root scope
  // const wb = new Workbox('/defense/service-worker.js', { scope: '/defense/' }); // Alternative if using base path strictly

  // Use the specific type for the 'waiting' listener
  wb.addEventListener('waiting', (event: WorkboxLifecycleWaitingEvent) => {
    console.log(
      `A new service worker has installed, but it's waiting to activate. ` +
      `New or updated content is available.`
    );
    // Optional: Show a prompt to the user asking them to refresh
    // Example: if (confirm('New app version available. Reload to update?')) {
    //   wb.messageSkipWaiting();
    // }
    
    // For smoother updates during development or testing, skip waiting automatically
    // Remove this for production if you want manual user refresh prompt
    console.log('Service Worker: Automatically skipping waiting.');
    wb.messageSkipWaiting(); 
  });

  // Use the specific type for the 'activated' listener
  wb.addEventListener('activated', (event: WorkboxLifecycleEvent) => { 
     // The 'isUpdate' property should be available on the event object for 'activated'
     if (!event.isUpdate) {
      console.log('Service worker activated for the first time!');
    } else {
      console.log('Service worker updated and activated.');
      // Optional: Reload the page to ensure the user gets the latest assets
      // window.location.reload(); 
    }
  });

  // Register the service worker
  wb.register()
    .then((registration: ServiceWorkerRegistration | undefined) => {
      if (registration) {
         console.log('Service Worker registered with scope:', registration.scope);
      } else {
         console.log('Service Worker registration returned undefined.');
      }
    })
    .catch((error: Error) => {
      console.error('Service Worker registration failed:', error);
    });

} else {
  console.log('Service Worker API not supported in this browser.');
}
// --- End Service Worker Registration ---
