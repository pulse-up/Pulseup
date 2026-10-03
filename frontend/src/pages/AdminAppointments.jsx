import { useMemo, useState } from 'react';
import './AdminAppointments.css';

const seed=[];
const past=[];

export default function AdminAppointments(){
 const [appointments,setAppointments]=useState(seed),[showAll,setShowAll]=useState(false);
 const [review,setReview]=useState(null),[reschedule,setReschedule]=useState(null);
 const [newDate,setNewDate]=useState(''),[newTime,setNewTime]=useState('');
 const [decline,setDecline]=useState(null),[declineReason,setDeclineReason]=useState('');
 const [details,setDetails]=useState(null);
 const active=useMemo(()=>showAll?appointments:appointments.slice(0,2),[appointments,showAll]);

 const update=(id,changes)=>setAppointments(list=>list.map(a=>a.id===id?{...a,...changes}:a));
 const attend=a=>{update(a.id,{status:'Accepted'});setReview(null);alert(`${a.student}'s appointment has been accepted.`);};
 const openReschedule=a=>{setReview(null);setReschedule(a);};
 const openDecline=a=>{setReview(null);setDecline(a);setDeclineReason('');};
 const saveReschedule=e=>{e.preventDefault();if(!newDate||!newTime){alert('Please select a new date and time.');return;}update(reschedule.id,{date:`${newDate} at ${newTime}`,status:'Rescheduled'});setReschedule(null);setNewDate('');setNewTime('');alert('Appointment rescheduled successfully.');};
 const saveDecline=e=>{e.preventDefault();if(!declineReason.trim()){alert('Please provide a reason for declining this appointment.');return;}update(decline.id,{status:'Declined',declineReason:declineReason.trim()});setDecline(null);setDeclineReason('');alert('Appointment declined.');};

 return <div className="admin-appointments-page">
    <div className="admin-appointment-grid">
   <section className="admin-active-section"><div className="admin-section-heading"><div><h2><span>▣</span> Active Appointments</h2><small className="appointment-review-hint">Review each booking before making a decision.</small></div><button onClick={()=>setShowAll(v=>!v)}>{showAll?'Show Less':'View All →'}</button></div>
    {!active.length&&<p className="admin-empty">No active appointments.</p>}
    {active.map(a=><article className="admin-appointment-card" key={a.id}><div className="appointment-info"><span className="appointment-calendar">▣</span><div><strong>{a.title}</strong><small>{a.date}</small><em className={`appointment-state ${a.status.toLowerCase().replace(/\s/g,'-')}`}>{a.status}</em></div></div><div className="admin-appointment-actions review-only"><button onClick={()=>setReview(a)}>Review Appointment</button></div></article>)}
   </section>
  </div>

  <section className="admin-past-section"><div className="admin-section-heading"><h2><span>◴</span> Past Consultations</h2></div><div className="admin-past-card"><div className="admin-table-wrap"><table><thead><tr><th>Consultation Type</th><th>Staff / Clinic</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{!past.length&&<tr><td colSpan="5">No past consultations yet.</td></tr>}{past.map(p=><tr key={p.id}><td><strong>{p.type}</strong><small>{p.unit}</small></td><td>{p.staff}</td><td>{p.date}</td><td><span className={`consult-status ${p.status.toLowerCase().replace('-','')}`}>{p.status}</span></td><td><button className="details-btn" onClick={()=>setDetails(p)}>Details</button></td></tr>)}</tbody></table></div></div></section>

  {review&&<div className="admin-modal-backdrop" onMouseDown={()=>setReview(null)}><section className="appointment-review-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><div><h2>Appointment Request</h2><p>Review the student's booking information before responding.</p></div><button onClick={()=>setReview(null)}>×</button></div>
   <div className="review-summary"><div><small>Appointment</small><strong>{review.title}</strong></div><span className="review-status">{review.status}</span></div>
   <div className="review-grid"><div><small>Student Name</small><strong>{review.student}</strong></div><div><small>Student ID</small><strong>{review.studentId}</strong></div><div><small>Email</small><strong>{review.email}</strong></div><div><small>Phone</small><strong>{review.phone}</strong></div><div><small>Clinic / Service</small><strong>{review.clinic}</strong></div><div><small>Requested Date & Time</small><strong>{review.date}</strong></div><div className="review-wide"><small>Reason for Appointment</small><p>{review.reason}</p></div><div className="review-wide"><small>Additional Information</small><p>{review.notes||'No additional information provided.'}</p></div>{review.declineReason&&<div className="review-wide decline-note"><small>Decline Reason</small><p>{review.declineReason}</p></div>}</div>
   <div className="review-decision-actions"><button className="decline" onClick={()=>openDecline(review)}>Decline</button><button className="reschedule" onClick={()=>openReschedule(review)}>Reschedule</button><button className="attend" onClick={()=>attend(review)}>Attend</button></div>
  </section></div>}

  {reschedule&&<div className="admin-modal-backdrop" onMouseDown={()=>setReschedule(null)}><section className="appointment-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><div><h2>Reschedule Appointment</h2><p>{reschedule.student} • {reschedule.title}</p></div><button onClick={()=>setReschedule(null)}>×</button></div><form onSubmit={saveReschedule}><label>New Date<input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}/></label><label>New Time<input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)}/></label><div className="appointment-modal-actions"><button type="button" onClick={()=>setReschedule(null)}>Cancel</button><button type="submit">Save Reschedule</button></div></form></section></div>}

  {decline&&<div className="admin-modal-backdrop" onMouseDown={()=>setDecline(null)}><section className="appointment-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><div><h2>Decline Appointment</h2><p>{decline.student} • {decline.title}</p></div><button onClick={()=>setDecline(null)}>×</button></div><form onSubmit={saveDecline}><label>Reason for declining<textarea rows="4" placeholder="Explain why this appointment cannot be accepted..." value={declineReason} onChange={e=>setDeclineReason(e.target.value)}/></label><p className="decline-help">This reason can later be sent to the student when the backend notification workflow is connected.</p><div className="appointment-modal-actions decline-modal-actions"><button type="button" onClick={()=>setDecline(null)}>Cancel</button><button type="submit">Confirm Decline</button></div></form></section></div>}

  {details&&<div className="admin-modal-backdrop" onMouseDown={()=>setDetails(null)}><section className="appointment-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><h2>Consultation Details</h2><button onClick={()=>setDetails(null)}>×</button></div><div className="consult-details"><p><span>Consultation</span><strong>{details.type}</strong></p><p><span>Unit</span><strong>{details.unit}</strong></p><p><span>Staff / Clinic</span><strong>{details.staff}</strong></p><p><span>Date</span><strong>{details.date}</strong></p><p><span>Status</span><strong>{details.status}</strong></p></div><button className="close-details" onClick={()=>setDetails(null)}>Close</button></section></div>}
 </div>;
}
