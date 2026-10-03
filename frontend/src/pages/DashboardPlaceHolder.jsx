import { Link } from "react-router-dom";

function DashboardPlaceholder({ role }) {
    const user = JSON.parse(
        localStorage.getItem("pulseupUser") || "{}"
    );

    return (
        <main className="dashboard-placeholder">
            <Link className="logo" to="/">
                PULSE<span>UP</span>
            </Link>

            <p className="eyebrow">{role.toUpperCase()} DASHBOARD</p>

            <h1>
                Welcome, {user.firstName || "PulseUp user"}.
            </h1>

            <p>
                You have signed in successfully. The functional dashboard is the next
                page we will add.
            </p>

            <Link className="primary-button" to="/">
                Return home
            </Link>
        </main>
    );
}

export default DashboardPlaceholder;