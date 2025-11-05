import { PhotoAngle } from '@/types';

/**
 * Photo Guidance System
 * Provides instructions and best practices for taking damage photos
 */

export interface PhotoGuide {
  angle: PhotoAngle;
  title: string;
  description: string;
  instructions: string[];
  tips: string[];
  required: boolean;
  icon: string;
}

export interface PhotoGuidanceProgress {
  totalRequired: number;
  completed: number;
  remaining: PhotoAngle[];
  optional: PhotoAngle[];
  percentComplete: number;
}

/**
 * Photo angle guides with instructions
 */
export const PHOTO_GUIDES: Record<PhotoAngle, PhotoGuide> = {
  front: {
    angle: 'front',
    title: 'Front View',
    description: 'Capture the entire front of the vehicle',
    instructions: [
      'Stand 10-15 feet away from the vehicle',
      'Center the vehicle in the frame',
      'Include the entire front bumper, hood, and headlights',
      'Make sure the license plate is visible',
    ],
    tips: [
      'Take photo at slight angle (45°) for better depth',
      'Avoid direct sunlight creating glare',
      'Ensure ground is visible for context',
    ],
    required: true,
    icon: '🚗',
  },
  rear: {
    angle: 'rear',
    title: 'Rear View',
    description: 'Capture the entire back of the vehicle',
    instructions: [
      'Stand 10-15 feet away from the vehicle',
      'Center the vehicle in the frame',
      'Include the entire rear bumper, trunk, and taillights',
      'Capture the license plate',
    ],
    tips: [
      'Similar angle to front photo for consistency',
      'Check for damage on bumper and trunk',
    ],
    required: true,
    icon: '🚙',
  },
  driver_side: {
    angle: 'driver_side',
    title: 'Driver Side View',
    description: 'Capture the full driver side of vehicle',
    instructions: [
      'Stand 15-20 feet away',
      'Show entire side profile from front to back',
      'Include all doors, panels, and wheels',
      'Keep camera level with vehicle',
    ],
    tips: [
      'Make sure all doors are visible',
      'Look for door dings and panel damage',
    ],
    required: true,
    icon: '⬅️',
  },
  passenger_side: {
    angle: 'passenger_side',
    title: 'Passenger Side View',
    description: 'Capture the full passenger side of vehicle',
    instructions: [
      'Stand 15-20 feet away',
      'Show entire side profile from front to back',
      'Include all doors, panels, and wheels',
      'Keep camera level with vehicle',
    ],
    tips: [
      'Match the framing of driver side photo',
      'Check for scratches along body panels',
    ],
    required: true,
    icon: '➡️',
  },
  front_driver: {
    angle: 'front_driver',
    title: 'Front Driver Corner',
    description: 'Capture the front driver corner at 45° angle',
    instructions: [
      'Stand at 45° angle from the front driver corner',
      'Include front bumper, hood, and driver fender',
      'Show headlight and driver-side door',
      'Distance: 8-10 feet',
    ],
    tips: [
      'Good angle for comprehensive front damage',
      'Shows multiple panels in one shot',
    ],
    required: false,
    icon: '↖️',
  },
  front_passenger: {
    angle: 'front_passenger',
    title: 'Front Passenger Corner',
    description: 'Capture the front passenger corner at 45° angle',
    instructions: [
      'Stand at 45° angle from the front passenger corner',
      'Include front bumper, hood, and passenger fender',
      'Show headlight and passenger-side door',
      'Distance: 8-10 feet',
    ],
    tips: [
      'Mirror the front driver corner photo',
      'Check for asymmetric damage',
    ],
    required: false,
    icon: '↗️',
  },
  rear_driver: {
    angle: 'rear_driver',
    title: 'Rear Driver Corner',
    description: 'Capture the rear driver corner at 45° angle',
    instructions: [
      'Stand at 45° angle from the rear driver corner',
      'Include rear bumper, trunk, and driver quarter panel',
      'Show taillight and driver-side door',
      'Distance: 8-10 feet',
    ],
    tips: [
      'Good for rear-end damage assessment',
      'Shows multiple panels simultaneously',
    ],
    required: false,
    icon: '↙️',
  },
  rear_passenger: {
    angle: 'rear_passenger',
    title: 'Rear Passenger Corner',
    description: 'Capture the rear passenger corner at 45° angle',
    instructions: [
      'Stand at 45° angle from the rear passenger corner',
      'Include rear bumper, trunk, and passenger quarter panel',
      'Show taillight and passenger-side door',
      'Distance: 8-10 feet',
    ],
    tips: [
      'Mirror the rear driver corner photo',
      'Complete the 360° view of vehicle',
    ],
    required: false,
    icon: '↘️',
  },
  closeup: {
    angle: 'closeup',
    title: 'Damage Close-up',
    description: 'Detailed close-up photos of specific damage',
    instructions: [
      'Get within 2-3 feet of the damage',
      'Focus clearly on the damaged area',
      'Include surrounding context (6-12 inches around damage)',
      'Take multiple angles of same damage if needed',
    ],
    tips: [
      'Tap screen to focus before taking photo',
      'Good lighting is critical for details',
      'Show depth of dents, scratches, cracks',
      'Take as many as needed - no limit',
    ],
    required: true,
    icon: '🔍',
  },
};

