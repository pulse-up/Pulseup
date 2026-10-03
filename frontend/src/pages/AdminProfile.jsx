import { useRef, useState } from 'react';
import AdminProfileAvatar from '../components/AdminProfileAvatar';
import AdminPhotoCropper from '../components/AdminPhotoCropper';
import {ADMIN_PHOTO_KEY,ADMIN_PROFILE_KEY,notifyAdminProfileChange} from '../components/adminProfileShared.js';
import { getStoredUser, getUserDisplayName } from '../utils/session';
import './AdminProfile.css';

function getInitialProfile(){
 const user=getStoredUser()||{};
 return {name:getUserDisplayName('Clinic Staff'),staff:user.staffNumber||'',phone:user.phoneNumber||'',email:user.email||'',address:'',qualification:'',institution:'',position:user.position||'',experience:''};
}

export default function AdminProfile(){
 const [profile,setProfile]=useState(()=>{try{return {...getInitialProfile(),...JSON.parse(localStorage.getItem(ADMIN_PROFILE_KEY)||'{}')};}catch{return getInitialProfile();}});
 const [draft,setDraft]=useState(profile),[editing,setEditing]=useState(false);
 const [photo,setPhoto]=useState(()=>localStorage.getItem(ADMIN_PHOTO_KEY)||'');
 const [pendingPhoto,setPendingPhoto]=useState('');
 const fileRef=useRef(null);
 const select=e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;if(!f.type.startsWith('image/')){alert('Please select an image.');return;}if(f.size>5*1024*1024){alert('Please choose an image smaller than 5 MB.');return;}const r=new FileReader();r.onload=()=>setPendingPhoto(String(r.result));r.readAsDataURL(f);};
 const savePhoto=data=>{setPhoto(data);localStorage.setItem(ADMIN_PHOTO_KEY,data);setPendingPhoto('');notifyAdminProfileChange();};
 const removePhoto=()=>{setPhoto('');localStorage.removeItem(ADMIN_PHOTO_KEY);notifyAdminProfileChange();};
 const save=e=>{e.preventDefault();if(!draft.name.trim()){alert('Full name is required.');return;}setProfile(draft);localStorage.setItem(ADMIN_PROFILE_KEY,JSON.stringify(draft));notifyAdminProfileChange();setEditing(false);alert('Profile updated successfully.');};

 return <div className="admin-profile-page">
  <section className="admin-profile-hero"><div className="admin-profile-person"><AdminProfileAvatar photo={photo} name={profile.name} size="large" editable onClick={()=>fileRef.current?.click()}/><input ref={fileRef} type="file" accept="image/*" hidden onChange={select}/><div><h2>{profile.name}</h2><span className="active-badge">Active</span><p>{profile.position||'Clinic staff'} • Campus Health Services</p></div></div><div className="admin-profile-actions">{photo&&<button onClick={removePhoto}>Remove Photo</button>}<button onClick={()=>{setDraft(profile);setEditing(true);}}>Edit Profile</button></div></section>
  <div className="admin-profile-grid"><div>
   <section className="admin-card personal"><h3><span>♙</span> Personal Information</h3><div className="personal-grid"><div><small>Full Name</small><strong>{profile.name}</strong></div><div><small>Staff Number</small><strong>{profile.staff}</strong></div><div><small>Phone</small><strong>{profile.phone}</strong></div><div><small>Email</small><strong>{profile.email}</strong></div><div><small>Address</small><strong>{profile.address}</strong></div></div></section>
   <section className="admin-card activity"><h3><span>⌁</span> Recent Activity</h3><p>No recent activity yet.</p></section>
  </div><div>
   <section className="admin-card professional"><h3><span>☆</span> Professional Info</h3><p><small>Qualification</small><strong>{profile.qualification}</strong></p><p><small>Institution</small><strong>{profile.institution}</strong></p><p><small>Position</small><strong>{profile.position}</strong></p><p><small>Experience</small><strong>{profile.experience}</strong></p></section>
  </div></div>
  {editing&&<div className="admin-modal-backdrop" onMouseDown={()=>setEditing(false)}><section className="admin-edit-modal" onMouseDown={e=>e.stopPropagation()}><div className="admin-modal-head"><h2>Edit Profile</h2><button onClick={()=>setEditing(false)}>×</button></div><form onSubmit={save}><label>Full Name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Phone<input value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})}/></label><label>Email<input type="email" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})}/></label><label>Address<input value={draft.address} onChange={e=>setDraft({...draft,address:e.target.value})}/></label><label>Staff Number<input value={draft.staff} onChange={e=>setDraft({...draft,staff:e.target.value})}/></label><label>Position<input value={draft.position} onChange={e=>setDraft({...draft,position:e.target.value})}/></label><label>Qualification<input value={draft.qualification} onChange={e=>setDraft({...draft,qualification:e.target.value})}/></label><label>Institution<input value={draft.institution} onChange={e=>setDraft({...draft,institution:e.target.value})}/></label><label>Experience<input value={draft.experience} onChange={e=>setDraft({...draft,experience:e.target.value})}/></label><button className="admin-primary" type="submit">Save Changes</button></form></section></div>}
  {pendingPhoto&&<AdminPhotoCropper src={pendingPhoto} onCancel={()=>setPendingPhoto('')} onSave={savePhoto}/>}
 </div>;
}
