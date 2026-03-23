// frontend/src/utils/math/matrixUtils.js

/**
 * Matrix utility functions for 2D and 3D transformations
 */

/**
 * Create a 2x2 identity matrix
 * @returns {number[][]}
 */
export function matrix2x2() {
  return [
    [1, 0],
    [0, 1]
  ];
}

/**
 * Create a 3x3 identity matrix
 * @returns {number[][]}
 */
export function matrix3x3() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

/**
 * Create a 4x4 identity matrix
 * @returns {number[][]}
 */
export function matrix4x4() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Multiply two 2x2 matrices
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
export function multiply2x2(a, b) {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1]
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1]
    ]
  ];
}

/**
 * Multiply two 3x3 matrices
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
export function multiply3x3(a, b) {
  const result = matrix3x3();
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i][j] = 0;
      for (let k = 0; k < 3; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

/**
 * Multiply two 4x4 matrices
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
export function multiply4x4(a, b) {
  const result = matrix4x4();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] = 0;
      for (let k = 0; k < 4; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

/**
 * Create a 2D translation matrix
 * @param {number} tx - Translation X
 * @param {number} ty - Translation Y
 * @returns {number[][]}
 */
export function translate2D(tx, ty) {
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1]
  ];
}

/**
 * Create a 2D rotation matrix
 * @param {number} angle - Angle in radians
 * @returns {number[][]}
 */
export function rotate2D(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1]
  ];
}

/**
 * Create a 2D scale matrix
 * @param {number} sx - Scale X
 * @param {number} sy - Scale Y
 * @returns {number[][]}
 */
export function scale2D(sx, sy) {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1]
  ];
}

/**
 * Create a 3D translation matrix
 * @param {number} tx
 * @param {number} ty
 * @param {number} tz
 * @returns {number[][]}
 */
export function translate3D(tx, ty, tz) {
  return [
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1]
  ];
}

/**
 * Create a 3D rotation matrix around X axis
 * @param {number} angle - Angle in radians
 * @returns {number[][]}
 */
export function rotateX3D(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [1, 0, 0, 0],
    [0, cos, -sin, 0],
    [0, sin, cos, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create a 3D rotation matrix around Y axis
 * @param {number} angle - Angle in radians
 * @returns {number[][]}
 */
export function rotateY3D(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [cos, 0, sin, 0],
    [0, 1, 0, 0],
    [-sin, 0, cos, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create a 3D rotation matrix around Z axis
 * @param {number} angle - Angle in radians
 * @returns {number[][]}
 */
export function rotateZ3D(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create a 3D scale matrix
 * @param {number} sx
 * @param {number} sy
 * @param {number} sz
 * @returns {number[][]}
 */
export function scale3D(sx, sy, sz) {
  return [
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, sz, 0],
    [0, 0, 0, 1]
  ];
}

/**
 * Create a 3D perspective projection matrix
 * @param {number} fov - Field of view in radians
 * @param {number} aspect - Aspect ratio
 * @param {number} near - Near plane
 * @param {number} far - Far plane
 * @returns {number[][]}
 */
export function perspective(fov, aspect, near, far) {
  const tanHalfFov = Math.tan(fov / 2);
  return [
    [1 / (aspect * tanHalfFov), 0, 0, 0],
    [0, 1 / tanHalfFov, 0, 0],
    [0, 0, -(far + near) / (far - near), -1],
    [0, 0, -(2 * far * near) / (far - near), 0]
  ];
}

/**
 * Create a 3D orthographic projection matrix
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 * @param {number} near
 * @param {number} far
 * @returns {number[][]}
 */
export function orthographic(left, right, bottom, top, near, far) {
  return [
    [2 / (right - left), 0, 0, 0],
    [0, 2 / (top - bottom), 0, 0],
    [0, 0, -2 / (far - near), 0],
    [-(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1]
  ];
}

/**
 * Transform a 2D point by a 3x3 matrix
 * @param {{x: number, y: number}} point
 * @param {number[][]} matrix
 * @returns {{x: number, y: number}}
 */
export function transformPoint2D(point, matrix) {
  const x = point.x * matrix[0][0] + point.y * matrix[0][1] + matrix[0][2];
  const y = point.x * matrix[1][0] + point.y * matrix[1][1] + matrix[1][2];
  return { x, y };
}

/**
 * Transform a 3D point by a 4x4 matrix
 * @param {{x: number, y: number, z: number}} point
 * @param {number[][]} matrix
 * @returns {{x: number, y: number, z: number}}
 */
export function transformPoint3D(point, matrix) {
  const x = point.x * matrix[0][0] + point.y * matrix[0][1] + point.z * matrix[0][2] + matrix[0][3];
  const y = point.x * matrix[1][0] + point.y * matrix[1][1] + point.z * matrix[1][2] + matrix[1][3];
  const z = point.x * matrix[2][0] + point.y * matrix[2][1] + point.z * matrix[2][2] + matrix[2][3];
  const w = point.x * matrix[3][0] + point.y * matrix[3][1] + point.z * matrix[3][2] + matrix[3][3];
  
  if (w !== 1 && w !== 0) {
    return { x: x / w, y: y / w, z: z / w };
  }
  return { x, y, z };
}

/**
 * Calculate matrix determinant (3x3)
 * @param {number[][]} matrix
 * @returns {number}
 */
export function determinant3x3(matrix) {
  return (
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
  );
}

/**
 * Calculate matrix inverse (3x3)
 * @param {number[][]} matrix
 * @returns {number[][] | null}
 */
export function inverse3x3(matrix) {
  const det = determinant3x3(matrix);
  if (Math.abs(det) < 1e-10) return null;
  
  const inv = matrix3x3();
  inv[0][0] = (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) / det;
  inv[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) / det;
  inv[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) / det;
  inv[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) / det;
  inv[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) / det;
  inv[1][2] = (matrix[0][2] * matrix[1][0] - matrix[0][0] * matrix[1][2]) / det;
  inv[2][0] = (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]) / det;
  inv[2][1] = (matrix[0][1] * matrix[2][0] - matrix[0][0] * matrix[2][1]) / det;
  inv[2][2] = (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) / det;
  
  return inv;
}

/**
 * Transpose a matrix (3x3)
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function transpose3x3(matrix) {
  return [
    [matrix[0][0], matrix[1][0], matrix[2][0]],
    [matrix[0][1], matrix[1][1], matrix[2][1]],
    [matrix[0][2], matrix[1][2], matrix[2][2]]
  ];
}

/**
 * Transpose a matrix (4x4)
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function transpose4x4(matrix) {
  const result = matrix4x4();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] = matrix[j][i];
    }
  }
  return result;
}

export default {
  matrix2x2,
  matrix3x3,
  matrix4x4,
  multiply2x2,
  multiply3x3,
  multiply4x4,
  translate2D,
  rotate2D,
  scale2D,
  translate3D,
  rotateX3D,
  rotateY3D,
  rotateZ3D,
  scale3D,
  perspective,
  orthographic,
  transformPoint2D,
  transformPoint3D,
  determinant3x3,
  inverse3x3,
  transpose3x3,
  transpose4x4
};
