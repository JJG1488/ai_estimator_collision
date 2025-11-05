import { ClaimStatus } from '@/types';

/**
 * Claim Timeline System
 * Tracks and visualizes claim progress through various stages
 */

export interface TimelineStep {
  id: string;
  status: ClaimStatus | 'completed';
  title: string;
  description: string;
  icon: string;
  estimatedDuration?: string; // e.g., "2-4 hours", "1-2 days"
}

export interface TimelineProgress {
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
  estimatedTimeRemaining?: string;
  nextMilestone?: string;
}

/**
 * Timeline steps in order
 */
export const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'draft',
    status: 'draft',
    title: 'Creating Claim',
    description: 'Enter vehicle information and upload photos',
    icon: '📝',
    estimatedDuration: '5-10 min',
  },
  {
    id: 'analyzing',
    status: 'analyzing',
    title: 'AI Analysis',
    description: 'Our AI is analyzing damage and generating preliminary estimate',
    icon: '🤖',
    estimatedDuration: '1-2 min',
  },
  {
    id: 'pending_review',
    status: 'pending_review',
    title: 'Body Shop Review',
    description: 'Professional technician reviewing your photos and AI analysis',
    icon: '👨‍🔧',
    estimatedDuration: '4-24 hours',
  },
  {
    id: 'supplement_needed',
    status: 'supplement_needed',
    title: 'Additional Info Needed',
    description: 'Body shop needs more photos or information',
    icon: '📸',
    estimatedDuration: 'Waiting on you',
  },
  {
    id: 'approved',
    status: 'approved',
    title: 'Estimate Ready',
    description: 'Your repair estimate is complete and ready to view',
    icon: '✅',
  },
  {
    id: 'completed',
    status: 'completed',
    title: 'All Done!',
    description: 'Claim process complete',
    icon: '🎉',
  },
];

/**
 * Alternative flow for rejected claims
 */
export const REJECTED_STEP: TimelineStep = {
  id: 'rejected',
  status: 'rejected',
  title: 'Claim Declined',
  description: 'Unable to provide estimate at this time',
  icon: '❌',
};

/**
 * Get timeline step for a given status
 */
export function getStepForStatus(status: ClaimStatus): TimelineStep | undefined {
  if (status === 'rejected') {
    return REJECTED_STEP;
  }
  return TIMELINE_STEPS.find(step => step.status === status);
}

/**
 * Get step index in timeline
 */
export function getStepIndex(status: ClaimStatus): number {
  if (status === 'rejected') {
    return -1; // Special case
  }
  return TIMELINE_STEPS.findIndex(step => step.status === status);
}

/**
 * Calculate timeline progress
 */
export function calculateTimelineProgress(
  currentStatus: ClaimStatus,
  createdAt: Date,
  submittedAt?: Date,
  reviewedAt?: Date
): TimelineProgress {
  const currentStepIndex = getStepIndex(currentStatus);
  const totalSteps = TIMELINE_STEPS.length - 1; // Exclude 'completed'

  // Handle rejected separately
  if (currentStatus === 'rejected') {
    return {
      currentStep: 0,
      totalSteps,
      percentComplete: 0,
      nextMilestone: undefined,
    };
  }

  // Calculate percent complete
  const percentComplete = currentStepIndex >= 0
    ? Math.round((currentStepIndex / totalSteps) * 100)
    : 0;

  // Get next milestone
  const nextStepIndex = currentStepIndex + 1;
  const nextMilestone = nextStepIndex < TIMELINE_STEPS.length
    ? TIMELINE_STEPS[nextStepIndex].title
    : undefined;

  // Estimate time remaining
  let estimatedTimeRemaining: string | undefined;
  const now = new Date();

  switch (currentStatus) {
    case 'draft':
      estimatedTimeRemaining = '5-10 minutes to complete';
      break;
    case 'analyzing':
      estimatedTimeRemaining = '1-2 minutes';
      break;
    case 'pending_review':
      if (submittedAt) {
        const hoursSinceSubmit = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSubmit < 4) {
          estimatedTimeRemaining = `${Math.round(4 - hoursSinceSubmit)} hours`;
        } else if (hoursSinceSubmit < 24) {
          estimatedTimeRemaining = 'Within 24 hours';
        } else {
          estimatedTimeRemaining = 'Soon';
        }
      } else {
        estimatedTimeRemaining = '4-24 hours';
      }
      break;
    case 'supplement_needed':
      estimatedTimeRemaining = 'Waiting for your response';
      break;
    case 'approved':
      estimatedTimeRemaining = undefined;
      break;
  }

  return {
    currentStep: currentStepIndex + 1,
    totalSteps,
    percentComplete,
    estimatedTimeRemaining,
    nextMilestone,
  };
}

