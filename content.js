/**
 * Social Guard Content Script Orchestrator
 * Detects current platform, initializes correct adapter, and synchronizes settings in real time.
 */
(async () => {
  let activeAdapter = null;
  let detector = null;

  // Retrieve current settings
  const settings = await chrome.storage.local.get({
    enabled: true,
    enabledCategories: {
      profanity: true,
      hateSpeech: true,
      harassment: true
    },
    customBlacklist: [],
    customWhitelist: [],
    redactionMethod: 'blur'
  });

  // Initialize Core Vulgarity Detector
  detector = new VulgarityDetector(settings);

  // Instantiates the corresponding platform adapter
  function getAdapterForPlatform() {
    const host = window.location.hostname.toLowerCase();
    
    if (host.includes('instagram.com')) {
      return new window.InstagramAdapter(detector);
    } else if (host.includes('youtube.com')) {
      return new window.YoutubeAdapter(detector);
    }
    
    return null;
  }

  // Orchestrate initialization
  async function startGuard() {
    if (!settings.enabled) return;

    activeAdapter = getAdapterForPlatform();
    if (activeAdapter) {
      await activeAdapter.initialize({
        redactionMethod: settings.redactionMethod
      });
    }
  }

  // Handle settings updates dynamically
  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace !== 'local') return;

    // 1. Handle toggle Enable/Disable extension
    if (changes.enabled) {
      const isEnabled = changes.enabled.newValue;
      if (isEnabled && !activeAdapter) {
        // Re-read full settings and start
        const freshSettings = await chrome.storage.local.get();
        detector.updateSettings(freshSettings);
        settings.enabled = true;
        await startGuard();
      } else if (!isEnabled && activeAdapter) {
        activeAdapter.cleanup();
        activeAdapter = null;
        settings.enabled = false;
      }
    }

    // 2. Handle changes to redaction method (blur -> redact, or vice-versa)
    if (changes.redactionMethod && activeAdapter) {
      const newMethod = changes.redactionMethod.newValue;
      activeAdapter.cleanup();
      activeAdapter = null;
      
      const freshSettings = await chrome.storage.local.get();
      settings.redactionMethod = newMethod;
      await startGuard();
    }

    // 3. Handle changes to keyword lists and categories
    if (changes.enabledCategories || changes.customBlacklist || changes.customWhitelist) {
      const updatedCategories = changes.enabledCategories?.newValue || settings.enabledCategories;
      const updatedBlacklist = changes.customBlacklist?.newValue || settings.customBlacklist;
      const updatedWhitelist = changes.customWhitelist?.newValue || settings.customWhitelist;

      detector.updateSettings({
        enabledCategories: updatedCategories,
        customBlacklist: updatedBlacklist,
        customWhitelist: updatedWhitelist
      });

      if (activeAdapter) {
        // Re-scan with updated filter list immediately
        activeAdapter.scanAndFilter();
      }
    }
  });

  // Start the extension logic
  await startGuard();
})();
