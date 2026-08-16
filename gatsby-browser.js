/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// Automatically reload when service worker updates
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This site has been updated. ` +
      `Reload to display the latest version?`
  );
  if (answer === true) {
    window.location.reload();
  }
};

// Handle service worker updates
export const onServiceWorkerUpdateFound = () => {
  console.log('New content is available; please refresh.');
};

// For aggressive update checking
export const onServiceWorkerInstalled = () => {
  console.log('Service worker installed');
};

// Check for updates every 60 seconds when page is visible
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Also check when page becomes visible
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            registration.update();
          }
        });
      }
    });
  });
}