/**
 * Get timeline events for display
 */
export interface TimelineEvent {
  step: TimelineStep;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: Date;
  completedAt?: Date;
}

export function getTimelineEvents(
  currentStatus: ClaimStatus,
  createdAt: Date,
  submittedAt?: Date,
  reviewedAt?: Date
): TimelineEvent[] {
  const currentStepIndex = getStepIndex(currentStatus);
  const events: TimelineEvent[] = [];

  // Handle rejected separately
  if (currentStatus === 'rejected') {
    return TIMELINE_STEPS.slice(0, 3).map((step, index) => ({
      step,
      status: index <= 2 ? 'completed' : 'upcoming',
      timestamp: index === 0 ? createdAt : index === 1 ? submittedAt : undefined,
    })).concat([{
      step: REJECTED_STEP,
      status: 'current',
      timestamp: reviewedAt,
    }]);
  }

  // Normal flow
  TIMELINE_STEPS.forEach((step, index) => {
    let status: 'completed' | 'current' | 'upcoming';
    let timestamp: Date | undefined;

    if (index < currentStepIndex) {
      status = 'completed';
      // Assign timestamps
      if (step.status === 'draft') timestamp = createdAt;
      if (step.status === 'analyzing' && submittedAt) timestamp = submittedAt;
      if (step.status === 'pending_review' && submittedAt) timestamp = submittedAt;
    } else if (index === currentStepIndex) {
      status = 'current';
      if (step.status === 'draft') timestamp = createdAt;
      if (step.status === 'analyzing' && submittedAt) timestamp = submittedAt;
      if (step.status === 'pending_review' && submittedAt) timestamp = submittedAt;
      if (step.status === 'approved' && reviewedAt) timestamp = reviewedAt;
    } else {
      status = 'upcoming';
    }

    events.push({ step, status, timestamp });
  });

  return events;
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(status: ClaimStatus, progress: TimelineProgress): {
  title: string;
  message: string;
  action?: string;
} {
  switch (status) {
    case 'draft':
      return {
        title: 'Complete Your Claim',
        message: 'Add photos and vehicle details to submit your claim',
        action: 'Continue Editing',
      };

    case 'analyzing':
      return {
        title: 'Analyzing Damage',
        message: 'Our AI is processing your photos and generating a preliminary estimate',
        action: undefined,
      };

    case 'pending_review':
      return {
        title: 'Under Professional Review',
        message: `A body shop technician is reviewing your claim. ${progress.estimatedTimeRemaining ? `Estimated time: ${progress.estimatedTimeRemaining}` : ''}`,
        action: undefined,
      };

    case 'supplement_needed':
      return {
        title: 'More Information Needed',
        message: 'The body shop needs additional photos or details to complete your estimate',
        action: 'Provide Information',
      };

    case 'approved':
      return {
        title: 'Estimate Ready!',
        message: 'Your repair estimate is complete and ready to view',
        action: 'View Estimate',
      };

    case 'rejected':
      return {
        title: 'Unable to Provide Estimate',
        message: 'We\'re unable to provide an estimate at this time. Please contact the body shop for more information.',
        action: 'Contact Support',
      };

    default:
      return {
        title: 'Processing',
        message: 'Your claim is being processed',
        action: undefined,
      };
  }
}

/**
 * Get elapsed time since creation
 */
export function getElapsedTime(createdAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Format timestamp
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
