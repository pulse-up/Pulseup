import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/api';
import { clearSession } from '../utils/session';
import StudentProfile from '../components/StudentProfile';
import HealthRewards from '../components/HealthRewards';
import ResponsiveHeader from '../components/ResponsiveHeader';

import './StudentDashboard.css';

const APPOINTMENT_TYPES = [
  'General Consultations',
  'Reproductive Health',
  'HIV VCT',
  'TB DOTS',
  'Wound Dressings',
];

function readStoredUser() {
  const storedUser = localStorage.getItem('pulseupUser');

  if (!storedUser) {
    return {};
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Could not read stored student user:', error);

    clearSession();

    return {};
  }
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Date unavailable';
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(timeValue) {
  if (!timeValue) {
    return 'Time unavailable';
  }

  return String(timeValue).slice(0, 5);
}

function formatSlot(slot) {
  return (
    `${formatDate(slot.slotDate)} · ` +
    `${formatTime(slot.startTime)} – ` +
    `${formatTime(slot.endTime)} · ` +
    `${slot.roomNumber || 'Room to be assigned'}`
  );
}

function getErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string') {
    return responseData;
  }

  return responseData?.message || responseData?.error || fallbackMessage;
}

async function fetchDashboardData(appointmentType) {
  const [
    profileResponse,
    allSlotsResponse,
    bookingSlotsResponse,
    appointmentsResponse,
  ] = await Promise.all([
    api.get('/students/me'),

    api.get('/time-slots'),

    api.get('/time-slots', {
      params: {
        appointmentType,
      },
    }),

    api.get('/appointments/my-queue'),
  ]);

  return {
    studentProfile: profileResponse.data || {},

    allTimeSlots: toArray(allSlotsResponse.data),

    bookingSlots: toArray(bookingSlotsResponse.data),

    appointments: toArray(appointmentsResponse.data),
  };
}

