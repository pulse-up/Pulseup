import { useEffect, useState } from "react";
import "../../styles/pages/Bookings.css";

const initialBookings = [
    { id: 1, title: "Dental Check-up", date: "Friday, April 13, 10:00 AM" },
    { id: 2, title: "Flu Vaccination", date: "Monday, May 14, 02:30 PM" },
];

const pastConsultations = [
    { type: "General Consultation", sub: "Health Clearance", staff: "Dr. van der Merwe", date: "Feb 24, 2026", status: "Attended", action: "Notes", tone: "green" },
    { type: "Eye Test", sub: "Optometry Unit", staff: "Prof. Jacobs", date: "Mar 16, 2026", status: "Cancelled", action: "Details", tone: "red" },
    { type: "Counseling", sub: "Mental Health Support", staff: "Ms. S. Dlamini", date: "Mar 25, 2026", status: "No-show", action: "Appeal", tone: "blue" },
];

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

function Bookings() {
    const [bookings, setBookings] = useState(initialBookings);
    const [showAll, setShowAll] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [rescheduleId, setRescheduleId] = useState(null);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "enabled");

    const [profile, setProfile] = useState({ name: "Matinisa Lubisi", email: "", phone: "" });
    const [bookingForm, setBookingForm] = useState({ service: "", date: "", time: "" });
    const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "", reason: "" });

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        localStorage.setItem("darkMode", darkMode ? "enabled" : "disabled");
        return () => document.body.classList.remove("dark-mode");
    }, [darkMode]);

    const cancelBooking = (id) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            setBookings((current) => current.filter((booking) => booking.id !== id));
            window.alert("Booking cancelled successfully.");
        } else {
            window.alert("Booking cancellation aborted.");
        }
    };

    const saveReschedule = (event) => {
        event.preventDefault();
        if (!rescheduleForm.date || !rescheduleForm.time || !rescheduleForm.reason.trim()) {
            window.alert("Complete all fields.");
            return;
        }
        window.alert("Appointment rescheduled successfully.");
        setRescheduleId(null);
        setRescheduleForm({ date: "", time: "", reason: "" });
    };

    const createBooking = (event) => {
        event.preventDefault();
        if (!bookingForm.service || !bookingForm.date || !bookingForm.time) {
            window.alert("Complete all booking fields.");
            return;
        }
        setBookings((current) => [
            ...current,
            {
                id: Date.now(),
                title: bookingForm.service,
                date: `${bookingForm.date}, ${bookingForm.time}`,
            },
        ]);
        window.alert("Appointment booked successfully.");
        setBookingForm({ service: "", date: "", time: "" });
        setBookingOpen(false);
    };

    const tableAction = (action) => {
        const messages = {
            Notes: "Displaying consultation notes...",
            Details: "Displaying consultation details...",
            Appeal: "Opening appeal request form...",
        };
        window.alert(messages[action]);
    };

    return (
        <div className="bookings-page">
            <header className="bookings-topbar">
                <div className="bookings-search">
                    <span>⌕</span>
                    <input type="search" placeholder="Search appointments..." />
                </div>

                <div className="bookings-actions">
                    <div className="notification-wrapper">
                        <button className="icon-button" type="button" onClick={() => setNotificationsOpen((v) => !v)}>♢</button>
                        {notificationsOpen && (
                            <div className="notification-menu">
                                <h3>Notifications</h3>
                                <div><strong>Appointment Reminder</strong><p>Dental Check-up starts in 18 minutes.</p></div>
                                <div><strong>Booking Approved</strong><p>Flu Vaccination confirmed successfully.</p></div>
                                <div><strong>Prescription Ready</strong><p>Collect medication from Unit 1B.</p></div>
                            </div>
                        )}
                    </div>
                    <button className="icon-button" type="button" onClick={() => setSettingsOpen(true)}>⚙</button>
                    <div className="booking-avatar">ML</div>
                </div>
            </header>

            <div className="bookings-main-grid">
                <article className="queue-card">
                    <div className="queue-heading">
                        <strong>Live Digital Queue</strong>
                        <span>LIVE NOW</span>
                    </div>
                    <small>General Medical - Dr. Nyana</small>
                    <div className="queue-circle">#4</div>
                    <p>IN QUEUE</p>
                    <div className="queue-stats">
                        <div><strong>18 mins</strong><span>Estimated Wait</span></div>
                        <div><strong>Unit 1B</strong><span>Clinic Room</span></div>
                    </div>
                </article>

                <section>
                    <div className="bookings-section-heading">
                        <h2>Active Bookings</h2>
                        {!showAll && <button type="button" onClick={() => setShowAll(true)}>View All →</button>}
                    </div>

                    {bookings.map((booking) => (
                        <article className="active-booking-card" key={booking.id}>
                            <div>
                                <strong>{booking.title}</strong>
                                <small>{booking.date}</small>
                            </div>
                            <div className="booking-buttons">
                                <button type="button" className="outline-blue" onClick={() => setRescheduleId(booking.id)}>Reschedule</button>
                                <button type="button" className="outline-red" onClick={() => cancelBooking(booking.id)}>Cancel</button>
                            </div>
                        </article>
                    ))}

                    {showAll && (
                        <div className="more-bookings">
                            <strong>Additional Active Bookings</strong>
                            <p>HIV Consultation - May 20, 11:00 AM</p>
                            <p>Mental Health Support - May 22, 09:30 AM</p>
                        </div>
                    )}

                    <article className="add-booking-card">
                        <div className="plus-icon">⊕</div>
                        <h3>Need another appointment?</h3>
                        <p>Book a consultation in a few clicks</p>
                        <button type="button" className="primary-button booking-primary" onClick={() => setBookingOpen(true)}>Start New Booking</button>
                    </article>
                </section>
            </div>

            <section className="past-section">
                <h2>Past Consultations</h2>
                <div className="table-scroll">
                    <table className="consultations-table">
                        <thead><tr><th>Consultation Type</th><th>Staff / Clinic</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            {pastConsultations.map((item) => (
                                <tr key={item.type}>
                                    <td><strong>{item.type}</strong><small>{item.sub}</small></td>
                                    <td>{item.staff}</td><td>{item.date}</td>
                                    <td><span className={`status-badge ${item.tone}`}>{item.status}</span></td>
                                    <td><button className="table-action" type="button" onClick={() => tableAction(item.action)}>{item.action}</button></td>
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
                    <form onSubmit={(e) => { e.preventDefault(); setSettingsOpen(false); window.alert("Profile updated successfully."); }}>
                        <div className="modal-profile"><div className="booking-avatar large">ML</div><h3>{profile.name}</h3><span>Medical ID: 88201-P</span></div>
                        <label>Full Name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
                        <label>Email<input type="email" placeholder="Enter email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                        <label>Phone Number<input placeholder="Enter number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
                        <label className="toggle-row"><input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} /> Dark Mode</label>
                        <button className="primary-button" type="submit">Save Changes</button>
                    </form>
                </Modal>
            )}

            {rescheduleId !== null && (
                <Modal title="Reschedule Appointment" onClose={() => setRescheduleId(null)}>
                    <form onSubmit={saveReschedule}>
                        <label>New Date<input type="date" value={rescheduleForm.date} onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })} /></label>
                        <label>New Time<input type="time" value={rescheduleForm.time} onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })} /></label>
                        <label>Reason<textarea rows="4" value={rescheduleForm.reason} onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })} /></label>
                        <button className="primary-button" type="submit">Save Changes</button>
                    </form>
                </Modal>
            )}

            {bookingOpen && (
                <Modal title="Start New Booking" onClose={() => setBookingOpen(false)}>
                    <form onSubmit={createBooking}>
                        <label>Service<select value={bookingForm.service} onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}><option value="">Select Service</option><option>General Medical</option><option>HIV VCT</option><option>Mental Health</option></select></label>
                        <label>Date<input type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} /></label>
                        <label>Time<input type="time" value={bookingForm.time} onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} /></label>
                        <button className="primary-button" type="submit">Book Appointment</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Bookings;
