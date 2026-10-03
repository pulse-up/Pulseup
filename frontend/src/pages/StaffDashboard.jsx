import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { clearSession } from '../utils/session';
import ResponsiveHeader from '../components/ResponsiveHeader';

const SERVICE_CATALOG = [
  {
    appointmentType: 'General Consultations',
    roomNumber: 'Unit A1',
    duration: 20,
  },
  {
    appointmentType: 'Reproductive Health',
    roomNumber: 'Unit B1',
    duration: 30,
  },
  {
    appointmentType: 'HIV VCT',
    roomNumber: 'Unit C1',
    duration: 30,
  },
  {
    appointmentType: 'TB DOTS',
    roomNumber: 'Unit D1',
    duration: 15,
  },
  {
    appointmentType: 'Wound Dressings',
    roomNumber: 'Unit E1',
    duration: 30,
  },
];

function readStoredUser() {
  const storedUser = localStorage.getItem('pulseupUser');

  if (!storedUser) {
    return {};
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Could not read stored staff user:', error);

    clearSession();
    return {};
  }
}

function getServiceConfiguration(department) {
  const normalisedDepartment = String(department || '')
    .trim()
    .toLowerCase();

  return (
    SERVICE_CATALOG.find(
      (service) =>
        service.appointmentType.toLowerCase() === normalisedDepartment,
    ) || null
  );
}

function getToday() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatTime(timeValue) {
  if (!timeValue) {
    return 'Time unavailable';
  }

  return timeValue.slice(0, 5);
}