function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(readStoredUser);

  const [studentProfile, setStudentProfile] = useState({});

  const [dashboardSection, setDashboardSection] = useState('appointments');

  const [allTimeSlots, setAllTimeSlots] = useState([]);

  const [bookingSlots, setBookingSlots] = useState([]);

  const [appointments, setAppointments] = useState([]);

  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [appointmentType, setAppointmentType] = useState(
    'General Consultations',
  );

  const [notes, setNotes] = useState('');

  const [rescheduleSlots, setRescheduleSlots] = useState({});

  const [activeTab, setActiveTab] = useState('upcoming');

  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const userRole = String(user.role || '')
    .trim()
    .toUpperCase()
    .replace('ROLE_', '');

  const updateUserAndProfile = useCallback((profile) => {
    if (!profile) {
      return;
    }

    setStudentProfile(profile);

    setUser((currentUser) => {
      const updatedStoredUser = {
        ...currentUser,
        ...profile,

        token: currentUser.token || currentUser.accessToken || currentUser.jwt,

        role: currentUser.role || 'STUDENT',
      };

      localStorage.setItem('pulseupUser', JSON.stringify(updatedStoredUser));

      return updatedStoredUser;
    });
  }, []);

  const refreshDashboardData = useCallback(async () => {
    try {
      const dashboardData = await fetchDashboardData(appointmentType);

      setStudentProfile(dashboardData.studentProfile);

      setAllTimeSlots(dashboardData.allTimeSlots);

      setBookingSlots(dashboardData.bookingSlots);

      setAppointments(dashboardData.appointments);

      setUser((currentUser) => {
        const updatedUser = {
          ...currentUser,
          ...dashboardData.studentProfile,

          token:
            currentUser.token || currentUser.accessToken || currentUser.jwt,

          role: currentUser.role || 'STUDENT',
        };

        localStorage.setItem('pulseupUser', JSON.stringify(updatedUser));

        return updatedUser;
      });

      return true;
    } catch (error) {
      console.error('Student dashboard loading failed:', error);

      const status = error.response?.status;

      if (status === 401 || status === 403) {
        clearSession();

        navigate('/login', {
          replace: true,
        });

        return false;
      }

      setAllTimeSlots([]);

      setBookingSlots([]);

      setAppointments([]);

      setMessage(
        getErrorMessage(error, 'Could not load your dashboard information.'),
      );

      return false;
    }
  }, [appointmentType, navigate]);

  useEffect(() => {
    const token = user.token || user.accessToken || user.jwt;

    const isAuthenticated = Boolean(token) && userRole === 'STUDENT';

    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
      });

      return undefined;
    }

    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setLoading(true);
      setMessage('');

      fetchDashboardData(appointmentType)
        .then((dashboardData) => {
          if (cancelled) {
            return;
          }

          setStudentProfile(dashboardData.studentProfile);

          setAllTimeSlots(dashboardData.allTimeSlots);

          setBookingSlots(dashboardData.bookingSlots);

          setAppointments(dashboardData.appointments);

          setUser((currentUser) => {
            const updatedUser = {
              ...currentUser,
              ...dashboardData.studentProfile,

              token:
                currentUser.token || currentUser.accessToken || currentUser.jwt,

              role: currentUser.role || 'STUDENT',
            };

            localStorage.setItem(
              'pulseupUser',
              JSON.stringify(updatedUser),
            );

            return updatedUser;
          });
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          console.error('Student dashboard loading failed:', error);

          const status = error.response?.status;

          if (status === 401 || status === 403) {
            clearSession();

            navigate('/login', {
              replace: true,
            });

            return;
          }

          setAllTimeSlots([]);

          setBookingSlots([]);

          setAppointments([]);

          setMessage(
            getErrorMessage(
              error,
              'Could not load your dashboard information.',
            ),
          );
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [
    appointmentType,
    navigate,
    user.accessToken,
    user.jwt,
    user.role,
    user.token,
    userRole,
  ]);

  const availableSlots = useMemo(
    () => bookingSlots.filter((slot) => slot.available === true),
    [bookingSlots],
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === 'PENDING' ||
          appointment.status === 'CONFIRMED',
      ),
    [appointments],
  );

  const rescheduledAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => appointment.status === 'RESCHEDULED',
      ),
    [appointments],
  );

  const cancelledAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === 'CANCELLED'),
    [appointments],
  );

  const completedAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === 'COMPLETED'),
    [appointments],
  );

  const confirmedAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.status === 'CONFIRMED')
        .sort((firstAppointment, secondAppointment) => {
          const firstDateTime = `${firstAppointment.slotDate || ''}T${
            firstAppointment.startTime || ''
          }`;

          const secondDateTime = `${secondAppointment.slotDate || ''}T${
            secondAppointment.startTime || ''
          }`;

          return firstDateTime.localeCompare(secondDateTime);
        }),
    [appointments],
  );

  const liveQueueAppointment = confirmedAppointments[0] || null;

  const healthPoints = Math.max(
    0,
    Number(studentProfile.healthPoints ?? user.healthPoints ?? 0) || 0,
  );

  function getVisibleAppointments() {
    switch (activeTab) {
      case 'rescheduled':
        return rescheduledAppointments;

      case 'cancelled':
        return cancelledAppointments;

      case 'completed':
        return completedAppointments;

      case 'upcoming':
      default:
        return upcomingAppointments;
    }
  }

  function getRescheduleOptions(appointment) {
    return allTimeSlots.filter(
      (slot) =>
        slot.available === true &&
        slot.appointmentType === appointment.appointmentType &&
        String(slot.slotId) !== String(appointment.slotId),
    );
  }

  function handleAppointmentTypeChange(event) {
    setMessage('');
    setSelectedSlotId('');
    setAppointmentType(event.target.value);
  }

  function handleRescheduleSelection(appointmentId, slotId) {
    setRescheduleSlots((currentSelections) => ({
      ...currentSelections,
      [appointmentId]: slotId,
    }));
  }

  async function handleBooking(event) {
    event.preventDefault();

    if (!selectedSlotId) {
      setMessage('Please select an available time slot.');

      return;
    }

    try {
      setSubmitting(true);

      setMessage('');

      await api.post('/appointments', null, {
        params: {
          slotId: Number(selectedSlotId),

          notes: notes.trim() || undefined,
        },
      });

      setSelectedSlotId('');

      setNotes('');

      setActiveTab('upcoming');

      await refreshDashboardData();

      setMessage(
        'Your appointment was booked and is awaiting staff confirmation.',
      );
    } catch (error) {
      console.error('Appointment booking failed:', error);

      setMessage(
        getErrorMessage(
          error,
          'The appointment could not be booked. The selected slot may no longer be available.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancellation(appointmentId) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this appointment?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);

      setMessage('');

      await api.patch(`/appointments/${appointmentId}/cancel`);

      setActiveTab('cancelled');

      await refreshDashboardData();

      setMessage('Your appointment was cancelled successfully.');
    } catch (error) {
      console.error('Appointment cancellation failed:', error);

      setMessage(
        getErrorMessage(error, 'The appointment could not be cancelled.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReschedule(appointmentId) {
    const selectedNewSlot = rescheduleSlots[appointmentId];

    if (!selectedNewSlot) {
      setMessage('Select a new available time slot first.');

      return;
    }

    try {
      setSubmitting(true);

      setMessage('');

      await api.patch(`/appointments/${appointmentId}/reschedule`, null, {
        params: {
          slotId: Number(selectedNewSlot),
        },
      });

      setRescheduleSlots((currentSelections) => ({
        ...currentSelections,
        [appointmentId]: '',
      }));

      setActiveTab('rescheduled');

      await refreshDashboardData();

      setMessage('Your appointment was rescheduled successfully.');
    } catch (error) {
      console.error('Appointment rescheduling failed:', error);

      setMessage(
        getErrorMessage(
          error,
          'The appointment could not be rescheduled. The selected slot may no longer be available.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleProfileUpdated(updatedStudent) {
    if (!updatedStudent) {
      return;
    }

    updateUserAndProfile(updatedStudent);
  }

  function handleLogout() {
    clearSession();

    navigate('/login', {
      replace: true,
    });
  }

  function renderQueueCard() {
    if (!liveQueueAppointment) {
      return (
        <article className="live-queue-card queue-empty-card">
          <div className="queue-card-heading">
            <div>
              <p className="queue-card-label">LIVE DIGITAL QUEUE</p>

              <h2>No confirmed visit yet</h2>
            </div>

            <span className="queue-live-badge">QUEUE</span>
          </div>

          <p className="queue-empty-copy">
            Once a staff member confirms your appointment, this card will show
            your clinician, queue position, room and estimated wait.
          </p>
        </article>
      );
    }

    const queueNumber = liveQueueAppointment.queuePosition || 1;

    return (
      <article className="live-queue-card">
        <div className="queue-card-heading">
          <div>
            <p className="queue-card-label">LIVE DIGITAL QUEUE</p>

            <h2>{liveQueueAppointment.appointmentType}</h2>

            <p className="queue-clinician">
              Assisting clinician:{' '}
              <strong>
                {liveQueueAppointment.staffName || 'To be assigned'}
              </strong>
            </p>
          </div>

          <span className="queue-live-badge">LIVE NOW</span>
        </div>

        <div className="queue-number">
          <strong>#{queueNumber}</strong>

          <span>IN QUEUE</span>
        </div>

        <div className="queue-information-grid">
          <div>
            <span>ESTIMATED WAIT</span>

            <strong>
              {liveQueueAppointment.estimatedWaitMinutes || 0} mins
            </strong>
          </div>

          <div>
            <span>CLINIC ROOM</span>

            <strong>
              {liveQueueAppointment.roomNumber || 'To be assigned'}
            </strong>
          </div>
        </div>

        <div className="queue-appointment-details">
          <span>{formatDate(liveQueueAppointment.slotDate)}</span>

          <span>
            {formatTime(liveQueueAppointment.startTime)}

            {' – '}

            {formatTime(liveQueueAppointment.endTime)}
          </span>

          <span>{liveQueueAppointment.staffDepartment || 'Clinic'}</span>
        </div>
      </article>
    );
  }

  function renderAppointment(appointment) {
    const appointmentStatus = appointment.status || 'PENDING';

    const canMakeChanges =
      appointmentStatus !== 'CANCELLED' && appointmentStatus !== 'COMPLETED';

    const rescheduleOptions = getRescheduleOptions(appointment);

    return (
      <article className="appointment-card" key={appointment.appointmentId}>
        <div className="appointment-heading">
          <div>
            <h3>{appointment.appointmentType}</h3>

            <p>
              {formatDate(appointment.slotDate)}

              {' · '}

              {formatTime(appointment.startTime)}

              {' – '}

              {formatTime(appointment.endTime)}
            </p>
          </div>

          <span
            className={'appointment-status ' + appointmentStatus.toLowerCase()}
          >
            {appointmentStatus}
          </span>
        </div>

        <div className="appointment-meta-grid">
          <div>
            <span>CLINICIAN</span>

            <strong>{appointment.staffName || 'To be assigned'}</strong>
          </div>

          <div>
            <span>ROOM</span>

            <strong>{appointment.roomNumber || 'To be assigned'}</strong>
          </div>

          <div>
            <span>DEPARTMENT</span>

            <strong>{appointment.staffDepartment || 'Clinic'}</strong>
          </div>
        </div>

        {appointmentStatus === 'CONFIRMED' && (
          <p className="appointment-queue-note">
            Queue position: <strong>#{appointment.queuePosition || 1}</strong>
            {' · '}
            Estimated wait:{' '}
            <strong>{appointment.estimatedWaitMinutes || 0} minutes</strong>
          </p>
        )}

        {appointment.notes && (
          <p className="appointment-notes">
            <strong>Your notes:</strong> {appointment.notes}
          </p>
        )}

        {appointmentStatus === 'COMPLETED' && (
          <p className="appointment-completed-note">
            This completed visit contributed to your Health Points.
          </p>
        )}

        {canMakeChanges && (
          <div className="appointment-actions">
            <select
              value={rescheduleSlots[appointment.appointmentId] || ''}
              onChange={(event) =>
                handleRescheduleSelection(
                  appointment.appointmentId,
                  event.target.value,
                )
              }
              disabled={submitting || rescheduleOptions.length === 0}
            >
              <option value="">
                {rescheduleOptions.length === 0
                  ? 'No matching slots available'
                  : 'Choose a new time slot'}
              </option>

              {rescheduleOptions.map((slot) => (
                <option value={slot.slotId} key={slot.slotId}>
                  {formatSlot(slot)}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="secondary-button"
              disabled={submitting || rescheduleOptions.length === 0}
              onClick={() => handleReschedule(appointment.appointmentId)}
            >
              Reschedule
            </button>

            <button
              type="button"
              className="danger-button"
              disabled={submitting}
              onClick={() => handleCancellation(appointment.appointmentId)}
            >
              Cancel
            </button>
          </div>
        )}
      </article>
    );
  }

  const visibleAppointments = getVisibleAppointments();

  return (
    <main className="student-dashboard">
      <ResponsiveHeader
        ariaLabel="Student dashboard navigation"
        desktopAction={{ label: 'Back to home', to: '/' }}
        identity={{
          name: `${user.firstName || 'Student'} ${user.lastName || ''}`.trim(),
          detail:
            studentProfile.studentNumber || user.studentNumber || 'Student',
        }}
        menuItems={[
          { label: 'Home', to: '/' },
          {
            label: 'Appointments',
            active: dashboardSection === 'appointments',
            onSelect: () => setDashboardSection('appointments'),
          },
          {
            label: 'Health Rewards',
            active: dashboardSection === 'rewards',
            onSelect: () => setDashboardSection('rewards'),
          },
          {
            label: 'My Profile',
            active: dashboardSection === 'profile',
            onSelect: () => setDashboardSection('profile'),
          },
          { label: 'Health Quests', to: '/student/health-quests' },
          { label: 'Sick Notes', to: '/student/sick-notes' },
          { label: 'Medical History', to: '/student/history' },
          { label: 'Clinic Services', to: '/student/bookings' },
        ]}
        onSignOut={handleLogout}
      />

      <section className="dashboard-introduction">
        <p className="eyebrow">STUDENT DASHBOARD</p>

        <h1>Welcome back, {user.firstName || 'Student'}.</h1>

        <p>
          Book a clinic visit, track your digital queue, manage appointments and
          earn Health Points.
        </p>
      </section>

      <nav className="student-dashboard-navigation">
        <button
          type="button"
          className={
            dashboardSection === 'appointments'
              ? 'dashboard-navigation-button active'
              : 'dashboard-navigation-button'
          }
          onClick={() => setDashboardSection('appointments')}
        >
          Appointments
        </button>

        <button
          type="button"
          className={
            dashboardSection === 'rewards'
              ? 'dashboard-navigation-button active'
              : 'dashboard-navigation-button'
          }
          onClick={() => setDashboardSection('rewards')}
        >
          Health Rewards
        </button>

        <button
          type="button"
          className={
            dashboardSection === 'profile'
              ? 'dashboard-navigation-button active'
              : 'dashboard-navigation-button'
          }
          onClick={() => setDashboardSection('profile')}
        >
          My Profile
        </button>
      </nav>

      {message && <p className="dashboard-message">{message}</p>}

      {dashboardSection === 'appointments' && (
        <>
          <section className="dashboard-summary">
            <article>
              <span>Upcoming bookings</span>

              <strong>{upcomingAppointments.length}</strong>
            </article>

            <article>
              <span>Confirmed visits</span>

              <strong>{confirmedAppointments.length}</strong>
            </article>

            <article>
              <span>Health Points</span>

              <strong>{healthPoints}</strong>
            </article>

            <article>
              <span>Available slots</span>

              <strong>{availableSlots.length}</strong>
            </article>
          </section>

          <section className="dashboard-grid">
            <div className="student-dashboard-sidebar">
              {renderQueueCard()}

              <article className="dashboard-panel">
                <p className="eyebrow">NEW APPOINTMENT</p>

                <h2>Book a clinic visit</h2>

                <form className="booking-form" onSubmit={handleBooking}>
                  <label>
                    Appointment type
                    <select
                      value={appointmentType}
                      onChange={handleAppointmentTypeChange}
                      disabled={submitting}
                    >
                      {APPOINTMENT_TYPES.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Available time slot
                    <select
                      value={selectedSlotId}
                      onChange={(event) =>
                        setSelectedSlotId(event.target.value)
                      }
                      required
                      disabled={
                        submitting || loading || availableSlots.length === 0
                      }
                    >
                      <option value="">
                        {loading
                          ? 'Loading available slots...'
                          : availableSlots.length === 0
                            ? 'No available slots for this type'
                            : 'Select a time slot'}
                      </option>

                      {availableSlots.map((slot) => (
                        <option value={slot.slotId} key={slot.slotId}>
                          {formatSlot(slot)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Notes for the clinic
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Optional information about your visit"
                      rows={4}
                      disabled={submitting}
                    />
                  </label>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      submitting || loading || availableSlots.length === 0
                    }
                  >
                    {submitting ? 'Booking...' : 'Confirm appointment'}
                  </button>
                </form>
              </article>
            </div>

            <article className="dashboard-panel bookings-panel">
              <p className="eyebrow">MY BOOKINGS</p>

              <h2>Appointment history</h2>

              <div className="booking-tabs">
                <button
                  type="button"
                  className={
                    activeTab === 'upcoming'
                      ? 'booking-tab active'
                      : 'booking-tab'
                  }
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming ({upcomingAppointments.length})
                </button>

                <button
                  type="button"
                  className={
                    activeTab === 'rescheduled'
                      ? 'booking-tab active'
                      : 'booking-tab'
                  }
                  onClick={() => setActiveTab('rescheduled')}
                >
                  Rescheduled ({rescheduledAppointments.length})
                </button>

                <button
                  type="button"
                  className={
                    activeTab === 'cancelled'
                      ? 'booking-tab active'
                      : 'booking-tab'
                  }
                  onClick={() => setActiveTab('cancelled')}
                >
                  Cancelled ({cancelledAppointments.length})
                </button>

                <button
                  type="button"
                  className={
                    activeTab === 'completed'
                      ? 'booking-tab active'
                      : 'booking-tab'
                  }
                  onClick={() => setActiveTab('completed')}
                >
                  Completed ({completedAppointments.length})
                </button>
              </div>

              {loading ? (
                <p>Loading appointments...</p>
              ) : visibleAppointments.length === 0 ? (
                <p className="empty-message">
                  No appointments in this section.
                </p>
              ) : (
                <div className="appointment-list">
                  {visibleAppointments.map(renderAppointment)}
                </div>
              )}
            </article>
          </section>
        </>
      )}

      {dashboardSection === 'rewards' && (
        <HealthRewards healthPoints={healthPoints} />
      )}

      {dashboardSection === 'profile' && (
        <section className="student-profile-section">
          <StudentProfile onProfileUpdated={handleProfileUpdated} />
        </section>
      )}
    </main>
  );
}

export default StudentDashboard;
