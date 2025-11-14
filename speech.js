// Speech synthesis state
let isSpeaking = false;
let speechPhase = 0.0; // For animation effects
let speechStartTime = 0;
let speechInterval = null;

function sayIt() {
    const text = "Mita vittua Timo";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fi-FI";         // force Finnish
    utterance.rate = 0.8;               // natural speed
    utterance.pitch = 0.5;              // natural pitch
    utterance.volume = 1;

    // Try to pick a Finnish voice if available
    const voices = speechSynthesis.getVoices();
    const finnishVoice = voices.find(v =>
        v.lang.toLowerCase().includes("fi")
    );
    if (finnishVoice) utterance.voice = finnishVoice;

    // Track speech state
    utterance.onstart = () => {
        isSpeaking = true;
        speechStartTime = Date.now();
        speechPhase = 1.0; // Start at full intensity
    };

    utterance.onend = () => {
        isSpeaking = false;
        speechPhase = 0.0;
    };

    speechSynthesis.speak(utterance);
}

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

// Voices may load asynchronously
speechSynthesis.onvoiceschanged = () => {};

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