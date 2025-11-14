const canvas = document.querySelector("canvas");

// Initialize audio context (lazy initialization on first user interaction)
let audioCtx = null;
let isPlaying = false;
let audioStarted = false; // Track if audio has started
let audioStartTime = 0; // Timestamp when audio started
let beatTime = 0; // Current beat time (0-1, cycles with beat)
let beatPhase = 0; // Beat phase for animation
let lastBeatTime = 0;

// Create kick drum sound
function createKick(time) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(60, time);
  osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
  
  gainNode.gain.setValueAtTime(0.5, time);
  gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(time);
  osc.stop(time + 0.2);
}

// Create snare drum sound
function createSnare(time) {
  const noise = audioCtx.createBufferSource();
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < audioCtx.sampleRate * 0.2; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  noise.buffer = noiseBuffer;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1000;
  
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.3, time);
  gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Add a tone to the snare
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 200;
  oscGain.gain.setValueAtTime(0.1, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);
  
  noise.start(time);
  noise.stop(time + 0.2);
  osc.start(time);
  osc.stop(time + 0.1);
}

// Create hi-hat sound
function createHiHat(time) {
  const gainNode = audioCtx.createGain();
  const fundamental = 200;
  const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
  
  ratios.forEach((ratio, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = "square";
    osc.frequency.value = fundamental * ratio;
    
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 10000;
    bandpass.Q.value = 0.5;
    
    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.1 / (i + 1), time);
    env.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.connect(bandpass);
    bandpass.connect(env);
    env.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.05);
  });
}

// Create bass line
function createBass(time, note) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = "sawtooth";
  osc.frequency.value = note;
  
  gainNode.gain.setValueAtTime(0.2, time);
  gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(time);
  osc.stop(time + 0.3);
}

// Play rap beat pattern (loops forever)
function playBeat() {
  if (!audioCtx) return;
  
  const startTime = audioCtx.currentTime;
  const bpm = 90;
  const beatDuration = 60 / bpm;
  
  // Reset beat timing
  lastBeatTime = startTime;
  beatTime = 0;
  
  // Rap beat pattern (16 beats = 4 bars)
  const pattern = [
    // Bar 1
    { time: 0, kick: true, snare: false, hihat: true, bass: 0 },
    { time: 0.5, kick: false, snare: false, hihat: true, bass: 0 },
    { time: 1.0, kick: true, snare: false, hihat: true, bass: 55 }, // A1
    { time: 1.5, kick: false, snare: false, hihat: true, bass: 0 },
    { time: 2.0, kick: false, snare: true, hihat: true, bass: 0 },
    { time: 2.5, kick: false, snare: false, hihat: true, bass: 0 },
    { time: 3.0, kick: true, snare: false, hihat: true, bass: 55 },
    { time: 3.5, kick: false, snare: false, hihat: true, bass: 0 },
    // Bar 2
    { time: 4.0, kick: true, snare: false, hihat: true, bass: 0 },
    { time: 4.5, kick: false, snare: false, hihat: true, bass: 0 },
    { time: 5.0, kick: true, snare: false, hihat: true, bass: 62 }, // D2
    { time: 5.5, kick: false, snare: false, hihat: true, bass: 0 },
    { time: 6.0, kick: false, snare: true, hihat: true, bass: 0 },
    { time: 6.5, kick: false, snare: false, hihat: true, bass: 0 },
    { time: 7.0, kick: true, snare: false, hihat: true, bass: 55 },
    { time: 7.5, kick: false, snare: false, hihat: true, bass: 0 },
  ];
  
  pattern.forEach((beat) => {
    const time = startTime + beat.time * beatDuration;
    if (beat.kick) {
      createKick(time);
      // Trigger beat event for animation
      setTimeout(() => {
        beatPhase = 1.0; // Pulse on kick
      }, (time - startTime) * 1000);
    }
    if (beat.snare) {
      createSnare(time);
      // Trigger snare event
      setTimeout(() => {
        beatPhase = 0.7; // Smaller pulse on snare
      }, (time - startTime) * 1000);
    }
    if (beat.hihat) createHiHat(time);
    if (beat.bass > 0) createBass(time, beat.bass);
  });
  
  // Schedule next loop before current one finishes
  const totalDuration = 8 * beatDuration;
  setTimeout(() => {
    if (audioCtx && isPlaying) {
      playBeat(); // Loop forever
    }
  }, totalDuration * 1000 - 50); // Start next loop 50ms before current ends
  
  // Update beat time continuously during playback (loops forever)
  const updateBeatTime = () => {
    if (!audioCtx || !isPlaying) return;
    const currentAudioTime = audioCtx.currentTime;
    const elapsed = currentAudioTime - startTime;
    
    // Calculate beat time (loops every beat)
    beatTime = ((elapsed % totalDuration) % beatDuration) / beatDuration; // 0-1 cycle per beat
    
    requestAnimationFrame(updateBeatTime);
  };
  updateBeatTime();
}

