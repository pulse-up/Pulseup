export const ADMIN_PROFILE_KEY='pulseupAdminProfile';
export const ADMIN_PHOTO_KEY='pulseupAdminPhoto';
export const ADMIN_PHOTO_EVENT='pulseup-admin-profile-change';

export function adminInitials(name=''){
 const clean=name.replace(/^Dr\.?\s+/i,'').trim().split(/\s+/).filter(Boolean);
 if(!clean.length)return '?';
 return (clean.length>1?clean[0][0]+clean[clean.length-1][0]:clean[0][0]).toUpperCase();
}
export function notifyAdminProfileChange(){window.dispatchEvent(new Event(ADMIN_PHOTO_EVENT));}
