import { adminInitials } from "./adminProfileShared";
import "../../styles/components/AdminProfileAvatar.css";

export default function AdminProfileAvatar({photo,name,size="mini",editable=false,onClick}){
 return <button type="button" className={`admin-shared-avatar ${size} ${editable?"editable":""}`} onClick={onClick} aria-label={editable?"Edit profile photo":"Admin profile"}>
  {photo?<img src={photo} alt="Admin profile"/>:<span>{adminInitials(name)}</span>}
  {editable&&<i>✎</i>}
 </button>
}
