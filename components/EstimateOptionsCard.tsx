import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { EstimateOption, EstimateComparison, getTierBadgeColor, calculateSavings } from '@/utils/estimateOptions';
import { Colors } from '@/constants/theme';

interface EstimateOptionsCardProps {
  comparison: EstimateComparison;
  selectedTier?: 'basic' | 'oem' | 'premium';
  onSelectTier?: (tier: 'basic' | 'oem' | 'premium') => void;
}

export default function EstimateOptionsCard({
  comparison,
  selectedTier,
  onSelectTier,
}: EstimateOptionsCardProps) {
  const savings = calculateSavings(comparison.basic.total, comparison.oem.total);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Repair Options</Text>
        <Text style={[styles.subtitle, { color: Colors.icon }]}>
          Choose the option that best fits your needs and budget
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
        {/* Basic Option */}
        <EstimateOptionItem
          option={comparison.basic}
          selected={selectedTier === 'basic'}
          onSelect={() => onSelectTier?.('basic')}
          savings={savings}
        />

        {/* OEM Option */}
        <EstimateOptionItem
          option={comparison.oem}
          selected={selectedTier === 'oem'}
          onSelect={() => onSelectTier?.('oem')}
        />

        {/* Premium Option */}
        <EstimateOptionItem
          option={comparison.premium}
          selected={selectedTier === 'premium'}
          onSelect={() => onSelectTier?.('premium')}
        />
      </ScrollView>

      {/* Selected Option Details */}
      {selectedTier && (
        <View style={[styles.detailsCard, { backgroundColor: '#f2f2f7' }]}>
          <Text style={[styles.detailsTitle, { color: Colors.text }]}>Cost Breakdown</Text>
          {renderBreakdown(comparison[selectedTier])}
        </View>
      )}
    </View>
  );
}

interface EstimateOptionItemProps {
  option: EstimateOption;
  selected?: boolean;
  onSelect?: () => void;
  savings?: number;
}

function EstimateOptionItem({ option, selected, onSelect, savings }: EstimateOptionItemProps) {
  const tierColor = getTierBadgeColor(option.tier);
  const isInteractive = !!onSelect;

  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        {
          backgroundColor: selected ? tierColor + '15' : '#fff',
          borderColor: selected ? tierColor : '#E5E5EA',
        },
      ]}
      onPress={onSelect}
      disabled={!isInteractive}
      activeOpacity={isInteractive ? 0.7 : 1}
    >
      {/* Badges */}
      <View style={styles.badges}>
        {option.recommended && (
          <View style={[styles.badge, { backgroundColor: '#34C759' }]}>
            <Text style={styles.badgeText}>⭐ Recommended</Text>
          </View>
        )}
        {option.popularChoice && (
          <View style={[styles.badge, { backgroundColor: Colors.tint }]}>
            <Text style={styles.badgeText}>🔥 Most Popular</Text>
          </View>
        )}
        {savings && option.tier === 'basic' && (
          <View style={[styles.badge, { backgroundColor: '#FF9500' }]}>
            <Text style={styles.badgeText}>💰 Save {savings}%</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={[styles.optionTitle, { color: tierColor }]}>{option.title}</Text>
      <Text style={[styles.optionDescription, { color: Colors.icon }]}>{option.description}</Text>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: Colors.text }]}>
          ${option.total.toLocaleString()}
        </Text>
        <Text style={[styles.priceLabel, { color: Colors.icon }]}>Total</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {option.features.map((feature, index) => (
          <Text key={index} style={[styles.feature, { color: Colors.text }]}>
            {feature}
          </Text>
        ))}
      </View>

      {/* Warranty & Timeline */}
      <View style={[styles.footer, { borderTopColor: '#E5E5EA' }]}>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: Colors.icon }]}>Warranty</Text>
          <Text style={[styles.footerValue, { color: Colors.text }]}>{option.warranty}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: Colors.icon }]}>Timeline</Text>
          <Text style={[styles.footerValue, { color: Colors.text }]}>{option.timelineEstimate}</Text>
        </View>
      </View>

      {/* Select Button */}
      {isInteractive && (
        <View style={[styles.selectButton, { backgroundColor: selected ? tierColor : '#E5E5EA' }]}>
          <Text style={[styles.selectButtonText, { color: selected ? '#fff' : Colors.text }]}>
            {selected ? '✓ Selected' : 'Select This Option'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function renderBreakdown(option: EstimateOption) {
  const items = [
    { label: 'Parts', amount: option.breakdown.parts },
    { label: 'Labor', amount: option.breakdown.labor },
    { label: 'Paint', amount: option.breakdown.paint },
    { label: 'Shop Supplies', amount: option.breakdown.shopSupplies },
    { label: 'Tax', amount: option.breakdown.tax },
  ];

  return (
    <View style={styles.breakdown}>
      {items.map((item, index) => (
        <View key={index} style={styles.breakdownRow}>
          <Text style={[styles.breakdownLabel, { color: Colors.text }]}>{item.label}</Text>
          <Text style={[styles.breakdownAmount, { color: Colors.text }]}>
            ${item.amount.toLocaleString()}
          </Text>
        </View>
      ))}
      <View style={[styles.breakdownRow, styles.totalRow, { borderTopColor: '#E5E5EA' }]}>
        <Text style={[styles.totalLabel, { color: Colors.text }]}>Total</Text>
        <Text style={[styles.totalAmount, { color: Colors.tint }]}>
          ${option.total.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  options: {
    paddingHorizontal: 16,
    gap: 16,
  },
  optionCard: {
    width: 300,
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 13,
  },
  features: {
    marginBottom: 16,
  },
  feature: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 16,
    gap: 16,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  breakdown: {
    // Container for breakdown items
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  breakdownLabel: {
    fontSize: 15,
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 2,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
});
