import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "./ProfileAvatar";
import ProfileSettingsModal from "./ProfileSettingsModal";
import "../../styles/components/StudentHeader.css";

const defaultProfile={name:"Matinisa Lubisi",email:"",phone:"",medicalId:"88201-P"};
const studentNotifications=[
 {id:"appointment",title:"Appointment Reminder",message:"You have an upcoming clinic appointment.",route:"/bookings",icon:"▣"},
 {id:"sick-note",title:"Sick Note Update",message:"There is an update to your sick-note request.",route:"/sick-notes",icon:"✚"},
 {id:"healthquest",title:"Health Quest Update",message:"A health quest is available for you.",route:"/health-quests",icon:"☷"}
];

export default function StudentHeader({searchPlaceholder="Search records...",title,subtitle}){
 const navigate=useNavigate();
 const [notificationsOpen,setNotificationsOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false);
 const [readIds,setReadIds]=useState(()=>{try{return JSON.parse(localStorage.getItem("pulseupStudentReadNotifications")||"[]")}catch{return []}});
 const [darkMode,setDarkMode]=useState(()=>localStorage.getItem("darkMode")==="enabled");
 const [profile,setProfile]=useState(()=>{try{return {...defaultProfile,...JSON.parse(localStorage.getItem("pulseupStudentProfile")||"{}")}}catch{return defaultProfile}});
 const [image,setImage]=useState(()=>localStorage.getItem("pulseupStudentProfileImage")||"");
 const unread=studentNotifications.filter(n=>!readIds.includes(n.id)).length;

 useEffect(()=>{document.body.classList.toggle("dark-mode",darkMode);localStorage.setItem("darkMode",darkMode?"enabled":"disabled")},[darkMode]);
 useEffect(()=>{if(image)localStorage.setItem("pulseupStudentProfileImage",image);else localStorage.removeItem("pulseupStudentProfileImage")},[image]);
 const openNotification=n=>{const next=[...new Set([...readIds,n.id])];setReadIds(next);localStorage.setItem("pulseupStudentReadNotifications",JSON.stringify(next));setNotificationsOpen(false);navigate(n.route)};

 return <>
  <header className="student-header">
   <div className="student-header-left">{title?<div className="student-page-heading"><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>:<div className="student-header-search"><span>⌕</span><input type="search" placeholder={searchPlaceholder}/></div>}</div>
   <div className="student-header-actions">
    <div className="student-notification-wrap">
     <button className="student-header-icon student-bell" type="button" onClick={()=>setNotificationsOpen(v=>!v)} aria-label="Notifications">♢{unread>0&&<span>{unread}</span>}</button>
     {notificationsOpen&&<div className="student-notification-menu"><div className="student-notification-title"><h3>Notifications</h3>{unread>0&&<small>{unread} unread</small>}</div>
      {studentNotifications.map(n=><button type="button" key={n.id} className={`student-notification-item ${readIds.includes(n.id)?"read":"unread"}`} onClick={()=>openNotification(n)}><span className="student-notification-icon">{n.icon}</span><span><strong>{n.title}</strong><small>{n.message}</small></span><b>›</b></button>)}
     </div>}
    </div>
    <button className="student-header-icon" type="button" onClick={()=>setSettingsOpen(true)} aria-label="Settings">⚙</button>
    <button className="student-profile-trigger" type="button" onClick={()=>setSettingsOpen(true)} aria-label="Open profile settings"><ProfileAvatar name={profile.name} image={image}/><span><strong>{profile.name}</strong><small>Medical ID: {profile.medicalId}</small></span></button>
   </div>
  </header>
  <ProfileSettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)} profile={profile} setProfile={setProfile} image={image} setImage={setImage} darkMode={darkMode} setDarkMode={setDarkMode}/>
 </>;
}
