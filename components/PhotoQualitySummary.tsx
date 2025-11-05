import { View, Text, StyleSheet } from 'react-native';
import { PhotoQualityResult, getOverallQualityScore, getQualityDescription } from '@/utils/photoQualityValidator';
import { Colors } from '@/constants/theme';

interface PhotoQualitySummaryProps {
  results: Map<string, PhotoQualityResult>;
}

export default function PhotoQualitySummary({ results }: PhotoQualitySummaryProps) {
  const overall = getOverallQualityScore(results);
  const qualityDesc = getQualityDescription(overall.averageScore);

  return (
    <View style={[styles.container, { backgroundColor: '#f2f2f7' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Photo Quality Summary</Text>
      </View>

      {/* Overall Score */}
      <View style={[styles.scoreCard, { backgroundColor: qualityDesc.color + '15', borderColor: qualityDesc.color }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: Colors.text }]}>Overall Quality:</Text>
          <View style={styles.scoreValue}>
            <Text style={[styles.emoji, { color: qualityDesc.color }]}>{qualityDesc.emoji}</Text>
            <Text style={[styles.quality, { color: qualityDesc.color }]}>{qualityDesc.label}</Text>
            <Text style={[styles.percentage, { color: qualityDesc.color }]}>({overall.averageScore}%)</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.statValue, { color: Colors.tint }]}>{overall.passedCount}</Text>
          <Text style={[styles.statLabel, { color: Colors.icon }]}>Passed</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.statValue, { color: Colors.text }]}>{overall.totalCount}</Text>
          <Text style={[styles.statLabel, { color: Colors.icon }]}>Total Photos</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.statValue, { color: overall.hasBlockingIssues ? '#FF3B30' : '#34C759' }]}>
            {overall.hasBlockingIssues ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.icon }]}>Issues</Text>
        </View>
      </View>

      {/* Recommendation */}
      {overall.averageScore < 60 && (
        <View style={[styles.recommendationCard, { backgroundColor: '#FF3B3010', borderColor: '#FF3B30' }]}>
          <Text style={[styles.recommendationTitle, { color: '#FF3B30' }]}>Action Required</Text>
          <Text style={[styles.recommendationText, { color: Colors.text }]}>
            Some photos don't meet quality standards. Please review and retake photos with issues for more accurate damage assessment.
          </Text>
        </View>
      )}

      {overall.averageScore >= 60 && overall.averageScore < 80 && (
        <View style={[styles.recommendationCard, { backgroundColor: '#FF950010', borderColor: '#FF9500' }]}>
          <Text style={[styles.recommendationTitle, { color: '#FF9500' }]}>Acceptable Quality</Text>
          <Text style={[styles.recommendationText, { color: Colors.text }]}>
            Your photos are acceptable, but retaking some could improve estimate accuracy.
          </Text>
        </View>
      )}

      {overall.averageScore >= 80 && (
        <View style={[styles.recommendationCard, { backgroundColor: '#34C75910', borderColor: '#34C759' }]}>
          <Text style={[styles.recommendationTitle, { color: '#34C759' }]}>Great Quality!</Text>
          <Text style={[styles.recommendationText, { color: Colors.text }]}>
            Your photos meet quality standards and will provide accurate damage assessment.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  quality: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  recommendationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
