import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { TimeSlot, BodyShopSchedule, Appointment } from '@/types';
import {
  generateTimeSlots,
  getAvailableDates,
  formatAppointmentDate,
  formatTimeSlot,
} from '@/utils/appointmentScheduling';
import { Colors } from '@/constants/theme';

interface AppointmentCalendarProps {
  bodyShopSchedules: BodyShopSchedule[];
  existingAppointments: Appointment[];
  selectedDate?: Date;
  selectedTimeSlot?: TimeSlot;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
  daysAhead?: number;
}

export default function AppointmentCalendar({
  bodyShopSchedules,
  existingAppointments,
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  daysAhead = 14,
}: AppointmentCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  // Get available dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const availableDates = getAvailableDates(today, daysAhead, bodyShopSchedules);

  // Get time slots for selected date
  const timeSlots = selectedDate
    ? generateTimeSlots(
        selectedDate,
        bodyShopSchedules.find((s) => s.dayOfWeek === selectedDate.getDay())!,
        existingAppointments
      )
    : [];

  // Split dates into weeks (7 days per week)
  const weeksOfDates: Date[][] = [];
  for (let i = 0; i < availableDates.length; i += 7) {
    weeksOfDates.push(availableDates.slice(i, i + 7));
  }

  const currentWeek = weeksOfDates[currentWeekStart] || [];

  const handleNextWeek = () => {
    if (currentWeekStart < weeksOfDates.length - 1) {
      setCurrentWeekStart(currentWeekStart + 1);
    }
  };

  const handlePrevWeek = () => {
    if (currentWeekStart > 0) {
      setCurrentWeekStart(currentWeekStart - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <View style={styles.dateSection}>
        <View style={styles.dateHeader}>
          <TouchableOpacity
            onPress={handlePrevWeek}
            disabled={currentWeekStart === 0}
            style={[styles.weekButton, currentWeekStart === 0 && styles.weekButtonDisabled]}
          >
            <Text style={[styles.weekButtonText, currentWeekStart === 0 && { color: '#C7C7CC' }]}>
              ←
            </Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Select Date</Text>

          <TouchableOpacity
            onPress={handleNextWeek}
            disabled={currentWeekStart === weeksOfDates.length - 1}
            style={[
              styles.weekButton,
              currentWeekStart === weeksOfDates.length - 1 && styles.weekButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.weekButtonText,
                currentWeekStart === weeksOfDates.length - 1 && { color: '#C7C7CC' },
              ]}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {currentWeek.map((date) => {
            const isSelected =
              selectedDate && date.toDateString() === selectedDate.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();

            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.dateCard,
                  isSelected && { backgroundColor: Colors.tint, borderColor: Colors.tint },
                ]}
                onPress={() => onDateSelect(date)}
              >
                <Text style={[styles.dayName, isSelected && { color: '#fff' }]}>{dayName}</Text>
                <Text style={[styles.dayNumber, isSelected && { color: '#fff' }]}>
                  {dayNumber}
                </Text>
                <Text style={[styles.dateLabel, isSelected && { color: '#fff' }]}>
                  {formatAppointmentDate(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Time Slot Selector */}
      {selectedDate && (
        <View style={styles.timeSection}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Select Time</Text>

          {timeSlots.length === 0 ? (
            <View style={styles.noSlotsContainer}>
              <Text style={[styles.noSlotsText, { color: Colors.icon }]}>
                No available time slots for this date
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.timeSlotsGrid}>
                {timeSlots.map((slot) => {
                  const isSelected =
                    selectedTimeSlot &&
                    selectedTimeSlot.startTime === slot.startTime &&
                    selectedTimeSlot.endTime === slot.endTime;

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlot,
                        !slot.isAvailable && styles.timeSlotUnavailable,
                        isSelected && {
                          backgroundColor: Colors.tint,
                          borderColor: Colors.tint,
                        },
                      ]}
                      onPress={() => slot.isAvailable && onTimeSlotSelect(slot)}
                      disabled={!slot.isAvailable}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          !slot.isAvailable && { color: '#C7C7CC' },
                          isSelected && { color: '#fff', fontWeight: '700' },
                        ]}
                      >
                        {formatTimeSlot(slot.startTime, slot.endTime)}
                      </Text>
                      {!slot.isAvailable && (
                        <Text style={styles.unavailableLabel}>Full</Text>
                      )}
                      {slot.isAvailable && slot.currentBookings > 0 && (
                        <Text style={styles.capacityLabel}>
                          {slot.maxCapacity - slot.currentBookings} left
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  weekButtonDisabled: {
    backgroundColor: 'transparent',
  },
  weekButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.tint,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  dateScroll: {
    flexGrow: 0,
  },
  dateCard: {
    width: 80,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.icon,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.icon,
  },
  timeSection: {
    flex: 1,
  },
  timeScroll: {
    flex: 1,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  timeSlotUnavailable: {
    backgroundColor: '#f2f2f7',
    borderColor: '#C7C7CC',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  unavailableLabel: {
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 4,
    fontWeight: '600',
  },
  capacityLabel: {
    fontSize: 11,
    color: '#FF9500',
    marginTop: 4,
  },
  noSlotsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
