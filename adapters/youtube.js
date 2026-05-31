/**
 * YouTube platform adapter.
 * Matches comments, descriptions, and video titles.
 */
class YoutubeAdapter extends SocialAdapter {
  constructor(detector) {
    super('YouTube', detector);
  }

  /**
   * Scans YouTube DOM for potential vulgar text elements
   */
  scanAndFilter() {
    // 1. YouTube Video Title
    const videoTitles = document.querySelectorAll('h1.ytd-watch-metadata yt-formatted-string, ytd-video-primary-info-renderer h1.title');
    videoTitles.forEach(el => {
      if (el.textContent && !el.closest('.sg-blur-overlay')) {
        this.processElement(el);
      }
    });

    // 2. YouTube Video Comments: typically inside yt-formatted-string#content-text
    const comments = document.querySelectorAll('yt-formatted-string#content-text, #content-text.ytd-comment-view-model');
    comments.forEach(el => {
      if (el.textContent && !el.closest('.sg-blur-overlay')) {
        this.processElement(el);
      }
    });

    // 3. YouTube Video Descriptions: typically in yt-formatted-string#description or description text blocks
    const descriptions = document.querySelectorAll('yt-text-inline-renderer#description-text, ytd-expandable-video-description-body-renderer');
    descriptions.forEach(el => {
      if (el.textContent && !el.closest('.sg-blur-overlay')) {
        this.processElement(el);
      }
    });
  }
}

globalThis.YoutubeAdapter = YoutubeAdapter;

