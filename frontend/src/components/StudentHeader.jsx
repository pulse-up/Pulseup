import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import { USE_BACKEND } from '../constants/appConfig';
import { getRolePrefix, getStoredRole } from '../utils/session';
import { fetchMyAppointments, getReminderNotifications } from '../utils/appointments';
import { STUDENT_IMAGE_KEY, STUDENT_PROFILE_EVENT, getStudentDetails } from '../utils/studentProfile';
import ProfileSettingsModal from './ProfileSettingsModal';
import './StudentHeader.css';

function getDefaultProfile() {
  const details = getStudentDetails();

  return {
    name: details.fullName || 'Student',
    email: details.email,
    phone: details.phone,
    medicalId: details.studentNumber || 'Not set',
  };
}

export default function StudentHeader({searchPlaceholder='Search records...',title,subtitle}){
 const navigate=useNavigate();
 const [notificationsOpen,setNotificationsOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false);
 const [readIds,setReadIds]=useState(()=>{try{return JSON.parse(localStorage.getItem('pulseupStudentReadNotifications')||'[]');}catch{return [];}});
 const [darkMode,setDarkMode]=useState(()=>localStorage.getItem('darkMode')==='enabled');
 const [profile,setProfile]=useState(()=>{try{return {...getDefaultProfile(),...JSON.parse(localStorage.getItem('pulseupStudentProfile')||'{}')};}catch{return getDefaultProfile();}});
 const [image,setImage]=useState(()=>localStorage.getItem(STUDENT_IMAGE_KEY)||'');
 const [studentNotifications,setStudentNotifications]=useState([]);
 const unread=studentNotifications.filter(n=>!readIds.includes(n.id)).length;

 useEffect(()=>{
  if(!USE_BACKEND||getStoredRole()!=='STUDENT')return undefined;
  let cancelled=false;
  const load=()=>fetchMyAppointments().then(list=>{if(!cancelled)setStudentNotifications(getReminderNotifications(list).map(n=>({...n,route:'/bookings',icon:'▣'})));}).catch(()=>{});
  load();
  const timer=window.setInterval(load,60000);
  return()=>{cancelled=true;window.clearInterval(timer);};
 },[]);
 useEffect(()=>{const sync=()=>{const d=getStudentDetails();setProfile(p=>({...p,name:d.fullName||p.name,email:d.email,phone:d.phone,medicalId:d.studentNumber||p.medicalId}));setImage(localStorage.getItem(STUDENT_IMAGE_KEY)||'');};window.addEventListener(STUDENT_PROFILE_EVENT,sync);return()=>window.removeEventListener(STUDENT_PROFILE_EVENT,sync);},[]);
 useEffect(()=>{document.body.classList.toggle('dark-mode',darkMode);localStorage.setItem('darkMode',darkMode?'enabled':'disabled');return()=>document.body.classList.remove('dark-mode');},[darkMode]);
 useEffect(()=>{if(image)localStorage.setItem('pulseupStudentProfileImage',image);else localStorage.removeItem('pulseupStudentProfileImage');},[image]);
 const openNotification=n=>{const next=[...new Set([...readIds,n.id])];setReadIds(next);localStorage.setItem('pulseupStudentReadNotifications',JSON.stringify(next));setNotificationsOpen(false);navigate((getRolePrefix(getStoredRole())||'/student')+n.route);};

 return <>
  <header className="student-header">
   <div className="student-header-left">{title?<div className="student-page-heading"><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>:<div className="student-header-search"><span>⌕</span><input type="search" placeholder={searchPlaceholder}/></div>}</div>
   <div className="student-header-actions">
    <div className="student-notification-wrap">
     <button className="student-header-icon student-bell" type="button" onClick={()=>setNotificationsOpen(v=>!v)} aria-label="Notifications">♢{unread>0&&<span>{unread}</span>}</button>
     {notificationsOpen&&<div className="student-notification-menu"><div className="student-notification-title"><h3>Notifications</h3>{unread>0&&<small>{unread} unread</small>}</div>
      {!studentNotifications.length&&<p className="student-notification-empty">No new notifications.</p>}{studentNotifications.map(n=><button type="button" key={n.id} className={`student-notification-item ${readIds.includes(n.id)?'read':'unread'}`} onClick={()=>openNotification(n)}><span className="student-notification-icon">{n.icon}</span><span><strong>{n.title}</strong><small>{n.message}</small></span><b>›</b></button>)}
     </div>}
    </div>
    <button className="student-header-icon" type="button" onClick={()=>setSettingsOpen(true)} aria-label="Settings">⚙</button>
    <button className="student-profile-trigger" type="button" onClick={()=>setSettingsOpen(true)} aria-label="Open profile settings"><ProfileAvatar name={profile.name} image={image}/><span><strong>{profile.name}</strong><small>Student No: {profile.medicalId}</small></span></button>
   </div>
  </header>
  <ProfileSettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)} profile={profile} setProfile={setProfile} image={image} setImage={setImage} darkMode={darkMode} setDarkMode={setDarkMode}/>
 </>;
}
