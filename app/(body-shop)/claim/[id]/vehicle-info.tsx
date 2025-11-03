import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { InsuranceForm } from '@/components/insurance-form';
import { Button } from '@/components/buttons';
import { Vehicle, InsuranceInfo } from '@/types';

export default function VehicleInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { claims, addVehicle, updateInsuranceInfo } = useClaim();
  const router = useRouter();

  const claim = claims.find((c) => c.id === id);

  const currentYear = new Date().getFullYear();
  const [vehicle, setVehicle] = useState<Vehicle>({
    year: claim?.vehicle?.year || currentYear,
    make: claim?.vehicle?.make || '',
    model: claim?.vehicle?.model || '',
    trim: claim?.vehicle?.trim || '',
    color: claim?.vehicle?.color || '',
    mileage: claim?.vehicle?.mileage,
    vin: claim?.vehicle?.vin || '',
  });

  const [showInsuranceSection, setShowInsuranceSection] = useState(false);
  const [insuranceData, setInsuranceData] = useState<InsuranceInfo>(
    claim?.insuranceInfo || {
      provider: '',
      policyNumber: '',
      claimNumber: '',
      agentName: '',
      agentPhone: '',
      agentEmail: '',
      deductible: undefined,
    }
  );
  const [insuranceIsValid, setInsuranceIsValid] = useState(false);

  const handleInsuranceChange = (data: InsuranceInfo, valid: boolean) => {
    setInsuranceData(data);
    setInsuranceIsValid(valid);
  };

  const handleContinue = async () => {
    if (!vehicle.make || !vehicle.model) {
      alert('Please enter vehicle make and model');
      return;
    }

    if (!id || !user) return;

    // Save vehicle info
    await addVehicle(id, vehicle);

    // Save insurance info if provided
    if (showInsuranceSection && insuranceIsValid) {
      try {
        await updateInsuranceInfo(id, insuranceData, user.id);
      } catch (error) {
        console.error('Failed to save insurance info:', error);
      }
    }

    router.push(`/(body-shop)/claim/${id}/photo-capture`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Vehicle Information</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Enter the vehicle details to get started
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={[styles.label, { color: Colors.text }]}>Year *</Text>
              <TextInput
                style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
                placeholder="2024"
                placeholderTextColor={Colors.textSecondary}
                value={vehicle.year?.toString() || ''}
                onChangeText={(text) => {
                  const parsedYear = parseInt(text);
                  setVehicle({
                    ...vehicle,
                    year: isNaN(parsedYear) ? currentYear : parsedYear
                  });
                }}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 2 }]}>
              <Text style={[styles.label, { color: Colors.text }]}>Make *</Text>
              <TextInput
                style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
                placeholder="Toyota"
                placeholderTextColor={Colors.textSecondary}
                value={vehicle.make}
                onChangeText={(text) => setVehicle({ ...vehicle, make: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors.text }]}>Model *</Text>
            <TextInput
              style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
              placeholder="Camry"
              placeholderTextColor={Colors.textSecondary}
              value={vehicle.model}
              onChangeText={(text) => setVehicle({ ...vehicle, model: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors.text }]}>Trim</Text>
            <TextInput
              style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
              placeholder="LE, XLE, etc."
              placeholderTextColor={Colors.textSecondary}
              value={vehicle.trim}
              onChangeText={(text) => setVehicle({ ...vehicle, trim: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={[styles.label, { color: Colors.text }]}>Color</Text>
              <TextInput
                style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
                placeholder="White"
                placeholderTextColor={Colors.textSecondary}
                value={vehicle.color}
                onChangeText={(text) => setVehicle({ ...vehicle, color: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={[styles.label, { color: Colors.text }]}>Mileage</Text>
              <TextInput
                style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
                placeholder="50000"
                placeholderTextColor={Colors.textSecondary}
                value={vehicle.mileage?.toString() || ''}
                onChangeText={(text) => {
                  const parsedMileage = parseInt(text);
                  setVehicle({
                    ...vehicle,
                    mileage: isNaN(parsedMileage) || text === '' ? undefined : parsedMileage
                  });
                }}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: Colors.text }]}>VIN</Text>
            <TextInput
              style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
              placeholder="1HGBH41JXMN109186"
              placeholderTextColor={Colors.textSecondary}
              value={vehicle.vin}
              onChangeText={(text) => setVehicle({ ...vehicle, vin: text.toUpperCase() })}
              autoCapitalize="characters"
              maxLength={17}
            />
            <Text style={[styles.hint, { color: Colors.textSecondary }]}>
              Optional: 17-character Vehicle Identification Number
            </Text>
          </View>
        </View>

        <View style={styles.insuranceSection}>
          <View style={styles.insuranceSectionHeader}>
            <Text style={[styles.insuranceSectionTitle, { color: Colors.text }]}>
              Customer Insurance (Optional)
            </Text>
            <TouchableOpacity
              onPress={() => setShowInsuranceSection(!showInsuranceSection)}
              style={[styles.toggleButton, { borderColor: Colors.tint }]}>
              <Text style={[styles.toggleButtonText, { color: Colors.tint }]}>
                {showInsuranceSection ? 'Hide' : 'Add Insurance Info'}
              </Text>
            </TouchableOpacity>
          </View>

          {showInsuranceSection && (
            <View style={styles.insuranceFormContainer}>
              <InsuranceForm
                initialData={insuranceData}
                onChange={handleInsuranceChange}
                isLocked={!!claim?.insuranceInfoLockedAt}
                showValidation={true}
              />
            </View>
          )}
        </View>

        <Button
          title="Continue to Photos"
          onPress={handleContinue}
          variant="primary"
        />

        <Text style={[styles.requiredNote, { color: Colors.textSecondary }]}>* Required fields</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  requiredNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  insuranceSection: {
    marginBottom: 24,
  },
  insuranceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insuranceSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  insuranceFormContainer: {
    marginTop: 8,
  },
});
