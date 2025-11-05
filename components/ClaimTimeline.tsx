import { View, Text, StyleSheet } from 'react-native';
import { ClaimStatus } from '@/types';
import { getTimelineEvents, formatTimestamp, TimelineEvent } from '@/utils/claimTimeline';
import { Colors } from '@/constants/theme';

interface ClaimTimelineProps {
  status: ClaimStatus;
  createdAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  compact?: boolean;
}

export default function ClaimTimeline({
  status,
  createdAt,
  submittedAt,
  reviewedAt,
  compact = false,
}: ClaimTimelineProps) {
  const events = getTimelineEvents(status, createdAt, submittedAt, reviewedAt);

  const getStatusColor = (eventStatus: TimelineEvent['status']) => {
    switch (eventStatus) {
      case 'completed':
        return '#34C759';
      case 'current':
        return Colors.tint;
      case 'upcoming':
        return '#C7C7CC';
      default:
        return '#C7C7CC';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {events.map((event, index) => {
          const color = getStatusColor(event.status);
          const isLast = index === events.length - 1;

          return (
            <View key={event.step.id} style={styles.compactEvent}>
              <View style={styles.compactDot}>
                <View style={[styles.dot, { backgroundColor: color }]}>
                  {event.status === 'current' && <View style={styles.dotPulse} />}
                </View>
                {!isLast && <View style={[styles.compactLine, { backgroundColor: color }]} />}
              </View>
              <View style={styles.compactContent}>
                <Text style={[styles.compactIcon, { opacity: event.status === 'upcoming' ? 0.4 : 1 }]}>
                  {event.step.icon}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f2f2f7' }]}>
      <Text style={[styles.title, { color: Colors.text }]}>Claim Progress</Text>

      <View style={styles.timeline}>
        {events.map((event, index) => {
          const color = getStatusColor(event.status);
          const isLast = index === events.length - 1;

          return (
            <View key={event.step.id} style={styles.event}>
              {/* Timeline Line */}
              <View style={styles.timelineColumn}>
                <View style={[styles.dot, { backgroundColor: color }]}>
                  {event.status === 'current' && (
                    <View style={[styles.dotPulse, { borderColor: color }]} />
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor: event.status === 'completed' ? color : '#E5E5EA',
                      },
                    ]}
                  />
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: event.status === 'current' ? color + '10' : '#fff',
                      borderColor: event.status === 'current' ? color : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.icon}>{event.step.icon}</Text>
                    <View style={styles.cardTitleContainer}>
                      <Text
                        style={[
                          styles.cardTitle,
                          {
                            color: event.status === 'upcoming' ? Colors.icon : Colors.text,
                            fontWeight: event.status === 'current' ? '700' : '600',
                          },
                        ]}
                      >
                        {event.step.title}
                      </Text>
                      {event.status === 'current' && (
                        <View style={[styles.currentBadge, { backgroundColor: color }]}>
                          <Text style={styles.currentText}>In Progress</Text>
                        </View>
                      )}
                      {event.status === 'completed' && (
                        <Text style={[styles.completedBadge, { color: '#34C759' }]}>✓</Text>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.description,
                      { color: event.status === 'upcoming' ? Colors.icon : Colors.text },
                    ]}
                  >
                    {event.step.description}
                  </Text>

                  {event.timestamp && (
                    <Text style={[styles.timestamp, { color: Colors.icon }]}>
                      {formatTimestamp(event.timestamp)}
                    </Text>
                  )}

                  {event.status === 'current' && event.step.estimatedDuration && (
                    <View style={[styles.durationBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.durationText, { color: color }]}>
                        ⏱ {event.step.estimatedDuration}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  timeline: {
    // Container for events
  },
  event: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dotPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.3,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: 4,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 17,
    marginRight: 8,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  completedBadge: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 8,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  compactEvent: {
    flex: 1,
    alignItems: 'center',
  },
  compactDot: {
    alignItems: 'center',
    marginBottom: 8,
  },
  compactLine: {
    height: 2,
    width: '100%',
    position: 'absolute',
    top: 12,
    left: '50%',
    zIndex: -1,
  },
  compactContent: {
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 20,
  },
});
