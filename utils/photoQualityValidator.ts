import { Photo } from '@/types';

/**
 * Photo Quality Validator
 * Validates photos for blur, lighting, resolution, and other quality metrics
 */

export interface PhotoQualityResult {
  isValid: boolean;
  score: number; // 0-100
  issues: PhotoQualityIssue[];
  warnings: PhotoQualityWarning[];
  passed: boolean;
}

export interface PhotoQualityIssue {
  type: 'blur' | 'lighting' | 'resolution' | 'size' | 'format';
  severity: 'critical' | 'warning';
  message: string;
  suggestion: string;
}

export interface PhotoQualityWarning {
  type: string;
  message: string;
}

// Quality thresholds
const QUALITY_THRESHOLDS = {
  MIN_RESOLUTION: {
    width: 800,
    height: 600,
  },
  RECOMMENDED_RESOLUTION: {
    width: 1920,
    height: 1080,
  },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_FILE_SIZE: 50 * 1024, // 50KB
  BLUR_THRESHOLD: 100, // Laplacian variance threshold
  BRIGHTNESS_RANGE: {
    min: 50,
    max: 200,
  },
};

/**
 * Validate photo quality
 * In a real implementation, this would use image processing libraries
 * For now, we'll do basic validation and provide a framework for advanced checks
 */
