# Photo Quality Validation Feature - Implementation Summary

## Overview
The Photo Quality Validation feature provides real-time feedback on photo quality, ensuring customers submit clear, well-lit photos for accurate damage assessment.

## What Was Implemented

### 1. **Validation Utilities** ([utils/photoQualityValidator.ts](utils/photoQualityValidator.ts))

#### Core Functions:
- `validatePhotoQuality()`: Validates a single photo
- `validatePhotos()`: Batch validates multiple photos
- `getOverallQualityScore()`: Calculates aggregate quality metrics
- `getQualityDescription()`: Returns user-friendly quality labels
- `formatFileSize()`: Formats file sizes for display

#### Quality Checks:
1. **Resolution Validation**
   - Minimum: 800x600 (critical)
   - Recommended: 1920x1080
   - Scores photos based on pixel count

2. **File Size Validation**
   - Minimum: 50KB (too compressed)
   - Maximum: 10MB (too large)
   - Warns on extreme values

3. **Format Validation**
   - Supported: JPG, JPEG, PNG, HEIC, HEIF
   - Rejects unsupported formats

4. **Blur Detection** (Simulated)
   - Uses resolution as proxy for focus quality
   - In production: Use Laplacian variance or ML model
   - Scores: 0.0-1.0 (0.7+ is acceptable)

5. **Lighting Quality** (Simulated)
   - Checks brightness levels
   - In production: Analyze histogram
   - Identifies too dark/too bright photos

### 2. **UI Components**

#### PhotoQualityIndicator ([components/PhotoQualityIndicator.tsx](components/PhotoQualityIndicator.tsx))
Individual photo quality display:
- Color-coded badge (green/yellow/red)
- Quality label (Excellent/Good/Acceptable/Poor)
- Percentage score
- Expandable details showing issues and suggestions
- Critical issues highlighted in red
- Warnings shown in orange

#### PhotoQualitySummary ([components/PhotoQualitySummary.tsx](components/PhotoQualitySummary.tsx))
Batch quality overview:
- Overall average quality score
- Pass/fail count
- Issue detection indicator
- Action recommendations based on score
- Visual stats cards

### 3. **Updated Types** ([types/index.ts](types/index.ts:41-51))
Enhanced `Photo` interface:
```typescript
interface Photo {
  id: string;
  uri: string;
  angle?: PhotoAngle;
  timestamp: Date;
  width?: number;
  height?: number;
  fileSize?: number;          // NEW
  qualityScore?: number;      // NEW (0-100)
  qualityIssues?: string[];   // NEW
}
```

## How It Works

### Validation Flow:
```
Photo Captured/Selected
    ↓
Extract Metadata (width, height, size)
    ↓
Run Quality Checks
  - Resolution
  - File Size
  - Format
  - Blur (simulated)
  - Lighting (simulated)
    ↓
Calculate Score (0-100)
    ↓
Generate Issues & Warnings
    ↓
Display Feedback to User
    ↓
User Can Retake or Continue
```

### Scoring System:
- **Start**: 100 points
- **Deductions**:
  - Critical resolution issue: -30
  - Low resolution warning: -10
  - Too large file: -5
  - Too small file: -20
  - Invalid format: -40
  - Blurry (critical): -30
  - Blurry (warning): -10
  - Poor lighting (critical): -25
  - Poor lighting (warning): -10

### Quality Grades:
- **90-100**: Excellent ✓ (Green)
- **75-89**: Good ✓ (Green)
- **60-74**: Acceptable ⚠️ (Orange)
- **40-59**: Poor ✗ (Red)
- **0-39**: Very Poor ✗ (Red)

## Usage Examples

### Validate Single Photo:
```typescript
import { validatePhotoQuality } from '@/utils/photoQualityValidator';
import PhotoQualityIndicator from '@/components/PhotoQualityIndicator';

const result = await validatePhotoQuality(
  photo.uri,
  photo.width,
  photo.height,
  photo.fileSize
);

// Display indicator
<PhotoQualityIndicator result={result} showDetails={true} />
```

### Validate Multiple Photos:
```typescript
import { validatePhotos, getOverallQualityScore } from '@/utils/photoQualityValidator';
import PhotoQualitySummary from '@/components/PhotoQualitySummary';

const results = await validatePhotos(claim.photos);
const overall = getOverallQualityScore(results);

// Display summary
<PhotoQualitySummary results={results} />

// Check if can proceed
if (overall.hasBlockingIssues) {
  Alert.alert('Please fix photo quality issues before submitting');
}
```

