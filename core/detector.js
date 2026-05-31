/**
 * Core Vulgarity Detection Engine
 * High-performance regex-based profanity, hate speech, and harassment filtering.
 */
class VulgarityDetector {
  constructor(settings = {}) {
    // Default system dictionaries categorized by filter type
    this.dictionaries = {
      profanity: [
        'fuck', 'shit', 'asshole', 'bitch', 'crap', 'bastard', 'cunt', 'dick', 'pussy', 'wank', 
        'bollocks', 'motherfucker', 'dumbass', 'douchebag', 'prick', 'twat', 'slut', 'whore',
        'ass', 'piss', 'cock', 'clit', 'jackass', 'bullshit'
      ],
      hateSpeech: [
        'nigger', 'chink', 'kike', 'spic', 'faggot', 'dyke', 'tranny', 'retard', 'coons', 
        'nazi', 'hitler', 'white trash', 'gook', 'raghead', 'wetback'
      ],
      harassment: [
        'idiot', 'stupid', 'moron', 'kill yourself', 'kys', 'die', 'useless', 'trash', 
        'ugly', 'fat', 'loser', 'hate you', 'disgusting', 'garbage', 'worthless'
      ]
    };

    // User settings
    this.enabledCategories = settings.enabledCategories || {
      profanity: true,
      hateSpeech: true,
      harassment: true
    };

    this.customBlacklist = settings.customBlacklist || [];
    this.customWhitelist = settings.customWhitelist || [];
    
    this.compileRegexes();
  }

  /**
   * Update active settings dynamically
   */
  updateSettings(settings) {
    if (settings.enabledCategories) {
      this.enabledCategories = { ...this.enabledCategories, ...settings.enabledCategories };
    }
    if (settings.customBlacklist) {
      this.customBlacklist = settings.customBlacklist;
    }
    if (settings.customWhitelist) {
      this.customWhitelist = settings.customWhitelist;
    }
    this.compileRegexes();
  }

  /**
   * Compiles words lists into optimized Regular Expressions for high performance
   */
  compileRegexes() {
    this.regexes = {};
    
    // Compile system dictionaries
    for (const [category, words] of Object.entries(this.dictionaries)) {
      if (this.enabledCategories[category] && words.length > 0) {
        // Escapes regex special characters and creates a word-boundary-aware search pattern
        const escaped = words.map(w => this.escapeRegex(w));
        this.regexes[category] = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
      } else {
        this.regexes[category] = null;
      }
    }

    // Compile custom blacklist
    if (this.customBlacklist.length > 0) {
      const escapedBlacklist = this.customBlacklist.map(w => this.escapeRegex(w));
      this.customBlacklistRegex = new RegExp(`\\b(${escapedBlacklist.join('|')})\\b`, 'gi');
    } else {
      this.customBlacklistRegex = null;
    }

    // Compile whitelist for quick check bypass
    if (this.customWhitelist.length > 0) {
      const escapedWhitelist = this.customWhitelist.map(w => this.escapeRegex(w));
      this.customWhitelistRegex = new RegExp(`\\b(${escapedWhitelist.join('|')})\\b`, 'gi');
    } else {
      this.customWhitelistRegex = null;
    }
  }

  /**
   * Utility to escape special regex characters in words
   */
  escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * Checks if a word is whitelisted
   */
  isWhitelisted(text) {
    if (!this.customWhitelistRegex) return false;
    // Reset regex index state
    this.customWhitelistRegex.lastIndex = 0;
    return this.customWhitelistRegex.test(text);
  }

  /**
   * Analyzes text and returns match metadata
   * @param {string} text - The input text content
   * @returns {Object} Analysis result
   */
  analyzeText(text) {
    const result = {
      isFlagged: false,
      matchedWords: [],
      matchedCategory: null,
      cleanedText: text
    };

    if (!text || typeof text !== 'string') return result;
    if (this.isWhitelisted(text)) return result;

    let flaggedText = text;

    // Check custom blacklist first
    if (this.customBlacklistRegex) {
      this.customBlacklistRegex.lastIndex = 0;
      const matches = text.match(this.customBlacklistRegex);
      if (matches) {
        result.isFlagged = true;
        result.matchedCategory = 'custom';
        result.matchedWords = [...new Set([...result.matchedWords, ...matches.map(m => m.toLowerCase())])];
        flaggedText = flaggedText.replace(this.customBlacklistRegex, match => '*'.repeat(match.length));
      }
    }

    // Check individual system categories
    for (const [category, regex] of Object.entries(this.regexes)) {
      if (!regex) continue;
      regex.lastIndex = 0;
      const matches = text.match(regex);
      if (matches) {
        result.isFlagged = true;
        // Default to the first found category or aggregate
        if (!result.matchedCategory) {
          result.matchedCategory = category;
        }
        result.matchedWords = [...new Set([...result.matchedWords, ...matches.map(m => m.toLowerCase())])];
        flaggedText = flaggedText.replace(regex, match => '*'.repeat(match.length));
      }
    }

    result.cleanedText = flaggedText;
    return result;
  }

  /**
   * Replaces flagged words with a standard placeholder or asterisks
   */
  redactText(text, method = 'placeholder') {
    const analysis = this.analyzeText(text);
    if (!analysis.isFlagged) return text;
    
    if (method === 'asterisk') {
      return analysis.cleanedText;
    }
    
    return `[Content Filtered due to ${analysis.matchedCategory}]`;
  }
}

// Make available globally in the content script context
globalThis.VulgarityDetector = VulgarityDetector;