// Setup audio button and autoplay - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById("play");
  
  // Function to initialize and start audio
  const startAudio = async () => {
    try {
      // Initialize audio context (required by browsers)
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume audio context if suspended (required after user interaction)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      // Start playing beat loop
      if (!isPlaying) {
        isPlaying = true;
        audioStarted = true; // Mark audio as started
        audioStartTime = Date.now(); // Record start time for transition
        playBeat();
        // Start speech interval when audio starts
        if (typeof startSpeechInterval === 'function') {
          startSpeechInterval();
        }
      }
    } catch (e) {
      console.log('Audio start failed, waiting for user interaction:', e);
      return false;
    }
    return true;
  };
  
  // Setup button click handler
  if (playButton) {
    playButton.addEventListener("click", startAudio);
  }
  
  // Function to enable autoplay on user interaction
  const enableAutoplay = async () => {
    const success = await startAudio();
    if (success) {
      // Remove listeners after successful start
      document.removeEventListener('click', enableAutoplay);
      document.removeEventListener('touchstart', enableAutoplay);
      document.removeEventListener('keydown', enableAutoplay);
      document.removeEventListener('mousedown', enableAutoplay);
    }
  };
  
  // Try to autoplay immediately on load (will likely fail due to browser policy)
  startAudio().catch(() => {
    // If autoplay fails, wait for user interaction
    // Listen for any user interaction to start audio
    document.addEventListener('click', enableAutoplay, { once: true });
    document.addEventListener('touchstart', enableAutoplay, { once: true });
    document.addEventListener('keydown', enableAutoplay, { once: true });
    document.addEventListener('mousedown', enableAutoplay, { once: true });
  });
});

const gl = getRenderingContext();
let source = document.querySelector("#vertex-shader").innerHTML;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, source);
gl.compileShader(vertexShader);

source = document.querySelector("#fragment-shader").innerHTML;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, source);
gl.compileShader(fragmentShader);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.detachShader(program, vertexShader);
gl.detachShader(program, fragmentShader);
gl.deleteShader(vertexShader);
gl.deleteShader(fragmentShader);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const linkErrLog = gl.getProgramInfoLog(program);
  cleanup();
  document.querySelector("p").textContent =
    `Shader program did not link successfully. Error log: ${linkErrLog}`;
  throw new Error("Program failed to link");
}

let buffer;
initializeAttributes();

// Get uniform locations
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const timeLocation = gl.getUniformLocation(program, "u_time");
const beatTimeLocation = gl.getUniformLocation(program, "u_beatTime");
const beatPhaseLocation = gl.getUniformLocation(program, "u_beatPhase");
const audioStartedLocation = gl.getUniformLocation(program, "u_audioStarted");
const transitionProgressLocation = gl.getUniformLocation(program, "u_transitionProgress");
const speechPhaseLocation = gl.getUniformLocation(program, "u_speechPhase");
const isSpeakingLocation = gl.getUniformLocation(program, "u_isSpeaking");

// Animation start time
let startTime = Date.now();

// Enable blending for additive effect
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

function render() {
  // Update viewport if canvas size changed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  
  // Calculate time in seconds
  const currentTime = (Date.now() - startTime) / 1000.0;
  
  // Decay beat phase over time
  beatPhase *= 0.92; // Fade out beat pulse
  
  // Calculate transition progress (0.0 to 1.0 over 3 seconds)
  let transitionProgress = 0.0;
  if (audioStarted && audioStartTime > 0) {
    const transitionDuration = 3000; // 3 seconds
    const elapsed = Date.now() - audioStartTime;
    transitionProgress = Math.min(1.0, elapsed / transitionDuration);
    // Smooth easing function (ease-out cubic)
    transitionProgress = 1.0 - Math.pow(1.0 - transitionProgress, 3.0);
  }
  
  // Clear and draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  
  // Set uniforms
  gl.uniform2f(resolutionLocation, width, height);
  gl.uniform1f(timeLocation, audioStarted ? currentTime : 0.0); // Freeze time if audio hasn't started
  gl.uniform1f(beatTimeLocation, beatTime);
  gl.uniform1f(beatPhaseLocation, beatPhase);
  gl.uniform1i(audioStartedLocation, audioStarted ? 1 : 0);
  gl.uniform1f(transitionProgressLocation, transitionProgress);
  gl.uniform1f(speechPhaseLocation, typeof speechPhase !== 'undefined' ? speechPhase : 0.0);
  gl.uniform1i(isSpeakingLocation, typeof isSpeaking !== 'undefined' && isSpeaking ? 1 : 0);
  
  // Draw full-screen quad (2 triangles = 6 vertices)
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  
  requestAnimationFrame(render);
}

render();

function getRenderingContext() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const gl = canvas.getContext("webgl");
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}

function initializeAttributes() {
  // Define full-screen quad as two triangles (covering -1 to 1 in both dimensions)
  const quadVertices = new Float32Array([
    // First triangle
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    // Second triangle
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0
  ]);
  
  // Get the attribute location
  const positionLocation = gl.getAttribLocation(program, "a_position");
  
  // Create and bind buffer
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
  
  // Enable and set up the attribute
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

function cleanup() {
  gl.useProgram(null);
  if (buffer) {
    gl.deleteBuffer(buffer);
  }
  if (program) {
    gl.deleteProgram(program);
  }
}
