import { NavLink } from "react-router-dom";
import "../../styles/components/StudentSidebar.css";

const navItems = [
    { to: "/student/dashboard", icon: "▦", label: "Dashboard" },
    { to: "/student/bookings", icon: "▣", label: "Bookings" },
    { to: "/student/history", icon: "◷", label: "History" },
    { to: "/student/health-quests", icon: "♡", label: "Health Quests" },
    { to: "/student/sick-notes", icon: "▤", label: "Sick Notes" },
];

function StudentSidebar() {
    return (
        <aside className="student-sidebar">
            <h2 className="student-sidebar__brand">PulseUp</h2>

            <nav className="student-sidebar__nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `student-sidebar__link${isActive ? " active" : ""}`
                        }
                    >
                        <span className="student-sidebar__icon" aria-hidden="true">
                            {item.icon}
                        </span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button className="student-sidebar__logout" type="button">
                Logout
            </button>
        </aside>
    );
}

export default StudentSidebar;