/**
 * Get required photo angles
 */
export function getRequiredAngles(): PhotoAngle[] {
  return Object.entries(PHOTO_GUIDES)
    .filter(([_, guide]) => guide.required)
    .map(([angle]) => angle as PhotoAngle);
}

/**
 * Get optional photo angles
 */
export function getOptionalAngles(): PhotoAngle[] {
  return Object.entries(PHOTO_GUIDES)
    .filter(([_, guide]) => !guide.required)
    .map(([angle]) => angle as PhotoAngle);
}

/**
 * Calculate photo guidance progress
 */
export function calculateProgress(completedAngles: PhotoAngle[]): PhotoGuidanceProgress {
  const required = getRequiredAngles();
  const optional = getOptionalAngles();

  const completedRequired = completedAngles.filter(angle =>
    required.includes(angle)
  );

  const remaining = required.filter(angle =>
    !completedAngles.includes(angle)
  );

  const percentComplete = (completedRequired.length / required.length) * 100;

  return {
    totalRequired: required.length,
    completed: completedRequired.length,
    remaining,
    optional: optional.filter(angle => !completedAngles.includes(angle)),
    percentComplete: Math.round(percentComplete),
  };
}

/**
 * Get next recommended photo angle
 */
export function getNextRecommendedAngle(completedAngles: PhotoAngle[]): PhotoAngle | null {
  const progress = calculateProgress(completedAngles);

  // First, suggest remaining required photos
  if (progress.remaining.length > 0) {
    return progress.remaining[0];
  }

  // Then suggest optional photos
  if (progress.optional.length > 0) {
    return progress.optional[0];
  }

  // All done!
  return null;
}

/**
 * General photo taking best practices
 */
export const PHOTO_BEST_PRACTICES = {
  lighting: [
    'Take photos in daylight when possible',
    'Avoid direct sunlight causing glare or harsh shadows',
    'Overcast days provide ideal lighting',
    'If indoors, use well-lit area',
    'Turn on flash for dark areas or closeups',
  ],
  technique: [
    'Hold phone steady - use both hands',
    'Tap screen to focus before taking photo',
    'Keep phone level (not tilted)',
    'Clean your camera lens',
    'Take multiple photos of each angle',
  ],
  framing: [
    'Include some background for context',
    'Avoid cropping off parts of the vehicle',
    'Leave some space around edges',
    'Ensure license plates are legible when visible',
    'For closeups, show surrounding area',
  ],
  environment: [
    'Move vehicle to clear area if possible',
    'Remove personal items visible in photo',
    'Park on level ground',
    'Open doors/trunk if damage is inside',
    'Clean vehicle if excessively dirty (optional)',
  ],
};

/**
 * Get photo checklist status
 */
export function getPhotoChecklist(completedAngles: PhotoAngle[]): {
  item: string;
  completed: boolean;
  required: boolean;
}[] {
  const required = getRequiredAngles();

  return Object.entries(PHOTO_GUIDES).map(([angle, guide]) => ({
    item: guide.title,
    completed: completedAngles.includes(angle as PhotoAngle),
    required: required.includes(angle as PhotoAngle),
  }));
}

/**
 * Validate if minimum photos are taken
 */
export function hasMinimumPhotos(completedAngles: PhotoAngle[]): boolean {
  const progress = calculateProgress(completedAngles);
  return progress.remaining.length === 0;
}

/**
 * Get smart suggestions based on completed photos
 */
export function getSmartSuggestions(completedAngles: PhotoAngle[]): string[] {
  const suggestions: string[] = [];
  const progress = calculateProgress(completedAngles);

  // Check if missing required photos
  if (progress.remaining.length > 0) {
    suggestions.push(`📸 You still need ${progress.remaining.length} required photo(s)`);
  }

  // Check for closeup photos
  const hasCloseup = completedAngles.includes('closeup');
  if (!hasCloseup && completedAngles.length >= 4) {
    suggestions.push('🔍 Don\'t forget close-up photos of the damage!');
  }

  // Check if they have all 4 sides
  const hasFront = completedAngles.includes('front');
  const hasRear = completedAngles.includes('rear');
  const hasDriver = completedAngles.includes('driver_side');
  const hasPassenger = completedAngles.includes('passenger_side');

  if (hasFront && hasRear && hasDriver && hasPassenger) {
    suggestions.push('✓ Great! You have all 4 main angles');

    // Suggest corner shots
    if (progress.optional.length > 0) {
      suggestions.push('💡 Consider adding corner shots for better coverage');
    }
  }

  // All done
  if (progress.remaining.length === 0) {
    suggestions.push('🎉 All required photos complete! You can submit or add more closeups');
  }

  return suggestions;
}
