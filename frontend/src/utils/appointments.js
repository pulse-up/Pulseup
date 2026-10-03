import api from '../api/api';

export const APPOINTMENT_TYPES = [
  'General Consultations',
  'Reproductive Health',
  'HIV VCT',
  'TB DOTS',
  'Wound Dressings',
];

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  RESCHEDULED: 'Rescheduled',
  COMPLETED: 'Attended',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || 'Pending';
}

export function isActiveStatus(status) {
  return ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(status);
}

export function getStart(appointment) {
  const date = new Date(
    `${appointment.slotDate}T${appointment.startTime || '00:00'}`,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getEnd(appointment) {
  const date = new Date(
    `${appointment.slotDate}T${appointment.endTime || '23:59'}`,
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

// Upcoming means still to happen: an active status and the slot has not ended.
export function isUpcoming(appointment, now = new Date()) {
  const end = getEnd(appointment);

  return isActiveStatus(appointment.status) && (!end || end >= now);
}

export function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

export function formatTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

export function formatWhen(appointment) {
  return `${formatDate(appointment.slotDate)}, ${formatTime(appointment.startTime)}`;
}

export function formatSlot(slot) {
  return (
    `${formatDate(slot.slotDate)}, ` +
    `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}` +
    (slot.roomNumber ? ` · ${slot.roomNumber}` : '')
  );
}

export async function fetchMyAppointments() {
  const response = await api.get('/appointments/my-queue');

  return toArray(response.data);
}

export async function fetchSlotsForType(appointmentType) {
  const response = await api.get('/time-slots', {
    params: { appointmentType },
  });

  return toArray(response.data);
}

export function getErrorMessage(error, fallback) {
  if (!error?.response) {
    return 'Could not reach the PulseUp server. Please try again.';
  }

  const data = error.response.data;

  return (
    (typeof data === 'string' ? data : data?.message || data?.error) ||
    fallback
  );
}

// Reminders the clinic has sent for appointments that are still to happen.
export function getReminderNotifications(appointments) {
  return appointments
    .filter(
      (appointment) =>
        appointment.reminderSentAt && isUpcoming(appointment),
    )
    .map((appointment) => ({
      id: `reminder-${appointment.appointmentId}`,
      title: 'Appointment reminder',
      message: `${appointment.appointmentType} on ${formatWhen(appointment)}.`,
    }));
}
