// Licensed under a BSD license. See ../license.html for license
// These funcitions are meant solely to help unclutter the tutorials.
// They are not meant as production type functions.
var gl;

define(function() {

    /**
     * Creates the HTLM for a failure message
     * @param {string} canvasContainerId id of container of th
     * canvas.
     * @return {string} The html.
     */
    var makeFailHTML = function(msg) {
            return '' + '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' + '<td align="center">' + '<div style="display: table-cell; vertical-align: middle;">' + '<div style="">' + msg + '</div>' + '</div>' + '</td></tr></table>';
        };
    /**
     * Mesasge for getting a webgl browser
     * @type {string}
     */
    var GET_A_WEBGL_BROWSER = '' + 'This page requires a browser that supports WebGL.<br/>' + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
    /**
     * Mesasge for need better hardware
     * @type {string}
     */
    var OTHER_PROBLEM = '' + "It doesn't appear your computer can support WebGL.<br/>" + '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
    /**
     * Creates a webgl context. If creation fails it will
     * change the contents of the container of the <canvas>
     * tag to an error message with the correct links for WebGL.
     * @param {Element} canvas. The canvas element to create a
     * context from.
     * @param {WebGLContextCreationAttirbutes} opt_attribs Any
     * creation attributes you want to pass in.
     * @return {WebGLRenderingContext} The created context.
     */

    function setupWebGL(canvas, opt_attribs) {
        function showLink(str) {
            var container = canvas.parentNode;
            if (container) {
                container.innerHTML = makeFailHTML(str);
            }
        }
        if (!window.WebGLRenderingContext) {
            showLink(GET_A_WEBGL_BROWSER);
            return null;
        }
        var context = create3DContext(canvas, opt_attribs);
        if (!context) {
            showLink(OTHER_PROBLEM);
        }
        return context;
    };
    /**
     * Creates a webgl context.
     * @param {!Canvas} canvas The canvas tag to get context
     * from. If one is not passed in one will be created.
     * @return {!WebGLContext} The created context.
     */

    function create3DContext(canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                context = canvas.getContext(names[ii], opt_attribs);
            }
            catch (e) {}
            if (context) {
                break;
            }
        }
        return context;
    }
    /**
     * Loads a shader.
     * @param {!WebGLContext} gl The WebGLContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {function(string): void) opt_errorCallback callback for errors.
     * @return {!WebGLShader} The created shader.
     */

    function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
        var errFn = opt_errorCallback || error;
        // Create the shader object
        var shader = gl.createShader(shaderType);
        // Load the shader source
        gl.shaderSource(shader, shaderSource);
        // Compile the shader
        gl.compileShader(shader);
        // Check the compile status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            error("*** Error compiling shader '" + shader + "':" + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };
    /**
     * Creates a program, attaches shaders, binds attrib locations, links the
     * program and calls useProgram.
     * @param {!Array.<!WebGLShader>} shaders The shaders to attach
     * @param {!Array.<string>} opt_attribs The attribs names.
     * @param {!Array.<number>} opt_locations The locations for the attribs.
     */

    function createProgram(gl, shaders, opt_attribs, opt_locations) {
        var program = gl.createProgram();
        for (var ii = 0; ii < shaders.length; ++ii) {
            gl.attachShader(program, shaders[ii]);
        }
        if (opt_attribs) {
            for (var ii = 0; ii < opt_attribs.length; ++ii) {
                gl.bindAttribLocation(
                program, opt_locations ? opt_locations[ii] : ii, opt_attribs[ii]);
            }
        }
        gl.linkProgram(program);
        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            error("Error in program linking:" + gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    };
    /**
     * Loads a shader from a script tag.
     * @param {!WebGLContext} gl The WebGLContext to use.
     * @param {string} scriptId The id of the script tag.
     * @param {number} opt_shaderType The type of shader. If not passed in it will
     * be derived from the type of the script tag.
     * @param {function(string): void) opt_errorCallback callback for errors.
     * @return {!WebGLShader} The created shader.
     */

    function createShaderFromScript(
    gl, scriptId, opt_shaderType, opt_errorCallback) {
        var shaderSource = "";
        var shaderType;
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw ("*** Error: unknown script element" + scriptId);
        }
        shaderSource = shaderScript.text;
        if (!opt_shaderType) {
            if (shaderScript.type == "x-shader/x-vertex") {
                shaderType = gl.VERTEX_SHADER;
            }
            else if (shaderScript.type == "x-shader/x-fragment") {
                shaderType = gl.FRAGMENT_SHADER;
            }
            else if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
                throw ("*** Error: unknown shader type");
                return null;
            }
        }
        return loadShader(
        gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType, opt_errorCallback);
    };

    /**
     * Provides requestAnimationFrame in a cross browser way.
     */
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */
        callback, /* DOMElement Element */
        element) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
    /**
     * Provides cancelRequestAnimationFrame in a cross browser way.
     */
    window.cancelRequestAnimFrame = (function() {
        return window.cancelCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.clearTimeout;
    })();

    /*****************************************************************
     * Check the WebGL context support
     *****************************************************************/

    var canvas = document.createElement("canvas");

    if (!
    function() {
        try {
            return ( !! (window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))));
        }
        catch (e) {
            return false;
        }
    }) {
        alert("WebGL not working..");
    }

    gl = canvas.getContext("experimental-webgl");

    if (!gl) {
        gl = canvas.getContext('webgl');
    }

    /*****************************************************************
     * Setup a GLSL program
     *****************************************************************/

    var vertexShader = createShaderFromScript(gl, "vertex-shader");
    var fragmentShader = createShaderFromScript(gl, "fragment-shader");
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var translationLocation = gl.getUniformLocation(program, "u_translation");
    var rotationLocation = gl.getUniformLocation(program, "u_rotation");
    // set the resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    /*****************************************************************
     * Create a buffer
     *****************************************************************/

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}());