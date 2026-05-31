/**
 * Automated Verification Suite for Social Guard Vulgarity Detection Engine
 */
const path = require('path');
const fs = require('fs');

// Load core/detector.js directly in Node context using vm or reading file contents
const detectorCode = fs.readFileSync(path.join(__dirname, '../core/detector.js'), 'utf8');

// Mock window/global environment
const mockGlobal = {
  globalThis: {}
};
// Execute detector code inside mocked global scope
eval(detectorCode);

const VulgarityDetector = globalThis.VulgarityDetector;

function runTests() {
  console.log("=========================================");
  console.log("  SOCIAL GUARD ENGINE: RUNNING VERIFICATION ");
  console.log("=========================================\n");

  const detector = new VulgarityDetector();
  let passedCount = 0;
  let failedCount = 0;

  function assert(assertion, message) {
    if (assertion) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  }

  // Test 1: Category - Profanity Detection
  const profanityText = "This post is full of bullshit and crap!";
  const analysis1 = detector.analyzeText(profanityText);
  assert(analysis1.isFlagged === true, "Should flag profanity content");
  assert(analysis1.matchedCategory === 'profanity', "Should map correct category: profanity");
  assert(analysis1.matchedWords.includes('bullshit') && analysis1.matchedWords.includes('crap'), "Should identify matched swear words");

  // Test 2: Category - Hate Speech Detection
  const hateText = "This person is a racist Nazi and retard!";
  const analysis2 = detector.analyzeText(hateText);
  assert(analysis2.isFlagged === true, "Should flag hate speech content");
  assert(analysis2.matchedCategory === 'hateSpeech', "Should map correct category: hateSpeech");

  // Test 3: Category - Harassment/Insults Detection
  const harassmentText = "You are a complete moron and an idiot!";
  const analysis3 = detector.analyzeText(harassmentText);
  assert(analysis3.isFlagged === true, "Should flag harassment content");
  assert(analysis3.matchedCategory === 'harassment', "Should map correct category: harassment");

  // Test 4: Settings updates & category toggles
  detector.updateSettings({
    enabledCategories: {
      profanity: false,
      hateSpeech: true,
      harassment: true
    }
  });
  const ignoredProfanity = detector.analyzeText(profanityText);
  assert(ignoredProfanity.isFlagged === false, "Should ignore profanity when category is disabled");
  
  // Re-enable for subsequent tests
  detector.updateSettings({
    enabledCategories: {
      profanity: true,
      hateSpeech: true,
      harassment: true
    }
  });

  // Test 5: Custom Blacklist
  detector.updateSettings({
    customBlacklist: ['banana', 'spaghetti']
  });
  const customBlacklistText = "This banana is totally spaghetti!";
  const analysisCustom = detector.analyzeText(customBlacklistText);
  assert(analysisCustom.isFlagged === true, "Should flag custom blacklisted words");
  assert(analysisCustom.matchedCategory === 'custom', "Should flag custom category for custom blacklist");
  assert(analysisCustom.matchedWords.includes('banana'), "Should extract custom blacklisted word");

  // Test 6: Custom Whitelist
  detector.updateSettings({
    customWhitelist: ['retardant', 'scrap'] // Words that contain substrings of vulgarities, but are benign
  });
  const whitelistedText1 = "We need flame retardant coats.";
  const whitelistedText2 = "We need metal scrap recycling.";
  const analysisWhite1 = detector.analyzeText(whitelistedText1);
  const analysisWhite2 = detector.analyzeText(whitelistedText2);
  assert(analysisWhite1.isFlagged === false, "Should bypass flagged content if matching whitelist (retard vs retardant)");
  assert(analysisWhite2.isFlagged === false, "Should bypass flagged content if matching whitelist (crap vs scrap)");

  // Test 7: Redaction methods (Asterisk/Placeholder)
  const textToRedact = "This is fuck.";
  const redactedAsterisk = detector.redactText(textToRedact, 'asterisk');
  const redactedPlaceholder = detector.redactText(textToRedact, 'placeholder');
  assert(redactedAsterisk === "This is ****.", "Should mask with asterisks when selected");
  assert(redactedPlaceholder === "[Content Filtered due to profanity]", "Should replace with clean category description in placeholder mode");

  // Test 8: Performance Benchmark (Under 1ms requirement)
  console.log("\n--- Running Regex Performance Benchmarks ---");
  const largeText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + 
                    "This is bullshit and total trash. " + 
                    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " + 
                    "You are a moron. " + 
                    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    detector.analyzeText(largeText);
  }
  const end = performance.now();
  const averageTime = (end - start) / 1000;
  
  assert(averageTime < 1.0, `Average parsing speed must be under 1ms (Actual: ${averageTime.toFixed(4)} ms)`);


  console.log("\n=========================================");
  console.log(`  VERIFICATION COMPLETED. PASSED: ${passedCount}, FAILED: ${failedCount}`);
  console.log("=========================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
