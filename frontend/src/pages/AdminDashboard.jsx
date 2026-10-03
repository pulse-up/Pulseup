import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import api from "../api/api";
import { clearSession } from "../utils/session";
import ResponsiveHeader from "../components/ResponsiveHeader";

const LIVE_REFRESH_MS = 30000;

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "RESCHEDULED"];

const STATUS_LABELS = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    RESCHEDULED: "Rescheduled",
    COMPLETED: "Attended",
    CANCELLED: "Cancelled",
    NO_SHOW: "No-show",
};

function getSlotTime(slot, timeValue) {
    if (!slot?.slotDate || !timeValue) {
        return null;
    }

    const date = new Date(`${slot.slotDate}T${timeValue}`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function isActiveStatus(status) {
    return ACTIVE_STATUSES.includes(status || "PENDING");
}

// Upcoming means still to happen: active status and the slot has not finished.
function isUpcomingAppointment(appointment, now) {
    if (!isActiveStatus(appointment.status)) {
        return false;
    }

    const end = getSlotTime(
        appointment.timeSlot,
        appointment.timeSlot?.endTime,
    );

    return !end || end >= now;
}

function isSameDay(date, now) {
    return Boolean(date) && date.toDateString() === now.toDateString();
}

function AdminDashboard() {
    const navigate = useNavigate();

    const [user] = useState(() => {
        const storedUser =
            localStorage.getItem("pulseupUser");

        if (!storedUser) {
            return {};
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error(
                "Could not read admin user:",
                error,
            );

            clearSession();
            return {};
        }
    });

    const userRole = String(
        user.role || "",
    ).toUpperCase();

    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [appointments, setAppointments] =
        useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    const [activeSection, setActiveSection] =
        useState("overview");

    const [appointmentView, setAppointmentView] =
        useState("upcoming");

    const [lastUpdated, setLastUpdated] =
        useState(null);

    const [remindedIds, setRemindedIds] =
        useState({});

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [workingItem, setWorkingItem] =
        useState("");

    const loadDashboardData = useCallback(
        async (silent = false) => {
            try {
                if (!silent) {
                    setLoading(true);
                    setMessage("");
                }

                const [
                    studentsResponse,
                    staffResponse,
                    adminsResponse,
                    appointmentsResponse,
                    slotsResponse,
                ] = await Promise.all([
                    api.get("/students"),
                    api.get("/staff"),
                    api.get("/admins"),
                    api.get("/appointments"),
                    api.get("/time-slots"),
                ]);

                setStudents(
                    Array.isArray(studentsResponse.data)
                        ? studentsResponse.data
                        : [],
                );

                setStaff(
                    Array.isArray(staffResponse.data)
                        ? staffResponse.data
                        : [],
                );

                setAdmins(
                    Array.isArray(adminsResponse.data)
                        ? adminsResponse.data
                        : [],
                );

                setAppointments(
                    Array.isArray(appointmentsResponse.data)
                        ? appointmentsResponse.data
                        : [],
                );

                setTimeSlots(
                    Array.isArray(slotsResponse.data)
                        ? slotsResponse.data
                        : [],
                );

                setLastUpdated(new Date());
            } catch (error) {
                console.error(
                    "Admin dashboard loading failed:",
                    error,
                );

                if (error.response?.status === 403) {
                    setMessage(
                        "You do not have permission to view the administration records.",
                    );
                } else {
                    setMessage(
                        "Could not load the administration records.",
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        if (
            !user.userId ||
            !user.token ||
            userRole !== "ADMIN"
        ) {
            navigate("/login", {
                replace: true,
            });

            return;
        }

        let cancelled = false;

        window.queueMicrotask(() => {
            if (cancelled) {
                return;
            }

            loadDashboardData().catch((error) => {
                console.error(
                    "Admin dashboard initialisation failed:",
                    error,
                );
            });
        });

        return () => {
            cancelled = true;
        };
    }, [
        navigate,
        user.userId,
        user.token,
        userRole,
        loadDashboardData,
    ]);

    // Keep bookings, slots and staff availability live without a page reload.
    useEffect(() => {
        if (!user.userId || userRole !== "ADMIN") {
            return undefined;
        }

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                loadDashboardData(true);
            }
        }, LIVE_REFRESH_MS);

        return () => window.clearInterval(timer);
    }, [user.userId, userRole, loadDashboardData]);

    async function handleDeleteUser(
        endpoint,
        userId,
        userName,
    ) {
        const confirmed = window.confirm(
            `Are you sure you want to remove ${userName}?`,
        );

        if (!confirmed) {
            return;
        }

        const itemKey = `${endpoint}-${userId}`;

        try {
            setWorkingItem(itemKey);
            setMessage("");

            await api.delete(`/${endpoint}/${userId}`);
            await loadDashboardData();

            setMessage(
                `${userName} was removed successfully.`,
            );
        } catch (error) {
            console.error(
                "User deletion failed:",
                error,
            );

            if (error.response?.status === 403) {
                setMessage(
                    "You do not have permission to remove this account.",
                );
            } else {
                setMessage(
                    `${userName} could not be removed. The account may still be linked to other records.`,
                );
            }
        } finally {
            setWorkingItem("");
        }
    }

    async function handleAppointmentStatus(
        appointmentId,
        status,
    ) {
        const itemKey =
            `appointment-${appointmentId}`;

        try {
            setWorkingItem(itemKey);
            setMessage("");

            if (status === "CANCELLED") {
                await api.patch(
                    `/appointments/${appointmentId}/cancel`,
                );
            } else {
                await api.patch(
                    `/appointments/${appointmentId}/status`,
                    {},
                    {
                        params: {
                            status,
                        },
                    },
                );
            }

            await loadDashboardData();

            setMessage(
                `The appointment was marked ${(STATUS_LABELS[status] || status).toLowerCase()}.`,
            );
        } catch (error) {
            console.error(
                "Appointment status update failed:",
                error.response?.status,
                error.response?.data || error.message,
            );

            setMessage(
                "The appointment status could not be updated.",
            );
        } finally {
            setWorkingItem("");
        }
    }

    async function handleDeleteAppointment(
        appointmentId,
    ) {
        const confirmed = window.confirm(
            "Are you sure you want to permanently remove this appointment?",
        );

        if (!confirmed) {
            return;
        }

        const itemKey =
            `appointment-${appointmentId}`;

        try {
            setWorkingItem(itemKey);
            setMessage("");

            await api.delete(
                `/appointments/${appointmentId}`,
            );

            await loadDashboardData();

            setMessage(
                "The appointment was removed.",
            );
        } catch (error) {
            console.error(
                "Appointment deletion failed:",
                error,
            );

            setMessage(
                "The appointment could not be removed.",
            );
        } finally {
            setWorkingItem("");
        }
    }

    async function handleDeleteSlot(slotId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this available time slot?",
        );

        if (!confirmed) {
            return;
        }

        const itemKey = `slot-${slotId}`;

        try {
            setWorkingItem(itemKey);
            setMessage("");

            await api.delete(`/time-slots/${slotId}`);
            await loadDashboardData();

            setMessage(
                "The time slot was deleted.",
            );
        } catch (error) {
            console.error(
                "Time-slot deletion failed:",
                error,
            );

            setMessage(
                "The time slot could not be deleted.",
            );
        } finally {
            setWorkingItem("");
        }
    }

    async function handleSlotAvailability(slotId, available) {
        const itemKey = `slot-${slotId}`;

        try {
            setWorkingItem(itemKey);
            setMessage("");

            await api.patch(
                `/time-slots/${slotId}/availability`,
                {},
                {
                    params: {
                        available,
                    },
                },
            );

            await loadDashboardData(true);

            setMessage(
                available
                    ? "The time slot is open for booking."
                    : "The time slot is closed for booking.",
            );
        } catch (error) {
            console.error(
                "Time-slot availability update failed:",
                error.response?.status,
                error.response?.data || error.message,
            );

            setMessage(
                "The time slot could not be updated.",
            );
        } finally {
            setWorkingItem("");
        }
    }

    async function handleSendReminder(appointment) {
        const itemKey =
            `reminder-${appointment.appointmentId}`;

        const studentName =
            `${appointment.student?.firstName || ""} ${appointment.student?.lastName || ""}`.trim() ||
            "the student";

        try {
            setWorkingItem(itemKey);
            setMessage("");

            await api.post(
                `/appointments/${appointment.appointmentId}/reminder`,
            );

            setRemindedIds((current) => ({
                ...current,
                [appointment.appointmentId]: true,
            }));

            setMessage(
                `A reminder was sent to ${studentName}.`,
            );
        } catch (error) {
            console.error(
                "Reminder failed:",
                error.response?.status,
                error.response?.data || error.message,
            );

            setMessage(
                `The reminder to ${studentName} could not be sent.`,
            );
        } finally {
            setWorkingItem("");
        }
    }

    function handleLogout() {
        clearSession();

        navigate("/login", {
            replace: true,
        });
    }

    function renderUsers() {
        return (
            <div className="admin-record-groups">
                <section className="admin-record-group">
                    <h3>
                        Students ({students.length})
                    </h3>

                    {students.length === 0 ? (
                        <p className="empty-message">
                            No student accounts found.
                        </p>
                    ) : (
                        <div className="admin-record-list">
                            {students.map((student) => {
                                const itemKey =
                                    `students-${student.userId}`;

                                return (
                                    <article
                                        className="admin-record-card"
                                        key={student.userId}
                                    >
                                        <div>
                                            <strong>
                                                {student.firstName}{" "}
                                                {student.lastName}
                                            </strong>

                                            <span>
                        {student.studentNumber}
                      </span>

                                            <span>{student.email}</span>
                                            <span>{student.course}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className="danger-button"
                                            disabled={
                                                workingItem === itemKey
                                            }
                                            onClick={() =>
                                                handleDeleteUser(
                                                    "students",
                                                    student.userId,
                                                    `${student.firstName} ${student.lastName}`,
                                                )
                                            }
                                        >
                                            {workingItem === itemKey
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="admin-record-group">
                    <h3>
                        Staff ({staff.length})
                    </h3>

                    {staff.length === 0 ? (
                        <p className="empty-message">
                            No staff accounts found.
                        </p>
                    ) : (
                        <div className="admin-record-list">
                            {staff.map((member) => {
                                const itemKey =
                                    `staff-${member.userId}`;

                                return (
                                    <article
                                        className="admin-record-card"
                                        key={member.userId}
                                    >
                                        <div>
                                            <strong>
                                                {member.firstName}{" "}
                                                {member.lastName}
                                            </strong>

                                            <span>
                        {member.staffNumber}
                      </span>

                                            <span>{member.email}</span>

                                            <span>
                        {member.position}
                                                {" · "}
                                                {member.department}
                      </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="danger-button"
                                            disabled={
                                                workingItem === itemKey
                                            }
                                            onClick={() =>
                                                handleDeleteUser(
                                                    "staff",
                                                    member.userId,
                                                    `${member.firstName} ${member.lastName}`,
                                                )
                                            }
                                        >
                                            {workingItem === itemKey
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="admin-record-group">
                    <h3>
                        Administrators ({admins.length})
                    </h3>

                    {admins.length === 0 ? (
                        <p className="empty-message">
                            No administrator accounts found.
                        </p>
                    ) : (
                        <div className="admin-record-list">
                            {admins.map((admin) => {
                                const itemKey =
                                    `admins-${admin.userId}`;

                                return (
                                    <article
                                        className="admin-record-card"
                                        key={admin.userId}
                                    >
                                        <div>
                                            <strong>
                                                {admin.firstName}{" "}
                                                {admin.lastName}
                                            </strong>

                                            <span>
                        {admin.adminNumber}
                      </span>

                                            <span>{admin.email}</span>

                                            <span>
                        {admin.department}
                      </span>
                                        </div>

                                        {admin.userId !== user.userId && (
                                            <button
                                                type="button"
                                                className="danger-button"
                                                disabled={
                                                    workingItem === itemKey
                                                }
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        "admins",
                                                        admin.userId,
                                                        `${admin.firstName} ${admin.lastName}`,
                                                    )
                                                }
                                            >
                                                {workingItem === itemKey
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </button>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        );
    }

    function renderOverview() {
        const now = new Date();

        const upcoming = appointments.filter((appointment) =>
            isUpcomingAppointment(appointment, now),
        );

        const bookedStudentIds = new Set(
            upcoming.map(
                (appointment) =>
                    appointment.student?.userId ??
                    appointment.appointmentId,
            ),
        );

        const todaysAppointments = appointments.filter(
            (appointment) =>
                isSameDay(
                    getSlotTime(
                        appointment.timeSlot,
                        appointment.timeSlot?.startTime,
                    ),
                    now,
                ),
        );

        const countToday = (status) =>
            todaysAppointments.filter(
                (appointment) =>
                    (appointment.status || "PENDING") === status,
            ).length;

        const openSlotsByStaff = {};

        timeSlots.forEach((slot) => {
            const end = getSlotTime(slot, slot.endTime);

            if (
                !slot.available ||
                !end ||
                end < now ||
                !isSameDay(end, now)
            ) {
                return;
            }

            const staffId = slot.staff?.userId;

            openSlotsByStaff[staffId] =
                (openSlotsByStaff[staffId] || 0) + 1;
        });

        const clinicians = staff
            .map((member) => {
                const position = String(
                    member.position || "",
                ).toLowerCase();

                return {
                    member,
                    role: position.includes("doctor")
                        ? "Doctor"
                        : position.includes("nurse")
                            ? "Nurse"
                            : "",
                    openSlots:
                        openSlotsByStaff[member.userId] || 0,
                };
            })
            .filter((entry) => entry.role);

        const availableCount = (role) =>
            clinicians.filter(
                (entry) =>
                    entry.role === role && entry.openSlots > 0,
            ).length;

        const totalCount = (role) =>
            clinicians.filter((entry) => entry.role === role)
                .length;

        return (
            <div className="admin-record-groups">
                <section className="admin-record-group">
                    <h3>Right now</h3>

                    <div className="admin-summary-grid admin-live-grid">
                        <article>
                            <span>Students booked</span>
                            <strong>{bookedStudentIds.size}</strong>
                        </article>

                        <article>
                            <span>Upcoming appointments</span>
                            <strong>{upcoming.length}</strong>
                        </article>

                        <article>
                            <span>Doctors available</span>
                            <strong>
                                {availableCount("Doctor")} of{" "}
                                {totalCount("Doctor")}
                            </strong>
                        </article>

                        <article>
                            <span>Nurses available</span>
                            <strong>
                                {availableCount("Nurse")} of{" "}
                                {totalCount("Nurse")}
                            </strong>
                        </article>
                    </div>

                    <p className="muted-text">
                        {lastUpdated
                            ? `Updates every 30 seconds. Last updated ${lastUpdated.toLocaleTimeString()}.`
                            : "Updates every 30 seconds."}
                    </p>
                </section>

                <section className="admin-record-group">
                    <h3>Today's appointments</h3>

                    <div className="admin-summary-grid admin-live-grid">
                        <article>
                            <span>Still to happen</span>
                            <strong>
                                {countToday("PENDING") +
                                    countToday("CONFIRMED") +
                                    countToday("RESCHEDULED")}
                            </strong>
                        </article>

                        <article>
                            <span>Attended</span>
                            <strong>{countToday("COMPLETED")}</strong>
                        </article>

                        <article>
                            <span>Cancelled</span>
                            <strong>{countToday("CANCELLED")}</strong>
                        </article>

                        <article>
                            <span>No-show</span>
                            <strong>{countToday("NO_SHOW")}</strong>
                        </article>
                    </div>
                </section>

                <section className="admin-record-group">
                    <h3>Doctors and nurses today</h3>

                    {clinicians.length === 0 ? (
                        <p className="empty-message">
                            No doctors or nurses found. Staff are
                            listed here when their position
                            includes "Doctor" or "Nurse".
                        </p>
                    ) : (
                        <div className="admin-record-list">
                            {clinicians.map(
                                ({ member, role, openSlots }) => (
                                    <article
                                        className="admin-record-card"
                                        key={member.userId}
                                    >
                                        <div>
                                            <strong>
                                                {member.firstName}{" "}
                                                {member.lastName}
                                            </strong>

                                            <span>{role}</span>

                                            <span
                                                className={
                                                    openSlots > 0
                                                        ? "slot-status available"
                                                        : "slot-status booked"
                                                }
                                            >
                                                {openSlots > 0
                                                    ? `Available · ${openSlots} open ${openSlots === 1 ? "slot" : "slots"}`
                                                    : "No open slots"}
                                            </span>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>
        );
    }

    function renderAppointments() {
        const now = new Date();

        const startOf = (appointment) =>
            getSlotTime(
                appointment.timeSlot,
                appointment.timeSlot?.startTime,
            )?.getTime() || 0;

        const upcoming = appointments
            .filter((appointment) =>
                isUpcomingAppointment(appointment, now),
            )
            .sort((first, second) => startOf(first) - startOf(second));

        const past = appointments
            .filter(
                (appointment) =>
                    !isUpcomingAppointment(appointment, now),
            )
            .sort((first, second) => startOf(second) - startOf(first));

        const visible =
            appointmentView === "upcoming" ? upcoming : past;

        return (
            <>
                <nav className="admin-navigation">
                    <button
                        type="button"
                        className={
                            appointmentView === "upcoming"
                                ? "booking-tab active"
                                : "booking-tab"
                        }
                        onClick={() =>
                            setAppointmentView("upcoming")
                        }
                    >
                        Upcoming ({upcoming.length})
                    </button>

                    <button
                        type="button"
                        className={
                            appointmentView === "past"
                                ? "booking-tab active"
                                : "booking-tab"
                        }
                        onClick={() => setAppointmentView("past")}
                    >
                        Past ({past.length})
                    </button>
                </nav>

                {visible.length === 0 ? (
                    <p className="empty-message">
                        {appointmentView === "upcoming"
                            ? "No upcoming appointments."
                            : "No past appointments."}
                    </p>
                ) : (
                    <div className="admin-record-list">
                        {visible.map((appointment) => {
                            const status =
                                appointment.status || "PENDING";

                            const student = appointment.student;
                            const slot = appointment.timeSlot;

                            const itemKey =
                                `appointment-${appointment.appointmentId}`;

                            const reminderKey =
                                `reminder-${appointment.appointmentId}`;

                            const busy = workingItem === itemKey;

                            const canRemind =
                                appointmentView === "upcoming" &&
                                (status === "CONFIRMED" ||
                                    status === "RESCHEDULED");

                            return (
                                <article
                                    className={
                                        "admin-record-card " +
                                        "appointment-admin-card"
                                    }
                                    key={appointment.appointmentId}
                                >
                                    <div>
                                        <strong>
                                            {appointment.appointmentType}
                                        </strong>

                                        <span>
                                            {student?.firstName}{" "}
                                            {student?.lastName}
                                        </span>

                                        <span>
                                            {slot?.slotDate}
                                            {" · "}
                                            {slot?.startTime}
                                            {" – "}
                                            {slot?.endTime}
                                        </span>

                                        <span
                                            className={
                                                `appointment-status ` +
                                                status.toLowerCase()
                                            }
                                        >
                                            {STATUS_LABELS[status] ||
                                                status}
                                        </span>
                                    </div>

                                    <div className="admin-card-actions">
                                        {(status === "PENDING" ||
                                            status === "RESCHEDULED") && (
                                            <button
                                                type="button"
                                                className="primary-button"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleAppointmentStatus(
                                                        appointment.appointmentId,
                                                        "CONFIRMED",
                                                    )
                                                }
                                            >
                                                {busy
                                                    ? "Updating..."
                                                    : "Confirm"}
                                            </button>
                                        )}

                                        {status === "CONFIRMED" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="complete-button"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        handleAppointmentStatus(
                                                            appointment.appointmentId,
                                                            "COMPLETED",
                                                        )
                                                    }
                                                >
                                                    {busy
                                                        ? "Updating..."
                                                        : "Attended"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="danger-button"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        handleAppointmentStatus(
                                                            appointment.appointmentId,
                                                            "NO_SHOW",
                                                        )
                                                    }
                                                >
                                                    No-show
                                                </button>
                                            </>
                                        )}

                                        {isActiveStatus(status) && (
                                            <button
                                                type="button"
                                                className="danger-button"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleAppointmentStatus(
                                                        appointment.appointmentId,
                                                        "CANCELLED",
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        )}

                                        {canRemind && (
                                            <button
                                                type="button"
                                                className="primary-button"
                                                disabled={
                                                    workingItem ===
                                                    reminderKey
                                                }
                                                onClick={() =>
                                                    handleSendReminder(
                                                        appointment,
                                                    )
                                                }
                                            >
                                                {workingItem ===
                                                reminderKey
                                                    ? "Sending..."
                                                    : remindedIds[
                                                            appointment
                                                                .appointmentId
                                                        ]
                                                      ? "Send again"
                                                      : "Send reminder"}
                                            </button>
                                        )}

                                        {!isActiveStatus(status) && (
                                            <button
                                                type="button"
                                                className="danger-button"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleDeleteAppointment(
                                                        appointment.appointmentId,
                                                    )
                                                }
                                            >
                                                {busy
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </>
        );
    }

    function renderTimeSlots() {
        if (timeSlots.length === 0) {
            return (
                <p className="empty-message">
                    No time slots found.
                </p>
            );
        }

        // A closed slot has no active booking; a booked slot does.
        const bookedSlotIds = new Set(
            appointments
                .filter((appointment) =>
                    isActiveStatus(appointment.status),
                )
                .map((appointment) => appointment.timeSlot?.slotId),
        );

        return (
            <div className="admin-record-list">
                {timeSlots.map((slot) => {
                    const itemKey =
                        `slot-${slot.slotId}`;

                    const isBooked =
                        bookedSlotIds.has(slot.slotId);

                    const stateClass = slot.available
                        ? "available"
                        : isBooked
                            ? "booked"
                            : "unavailable";

                    const stateLabel = slot.available
                        ? "Available"
                        : isBooked
                            ? "Booked"
                            : "Closed";

                    return (
                        <article
                            className="admin-record-card"
                            key={slot.slotId}
                        >
                            <div>
                                <strong>{slot.slotDate}</strong>

                                <span>
                                    {slot.startTime}
                                    {" – "}
                                    {slot.endTime}
                                </span>

                                <span>
                                    {slot.staff
                                        ? `${slot.staff.firstName} ${slot.staff.lastName}`
                                        : `Slot ID: ${slot.slotId}`}
                                </span>

                                <span
                                    className={`slot-status ${stateClass}`}
                                >
                                    {stateLabel}
                                </span>
                            </div>

                            {!isBooked && (
                                <div className="admin-card-actions">
                                    <button
                                        type="button"
                                        className="primary-button"
                                        disabled={
                                            workingItem === itemKey
                                        }
                                        onClick={() =>
                                            handleSlotAvailability(
                                                slot.slotId,
                                                !slot.available,
                                            )
                                        }
                                    >
                                        {slot.available
                                            ? "Close slot"
                                            : "Open slot"}
                                    </button>

                                    {slot.available && (
                                        <button
                                            type="button"
                                            className="danger-button"
                                            disabled={
                                                workingItem === itemKey
                                            }
                                            onClick={() =>
                                                handleDeleteSlot(
                                                    slot.slotId,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        );
    }

    return (
        <main className="student-dashboard admin-dashboard">
            <ResponsiveHeader
                ariaLabel="Administrator dashboard navigation"
                desktopAction={{ label: "Back to home", to: "/" }}
                identity={{
                    name: `${user.firstName || "Administrator"} ${user.lastName || ""}`.trim(),
                    detail: "Administrator",
                }}
                menuItems={[
                    { label: "Home", to: "/" },
                    {
                        label: "Overview",
                        active: activeSection === "overview",
                        onSelect: () => setActiveSection("overview"),
                    },
                    {
                        label: "User records",
                        active: activeSection === "users",
                        onSelect: () => setActiveSection("users"),
                    },
                    {
                        label: "Appointments",
                        active: activeSection === "appointments",
                        onSelect: () => setActiveSection("appointments"),
                    },
                    {
                        label: "Time slots",
                        active: activeSection === "slots",
                        onSelect: () => setActiveSection("slots"),
                    },
                    {
                        label: "Create account",
                        to: "/admin/create-account",
                    },
                    { label: "My Profile", to: "/admin/profile" },
                    { label: "Sick Notes", to: "/admin/sick-notes" },
                    { label: "Health Quests", to: "/admin/health-quests" },
                    { label: "Clinic History", to: "/admin/history" },
                ]}
                onSignOut={handleLogout}
            />

            <section className="dashboard-introduction">
                <p className="eyebrow">
                    ADMIN DASHBOARD
                </p>

                <h1>PulseUp system management.</h1>

                <p>
                    Track live bookings, manage clinic time slots
                    and appointment outcomes, and manage users.
                </p>
            </section>

            <section className="admin-account-action">
                <div>
                    <p className="eyebrow">
                        ACCOUNT MANAGEMENT
                    </p>

                    <h2>
                        Staff and administrator accounts
                    </h2>

                    <p className="muted-text">
                        Create secure accounts for healthcare staff
                        and system administrators.
                    </p>
                </div>

                <Link
                    className="admin-create-account-button"
                    to="/admin/create-account"
                >
                    Create account
                </Link>
            </section>

            <section className="admin-summary-grid">
                <article>
                    <span>Students</span>
                    <strong>{students.length}</strong>
                </article>

                <article>
                    <span>Staff</span>
                    <strong>{staff.length}</strong>
                </article>

                <article>
                    <span>Appointments</span>
                    <strong>{appointments.length}</strong>
                </article>

                <article>
                    <span>Time slots</span>
                    <strong>{timeSlots.length}</strong>
                </article>
            </section>

            {message && (
                <p className="dashboard-message">
                    {message}
                </p>
            )}

            <section className="admin-content">
                <nav className="admin-navigation">
                    <button
                        type="button"
                        className={
                            activeSection === "overview"
                                ? "booking-tab active"
                                : "booking-tab"
                        }
                        onClick={() =>
                            setActiveSection("overview")
                        }
                    >
                        Overview
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === "users"
                                ? "booking-tab active"
                                : "booking-tab"
                        }
                        onClick={() =>
                            setActiveSection("users")
                        }
                    >
                        User records
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === "appointments"
                                ? "booking-tab active"
                                : "booking-tab"
                        }
                        onClick={() =>
                            setActiveSection("appointments")
                        }
                    >
                        Appointments
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === "slots"
                                ? "booking-tab active"
                                : "booking-tab"
                        }
                        onClick={() =>
                            setActiveSection("slots")
                        }
                    >
                        Time slots
                    </button>
                </nav>

                <article className="dashboard-panel">
                    {loading ? (
                        <p>
                            Loading administration records...
                        </p>
                    ) : (
                        <>
                            {activeSection === "overview" &&
                                renderOverview()}

                            {activeSection === "users" &&
                                renderUsers()}

                            {activeSection === "appointments" &&
                                renderAppointments()}

                            {activeSection === "slots" &&
                                renderTimeSlots()}
                        </>
                    )}
                </article>
            </section>
        </main>
    );
}

export default AdminDashboard;