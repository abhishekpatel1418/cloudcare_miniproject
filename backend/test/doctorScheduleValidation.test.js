import test from "node:test";
import assert from "node:assert/strict";
import {
  timeToMinutes,
  minutesToTime12h,
  validateSchedule,
  generateSlots,
  detectScheduleConflicts,
  validateBookingAgainstSchedule,
  isScheduleAuthorized
} from "../shared/scheduleValidation.js";

// ==========================================
// 1. INVALID TIMES & DURATION TESTS
// ==========================================

test("Schedule validation rejects when OPD start time is later than end time", () => {
  const invalidSchedule = {
    workingDays: ["Monday", "Tuesday"],
    startTime: "17:00",
    endTime: "09:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  const result = validateSchedule(invalidSchedule);
  assert.equal(result.valid, false);
  assert.match(result.error, /OPD start time must be strictly earlier than end time/);
});

test("Schedule validation rejects when OPD start time equals end time", () => {
  const invalidSchedule = {
    workingDays: ["Monday"],
    startTime: "10:00",
    endTime: "10:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  const result = validateSchedule(invalidSchedule);
  assert.equal(result.valid, false);
  assert.match(result.error, /OPD start time must be strictly earlier than end time/);
});

test("Schedule validation rejects invalid time string format or out of bounds", () => {
  assert.equal(timeToMinutes("25:00"), null);
  assert.equal(timeToMinutes("09:65"), null);
  assert.equal(timeToMinutes("abc"), null);
  assert.equal(timeToMinutes(null), null);

  const invalidTimeSchedule = {
    workingDays: ["Monday"],
    startTime: "invalid",
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1
  };
  const result = validateSchedule(invalidTimeSchedule);
  assert.equal(result.valid, false);
  assert.match(result.error, /Invalid OPD start time/);
});

test("Schedule validation rejects unsupported slot durations", () => {
  const invalidDurationSchedule = {
    workingDays: ["Monday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 25, // not in [15, 30, 45, 60]
    maxBookingsPerSlot: 1
  };
  const result = validateSchedule(invalidDurationSchedule);
  assert.equal(result.valid, false);
  assert.match(result.error, /Slot duration must be one of: 15, 30, 45, 60 minutes/);
});

test("Schedule validation rejects empty working days or non-integer limits", () => {
  const noDaysResult = validateSchedule({
    workingDays: [],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30
  });
  assert.equal(noDaysResult.valid, false);
  assert.match(noDaysResult.error, /At least one working day must be selected/);

  const invalidLimitResult = validateSchedule({
    workingDays: ["Monday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 0
  });
  assert.equal(invalidLimitResult.valid, false);
  assert.match(invalidLimitResult.error, /Maximum bookings per slot must be an integer greater than or equal to 1/);
});

// ==========================================
// 2. SLOT GENERATION TESTS
// ==========================================

test("Slot generation produces correct slots for 15, 30, 45, and 60 minute intervals", () => {
  // 15-minute slots: 09:00 to 10:00 -> 4 slots
  const slots15 = generateSlots("09:00", "10:00", 15);
  assert.deepEqual(slots15, ["09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM"]);

  // 30-minute slots: 09:00 to 11:00 -> 4 slots
  const slots30 = generateSlots("09:00", "11:00", 30);
  assert.deepEqual(slots30, ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"]);

  // 45-minute slots: 09:00 to 12:00 -> 4 slots (09:00, 09:45, 10:30, 11:15)
  const slots45 = generateSlots("09:00", "12:00", 45);
  assert.deepEqual(slots45, ["09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM"]);

  // 60-minute slots: 14:00 to 17:00 -> 3 slots (02:00 PM, 03:00 PM, 04:00 PM)
  const slots60 = generateSlots("14:00", "17:00", 60);
  assert.deepEqual(slots60, ["02:00 PM", "03:00 PM", "04:00 PM"]);
});

test("Slot generation returns empty array for invalid inputs", () => {
  assert.deepEqual(generateSlots("17:00", "09:00", 30), []);
  assert.deepEqual(generateSlots("09:00", "09:00", 30), []);
  assert.deepEqual(generateSlots("", "10:00", 30), []);
});

// ==========================================
// 3. BOOKING LIMITS & OVERBOOKING TESTS
// ==========================================

test("Booking validation rejects double-booking when slot capacity is reached", () => {
  const schedule = {
    workingDays: ["Monday", "Wednesday", "Friday"],
    startTime: "09:00",
    endTime: "12:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  const existingBookings = [
    { appointmentId: "CC-1", slot: "09:30 AM", status: "CONFIRMED" }
  ];

  // Try to book the already taken slot on a Monday (2026-10-26 is Monday)
  const result = validateBookingAgainstSchedule(schedule, "2026-10-26", "09:30 AM", existingBookings);
  assert.equal(result.valid, false);
  assert.match(result.error, /Slot 09:30 AM is fully booked/);
});

test("Booking validation allows multiple bookings per slot if maxBookingsPerSlot > 1", () => {
  const schedule = {
    workingDays: ["Monday", "Wednesday", "Friday"],
    startTime: "09:00",
    endTime: "12:00",
    slotDuration: 30,
    maxBookingsPerSlot: 2,
    dailyMaxBookings: 10
  };

  const existingBookings = [
    { appointmentId: "CC-1", slot: "09:30 AM", status: "CONFIRMED" }
  ];

  // 1 booking exists, capacity is 2 -> allowed!
  const result = validateBookingAgainstSchedule(schedule, "2026-10-26", "09:30 AM", existingBookings);
  assert.equal(result.valid, true);

  // When second booking is added -> rejected
  const twoBookings = [
    { appointmentId: "CC-1", slot: "09:30 AM", status: "CONFIRMED" },
    { appointmentId: "CC-2", slot: "09:30 AM", status: "CONFIRMED" }
  ];
  const rejectedResult = validateBookingAgainstSchedule(schedule, "2026-10-26", "09:30 AM", twoBookings);
  assert.equal(rejectedResult.valid, false);
  assert.match(rejectedResult.error, /fully booked \(2\/2\)/);
});

test("Booking validation enforces dailyMaxBookings limit", () => {
  const schedule = {
    workingDays: ["Monday", "Tuesday", "Wednesday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 2
  };

  const existingBookings = [
    { appointmentId: "CC-1", slot: "09:00 AM", status: "CONFIRMED" },
    { appointmentId: "CC-2", slot: "09:30 AM", status: "CONFIRMED" }
  ];

  // Daily limit is 2; 2 existing bookings -> 10:00 AM should be rejected even though slot is empty
  const result = validateBookingAgainstSchedule(schedule, "2026-10-26", "10:00 AM", existingBookings);
  assert.equal(result.valid, false);
  assert.match(result.error, /reached the daily limit of 2 appointments/);
});

test("Booking validation rejects appointments on non-working days", () => {
  const schedule = {
    workingDays: ["Monday", "Wednesday", "Friday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  // 2026-10-27 is a Tuesday
  const result = validateBookingAgainstSchedule(schedule, "2026-10-27", "09:00 AM", []);
  assert.equal(result.valid, false);
  assert.match(result.error, /Doctor is not available on Tuesdays/);
});

// ==========================================
// 4. SCHEDULE CONFLICT DETECTION TESTS
// ==========================================

test("detectScheduleConflicts warns when a working day is removed but has active appointments", () => {
  const newSchedule = {
    workingDays: ["Monday", "Wednesday"], // Friday removed!
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  // 2026-10-30 is a Friday
  const activeAppointments = [
    {
      appointmentId: "CC-F001",
      patientName: "John Doe",
      date: "2026-10-30",
      slot: "10:00 AM",
      status: "CONFIRMED"
    }
  ];

  const conflicts = detectScheduleConflicts(newSchedule, activeAppointments);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].appointmentId, "CC-F001");
  assert.match(conflicts[0].reason, /scheduled on Friday, which is removed/);
});

test("detectScheduleConflicts warns when hours change and exclude an active appointment slot", () => {
  const newSchedule = {
    workingDays: ["Monday", "Friday"],
    startTime: "11:00", // Shifted from 09:00 to 11:00
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  // 2026-10-26 is a Monday, booked at 09:30 AM
  const activeAppointments = [
    {
      appointmentId: "CC-M001",
      patientName: "Alice Smith",
      date: "2026-10-26",
      slot: "09:30 AM",
      status: "CONFIRMED"
    }
  ];

  const conflicts = detectScheduleConflicts(newSchedule, activeAppointments);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].appointmentId, "CC-M001");
  assert.match(conflicts[0].reason, /falls outside the new OPD hours/);
});

test("detectScheduleConflicts returns empty array when all appointments fit new schedule", () => {
  const newSchedule = {
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    maxBookingsPerSlot: 1,
    dailyMaxBookings: 10
  };

  const activeAppointments = [
    {
      appointmentId: "CC-OK",
      patientName: "Bob",
      date: "2026-10-26",
      slot: "10:00 AM",
      status: "CONFIRMED"
    }
  ];

  const conflicts = detectScheduleConflicts(newSchedule, activeAppointments);
  assert.equal(conflicts.length, 0);
});

// ==========================================
// 5. SCHEDULE AUTHORIZATION TESTS
// ==========================================

test("Schedule authorization allows assigned doctor to modify own schedule", () => {
  const doctorCaller = {
    userId: "doc-1",
    role: "Doctor"
  };

  assert.equal(isScheduleAuthorized(doctorCaller, "doc-1"), true);
});

test("Schedule authorization allows Admin to modify any doctor schedule", () => {
  const adminCaller = {
    userId: "admin-99",
    role: "Admin"
  };

  assert.equal(isScheduleAuthorized(adminCaller, "doc-1"), true);
  assert.equal(isScheduleAuthorized(adminCaller, "doc-2"), true);
});

test("Schedule authorization denies another doctor from modifying a doctor's schedule", () => {
  const otherDoctorCaller = {
    userId: "doc-2",
    role: "Doctor"
  };

  assert.equal(isScheduleAuthorized(otherDoctorCaller, "doc-1"), false);
});

test("Schedule authorization denies patients from modifying doctor schedules", () => {
  const patientCaller = {
    userId: "patient-101",
    role: "Patient"
  };

  assert.equal(isScheduleAuthorized(patientCaller, "doc-1"), false);
});