export async function validatePhotoQuality(
  photoUri: string,
  width?: number,
  height?: number,
  fileSize?: number
): Promise<PhotoQualityResult> {
  const issues: PhotoQualityIssue[] = [];
  const warnings: PhotoQualityWarning[] = [];
  let score = 100;

  // 1. Resolution Check
  if (width && height) {
    if (width < QUALITY_THRESHOLDS.MIN_RESOLUTION.width || height < QUALITY_THRESHOLDS.MIN_RESOLUTION.height) {
      issues.push({
        type: 'resolution',
        severity: 'critical',
        message: `Photo resolution too low (${width}x${height})`,
        suggestion: `Please use a photo with at least ${QUALITY_THRESHOLDS.MIN_RESOLUTION.width}x${QUALITY_THRESHOLDS.MIN_RESOLUTION.height} resolution`,
      });
      score -= 30;
    } else if (width < QUALITY_THRESHOLDS.RECOMMENDED_RESOLUTION.width || height < QUALITY_THRESHOLDS.RECOMMENDED_RESOLUTION.height) {
      warnings.push({
        type: 'resolution',
        message: `Photo resolution is acceptable but could be better. Recommended: ${QUALITY_THRESHOLDS.RECOMMENDED_RESOLUTION.width}x${QUALITY_THRESHOLDS.RECOMMENDED_RESOLUTION.height}`,
      });
      score -= 10;
    }
  }

  // 2. File Size Check
  if (fileSize) {
    if (fileSize > QUALITY_THRESHOLDS.MAX_FILE_SIZE) {
      issues.push({
        type: 'size',
        severity: 'warning',
        message: 'Photo file size is very large',
        suggestion: 'Consider compressing the image to reduce upload time',
      });
      score -= 5;
    } else if (fileSize < QUALITY_THRESHOLDS.MIN_FILE_SIZE) {
      issues.push({
        type: 'size',
        severity: 'critical',
        message: 'Photo file size is suspiciously small',
        suggestion: 'This photo may be too compressed. Try taking a new photo with higher quality settings',
      });
      score -= 20;
    }
  }

  // 3. Format Check
  const isValidFormat = /\.(jpg|jpeg|png|heic|heif)$/i.test(photoUri);
  if (!isValidFormat) {
    issues.push({
      type: 'format',
      severity: 'critical',
      message: 'Unsupported image format',
      suggestion: 'Please use JPG, PNG, or HEIC format',
    });
    score -= 40;
  }

  // 4. Blur Detection (Simplified - in production use image processing library)
  // This would normally analyze the image's Laplacian variance
  // For now, we'll simulate based on file characteristics
  const blurScore = await simulateBlurDetection(photoUri, width, height);
  if (blurScore < 0.5) {
    issues.push({
      type: 'blur',
      severity: 'critical',
      message: 'Photo appears to be blurry',
      suggestion: 'Hold your phone steady and tap to focus before taking the photo',
    });
    score -= 30;
  } else if (blurScore < 0.7) {
    warnings.push({
      type: 'blur',
      message: 'Photo may be slightly blurry. Consider retaking for better results',
    });
    score -= 10;
  }

  // 5. Lighting Check (Simplified)
  const lightingScore = await simulateLightingCheck(photoUri);
  if (lightingScore < 0.4) {
    issues.push({
      type: 'lighting',
      severity: 'critical',
      message: 'Photo is too dark or too bright',
      suggestion: 'Take the photo in better lighting conditions. Avoid direct sunlight and very dark areas',
    });
    score -= 25;
  } else if (lightingScore < 0.6) {
    warnings.push({
      type: 'lighting',
      message: 'Lighting could be improved for better damage assessment',
    });
    score -= 10;
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  // Photo passes if score >= 60 and no critical issues
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const passed = score >= 60 && criticalIssues.length === 0;

  return {
    isValid: passed,
    score,
    issues,
    warnings,
    passed,
  };
}

/**
 * Simulate blur detection
 * In production, this would use actual image processing (OpenCV, TensorFlow, etc.)
 */
async function simulateBlurDetection(uri: string, width?: number, height?: number): Promise<number> {
  // Simulate analysis based on resolution
  // Lower resolution photos are more likely to appear sharp (paradoxically)
  // but we want to encourage higher quality

  if (!width || !height) return 0.7; // Default: acceptable

  const megapixels = (width * height) / 1000000;

  // Simulate: Higher MP photos with good focus score higher
  if (megapixels >= 8) return 0.85; // Excellent
  if (megapixels >= 5) return 0.75; // Good
  if (megapixels >= 2) return 0.65; // Acceptable
  return 0.45; // Poor
}

/**
 * Simulate lighting check
 * In production, this would analyze histogram and brightness levels
 */
async function simulateLightingCheck(uri: string): Promise<number> {
  // Simulate random lighting quality
  // In production, would analyze actual image brightness histogram
  const random = Math.random();

  // 70% chance of good lighting
  if (random < 0.7) return 0.8; // Good
  if (random < 0.85) return 0.55; // Acceptable
  return 0.3; // Poor
}

/**
 * Batch validate multiple photos
 */
export async function validatePhotos(photos: Photo[]): Promise<Map<string, PhotoQualityResult>> {
  const results = new Map<string, PhotoQualityResult>();

  for (const photo of photos) {
    const result = await validatePhotoQuality(
      photo.uri,
      photo.width,
      photo.height
    );
    results.set(photo.id, result);
  }

  return results;
}

/**
 * Get overall quality score for a batch of photos
 */
export function getOverallQualityScore(results: Map<string, PhotoQualityResult>): {
  averageScore: number;
  passedCount: number;
  totalCount: number;
  hasBlockingIssues: boolean;
} {
  const scores = Array.from(results.values()).map(r => r.score);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const passedCount = Array.from(results.values()).filter(r => r.passed).length;
  const hasBlockingIssues = Array.from(results.values()).some(
    r => r.issues.some(i => i.severity === 'critical')
  );

  return {
    averageScore: Math.round(averageScore),
    passedCount,
    totalCount: results.size,
    hasBlockingIssues,
  };
}

/**
 * Get quality description based on score
 */
export function getQualityDescription(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 90) {
    return { label: 'Excellent', color: '#34C759', emoji: '✓' };
  } else if (score >= 75) {
    return { label: 'Good', color: '#34C759', emoji: '✓' };
  } else if (score >= 60) {
    return { label: 'Acceptable', color: '#FF9500', emoji: '⚠️' };
  } else if (score >= 40) {
    return { label: 'Poor', color: '#FF3B30', emoji: '✗' };
  } else {
    return { label: 'Very Poor', color: '#FF3B30', emoji: '✗' };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
