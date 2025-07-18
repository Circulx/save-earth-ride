// utils/imageUrlConverter.ts

/**
 * Converts Google Drive share URLs to direct image URLs
 * Handles various Google Drive URL formats and converts them to embeddable format
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  
  // Already a direct image URL (http/https image)
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return url;
  }
  
  // Google Drive file share URL pattern
  const driveShareMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveShareMatch) {
    const fileId = driveShareMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Google Drive open URL pattern
  const driveOpenMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (driveOpenMatch) {
    const fileId = driveOpenMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Google Photos share URL (basic conversion)
  if (url.includes('photos.google.com')) {
    // For Google Photos, you'll need to use the direct share link
    // Users should use "Copy image address" instead of share link
    console.warn('Google Photos URLs may not work directly. Use "Copy image address" instead.');
    return url;
  }
  
  // Return original URL if no conversion needed
  return url;
}

/**
 * Validates if an image URL is likely to work
 * Tests for common patterns and accessibility
 */
export function validateImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for valid URL format
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check for image-like URLs
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return true;
  }
  
  // Check for Google Drive direct URLs
  if (url.includes('drive.google.com/uc?export=view')) {
    return true;
  }
  
  // Check for other common image hosting services
  const imageHosts = [
    'imgur.com',
    'cloudinary.com',
    'amazonaws.com',
    'googleusercontent.com',
    'unsplash.com',
    'pexels.com'
  ];
  
  return imageHosts.some(host => url.includes(host));
}

/**
 * Attempts to fix common image URL issues
 * Applies multiple conversion strategies
 */
export function fixImageUrl(url: string): string {
  let fixedUrl = convertGoogleDriveUrl(url);
  
  // Ensure HTTPS
  if (fixedUrl.startsWith('http://')) {
    fixedUrl = fixedUrl.replace('http://', 'https://');
  }
  
  return fixedUrl;
}