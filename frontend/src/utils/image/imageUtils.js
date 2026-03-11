// frontend/src/utils/image/imageUtils.js
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function imageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width || image.naturalWidth;
  canvas.height = image.height || image.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return canvas;
}

export function canvasToBlob(canvas, type = 'image/png', quality = 1) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

export function canvasToDataURL(canvas, type = 'image/png', quality = 1) {
  return canvas.toDataURL(type, quality);
}

export function getImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function resizeImage(image, maxWidth, maxHeight, maintainAspect = true) {
  const canvas = document.createElement('canvas');
  let { width, height } = image;

  if (maintainAspect) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = width * ratio;
    height = height * ratio;
  } else {
    width = maxWidth;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

export function cropImage(image, x, y, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return canvas;
}

export function rotateImage(image, degrees) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  canvas.width = image.width * cos + image.height * sin;
  canvas.height = image.width * sin + image.height * cos;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return canvas;
}

export function flipImage(image, horizontal = true) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  
  if (horizontal) {
    ctx.scale(-1, 1);
    ctx.drawImage(image, -image.width, 0);
  } else {
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, -image.height);
  }

  return canvas;
}

export function applyFilter(image, filter) {
  const canvas = imageToCanvas(image);
  const ctx = canvas.getContext('2d');
  
  ctx.filter = filter;
  ctx.drawImage(image, 0, 0);
  
  return canvas;
}

export function getAverageColor(image) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 1;
  canvas.height = 1;
  
  ctx.drawImage(image, 0, 0, 1, 1);
  
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  
  return { r, g, b, hex: `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}` };
}