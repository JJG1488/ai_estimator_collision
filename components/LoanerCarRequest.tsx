import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { LoanerCarRequest as LoanerCarRequestType } from '@/types';
import { Colors } from '@/constants/theme';

interface LoanerCarRequestProps {
  value: LoanerCarRequestType;
  onChange: (request: LoanerCarRequestType) => void;
}

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', icon: '🚗', description: 'Compact, fuel-efficient' },
  { value: 'suv', label: 'SUV', icon: '🚙', description: 'Spacious, versatile' },
  { value: 'truck', label: 'Truck', icon: '🛻', description: 'Heavy-duty, powerful' },
  { value: 'any', label: 'Any', icon: '✨', description: "I'm flexible" },
] as const;

const COMMON_FEATURES = [
  'Automatic transmission',
  'Backup camera',
  'Bluetooth',
  'Apple CarPlay / Android Auto',
  'Cruise control',
  'All-wheel drive',
];

export default function LoanerCarRequest({ value, onChange }: LoanerCarRequestProps) {
  const [showFeatures, setShowFeatures] = useState(false);

  const handleToggle = (needed: boolean) => {
    onChange({
      ...value,
      needed,
      preferences: needed ? value.preferences || {} : undefined,
    });
  };

  const handleTypeSelect = (type: 'sedan' | 'suv' | 'truck' | 'any') => {
    onChange({
      ...value,
      preferences: {
        ...value.preferences,
        type,
      },
    });
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = value.preferences?.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature];

    onChange({
      ...value,
      preferences: {
        ...value.preferences,
        features: newFeatures,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors.text }]}>Do you need a loaner car?</Text>
      <Text style={[styles.description, { color: Colors.icon }]}>
        We can provide a temporary vehicle while yours is being repaired
      </Text>

      {/* Yes/No Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            value.needed && { backgroundColor: Colors.tint, borderColor: Colors.tint },
          ]}
          onPress={() => handleToggle(true)}
        >
          <Text style={[styles.toggleText, value.needed && { color: '#fff', fontWeight: '700' }]}>
            Yes, please
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            !value.needed && { backgroundColor: '#8E8E93', borderColor: '#8E8E93' },
          ]}
          onPress={() => handleToggle(false)}
        >
          <Text
            style={[styles.toggleText, !value.needed && { color: '#fff', fontWeight: '700' }]}
          >
            No, thanks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preferences (shown only if needed) */}
      {value.needed && (
        <View style={styles.preferencesContainer}>
          {/* Vehicle Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>Vehicle Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeGrid}>
                {VEHICLE_TYPES.map((type) => {
                  const isSelected = value.preferences?.type === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeCard,
                        isSelected && {
                          backgroundColor: Colors.tint,
                          borderColor: Colors.tint,
                        },
                      ]}
                      onPress={() => handleTypeSelect(type.value)}
                    >
                      <Text style={styles.typeIcon}>{type.icon}</Text>
                      <Text
                        style={[styles.typeLabel, isSelected && { color: '#fff', fontWeight: '700' }]}
                      >
                        {type.label}
                      </Text>
                      <Text
                        style={[
                          styles.typeDescription,
                          isSelected ? { color: '#fff' } : { color: Colors.icon },
                        ]}
                      >
                        {type.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Features (Optional) */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.featuresHeader}
              onPress={() => setShowFeatures(!showFeatures)}
            >
              <Text style={[styles.sectionTitle, { color: Colors.text }]}>
                Preferred Features (Optional)
              </Text>
              <Text style={styles.expandIcon}>{showFeatures ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {showFeatures && (
              <View style={styles.featuresGrid}>
                {COMMON_FEATURES.map((feature) => {
                  const isSelected = value.preferences?.features?.includes(feature);
                  return (
                    <TouchableOpacity
                      key={feature}
                      style={[
                        styles.featureChip,
                        isSelected && {
                          backgroundColor: Colors.tint + '20',
                          borderColor: Colors.tint,
                        },
                      ]}
                      onPress={() => handleFeatureToggle(feature)}
                    >
                      <Text
                        style={[
                          styles.featureText,
                          isSelected && { color: Colors.tint, fontWeight: '600' },
                        ]}
                      >
                        {isSelected && '✓ '}
                        {feature}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={[styles.infoText, { color: Colors.text }]}>
              Loaner car availability is subject to confirmation. We'll notify you within 24 hours.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  preferencesContainer: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.icon,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  featureText: {
    fontSize: 13,
    color: Colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    gap: 8,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
