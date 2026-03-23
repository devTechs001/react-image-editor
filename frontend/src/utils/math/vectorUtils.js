// frontend/src/utils/math/vectorUtils.js

/**
 * Vector utility functions for 2D and 3D operations
 */

/**
 * Create a 2D vector
 * @param {number} x - X component
 * @param {number} y - Y component
 * @returns {{x: number, y: number}}
 */
export function vec2(x = 0, y = 0) {
  return { x, y };
}

/**
 * Create a 3D vector
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @returns {{x: number, y: number, z: number}}
 */
export function vec3(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

/**
 * Add two 2D vectors
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @returns {{x: number, y: number}}
 */
export function add2D(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Add two 3D vectors
 * @param {{x: number, y: number, z: number}} a
 * @param {{x: number, y: number, z: number}} b
 * @returns {{x: number, y: number, z: number}}
 */
export function add3D(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/**
 * Subtract two 2D vectors
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @returns {{x: number, y: number}}
 */
export function sub2D(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Subtract two 3D vectors
 * @param {{x: number, y: number, z: number}} a
 * @param {{x: number, y: number, z: number}} b
 * @returns {{x: number, y: number, z: number}}
 */
export function sub3D(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * Multiply vector by scalar (2D)
 * @param {{x: number, y: number}} v
 * @param {number} s
 * @returns {{x: number, y: number}}
 */
export function scale2D(v, s) {
  return { x: v.x * s, y: v.y * s };
}

/**
 * Multiply vector by scalar (3D)
 * @param {{x: number, y: number, z: number}} v
 * @param {number} s
 * @returns {{x: number, y: number, z: number}}
 */
export function scale3D(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

/**
 * Calculate dot product (2D)
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @returns {number}
 */
export function dot2D(a, b) {
  return a.x * b.x + a.y * b.y;
}

/**
 * Calculate dot product (3D)
 * @param {{x: number, y: number, z: number}} a
 * @param {{x: number, y: number, z: number}} b
 * @returns {number}
 */
export function dot3D(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate cross product (3D)
 * @param {{x: number, y: number, z: number}} a
 * @param {{x: number, y: number, z: number}} b
 * @returns {{x: number, y: number, z: number}}
 */
export function cross3D(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

/**
 * Calculate vector magnitude (2D)
 * @param {{x: number, y: number}} v
 * @returns {number}
 */
export function magnitude2D(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Calculate vector magnitude (3D)
 * @param {{x: number, y: number, z: number}} v
 * @returns {number}
 */
export function magnitude3D(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize vector (2D)
 * @param {{x: number, y: number}} v
 * @returns {{x: number, y: number}}
 */
export function normalize2D(v) {
  const mag = magnitude2D(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Normalize vector (3D)
 * @param {{x: number, y: number, z: number}} v
 * @returns {{x: number, y: number, z: number}}
 */
export function normalize3D(v) {
  const mag = magnitude3D(v);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}

/**
 * Calculate distance between two points (2D)
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @returns {number}
 */
export function distance2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance between two points (3D)
 * @param {{x: number, y: number, z: number}} a
 * @param {{x: number, y: number, z: number}} b
 * @returns {number}
 */
export function distance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate angle between two vectors (2D)
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @returns {number} Angle in radians
 */
export function angle2D(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Rotate vector around origin (2D)
 * @param {{x: number, y: number}} v
 * @param {number} angle - Angle in radians
 * @returns {{x: number, y: number}}
 */
export function rotate2D(v, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos
  };
}

/**
 * Linear interpolation between two vectors (2D)
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @param {number} t - Interpolation factor (0-1)
 * @returns {{x: number, y: number}}
 */
export function lerp2D(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  };
}

/**
 * Linear interpolation between two vectors (3D)
 * @param {{x: number, y: number, z: number}} a
 * @param {{x: number, y: number, z: number}} b
 * @param {number} t - Interpolation factor (0-1)
 * @returns {{x: number, y: number, z: number}}
 */
export function lerp3D(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  };
}

/**
 * Project vector onto another vector (2D)
 * @param {{x: number, y: number}} v
 * @param {{x: number, y: number}} onto
 * @returns {{x: number, y: number}}
 */
export function project2D(v, onto) {
  const ontoMagSq = dot2D(onto, onto);
  if (ontoMagSq === 0) return { x: 0, y: 0 };
  const scalar = dot2D(v, onto) / ontoMagSq;
  return scale2D(onto, scalar);
}

/**
 * Reflect vector around normal (2D)
 * @param {{x: number, y: number}} v
 * @param {{x: number, y: number}} normal
 * @returns {{x: number, y: number}}
 */
export function reflect2D(v, normal) {
  const n = normalize2D(normal);
  const dot = dot2D(v, n);
  return sub2D(v, scale2D(n, 2 * dot));
}

export default {
  vec2,
  vec3,
  add2D,
  add3D,
  sub2D,
  sub3D,
  scale2D,
  scale3D,
  dot2D,
  dot3D,
  cross3D,
  magnitude2D,
  magnitude3D,
  normalize2D,
  normalize3D,
  distance2D,
  distance3D,
  angle2D,
  rotate2D,
  lerp2D,
  lerp3D,
  project2D,
  reflect2D
};
