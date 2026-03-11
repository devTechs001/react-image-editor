// frontend/src/hooks/core/useWebGL.js
import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for WebGL canvas management
 * @param {Object} options - WebGL context options
 */
export function useWebGL(options = {}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const {
    alpha = true,
    antialias = true,
    depth = true,
    stencil = false,
    preserveDrawingBuffer = false
  } = options;

  // Initialize WebGL context
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      const gl = canvas.getContext('webgl2', {
        alpha,
        antialias,
        depth,
        stencil,
        preserveDrawingBuffer
      }) || canvas.getContext('webgl', {
        alpha,
        antialias,
        depth,
        stencil,
        preserveDrawingBuffer
      });

      if (!gl) {
        throw new Error('WebGL not supported');
      }

      glRef.current = gl;
      setIsSupported(true);
      setIsReady(true);
      setError(null);
      return gl;
    } catch (err) {
      setError(err.message);
      setIsSupported(false);
      setIsReady(false);
      return null;
    }
  }, [alpha, antialias, depth, stencil, preserveDrawingBuffer]);

  // Resize canvas
  const resizeCanvas = useCallback((width, height) => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    
    if (!canvas || !gl) return;

    const displayWidth = width || canvas.clientWidth;
    const displayHeight = height || canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Create shader
  const createShader = useCallback((type, source) => {
    const gl = glRef.current;
    if (!gl) return null;

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${error}`);
    }

    return shader;
  }, []);

  // Create program
  const createProgram = useCallback((vertexShader, fragmentShader) => {
    const gl = glRef.current;
    if (!gl) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link error: ${error}`);
    }

    return program;
  }, []);

  // Create texture
  const createTexture = useCallback((image, options = {}) => {
    const gl = glRef.current;
    if (!gl || !image) return null;

    const {
      minFilter = gl.LINEAR,
      magFilter = gl.LINEAR,
      wrapS = gl.CLAMP_TO_EDGE,
      wrapT = gl.CLAMP_TO_EDGE
    } = options;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    return texture;
  }, []);

  // Clear canvas
  const clear = useCallback((color = [0, 0, 0, 0]) => {
    const gl = glRef.current;
    if (!gl) return;

    gl.clearColor(color[0], color[1], color[2], color[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (glRef.current) {
        // Cleanup WebGL resources if needed
        glRef.current = null;
      }
    };
  }, []);

  return {
    canvasRef,
    gl: glRef.current,
    isSupported,
    isReady,
    error,
    initWebGL,
    resizeCanvas,
    createShader,
    createProgram,
    createTexture,
    clear
  };
}

export default useWebGL;
