/**
 * CloudCare Backend Schedule Validation Utilities
 * 
 * Shared validation logic for Doctor Schedules and Slot Generation,
 * used by AWS Lambda handlers and API Gateway request processors.
 */

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
 */
export function detectScheduleConflicts(newSchedule, activeAppointments = []) {
  const validation = validateSchedule(newSchedule);
  if (!validation.valid) {
    return [{ reason: validation.error, isCritical: true }];
  }

  const active = activeAppointments.filter((a) => a.status === 'CONFIRMED');
  if (active.length === 0) {
    return [];
  }

  const newSlotsSet = new Set(generateSlots(newSchedule.startTime, newSchedule.endTime, newSchedule.slotDuration));
  const workingDaysSet = new Set(newSchedule.workingDays);
  const conflicts = [];

  for (const app of active) {
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
 * Validates a proposed appointment against a doctor's configured schedule.
 */
export function validateBookingAgainstSchedule(schedule, appointmentDate, appointmentSlot, existingConfirmedOnDate = []) {
  if (!schedule) {
    return { valid: true, error: null }; // Fall back if doctor has no custom schedule configured
  }

  const dateObj = new Date(`${appointmentDate}T00:00:00`);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  if (Array.isArray(schedule.workingDays) && !schedule.workingDays.includes(dayName)) {
    return {
      valid: false,
      error: `Doctor is not available on ${dayName}s. Available days: ${schedule.workingDays.join(', ')}.`
    };
  }

  const generatedSlots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotDuration);
  if (generatedSlots.length > 0 && !generatedSlots.includes(appointmentSlot)) {
    return {
      valid: false,
      error: `Selected slot (${appointmentSlot}) is not valid for this doctor's working hours.`
    };
  }

  const dailyLimit = Number(schedule.dailyMaxBookings) || 15;
  if (existingConfirmedOnDate.length >= dailyLimit) {
    return {
      valid: false,
      error: `Doctor has reached the daily limit of ${dailyLimit} appointments for ${appointmentDate}.`
    };
  }

  const maxPerSlot = Number(schedule.maxBookingsPerSlot) || 1;
  const existingForSlot = existingConfirmedOnDate.filter((a) => a.slot === appointmentSlot).length;
  if (existingForSlot >= maxPerSlot) {
    return {
      valid: false,
      error: `Slot ${appointmentSlot} is fully booked (${existingForSlot}/${maxPerSlot}). Please select another time.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Checks if a caller has authorization to update a target doctor's schedule.
 */
export function isScheduleAuthorized(caller, targetDoctorId) {
  if (!caller || !caller.role) return false;
  if (caller.role === 'Admin') return true;
  if (caller.role === 'Doctor') {
    return caller.userId === targetDoctorId || caller.doctorId === targetDoctorId;
  }
  return false;
}