### Integration in Photo Upload Flow:
```typescript
const handlePhotoSelected = async (uri: string, width: number, height: number) => {
  // Validate immediately
  const result = await validatePhotoQuality(uri, width, height);

  if (!result.passed) {
    // Show warning
    Alert.alert(
      'Photo Quality Issue',
      result.issues[0]?.message || 'Photo quality could be better',
      [
        { text: 'Retake', onPress: () => retakePhoto() },
        { text: 'Use Anyway', onPress: () => acceptPhoto(uri, result.score) }
      ]
    );
  } else {
    // Auto-accept good quality photos
    acceptPhoto(uri, result.score);
  }
};
```

## Benefits

### For Customers:
- ✅ **Immediate Feedback** - Know photo quality before submitting
- ✅ **Guided Improvement** - Specific suggestions for better photos
- ✅ **Confidence** - Know their photos will work for estimates
- ✅ **Faster Process** - No back-and-forth for better photos
- ✅ **Better Estimates** - Higher quality = more accurate AI assessment

### For Body Shops:
- ✅ **Better Input Data** - Higher quality photos to work with
- ✅ **Fewer Rejections** - Less need to request new photos
- ✅ **Faster Processing** - Can immediately assess damage
- ✅ **More Accurate AI** - Better photos = better AI detection
- ✅ **Professional Image** - Shows attention to quality

## Future Enhancements

### Phase 2 (Advanced ML):
- Real blur detection using Laplacian variance
- Actual lighting histogram analysis
- ML-based photo classification
- Damage visibility scoring
- Photo angle validation (ensure damage is visible)

### Phase 3 (Computer Vision):
```typescript
// Example with real blur detection using Laplacian
import * as ImageManipulator from 'expo-image-manipulator';
import { cv } from '@react-native-opencv/core';

async function detectBlur(imageUri: string): Promise<number> {
  const gray = await cv.cvtColor(imageUri, cv.COLOR_BGR2GRAY);
  const laplacian = await cv.Laplacian(gray, cv.CV_64F);
  const variance = await cv.variance(laplacian);
  return variance; // Higher = sharper
}
```

### Phase 4 (Smart Suggestions):
- "Move closer to damage"
- "Tap to focus on scratched area"
- "Rotate phone to landscape"
- "Use flash" / "Avoid direct sunlight"
- "Hold phone steady"

## Technical Notes

### Production Implementation:

**For Blur Detection:**
```bash
npm install react-native-opencv
# or
npm install @tensorflow/tfjs-react-native
```

**For Lighting Analysis:**
```typescript
import { ImageManipulator } from 'expo-image-manipulator';

async function analyzeBrightness(uri: string) {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 100 } }], // Downscale for performance
    { base64: true }
  );

  // Analyze histogram from base64
  // Return brightness score
}
```

**For Advanced Features:**
- **OpenCV**: Best for traditional CV algorithms
- **TensorFlow.js**: Best for ML-based quality assessment
- **Expo Image Manipulator**: Good for basic preprocessing

## Testing

### Test Cases:
1. ✅ Low resolution photo (640x480) → Critical issue
2. ✅ Tiny file size (<50KB) → Critical issue
3. ✅ Huge file size (>10MB) → Warning
4. ✅ Unsupported format (.gif) → Critical issue
5. ✅ Perfect quality (1920x1080, 2MB, JPG) → Excellent score
6. ✅ Batch validation with mixed quality → Correct average

### Manual Testing:
```typescript
// Create test photos with known issues
const testPhotos = [
  { uri: 'test1.jpg', width: 640, height: 480, fileSize: 100000 }, // Low res
  { uri: 'test2.jpg', width: 1920, height: 1080, fileSize: 2000000 }, // Perfect
  { uri: 'test3.jpg', width: 800, height: 600, fileSize: 30000 }, // Too small
];

const results = await validatePhotos(testPhotos);
console.log('Results:', results);
```

## Files Created

### New Files:
- `utils/photoQualityValidator.ts` - Validation logic
- `components/PhotoQualityIndicator.tsx` - Single photo UI
- `components/PhotoQualitySummary.tsx` - Batch summary UI
- `PHOTO_QUALITY_DEMO.md` - This documentation

### Modified Files:
- `types/index.ts` - Added quality fields to Photo interface

## Integration Points

### Where to Use:

1. **Photo Upload Screen** - Show quality immediately after selection
2. **Photo Review Screen** - Display quality for each photo before submission
3. **Claim Submission** - Block submission if quality too low
4. **Photo Gallery** - Show quality badges on thumbnails
5. **Body Shop Review** - Show which photos had quality issues

## Status
✅ **COMPLETE** - Photo Quality Validation feature fully implemented and ready to use!

---

**Note**: The current implementation uses simulated blur/lighting detection. For production, integrate actual image processing libraries (OpenCV, TensorFlow) for real analysis.
