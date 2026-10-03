import { Outlet, useLocation } from "react-router-dom";
import StudentSidebar from "../components/student/StudentSidebar";
import StudentHeader from "../components/student/StudentHeader";
import "../styles/layouts/StudentLayout.css";
import "../styles/components/StudentProfileIntegration.css";

const pageInfo = {
  "/student/dashboard": ["Dashboard", "Your PulseUp student health overview."],
  "/student/bookings": ["Bookings", "Manage appointments and clinic bookings."],
  "/student/history": ["Medical History", "Review your previous consultations and clinic activity."],
  "/student/health-quests": ["Health Quests", "Complete wellness activities and earn rewards."],
  "/student/sick-notes": ["Sick Notes", "Request and manage your medical sick notes."]
};

export default function StudentLayout() {
  const { pathname } = useLocation();
  const [title, subtitle] = pageInfo[pathname] || ["PulseUp", "Student health portal"];

  return (
    <div className="student-layout">
      <StudentSidebar />
      <main className="student-main-content">
        <StudentHeader title={title} subtitle={subtitle} />
        <Outlet />
      </main>
    </div>
  );
}
