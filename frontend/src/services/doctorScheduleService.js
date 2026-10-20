/**
 * CloudCare Doctor Schedule & Slot Management Service
 * 
 * PERSISTENCE LIMITATION NOTICE:
 * This implementation provides structured local/demo-compatible persistence using browser localStorage.
 * Limitations:
 * 1. Data is persisted within the local browser environment and is not multi-user synchronized across multiple machines.
 * 2. In production (Phase 3 AWS backend deployment), this will synchronize with Amazon DynamoDB 
 *    using a single-table record structure: PK: `DOCTOR#<doctorId>`, SK: `SCHEDULE`.
 */

import { doctorsData } from '../data/doctorsData';

export const SCHEDULE_STORAGE_KEY = 'cloudcare_doctor_schedules';

export const ALL_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const VALID_SLOT_DURATIONS = [15, 30, 45, 60];

export const DEFAULT_SCHEDULE = {
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  maxBookingsPerSlot: 1,
  dailyMaxBookings: 15
};

/**
 * Converts 24-hour time string ("09:30", "14:15") to total minutes from midnight.
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from midnight to a 12-hour AM/PM string (e.g. 570 -> "09:30 AM").
 */
export function minutesToTime12h(totalMinutes) {
  if (typeof totalMinutes !== 'number' || totalMinutes < 0 || totalMinutes >= 24 * 60) {
    return '';
  }
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`;
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${paddedHours}:${paddedMins} ${period}`;
}

/**
 * Validates schedule parameters. Returns { valid: boolean, error: string | null }.
 */
