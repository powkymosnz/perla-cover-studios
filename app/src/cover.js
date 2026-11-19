// Original polygon compositions and a shared, resolution-independent cover renderer.
const rect = (x, y, r, b) => [[x,y],[r,y],[r,b],[x,b]];
export const layouts = [
  {name:'Coastline', panels:[rect(0,0,.27,.5),rect(0,.5,.27,1),rect(.27,0,.74,1),rect(.74,0,1,.5),rect(.74,.5,1,1)]},
  {name:'After hours', panels:[rect(0,0,.34,.48),rect(.34,0,.69,.48),rect(.69,0,1,.48),rect(0,.48,.34,1),rect(.34,.48,.69,1),rect(.69,.48,1,1)]},
  {name:'Seven sins', panels:[rect(0,0,.28,.34),rect(0,.34,.28,.67),rect(0,.67,.28,1),rect(.28,0,.73,1),rect(.73,0,1,.34),rect(.73,.34,1,.67),rect(.73,.67,1,1)]},
  {name:'Headliner', panels:[rect(0,0,.70,.73),rect(.7,0,1,.36),rect(.7,.36,1,.73),rect(0,.73,.38,1),rect(.38,.73,1,1)]},
  {name:'Crossfire', panels:[[[0,0],[.36,0],[.28,.52],[0,.43]],[[0,.43],[.28,.52],[.37,1],[0,1]],[[.36,0],[.79,0],[.67,1],[.37,1],[.28,.52]],[[.79,0],[1,0],[1,.57],[.73,.48]],[[.73,.48],[1,.57],[1,1],[.67,1]]]},
  {name:'Heatwave', panels:[rect(0,0,1,.26),[[0,.26],[.53,.26],[.42,.75],[0,.75]],[[.53,.26],[1,.26],[1,.75],[.42,.75]],rect(0,.75,.47,1),rect(.47,.75,1,1)]}
];
export const grades = [
  {name:'Sunset',colors:['#56225e','#ff8668'],filter:'saturate(1.45) contrast(1.12)',swatch:'linear-gradient(135deg,#7c2b8d,#ff9371)'},
  {name:'Golden hour',colors:['#7c432d','#ffcb68'],filter:'sepia(.25) saturate(1.3) contrast(1.12)',swatch:'linear-gradient(135deg,#b97948,#ffe1a0)'},
  {name:'Neon violet',colors:['#402775','#ed5fb9'],filter:'saturate(1.6) contrast(1.2)',swatch:'linear-gradient(135deg,#493790,#e781da)'},
  {name:'Perla',colors:['#075860','#f1ba66'],filter:'saturate(1.3) contrast(1.13)',swatch:'linear-gradient(135deg,#2d9b9c,#edc08b)'},
  {name:'Halftone',colors:['#202344','#ffb79b'],filter:'saturate(.8) contrast(1.35)',swatch:'radial-gradient(#373043 1px,transparent 1px) 0 0/4px 4px,#f4b09d'},
  {name:'Rose noir',colors:['#352d4a','#f195a0'],filter:'saturate(.45) contrast(1.3)',swatch:'linear-gradient(135deg,#393147,#dc8fa2)'}
];
export const formats={square:[1080,1080],portrait:[1080,1350],landscape:[1920,1080]};
export function panelPath(points,w,h){const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x*w,y*h):p.moveTo(x*w,y*h));p.closePath();return p;}
export function panelBounds(points,w,h){const xs=points.map(p=>p[0]*w),ys=points.map(p=>p[1]*h);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}

