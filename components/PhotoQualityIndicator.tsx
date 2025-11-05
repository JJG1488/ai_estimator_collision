import { View, Text, StyleSheet } from 'react-native';
import { PhotoQualityResult, getQualityDescription } from '@/utils/photoQualityValidator';
import { Colors } from '@/constants/theme';

interface PhotoQualityIndicatorProps {
  result: PhotoQualityResult;
  showDetails?: boolean;
}

export default function PhotoQualityIndicator({ result, showDetails = false }: PhotoQualityIndicatorProps) {
  const qualityDesc = getQualityDescription(result.score);

  return (
    <View style={styles.container}>
      {/* Score Badge */}
      <View style={[styles.badge, { backgroundColor: qualityDesc.color + '20', borderColor: qualityDesc.color }]}>
        <Text style={[styles.emoji, { color: qualityDesc.color }]}>{qualityDesc.emoji}</Text>
        <Text style={[styles.label, { color: qualityDesc.color }]}>{qualityDesc.label}</Text>
        <Text style={[styles.score, { color: qualityDesc.color }]}>{result.score}%</Text>
      </View>

      {/* Details */}
      {showDetails && (result.issues.length > 0 || result.warnings.length > 0) && (
        <View style={styles.details}>
          {/* Critical Issues */}
          {result.issues.filter(i => i.severity === 'critical').map((issue, index) => (
            <View key={`issue-${index}`} style={[styles.issueCard, { backgroundColor: '#FF3B3010', borderColor: '#FF3B30' }]}>
              <Text style={[styles.issueTitle, { color: '#FF3B30' }]}>✗ {issue.message}</Text>
              <Text style={[styles.issueSuggestion, { color: Colors.text }]}>{issue.suggestion}</Text>
            </View>
          ))}

          {/* Warnings */}
          {result.issues.filter(i => i.severity === 'warning').map((issue, index) => (
            <View key={`warning-${index}`} style={[styles.issueCard, { backgroundColor: '#FF950010', borderColor: '#FF9500' }]}>
              <Text style={[styles.issueTitle, { color: '#FF9500' }]}>⚠️ {issue.message}</Text>
              <Text style={[styles.issueSuggestion, { color: Colors.text }]}>{issue.suggestion}</Text>
            </View>
          ))}

          {/* General Warnings */}
          {result.warnings.map((warning, index) => (
            <View key={`warn-${index}`} style={[styles.warningCard, { backgroundColor: '#FF950010' }]}>
              <Text style={[styles.warningText, { color: '#FF9500' }]}>{warning.message}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  score: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    marginTop: 12,
    gap: 8,
  },
  issueCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  issueSuggestion: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningCard: {
    borderRadius: 8,
    padding: 10,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
