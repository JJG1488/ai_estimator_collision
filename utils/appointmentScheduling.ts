import {
  Appointment,
  AppointmentType,
  AppointmentStatus,
  TimeSlot,
  BodyShopSchedule,
  LoanerCarRequest,
} from '@/types';

/**
 * Appointment Scheduling System
 * Handles calendar integration, time slot generation, and appointment management
 */

/**
 * Default body shop schedule (Monday-Friday, 8 AM - 5 PM)
 */
export const DEFAULT_SHOP_SCHEDULE: Omit<BodyShopSchedule, 'bodyShopId'>[] = [
  {
    dayOfWeek: 1, // Monday
    openTime: '08:00',
    closeTime: '17:00',
    slotDuration: 30,
    breakTimes: [{ start: '12:00', end: '13:00' }],
    maxConcurrentAppointments: 3,
  },
  {
    dayOfWeek: 2, // Tuesday
    openTime: '08:00',
    closeTime: '17:00',
    slotDuration: 30,
    breakTimes: [{ start: '12:00', end: '13:00' }],
    maxConcurrentAppointments: 3,
  },
  {
    dayOfWeek: 3, // Wednesday
    openTime: '08:00',
    closeTime: '17:00',
    slotDuration: 30,
    breakTimes: [{ start: '12:00', end: '13:00' }],
    maxConcurrentAppointments: 3,
  },
  {
    dayOfWeek: 4, // Thursday
    openTime: '08:00',
    closeTime: '17:00',
    slotDuration: 30,
    breakTimes: [{ start: '12:00', end: '13:00' }],
    maxConcurrentAppointments: 3,
  },
  {
    dayOfWeek: 5, // Friday
    openTime: '08:00',
    closeTime: '17:00',
    slotDuration: 30,
    breakTimes: [{ start: '12:00', end: '13:00' }],
    maxConcurrentAppointments: 3,
  },
];

/**
 * Appointment type configurations
 */
export const APPOINTMENT_TYPES: Record<
  AppointmentType,
  {
    label: string;
    description: string;
    icon: string;
    defaultDuration: number; // minutes
    requiresVehicle: boolean;
    allowsLoanerCar: boolean;
    allowsDelivery: boolean;
  }
> = {
  drop_off: {
    label: 'Drop Off Vehicle',
    description: 'Bring your vehicle to the shop to begin repairs',
    icon: '🚗',
    defaultDuration: 30,
    requiresVehicle: true,
    allowsLoanerCar: true,
    allowsDelivery: false,
  },
  inspection: {
    label: 'In-Person Inspection',
    description: 'Schedule a technician to inspect your vehicle',
    icon: '🔍',
    defaultDuration: 60,
    requiresVehicle: true,
    allowsLoanerCar: false,
    allowsDelivery: false,
  },
  pickup: {
    label: 'Pick Up Vehicle',
    description: 'Retrieve your repaired vehicle from the shop',
    icon: '✅',
    defaultDuration: 30,
    requiresVehicle: false,
    allowsLoanerCar: false,
    allowsDelivery: false,
  },
  delivery: {
    label: 'Vehicle Delivery',
    description: 'Have your repaired vehicle delivered to you',
    icon: '🚚',
    defaultDuration: 0, // Varies by distance
    requiresVehicle: false,
    allowsLoanerCar: false,
    allowsDelivery: true,
  },
};

/**
 * Generate available time slots for a given date
 */
export function generateTimeSlots(
  date: Date,
  schedule: BodyShopSchedule,
  existingAppointments: Appointment[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();

  // Check if shop is open on this day
  if (schedule.dayOfWeek !== dayOfWeek) {
    return [];
  }

  // Parse open/close times
  const [openHour, openMin] = schedule.openTime.split(':').map(Number);
  const [closeHour, closeMin] = schedule.closeTime.split(':').map(Number);

  // Create date objects for start and end
  const currentSlot = new Date(date);
  currentSlot.setHours(openHour, openMin, 0, 0);

  const closeTime = new Date(date);
  closeTime.setHours(closeHour, closeMin, 0, 0);

  let slotIndex = 0;

  while (currentSlot < closeTime) {
    const slotStart = new Date(currentSlot);
    const slotEnd = new Date(currentSlot.getTime() + schedule.slotDuration * 60000);

    const startTimeStr = formatTime(slotStart);
    const endTimeStr = formatTime(slotEnd);

    // Check if slot is during break time
    const isDuringBreak = schedule.breakTimes?.some((breakTime) => {
      return (
        (startTimeStr >= breakTime.start && startTimeStr < breakTime.end) ||
        (endTimeStr > breakTime.start && endTimeStr <= breakTime.end)
      );
    });

    if (!isDuringBreak) {
      // Count existing bookings for this slot
      const bookingsForSlot = existingAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduledDate);
        return (
          aptDate.toDateString() === date.toDateString() &&
          apt.timeSlot.start === startTimeStr &&
          apt.status !== 'cancelled'
        );
      }).length;

      slots.push({
        id: `slot-${date.toISOString().split('T')[0]}-${slotIndex}`,
        date: new Date(date),
        startTime: startTimeStr,
        endTime: endTimeStr,
        isAvailable: bookingsForSlot < schedule.maxConcurrentAppointments,
        maxCapacity: schedule.maxConcurrentAppointments,
        currentBookings: bookingsForSlot,
      });

      slotIndex++;
    }

    // Move to next slot
    currentSlot.setTime(currentSlot.getTime() + schedule.slotDuration * 60000);
  }

  return slots;
}

/**
 * Get available dates for the next N days
 */
