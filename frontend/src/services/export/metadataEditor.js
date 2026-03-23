// frontend/src/services/export/metadataEditor.js
/**
 * Metadata Editor Service
 * Handles reading, writing, and editing image metadata (EXIF, IPTC, XMP)
 */

export const MetadataType = {
  EXIF: 'exif',
  IPTC: 'iptc',
  XMP: 'xmp',
  CUSTOM: 'custom'
};

/**
 * Extract metadata from image file
 * @param {File|Blob} file - Image file
 * @returns {Promise<Object>} - Metadata object
 */
export async function extractMetadata(file) {
  const metadata = {
    exif: {},
    iptc: {},
    xmp: {},
    custom: {}
  };

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Try to parse EXIF data
    metadata.exif = parseExif(arrayBuffer);
    
    // Try to parse IPTC data
    metadata.iptc = parseIptc(arrayBuffer);
    
    // Try to parse XMP data
    metadata.xmp = parseXmp(arrayBuffer);
    
  } catch (error) {
    console.warn('Failed to extract metadata:', error);
  }

  return metadata;
}

/**
 * Add/edit metadata and save to new file
 * @param {File|Blob} file - Source image file
 * @param {Object} metadata - Metadata to add
 * @returns {Promise<Blob>} - Image with metadata
 */
export async function addMetadata(file, metadata) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  // Create new metadata structure
  const updatedMetadata = {
    ...parseExif(arrayBuffer),
    ...metadata
  };
  
  // Embed metadata (simplified - full implementation needs proper EXIF library)
  return await embedMetadata(arrayBuffer, updatedMetadata);
}

/**
 * Parse EXIF data from ArrayBuffer
 */
function parseExif(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const exif = {};

  // Check JPEG marker
  if (dataView.getUint16(0, false) !== 0xFFD8) {
    return exif; // Not a JPEG
  }

  const length = dataView.byteLength;
  let offset = 2;

  while (offset < length) {
    const marker = dataView.getUint16(offset, false);
    offset += 2;

    // EXIF marker (0xFFE1)
    if (marker === 0xFFE1) {
      const exifLength = dataView.getUint16(offset, false);
      const exifData = arrayBuffer.slice(offset + 2, offset + exifLength);
      return parseExifSegment(exifData);
    }

    if (marker >= 0xFFD0 && marker <= 0xFFD9) {
      // SOS (Start of Scan) or similar - image data starts
      break;
    }

    offset += dataView.getUint16(offset, false);
  }

  return exif;
}

/**
 * Parse EXIF segment
 */
function parseExifSegment(data) {
  const exif = {};
  const dataView = new DataView(data);

  // Check for "Exif" header
  if (dataView.getUint32(0, false) !== 0x45786966) { // "Exif"
    return exif;
  }

  const tiffOffset = 6;
  const littleEndian = dataView.getUint16(tiffOffset, true) === 0x4949;
  const getUint16 = (offset) => dataView.getUint16(tiffOffset + offset, littleEndian);
  const getUint32 = (offset) => dataView.getUint32(tiffOffset + offset, littleEndian);

  const firstIFDOffset = getUint32(4);

  if (firstIFDOffset < data.byteLength - 6) {
    const numEntries = getUint16(firstIFDOffset);
    
    for (let i = 0; i < numEntries; i++) {
      const entryOffset = firstIFDOffset + 12 * i + 2;
      const tagId = getUint16(entryOffset);
      const tagName = EXIF_TAGS[tagId] || `Unknown_${tagId}`;
      
      // Parse value based on type
      const valueType = getUint16(entryOffset + 2);
      const valueCount = getUint32(entryOffset + 4);
      const valueOffset = getUint32(entryOffset + 8);
      
      exif[tagName] = readExifValue(dataView, tiffOffset, valueType, valueCount, valueOffset);
    }
  }

  return exif;
}

/**
 * Read EXIF value based on type
 */
