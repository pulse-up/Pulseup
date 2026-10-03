import { useEffect, useState } from 'react';
import './StudentSickNotes.css';
import { getUserDisplayName } from '../utils/session';

const initialNotes = [];

function SickNotes(){
 const [notes,setNotes]=useState(initialNotes);
 const [form,setForm]=useState({clinic:'',reason:'',from:'',to:''});
 const [notifications,setNotifications]=useState(false);
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [profile,setProfile]=useState({name:getUserDisplayName('Student'),email:'',phone:''});
 const [darkMode,setDarkMode]=useState(()=>localStorage.getItem('darkMode')==='enabled');

 useEffect(()=>{
  document.body.classList.toggle('dark-mode',darkMode);
  localStorage.setItem('darkMode',darkMode?'enabled':'disabled');
  return ()=>document.body.classList.remove('dark-mode');
 },[darkMode]);

 const submit=e=>{
  e.preventDefault();
  if(!form.clinic.trim()||!form.reason.trim()||!form.from||!form.to){alert('Please complete all fields.');return;}
  if(form.to<form.from){alert('The To date cannot be earlier than the From date.');return;}
  setNotes(n=>[{id:Date.now(),clinic:form.clinic,reason:form.reason,range:`${form.from} - ${form.to}`,status:'Pending',action:'Track'},...n]);
  setForm({clinic:'',reason:'',from:'',to:''});
  alert('Sick note request submitted successfully.');
 };

 const quick=()=>{if(confirm('Generate sick note from your last consultation?')) alert('Quick sick note request generated successfully.');};
 const action=(name)=>{
  if(name==='Download'&&confirm('Are you sure you want to download this sick note?')) alert('Sick note downloaded successfully.');
  if(name==='Track'&&confirm('Track this request status?')) alert('Status: Pending medical review.');
  if(name==='Details'&&confirm('Open rejection details?')) alert('Please contact the clinic for the reason this request was rejected.');
 };

 const initials=profile.name.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';

 return <div className="sicknotes-page">
  <header className="sn-topbar">
   <div className="sn-search"><span>⌕</span><input placeholder="Search sick notes..."/></div>
   <div className="sn-actions">
    <div className="notification-wrapper"><button className="icon-button" onClick={()=>setNotifications(v=>!v)}>♢</button>
     {notifications&&<div className="notification-menu"><h3>Notifications</h3><p>No new notifications.</p></div>}
    </div>
    <button className="icon-button" aria-label="Settings" onClick={()=>setSettingsOpen(true)}>⚙</button>
    <div className="sn-avatar">{initials}</div>
   </div>
  </header>

  <div className="sn-grid">
   <section className="sn-card">
    <h2>Request Sick Note</h2>
    <form onSubmit={submit}>
     <label>
      Campus Clinic You Attended
      <select
          value={form.clinic}
          onChange={e => setForm({...form, clinic:e.target.value})}
          required
      >
       <option value="">Select Campus Clinic</option>
       <option value="Bellville Campus Clinic">
        Bellville Campus Clinic
       </option>
       <option value="District 6 Campus Clinic">
        District 6 Campus Clinic
       </option>
       <option value="Wellington Campus Clinic">
        Wellington Campus Clinic
       </option>
      </select>
     </label>
     <label>Reason<textarea rows="3" placeholder="Describe your condition..." value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></label>
     <div className="sn-date-grid"><label>From<input type="date" value={form.from} onChange={e=>setForm({...form,from:e.target.value})}/></label><label>To<input type="date" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}/></label></div>
     <button className="sn-primary" type="submit">Submit Request</button>
    </form>
   </section>
   <section className="sn-quick"><div className="sn-quick-icon">＋</div><h2>Quick Request</h2><p>Request a sick note from your last consultation instantly</p><button onClick={quick}>Generate from Last Visit</button></section>
  </div>

  <section className="sn-notes">
   <h2>Your Sick Notes</h2>
   <div className="sn-table-wrap"><table><thead><tr><th>Clinic</th><th>Reason</th><th>Date Range</th><th>Status</th><th>Action</th></tr></thead>
   <tbody>{!notes.length&&<tr><td colSpan="5">No sick notes yet.</td></tr>}{notes.map(n=><tr key={n.id}><td>{n.clinic}</td><td>{n.reason}</td><td>{n.range}</td><td><span className={`sn-badge ${n.status.toLowerCase()}`}>{n.status}</span></td><td><button className="sn-action" onClick={()=>action(n.action)}>{n.action}</button></td></tr>)}</tbody></table></div>
  </section>

  {settingsOpen&&<div className="modal-backdrop" onMouseDown={()=>setSettingsOpen(false)}><section className="pulse-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><h2>Profile Settings</h2><button onClick={()=>setSettingsOpen(false)}>×</button></div><form onSubmit={e=>{e.preventDefault();if(!profile.name.trim()){alert('Name cannot be empty.');return;}setSettingsOpen(false);alert('Profile settings updated successfully.');}}><div className="modal-profile"><div className="sn-avatar large">{initials}</div><h3>{profile.name}</h3></div><label>Full Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Email<input type="email" placeholder="Enter email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><label>Phone Number<input placeholder="Enter number" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></label><label className="toggle-row"><input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)}/> Dark Mode</label><button className="sn-primary" type="submit">Save Changes</button></form></section></div>}
 </div>;
}
export default SickNotes;