export function getAvailableDates(
  startDate: Date,
  daysAhead: number,
  schedules: BodyShopSchedule[]
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(current);
    date.setDate(current.getDate() + i);

    // Check if shop is open on this day
    const dayOfWeek = date.getDay();
    const hasSchedule = schedules.some((s) => s.dayOfWeek === dayOfWeek);

    if (hasSchedule) {
      dates.push(date);
    }
  }

  return dates;
}

/**
 * Format time as HH:MM
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format date for display
 */
export function formatAppointmentDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const aptDate = new Date(date);
  aptDate.setHours(0, 0, 0, 0);

  if (aptDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (aptDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return aptDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(start: string, end: string): string {
  const formatAMPM = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return `${formatAMPM(start)} - ${formatAMPM(end)}`;
}

/**
 * Get appointment type label and icon
 */
export function getAppointmentTypeInfo(type: AppointmentType): {
  label: string;
  icon: string;
  description: string;
} {
  const config = APPOINTMENT_TYPES[type];
  return {
    label: config.label,
    icon: config.icon,
    description: config.description,
  };
}

/**
 * Get appointment status color
 */
export function getAppointmentStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case 'confirmed':
      return '#34C759'; // Green
    case 'pending':
      return '#FF9500'; // Orange
    case 'completed':
      return '#007AFF'; // Blue
    case 'cancelled':
      return '#FF3B30'; // Red
    case 'rescheduled':
      return '#8E8E93'; // Gray
    default:
      return '#8E8E93';
  }
}

/**
 * Get appointment status label
 */
export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending Confirmation';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'rescheduled':
      return 'Rescheduled';
    default:
      return status;
  }
}

/**
 * Check if appointment can be rescheduled
 */
export function canRescheduleAppointment(appointment: Appointment): boolean {
  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    return false;
  }

  // Can't reschedule within 2 hours of appointment
  const appointmentTime = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.timeSlot.start.split(':').map(Number);
  appointmentTime.setHours(hours, minutes);

  const twoHoursFromNow = new Date();
  twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

  return appointmentTime > twoHoursFromNow;
}

/**
 * Check if appointment can be cancelled
 */
export function canCancelAppointment(appointment: Appointment): boolean {
  return appointment.status !== 'cancelled' && appointment.status !== 'completed';
}

/**
 * Calculate time until appointment
 */
export function getTimeUntilAppointment(appointment: Appointment): string {
  const appointmentTime = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.timeSlot.start.split(':').map(Number);
  appointmentTime.setHours(hours, minutes);

  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();

  if (diffMs < 0) {
    return 'Past';
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `In ${diffMins} minutes`;
  } else if (diffHours < 24) {
    return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else {
    return formatAppointmentDate(appointmentTime);
  }
}

/**
 * Check if appointment needs reminder
 */
export function needsReminder(appointment: Appointment): boolean {
  if (appointment.reminderSent || appointment.status !== 'confirmed') {
    return false;
  }

  const appointmentTime = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.timeSlot.start.split(':').map(Number);
  appointmentTime.setHours(hours, minutes);

  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Send reminder 24 hours before
  return diffHours <= 24 && diffHours > 0;
}

/**
 * Sort appointments by date/time
 */
export function sortAppointments(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => {
    const dateA = new Date(a.scheduledDate);
    const dateB = new Date(b.scheduledDate);

    const [hoursA, minsA] = a.timeSlot.start.split(':').map(Number);
    const [hoursB, minsB] = b.timeSlot.start.split(':').map(Number);

    dateA.setHours(hoursA, minsA);
    dateB.setHours(hoursB, minsB);

    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Filter appointments by status
 */
export function filterAppointmentsByStatus(
  appointments: Appointment[],
  statuses: AppointmentStatus[]
): Appointment[] {
  return appointments.filter((apt) => statuses.includes(apt.status));
}

/**
 * Get upcoming appointments
 */
export function getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
  const now = new Date();

  return appointments.filter((apt) => {
    if (apt.status === 'cancelled' || apt.status === 'completed') {
      return false;
    }

    const aptDate = new Date(apt.scheduledDate);
    const [hours, minutes] = apt.timeSlot.start.split(':').map(Number);
    aptDate.setHours(hours, minutes);

    return aptDate > now;
  });
}

/**
 * Get past appointments
 */
export function getPastAppointments(appointments: Appointment[]): Appointment[] {
  const now = new Date();

  return appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduledDate);
    const [hours, minutes] = apt.timeSlot.start.split(':').map(Number);
    aptDate.setHours(hours, minutes);

    return aptDate <= now || apt.status === 'completed';
  });
}

/**
 * Validate loaner car request
 */
export function validateLoanerCarRequest(request: LoanerCarRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (request.needed) {
    if (request.preferences?.type && !['sedan', 'suv', 'truck', 'any'].includes(request.preferences.type)) {
      errors.push('Invalid vehicle type preference');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate delivery time based on distance
 */
export function estimateDeliveryDuration(distanceInMiles: number): number {
  // Assume 30 mph average speed in city + 15 min prep time
  const travelTimeMinutes = (distanceInMiles / 30) * 60;
  return Math.ceil(travelTimeMinutes + 15);
}

/**
 * Get recommended appointment types for claim status
 */
export function getRecommendedAppointmentTypes(claimStatus: string): AppointmentType[] {
  switch (claimStatus) {
    case 'draft':
    case 'analyzing':
      return ['inspection'];
    case 'pending_review':
      return ['inspection'];
    case 'approved':
      return ['drop_off'];
    case 'completed':
      return ['pickup', 'delivery'];
    default:
      return ['drop_off', 'inspection', 'pickup'];
  }
}
