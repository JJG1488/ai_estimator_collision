import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { InsuranceInfo } from '@/types';

interface InsuranceFormProps {
  initialData?: InsuranceInfo;
  onChange?: (data: InsuranceInfo, isValid: boolean) => void;
  isLocked?: boolean;
  showValidation?: boolean;
  onFlagIssue?: () => void;
}

export function InsuranceForm({
  initialData,
  onChange,
  isLocked = false,
  showValidation = true,
  onFlagIssue,
}: InsuranceFormProps) {

  const [formData, setFormData] = useState<InsuranceInfo>(
    initialData || {
      provider: '',
      policyNumber: '',
      claimNumber: '',
      agentName: '',
      agentPhone: '',
      agentEmail: '',
      deductible: undefined,
    }
  );

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFieldChange = (field: keyof InsuranceInfo, value: string | number | undefined) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (onChange) {
      const isValid = validateForm(updated);
      onChange(updated, isValid);
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = (data: InsuranceInfo): boolean => {
    // Minimum required fields for "complete" status
    return !!(data.provider && data.policyNumber);
  };

  const getCompletionStatus = (): { status: string; color: string; message: string } => {
    const hasProvider = !!formData.provider;
    const hasPolicy = !!formData.policyNumber;
    const hasAgent = !!(formData.agentName || formData.agentPhone || formData.agentEmail);

    if (!hasProvider && !hasPolicy) {
      return {
        status: 'Empty',
        color: '#8E8E93',
        message: 'No insurance information provided',
      };
    }

    if (hasProvider && hasPolicy && hasAgent) {
      return {
        status: 'Complete',
        color: '#34C759',
        message: 'All insurance information provided',
      };
    }

    if (hasProvider && hasPolicy) {
      return {
        status: 'Partial',
        color: '#FF9500',
        message: 'Basic insurance info provided, agent details recommended',
      };
    }

    return {
      status: 'Incomplete',
      color: '#FF3B30',
      message: 'Missing required insurance fields',
    };
  };

  const completion = getCompletionStatus();

  return (
    <View style={styles.container}>
      {isLocked && (
        <View style={[styles.lockedBanner, { backgroundColor: '#FF9500' + '20', borderColor: '#FF9500' }]}>
          <Text style={[styles.lockedIcon, { color: '#FF9500' }]}>🔒</Text>
          <View style={styles.lockedTextContainer}>
            <Text style={[styles.lockedTitle, { color: Colors.text }]}>Insurance Info Locked</Text>
            <Text style={[styles.lockedSubtitle, { color: Colors.textSecondary }]}>
              This claim has been submitted. Insurance information cannot be modified.
            </Text>
          </View>
        </View>
      )}

      {showValidation && !isLocked && (
        <View style={[styles.statusBanner, { backgroundColor: completion.color + '20', borderColor: completion.color }]}>
          <Text style={[styles.statusText, { color: completion.color }]}>
            {completion.status}: {completion.message}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Insurance Provider</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>
            Provider Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
              touched.provider && !formData.provider && styles.inputError,
            ]}
            placeholder="e.g., State Farm, Geico, Progressive"
            placeholderTextColor={Colors.textSecondary}
            value={formData.provider}
            onChangeText={(text) => handleFieldChange('provider', text)}
            onBlur={() => handleBlur('provider')}
            editable={!isLocked}
          />
          {showValidation && touched.provider && !formData.provider && (
            <Text style={styles.errorText}>Provider name is required</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>
            Policy Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
              touched.policyNumber && !formData.policyNumber && styles.inputError,
            ]}
            placeholder="Policy number"
            placeholderTextColor={Colors.textSecondary}
            value={formData.policyNumber}
            onChangeText={(text) => handleFieldChange('policyNumber', text)}
            onBlur={() => handleBlur('policyNumber')}
            editable={!isLocked}
            autoCapitalize="characters"
          />
          {showValidation && touched.policyNumber && !formData.policyNumber && (
            <Text style={styles.errorText}>Policy number is required</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>Claim Number (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
            ]}
            placeholder="If already filed with insurance"
            placeholderTextColor={Colors.textSecondary}
            value={formData.claimNumber}
            onChangeText={(text) => handleFieldChange('claimNumber', text)}
            editable={!isLocked}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>Deductible Amount (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
            ]}
            placeholder="$500"
            placeholderTextColor={Colors.textSecondary}
            value={formData.deductible !== undefined ? formData.deductible.toString() : ''}
            onChangeText={(text) => {
              const num = parseFloat(text.replace(/[^0-9.]/g, ''));
              handleFieldChange('deductible', isNaN(num) ? undefined : num);
            }}
            editable={!isLocked}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Insurance Agent (Optional)</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>Agent Name</Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
            ]}
            placeholder="Agent's full name"
            placeholderTextColor={Colors.textSecondary}
            value={formData.agentName}
            onChangeText={(text) => handleFieldChange('agentName', text)}
            editable={!isLocked}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>Agent Phone</Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
            ]}
            placeholder="(555) 123-4567"
            placeholderTextColor={Colors.textSecondary}
            value={formData.agentPhone}
            onChangeText={(text) => handleFieldChange('agentPhone', text)}
            editable={!isLocked}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: Colors.text }]}>Agent Email</Text>
          <TextInput
            style={[
              styles.input,
              { color: Colors.text, borderColor: Colors.border, backgroundColor: isLocked ? Colors.background : 'transparent' },
            ]}
            placeholder="agent@insurance.com"
            placeholderTextColor={Colors.textSecondary}
            value={formData.agentEmail}
            onChangeText={(text) => handleFieldChange('agentEmail', text)}
            editable={!isLocked}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {onFlagIssue && !isLocked && (
        <TouchableOpacity
          style={[styles.flagButton, { borderColor: '#FF3B30' }]}
          onPress={onFlagIssue}>
          <Text style={[styles.flagButtonText, { color: '#FF3B30' }]}>🚩 Flag Insurance Issue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  lockedBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  lockedTextContainer: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lockedSubtitle: {
    fontSize: 14,
  },
  statusBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  flagButton: {
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  flagButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
