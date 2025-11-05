import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ClaimStatus } from '@/types';
import { calculateTimelineProgress, getStatusMessage, getElapsedTime } from '@/utils/claimTimeline';
import { Colors } from '@/constants/theme';

interface ClaimProgressHeaderProps {
  status: ClaimStatus;
  createdAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  onActionPress?: () => void;
}

export default function ClaimProgressHeader({
  status,
  createdAt,
  submittedAt,
  reviewedAt,
  onActionPress,
}: ClaimProgressHeaderProps) {
  const progress = calculateTimelineProgress(status, createdAt, submittedAt, reviewedAt);
  const statusInfo = getStatusMessage(status, progress);
  const elapsed = getElapsedTime(createdAt);

  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'supplement_needed':
        return '#FF9500';
      case 'pending_review':
      case 'analyzing':
        return Colors.tint;
      default:
        return Colors.icon;
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.container, { backgroundColor: statusColor + '10' }]}>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: Colors.text }]}>{statusInfo.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>
        <Text style={[styles.elapsed, { color: Colors.icon }]}>{elapsed}</Text>
      </View>

      {/* Message */}
      <Text style={[styles.message, { color: Colors.text }]}>{statusInfo.message}</Text>

      {/* Progress Bar */}
      {status !== 'rejected' && status !== 'approved' && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBg, { backgroundColor: '#E5E5EA' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: statusColor,
                  width: `${progress.percentComplete}%`,
                },
              ]}
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: Colors.text }]}>
              Step {progress.currentStep} of {progress.totalSteps}
            </Text>
            <Text style={[styles.progressPercent, { color: statusColor }]}>
              {progress.percentComplete}%
            </Text>
          </View>
        </View>
      )}

      {/* Next Milestone */}
      {progress.nextMilestone && status !== 'rejected' && status !== 'approved' && (
        <View style={[styles.milestoneCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.milestoneLabel, { color: Colors.icon }]}>Next Milestone:</Text>
          <Text style={[styles.milestoneText, { color: Colors.text }]}>{progress.nextMilestone}</Text>
          {progress.estimatedTimeRemaining && (
            <Text style={[styles.milestoneTime, { color: statusColor }]}>
              ⏱ {progress.estimatedTimeRemaining}
            </Text>
          )}
        </View>
      )}

      {/* Action Button */}
      {statusInfo.action && onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: statusColor }]}
          onPress={onActionPress}
        >
          <Text style={styles.actionText}>{statusInfo.action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function getStatusLabel(status: ClaimStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'analyzing':
      return 'Analyzing';
    case 'pending_review':
      return 'Under Review';
    case 'supplement_needed':
      return 'Action Needed';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Declined';
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  elapsed: {
    fontSize: 13,
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  milestoneCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  milestoneLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  milestoneText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  milestoneTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