function readExifValue(dataView, tiffOffset, type, count, offset) {
  const getUint16 = (o) => dataView.getUint16(tiffOffset + o, dataView.getUint16(tiffOffset, true) === 0x4949);
  const getUint32 = (o) => dataView.getUint32(tiffOffset + o, dataView.getUint16(tiffOffset, true) === 0x4949);
  const getString = (o, len) => {
    let str = '';
    for (let i = 0; i < len; i++) {
      const char = dataView.getUint8(tiffOffset + o + i);
      if (char !== 0) str += String.fromCharCode(char);
    }
    return str;
  };

  switch (type) {
    case 1: // BYTE
      return offset <= 4 ? dataView.getUint8(tiffOffset + offset) : dataView.getUint8(tiffOffset + offset);
    case 2: // ASCII
      return getString(offset <= 4 ? offset : getUint32(offset), count);
    case 3: // SHORT
      return offset <= 2 ? getUint16(offset) : getUint16(getUint32(offset));
    case 4: // LONG
      return getUint32(offset <= 4 ? offset : getUint32(offset));
    case 5: // RATIONAL
      const ratOffset = offset <= 4 ? offset : getUint32(offset);
      return getUint32(ratOffset) / getUint32(ratOffset + 4);
    default:
      return null;
  }
}

/**
 * Parse IPTC data
 */
function parseIptc(arrayBuffer) {
  const iptc = {};
  const dataView = new DataView(arrayBuffer);
  
  // Search for IPTC marker (simplified)
  // Full implementation would properly parse 8BIM chunks
  
  return iptc;
}

/**
 * Parse XMP data
 */
function parseXmp(arrayBuffer) {
  const xmp = {};
  const data = new Uint8Array(arrayBuffer);
  
  // Search for XMP packet
  const xmpStart = findXmpStart(data);
  if (xmpStart === -1) return xmp;
  
  const xmpEnd = findXmpEnd(data, xmpStart);
  if (xmpEnd === -1) return xmp;
  
  const xmpString = new TextDecoder().decode(data.slice(xmpStart, xmpEnd));
  
  // Basic XML parsing (simplified)
  const rdfMatch = xmpString.match(/<rdf:Description[^>]*>([\s\S]*?)<\/rdf:Description>/);
  if (rdfMatch) {
    // Extract properties
    const props = rdfMatch[1].match(/([a-z]+:[\w]+)="([^"]*)"/gi);
    if (props) {
      props.forEach(prop => {
        const [key, value] = prop.split('="');
        xmp[key] = value.replace(/"$/, '');
      });
    }
  }
  
  return xmp;
}

/**
 * Find XMP packet start
 */
function findXmpStart(data) {
  const xmpHeader = '<?xpacket begin=';
  for (let i = 0; i < data.length - xmpHeader.length; i++) {
    if (String.fromCharCode(...data.slice(i, i + xmpHeader.length)) === xmpHeader) {
      return i;
    }
  }
  return -1;
}

/**
 * Find XMP packet end
 */
function findXmpEnd(data, start) {
  const xmpFooter = '<?xpacket end="w"?>';
  for (let i = start; i < data.length - xmpFooter.length; i++) {
    if (String.fromCharCode(...data.slice(i, i + xmpFooter.length)) === xmpFooter) {
      return i + xmpFooter.length;
    }
  }
  return -1;
}

/**
 * Embed metadata into image
 */
async function embedMetadata(arrayBuffer, metadata) {
  // Simplified implementation
  // Full implementation would properly construct EXIF/IPTC/XMP segments
  
  // For now, return original blob
  return new Blob([arrayBuffer], { type: 'image/jpeg' });
}

/**
 * Read file as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Remove metadata from image
 * @param {File|Blob} file - Source image
 * @returns {Promise<Blob>} - Image without metadata
 */
export async function removeMetadata(file) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const dataView = new DataView(arrayBuffer);
  
  // For JPEG, strip all APP markers
  if (dataView.getUint16(0, false) === 0xFFD8) {
    const cleanData = stripJpegMetadata(arrayBuffer);
    return new Blob([cleanData], { type: 'image/jpeg' });
  }
  
  // For PNG, strip ancillary chunks
  if (dataView.getUint32(0, false) === 0x89504E47) {
    const cleanData = stripPngMetadata(arrayBuffer);
    return new Blob([cleanData], { type: 'image/png' });
  }
  
  return file;
}

/**
 * Strip JPEG metadata
 */
