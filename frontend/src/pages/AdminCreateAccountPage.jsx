import {
    useState,
} from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import api from "../api/api";
import ResponsiveHeader from "../components/ResponsiveHeader";

const STAFF_SERVICES = [
    {
        appointmentType: "General Consultations",
        positions: [
            "General Practitioner",
            "Clinical Nurse",
        ],
    },
    {
        appointmentType: "Reproductive Health",
        positions: [
            "Reproductive Health Nurse",
            "Midwife",
        ],
    },
    {
        appointmentType: "HIV VCT",
        positions: [
            "HIV Counsellor",
            "HIV Testing Nurse",
        ],
    },
    {
        appointmentType: "TB DOTS",
        positions: [
            "TB Nurse",
            "TB DOTS Support Worker",
        ],
    },
    {
        appointmentType: "Wound Dressings",
        positions: [
            "Wound Care Nurse",
            "Clinical Nurse",
        ],
    },
];

function AdminCreateAccountPage() {
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
                "Could not read stored admin user:",
                error,
            );

            return {};
        }
    });

    const [accountType, setAccountType] =
        useState("STAFF");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        staffNumber: "",
        adminNumber: "",
        department: "General Consultations",
        position: "General Practitioner",
    });

    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const userRole = String(user.role || "")
        .toUpperCase();

    if (
        !user.userId ||
        !user.token ||
        userRole !== "ADMIN"
    ) {
        navigate("/login", {
            replace: true,
        });

        return null;
    }

    const selectedService = STAFF_SERVICES.find(
        (service) =>
            service.appointmentType === form.department,
    );

    const allowedPositions =
        selectedService?.positions || [];

    function handleFieldChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function handleAccountTypeChange(event) {
        const selectedAccountType = event.target.value;

        setAccountType(selectedAccountType);
        setMessage("");

        setForm((currentForm) => ({
            ...currentForm,
            department:
                selectedAccountType === "STAFF"
                    ? "General Consultations"
                    : "System Administration",
            position: "General Practitioner",
        }));
    }

    function handleDepartmentChange(event) {
        const department = event.target.value;

        const service = STAFF_SERVICES.find(
            (item) =>
                item.appointmentType === department,
        );

        setForm((currentForm) => ({
            ...currentForm,
            department,
            position: service?.positions[0] || "",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSubmitting(true);
            setMessage("");

            if (accountType === "STAFF") {
                await api.post("/auth/register/staff", {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    password: form.password,
                    staffNumber: form.staffNumber.trim(),
                    department: form.department,
                    position: form.position,
                    specialization: form.department,
                });

                setMessage(
                    `${form.firstName} ${form.lastName} was created as ${form.position} for ${form.department}.`,
                );
            } else {
                await api.post("/auth/register/admin", {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    password: form.password,
                    adminNumber: form.adminNumber.trim(),
                    department: "System Administration",
                });

                setMessage(
                    `${form.firstName} ${form.lastName} was created as an administrator.`,
                );
            }

            setForm((currentForm) => ({
                ...currentForm,
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                password: "",
                staffNumber: "",
                adminNumber: "",
            }));
        } catch (error) {
            console.error(
                "Account creation failed:",
                error.response?.status,
                error.response?.data || error.message,
            );

            if (error.response?.status === 403) {
                setMessage(
                    "Your session does not have permission to create accounts.",
                );
            } else if (error.response?.status === 400) {
                setMessage(
                    "The account could not be created. Check that the email, number, department, and position are unique and valid.",
                );
            } else {
                setMessage(
                    "The account could not be created. Please try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-panel admin-create-account-panel">
                <ResponsiveHeader
                    variant="panel"
                    ariaLabel="Account creation navigation"
                    desktopActions={[
                        { label: "Back to home", to: "/" },
                        { label: "Admin dashboard", to: "/admin/dashboard" },
                    ]}
                    menuItems={[
                        {
                            label: "Admin dashboard",
                            to: "/admin/dashboard",
                        },
                        { label: "Home", to: "/" },
                    ]}
                    onSignOut={() => {
                        localStorage.removeItem("pulseupUser");
                        navigate("/login", { replace: true });
                    }}
                />

                <p className="eyebrow">
                    ADMINISTRATION
                </p>

                <h1>Create an account</h1>

                <p className="muted-text">
                    Create secure staff accounts linked to a
                    clinic appointment type, or create another
                    administrator account.
                </p>

                {message && (
                    <p className="form-message">
                        {message}
                    </p>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Account type

                        <select
                            value={accountType}
                            onChange={handleAccountTypeChange}
                            disabled={submitting}
                        >
                            <option value="STAFF">
                                Healthcare staff
                            </option>

                            <option value="ADMIN">
                                Administrator
                            </option>
                        </select>
                    </label>

                    <div className="form-grid">
                        <label>
                            First name

                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleFieldChange}
                                disabled={submitting}
                                required
                            />
                        </label>

                        <label>
                            Last name

                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleFieldChange}
                                disabled={submitting}
                                required
                            />
                        </label>
                    </div>

                    <div className="form-grid">
                        <label>
                            Email address

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleFieldChange}
                                disabled={submitting}
                                required
                            />
                        </label>

                        <label>
                            Phone number

                            <input
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleFieldChange}
                                disabled={submitting}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Temporary password

                        <input
                            type="password"
                            name="password"
                            minLength="8"
                            value={form.password}
                            onChange={handleFieldChange}
                            disabled={submitting}
                            required
                        />
                    </label>

                    {accountType === "STAFF" ? (
                        <>
                            <label>
                                Staff number

                                <input
                                    name="staffNumber"
                                    placeholder="Example: GEN-1002"
                                    value={form.staffNumber}
                                    onChange={handleFieldChange}
                                    disabled={submitting}
                                    required
                                />
                            </label>

                            <label>
                                Appointment type / department

                                <select
                                    value={form.department}
                                    onChange={
                                        handleDepartmentChange
                                    }
                                    disabled={submitting}
                                >
                                    {STAFF_SERVICES.map(
                                        (service) => (
                                            <option
                                                value={
                                                    service.appointmentType
                                                }
                                                key={
                                                    service.appointmentType
                                                }
                                            >
                                                {
                                                    service.appointmentType
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            <label>
                                Position

                                <select
                                    name="position"
                                    value={form.position}
                                    onChange={handleFieldChange}
                                    disabled={submitting}
                                >
                                    {allowedPositions.map(
                                        (position) => (
                                            <option
                                                value={position}
                                                key={position}
                                            >
                                                {position}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>
                        </>
                    ) : (
                        <>
                            <label>
                                Administrator number

                                <input
                                    name="adminNumber"
                                    placeholder="Example: ADM-1002"
                                    value={form.adminNumber}
                                    onChange={handleFieldChange}
                                    disabled={submitting}
                                    required
                                />
                            </label>

                            <label>
                                Department

                                <input
                                    value="System Administration"
                                    disabled
                                />
                            </label>
                        </>
                    )}

                    <button
                        type="submit"
                        className="primary-button full-button"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    <Link to="/admin/dashboard">
                        Back to admin dashboard
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default AdminCreateAccountPage;