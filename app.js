/* ==========================================================================
   SONIA KITTYFIT - ENTRY POINT & SERVICE WORKER BOOTSTRAP (app.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadThemePreference();
  initAppState();
  initVoiceRecognition();
  
  loadAllMachineImages().then(() => {
    switchTab("dashboard");
  });
});

// --- Register Service Worker & Inject Manifest (only if HTTPS/HTTP protocol) ---
if (window.location.protocol !== 'file:') {
  const linkEl = document.createElement("link");
  linkEl.rel = "manifest";
  linkEl.href = "manifest.json";
  document.head.appendChild(linkEl);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service worker registered!', reg))
        .catch(err => console.log('Service worker registration failed: ', err));
    });
  }
}
