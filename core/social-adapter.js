/**
 * Base Social Media Adapter class.
 * Implements standard MutationObserver logic and beautiful glassmorphism redaction styling.
 */
class SocialAdapter {
  constructor(platformName, detector) {
    this.platformName = platformName;
    this.detector = detector;
    this.observer = null;
    this.redactionMethod = 'blur'; // Default redaction method: 'blur' or 'redact'
    this.processedElements = new WeakSet(); // Track processed nodes to prevent infinite loops
  }

  /**
   * Initialize adapter, start DOM observation
   */
  async initialize(settings = {}) {
    this.redactionMethod = settings.redactionMethod || 'blur';
    this.setupStyles();
    this.scanAndFilter();
    this.startObservation();
    console.log(`[Social Guard] ${this.platformName} adapter initialized successfully.`);
  }

  /**
   * Injects beautiful CSS styles needed for premium glassmorphic overlays and inline redaction
   */
  setupStyles() {
    if (document.getElementById('social-guard-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'social-guard-styles';
    styles.textContent = `
      /* Blur Redaction Overlay */
      .sg-blur-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999;
        cursor: pointer;
        padding: 12px;
        text-align: center;
        border-radius: inherit;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .sg-blur-overlay:hover {
        background: rgba(15, 23, 42, 0.85);
      }

      .sg-blur-overlay.sg-fade-out {
        opacity: 0;
        pointer-events: none;
      }

      .sg-shield-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #a78bfa, #8b5cf6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        flex-shrink: 0;
        animation: sgPulse 2s infinite;
      }

      .sg-shield-icon svg {
        width: 18px;
        height: 18px;
        fill: white;
      }

      .sg-warning-title {
        font-size: 13px;
        font-weight: 600;
        margin: 0 0 2px 0;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: #ddd6fe;
      }

      .sg-warning-desc {
        font-size: 11px;
        color: #cbd5e1;
        margin: 0;
      }

      .sg-warning-reveal {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 6px;
        font-weight: 500;
        text-decoration: underline;
      }

      /* Parent Element Lock */
      .sg-relative-container {
        position: relative !important;
      }

      /* Inline Redaction styling */
      .sg-inline-redacted {
        background: rgba(239, 68, 68, 0.15) !important;
        border: 1px dashed rgba(239, 68, 68, 0.4) !important;
        color: #ef4444 !important;
        padding: 1px 4px !important;
        border-radius: 4px !important;
        font-size: 0.9em !important;
        font-weight: 500 !important;
        display: inline-block !important;
      }

      @keyframes sgPulse {
        0% { transform: scale(1); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
        50% { transform: scale(1.05); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6); }
        100% { transform: scale(1); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Start dynamic DOM observation using MutationObserver
   */
  startObservation() {
    if (this.observer) return;

    this.observer = new MutationObserver(async (mutations) => {
      let shouldScan = false;
      
      for (const mutation of mutations) {
        // Only trigger scan if new nodes are added, ignoring our own elements
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && 
                !node.classList?.contains('sg-blur-overlay') && 
                !node.closest?.('.sg-blur-overlay')) {
              shouldScan = true;
              break;
            }
          }
        }
        if (shouldScan) break;
      }

      if (shouldScan) {
        this.scanAndFilter();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Disconnect DOM observation
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove all overlays
    const overlays = document.querySelectorAll('.sg-blur-overlay');
    overlays.forEach(overlay => overlay.remove());

    // Restore text for inline redactions if possible (requires page refresh to fully restore, or adapter handles it)
    console.log(`[Social Guard] ${this.platformName} adapter cleaned up.`);
  }

  /**
   * Template method to be implemented by children to scan active components
   */
  scanAndFilter() {
    throw new Error('scanAndFilter() must be implemented by subclass.');
  }

  /**
   * High-performance processing of a given text container element
   */
  processElement(element, textSelector = null) {
    if (!element || this.processedElements.has(element)) return;

    const targetTextElement = textSelector ? element.querySelector(textSelector) : element;
    if (!targetTextElement) return;

    const textContent = targetTextElement.textContent || '';
    if (!textContent.trim()) return;

    const analysis = this.detector.analyzeText(textContent);
    if (analysis.isFlagged) {
      this.applyRedaction(element, targetTextElement, analysis);
    }
  }

  /**
   * Apply selected redaction method (Blur overlay or Inline redaction)
   */
  applyRedaction(containerElement, textElement, analysis) {
    // Prevent double processing
    this.processedElements.add(containerElement);

    // Record stats in chrome.storage
    this.incrementBlockCount();

    if (this.redactionMethod === 'blur') {
      this.applyBlurOverlay(containerElement, analysis);
    } else {
      this.applyInlineRedaction(textElement, analysis);
    }
  }

  /**
   * Applies the glassmorphism Blur overlay
   */
  applyBlurOverlay(containerElement, analysis) {
    // Force container relative positioning
    containerElement.classList.add('sg-relative-container');

    const overlay = document.createElement('div');
    overlay.className = 'sg-blur-overlay';
    
    // Shield SVG icon
    const shieldSvg = `
      <div class="sg-shield-icon">
        <svg viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.09c-2.33 0-4.32-1.1-5.59-2.78C6.67 15.08 9.17 14 12 14s5.33 1.08 5.59 2.31c-1.27 1.68-3.26 2.78-5.59 2.78z"/>
        </svg>
      </div>
    `;

    overlay.innerHTML = `
      ${shieldSvg}
      <h3 class="sg-warning-title">Filtered Content</h3>
      <p class="sg-warning-desc">Flagged for ${analysis.matchedCategory}</p>
      <span class="sg-warning-reveal">Click to Reveal</span>
    `;

    // Click to Reveal interaction
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      overlay.classList.add('sg-fade-out');
      setTimeout(() => {
        overlay.remove();
        containerElement.classList.remove('sg-relative-container');
      }, 300);
    });

    containerElement.appendChild(overlay);
  }

  /**
   * Replaces content with a sleek inline redacted tag
   */
  applyInlineRedaction(textElement, analysis) {
    textElement.innerHTML = `<span class="sg-inline-redacted" title="Original Flagged: ${analysis.matchedWords.join(', ')}">⚠️ Redacted for ${analysis.matchedCategory}</span>`;
  }

  /**
   * Local storage stats tracking
   */
  async incrementBlockCount() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const { totalBlocked = 0, sessionBlocked = 0 } = await chrome.storage.local.get(['totalBlocked', 'sessionBlocked']);
        await chrome.storage.local.set({ 
          totalBlocked: totalBlocked + 1,
          sessionBlocked: sessionBlocked + 1
        });
      }
    } catch (err) {
      console.warn('[Social Guard] Failed to increment stats:', err);
    }
  }
}

globalThis.SocialAdapter = SocialAdapter;

