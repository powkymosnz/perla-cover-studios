import {layouts,grades,formats,drawCover,panelPath,panelBounds,makeInkPhoto} from './cover.js';
const $=id=>document.getElementById(id);
const canvas=$('cover'),photos=[];
const defaults=()=>({layout:0,grade:0,strength:65,ink:true,frame:true,format:'square',title:'LA PERLA',subtitle:'La Perla',tagline:'A coastal crime story.',badge:'SUMMER 2026',selected:2,panels:Array.from({length:7},(_,i)=>({photo:[2,1,0,3,2,0,1][i],zoom:1,x:i===2?.62:.5,y:.45}))});
let state=defaults(),drag=null,pending=false,ready=false,outlineTimer;
function highlightPanel(){
  const outline=$('panel-outline'),r=canvas.getBoundingClientRect(),parent=$('stage').getBoundingClientRect();
  outline.style.left=`${r.left-parent.left-1}px`;outline.style.top=`${r.top-parent.top-1}px`;outline.style.width=`${r.width}px`;outline.style.height=`${r.height}px`;
  outline.style.clipPath=`polygon(${layouts[state.layout].panels[state.selected].map(([x,y])=>`${x*100}% ${y*100}%`).join(',')})`;outline.classList.add('visible');
  clearTimeout(outlineTimer);outlineTimer=setTimeout(()=>outline.classList.remove('visible'),1800);
}
const status=text=>$('status').textContent=text;
export function loadImage(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('This file could not be decoded. Try a JPG, PNG or WebP.'));img.src=url;});}
function render(){if(!ready)return;const [w,h]=formats[state.format];if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}drawCover(canvas,state,photos);$('export-dimensions').textContent=`${w} × ${h}`;}
function scheduleRender(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;render();});}
function setPressed(parent,index){Array.from(parent.children).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
function syncCrop(){const p=state.panels[state.selected];$('zoom').value=p.zoom;$('zoom-value').value=`${p.zoom.toFixed(1)}×`;$('panel').value=state.selected;setPressed($('library'),p.photo);canvas.setAttribute('aria-label',`Cover preview. Panel ${state.selected+1} selected. Drag to crop, scroll to zoom, or use arrow keys.`);}
function syncPanels(){const count=layouts[state.layout].panels.length;state.selected=Math.min(state.selected,count-1);$('panel').replaceChildren(...Array.from({length:count},(_,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`Panel ${String(i+1).padStart(2,'0')}`;return o;}));syncCrop();}
function syncUI(){setPressed($('layouts'),state.layout);setPressed($('grades'),state.grade);for(const id of ['title','subtitle','tagline','badge','strength'])$(id).value=state[id];for(const id of ['ink','frame'])$(id).checked=state[id];$('strength-value').value=`${state.strength}%`;document.querySelectorAll('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===state.format)));syncPanels();render();}
function buildLibrary(){
  $('library').replaceChildren(...photos.map((p,i)=>{const b=document.createElement('button');b.className='photo-thumb';b.title=`Use ${p.name} in selected panel`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed','false');const img=document.createElement('img');img.src=p.src;img.alt=p.name;b.append(img);b.addEventListener('click',()=>{Object.assign(state.panels[state.selected],{photo:i,zoom:1,x:.5,y:.5});syncCrop();render();status(`${p.name} added to panel ${state.selected+1}. Drag the photo to frame it.`);});return b;}));$('photo-count').textContent=`${photos.length} photos`;syncCrop();
}
layouts.forEach((l,i)=>{const b=document.createElement('button');b.className='layout';b.setAttribute('aria-label',`${l.name}, ${l.panels.length} panels`);b.setAttribute('aria-pressed',String(i===0));const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 65');l.panels.forEach(points=>{const polygon=document.createElementNS(svg.namespaceURI,'polygon');polygon.setAttribute('points',points.map(([x,y])=>`${x*100},${y*65}`).join(' '));svg.append(polygon);});const label=document.createElement('span');label.textContent=l.name;b.append(svg,label);b.addEventListener('click',()=>{state.layout=i;syncPanels();setPressed($('layouts'),i);render();status(`${l.name} · ${l.panels.length} panels. Select any panel to edit its photo.`);});$('layouts').append(b);});
grades.forEach((g,i)=>{const b=document.createElement('button');b.className='grade';b.style.setProperty('--swatch',g.swatch);b.setAttribute('aria-pressed',String(i===0));const dot=document.createElement('i');dot.setAttribute('aria-hidden','true');const name=document.createElement('span');name.textContent=g.name;b.append(dot,name);b.addEventListener('click',()=>{state.grade=i;setPressed($('grades'),i);render();});$('grades').append(b);});
for(const id of ['title','subtitle','tagline','badge'])$(id).addEventListener('input',e=>{state[id]=e.target.value;scheduleRender();});
for(const id of ['frame','ink'])$(id).addEventListener('change',e=>{state[id]=e.target.checked;render();});
$('strength').addEventListener('input',e=>{state.strength=Number(e.target.value);$('strength-value').value=`${state.strength}%`;scheduleRender();});
$('panel').addEventListener('change',e=>{state.selected=Number(e.target.value);syncCrop();highlightPanel();status(`Panel ${state.selected+1} selected. Choose a photo or drag to reframe.`);});
$('zoom').addEventListener('input',e=>{state.panels[state.selected].zoom=Number(e.target.value);syncCrop();scheduleRender();});
$('center').addEventListener('click',()=>{Object.assign(state.panels[state.selected],{x:.5,y:.5,zoom:1});syncCrop();render();status('Selected crop centered.');});
$('fill-all').addEventListener('click',()=>{const photo=state.panels[state.selected].photo;state.panels.forEach(p=>Object.assign(p,{photo,zoom:1,x:.5,y:.5}));render();status('Photo applied to every panel. Each crop can be adjusted independently.');});
document.querySelectorAll('[data-format]').forEach(b=>b.addEventListener('click',()=>{state.format=b.dataset.format;syncUI();status(`${b.textContent.trim()} format ready. Crops adapt automatically.`);}));
$('reset').addEventListener('click',()=>{state=defaults();syncUI();status('Original LA PERLA composition restored. Your imported photos are still in the library.');});
function canvasPoint(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
function hitPanel(point){return layouts[state.layout].panels.findIndex(p=>canvas.getContext('2d').isPointInPath(panelPath(p,canvas.width,canvas.height),point.x,point.y));}
canvas.addEventListener('pointerdown',e=>{if(!ready)return;const point=canvasPoint(e),i=hitPanel(point);if(i<0)return;state.selected=i;syncCrop();highlightPanel();const p=state.panels[i];drag={start:point,x:p.x,y:p.y,bounds:panelBounds(layouts[state.layout].panels[i],canvas.width,canvas.height)};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');status(`Cropping panel ${i+1} · ${photos[p.photo].name}`);});
const clamp=n=>Math.min(1,Math.max(0,n));
canvas.addEventListener('pointermove',e=>{if(!drag)return;const point=canvasPoint(e),p=state.panels[state.selected];p.x=clamp(drag.x-(point.x-drag.start.x)/drag.bounds.w);p.y=clamp(drag.y-(point.y-drag.start.y)/drag.bounds.h);scheduleRender();});
function endDrag(){drag=null;canvas.classList.remove('dragging');}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
canvas.addEventListener('wheel',e=>{if(!ready)return;e.preventDefault();const p=state.panels[state.selected];p.zoom=Math.max(1,Math.min(3,p.zoom-e.deltaY*.0015));syncCrop();scheduleRender();},{passive:false});
canvas.addEventListener('keydown',e=>{const moves={ArrowLeft:[.025,0],ArrowRight:[-.025,0],ArrowUp:[0,.025],ArrowDown:[0,-.025]};if(!moves[e.key])return;e.preventDefault();const p=state.panels[state.selected],d=moves[e.key];p.x=clamp(p.x+d[0]);p.y=clamp(p.y+d[1]);render();});
function readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Could not read that photo.'));r.readAsDataURL(file);});}
async function importPhotos(files){
  if(!ready)return;let added=0,errors=0;const button=$('upload');button.disabled=true;
  for(const file of files){
    if(!file.type.startsWith('image/')){errors++;continue;}
    if(file.size>35*1024*1024){errors++;continue;}
    try{status(`Reading ${file.name} locally…`);const src=await readFile(file),img=await loadImage(src);const ink=makeInkPhoto(img);photos.push({name:file.name,img,ink,src});if(added===0)Object.assign(state.panels[state.selected],{photo:photos.length-1,zoom:1,x:.5,y:.5});added++;}catch{errors++;}
  }
  button.disabled=false;buildLibrary();render();status(added?`${added} photo${added>1?'s':''} added locally.${errors?' Some unsupported or oversized files were skipped.':''} Select a thumbnail to place it.`:'Could not open those files. Choose JPG, PNG or WebP under 35 MB.');
}
$('upload').addEventListener('click',()=>$('photo').click());$('photo').addEventListener('change',async e=>{await importPhotos(Array.from(e.target.files));e.target.value='';});
for(const type of ['dragover','dragleave','drop'])$('upload').addEventListener(type,e=>{e.preventDefault();$('upload').classList.toggle('dragover',type==='dragover');if(type==='drop')importPhotos(Array.from(e.dataTransfer.files));});
export async function exportCover(){
  if(!ready)return;const button=$('export');button.disabled=true;status('Rendering your cover at full resolution…');
  try{await document.fonts.ready;const output=document.createElement('canvas');[output.width,output.height]=formats[state.format];drawCover(output,state,photos);const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG encoding failed');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`la-perla-${output.width}x${output.height}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status(`Saved ${link.download} · Your story, ready to share.`);return blob;}catch(error){status(`Export failed: ${error.message}. Please try again.`);}finally{button.disabled=false;}
}
$('export').addEventListener('click',exportCover);
async function start(){
  $('export').disabled=true;$('upload').disabled=true;status('Setting the scene…');
  try{
    await Promise.all([document.fonts.load('32px Anton'),document.fonts.load('32px Kaushan')]);
    const samples=[['salsa','Salsa nights'],['domino','Domino club'],['speedboat','Ocean escape'],['ferris','Neon boardwalk']];
    for(const [file,name] of samples){const src=`./samples/${file}.webp`,img=await loadImage(src);photos.push({src,img,ink:makeInkPhoto(img),name});}
    ready=true;buildLibrary();const query=new URLSearchParams(location.search);if(formats[query.get('format')])state.format=query.get('format');syncUI();$('export').disabled=false;$('upload').disabled=false;status('Your next main character moment starts here.');window.__studioReady=true;
  }catch(error){status(`Could not start the studio: ${error.message}. Reload to try again.`);}
}
start();
