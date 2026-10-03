import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminProfileAvatar from "./AdminProfileAvatar";
import {ADMIN_PHOTO_EVENT,ADMIN_PHOTO_KEY,ADMIN_PROFILE_KEY} from "./adminProfileShared";
import "../../styles/components/AdminHeader.css";

const pageTitles={
 "/admin/profile":["Profile","Staff account and clinic activity."],
 "/admin/bookings":["Appointments","Manage the clinic queue, active appointments and consultation history."],
 "/admin/health-quests":["Healthquests","Create and manage student health quests."],
 "/admin/sick-notes":["Sick Notes","Review and manage student sick-note requests."],
 "/admin/history":["History","Review clinic activity and historical records."]
};
const adminNotifications=[
 {id:"appointment",title:"New appointment booked",message:"A student submitted a new clinic appointment.",route:"/admin/bookings",icon:"▣"},
 {id:"sick-note",title:"Sick note updated",message:"A student's sick-note record requires attention.",route:"/admin/sick-notes",icon:"✚"},
 {id:"healthquest",title:"Health questionnaire submitted",message:"A new healthquest submission is available.",route:"/admin/health-quests",icon:"☷"}
];
const fallback={name:"Dr Inga Plati"};

export default function AdminHeader(){
 const {pathname}=useLocation(),navigate=useNavigate();
 const [pageTitle,pageSubtitle]=pageTitles[pathname]||["Admin","PulseUp clinic administration."];
 const [notifications,setNotifications]=useState(false),[settings,setSettings]=useState(false);
 const [readIds,setReadIds]=useState(()=>{try{return JSON.parse(localStorage.getItem("pulseupAdminReadNotifications")||"[]")}catch{return []}});
 const [dark,setDark]=useState(()=>localStorage.getItem("pulseupAdminTheme")==="dark");
 const [prefs,setPrefs]=useState(()=>{try{return {...{displayName:"Dr Mat Lubisi",email:"",emailNotifications:true,smsAlerts:false},...JSON.parse(localStorage.getItem("pulseupAdminPrefs")||"{}")}}catch{return {displayName:"Dr Mat Lubisi",email:"",emailNotifications:true,smsAlerts:false}}});
 const readAccount=()=>{let profile=fallback;try{profile={...fallback,...JSON.parse(localStorage.getItem(ADMIN_PROFILE_KEY)||"{}")}}catch(error){console.warn("Could not read admin profile from localStorage:",error)}return {profile,photo:localStorage.getItem(ADMIN_PHOTO_KEY)||""}};
 const [account,setAccount]=useState(readAccount);
 const unread=adminNotifications.filter(n=>!readIds.includes(n.id)).length;

 useEffect(()=>{const sync=()=>setAccount(readAccount());window.addEventListener(ADMIN_PHOTO_EVENT,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(ADMIN_PHOTO_EVENT,sync);window.removeEventListener("storage",sync)}},[]);
 useEffect(()=>{document.body.classList.toggle("admin-dark",dark);localStorage.setItem("pulseupAdminTheme",dark?"dark":"light")},[dark]);
 const openNotification=n=>{const next=[...new Set([...readIds,n.id])];setReadIds(next);localStorage.setItem("pulseupAdminReadNotifications",JSON.stringify(next));setNotifications(false);navigate(n.route)};
 const save=e=>{e.preventDefault();localStorage.setItem("pulseupAdminPrefs",JSON.stringify(prefs));setSettings(false);alert("Settings saved successfully.")};

 return <>
  <header className="admin-header"><div className="admin-header-title"><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div><div className="admin-header-actions">
   <button className="admin-icon" onClick={()=>setSettings(true)} aria-label="Settings">⚙</button>
   <div className="admin-notification-wrap">
    <button className="admin-icon" onClick={()=>setNotifications(v=>!v)} aria-label="Notifications">♢{unread>0&&<span>{unread}</span>}</button>
    {notifications&&<div className="admin-notification-box"><div className="notification-title-row"><h3>Notifications</h3>{unread>0&&<small>{unread} unread</small>}</div>
     {adminNotifications.map(n=><button type="button" key={n.id} className={`admin-notification-item ${readIds.includes(n.id)?"read":"unread"}`} onClick={()=>openNotification(n)}><span className="notification-item-icon">{n.icon}</span><span><strong>{n.title}</strong><small>{n.message}</small></span><b>›</b></button>)}
    </div>}
   </div>
   <AdminProfileAvatar photo={account.photo} name={account.profile.name} size="mini"/>
  </div></header>
  {settings&&<div className="admin-modal-backdrop" onMouseDown={()=>setSettings(false)}><section className="admin-settings-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><h2>Settings</h2><button onClick={()=>setSettings(false)}>×</button></div><form onSubmit={save}>
   <div className="admin-settings-card"><h3>Profile Settings</h3><label>Display Name<input value={prefs.displayName} onChange={e=>setPrefs({...prefs,displayName:e.target.value})}/></label><label>Email<input type="email" value={prefs.email} onChange={e=>setPrefs({...prefs,email:e.target.value})}/></label></div>
   <div className="admin-settings-card"><h3>Security</h3><label>New Password<input type="password" placeholder="New password"/></label><label>Confirm Password<input type="password" placeholder="Confirm password"/></label></div>
   <div className="admin-settings-card"><h3>Notifications</h3><label className="admin-check"><input type="checkbox" checked={prefs.emailNotifications} onChange={e=>setPrefs({...prefs,emailNotifications:e.target.checked})}/> Email Notifications</label><label className="admin-check"><input type="checkbox" checked={prefs.smsAlerts} onChange={e=>setPrefs({...prefs,smsAlerts:e.target.checked})}/> SMS Alerts</label></div>
   <div className="admin-settings-card"><h3>Appearance</h3><div className="theme-buttons"><button type="button" onClick={()=>setDark(false)}>Light Mode</button><button type="button" onClick={()=>setDark(true)}>Dark Mode</button></div></div>
   <button className="admin-primary" type="submit">Save Changes</button>
  </form></section></div>}
 </>;
}
