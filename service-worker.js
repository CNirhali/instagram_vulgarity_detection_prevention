/**
 * Social Guard Service Worker (Background Script)
 * Manages default extension state, settings storage, and background notifications.
 */

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const defaultSettings = {
      enabled: true,
      enabledCategories: {
        profanity: true,
        hateSpeech: true,
        harassment: true
      },
      customBlacklist: [],
      customWhitelist: [],
      redactionMethod: 'blur', // 'blur' or 'redact'
      totalBlocked: 0,
      sessionBlocked: 0
    };

    await chrome.storage.local.set(defaultSettings);
    console.log('[Social Guard] Default settings initialized.');
  }
});

// Reset session-specific block stats on browser startup
chrome.runtime.onStartup.addListener(async () => {
  await chrome.storage.local.set({ sessionBlocked: 0 });
  console.log('[Social Guard] Session block stats reset.');
});
