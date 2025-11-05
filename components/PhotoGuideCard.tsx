import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PhotoGuide } from '@/utils/photoGuidance';
import { Colors } from '@/constants/theme';

interface PhotoGuideCardProps {
  guide: PhotoGuide;
  isCompleted?: boolean;
  onPress?: () => void;
}

export default function PhotoGuideCard({ guide, isCompleted = false, onPress }: PhotoGuideCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isCompleted ? '#34C75915' : '#f2f2f7' },
        { borderColor: isCompleted ? '#34C759' : 'transparent' },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{guide.icon}</Text>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.title, { color: Colors.text }]}>{guide.title}</Text>
              {guide.required && !isCompleted && (
                <View style={[styles.requiredBadge, { backgroundColor: Colors.tint + '20' }]}>
                  <Text style={[styles.requiredText, { color: Colors.tint }]}>Required</Text>
                </View>
              )}
              {isCompleted && (
                <View style={[styles.completedBadge, { backgroundColor: '#34C759' }]}>
                  <Text style={styles.completedText}>✓ Done</Text>
                </View>
              )}
            </View>
            <Text style={[styles.description, { color: Colors.icon }]}>{guide.description}</Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      {!isCompleted && (
        <View style={styles.instructions}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Instructions:</Text>
          {guide.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <Text style={[styles.bullet, { color: Colors.tint }]}>•</Text>
              <Text style={[styles.instructionText, { color: Colors.text }]}>{instruction}</Text>
            </View>
          ))}

          {guide.tips.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: Colors.text, marginTop: 12 }]}>Tips:</Text>
              {guide.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Text style={[styles.tipIcon, { color: '#FF9500' }]}>💡</Text>
                  <Text style={[styles.tipText, { color: Colors.icon }]}>{tip}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Action Button */}
      {onPress && !isCompleted && (
        <View style={styles.actionContainer}>
          <View style={[styles.actionButton, { backgroundColor: Colors.tint }]}>
            <Text style={styles.actionText}>Take This Photo</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  instructions: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 8,
  },
  tipIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  actionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
