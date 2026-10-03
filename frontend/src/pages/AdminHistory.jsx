import { useMemo, useState } from 'react';
import './AdminHistory.css';

const records=[];

export default function AdminHistory(){
 const [search,setSearch]=useState('');
 const [status,setStatus]=useState('Status');
 const [date,setDate]=useState('');
 const [selected,setSelected]=useState(null);

 const filtered=useMemo(()=>records.filter(r=>{
   const q=search.trim().toLowerCase();
   const searchMatch=!q||[r.type,r.category,r.doctor,r.status,r.date].some(v=>v.toLowerCase().includes(q));
   const statusMatch=status==='Status'||r.status===status;
   const dateMatch=!date||r.iso===date;
   return searchMatch&&statusMatch&&dateMatch;
 }),[search,status,date]);

 const clear=()=>{setSearch('');setStatus('Status');setDate('');};

 return <div className="admin-history-page">
  <div className="ah-controls">
   <div><h2>Consultation History</h2><p>Review previous clinic consultations and outcomes.</p></div>
   <div className="ah-filters"><input type="search" placeholder="Search history..." value={search} onChange={e=>setSearch(e.target.value)}/><select value={status} onChange={e=>setStatus(e.target.value)}><option>Status</option><option>Attended</option><option>Cancelled</option><option>No-show</option></select><input type="date" value={date} onChange={e=>setDate(e.target.value)}/>{(search||status!=='Status'||date)&&<button onClick={clear}>Clear</button>}</div>
  </div>

  <section className="ah-table-panel"><div className="ah-table-scroll"><table><thead><tr><th>Consultation</th><th>Doctor / Clinic</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
   {filtered.map(r=><tr key={r.id}><td><strong>{r.type}</strong><small>{r.category}</small></td><td>{r.doctor}</td><td>{r.date}</td><td><span className={`ah-status ${r.status.toLowerCase().replace('-','')}`}>{r.status}</span></td><td><button className="ah-view" onClick={()=>setSelected(r)}>View</button></td></tr>)}
   {!filtered.length&&<tr><td className="ah-empty" colSpan="5">No consultation history matches the selected filters.</td></tr>}
  </tbody></table></div></section>

  <footer className="ah-footer">© 2026 PulseUp Clinical System</footer>

  {selected&&<div className="admin-modal-backdrop" onMouseDown={()=>setSelected(null)}><section className="ah-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><h2>Consultation Details</h2><button onClick={()=>setSelected(null)}>×</button></div><div className="ah-detail-grid">
   <label>Consultation Type<input readOnly value={selected.type}/></label>
   <label>Category<input readOnly value={selected.category}/></label>
   <label>Doctor / Clinic<input readOnly value={selected.doctor}/></label>
   <label>Consultation Date<input readOnly value={selected.date}/></label>
   <label>Status<input readOnly value={selected.status}/></label>
   <label className="ah-notes">Notes<textarea rows="4" readOnly value={selected.notes}/></label>
  </div><button className="ah-close" onClick={()=>setSelected(null)}>Close</button></section></div>}
 </div>;
}