// Edge-aware cel treatment is computed once per local image, never on a server.
export function makeInkPhoto(img){
  const c=document.createElement('canvas');const scale=Math.min(1,1100/img.naturalWidth,1100/img.naturalHeight);
  c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,c.width,c.height);
  const data=ctx.getImageData(0,0,c.width,c.height),src=new Uint8ClampedArray(data.data),w=c.width,h=c.height;
  const lum=i=>src[i]*.299+src[i+1]*.587+src[i+2]*.114;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=(y*w+x)*4;
    const edge=Math.abs(lum(i-4)-lum(i+4))+Math.abs(lum(i-w*4)-lum(i+w*4));
    const outline=edge>65?Math.max(.35,1-(edge-65)/170):1;
    for(let k=0;k<3;k++){
      const smooth=(src[i+k]*4+src[i-4+k]+src[i+4+k]+src[i-w*4+k]+src[i+w*4+k])/8;
      const cel=Math.round(smooth/26)*26;
      data.data[i+k]=(smooth*.45+cel*.55)*outline;
    }
  }
  ctx.putImageData(data,0,0);return c;
}
function fitFont(ctx,text,size,maxWidth,family){ctx.font=`${size}px ${family}`;const width=ctx.measureText(text).width;if(width>maxWidth)size*=maxWidth/width;ctx.font=`${size}px ${family}`;return size;}
function drawTitle(ctx,text,x,y,size,maxWidth,w,h){
  fitFont(ctx,text,size,maxWidth,'Anton');ctx.textAlign='center';ctx.lineJoin='round';
  ctx.strokeStyle='#140e20';ctx.lineWidth=h*.020;ctx.strokeText(text,x+w*.004,y+h*.009);
  ctx.fillStyle='#b34477';ctx.fillText(text,x+w*.004,y+h*.009);
  ctx.strokeStyle='#140e20';ctx.lineWidth=h*.012;ctx.strokeText(text,x,y);
  const cream=ctx.createLinearGradient(0,y-size,0,y);cream.addColorStop(0,'#fffbe1');cream.addColorStop(.65,'#fff3d6');cream.addColorStop(1,'#efb7b6');
  ctx.fillStyle=cream;ctx.fillText(text,x,y);
}
export function drawCover(canvas,state,photos){
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const layout=layouts[state.layout],grade=grades[state.grade],strength=state.strength/100;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#171020';ctx.fillRect(0,0,w,h);
  layout.panels.forEach((points,i)=>{
    const p=state.panels[i],photo=photos[p.photo%photos.length];if(!photo)return;
    const b=panelBounds(points,w,h),path=panelPath(points,w,h);
    ctx.save();ctx.clip(path);
    const img=state.ink?photo.ink:photo.img,iw=img.width,ih=img.height;
    const scale=Math.max(b.w/iw,b.h/ih)*p.zoom,pw=iw*scale,ph=ih*scale;
    ctx.filter=grade.filter;ctx.drawImage(img,b.x-(pw-b.w)*p.x,b.y-(ph-b.h)*p.y,pw,ph);ctx.filter='none';
    const tint=ctx.createLinearGradient(b.x,b.y+b.h,b.x+b.w*.6,b.y);
    tint.addColorStop(0,grade.colors[0]);tint.addColorStop(1,grade.colors[1]);
    ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=strength*.85;ctx.fillStyle=tint;ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.globalCompositeOperation='color';ctx.globalAlpha=strength*.22;ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    if(state.grade===4){ctx.fillStyle='#180e32';ctx.globalAlpha=.2;const d=Math.max(5,w/220);for(let y=b.y;y<b.y+b.h;y+=d)for(let x=b.x;x<b.x+b.w;x+=d){ctx.beginPath();ctx.arc(x,y,d*.17,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    const shade=ctx.createLinearGradient(0,h*.45,0,h);shade.addColorStop(0,'#18102000');shade.addColorStop(1,'#181020a0');ctx.fillStyle=shade;ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.restore();ctx.strokeStyle='#181020';ctx.lineWidth=Math.max(9,w*.008);ctx.lineJoin='miter';ctx.stroke(path);
  });
  const portrait=w/h<1,wide=w/h>1.5;
  const haze=ctx.createLinearGradient(0,h*.5,0,h*.99);haze.addColorStop(0,'#1c102a00');haze.addColorStop(.7,'#26103260');haze.addColorStop(1,'#1b1022bb');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
  // A restrained paper print texture gives every imported photograph the same finish.
  ctx.fillStyle='#ffe4ca';ctx.globalAlpha=.09;
  for(let i=0;i<1100;i++){const x=((i*3571)%997)/997*w,y=((i*2377)%991)/991*h;ctx.fillRect(x,y,Math.max(1,w/1000),Math.max(1,w/1000));}ctx.globalAlpha=1;
  const margin=w*.033;
  ctx.font=`${h*.014}px Arial`;const imprintWidth=ctx.measureText('A LA PERLA ORIGINAL').width+w*.024;
  ctx.fillStyle='#171020';ctx.fillRect(margin,h*.036,imprintWidth,h*.039);
  ctx.fillStyle='#f9e9d0';ctx.textAlign='left';ctx.fillText('A LA PERLA ORIGINAL',margin+w*.012,h*.061);
  if(state.badge){ctx.save();ctx.translate(w*.965,h*.056);ctx.rotate(.055);const bw=Math.max(w*.16,ctx.measureText(state.badge).width+w*.032);ctx.fillStyle='#f6c58a';ctx.fillRect(-bw,0,bw,h*.046);ctx.textAlign='center';ctx.fillStyle='#20132b';fitFont(ctx,state.badge,h*.015,bw*.88,'Arial');ctx.fillText(state.badge,-bw/2,h*.029);ctx.restore();}
  const title=state.title.trim().toUpperCase();const words=title.split(/\s+/);const split=!wide&&words.length>1;
  let subY=split?h*(portrait?.438:.38):h*.53,titleY=split?h*(portrait?.665:.62):h*.835;
  if(split){const cut=words.length>2?Math.ceil(words.length/2):1;drawTitle(ctx,words.slice(0,cut).join(' '),w*.5,titleY,w*.27,w*.84,w,h);drawTitle(ctx,words.slice(cut).join(' '),w*.5,h*.876,w*.27,w*.9,w,h);}
  else drawTitle(ctx,title,w*.5,titleY,h*(wide?.31:.20),w*.88,w,h);
  if(state.subtitle.trim()){
    ctx.save();ctx.translate(w*.5,subY);ctx.rotate(-.075);const size=fitFont(ctx,state.subtitle.trim(),h*(wide?.086:.067),w*.76,'Kaushan');
    ctx.textAlign='center';ctx.lineWidth=h*.008;ctx.strokeStyle='#27122d';ctx.strokeText(state.subtitle.trim(),0,0);ctx.fillStyle='#f58d9d';ctx.fillText(state.subtitle.trim(),0,0);
    ctx.strokeStyle='#f58d9d';ctx.lineWidth=h*.002;ctx.beginPath();ctx.moveTo(-Math.min(w*.2,size*2),h*.012);ctx.quadraticCurveTo(0,h*.034,Math.min(w*.2,size*2),h*.006);ctx.stroke();ctx.restore();
  }
  if(state.tagline.trim()){
    const by=h*.927,bh=h*.037;ctx.fillStyle='#1c122a';ctx.fillRect(w*.105,by,w*.79,bh);ctx.fillStyle='#f3c2ac';ctx.textAlign='center';fitFont(ctx,state.tagline.trim().toUpperCase(),h*.016,w*.74,'Arial');ctx.fillText(state.tagline.trim().toUpperCase(),w*.5,by+bh*.67);
    ctx.fillStyle='#f3949a';ctx.fillRect(w*.08,by,w*.014,bh);ctx.fillRect(w*.906,by,w*.014,bh);
  }
  if(state.frame){ctx.strokeStyle='#171020';ctx.lineWidth=w*.02;ctx.strokeRect(0,0,w,h);ctx.strokeStyle='#f5d0a3';ctx.lineWidth=Math.max(2,w*.0025);ctx.strokeRect(w*.014,h*.018,w*.972,h*.964);}
  ctx.textAlign='left';ctx.fillStyle='#f4d2bf';ctx.font=`${h*.009}px Arial`;ctx.fillText('LP / 026',w*.035,h*.977);ctx.textAlign='right';ctx.fillText('SUNSHINE. SECRETS. SECOND CHANCES.',w*.965,h*.977);
}
