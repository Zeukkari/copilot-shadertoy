const canvas = document.querySelector("canvas");

// Initialize audio context (lazy initialization on first user interaction)
let audioCtx = null;

// Setup audio button - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById("play");
  if (playButton) {
    playButton.addEventListener("click", () => {
      // Initialize audio context on first click (required by browsers)
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume audio context if suspended (required after user interaction)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const osc = audioCtx.createOscillator();
      osc.type = "square";
      osc.frequency.value = 440; // A4
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1); // 1 second
    });
  }
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
  
  // Clear and draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  
  // Set uniforms
  gl.uniform2f(resolutionLocation, width, height);
  gl.uniform1f(timeLocation, currentTime);
  
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
