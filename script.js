const canvas = document.querySelector("canvas");

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
const centerLocation = gl.getUniformLocation(program, "u_center");
const zoomLocation = gl.getUniformLocation(program, "u_zoom");
const maxIterationsLocation = gl.getUniformLocation(program, "u_maxIterations");

// Mandelbrot parameters (mutable for UI controls)
let center = [-0.5, 0.0]; // Default center of Mandelbrot set
let zoom = 1.0;
let maxIterations = 100;

// Initialize UI controls
function initializeControls() {
  const centerXSlider = document.getElementById('centerX');
  const centerYSlider = document.getElementById('centerY');
  const zoomSlider = document.getElementById('zoom');
  const maxIterationsSlider = document.getElementById('maxIterations');
  const resetBtn = document.getElementById('resetBtn');
  
  const centerXValue = document.getElementById('centerXValue');
  const centerYValue = document.getElementById('centerYValue');
  const zoomValue = document.getElementById('zoomValue');
  const maxIterationsValue = document.getElementById('maxIterationsValue');
  
  // Update center X
  centerXSlider.addEventListener('input', (e) => {
    center[0] = parseFloat(e.target.value);
    centerXValue.textContent = center[0].toFixed(3);
  });
  
  // Update center Y
  centerYSlider.addEventListener('input', (e) => {
    center[1] = parseFloat(e.target.value);
    centerYValue.textContent = center[1].toFixed(3);
  });
  
  // Update zoom (using logarithmic scale for better control)
  zoomSlider.addEventListener('input', (e) => {
    // Convert linear slider value (0.1-1000) to logarithmic scale
    const sliderValue = parseFloat(e.target.value);
    zoom = sliderValue;
    zoomValue.textContent = zoom.toFixed(2);
  });
  
  // Update max iterations
  maxIterationsSlider.addEventListener('input', (e) => {
    maxIterations = parseInt(e.target.value);
    maxIterationsValue.textContent = maxIterations;
  });
  
  // Reset button
  resetBtn.addEventListener('click', () => {
    center = [-0.5, 0.0];
    zoom = 1.0;
    maxIterations = 100;
    
    centerXSlider.value = center[0];
    centerYSlider.value = center[1];
    zoomSlider.value = zoom;
    maxIterationsSlider.value = maxIterations;
    
    centerXValue.textContent = center[0].toFixed(3);
    centerYValue.textContent = center[1].toFixed(3);
    zoomValue.textContent = zoom.toFixed(2);
    maxIterationsValue.textContent = maxIterations;
  });
}

initializeControls();

function render() {
  // Update viewport if canvas size changed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  
  // Clear and draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  
  // Set uniforms
  gl.uniform2f(resolutionLocation, width, height);
  gl.uniform2f(centerLocation, center[0], center[1]);
  gl.uniform1f(zoomLocation, zoom);
  gl.uniform1i(maxIterationsLocation, maxIterations);
  
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
