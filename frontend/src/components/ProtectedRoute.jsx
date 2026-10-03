import { Navigate, useLocation } from "react-router-dom";

function getSavedUser() {
    const savedUser = localStorage.getItem("pulseupUser");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        console.error("Invalid saved user information:", error);
        localStorage.removeItem("pulseupUser");
        return null;
    }
}

function getDashboardPath(role) {
    switch (role) {
        case "STUDENT":
            return "/student/dashboard";

        case "STAFF":
            return "/staff/dashboard";

        case "ADMIN":
            return "/admin/dashboard";

        default:
            return "/login";
    }
}

function ProtectedRoute({ allowedRoles, children }) {
    const location = useLocation();
    const user = getSavedUser();

    if (!user?.token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    const userRole = String(user.role || "").toUpperCase();

    if (
        Array.isArray(allowedRoles) &&
        !allowedRoles.includes(userRole)
    ) {
        return (
            <Navigate
                to={getDashboardPath(userRole)}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;