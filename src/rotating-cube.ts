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
         0.5, -0.5, 0.0,        0.1, 1.0, 0.6
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
    mat4.identity(viewMatrix);
    mat4.identity(projMatrix);

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)
    gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
    gl.uniformMatrix4fv(matProjUniformLocation, false, projMatrix)


    //
    // Main render loop
    //

    gl.drawArrays(gl.TRIANGLES, 0, 3)
}

InitDemo()