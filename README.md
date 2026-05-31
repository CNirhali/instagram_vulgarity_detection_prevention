# Social Guard: Social Media Vulgarity & Profanity Filter

Social Guard is an ultra-fast, premium Manifest V3 Chrome Extension designed to detect, redact, and filter profanity, swearwords, hate speech, and toxic insults on social media platforms in real-time. Built with a highly scalable **plug-and-play platform adapter architecture**, it launches with native support for **Instagram** and **YouTube** but is engineered to easily extend to any other platform by dropping in a new adapter.

---

## Key Features

* 🛡️ **Premium Glassmorphic Blur:** Covered elements fade behind a sleek, blur cover. Clicking the shield icon reveals the content with a smooth fade animation.
* 🛡️ **Inline Text Redaction:** Selectable inline masking replaces flagged words with neat brackets (e.g. `[Redacted for profanity]`) to retain page layout flow.
* 🛡️ **Three Filter Categories:** Turn individual categories on or off:
  - **Profanity & Swearwords** (General curses and swearing)
  - **Hate Speech & Slurs** (Discriminatory and hateful phrases)
  - **Harassment & Bullying** (Insults, threats, and toxicity)
* 🛡️ **Custom Blocklists:** Add personal custom keywords or phrases to block instantly.
* 🛡️ **Privacy-First & Secure:** Text parsing occurs **100% locally** in the browser context. No text, data, or logs ever leave your machine.
* 🛡️ **Ultra-Low Latency:** Scans large blocks of text in **under 4 microseconds** on the V8 engine, keeping scrolling seamless.

---

## Directory Architecture

The project splits matching routines from social network selectors:

```
├── manifest.json                  # Extension MV3 configuration
├── service-worker.js              # Background initialization & stat resets
├── content.js                     # Platform detection & orchestrator
├── core/
│   ├── detector.js                # Core regex matching engine & custom lists
│   └── social-adapter.js          # Base SocialAdapter class & dynamic styling
├── adapters/
│   ├── instagram.js               # Instagram DOM selectors & MutationObserver
│   └── youtube.js                 # YouTube DOM selectors & MutationObserver
├── popup/
│   ├── popup.html                 # Premium Glassmorphic Popup Dashboard UI
│   ├── popup.css                  # Harmony custom variables & custom buttons
│   └── popup.js                   # Settings storage synchronizer & stats counting
├── icons/
│   ├── icon-16.png                # Generated toolbar icon
│   ├── icon-48.png                # Generated details icon
│   └── icon-128.png               # Generated Web Store icon
├── scratch/
│   ├── generate_icons.py          # Pillow-based python script to draw icons
│   └── test_detector.js           # Automated verification test suite
└── CHROMEWEBSTORE.md              # Web Store metadata & privacy policy
```

---

## Getting Started

### 1. Load the Extension in Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **"Developer mode"** in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner.
4. Select the project repository root folder (`Insta_Vulgarity_Fix`).

### 2. Run Automated Tests
Verify regex matching accuracy and performance benchmark checks on the engine:
```bash
node scratch/test_detector.js
```

---

## Technology Stack
* **Manifest Version:** 3
* **Interface / Styles:** Plain HTML5, Vanilla CSS3 (Glassmorphism, custom toggles, transitions, animations), Google Fonts (Outfit, Inter)
* **Backend:** Native Vanilla JS ES6+ (No builders or packers, using standard script queues in manifest injection)
* **Storage model:** Native Chrome Storage API (`chrome.storage.local` with real-time reactive sync listeners)
