import { useState } from 'react';
import ProfileAvatar from './ProfileAvatar';
import StudentPhotoCropper from './StudentPhotoCropper';
import './ProfileSettingsModal.css';

export default function ProfileSettingsModal({ open, onClose, profile, setProfile, image, setImage, darkMode, setDarkMode }) {
  const [pendingImage,setPendingImage]=useState('');
  if (!open && !pendingImage) return null;
  const save=(event)=>{event.preventDefault();if(!profile.name.trim()){window.alert('Full name cannot be empty.');return;}localStorage.setItem('pulseupStudentProfile',JSON.stringify(profile));if(image)localStorage.setItem('pulseupStudentProfileImage',image);else localStorage.removeItem('pulseupStudentProfileImage');window.alert('Profile updated successfully.');onClose();};
  const removePhoto=()=>{setImage('');localStorage.removeItem('pulseupStudentProfileImage');};
  return <>
   {open&&<div className="profile-modal-backdrop" onMouseDown={onClose}><section className="profile-settings-modal" onMouseDown={e=>e.stopPropagation()}><div className="profile-modal-header"><div><h2>Profile Settings</h2><p>Manage your personal details and profile photo.</p></div><button type="button" onClick={onClose}>×</button></div>
    <form onSubmit={save}><div className="profile-photo-editor"><ProfileAvatar name={profile.name} image={image} editable size="large" onImageChange={setPendingImage}/><div><strong>Profile photo</strong><p>Click the profile icon to upload or change your image. You can crop, reposition and zoom it before saving.</p><div className="photo-actions"><span>Click avatar to {image?'change':'upload'}</span>{image&&<button type="button" className="remove-photo" onClick={removePhoto}>Remove image</button>}</div></div></div>
    <label>Full Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Email<input type="email" placeholder="Enter email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><label>Phone Number<input placeholder="Enter number" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></label><label className="profile-toggle"><input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)}/> Dark Mode</label>
    <div className="profile-modal-footer"><button type="button" className="profile-cancel" onClick={onClose}>Cancel</button><button type="submit" className="profile-save">Save Changes</button></div></form></section></div>}
   {pendingImage&&<StudentPhotoCropper source={pendingImage} onCancel={()=>setPendingImage('')} onSave={v=>{setImage(v);setPendingImage('');}}/>}
  </>;
}
