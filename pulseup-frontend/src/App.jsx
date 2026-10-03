import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/student/Dashboard";
import Bookings from "./pages/student/Bookings";
import HealthQuest from "./pages/student/HealthQuest";
import SickNotes from "./pages/student/SickNotes";
import History from "./pages/student/History";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminHealthQuests from "./pages/admin/AdminHealthQuests";
import AdminSickNotes from "./pages/admin/AdminSickNotes";
import AdminHistory from "./pages/admin/AdminHistory";

function App(){return <BrowserRouter><Routes>
 <Route path="/" element={<Navigate to="/student/dashboard" replace/>}/>
 <Route path="/student" element={<StudentLayout/>}><Route path="dashboard" element={<Dashboard/>}/><Route path="bookings" element={<Bookings/>}/><Route path="history" element={<History/>}/><Route path="health-quests" element={<HealthQuest/>}/><Route path="sick-notes" element={<SickNotes/>}/></Route>
 <Route path="/admin" element={<AdminLayout/>}><Route index element={<Navigate to="profile" replace/>}/><Route path="profile" element={<AdminProfile/>}/><Route path="bookings" element={<AdminAppointments/>}/><Route path="health-quests" element={<AdminHealthQuests/>}/><Route path="sick-notes" element={<AdminSickNotes/>}/><Route path="history" element={<AdminHistory/>}/></Route>
 <Route path="*" element={<Navigate to="/student/dashboard" replace/>}/>
 </Routes></BrowserRouter>}
export default App;
