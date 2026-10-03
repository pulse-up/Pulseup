import { useEffect, useMemo, useState } from "react";
import "../../styles/pages/History.css";

const records = [
 {id:1,date:"2026-04-10",type:"General Consultation",provider:"Dr. Nyana",location:"Unit 1B",status:"Completed",notes:"Flu symptoms reviewed. Rest, hydration and medication advised."},
 {id:2,date:"2026-03-25",type:"Mental Health Support",provider:"Ms. S. Dlamini",location:"Wellness Centre",status:"Completed",notes:"Wellness check-in completed. Follow-up available if needed."},
 {id:3,date:"2026-03-16",type:"Eye Test",provider:"Prof. Jacobs",location:"Optometry Unit",status:"Cancelled",notes:"Appointment cancelled before consultation."},
 {id:4,date:"2026-02-24",type:"General Consultation",provider:"Dr. van der Merwe",location:"Campus Health Centre",status:"Completed",notes:"Health clearance consultation completed."}
];

function History(){
 const [query,setQuery]=useState("");
 const [status,setStatus]=useState("All");
 const [from,setFrom]=useState("");
 const [to,setTo]=useState("");
 const [applied,setApplied]=useState({query:"",status:"All",from:"",to:""});
 const [selected,setSelected]=useState(null);
 const [notifications,setNotifications]=useState(false);
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [profile,setProfile]=useState({name:"Matinisa Lubisi",email:"",phone:""});
 const [darkMode,setDarkMode]=useState(()=>localStorage.getItem("darkMode")==="enabled");

 useEffect(()=>{
  document.body.classList.toggle("dark-mode",darkMode);
  localStorage.setItem("darkMode",darkMode?"enabled":"disabled");
  return ()=>document.body.classList.remove("dark-mode");
 },[darkMode]);

 const filtered=useMemo(()=>records.filter(r=>{
  const q=applied.query.toLowerCase().trim();
  const matchesText=!q||`${r.type} ${r.provider} ${r.location}`.toLowerCase().includes(q);
  const matchesStatus=applied.status==="All"||r.status===applied.status;
  const matchesFrom=!applied.from||r.date>=applied.from;
  const matchesTo=!applied.to||r.date<=applied.to;
  return matchesText&&matchesStatus&&matchesFrom&&matchesTo;
 }),[applied]);

 const apply=e=>{
  e.preventDefault();
  if(from&&to&&to<from){alert("The To date cannot be earlier than the From date.");return;}
  setApplied({query,status,from,to});
 };

 const reset=()=>{setQuery("");setStatus("All");setFrom("");setTo("");setApplied({query:"",status:"All",from:"",to:""});};
 const initials=profile.name.split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"ML";

 return <div className="history-page">
  <header className="history-topbar">
   <div><h1>Medical History</h1><p>Review your previous consultations and clinic activity.</p></div>
   <div className="history-top-actions">
    <div className="notification-wrapper"><button className="icon-button" onClick={()=>setNotifications(v=>!v)}>♢</button>{notifications&&<div className="notification-menu"><h3>Notifications</h3><div><strong>History Updated</strong><p>Your latest consultation has been added.</p></div><div><strong>Record Available</strong><p>A previous consultation note is ready to view.</p></div></div>}</div>
    <button className="icon-button" aria-label="Settings" onClick={()=>setSettingsOpen(true)}>⚙</button>
    <div className="history-avatar">{initials}</div>
   </div>
  </header>

  <section className="history-summary">
   <article><small>Total Visits</small><strong>{records.length}</strong><span>Recorded consultations</span></article>
   <article><small>Completed</small><strong>{records.filter(r=>r.status==="Completed").length}</strong><span>Successful consultations</span></article>
   <article><small>Latest Visit</small><strong>10 Apr</strong><span>General Consultation</span></article>
  </section>

  <section className="history-filter-card">
   <div className="history-section-title"><h2>Filter Records</h2><button type="button" onClick={reset}>Reset</button></div>
   <form className="history-filter-form" onSubmit={apply}>
    <label>Search<input placeholder="Doctor, clinic or consultation..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Completed</option><option>Cancelled</option></select></label>
    <label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
    <label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
    <button className="history-primary" type="submit">Apply Filter</button>
   </form>
  </section>

  <section className="history-records">
   <div className="history-section-title"><div><h2>Consultation Records</h2><p>{filtered.length} record{filtered.length!==1?"s":""} shown</p></div></div>
   <div className="history-table-wrap"><table><thead><tr><th>Date</th><th>Consultation</th><th>Provider</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>{filtered.length?filtered.map(r=><tr key={r.id}><td>{r.date}</td><td><strong>{r.type}</strong></td><td>{r.provider}</td><td>{r.location}</td><td><span className={`history-badge ${r.status.toLowerCase()}`}>{r.status}</span></td><td><button className="history-link" onClick={()=>setSelected(r)}>View Details</button></td></tr>):<tr><td className="history-empty" colSpan="6">No medical records match the selected filters.</td></tr>}</tbody>
   </table></div>
  </section>

  {selected&&<div className="modal-backdrop" onMouseDown={()=>setSelected(null)}><section className="pulse-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><h2>Consultation Details</h2><button onClick={()=>setSelected(null)}>×</button></div><div className="record-details"><p><strong>Date:</strong> {selected.date}</p><p><strong>Consultation:</strong> {selected.type}</p><p><strong>Provider:</strong> {selected.provider}</p><p><strong>Location:</strong> {selected.location}</p><p><strong>Status:</strong> {selected.status}</p><div className="history-note"><strong>Clinical Notes</strong><p>{selected.notes}</p></div></div><button className="history-primary" onClick={()=>setSelected(null)}>Close</button></section></div>}

  {settingsOpen&&<div className="modal-backdrop" onMouseDown={()=>setSettingsOpen(false)}><section className="pulse-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><h2>Profile Settings</h2><button onClick={()=>setSettingsOpen(false)}>×</button></div><form onSubmit={e=>{e.preventDefault();if(!profile.name.trim()){alert("Name cannot be empty.");return;}setSettingsOpen(false);alert("Profile settings updated successfully.");}}><div className="modal-profile"><div className="history-avatar large">{initials}</div><h3>{profile.name}</h3><small>Medical ID: 88201-P</small></div><label>Full Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Email<input type="email" placeholder="Enter email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><label>Phone Number<input placeholder="Enter number" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></label><label className="toggle-row"><input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)}/> Dark Mode</label><button className="history-primary" type="submit">Save Changes</button></form></section></div>}
 </div>;
}
export default History;
