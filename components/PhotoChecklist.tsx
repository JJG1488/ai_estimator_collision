import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PhotoAngle } from '@/types';
import { getPhotoChecklist } from '@/utils/photoGuidance';
import { Colors } from '@/constants/theme';

interface PhotoChecklistProps {
  completedAngles: PhotoAngle[];
  compact?: boolean;
}

export default function PhotoChecklist({ completedAngles, compact = false }: PhotoChecklistProps) {
  const checklist = getPhotoChecklist(completedAngles);
  const requiredItems = checklist.filter(item => item.required);
  const optionalItems = checklist.filter(item => !item.required);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {requiredItems.map((item, index) => (
          <View key={index} style={styles.compactItem}>
            <Text style={[styles.compactIcon, { color: item.completed ? '#34C759' : Colors.icon }]}>
              {item.completed ? '✓' : '○'}
            </Text>
            <Text
              style={[
                styles.compactText,
                { color: item.completed ? Colors.text : Colors.icon },
                item.completed && styles.completedText,
              ]}
            >
              {item.item}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f2f2f7' }]}>
      <Text style={[styles.title, { color: Colors.text }]}>Photo Checklist</Text>

      {/* Required Photos */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Required Photos</Text>
        {requiredItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.checklistItem,
              { backgroundColor: item.completed ? '#34C75910' : '#fff' },
              { borderColor: item.completed ? '#34C759' : 'transparent' },
            ]}
          >
            <View style={[styles.checkbox, { backgroundColor: item.completed ? '#34C759' : '#E5E5EA' }]}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.itemText,
                { color: item.completed ? Colors.text : Colors.icon },
                item.completed && styles.itemCompleted,
              ]}
            >
              {item.item}
            </Text>
          </View>
        ))}
      </View>

      {/* Optional Photos */}
      {optionalItems.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Optional Photos
            <Text style={[styles.optional, { color: Colors.icon }]}> (Recommended)</Text>
          </Text>
          {optionalItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.checklistItem,
                { backgroundColor: item.completed ? '#FF950010' : '#fff' },
                { borderColor: item.completed ? '#FF9500' : 'transparent' },
              ]}
            >
              <View style={[styles.checkbox, { backgroundColor: item.completed ? '#FF9500' : '#E5E5EA' }]}>
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.itemText,
                  { color: item.completed ? Colors.text : Colors.icon },
                  item.completed && styles.itemCompleted,
                ]}
              >
                {item.item}
              </Text>
            </View>
          ))}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 15,
    flex: 1,
  },
  itemCompleted: {
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    gap: 6,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  compactText: {
    fontSize: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
});
