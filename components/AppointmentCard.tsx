import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Appointment } from '@/types';
import {
  getAppointmentTypeInfo,
  getAppointmentStatusColor,
  getAppointmentStatusLabel,
  formatAppointmentDate,
  formatTimeSlot,
  getTimeUntilAppointment,
  canRescheduleAppointment,
  canCancelAppointment,
} from '@/utils/appointmentScheduling';
import { Colors } from '@/constants/theme';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export default function AppointmentCard({
  appointment,
  onPress,
  onReschedule,
  onCancel,
  showActions = true,
}: AppointmentCardProps) {
  const typeInfo = getAppointmentTypeInfo(appointment.type);
  const statusColor = getAppointmentStatusColor(appointment.status);
  const statusLabel = getAppointmentStatusLabel(appointment.status);
  const timeUntil = getTimeUntilAppointment(appointment);

  const canReschedule = canRescheduleAppointment(appointment);
  const canCancel = canCancelAppointment(appointment);

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
          <View style={styles.typeInfo}>
            <Text style={[styles.typeLabel, { color: Colors.text }]}>{typeInfo.label}</Text>
            <Text style={[styles.bodyShopName, { color: Colors.icon }]}>
              {appointment.bodyShopName}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <Text style={styles.dateTimeIcon}>📅</Text>
          <View>
            <Text style={[styles.dateText, { color: Colors.text }]}>
              {formatAppointmentDate(new Date(appointment.scheduledDate))}
            </Text>
            <Text style={[styles.dateFullText, { color: Colors.icon }]}>
              {new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.dateTimeRow}>
          <Text style={styles.dateTimeIcon}>🕐</Text>
          <View>
            <Text style={[styles.timeText, { color: Colors.text }]}>
              {formatTimeSlot(appointment.timeSlot.start, appointment.timeSlot.end)}
            </Text>
            <Text style={[styles.timeUntilText, { color: Colors.icon }]}>{timeUntil}</Text>
          </View>
        </View>
      </View>

      {/* Additional Details */}
      {appointment.loanerCarRequest?.needed && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🚗</Text>
          <Text style={[styles.detailText, { color: Colors.text }]}>
            Loaner car requested
            {appointment.loanerCarRequest.approved ? ' (Approved)' : ' (Pending)'}
          </Text>
        </View>
      )}

      {appointment.deliveryAddress && (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🚚</Text>
          <Text style={[styles.detailText, { color: Colors.text }]}>
            Delivery to {appointment.deliveryAddress.city}, {appointment.deliveryAddress.state}
          </Text>
        </View>
      )}

      {appointment.notes && (
        <View style={styles.notesContainer}>
          <Text style={[styles.notesLabel, { color: Colors.icon }]}>Notes:</Text>
          <Text style={[styles.notesText, { color: Colors.text }]} numberOfLines={2}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {/* Actions */}
      {showActions && (canReschedule || canCancel) && (
        <View style={styles.actions}>
          {canReschedule && onReschedule && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.tint + '20' }]}
              onPress={onReschedule}
            >
              <Text style={[styles.actionButtonText, { color: Colors.tint }]}>Reschedule</Text>
            </TouchableOpacity>
          )}

          {canCancel && onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF3B3020' }]}
              onPress={onCancel}
            >
              <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bodyShopName: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeContainer: {
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateFullText: {
    fontSize: 13,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeUntilText: {
    fontSize: 13,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
