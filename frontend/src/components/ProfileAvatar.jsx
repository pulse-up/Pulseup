import { useRef } from 'react';
import './ProfileAvatar.css';

 function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileAvatar({ name, image, editable = false, size = 'normal', onImageChange }) {
  const inputRef = useRef(null);
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.alert('Please select an image file.'); event.target.value=''; return; }
    if (file.size > 5 * 1024 * 1024) { window.alert('Please select an image smaller than 5 MB.'); event.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = () => onImageChange?.(reader.result);
    reader.readAsDataURL(file);
    event.target.value='';
  };
  return <div className={`profile-avatar-wrap ${size}`}>
    <button type="button" className={`profile-avatar ${editable ? 'editable' : ''}`} onClick={()=>editable&&inputRef.current?.click()} title={editable?'Change profile photo':'Profile'}>
      {image ? <img src={image} alt={`${name} profile`} /> : <span>{getInitials(name)}</span>}
      {editable && <span className="avatar-edit-badge">✎</span>}
    </button>
    {editable&&<input ref={inputRef} className="avatar-file-input" type="file" accept="image/*" onChange={selectImage}/>}
  </div>;
}
