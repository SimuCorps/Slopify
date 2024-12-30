            const canvas = document.getElementById("glCanvas");
            const gl = canvas.getContext("webgl2");

            if (!gl) {
              console.error("WebGL2 not supported");
              throw new Error("WebGL2 not supported");
            }

            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(
              vertexShader,
              `#version 300 es
                    in vec4 position;
                    in vec4 color;
                    out vec4 vColor;
                    uniform mat4 mvp;

                    void main() {
                        vColor = color;
                        gl_Position = mvp * position;
                    }`
            );
            gl.compileShader(vertexShader);

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(
              fragmentShader,
              `#version 300 es
                    precision mediump float;
                    in vec4 vColor;
                    out vec4 fragColor;

                    void main() {
                        fragColor = vColor;
                    }`
            );
            gl.compileShader(fragmentShader);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const positions = new Float32Array([
              // Front
              -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
              // Back
              -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
              -0.5,
            ]);

            const colors = new Float32Array([
              // Front - red
              1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
              0.0, 0.0, 1.0,
              // Back - green
              0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0,
              1.0, 0.0, 1.0,
            ]);

            const indices = new Uint16Array([
              // Front
              0, 1, 2, 0, 2, 3,
              // Back
              4, 5, 6, 4, 6, 7,
              // Top
              3, 2, 6, 3, 6, 7,
              // Bottom
              0, 1, 5, 0, 5, 4,
              // Right
              1, 2, 6, 1, 6, 5,
              // Left
              0, 3, 7, 0, 7, 4,
            ]);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);

            const positionLoc = gl.getAttribLocation(program, "position");
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionLoc);
            gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

            const colorLoc = gl.getAttribLocation(program, "color");
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.enableVertexAttribArray(colorLoc);
            gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

            gl.enable(gl.DEPTH_TEST);
            gl.viewport(0, 0, canvas.width, canvas.height);

            const mvpLoc = gl.getUniformLocation(program, "mvp");
            let rotation = 0;

            function render() {
              rotation += 0.01;

              const aspect = canvas.width / canvas.height;
              const projectionMatrix = mat4.create();
              mat4.perspective(
                projectionMatrix,
                Math.PI / 4,
                aspect,
                0.1,
                100.0
              );

              const modelViewMatrix = mat4.create();
              mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -4]);
              mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation);
              mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation * 0.5);

              const mvpMatrix = mat4.create();
              mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

              gl.uniformMatrix4fv(mvpLoc, false, mvpMatrix);

              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              gl.drawElements(
                gl.TRIANGLES,
                indices.length,
                gl.UNSIGNED_SHORT,
                0
              );

              requestAnimationFrame(render);
            }

            // Include gl-matrix library for matrix operations
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js";
            script.onload = () => {
              gl.clearColor(0.0, 0.0, 0.0, 1.0);
              render();
            };
            document.head.appendChild(script);
