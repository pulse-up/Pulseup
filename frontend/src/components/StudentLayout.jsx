import { Outlet, useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import './StudentLayout.css';
import './StudentProfileIntegration.css';

const pageInfo = {
  '/dashboard': ['Dashboard', 'Your PulseUp health overview.'],
  '/overview': ['Overview', 'A quick look at your services and activity.'],
  '/bookings': ['Bookings', 'Manage appointments and clinic bookings.'],
  '/history': ['Medical History', 'Review your previous consultations and clinic activity.'],
  '/health-quests': ['Health Quests', 'Complete wellness activities and earn rewards.'],
  '/profile': ['My Profile', 'Your personal, emergency and health details.'],
  '/sick-notes': ['Sick Notes', 'Request and manage your medical sick notes.']
};

export default function StudentLayout() {
  const { pathname } = useLocation();
  const [title, subtitle] = pageInfo[pathname.replace(/^\/(student|employee)/, '')] || ['PulseUp', 'Campus health portal'];

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
