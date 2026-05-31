/**
 * Social Guard Dashboard Interactive Controller
 * Syncs UI, updates settings instantly, manages custom blacklists, and animates statistics.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const extToggle = document.getElementById('extension-toggle');
  const catProfanity = document.getElementById('cat-profanity');
  const catHateSpeech = document.getElementById('cat-hateSpeech');
  const catHarassment = document.getElementById('cat-harassment');
  
  const statTotal = document.getElementById('stat-total');
  const statSession = document.getElementById('stat-session');
  
  const safetyBar = document.getElementById('safety-bar');
  const safetyPercentage = document.getElementById('safety-percentage');
  
  const methodBlur = document.getElementById('btn-method-blur');
  const methodRedact = document.getElementById('btn-method-redact');
  
  const keywordInput = document.getElementById('keyword-input');
  const btnAddKeyword = document.getElementById('btn-add-keyword');
  const keywordTagsContainer = document.getElementById('keyword-tags');

  // Loaded Settings state
  let settings = {
    enabled: true,
    enabledCategories: {
      profanity: true,
      hateSpeech: true,
      harassment: true
    },
    customBlacklist: [],
    customWhitelist: [],
    redactionMethod: 'blur',
    totalBlocked: 0,
    sessionBlocked: 0
  };

  // Load and apply settings
  async function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      settings = await chrome.storage.local.get(settings);
    }
    
    // Set UI switches
    extToggle.checked = settings.enabled;
    catProfanity.checked = settings.enabledCategories.profanity;
    catHateSpeech.checked = settings.enabledCategories.hateSpeech;
    catHarassment.checked = settings.enabledCategories.harassment;
    
    // Set segment button states
    updateMethodUI(settings.redactionMethod);
    
    // Render custom keywords
    renderKeywords();
    
    // Render and animate stats
    animateValue(statTotal, settings.totalBlocked);
    animateValue(statSession, settings.sessionBlocked);
    
    // Update safety indicators
    updateSafetyRating();

    // Disable controls if extension is turned off
    toggleControlsState(settings.enabled);
  }

  // Toggle Controls active states
  function toggleControlsState(isEnabled) {
    const controls = [
      catProfanity, catHateSpeech, catHarassment, 
      methodBlur, methodRedact, keywordInput, btnAddKeyword
    ];
    
    controls.forEach(c => {
      if (c) {
        c.disabled = !isEnabled;
        // Visual fade out for rows
        const parentRow = c.closest('.control-row') || c.closest('.segment-selector') || c.closest('.keyword-input-wrapper');
        if (parentRow) {
          parentRow.style.opacity = isEnabled ? '1' : '0.45';
          parentRow.style.pointerEvents = isEnabled ? 'auto' : 'none';
        }
      }
    });

    // Handle tag area visual lock
    if (keywordTagsContainer) {
      keywordTagsContainer.style.opacity = isEnabled ? '1' : '0.45';
      keywordTagsContainer.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }

    // Header active states
    const statusText = document.querySelector('.status-indicator');
    const dot = document.querySelector('.dot');
    if (statusText && dot) {
      if (isEnabled) {
        statusText.innerHTML = '<span class="dot pulse"></span>Active Guard Shield';
        statusText.style.color = 'var(--text-secondary)';
      } else {
        statusText.innerHTML = '<span class="dot" style="background-color: var(--text-tertiary); box-shadow: none;"></span>Shield Deactivated';
        statusText.style.color = 'var(--text-tertiary)';
      }
    }
  }

  // Segment button switcher
  function updateMethodUI(method) {
    if (method === 'blur') {
      methodBlur.classList.add('active');
      methodRedact.classList.remove('active');
    } else {
      methodBlur.classList.remove('active');
      methodRedact.classList.add('active');
    }
  }

  // Animate counter values beautifully
  function animateValue(element, targetValue) {
    let start = 0;
    const duration = 400; // ms
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const ease = progress * (2 - progress);
      const currentVal = Math.floor(ease * targetValue);
      
      element.textContent = currentVal;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetValue;
      }
    }
    
    requestAnimationFrame(update);
  }

  // Dynamic Safety level bar calculator
  function updateSafetyRating() {
    if (!settings.enabled) {
      safetyBar.style.width = '0%';
      safetyPercentage.textContent = 'Protection Paused';
      safetyPercentage.style.color = 'var(--text-tertiary)';
      return;
    }

    let enabledCount = 0;
    if (settings.enabledCategories.profanity) enabledCount++;
    if (settings.enabledCategories.hateSpeech) enabledCount++;
    if (settings.enabledCategories.harassment) enabledCount++;

    const percent = Math.round((enabledCount / 3) * 100);
    safetyBar.style.width = `${percent}%`;

    if (percent === 100) {
      safetyPercentage.textContent = 'Maximum Protected';
      safetyPercentage.style.color = 'var(--success)';
      safetyBar.style.background = 'linear-gradient(90deg, var(--accent-indigo), var(--success))';
    } else if (percent >= 66) {
      safetyPercentage.textContent = 'Moderate Security';
      safetyPercentage.style.color = 'var(--accent-purple)';
      safetyBar.style.background = 'var(--accent-purple)';
    } else if (percent >= 33) {
      safetyPercentage.textContent = 'Vulnerable Status';
      safetyPercentage.style.color = '#eab308'; // Amber warn color
      safetyBar.style.background = '#eab308';
    } else {
      safetyPercentage.textContent = 'Unprotected';
      safetyPercentage.style.color = '#ef4444'; // Red alarm color
      safetyBar.style.background = '#ef4444';
    }
  }

  // Renders custom tags list
  function renderKeywords() {
    keywordTagsContainer.innerHTML = '';
    
    if (settings.customBlacklist.length === 0) {
      keywordTagsContainer.innerHTML = '<span class="no-tags">No custom keywords added yet.</span>';
      return;
    }

    settings.customBlacklist.forEach(word => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.innerHTML = `
        ${escapeHtml(word)}
        <span class="tag-close" data-word="${escapeHtml(word)}">&times;</span>
      `;
      
      // Clicking the tag deletes it
      tag.addEventListener('click', () => {
        removeKeyword(word);
      });
      
      keywordTagsContainer.appendChild(tag);
    });
  }

  // Add a new custom blacklist keyword
  async function addKeyword() {
    const word = keywordInput.value.trim().toLowerCase();
    if (!word) return;

    if (!settings.customBlacklist.includes(word)) {
      settings.customBlacklist.push(word);
      await chrome.storage.local.set({ customBlacklist: settings.customBlacklist });
      renderKeywords();
      keywordInput.value = '';
    }
  }

  // Remove a custom blacklist keyword
  async function removeKeyword(word) {
    settings.customBlacklist = settings.customBlacklist.filter(w => w !== word);
    await chrome.storage.local.set({ customBlacklist: settings.customBlacklist });
    renderKeywords();
  }

  // Safe HTML rendering utility
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initialize and register UI Listeners
  await loadSettings();

  // Listen to main enable checkbox toggle
  extToggle.addEventListener('change', async () => {
    settings.enabled = extToggle.checked;
    await chrome.storage.local.set({ enabled: settings.enabled });
    toggleControlsState(settings.enabled);
    updateSafetyRating();
  });

  // Listen to categories toggles
  const registerCategoryListener = (element, key) => {
    element.addEventListener('change', async () => {
      settings.enabledCategories[key] = element.checked;
      await chrome.storage.local.set({ enabledCategories: settings.enabledCategories });
      updateSafetyRating();
    });
  };

  registerCategoryListener(catProfanity, 'profanity');
  registerCategoryListener(catHateSpeech, 'hateSpeech');
  registerCategoryListener(catHarassment, 'harassment');

  // Listen to Redaction selector buttons
  const selectMethod = async (method) => {
    settings.redactionMethod = method;
    await chrome.storage.local.set({ redactionMethod: method });
    updateMethodUI(method);
  };

  methodBlur.addEventListener('click', () => selectMethod('blur'));
  methodRedact.addEventListener('click', () => selectMethod('redact'));

  // Blacklist form submit actions
  btnAddKeyword.addEventListener('click', addKeyword);
  keywordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  });

  // Listen to storage updates (e.g. from injected content scripts incrementing blocks count)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'local') return;

    if (changes.totalBlocked) {
      statTotal.textContent = changes.totalBlocked.newValue;
    }
    if (changes.sessionBlocked) {
      statSession.textContent = changes.sessionBlocked.newValue;
    }
  });
});
