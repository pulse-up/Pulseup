import { useEffect, useRef, useState } from 'react';
import './AdminPhotoCropper.css';

export default function AdminPhotoCropper({src,onCancel,onSave}){
 const canvasRef=useRef(null);
 const [zoom,setZoom]=useState(1);
 const [pos,setPos]=useState({x:0,y:0});
 const [drag,setDrag]=useState(null);
 const [img,setImg]=useState(null);

 useEffect(()=>{const i=new Image();i.onload=()=>{setImg(i);setZoom(1);setPos({x:0,y:0});};i.src=src;},[src]);

 useEffect(()=>{
  if(!img)return;
  const c=canvasRef.current;
  if(!c)return;
  const S=320,base=Math.max(S/img.width,S/img.height),scale=base*zoom,w=img.width*scale,h=img.height*scale;
  const ctx=c.getContext('2d');
  ctx.clearRect(0,0,S,S);
  ctx.drawImage(img,(S-w)/2+pos.x,(S-h)/2+pos.y,w,h);
 },[img,zoom,pos]);

 function metrics(){
  if(!img)return null;
  const S=320,base=Math.max(S/img.width,S/img.height),scale=base*zoom;
  return {S,w:img.width*scale,h:img.height*scale};
 }

 function clamp(p){
  const m=metrics();if(!m)return p;
  const maxX=Math.max(0,(m.w-m.S)/2),maxY=Math.max(0,(m.h-m.S)/2);
  return {x:Math.max(-maxX,Math.min(maxX,p.x)),y:Math.max(-maxY,Math.min(maxY,p.y))};
 }

 function move(e){
  if(!drag)return;
  const p=clamp({x:drag.x+(e.clientX-drag.cx),y:drag.y+(e.clientY-drag.cy)});
  setPos(p);
 }

 function changeZoom(v){
  setZoom(v);
  setTimeout(()=>setPos(p=>clamp(p)),0);
 }

 function save(){
  const source=canvasRef.current;
  const out=document.createElement('canvas');out.width=512;out.height=512;
  out.getContext('2d').drawImage(source,0,0,512,512);
  onSave(out.toDataURL('image/jpeg',0.88));
 }

 return <div className="admin-modal-backdrop" onMouseDown={onCancel}>
  <section className="admin-crop-modal" onMouseDown={e=>e.stopPropagation()}>
   <div className="admin-modal-head"><div><h2>Adjust Profile Photo</h2><p>Drag the image and zoom until the part you want is inside the circle.</p></div><button onClick={onCancel}>×</button></div>
   <div className="admin-crop-stage" onPointerMove={move} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)} onPointerLeave={()=>setDrag(null)} onPointerDown={e=>{e.currentTarget.setPointerCapture?.(e.pointerId);setDrag({cx:e.clientX,cy:e.clientY,x:pos.x,y:pos.y});}}>
    <canvas ref={canvasRef} width="320" height="320"/>
    <div className="admin-crop-mask"/>
   </div>
   <label className="admin-zoom">Zoom <input type="range" min="1" max="3" step=".01" value={zoom} onChange={e=>changeZoom(Number(e.target.value))}/></label>
   <div className="admin-crop-actions"><button onClick={onCancel}>Cancel</button><button onClick={save} disabled={!img}>Save Photo</button></div>
  </section>
 </div>;
}