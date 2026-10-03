import { NavLink } from "react-router-dom";
import "../../styles/components/AdminSidebar.css";

const links=[
 ["Profile","/admin/profile","◉"],
 ["Bookings","/admin/bookings","▣"],
 ["Healthquests","/admin/health-quests","♡"],
 ["Sick Notes","/admin/sick-notes","▤"],
 ["History","/admin/history","◷"]
];

export default function AdminSidebar(){
 return <aside className="admin-sidebar">
  <div className="admin-brand"><div className="admin-brand-mark">P+</div><div><strong>PulseUp</strong><small>Campus Clinic</small></div></div>
  <nav>{links.map(([label,to,icon])=><NavLink key={to} to={to} className={({isActive})=>isActive?"active":""}><span>{icon}</span>{label}</NavLink>)}</nav>
  <button className="admin-logout" onClick={()=>window.alert("Logout will be connected to authentication later.")}>Logout</button>
 </aside>
}
