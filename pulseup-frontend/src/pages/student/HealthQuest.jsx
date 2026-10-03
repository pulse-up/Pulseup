import { useEffect, useMemo, useState } from "react";
import "../../styles/pages/HealthQuest.css";

const initialQuests = [
 { id:1, title:"Hydration Hero", description:"Drink 8 glasses of water today.", reward:20, progress:75, category:"Daily", completed:false },
 { id:2, title:"Move Your Body", description:"Complete 30 minutes of physical activity.", reward:30, progress:45, category:"Fitness", completed:false },
 { id:3, title:"Mindful Minute", description:"Take 10 minutes for breathing or mindfulness.", reward:15, progress:100, category:"Wellness", completed:true },
 { id:4, title:"Healthy Plate", description:"Choose a balanced meal with fruit or vegetables.", reward:20, progress:20, category:"Nutrition", completed:false }
];

function HealthQuest() {
 const [quests,setQuests]=useState(initialQuests);
 const [filter,setFilter]=useState("All");
 const [details,setDetails]=useState(null);
 const [notifications,setNotifications]=useState(false);
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [profile,setProfile]=useState({name:"Matinisa Lubisi",email:"",phone:""});
 const [darkMode,setDarkMode]=useState(()=>localStorage.getItem("darkMode")==="enabled");

 useEffect(()=>{
   document.body.classList.toggle("dark-mode",darkMode);
   localStorage.setItem("darkMode",darkMode?"enabled":"disabled");
   return ()=>document.body.classList.remove("dark-mode");
 },[darkMode]);

 const visible=useMemo(()=>filter==="All"?quests:quests.filter(q=>q.category===filter),[filter,quests]);
 const points=quests.filter(q=>q.completed).reduce((sum,q)=>sum+q.reward,0);

 const complete=(id)=>{
   setQuests(current=>current.map(q=>q.id===id?{...q,progress:100,completed:true}:q));
   window.alert("Quest completed. Your progress has been updated.");
 };

 return <div className="healthquest-page">
   <header className="hq-topbar">
     <div><h1>Health Quests</h1><p>Small healthy actions. Real rewards.</p></div>
     <div className="hq-top-actions">
       <div className="notification-wrapper">
         <button className="icon-button" type="button" onClick={()=>setNotifications(v=>!v)}>♢</button>
         {notifications && <div className="notification-menu"><h3>Quest Notifications</h3><div><strong>New Quest</strong><p>A new wellness quest is available.</p></div><div><strong>Reward Progress</strong><p>Keep going to unlock your next voucher.</p></div></div>}
       </div>
       <button className="icon-button" type="button" aria-label="Settings" onClick={()=>setSettingsOpen(true)}>⚙</button>
       <div className="hq-avatar">{profile.name.split(" ").slice(0,2).map(part=>part[0]).join("")}</div>
     </div>
   </header>

   <section className="hq-hero">
     <div><span className="hq-kicker">WELLNESS REWARDS</span><h2>Build healthier habits one quest at a time.</h2><p>Complete activities, build your streak and work toward campus wellness rewards.</p></div>
     <div className="hq-score-card"><small>POINTS EARNED</small><strong>{points}</strong><span>Current quest points</span></div>
   </section>

   <section className="hq-summary-grid">
     <article><span>🔥</span><div><small>Current Streak</small><strong>12 Days</strong></div></article>
     <article><span>✓</span><div><small>Completed</small><strong>{quests.filter(q=>q.completed).length} Quests</strong></div></article>
     <article><span>🎟</span><div><small>Next Reward</small><strong>R100 Voucher</strong></div></article>
   </section>

   <div className="hq-section-heading">
     <div><h2>Available Quests</h2><p>Choose an activity and keep your wellness streak moving.</p></div>
     <div className="hq-filters">{["All","Daily","Fitness","Wellness","Nutrition"].map(item=><button key={item} className={filter===item?"active":""} type="button" onClick={()=>setFilter(item)}>{item}</button>)}</div>
   </div>

   <section className="quest-grid">
     {visible.map(q=><article className="quest-card" key={q.id}>
       <div className="quest-card-top"><span className="quest-category">{q.category}</span><span className="quest-reward">+{q.reward} pts</span></div>
       <h3>{q.title}</h3><p>{q.description}</p>
       <div className="quest-progress-label"><span>Progress</span><strong>{q.progress}%</strong></div>
       <div className="quest-progress"><div style={{width:`${q.progress}%`}}/></div>
       <div className="quest-actions"><button className="secondary-button" type="button" onClick={()=>setDetails(q)}>Details</button><button className="primary-button" type="button" disabled={q.completed} onClick={()=>complete(q.id)}>{q.completed?"Completed":"Mark Complete"}</button></div>
     </article>)}
   </section>

   <section className="hq-reward-banner"><div><small>YOUR NEXT MILESTONE</small><h2>2 more wellness check-ins to unlock your R100 food voucher.</h2></div><div className="reward-progress"><div/></div><strong>80%</strong></section>

   {settingsOpen && <div className="modal-backdrop" onMouseDown={()=>setSettingsOpen(false)}><section className="pulse-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><h2>Profile Settings</h2><button type="button" onClick={()=>setSettingsOpen(false)}>×</button></div><form onSubmit={e=>{e.preventDefault();if(!profile.name.trim()){window.alert("Name cannot be empty.");return;}setSettingsOpen(false);window.alert("Profile updated successfully.");}}><div className="modal-profile"><div className="hq-avatar hq-avatar-large">{profile.name.split(" ").slice(0,2).map(part=>part[0]).join("")}</div><h3>{profile.name}</h3><span>Medical ID: 88201-P</span></div><label>Full Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Email<input type="email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><label>Phone Number<input value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></label><label className="toggle-row"><input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)}/> Dark Mode</label><button className="primary-button" type="submit">Save Changes</button></form></section></div>}

   {details && <div className="modal-backdrop" onMouseDown={()=>setDetails(null)}><section className="pulse-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><h2>{details.title}</h2><button type="button" onClick={()=>setDetails(null)}>×</button></div><span className="quest-category">{details.category}</span><p>{details.description}</p><p><strong>Reward:</strong> +{details.reward} pts</p><p><strong>Current progress:</strong> {details.progress}%</p><button className="primary-button" type="button" disabled={details.completed} onClick={()=>{complete(details.id);setDetails(null)}}>{details.completed?"Already Completed":"Complete Quest"}</button></section></div>}
 </div>;
}
export default HealthQuest;
