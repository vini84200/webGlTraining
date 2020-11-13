import { toRadian } from "../modules/gl-matrix/common.js"
import { mat3, mat4 } from "../modules/gl-matrix/index.js"

var vertexShaderText =
    `precision mediump float;
    
    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;
    
    void main()
    {
       fragColor = vertColor;
       gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }
`
var fragmentShaderText =
    `precision mediump float;
    
    varying vec3 fragColor;
    void main()
    {
        gl_FragColor = vec4(fragColor, 1.0);
    }
`

export const InitDemo = function () {
    console.log("Initianting rendering")
    var canvas = <HTMLCanvasElement>document.getElementById('game-surface')
    var gl = canvas.getContext('webgl');

    if (!gl) {
        alert("Your browser doesn't support WebGL")
    }

    // Resetando o fundo

    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Shaders

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    gl.shaderSource(vertexShader, vertexShaderText)
    gl.shaderSource(fragmentShader, fragmentShaderText)

    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR Compiling vertex shader", gl.getShaderInfoLog(vertexShader))
        return;
    }

    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("ERROR Compiling fragment shader", gl.getShaderInfoLog(fragmentShader))
        return;
    }

    // Program

    var program = gl.createProgram()
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERRROR linking program!", gl.getProgramInfoLog(program))
        return;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("ERRROR validating program!", gl.getProgramInfoLog(program))
        return;
    }

    //
    // Create Buffer
    //

    var triangleVertices = [
        // X,   Y,   Z,         R,   G,   B 
         0.0,  0.5, 0.0,        1.0, 1.0, 0.0,
        -0.5, -0.5, 0.0,        1.0, 0.0, 1.0,
         0.5, -0.5, 0.0,        0.1, 1.0, 0.6,
         
    ]

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
    gl.vertexAttribPointer(
        positionAttribLocation, // att location
        3, // number of elements per attribute
        gl.FLOAT, //type of elements
        false, // normalized
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset
    );

    gl.vertexAttribPointer(
        colorAttribLocation, // att location
        3, // number of elements per attribute
        gl.FLOAT, //type of elements
        false, // normalized
        6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // offset
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    
    gl.useProgram(program)

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView')
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

    var worldMatrix = new Float32Array(16)
    var viewMatrix = new Float32Array(16)
    var projMatrix = new Float32Array(16)

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0,0, -2], [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, toRadian(45), canvas.width/ canvas.height, 0.1, 1000.0)

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
    gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
    gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)


    //
    // Main render loop
    //
    var identityMatrix = new Float32Array(16)
    mat4.identity(identityMatrix)

    var angle = 0
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI
        
        mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0])
        gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)

        gl.clearColor(0.75,0.85,0.8, 1.0)

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

        gl.drawArrays(gl.TRIANGLES, 0, 3)

        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
}

InitDemo()