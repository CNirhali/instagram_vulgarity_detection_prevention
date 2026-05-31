/**
 * Instagram platform adapter.
 * Matches captions, comments, and direct messages resiliently.
 */
class InstagramAdapter extends SocialAdapter {
  constructor(detector) {
    super('Instagram', detector);
  }

  /**
   * Resiliently scans Instagram DOM for potential vulgar text elements
   */
  scanAndFilter() {
    // 1. Post Captions: Typically in span._ap30, h1._a9zs, or inside articles
    const captions = document.querySelectorAll('article h1, article span._ap30, article div._a9zs');
    captions.forEach(el => {
      // Process if caption contains text content and hasn't been blurred
      if (el.textContent && !el.closest('.sg-blur-overlay')) {
        this.processElement(el);
      }
    });

    // 2. Comments: Typically in span._a9zs, span._ap30 inside list items, or general comment rows
    const comments = document.querySelectorAll('span._a9zs, ul._a9z6 span, li._a9z6 span._ap30');
    comments.forEach(el => {
      // Blur the comment text wrapper
      if (el.textContent && !el.closest('.sg-blur-overlay')) {
        this.processElement(el);
      }
    });

    // 3. Direct Messages: Text bubbles inside DM threads (role="row", div.x1lliihq)
    const dmContainerSelectors = [
      'div[role="row"] div.x1lliihq',
      'div.xkhd7t2', // DM message bubble text wrapper
      'div.x11i5r08 div.x1lliihq'
    ];
    
    dmContainerSelectors.forEach(selector => {
      const dmBubbles = document.querySelectorAll(selector);
      dmBubbles.forEach(el => {
        // Blur the individual DM bubble
        if (el.textContent && !el.closest('.sg-blur-overlay') && el.children.length === 0) {
          this.processElement(el);
        }
      });
    });

    // 4. Fallback search: broad text scanner for any recently rendered active text container
    // To ensure full coverage under class name changes, we scan small text nodes in visible lists
    const generalTextNodes = document.querySelectorAll('div[role="button"] span, span[dir="auto"]');
    generalTextNodes.forEach(el => {
      // Process only leaves (elements with no child elements, containing pure text)
      if (el.children.length === 0 && el.textContent?.trim().length > 0) {
        if (!el.closest('.sg-blur-overlay') && !el.closest('header')) {
          this.processElement(el);
        }
      }
    });
  }
}

globalThis.InstagramAdapter = InstagramAdapter;

