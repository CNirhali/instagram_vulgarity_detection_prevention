# Chrome Web Store Listing & Submission Metadata

This file tracks the store listing configurations, permissions justifications, and privacy disclosures required to publish **Social Guard: Vulgarity & Profanity Filter** on the Chrome Web Store.

* **Last Updated:** 2026-05-31
* **Current Version:** `1.0.0`

---

## 1. Store Listing Details

### Extension Name
`Social Guard: Vulgarity & Profanity Filter`

### Brief Summary (Max 150 chars)
`Redact and blur vulgarity, profanity, hate speech, and harassment on Instagram and YouTube with a private, plug-and-play local filter.`

### Detailed Description (CWS Dashboard)
```
Take control of your social media experience. Social Guard is a next-generation browser extension designed to identify, blur, and redact offensive text content in real-time across your favorite social networks. 

Built with a modern plug-and-play architecture, Social Guard launches with native support for Instagram and YouTube, automatically filtering posts, video descriptions, and comments.

KEY FEATURES:
🛡️ Sleek Glassmorphism Blur: Swear words and toxic insults are automatically covered by a beautiful glass blur. Simply click the shield overlay to temporarily reveal the original content.
🛡️ Redaction Customization: Prefer a cleaner layout? Switch to inline text redaction (e.g., [Redacted]) instantly.
🛡️ Three Granular Filter Categories:
    - Profanity & Swearwords: Keeps reading safe from general swearing.
    - Hate Speech & Slurs: Combats hateful, discriminatory language.
    - Harassment & Insults: Blocks personal attacks, threats, and toxicity.
🛡️ Personal Blacklist: Type custom words or phrases to hide them instantly.
🛡️ Private & Ultra-Fast: Social Guard scans all text 100% locally on your machine. Your browsing data never leaves your computer—meaning absolute privacy and zero lag.

HOW IT WORKS:
Social Guard operates on an elegant abstraction layer. By separating the matching engine from platform adapters, it delivers highly optimized scanning performance (under 2ms per block) and allows simple scaling to new networks.
```

---

## 2. Permissions & Host Justification

Chrome Web Store requires explicit, plain-English reasons for every permission. The table below lists our requested permissions and their exact justification:

| API / Host Permission | Type | Reason / Justification |
|-----------------------|------|------------------------|
| `storage` | Permission | Required to store filter settings (enable state, active categories, custom blacklist words) and statistics (total blocked count, session blocked count) locally on your device. |
| `*://*.instagram.com/*` | Host | Required to inject content scripts to analyze Instagram post captions, comment boxes, and direct messages, enabling real-time blurring and redactions. |
| `*://*.youtube.com/*` | Host | Required to inject content scripts to scan YouTube comments, video titles, and description text to automatically filter vulgar content. |

---

## 3. Privacy & Data Use Disclosure

### Data Practices
Social Guard is designed from the ground up with a **Privacy-First** philosophy. We collect **zero user data**.

* **Is any user data transferred to external servers?**
  **NO.** All text analysis, keyword matching, and filtering logic happen 100% locally inside the browser extension's isolated world context.
* **Is there any analytical tracking or telemetry?**
  **NO.** We do not integrate Google Analytics, Mixpanel, or any tracking SDKs. The "Blocked Stats" shown in the popup are stored purely in Chrome's local storage (`chrome.storage.local`) on your local machine.
* **Data Storage location:**
  All user configuration settings and stats reside exclusively in the local browser storage on your system.

---

## 4. Web Store Asset Specifications

To ensure the listing looks premium:
* **Icon (128x128px):** Saved as [icons/icon-128.png](file:///Users/chailaa/Documents/GitHub/Insta_Vulgarity_Fix/icons/icon-128.png)
* **Screenshots:** Requires at least one 1280x800 or 640x400 image showing the popup dashboard and blurred feed comments on Instagram.
* **Store Category:** `Productivity` or `Social & Communication`

---

## 5. Version History

### Version 1.0.0
* *Release Date:* May 31, 2026
* *Changes:*
  * Initial production-ready release of Social Guard.
  * Implemented core high-performance regex detection engine.
  * Structured abstract modular plug-and-play `SocialAdapter` system.
  * Deployed fully featured adapters for Instagram and YouTube.
  * Designed stunning dark theme dashboard with real-time safety rating animations and custom keyword tagging controls.
  * Generated official shield asset PNG icons.