function StaffDashboard() {
  const navigate = useNavigate();

  const [user] = useState(readStoredUser);
  const [staffProfile, setStaffProfile] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [slotForm, setSlotForm] = useState({
    slotDate: '',
    startTime: '',
    endTime: '',
    appointmentType: 'General Consultations',
    roomNumber: 'Unit A1',
    estimatedDurationMinutes: '20',
  });

  const userRole = String(user.role || '').toUpperCase();

  const today = getToday();

  const loadDashboardData = useCallback(async () => {
    try {
      const [profileResponse, slotsResponse, appointmentsResponse] =
        await Promise.all([
          api.get('/staff/me'),

          api.get(`/time-slots/staff/${user.userId}`),

          api.get(`/appointments/staff/${user.userId}`),
        ]);

      const profile = profileResponse.data || {};

      const serviceConfiguration = getServiceConfiguration(profile.department);

      setStaffProfile(profile);

      setTimeSlots(Array.isArray(slotsResponse.data) ? slotsResponse.data : []);

      setAppointments(
        Array.isArray(appointmentsResponse.data)
          ? appointmentsResponse.data
          : [],
      );

      if (serviceConfiguration) {
        setSlotForm((currentForm) => ({
          ...currentForm,
          appointmentType: serviceConfiguration.appointmentType,
          roomNumber: currentForm.roomNumber || serviceConfiguration.roomNumber,
          estimatedDurationMinutes:
            currentForm.estimatedDurationMinutes ||
            String(serviceConfiguration.duration),
        }));
      }
    } catch (error) {
      console.error('Staff dashboard loading failed:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        clearSession();

        navigate('/login', {
          replace: true,
        });

        return;
      }

      setMessage('Could not load the staff dashboard.');
    } finally {
      setLoading(false);
    }
  }, [navigate, user.userId]);

  useEffect(() => {
    if (!user.userId || !user.token || userRole !== 'STAFF') {
      navigate('/login', {
        replace: true,
      });

      return;
    }

    let cancelled = false;

    window.queueMicrotask(() => {
      if (!cancelled) {
        void loadDashboardData();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadDashboardData, navigate, user.token, user.userId, userRole]);

  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'PENDING' || appointment.status === 'RESCHEDULED',
  );

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === 'CONFIRMED',
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === 'COMPLETED',
  );

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === 'CANCELLED',
  );

  function getVisibleAppointments() {
    switch (activeTab) {
      case 'confirmed':
        return confirmedAppointments;

      case 'completed':
        return completedAppointments;

      case 'cancelled':
        return cancelledAppointments;

      case 'pending':
      default:
        return pendingAppointments;
    }
  }

  function handleSlotChange(event) {
    const { name, value } = event.target;

    setSlotForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleCreateSlot(event) {
    event.preventDefault();

    const serviceConfiguration = getServiceConfiguration(
      staffProfile.department,
    );

    const duration = Number(slotForm.estimatedDurationMinutes);

    if (!serviceConfiguration) {
      setMessage(
        'Your staff department is not linked to a valid appointment type.',
      );

      return;
    }

    if (
      !slotForm.slotDate ||
      !slotForm.startTime ||
      !slotForm.endTime ||
      !slotForm.roomNumber.trim()
    ) {
      setMessage('Complete all time-slot fields.');

      return;
    }

    if (slotForm.startTime >= slotForm.endTime) {
      setMessage('The end time must be after the start time.');

      return;
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 180) {
      setMessage('The duration must be between 1 and 180 minutes.');

      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      await api.post('/time-slots', null, {
        params: {
          staffId: user.userId,
          slotDate: slotForm.slotDate,
          startTime: slotForm.startTime,
          endTime: slotForm.endTime,
          appointmentType: serviceConfiguration.appointmentType,
          roomNumber: slotForm.roomNumber.trim(),
          estimatedDurationMinutes: duration,
        },
      });

      setSlotForm({
        slotDate: '',
        startTime: '',
        endTime: '',
        appointmentType: serviceConfiguration.appointmentType,
        roomNumber: serviceConfiguration.roomNumber,
        estimatedDurationMinutes: String(serviceConfiguration.duration),
      });

      await loadDashboardData();

      setMessage('The time slot was created successfully.');
    } catch (error) {
      console.error(
        'Time-slot creation failed:',
        error.response?.status,
        error.response?.data || error.message,
      );

      if (error.response?.status === 400) {
        setMessage(
          'The server rejected the slot. Check the date, time, room, and duration.',
        );
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage('You do not have permission to create this time slot.');
      } else {
        setMessage('The time slot could not be created.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(appointmentId, status) {
    if (!appointmentId) {
      setMessage('The appointment ID is missing.');

      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      await api.patch(`/appointments/${appointmentId}/status`, null, {
        params: {
          status,
        },
      });

      await loadDashboardData();

      if (status === 'CONFIRMED') {
        setActiveTab('confirmed');

        setMessage('The appointment was confirmed successfully.');
      }

      if (status === 'COMPLETED') {
        setActiveTab('completed');

        setMessage(
          'The appointment was marked as attended.',
        );
      }
    } catch (error) {
      console.error(
        'Appointment status update failed:',
        error.response?.status,
        error.response?.data || error.message,
      );

      if (error.response?.status === 403) {
        setMessage(
          'You can update only appointments assigned to your time slots.',
        );
      } else {
        setMessage('The appointment status could not be updated.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    clearSession();

    navigate('/login', {
      replace: true,
    });
  }

  function renderAppointment(appointment) {
    const status = appointment.status || 'PENDING';

    const student = appointment.student;
    const slot = appointment.timeSlot;

    return (
      <article className="appointment-card" key={appointment.appointmentId}>
        <div className="appointment-heading">
          <div>
            <h3>{appointment.appointmentType}</h3>

            <p>
              {formatDate(slot?.slotDate)}
              {' · '}
              {formatTime(slot?.startTime)}
              {' – '}
              {formatTime(slot?.endTime)}
            </p>
          </div>

          <span className={`appointment-status ` + status.toLowerCase()}>
            {status}
          </span>
        </div>

        <div className="appointment-meta-grid">
          <div>
            <span>STUDENT</span>

            <strong>
              {student?.firstName || 'Unknown'} {student?.lastName || 'student'}
            </strong>
          </div>

          <div>
            <span>ROOM</span>

            <strong>{slot?.roomNumber || 'Not assigned'}</strong>
          </div>

          <div>
            <span>DURATION</span>

            <strong>{slot?.estimatedDurationMinutes || 0} minutes</strong>
          </div>
        </div>

        <div className="student-details">
          {student?.studentNumber && (
            <span>Student number: {student.studentNumber}</span>
          )}

          {student?.email && <span>{student.email}</span>}
        </div>

        {appointment.notes && (
          <p className="appointment-notes">
            <strong>Student notes:</strong> {appointment.notes}
          </p>
        )}

        <div className="staff-appointment-actions">
          {(status === 'PENDING' || status === 'RESCHEDULED') && (
            <button
              type="button"
              className="primary-button"
              disabled={submitting}
              onClick={() =>
                handleStatusUpdate(appointment.appointmentId, 'CONFIRMED')
              }
            >
              {submitting ? 'Updating...' : 'Confirm appointment'}
            </button>
          )}

          {status === 'CONFIRMED' && (
            <button
              type="button"
              className="complete-button"
              disabled={submitting}
              onClick={() =>
                handleStatusUpdate(appointment.appointmentId, 'COMPLETED')
              }
            >
              {submitting ? 'Updating...' : 'Mark as completed'}
            </button>
          )}
        </div>
      </article>
    );
  }

  const visibleAppointments = getVisibleAppointments();

  const serviceConfiguration = getServiceConfiguration(staffProfile.department);

  return (
    <main className="student-dashboard staff-dashboard">
      <ResponsiveHeader
        ariaLabel="Staff dashboard navigation"
        desktopAction={{ label: 'Back to home', to: '/' }}
        identity={{
          name: `${user.firstName || 'Clinic'} ${user.lastName || 'staff'}`.trim(),
          detail: staffProfile.position || 'Clinic staff',
        }}
        menuItems={[
          { label: 'Home', to: '/' },
          {
            label: 'Pending appointments',
            active: activeTab === 'pending',
            onSelect: () => setActiveTab('pending'),
          },
          {
            label: 'Confirmed appointments',
            active: activeTab === 'confirmed',
            onSelect: () => setActiveTab('confirmed'),
          },
          {
            label: 'Completed appointments',
            active: activeTab === 'completed',
            onSelect: () => setActiveTab('completed'),
          },
          {
            label: 'Cancelled appointments',
            active: activeTab === 'cancelled',
            onSelect: () => setActiveTab('cancelled'),
          },
          { label: 'My Profile', to: '/staff/profile' },
          { label: 'Clinic History', to: '/staff/history' },
        ]}
        onSignOut={handleLogout}
      />

      <section className="dashboard-introduction">
        <p className="eyebrow">STAFF DASHBOARD</p>

        <h1>Manage your clinic schedule.</h1>

        <p>
          {staffProfile.department || 'Clinic department'}
          {' · '}
          Publish availability and manage student appointments.
        </p>
      </section>

      <section className="dashboard-summary">
        <article>
          <span>My time slots</span>
          <strong>{timeSlots.length}</strong>
        </article>

        <article>
          <span>Pending appointments</span>
          <strong>{pendingAppointments.length}</strong>
        </article>

        <article>
          <span>Confirmed appointments</span>
          <strong>{confirmedAppointments.length}</strong>
        </article>
      </section>

      {message && <p className="dashboard-message">{message}</p>}

      <section className="staff-dashboard-grid">
        <aside className="staff-sidebar">
          <article className="dashboard-panel">
            <p className="eyebrow">CREATE TIME SLOT</p>

            <h2>Open availability</h2>

            <form className="booking-form" onSubmit={handleCreateSlot}>
              <label>
                Appointment type
                <select
                  name="appointmentType"
                  value={slotForm.appointmentType}
                  disabled
                >
                  <option
                    value={
                      serviceConfiguration?.appointmentType ||
                      slotForm.appointmentType
                    }
                  >
                    {serviceConfiguration?.appointmentType ||
                      slotForm.appointmentType}
                  </option>
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  name="slotDate"
                  min={today}
                  value={slotForm.slotDate}
                  onChange={handleSlotChange}
                  disabled={submitting}
                  required
                />
              </label>

              <label>
                Start time
                <input
                  type="time"
                  name="startTime"
                  value={slotForm.startTime}
                  onChange={handleSlotChange}
                  disabled={submitting}
                  required
                />
              </label>

              <label>
                End time
                <input
                  type="time"
                  name="endTime"
                  value={slotForm.endTime}
                  onChange={handleSlotChange}
                  disabled={submitting}
                  required
                />
              </label>

              <label>
                Clinic room / unit
                <input
                  type="text"
                  name="roomNumber"
                  value={slotForm.roomNumber}
                  onChange={handleSlotChange}
                  disabled={submitting}
                  required
                />
              </label>

              <label>
                Estimated duration in minutes
                <input
                  type="number"
                  name="estimatedDurationMinutes"
                  min="1"
                  max="180"
                  value={slotForm.estimatedDurationMinutes}
                  onChange={handleSlotChange}
                  disabled={submitting}
                  required
                />
              </label>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting || !serviceConfiguration}
              >
                {submitting ? 'Creating...' : 'Create time slot'}
              </button>
            </form>
          </article>

          <article className="dashboard-panel">
            <p className="eyebrow">MY AVAILABILITY</p>

            <h2>Published slots</h2>

            {loading ? (
              <p>Loading time slots...</p>
            ) : timeSlots.length === 0 ? (
              <p className="empty-message">
                You have not created any time slots.
              </p>
            ) : (
              <div className="slot-list">
                {timeSlots.map((slot) => (
                  <article className="slot-card" key={slot.slotId}>
                    <div>
                      <strong>{slot.appointmentType}</strong>

                      <span>{formatDate(slot.slotDate)}</span>

                      <span>
                        {formatTime(slot.startTime)}
                        {' – '}
                        {formatTime(slot.endTime)}
                      </span>

                      <span>
                        {slot.roomNumber}
                        {' · '}
                        {slot.estimatedDurationMinutes} minutes
                      </span>

                      <span
                        className={
                          slot.available
                            ? 'slot-status available'
                            : 'slot-status booked'
                        }
                      >
                        {slot.available ? 'Available' : 'Booked'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </aside>

        <article className="dashboard-panel">
          <p className="eyebrow">STUDENT APPOINTMENTS</p>

          <h2>Manage bookings</h2>

          <div className="booking-tabs">
            <button
              type="button"
              className={
                activeTab === 'pending' ? 'booking-tab active' : 'booking-tab'
              }
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingAppointments.length})
            </button>

            <button
              type="button"
              className={
                activeTab === 'confirmed' ? 'booking-tab active' : 'booking-tab'
              }
              onClick={() => setActiveTab('confirmed')}
            >
              Confirmed ({confirmedAppointments.length})
            </button>

            <button
              type="button"
              className={
                activeTab === 'completed' ? 'booking-tab active' : 'booking-tab'
              }
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedAppointments.length})
            </button>

            <button
              type="button"
              className={
                activeTab === 'cancelled' ? 'booking-tab active' : 'booking-tab'
              }
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled ({cancelledAppointments.length})
            </button>
          </div>

          {loading ? (
            <p>Loading appointments...</p>
          ) : visibleAppointments.length === 0 ? (
            <p className="empty-message">No appointments in this section.</p>
          ) : (
            <div className="appointment-list">
              {visibleAppointments.map(renderAppointment)}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default StaffDashboard;
