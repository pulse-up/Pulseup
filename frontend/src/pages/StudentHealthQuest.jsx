import { useEffect, useMemo, useState } from 'react';
import './StudentHealthQuest.css';
import api from '../api/api';
import { USE_BACKEND } from '../constants/appConfig';
import { getErrorMessage, toArray } from '../utils/appointments';

// Health quests are created by administrators; students can only view them.
function HealthQuest() {
 const [quests,setQuests]=useState([]);
 const [loading,setLoading]=useState(USE_BACKEND);
 const [message,setMessage]=useState(USE_BACKEND?'':'Health quests need the PulseUp backend. Set VITE_USE_BACKEND=true to see them.');
 const [filter,setFilter]=useState('All');
 const [details,setDetails]=useState(null);

 useEffect(()=>{
  if(!USE_BACKEND)return undefined;
  let cancelled=false;
  api.get('/health-quests')
   .then(response=>{if(!cancelled)setQuests(toArray(response.data));})
   .catch(error=>{if(!cancelled)setMessage(getErrorMessage(error,'Health quests could not be loaded.'));})
   .finally(()=>{if(!cancelled)setLoading(false);});
  return()=>{cancelled=true;};
 },[]);

 const categories=useMemo(()=>['All',...new Set(quests.map(q=>q.category))],[quests]);
 const visible=useMemo(()=>filter==='All'?quests:quests.filter(q=>q.category===filter),[filter,quests]);

 return <div className="healthquest-page">
   <section className="hq-hero">
     <div><h2>Build healthier habits one quest at a time.</h2><p>These wellness quests are set by the clinic team. Pick one and keep your habits going.</p></div>
   </section>

   <div className="hq-section-heading">
     <div><h2>Available Quests</h2><p>{loading?'Loading quests...':`${quests.length} ${quests.length===1?'quest':'quests'} available`}</p></div>
     {categories.length>2&&<div className="hq-filters">{categories.map(item=><button key={item} className={filter===item?'active':''} type="button" onClick={()=>setFilter(item)}>{item}</button>)}</div>}
   </div>

   {message&&<p className="empty-message" role="status">{message}</p>}
   {!loading&&!message&&visible.length===0&&<p className="empty-message">No health quests available yet. Check back soon.</p>}

   <section className="quest-grid">
     {visible.map(q=><article className="quest-card" key={q.questId}>
       <div className="quest-card-top"><span className="quest-category">{q.category}</span></div>
       <h3>{q.title}</h3><p>{q.description}</p>
       <div className="quest-actions"><button className="pu-secondary-button" type="button" onClick={()=>setDetails(q)}>Details</button></div>
     </article>)}
   </section>

   {details&&<div className="modal-backdrop" onMouseDown={()=>setDetails(null)}><section className="pulse-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><h2>{details.title}</h2><button type="button" aria-label="Close" onClick={()=>setDetails(null)}>×</button></div><span className="quest-category">{details.category}</span><p>{details.description}</p><button className="pu-primary-button" type="button" onClick={()=>setDetails(null)}>Close</button></section></div>}
 </div>;
}
export default HealthQuest;
