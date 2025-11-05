import { View, Text, StyleSheet } from 'react-native';
import { PhotoAngle } from '@/types';
import { calculateProgress, getSmartSuggestions } from '@/utils/photoGuidance';
import { Colors } from '@/constants/theme';

interface PhotoGuidanceProgressProps {
  completedAngles: PhotoAngle[];
}

export default function PhotoGuidanceProgress({ completedAngles }: PhotoGuidanceProgressProps) {
  const progress = calculateProgress(completedAngles);
  const suggestions = getSmartSuggestions(completedAngles);

  return (
    <View style={[styles.container, { backgroundColor: '#f2f2f7' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Photo Progress</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: '#E5E5EA' }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: progress.percentComplete === 100 ? '#34C759' : Colors.tint,
                width: `${progress.percentComplete}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: Colors.text }]}>
          {progress.completed} of {progress.totalRequired} required photos
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{progress.completed}</Text>
          <Text style={[styles.statLabel, { color: Colors.icon }]}>Completed</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.statValue, { color: Colors.tint }]}>{progress.remaining.length}</Text>
          <Text style={[styles.statLabel, { color: Colors.icon }]}>Remaining</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{progress.optional.length}</Text>
          <Text style={[styles.statLabel, { color: Colors.icon }]}>Optional</Text>
        </View>
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionsTitle, { color: Colors.text }]}>Smart Suggestions</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={[styles.suggestionCard, { backgroundColor: '#fff' }]}>
              <Text style={[styles.suggestionText, { color: Colors.text }]}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Completion Message */}
      {progress.percentComplete === 100 && (
        <View style={[styles.completionCard, { backgroundColor: '#34C75920', borderColor: '#34C759' }]}>
          <Text style={[styles.completionIcon, { color: '#34C759' }]}>🎉</Text>
          <Text style={[styles.completionTitle, { color: '#34C759' }]}>All Required Photos Complete!</Text>
          <Text style={[styles.completionText, { color: Colors.text }]}>
            You have all the required photos. You can now submit your claim or add more close-up shots for better accuracy.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  suggestions: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  completionCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
  },
  completionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
