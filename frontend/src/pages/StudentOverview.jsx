import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './StudentOverview.css';
import { getRolePrefix, getStoredRole, getUserDisplayName } from '../utils/session';

const services = [
    { title: 'General Medical', description: 'Flu, checkups, minor injuries.' },
    { title: 'Reproductive', description: 'Counseling & prescriptions.' },
    { title: 'HIV VCT', description: 'Confidential testing & support.' },
    { title: 'Mental Health', description: 'Stress & academic support.' },
];

function Dashboard() {
    // Rewards and health quests are for students only, not university staff.
    const role = getStoredRole();
    const isStudent = role === 'STUDENT';
    const prefix = getRolePrefix(role) || '/student';

    const [student, setStudent] = useState({
        name: getUserDisplayName('Student'),
        medicalId: '',
        email: '',
        phone: '',
    });
    const [profileDraft, setProfileDraft] = useState(student);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('darkMode') === 'enabled'
    );

    const [appointment, setAppointment] = useState({
        service: '',
        date: '',
        time: '',
    });

    const [request, setRequest] = useState({
        hospital: '',
        reason: '',
    });

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');

        return () => document.body.classList.remove('dark-mode');
    }, [darkMode]);

    const openSettings = () => {
        setProfileDraft(student);
        setSettingsOpen(true);
        setNotificationsOpen(false);
    };

    const saveProfile = (event) => {
        event.preventDefault();

        if (!profileDraft.name.trim()) {
            window.alert('Name cannot be empty.');
            return;
        }

        setStudent(profileDraft);
        setSettingsOpen(false);
        window.alert('Profile updated successfully.');
    };

    const bookAppointment = (event) => {
        event.preventDefault();

        if (!appointment.service || !appointment.date || !appointment.time) {
            window.alert('Please complete all fields.');
            return;
        }

        window.alert(`Appointment booked for ${appointment.service}`);
    };

    const submitRequest = (event) => {
        event.preventDefault();

        if (!request.hospital.trim() || !request.reason.trim()) {
            window.alert('Complete all fields.');
            return;
        }

        window.alert('Request generated successfully.');
        setRequestOpen(false);
    };

    return (
        <div className="student-overview">
            <header className="dashboard-topbar">
                <div className="dashboard-search">
                    <span aria-hidden="true">⌕</span>
                    <input type="search" placeholder="Search records..." />
                </div>

                <div className="dashboard-profile-area">
                    <div className="notification-wrapper">
                        <button
                            className="icon-button"
                            type="button"
                            aria-label="Notifications"
                            onClick={() => setNotificationsOpen((open) => !open)}
                        >
                            ♢
                        </button>

                        {notificationsOpen && (
                            <div className="notification-menu">
                                <h3>Notifications</h3>
                                <div>
                                    <p>No new notifications.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="icon-button"
                        type="button"
                        aria-label="Settings"
                        onClick={openSettings}
                    >
                        ⚙
                    </button>

                    <div className="student-profile">
                        <div className="student-avatar" aria-hidden="true">
                            {student.name
                                .split(' ')
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join('')}
                        </div>
                        <div>
                            <strong>{student.name}</strong>
                            {student.medicalId && <span>Student No: {student.medicalId}</span>}
                        </div>
                    </div>
                </div>
            </header>

            <div className="overview-grid">
                <section className="dashboard-left">
                    <article className="welcome-card">
                        <h1>Welcome, {student.name.split(' ')[0]}.</h1>
                        <p>Book a clinic service or check your appointments below.</p>
                    </article>

                    <div className="section-heading">
                        <h2>Book a Service</h2>
                        <Link to={`${prefix}/bookings`}>View All Services →</Link>
                    </div>

                    <div className="service-grid">
                        {services.map((service) => (
                            <article className="service-card" key={service.title}>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                            </article>
                        ))}
                    </div>

                    {isStudent && (
                        <article className="voucher-card">
                            <div className="voucher-visual">
                                <span>PulseUp</span>
                                <strong>Wellness Reward</strong>
                            </div>

                            <div className="voucher-content">
                                <div className="voucher-title">
                                    <h3>Food Voucher Progress</h3>
                                    
                                </div>

                                <p>Current Tier: R0</p>

                                <div className="progress-track" aria-label="Voucher progress">
                                    <div className="progress-value" style={{ width: '0%' }} />
                                </div>

                                <small>
                                    Attend clinic visits to earn Health Points toward your
                                    R100 Cyngatha food voucher.
                                </small>
                            </div>
                        </article>
                    )}
                </section>

                <aside className="dashboard-right">
                    <form className="right-card" onSubmit={bookAppointment}>
                        <div className="right-card-title">
                            <h2>New Appointment</h2>
                            <span>⊕</span>
                        </div>

                        <p>Quickly book a consultation with campus health services.</p>

                        <select
                            value={appointment.service}
                            onChange={(event) =>
                                setAppointment({
                                    ...appointment,
                                    service: event.target.value,
                                })
                            }
                        >
                            <option value="">Select Service</option>
                            <option>General Medical</option>
                            <option>Mental Health</option>
                            <option>HIV VCT</option>
                            <option>Reproductive Health</option>
                        </select>

                        <input
                            type="date"
                            value={appointment.date}
                            onChange={(event) =>
                                setAppointment({
                                    ...appointment,
                                    date: event.target.value,
                                })
                            }
                        />

                        <input
                            type="time"
                            value={appointment.time}
                            onChange={(event) =>
                                setAppointment({
                                    ...appointment,
                                    time: event.target.value,
                                })
                            }
                        />

                        <button className="pu-primary-button" type="submit">
                            Book Appointment
                        </button>
                    </form>

                    <article className="right-card">
                        <h2>Sick Note Request</h2>
                        <p>Select the campus clinic where you want to send your sick note request.</p>

                        <select
                            value={request.hospital}
                            onChange={(event) =>
                                setRequest({ ...request, hospital: event.target.value })
                            }
                        >
                            <option value="">Select Campus Clinic</option>
                            <option value="Bellville Campus Clinic">
                                Bellville Campus Clinic
                            </option>
                            <option value="District 6 Campus Clinic">
                                District 6 Campus Clinic
                            </option>
                            <option value="Wellington Campus Clinic">
                                Wellington Campus Clinic
                            </option>
                        </select>

                        <button
                            className="pu-primary-button"
                            type="button"
                            onClick={() => {
                                if (!request.hospital) {
                                    alert('Please select a campus clinic.');
                                    return;
                                }

                                setRequestOpen(true);
                            }}
                        >
                            Generate Request
                        </button>
                    </article>

                    <article className="right-card">
                        <h2>Upcoming Activity</h2>

                        <p className="empty-message">No upcoming activity.</p>

                        <Link to="/student/history">View Medical History</Link>
                    </article>
                </aside>
            </div>

            {settingsOpen && (
                <div className="modal-backdrop" onMouseDown={() => setSettingsOpen(false)}>
                    <section
                        className="pulse-modal"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Profile Settings</h2>
                            <button type="button" onClick={() => setSettingsOpen(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={saveProfile}>
                            <div className="modal-profile">
                                <div className="student-avatar student-avatar--large">
                                    {profileDraft.name
                                        .split(' ')
                                        .slice(0, 2)
                                        .map((part) => part[0])
                                        .join('')}
                                </div>
                                <h3>{profileDraft.name}</h3>
                                {student.medicalId && <span>Student No: {student.medicalId}</span>}
                            </div>

                            <label>
                                Full Name
                                <input
                                    type="text"
                                    value={profileDraft.name}
                                    onChange={(event) =>
                                        setProfileDraft({
                                            ...profileDraft,
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    type="email"
                                    value={profileDraft.email}
                                    placeholder="Enter email"
                                    onChange={(event) =>
                                        setProfileDraft({
                                            ...profileDraft,
                                            email: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Phone Number
                                <input
                                    type="text"
                                    value={profileDraft.phone}
                                    placeholder="Enter number"
                                    onChange={(event) =>
                                        setProfileDraft({
                                            ...profileDraft,
                                            phone: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label className="toggle-row">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={(event) => setDarkMode(event.target.checked)}
                                />
                                Dark Mode
                            </label>

                            <button className="pu-primary-button" type="submit">
                                Save Changes
                            </button>
                        </form>
                    </section>
                </div>
            )}

            {requestOpen && (
                <div className="modal-backdrop" onMouseDown={() => setRequestOpen(false)}>
                    <section
                        className="pulse-modal"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Generate Medical Request</h2>
                            <button type="button" onClick={() => setRequestOpen(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={submitRequest}>
                            <label>
                                Hospital Name
                                <input
                                    type="text"
                                    value={request.hospital}
                                    onChange={(event) =>
                                        setRequest({
                                            ...request,
                                            hospital: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Reason
                                <textarea
                                    rows="4"
                                    value={request.reason}
                                    onChange={(event) =>
                                        setRequest({
                                            ...request,
                                            reason: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <button className="pu-primary-button" type="submit">
                                Submit Request
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