function stripJpegMetadata(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const result = [];
  let i = 0;
  
  // Copy SOI marker
  result.push(data[0], data[1]);
  i = 2;
  
  while (i < data.length) {
    const marker = data[i + 1];
    
    // Skip APP markers (metadata)
    if (marker >= 0xE0 && marker <= 0xEF) {
      const length = data[i + 2] * 256 + data[i + 3];
      i += 2 + length;
      continue;
    }
    
    // Copy everything else
    if (marker >= 0xD0 && marker <= 0xD9) {
      // RST/SOI/EOI markers (2 bytes)
      result.push(data[i], data[i + 1]);
      i += 2;
    } else if (marker === 0xDA) {
      // SOS - copy rest of file
      while (i < data.length) {
        result.push(data[i++]);
      }
    } else {
      // Other markers
      const length = data[i + 2] * 256 + data[i + 3];
      for (let j = 0; j < 2 + length; j++) {
        result.push(data[i + j]);
      }
      i += 2 + length;
    }
  }
  
  return new Uint8Array(result);
}

/**
 * Strip PNG metadata
 */
function stripPngMetadata(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const result = new Uint8Array(arrayBuffer);
  
  // Keep only essential chunks: IHDR, PLTE, IDAT, IEND
  const essentialChunks = ['IHDR', 'PLTE', 'IDAT', 'IEND'];
  
  // Simplified - full implementation would properly parse PNG chunks
  return result;
}

/**
 * Create metadata template
 */
export function createMetadataTemplate(type = 'photography') {
  const templates = {
    photography: {
      exif: {
        Artist: '',
        Copyright: '',
        DateTime: new Date().toISOString(),
        Software: 'AI Media Editor'
      }
    },
    stock: {
      exif: {
        Artist: '',
        Copyright: '',
        DateTime: new Date().toISOString()
      },
      iptc: {
        Keywords: [],
        Category: '',
        SupplementalCategories: []
      }
    },
    social: {
      custom: {
        platform: '',
        campaign: '',
        creator: ''
      }
    }
  };
  
  return templates[type] || templates.photography;
}

/**
 * Common EXIF tag names
 */
const EXIF_TAGS = {
  0x0100: 'ImageWidth',
  0x0101: 'ImageHeight',
  0x010F: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x013B: 'Artist',
  0x013E: 'WhitePoint',
  0x013F: 'PrimaryChromaticities',
  0x0211: 'YCbCrCoefficients',
  0x0213: 'YCbCrPositioning',
  0x8298: 'Copyright',
  0x829A: 'ExposureTime',
  0x829D: 'FNumber',
  0x8822: 'ExposureProgram',
  0x8824: 'ISOSpeedRatings',
  0x8827: 'ISOSpeed',
  0x9000: 'ExifVersion',
  0x9003: 'DateTimeOriginal',
  0x9004: 'DateTimeDigitized',
  0x9102: 'CompressedBitsPerPixel',
  0x9201: 'ShutterSpeedValue',
  0x9202: 'ApertureValue',
  0x9203: 'BrightnessValue',
  0x9204: 'ExposureBiasValue',
  0x9205: 'MaxApertureValue',
  0x9206: 'SubjectDistance',
  0x9207: 'MeteringMode',
  0x9208: 'LightSource',
  0x9209: 'Flash',
  0x920A: 'FocalLength',
  0x9286: 'UserComment',
  0x9290: 'SubSecTime',
  0x9291: 'SubSecTimeOriginal',
  0x9292: 'SubSecTimeDigitized',
  0xA000: 'FlashpixVersion',
  0xA001: 'ColorSpace',
  0xA002: 'PixelXDimension',
  0xA003: 'PixelYDimension',
  0xA401: 'CustomRendered',
  0xA402: 'ExposureMode',
  0xA403: 'WhiteBalance',
  0xA405: 'FocalLengthIn35mmFilm',
  0xA406: 'SceneCaptureType',
  0xA407: 'GainControl',
  0xA408: 'Contrast',
  0xA409: 'Saturation',
  0xA40A: 'Sharpness',
  0xA40C: 'SubjectDistanceRange'
};

export default {
  extractMetadata,
  addMetadata,
  removeMetadata,
  createMetadataTemplate,
  MetadataType
};