export function validateSchedule(schedule) {
  if (!schedule) {
    return { valid: false, error: 'Schedule configuration is missing.' };
  }

  const { workingDays, startTime, endTime, slotDuration, maxBookingsPerSlot, dailyMaxBookings } = schedule;

  if (!Array.isArray(workingDays) || workingDays.length === 0) {
    return { valid: false, error: 'At least one working day must be selected.' };
  }

  for (const day of workingDays) {
    if (!ALL_WEEKDAYS.includes(day)) {
      return { valid: false, error: `Invalid working day: ${day}` };
    }
  }

  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  if (startMins === null) {
    return { valid: false, error: 'Invalid OPD start time. Use HH:MM format.' };
  }

  if (endMins === null) {
    return { valid: false, error: 'Invalid OPD end time. Use HH:MM format.' };
  }

  if (startMins >= endMins) {
    return { valid: false, error: 'OPD start time must be strictly earlier than end time.' };
  }

  if (!VALID_SLOT_DURATIONS.includes(Number(slotDuration))) {
    return { valid: false, error: `Slot duration must be one of: ${VALID_SLOT_DURATIONS.join(', ')} minutes.` };
  }

  const duration = Number(slotDuration);
  if (endMins - startMins < duration) {
    return { valid: false, error: `Total working window (${endMins - startMins} mins) is shorter than slot duration (${duration} mins).` };
  }

  const maxPerSlot = Number(maxBookingsPerSlot);
  if (!Number.isInteger(maxPerSlot) || maxPerSlot < 1) {
    return { valid: false, error: 'Maximum bookings per slot must be an integer greater than or equal to 1.' };
  }

  if (dailyMaxBookings !== undefined && dailyMaxBookings !== null && dailyMaxBookings !== '') {
    const dailyMax = Number(dailyMaxBookings);
    if (!Number.isInteger(dailyMax) || dailyMax < 1) {
      return { valid: false, error: 'Daily maximum booking limit must be an integer greater than or equal to 1.' };
    }
    if (dailyMax < maxPerSlot) {
      return { valid: false, error: 'Daily maximum booking limit cannot be less than max bookings per slot.' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Generates an array of time slot strings (12h format) from start and end times.
 */
export function generateSlots(startTime, endTime, slotDurationMinutes) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const duration = Number(slotDurationMinutes);

  if (startMins === null || endMins === null || startMins >= endMins || !duration || duration <= 0) {
    return [];
  }

  const slots = [];
  for (let time = startMins; time + duration <= endMins; time += duration) {
    slots.push(minutesToTime12h(time));
  }
  return slots;
}

/**
 * Detects conflicts between a proposed schedule and existing confirmed appointments.
 * Protects booked appointments from being silently lost or corrupted.
 */
export function detectScheduleConflicts(newSchedule, doctorAppointments = []) {
  const validation = validateSchedule(newSchedule);
  if (!validation.valid) {
    return [{ reason: validation.error, isCritical: true }];
  }

  const activeAppointments = doctorAppointments.filter((a) => a.status === 'CONFIRMED');
  if (activeAppointments.length === 0) {
    return [];
  }

  const newSlotsSet = new Set(generateSlots(newSchedule.startTime, newSchedule.endTime, newSchedule.slotDuration));
  const workingDaysSet = new Set(newSchedule.workingDays);
  const conflicts = [];

  for (const app of activeAppointments) {
    // Determine weekday of appointment date
    const dateObj = new Date(`${app.date}T00:00:00`);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    if (!workingDaysSet.has(dayName)) {
      conflicts.push({
        appointmentId: app.appointmentId,
        patientName: app.patientName,
        date: app.date,
        slot: app.slot,
        dayName,
        reason: `Appointment is scheduled on ${dayName}, which is removed from working days.`
      });
      continue;
    }

    if (!newSlotsSet.has(app.slot)) {
      conflicts.push({
        appointmentId: app.appointmentId,
        patientName: app.patientName,
        date: app.date,
        slot: app.slot,
        dayName,
        reason: `Time slot ${app.slot} falls outside the new OPD hours or does not align with the ${newSchedule.slotDuration}-minute duration.`
      });
    }
  }

  return conflicts;
}

/**
 * Retrieves all stored doctor schedules from localStorage.
 */
function getAllStoredSchedules() {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Retrieves the schedule for a specific doctor.
 * Falls back to initial doctorData configuration or default schedule.
 */
export function getDoctorSchedule(doctorId) {
  if (!doctorId) return { ...DEFAULT_SCHEDULE };

  const all = getAllStoredSchedules();
  if (all[doctorId]) {
    return { ...DEFAULT_SCHEDULE, ...all[doctorId] };
  }

  // Check static doctorsData for fallback
  const doctor = doctorsData.find((d) => d.id === doctorId);
  if (doctor && Array.isArray(doctor.availableSlots) && doctor.availableSlots.length > 0) {
    return {
      ...DEFAULT_SCHEDULE,
      generatedSlots: doctor.availableSlots
    };
  }

  return { ...DEFAULT_SCHEDULE };
}

/**
 * Saves a doctor's schedule with authorization checks and validation.
 */
export function saveDoctorSchedule(targetDoctorId, newSchedule, currentUser, existingAppointments = []) {
  if (!currentUser) {
    throw new Error('Authentication required: Cannot update doctor schedule without being logged in.');
  }

  // Authorization check: Only assigned doctor or Admin can update this doctor's schedule
  const isAdmin = currentUser.role === 'Admin';
  const isAssignedDoctor = currentUser.role === 'Doctor' && (
    currentUser.userId === targetDoctorId ||
    currentUser.doctorId === targetDoctorId ||
    (currentUser.name && doctorsData.find((d) => d.id === targetDoctorId)?.name?.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  if (!isAdmin && !isAssignedDoctor) {
    throw new Error('Forbidden: You do not have permission to modify another doctor\'s schedule.');
  }

  const validation = validateSchedule(newSchedule);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const all = getAllStoredSchedules();
  const scheduleRecord = {
    doctorId: targetDoctorId,
    workingDays: newSchedule.workingDays,
    startTime: newSchedule.startTime,
    endTime: newSchedule.endTime,
    slotDuration: Number(newSchedule.slotDuration),
    maxBookingsPerSlot: Number(newSchedule.maxBookingsPerSlot) || 1,
    dailyMaxBookings: Number(newSchedule.dailyMaxBookings) || 15,
    generatedSlots: generateSlots(newSchedule.startTime, newSchedule.endTime, newSchedule.slotDuration),
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.userId
  };

  all[targetDoctorId] = scheduleRecord;
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(all));

  return scheduleRecord;
}

/**
 * Calculates slot-by-slot availability for a doctor on a specific date.
 * Used by patient booking flows to enforce live slot capacities and daily limits.
 */
export function getDoctorAvailabilityForDate(doctorId, dateStr, appointments = []) {
  const schedule = getDoctorSchedule(doctorId);
  const slots = schedule.generatedSlots && schedule.generatedSlots.length > 0
    ? schedule.generatedSlots
    : generateSlots(schedule.startTime, schedule.endTime, schedule.slotDuration);

  if (!dateStr) {
    return {
      isWorkingDay: true,
      dayName: '',
      slots: slots.map((s) => ({ slot: s, isBooked: false, currentBookings: 0, maxBookings: schedule.maxBookingsPerSlot })),
      dailyBookingsCount: 0,
      dailyMaxBookings: schedule.dailyMaxBookings,
      isDailyLimitReached: false
    };
  }

  const dateObj = new Date(`${dateStr}T00:00:00`);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const isWorkingDay = schedule.workingDays.includes(dayName);

  // Filter confirmed appointments for this doctor on this date
  const dayAppointments = appointments.filter(
    (a) => a.doctorId === doctorId && a.date === dateStr && a.status === 'CONFIRMED'
  );

  const dailyBookingsCount = dayAppointments.length;
  const isDailyLimitReached = dailyBookingsCount >= schedule.dailyMaxBookings;

  const slotAvailability = slots.map((slot) => {
    const currentBookings = dayAppointments.filter((a) => a.slot === slot).length;
    const isBooked = currentBookings >= schedule.maxBookingsPerSlot || isDailyLimitReached;
    return {
      slot,
      isBooked,
      currentBookings,
      maxBookings: schedule.maxBookingsPerSlot
    };
  });

  return {
    isWorkingDay,
    dayName,
    slots: slotAvailability,
    dailyBookingsCount,
    dailyMaxBookings: schedule.dailyMaxBookings,
    isDailyLimitReached
  };
}
