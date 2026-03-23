// frontend/src/utils/math/geometryUtils.js

/**
 * Geometry utility functions for shapes and spatial calculations
 */

import { distance2D, dot2D, sub2D, add2D, scale2D } from './vectorUtils';

/**
 * Check if a point is inside a rectangle
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @returns {boolean}
 */
export function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if a point is inside a circle
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {boolean}
 */
export function pointInCircle(point, circle) {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * Check if a point is inside a polygon
 * @param {{x: number, y: number}} point
 * @param {Array<{x: number, y: number}>} polygon
 * @returns {boolean}
 */
export function pointInPolygon(point, polygon) {
  let inside = false;
  const x = point.x;
  const y = point.y;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if two rectangles intersect
 * @param {{x: number, y: number, width: number, height: number}} a
 * @param {{x: number, y: number, width: number, height: number}} b
 * @returns {boolean}
 */
export function rectsIntersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

/**
 * Check if two circles intersect
 * @param {{x: number, y: number, radius: number}} a
 * @param {{x: number, y: number, radius: number}} b
 * @returns {boolean}
 */
export function circlesIntersect(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= a.radius + b.radius;
}

/**
 * Check if rectangle and circle intersect
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {boolean}
 */
export function rectCircleIntersect(rect, circle) {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate distance from closest point to circle center
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * Calculate rectangle area
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @returns {number}
 */
export function rectArea(rect) {
  return rect.width * rect.height;
}

/**
 * Calculate circle area
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {number}
 */
export function circleArea(circle) {
  return Math.PI * circle.radius * circle.radius;
}

/**
 * Calculate polygon area using Shoelace formula
 * @param {Array<{x: number, y: number}>} polygon
 * @returns {number}
 */
export function polygonArea(polygon) {
  let area = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y);
  }
  return Math.abs(area / 2);
}

/**
 * Calculate polygon centroid
 * @param {Array<{x: number, y: number}>} polygon
 * @returns {{x: number, y: number}}
 */
export function polygonCentroid(polygon) {
  let cx = 0;
  let cy = 0;
  let area = 0;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const cross = polygon[j].x * polygon[i].y - polygon[i].x * polygon[j].y;
    cx += (polygon[j].x + polygon[i].x) * cross;
    cy += (polygon[j].y + polygon[i].y) * cross;
    area += cross;
  }

  area /= 2;
  const factor = 1 / (6 * area);

  return {
    x: cx * factor,
    y: cy * factor
  };
}

/**
 * Calculate distance from point to line segment
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} lineStart
 * @param {{x: number, y: number}} lineEnd
 * @returns {number}
 */
export function pointToLineDistance(point, lineStart, lineEnd) {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find intersection point of two lines
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @param {{x: number, y: number}} p3
 * @param {{x: number, y: number}} p4
 * @returns {{x: number, y: number} | null}
 */
export function lineIntersection(p1, p2, p3, p4) {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  if (denom === 0) return null; // Parallel lines

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1)
  };
}

/**
 * Check if two line segments intersect
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @param {{x: number, y: number}} p3
 * @param {{x: number, y: number}} p4
 * @returns {boolean}
 */
export function lineSegmentsIntersect(p1, p2, p3, p4) {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);

  if (det === 0) return false;

  const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
  const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

  return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
}

/**
 * Calculate bounding box of points
 * @param {Array<{x: number, y: number}>} points
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function boundingBox(points) {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Calculate convex hull using Graham scan
 * @param {Array<{x: number, y: number}>} points
 * @returns {Array<{x: number, y: number}>}
 */
export function convexHull(points) {
  if (points.length < 3) return points;

  // Find the lowest point
  let lowest = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[lowest].y || 
        (points[i].y === points[lowest].y && points[i].x < points[lowest].x)) {
      lowest = i;
    }
  }

  // Sort by polar angle
  const sorted = [...points];
  [sorted[0], sorted[lowest]] = [sorted[lowest], sorted[0]];
  const pivot = sorted[0];

  sorted.sort((a, b) => {
    if (a === pivot) return -1;
    if (b === pivot) return 1;
    const angle = Math.atan2(a.y - pivot.y, a.x - pivot.x) - Math.atan2(b.y - pivot.y, b.x - pivot.x);
    return angle;
  });

  // Graham scan
  const hull = [sorted[0], sorted[1]];

  for (let i = 2; i < sorted.length; i++) {
    while (hull.length > 1) {
      const top = hull[hull.length - 1];
      const nextToTop = hull[hull.length - 2];
      const cross = (top.x - nextToTop.x) * (sorted[i].y - nextToTop.y) - 
                    (top.y - nextToTop.y) * (sorted[i].x - nextToTop.x);
      if (cross > 0) break;
      hull.pop();
    }
    hull.push(sorted[i]);
  }

  return hull;
}

/**
 * Rotate a point around another point
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} center
 * @param {number} angle - Angle in radians
 * @returns {{x: number, y: number}}
 */
export function rotatePoint(point, center, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

/**
 * Scale a point relative to a center
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} center
 * @param {number} scaleX
 * @param {number} scaleY
 * @returns {{x: number, y: number}}
 */
export function scalePoint(point, center, scaleX, scaleY) {
  return {
    x: center.x + (point.x - center.x) * scaleX,
    y: center.y + (point.y - center.y) * scaleY
  };
}

/**
 * Get points along a line
 * @param {{x: number, y: number}} start
 * @param {{x: number, y: number}} end
 * @param {number} count
 * @returns {Array<{x: number, y: number}>}
 */
export function linePoints(start, end, count) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    points.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t
    });
  }
  return points;
}

/**
 * Bresenham's line algorithm
 * @param {{x: number, y: number}} start
 * @param {{x: number, y: number}} end
 * @returns {Array<{x: number, y: number}>}
 */
export function bresenhamLine(start, end) {
  const points = [];
  let x0 = Math.round(start.x);
  const y0 = Math.round(start.y);
  const x1 = Math.round(end.x);
  const y1 = Math.round(end.y);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }

  return points;
}

export default {
  pointInRect,
  pointInCircle,
  pointInPolygon,
  rectsIntersect,
  circlesIntersect,
  rectCircleIntersect,
  rectArea,
  circleArea,
  polygonArea,
  polygonCentroid,
  pointToLineDistance,
  lineIntersection,
  lineSegmentsIntersect,
  boundingBox,
  convexHull,
  rotatePoint,
  scalePoint,
  linePoints,
  bresenhamLine
};
