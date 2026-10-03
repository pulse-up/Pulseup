import { useCallback, useEffect, useMemo, useState } from 'react';
import './StudentBookings.css';
import api from '../api/api';
import { USE_BACKEND } from '../constants/appConfig';
import { getUserDisplayName } from '../utils/session';
import {
    APPOINTMENT_TYPES,
    fetchMyAppointments,
    fetchSlotsForType,
    formatSlot,
    formatTime,
    formatWhen,
    getErrorMessage,
    getReminderNotifications,
    isUpcoming,
    statusLabel,
} from '../utils/appointments';

const STATUS_TONES = {
    COMPLETED: 'green',
    CANCELLED: 'red',
    NO_SHOW: 'blue',
};

function Modal({ title, onClose, children }) {
    return (
        <div className="modal-backdrop" onMouseDown={onClose}>
            <section className="pulse-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" onClick={onClose}>×</button>
                </div>
                {children}
            </section>
        </div>
    );
}

function getInitials(name) {
    return (
        (name || '')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase() || '?'
    );
}

function Bookings() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(USE_BACKEND);
    const [message, setMessage] = useState(
        USE_BACKEND ? '' : 'Bookings need the PulseUp backend. Set VITE_USE_BACKEND=true to use them.',
    );
    const [query, setQuery] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [rescheduling, setRescheduling] = useState(null);
    const [details, setDetails] = useState(null);
    const [working, setWorking] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');

    const [profile, setProfile] = useState({ name: getUserDisplayName('Student'), email: '', phone: '' });
    const [bookingForm, setBookingForm] = useState({ service: '', slotId: '', notes: '' });
    const [bookingSlots, setBookingSlots] = useState([]);
    const [rescheduleSlots, setRescheduleSlots] = useState([]);
    const [rescheduleSlotId, setRescheduleSlotId] = useState('');

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
        return () => document.body.classList.remove('dark-mode');
    }, [darkMode]);

    const load = useCallback(async () => {
        if (!USE_BACKEND) {
            return;
        }

        try {
            setAppointments(await fetchMyAppointments());
        } catch (error) {
            console.error('Could not load appointments:', error);
            setMessage(getErrorMessage(error, 'Your appointments could not be loaded.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Slots for the service picked in the booking form.
    useEffect(() => {
        if (!bookingForm.service) {
            return;
        }

        let cancelled = false;

        fetchSlotsForType(bookingForm.service)
            .then((slots) => !cancelled && setBookingSlots(slots))
            .catch(() => !cancelled && setBookingSlots([]));

        return () => {
            cancelled = true;
        };
    }, [bookingForm.service]);

    // Slots of the same type for the appointment being rescheduled.
    useEffect(() => {
        if (!rescheduling) {
            return;
        }

        let cancelled = false;

        fetchSlotsForType(rescheduling.appointmentType)
            .then((slots) => !cancelled && setRescheduleSlots(slots))
            .catch(() => !cancelled && setRescheduleSlots([]));

        return () => {
            cancelled = true;
        };
    }, [rescheduling]);

    const matches = useCallback(
        (appointment) => {
            const text = query.trim().toLowerCase();

            return (
                !text ||
                `${appointment.appointmentType} ${appointment.staffName} ${appointment.roomNumber}`
                    .toLowerCase()
                    .includes(text)
            );
        },
        [query],
    );

    const now = new Date();

    const active = useMemo(
        () => appointments.filter((item) => isUpcoming(item) && matches(item)),
        [appointments, matches],
    );

    const past = useMemo(
        () =>
            appointments
                .filter((item) => !isUpcoming(item) && matches(item))
                .sort((a, b) =>
                    `${b.slotDate}${b.startTime}`.localeCompare(`${a.slotDate}${a.startTime}`),
                ),
        [appointments, matches],
    );

    const visibleActive = showAll ? active : active.slice(0, 2);

    // The next confirmed appointment with a live queue position.
    const queueAppointment = appointments.find(
        (item) => isUpcoming(item, now) && item.status === 'CONFIRMED' && item.queuePosition > 0,
    );

    const notifications = getReminderNotifications(appointments);

    async function runAction(action, successText, failureText) {
        try {
            setWorking(true);
            setMessage('');
            await action();
            await load();
            setMessage(successText);
            return true;
        } catch (error) {
            console.error(failureText, error);
            setMessage(getErrorMessage(error, failureText));
            return false;
        } finally {
            setWorking(false);
        }
    }

    const cancelBooking = (appointment) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        runAction(
            () => api.patch(`/appointments/${appointment.appointmentId}/cancel`),
            'Your booking was cancelled.',
            'The booking could not be cancelled.',
        );
    };

    const saveReschedule = async (event) => {
        event.preventDefault();

        if (!rescheduleSlotId) {
            setMessage('Choose a new time slot.');
            return;
        }

        const done = await runAction(
            () =>
                api.patch(`/appointments/${rescheduling.appointmentId}/reschedule`, null, {
                    params: { slotId: Number(rescheduleSlotId) },
                }),
            'Your appointment was rescheduled and is awaiting confirmation.',
            'The appointment could not be rescheduled.',
        );

        if (done) {
            setRescheduling(null);
            setRescheduleSlotId('');
        }
    };

    const createBooking = async (event) => {
        event.preventDefault();

        if (!bookingForm.service || !bookingForm.slotId) {
            setMessage('Choose a service and a time slot.');
            return;
        }

        const done = await runAction(
            () =>
                api.post('/appointments', null, {
                    params: {
                        slotId: Number(bookingForm.slotId),
                        notes: bookingForm.notes.trim() || undefined,
                    },
                }),
            'Your appointment was booked and is awaiting staff confirmation.',
            'The appointment could not be booked.',
        );

        if (done) {
            setBookingForm({ service: '', slotId: '', notes: '' });
            setBookingSlots([]);
            setBookingOpen(false);
        }
    };

    return (
        <div className="bookings-page">
            <header className="bookings-topbar">
                <div className="bookings-search">
                    <span>⌕</span>
                    <input
                        type="search"
                        placeholder="Search appointments..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="bookings-actions">
                    <div className="notification-wrapper">
                        <button className="icon-button" type="button" onClick={() => setNotificationsOpen((v) => !v)}>♢</button>
                        {notificationsOpen && (
                            <div className="notification-menu">
                                <h3>Notifications</h3>
                                {notifications.length === 0 && <p>No new notifications.</p>}
                                {notifications.map((item) => (
                                    <div key={item.id}><strong>{item.title}</strong><p>{item.message}</p></div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="icon-button" type="button" onClick={() => setSettingsOpen(true)}>⚙</button>
                    <div className="booking-avatar">{getInitials(profile.name)}</div>
                </div>
            </header>

            {message && <p className="empty-message" role="status">{message}</p>}

            <div className="bookings-main-grid">
                <article className="queue-card">
                    <div className="queue-heading">
                        <strong>Live Digital Queue</strong>
                        {queueAppointment && <span>LIVE NOW</span>}
                    </div>

                    {queueAppointment ? (
                        <>
                            <small>{queueAppointment.appointmentType} - {queueAppointment.staffName}</small>
                            <div className="queue-circle">#{queueAppointment.queuePosition}</div>
                            <p>IN QUEUE</p>
                            <div className="queue-stats">
                                <div><strong>{queueAppointment.estimatedWaitMinutes} mins</strong><span>Estimated Wait</span></div>
                                <div><strong>{queueAppointment.roomNumber}</strong><span>Clinic Room</span></div>
                            </div>
                        </>
                    ) : (
                        <p className="empty-message">
                            Your queue position appears here once the clinic confirms an appointment.
                        </p>
                    )}
                </article>

                <section>
                    <div className="bookings-section-heading">
                        <h2>Active Bookings</h2>
                        {!showAll && active.length > 2 && (
                            <button type="button" onClick={() => setShowAll(true)}>View All →</button>
                        )}
                    </div>

                    {loading && <p className="empty-message">Loading your bookings...</p>}

                    {!loading && active.length === 0 && (
                        <p className="empty-message">No active bookings. Start a new booking below.</p>
                    )}

                    {visibleActive.map((booking) => (
                        <article className="active-booking-card" key={booking.appointmentId}>
                            <div>
                                <strong>{booking.appointmentType}</strong>
                                <small>
                                    {formatWhen(booking)} · {statusLabel(booking.status)}
                                    {booking.staffName ? ` · ${booking.staffName}` : ''}
                                </small>
                            </div>
                            <div className="booking-buttons">
                                <button type="button" className="outline-blue" disabled={working} onClick={() => setRescheduling(booking)}>Reschedule</button>
                                <button type="button" className="outline-red" disabled={working} onClick={() => cancelBooking(booking)}>Cancel</button>
                            </div>
                        </article>
                    ))}

                    <article className="add-booking-card">
                        <div className="plus-icon">⊕</div>
                        <h3>Need another appointment?</h3>
                        <p>Book a consultation in a few clicks</p>
                        <button type="button" className="pu-primary-button booking-primary" onClick={() => setBookingOpen(true)}>Start New Booking</button>
                    </article>
                </section>
            </div>

            <section className="past-section">
                <h2>Past Consultations</h2>
                <div className="table-scroll">
                    <table className="consultations-table">
                        <thead><tr><th>Consultation Type</th><th>Staff / Clinic</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            {past.length === 0 && (
                                <tr><td colSpan="5">No past consultations yet.</td></tr>
                            )}
                            {past.map((item) => (
                                <tr key={item.appointmentId}>
                                    <td><strong>{item.appointmentType}</strong><small>{item.roomNumber}</small></td>
                                    <td>{item.staffName}</td>
                                    <td>{formatWhen(item)}</td>
                                    <td><span className={`status-badge ${STATUS_TONES[item.status] || 'blue'}`}>{statusLabel(item.status)}</span></td>
                                    <td><button className="table-action" type="button" onClick={() => setDetails(item)}>Details</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="bookings-footer">
                <span>© 2026 CRUIT HEALTH SERVICES</span>
                <span>Privacy Policy | Terms | Security</span>
            </footer>

            {settingsOpen && (
                <Modal title="Profile Settings" onClose={() => setSettingsOpen(false)}>
                    <form onSubmit={(e) => { e.preventDefault(); setSettingsOpen(false); }}>
                        <div className="modal-profile"><div className="booking-avatar large">{getInitials(profile.name)}</div><h3>{profile.name}</h3></div>
                        <label>Full Name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
                        <label>Email<input type="email" placeholder="Enter email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                        <label>Phone Number<input placeholder="Enter number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
                        <label className="toggle-row"><input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} /> Dark Mode</label>
                        <button className="pu-primary-button" type="submit">Save Changes</button>
                    </form>
                </Modal>
            )}

            {rescheduling && (
                <Modal title="Reschedule Appointment" onClose={() => setRescheduling(null)}>
                    <form onSubmit={saveReschedule}>
                        <p>{rescheduling.appointmentType} · currently {formatWhen(rescheduling)}</p>
                        <label>
                            New time slot
                            <select value={rescheduleSlotId} onChange={(e) => setRescheduleSlotId(e.target.value)}>
                                <option value="">Select a time slot</option>
                                {rescheduleSlots
                                    .filter((slot) => slot.slotId !== undefined)
                                    .map((slot) => (
                                        <option key={slot.slotId} value={slot.slotId}>{formatSlot(slot)}</option>
                                    ))}
                            </select>
                        </label>
                        {rescheduleSlots.length === 0 && <p className="empty-message">No other time slots are open for this service.</p>}
                        <button className="pu-primary-button" type="submit" disabled={working}>Save Changes</button>
                    </form>
                </Modal>
            )}

            {bookingOpen && (
                <Modal title="Start New Booking" onClose={() => setBookingOpen(false)}>
                    <form onSubmit={createBooking}>
                        <label>
                            Service
                            <select value={bookingForm.service} onChange={(e) => { setBookingSlots([]); setBookingForm({ ...bookingForm, service: e.target.value, slotId: '' }); }}>
                                <option value="">Select Service</option>
                                {APPOINTMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                            </select>
                        </label>
                        <label>
                            Time slot
                            <select value={bookingForm.slotId} disabled={!bookingForm.service} onChange={(e) => setBookingForm({ ...bookingForm, slotId: e.target.value })}>
                                <option value="">{bookingForm.service ? 'Select a time slot' : 'Choose a service first'}</option>
                                {bookingSlots.map((slot) => (
                                    <option key={slot.slotId} value={slot.slotId}>{formatSlot(slot)}</option>
                                ))}
                            </select>
                        </label>
                        {bookingForm.service && bookingSlots.length === 0 && (
                            <p className="empty-message">No time slots are open for this service right now.</p>
                        )}
                        <label>Note for the clinic (optional)<textarea rows="3" value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} /></label>
                        <button className="pu-primary-button" type="submit" disabled={working}>Book Appointment</button>
                    </form>
                </Modal>
            )}

            {details && (
                <Modal title="Consultation Details" onClose={() => setDetails(null)}>
                    <div className="record-details">
                        <p><strong>Consultation:</strong> {details.appointmentType}</p>
                        <p><strong>Staff:</strong> {details.staffName}</p>
                        <p><strong>Date:</strong> {formatWhen(details)} – {formatTime(details.endTime)}</p>
                        <p><strong>Room:</strong> {details.roomNumber}</p>
                        <p><strong>Status:</strong> {statusLabel(details.status)}</p>
                        <p><strong>Your note:</strong> {details.notes || 'No note added.'}</p>
                    </div>
                    <button className="pu-primary-button" type="button" onClick={() => setDetails(null)}>Close</button>
                </Modal>
            )}
        </div>
    );
}

export default Bookings;
