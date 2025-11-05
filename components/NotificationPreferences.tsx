import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { NotificationPreferences, NotificationType } from '@/utils/notifications';
import { Colors } from '@/constants/theme';

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onChange: (preferences: NotificationPreferences) => void;
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, { label: string; description: string }> = {
  claim_submitted: {
    label: 'Claim Submitted',
    description: 'When your claim is successfully submitted',
  },
  claim_approved: {
    label: 'Estimate Ready',
    description: 'When your repair estimate is complete',
  },
  claim_rejected: {
    label: 'Claim Updates',
    description: 'Important updates about your claim status',
  },
  message_received: {
    label: 'New Messages',
    description: 'When you receive a message from the body shop',
  },
  estimate_ready: {
    label: 'Estimate Completed',
    description: 'When a professional estimate is ready to view',
  },
  supplement_needed: {
    label: 'Information Requests',
    description: 'When additional information is needed',
  },
  payment_due: {
    label: 'Payment Reminders',
    description: 'Upcoming payment due dates',
  },
  payment_received: {
    label: 'Payment Confirmations',
    description: 'When your payment is received',
  },
};

export default function NotificationPreferencesComponent({
  preferences,
  onChange,
}: NotificationPreferencesProps) {
  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    onChange({ ...preferences, [key]: value });
  };

  const updateTypePreference = (type: NotificationType, value: boolean) => {
    onChange({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: value,
      },
    });
  };

  const updateQuietHours = (key: keyof NotificationPreferences['quietHours'], value: any) => {
    onChange({
      ...preferences,
      quietHours: {
        ...preferences.quietHours!,
        [key]: value,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Master Toggle */}
      <View style={[styles.section, { backgroundColor: '#f2f2f7' }]}>
        <View style={styles.masterToggle}>
          <View style={styles.masterInfo}>
            <Text style={[styles.masterTitle, { color: Colors.text }]}>Push Notifications</Text>
            <Text style={[styles.masterDescription, { color: Colors.icon }]}>
              Receive updates about your claims and messages
            </Text>
          </View>
          <Switch
            value={preferences.enabled}
            onValueChange={(value) => updatePreference('enabled', value)}
            trackColor={{ false: '#E5E5EA', true: Colors.tint + '60' }}
            thumbColor={preferences.enabled ? Colors.tint : '#fff'}
          />
        </View>
      </View>

      {preferences.enabled && (
        <>
          {/* Notification Types */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>Notification Types</Text>
            {(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((type) => {
              const { label, description } = NOTIFICATION_TYPE_LABELS[type];
              return (
                <View key={type} style={[styles.preferenceRow, { backgroundColor: '#fff' }]}>
                  <View style={styles.preferenceInfo}>
                    <Text style={[styles.preferenceLabel, { color: Colors.text }]}>{label}</Text>
                    <Text style={[styles.preferenceDescription, { color: Colors.icon }]}>
                      {description}
                    </Text>
                  </View>
                  <Switch
                    value={preferences.types[type]}
                    onValueChange={(value) => updateTypePreference(type, value)}
                    trackColor={{ false: '#E5E5EA', true: Colors.tint + '60' }}
                    thumbColor={preferences.types[type] ? Colors.tint : '#fff'}
                  />
                </View>
              );
            })}
          </View>

          {/* Quiet Hours */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>Quiet Hours</Text>
            <View style={[styles.preferenceRow, { backgroundColor: '#fff' }]}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: Colors.text }]}>Enable Quiet Hours</Text>
                <Text style={[styles.preferenceDescription, { color: Colors.icon }]}>
                  Reduce notifications during specific hours
                </Text>
              </View>
              <Switch
                value={preferences.quietHours?.enabled}
                onValueChange={(value) => updateQuietHours('enabled', value)}
                trackColor={{ false: '#E5E5EA', true: Colors.tint + '60' }}
                thumbColor={preferences.quietHours?.enabled ? Colors.tint : '#fff'}
              />
            </View>

            {preferences.quietHours?.enabled && (
              <View style={[styles.quietHoursCard, { backgroundColor: '#f2f2f7' }]}>
                <Text style={[styles.quietHoursLabel, { color: Colors.text }]}>
                  Quiet hours from {formatHour(preferences.quietHours.start)} to{' '}
                  {formatHour(preferences.quietHours.end)}
                </Text>
                <Text style={[styles.quietHoursDescription, { color: Colors.icon }]}>
                  Only high-priority notifications will be shown during quiet hours
                </Text>
              </View>
            )}
          </View>

          {/* Sound & Vibration */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>Alerts</Text>

            <View style={[styles.preferenceRow, { backgroundColor: '#fff' }]}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: Colors.text }]}>Sound</Text>
                <Text style={[styles.preferenceDescription, { color: Colors.icon }]}>
                  Play sound for notifications
                </Text>
              </View>
              <Switch
                value={preferences.sound}
                onValueChange={(value) => updatePreference('sound', value)}
                trackColor={{ false: '#E5E5EA', true: Colors.tint + '60' }}
                thumbColor={preferences.sound ? Colors.tint : '#fff'}
              />
            </View>

            <View style={[styles.preferenceRow, { backgroundColor: '#fff' }]}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: Colors.text }]}>Vibration</Text>
                <Text style={[styles.preferenceDescription, { color: Colors.icon }]}>
                  Vibrate when receiving notifications
                </Text>
              </View>
              <Switch
                value={preferences.vibrate}
                onValueChange={(value) => updatePreference('vibrate', value)}
                trackColor={{ false: '#E5E5EA', true: Colors.tint + '60' }}
                thumbColor={preferences.vibrate ? Colors.tint : '#fff'}
              />
            </View>

            <View style={[styles.preferenceRow, { backgroundColor: '#fff' }]}>
              <View style={styles.preferenceInfo}>
                <Text style={[styles.preferenceLabel, { color: Colors.text }]}>Badge Count</Text>
                <Text style={[styles.preferenceDescription, { color: Colors.icon }]}>
                  Show unread count on app icon
                </Text>
              </View>
              <Switch
                value={preferences.badge}
                onValueChange={(value) => updatePreference('badge', value)}
                trackColor={{ false: '#E5E5EA', true: Colors.tint + '60' }}
                thumbColor={preferences.badge ? Colors.tint : '#fff'}
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterInfo: {
    flex: 1,
    marginRight: 16,
  },
  masterTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  masterDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  quietHoursCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  quietHoursLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  quietHoursDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
