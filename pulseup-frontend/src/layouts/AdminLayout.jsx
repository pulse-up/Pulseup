import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "../styles/layouts/AdminLayout.css";

export default function AdminLayout(){
 return <div className="admin-layout"><AdminSidebar/><main className="admin-main"><AdminHeader/><Outlet/></main></div>
}
