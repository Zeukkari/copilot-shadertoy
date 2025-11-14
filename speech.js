// Speech synthesis state
let isSpeaking = false;
let speechPhase = 0.0; // For animation effects
let speechStartTime = 0;
let speechInterval = null;

// sayIt function moved to index.html

// Start speech on 10 second intervals
function startSpeechInterval() {
    // Speak immediately on start
    sayIt();
    
    // Then repeat every 10 seconds
    speechInterval = setInterval(() => {
        if (!speechSynthesis.speaking) {
            sayIt();
        }
    }, 10000); // 10 seconds
}

// Stop speech interval
function stopSpeechInterval() {
    if (speechInterval) {
        clearInterval(speechInterval);
        speechInterval = null;
    }
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    isSpeaking = false;
    speechPhase = 0.0;
}

// Voices may load asynchronously - update global voices when they load
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        if (typeof availableVoices !== 'undefined') {
            availableVoices = speechSynthesis.getVoices();
            if (typeof voicesLoaded !== 'undefined') {
                voicesLoaded = true;
            }
        }
    };
}

// Update speech phase for animation (decay when not speaking)
function updateSpeechPhase() {
    if (isSpeaking) {
        // Maintain phase while speaking
        const elapsed = Date.now() - speechStartTime;
        // Create a pulsing effect during speech
        speechPhase = 0.7 + 0.3 * Math.sin(elapsed / 100.0);
    } else {
        // Decay phase when not speaking
        speechPhase *= 0.95;
    }
    requestAnimationFrame(updateSpeechPhase);
}

// Start updating speech phase
updateSpeechPhase();