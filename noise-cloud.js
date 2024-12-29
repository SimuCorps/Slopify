(() => {
  const noiseCloudVertexShaderCode = `
    attribute vec4 position;
    void main() {
      gl_Position = position;
    }
  `;

  const noiseCloudFragmentShaderCode = `
    precision highp float;

    uniform float time;
    uniform vec2 resolution;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // Simplex noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 80.0 * dot(m, g);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;

      // Calculate the noise values at different frequencies
      float noise1 = snoise(uv * 1.7 + time * 0.15) * 0.97;
      float noise15 = snoise(uv * 12.7 + time * 0.125) * min(max(pow(sin(time*0.05)+1.0, 0.5), 0.35), -0.15);
      float noise2 = snoise(uv * 3.0 + time * 0.075) * 0.25;
      float noise3 = snoise(uv * 675.0 + time * 0.1) * 1.5;
      float noise4 = snoise(uv * 1000.0 + time * 0.5) * min(max(sin(time)+1.0, 0.75), 0.55);
      
      // Combine the noise values to create a shimmering effect
      float noiseComposed = noise1 * 0.45 + noise15 * 0.9 + noise2 * 0.25 + noise3 * 0.5 + noise4 * 0.6;
      
      // Apply a threshold to create a grainy texture
      float grainThreshold = 0.22;
      float grain = smoothstep(grainThreshold + 0.2, grainThreshold + 0.6, noiseComposed);

      // Set the final color
      vec3 skyBlue = vec3(0.1, 0.55, 1.0); // Rich sky blue color
      vec3 softBlack = vec3(0.8, 0.8, 0.8); // soft black color
      vec3 color = mix(softBlack, vec3(grain), 0.8);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createNoiseCloudShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function createNoiseCloudProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
  }

  const noiseCloudCanvas = document.getElementById('noise-cloud');
  noiseCloudCanvas.style.opacity = 0;
  const noiseCloudContext = noiseCloudCanvas.getContext('webgl');

  // Get the device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Wait for all images in header to load
  const header = document.getElementById('header');
  const headerImages = header.getElementsByTagName('img');
  const imageLoadPromises = Array.from(headerImages).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; // Handle errors gracefully
    });
  });

  Promise.all(imageLoadPromises).then(() => {
    // Now get header dimensions after images are loaded
    const headerRect = header.getBoundingClientRect();
    const width = headerRect.width * dpr;
    const height = headerRect.height * dpr;
    noiseCloudCanvas.width = width;
    noiseCloudCanvas.height = height;

    const noiseCloudVertexShader = createNoiseCloudShader(noiseCloudContext, noiseCloudContext.VERTEX_SHADER, noiseCloudVertexShaderCode);
    const noiseCloudFragmentShader = createNoiseCloudShader(noiseCloudContext, noiseCloudContext.FRAGMENT_SHADER, noiseCloudFragmentShaderCode);
    const noiseCloudProgram = createNoiseCloudProgram(noiseCloudContext, noiseCloudVertexShader, noiseCloudFragmentShader);

    const positionAttributeLocation = noiseCloudContext.getAttribLocation(noiseCloudProgram, 'position');
    const resolutionUniformLocation = noiseCloudContext.getUniformLocation(noiseCloudProgram, 'resolution');
    const timeUniformLocation = noiseCloudContext.getUniformLocation(noiseCloudProgram, 'time');

    const positionBuffer = noiseCloudContext.createBuffer();
    noiseCloudContext.bindBuffer(noiseCloudContext.ARRAY_BUFFER, positionBuffer);
    noiseCloudContext.bufferData(noiseCloudContext.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), noiseCloudContext.STATIC_DRAW);

    noiseCloudContext.viewport(0, 0, width, height);
    noiseCloudContext.useProgram(noiseCloudProgram);

    noiseCloudContext.enableVertexAttribArray(positionAttributeLocation);
    noiseCloudContext.bindBuffer(noiseCloudContext.ARRAY_BUFFER, positionBuffer);
    noiseCloudContext.vertexAttribPointer(positionAttributeLocation, 2, noiseCloudContext.FLOAT, false, 0, 0);

    noiseCloudContext.uniform2f(resolutionUniformLocation, width, height);

    // Set the viewport dimensions to match the noiseCloudCanvas size
    noiseCloudContext.viewport(0, 0, width, height);

    // fade in the noiseCloudCanvas element using transition on opacity
    noiseCloudCanvas.style.transition = 'opacity 1s ease-in-out';
    noiseCloudCanvas.style.opacity = 1;

    function render(time) {
      noiseCloudContext.uniform1f(timeUniformLocation, time * 0.001);
      noiseCloudContext.drawArrays(noiseCloudContext.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  });
})();