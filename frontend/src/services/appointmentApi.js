import { getStoredSession } from "./cognitoAuth";
import { getDoctorSchedule } from "./doctorScheduleService";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export function isApiConfigured() {
  return apiBaseUrl && !apiBaseUrl.includes("placeholder");
}

const LOCAL_APPOINTMENTS_KEY = "cloudcare_local_appointments";

// Initial seed appointments for evaluation
const initialAppointments = [
  {
    appointmentId: "CC-A4F1",
    patientId: "demo_patient_001",
    patientName: "Rahul Sharma",
    patientEmail: "rahul.patient@cloudcare.local",
    patientPhone: "+91 98765 43210",
    doctorId: "doc-1",
    doctorName: "Dr. Arvind Ramesh",
    specialty: "Cardiology",
    date: new Date().toISOString().split("T")[0],
    slot: "10:00 AM",
    consultationFee: 800,
    hospitalLocation: "CloudCare Super-Speciality Hospital, Wing A",
    status: "CONFIRMED",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
  },
  {
    appointmentId: "CC-B8D2",
    patientId: "demo_patient_002",
    patientName: "Pooja Verma",
    patientEmail: "pooja.v@example.com",
    patientPhone: "+91 91234 56789",
    doctorId: "doc-1",
    doctorName: "Dr. Arvind Ramesh",
    specialty: "Cardiology",
    date: new Date().toISOString().split("T")[0],
    slot: "11:30 AM",
    consultationFee: 800,
    hospitalLocation: "CloudCare Super-Speciality Hospital, Wing A",
    status: "CONFIRMED",
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  },
  {
    appointmentId: "CC-C1E9",
    patientId: "demo_patient_001",
    patientName: "Rahul Sharma",
    patientEmail: "rahul.patient@cloudcare.local",
    patientPhone: "+91 98765 43210",
    doctorId: "doc-3",
    doctorName: "Dr. Vikramaditya Sen",
    specialty: "Orthopedics",
    date: new Date(Date.now() - 86400 * 1000 * 5).toISOString().split("T")[0],
    slot: "03:00 PM",
    consultationFee: 900,
    hospitalLocation: "CloudCare Super-Speciality Hospital, Wing A",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400 * 1000 * 6).toISOString()
  }
];

function getLocalAppointments() {
  try {
    const raw = localStorage.getItem(LOCAL_APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(initialAppointments));
      return initialAppointments;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialAppointments;
  }
}

function saveLocalAppointments(list) {
  localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(list));
}

/**
 * Creates an appointment with server-level duplicate-booking prevention.
 */
export async function createAppointment(appointmentData) {
  const session = getStoredSession();
  const token = session?.idToken || session?.accessToken;

  // 1. Live AWS API Gateway Call (when configured)
  if (isApiConfigured()) {
    const response = await fetch(`${apiBaseUrl}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(appointmentData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to create appointment on AWS backend");
    }
    return data.data;
  }

  // 2. Local State Engine (emulating DynamoDB TransactWrite & ConditionExpression)
  const existingList = getLocalAppointments();
  const schedule = getDoctorSchedule(appointmentData.doctorId);

  // Validate working day
  if (appointmentData.date && Array.isArray(schedule.workingDays) && schedule.workingDays.length > 0) {
    const dateObj = new Date(`${appointmentData.date}T00:00:00`);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    if (!schedule.workingDays.includes(dayName)) {
      throw new Error(`Dr. ${appointmentData.doctorName} does not have OPD consultation hours on ${dayName}s.`);
    }
  }

  // Validate slot capacity (maxBookingsPerSlot)
  const maxPerSlot = schedule.maxBookingsPerSlot || 1;
  const slotBookings = existingList.filter(
    (app) =>
      app.doctorId === appointmentData.doctorId &&
      app.date === appointmentData.date &&
      app.slot === appointmentData.slot &&
      app.status !== "CANCELLED"
  );

  if (slotBookings.length >= maxPerSlot) {
    throw new Error(
      `This time slot (${appointmentData.slot}) on ${appointmentData.date} is fully booked (capacity: ${maxPerSlot}). Please select another time slot.`
    );
  }

  // Validate daily maximum booking limit
  const dailyMax = schedule.dailyMaxBookings || 15;
  const dayBookings = existingList.filter(
    (app) =>
      app.doctorId === appointmentData.doctorId &&
      app.date === appointmentData.date &&
      app.status !== "CANCELLED"
  );

  if (dayBookings.length >= dailyMax) {
    throw new Error(
      `Dr. ${appointmentData.doctorName} has reached the maximum daily limit of ${dailyMax} appointments on ${appointmentData.date}. Please select another date.`
    );
  }

  const newAppointment = {
    ...appointmentData,
    appointmentId: `CC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    status: "CONFIRMED",
    createdAt: new Date().toISOString()
  };

  existingList.unshift(newAppointment);
  saveLocalAppointments(existingList);

  // Return new appointment object
  return newAppointment;
}

/**
 * Retrieves appointments for the authenticated user based on role.
 */
export async function fetchAppointments() {
  const session = getStoredSession();
  const token = session?.idToken || session?.accessToken;

  if (isApiConfigured()) {
    const response = await fetch(`${apiBaseUrl}/appointments`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch appointments from AWS backend");
    }
    return data.data;
  }

  // Local emulation
  const list = getLocalAppointments();
  const role = session?.role || "Patient";
  const userId = session?.userId;

  if (role === "Admin") {
    return list;
  }
  if (role === "Doctor") {
    // Match by doctorId or doctorName
    return list.filter(
      (a) => a.doctorId === userId || a.doctorName.toLowerCase().includes(session?.name?.toLowerCase() || "")
    );
  }
  // Patient role: filter by patientId or email
  return list.filter(
    (a) => a.patientId === userId || (session?.email && a.patientEmail === session.email)
  );
}

/**
 * Cancels an appointment and releases the slot.
 */
export async function cancelAppointment(appointmentId) {
  const session = getStoredSession();
  const token = session?.idToken || session?.accessToken;

  if (isApiConfigured()) {
    const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to cancel appointment on AWS backend");
    }
    return data.data;
  }

  // Local emulation
  const list = getLocalAppointments();
  const index = list.findIndex((a) => a.appointmentId === appointmentId);
  if (index === -1) {
    throw new Error("Appointment not found");
  }

  list[index].status = "CANCELLED";
  list[index].updatedAt = new Date().toISOString();
  saveLocalAppointments(list);

  return list[index];
}

/**
 * Returns all stored appointments (used for cross-referencing availability).
 */
export function getAllAppointments() {
  return getLocalAppointments();
}
