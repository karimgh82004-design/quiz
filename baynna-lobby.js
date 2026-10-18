/* بيننا — ساحة الانتظار v3: محرك Canvas خاص (بدون مكتبات)، عوالم متعددة بطبقات Parallax وإضاءة وجسيمات، وشخصيات متحركة بصورة اللاعب */
(()=>{
"use strict";
const NET=()=>window.BaynnaNet,RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
/* العوالم: [نوع الطبقة, اللون, الارتفاع, السعة, السرعة] */
const WORLDS={
 dusk:{n:"غروب",e:"🌇",sky:["#1b1040","#8a2f7c","#ff9a62"],orb:[.74,.46,44,"#ffd9a0"],fx:"ember",gr:["#2a1238","#0d0620"],L:[["peaks","#4a2a6e",.56,.2,.4],["hills","#2f1a55",.68,.12,.8],["trees","#150a30",.8,.1,1.4]]},
 night:{n:"ليل نجوم",e:"🌌",sky:["#050818","#0d1b3f","#26407a"],orb:[.2,.28,30,"#eaf2ff"],fx:"star",gr:["#0f1c3a","#060c1e"],L:[["peaks","#16264f",.58,.22,.3],["hills","#0e1a3a",.7,.1,.7],["city","#070d22",.82,.2,0]]},
 forest:{n:"غابة",e:"🌲",sky:["#0c2a2a","#1f6b55","#b6e6a0"],orb:[.5,.3,50,"#f6ffcf"],fx:"fly",gr:["#12402e","#071f17"],L:[["hills","#2d8060",.55,.14,.5],["trees","#14503a",.68,.14,1],["trees","#0a2f22",.82,.12,1.7]]},
 sea:{n:"بحر",e:"🌊",sky:["#0a3a6b","#2a8fc4","#bff0ff"],orb:[.8,.26,38,"#fff6c9"],fx:"bubble",gr:["#0f6a99","#07304f"],L:[["dunes","#e8c77a",.6,.08,.5],["waves","#1f88b8",.7,.05,1.2],["waves","#0d5a88",.82,.06,2]]},
 snow:{n:"ثلج",e:"❄️",sky:["#1a2a52","#6f8fc8","#e8f2ff"],orb:[.3,.3,34,"#ffffff"],fx:"snow",gr:["#dce9f8","#9db8da"],L:[["peaks","#9fb6dc",.55,.26,.35],["peaks","#6f8cbd",.66,.18,.7],["trees","#274068",.8,.1,1.5]]},
 neon:{n:"مدينة نيون",e:"🌆",sky:["#12002b","#3b0a6b","#ff3d9a"],orb:[.5,.5,60,"#ff7ac8"],fx:"star",gr:["#1d0640","#080014"],L:[["city","#2a0a55",.62,.28,.2],["city","#14052e",.74,.22,.5],["city","#06000f",.86,.16,0]]}
};
const EMO=["😂","🔥","👏","😮","❤️"],H=(i)=>(Math.sin(i*127.1+311.7)*43758.5453)%1,rnd=(i)=>Math.abs(H(i));
let cv,cx,wrap,bar,W0=300,H0=300,dpr=1,wid="dusk",prevWid=null,fade=0,last=performance.now(),t0=0;
const P=new Map(),IMG=new Map(),FX=[];let st=null,stAt=0,sendT=0,lastSend=0,pend=null,my={x:.5,y:.85,e:-1,t:0};

function css(){if(document.getElementById("bnx-css"))return;const s=document.createElement("style");s.id="bnx-css";s.textContent=`.bnx{position:relative;margin:0 0 14px;border-radius:20px;overflow:hidden;border:1px solid var(--line,#333);background:#000;box-shadow:0 18px 40px -18px rgba(0,0,0,.8)}.bnx canvas{display:block;width:100%;height:clamp(250px,46vw,360px);touch-action:manipulation;cursor:pointer}.bnx-top{position:absolute;inset:0 0 auto 0;display:flex;justify-content:space-between;align-items:center;padding:10px 12px;pointer-events:none;color:#fff;font:800 13px Cairo,sans-serif;text-shadow:0 2px 8px #000a}.bnx-bar{display:flex;gap:6px;padding:8px 10px;overflow-x:auto;background:linear-gradient(0deg,#000d,#0006);scrollbar-width:none}.bnx-bar::-webkit-scrollbar{display:none}.bnx-bar button{flex:none;border:1px solid #fff2;background:#ffffff14;color:#fff;border-radius:999px;padding:6px 12px;font:700 13px Cairo,sans-serif;cursor:pointer;transition:transform .15s cubic-bezier(.23,1,.32,1),background .2s}.bnx-bar button:active{transform:scale(.94)}.bnx-bar button.on{background:#fff;color:#111}.bnx-bar button:disabled{opacity:.55;cursor:default}.bnx-sep{flex:none;width:1px;background:#fff3;margin:2px 4px}`;document.head.appendChild(s)}
function build(){css();wrap=document.createElement("div");wrap.className="bnx";cv=document.createElement("canvas");cx=cv.getContext("2d");
 wrap.innerHTML='<div class="bnx-top"><span>🎪 ساحة الانتظار</span><span id="bnxc"></span></div>';wrap.insertBefore(cv,wrap.firstChild);
 bar=document.createElement("div");bar.className="bnx-bar";wrap.appendChild(bar);
 bar.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;if(b.dataset.w){wid=b.dataset.w;fade=1;NET()&&NET().setWorld({id:wid});paintBar()}else if(b.dataset.e){my.e=+b.dataset.e;my.t=Date.now();send()}});
 cv.addEventListener("pointerdown",e=>{const r=cv.getBoundingClientRect();my.x=Math.min(.96,Math.max(.04,(e.clientX-r.left)/r.width));my.y=Math.min(.95,Math.max(.74,(e.clientY-r.top)/r.height));send()});
 new ResizeObserver(size).observe(wrap);paintBar()}
function paintBar(){if(!bar)return;const host=st&&st.host;bar.innerHTML=Object.entries(WORLDS).map(([k,w])=>`<button data-w="${k}" class="${k===wid?"on":""}" ${host?"":"disabled"}>${w.e} ${w.n}</button>`).join("")+'<i class="bnx-sep"></i>'+EMO.map((m,i)=>`<button data-e="${i}">${m}</button>`).join("")}
function size(){dpr=Math.min(2,devicePixelRatio||1);const r=cv.getBoundingClientRect();W0=r.width||300;H0=r.height||300;cv.width=W0*dpr;cv.height=H0*dpr;initFX()}
function send(){const now=Date.now(),go=()=>{lastSend=Date.now();pend=null;NET()&&NET().pose({x:+my.x.toFixed(3),y:+my.y.toFixed(3),e:my.e,t:my.t})};if(now-lastSend>=800)go();else if(!pend)pend=setTimeout(go,800-(now-lastSend))}
function initFX(){FX.length=0;const k=WORLDS[wid].fx,n=RM?8:k==="star"?60:k==="snow"?70:30;for(let i=0;i<n;i++)FX.push({x:Math.random(),y:Math.random(),z:Math.random(),p:Math.random()*6.28})}
function img(p){const a=p.av;if(!a)return null;let o=IMG.get(p.uid);if(!o||o.src0!==a){const i=new Image();i.src=a;o={i,src0:a};IMG.set(p.uid,o)}return o.i.complete&&o.i.naturalWidth?o.i:null}
function sil(type,col,by,amp,sp,t,li){const w=W0,h=H0,o=t*sp*.012+li*40;cx.fillStyle=col;cx.beginPath();cx.moveTo(0,h);
 for(let x=0;x<=w+6;x+=6){const u=x+o*40;let y;
  if(type==="hills")y=by-amp*(Math.sin(u*.007)+.5*Math.sin(u*.017+2))*.7;
  else if(type==="peaks")y=by-amp*(1-Math.abs(Math.sin(u*.0045)))-amp*.15*Math.sin(u*.03);
  else if(type==="dunes")y=by-amp*Math.sin(u*.005+1);
  else if(type==="waves")y=by-amp*Math.sin(u*.012+t*sp*.9)-amp*.4*Math.sin(u*.03-t*sp);
  else if(type==="trees"){const i=Math.floor(u/22),f=(u%22+22)%22/22;y=by-(.5+rnd(i))*amp*.9*Math.max(0,1-Math.abs(f-.5)*2.2)-amp*.2}
  else{const i=Math.floor(u/26);y=by-(.35+rnd(i)*.65)*amp}
  cx.lineTo(x,y*(type==="city"?1:1))}
 cx.lineTo(w+6,h);cx.fill()}
function drawWorld(W,t){const w=W0,h=H0,g=cx.createLinearGradient(0,0,0,h*.8);g.addColorStop(0,W.sky[0]);g.addColorStop(.55,W.sky[1]);g.addColorStop(1,W.sky[2]);cx.fillStyle=g;cx.fillRect(0,0,w,h);
 const[ox,oy,or,oc]=W.orb,X=ox*w,Y=oy*h*.9,R=or*(w/420+.6),gl=cx.createRadialGradient(X,Y,R*.2,X,Y,R*4);gl.addColorStop(0,oc+"aa");gl.addColorStop(1,oc+"00");cx.fillStyle=gl;cx.fillRect(0,0,w,h);cx.fillStyle=oc;cx.beginPath();cx.arc(X,Y,R,0,6.283);cx.fill();
 W.L.forEach((l,i)=>{sil(l[0],l[1],l[2]*h,l[3]*h,l[4],t,i);if(l[0]==="city"){cx.fillStyle=i===2?"#ffd86b":"#ff7ac8";for(let x=8;x<w;x+=26)for(let r=0;r<3;r++)if(rnd(x*3+r+i*9)>.55&&!RM){const f=.55+.45*Math.sin(t*2+x+r);cx.globalAlpha=f*.7;cx.fillRect(x,l[2]*h-l[3]*h*.35+r*14+i*6,3,4)}cx.globalAlpha=1}});
 const gg=cx.createLinearGradient(0,h*.7,0,h);gg.addColorStop(0,W.gr[0]);gg.addColorStop(1,W.gr[1]);cx.fillStyle=gg;cx.fillRect(0,h*.74,w,h*.26);cx.fillStyle="#ffffff18";cx.fillRect(0,h*.74,w,2);
 const k=W.fx;FX.forEach(f=>{let x=f.x*w,y=f.y*h;
  if(k==="star"){if(y>h*.55)return;cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.5+f.p));cx.fillStyle="#fff";cx.fillRect(x,y,1+f.z*1.6,1+f.z*1.6)}
  else{const s=RM?0:t;if(k==="snow"){f.y=(f.y+.0008*(1+f.z)+(RM?0:0))%1;x+=Math.sin(s+f.p)*10;cx.fillStyle="#fff";cx.globalAlpha=.8;cx.beginPath();cx.arc(x,f.y*h,1+f.z*2,0,6.283);cx.fill()}
   else if(k==="ember"||k==="bubble"){f.y-=.0007*(1+f.z);if(f.y<0)f.y=1;x+=Math.sin(s+f.p)*8;y=f.y*h;if(k==="ember"){cx.fillStyle="#ffb870";cx.globalAlpha=.8*f.y;cx.beginPath();cx.arc(x,y,1+f.z*1.6,0,6.283);cx.fill()}else{cx.strokeStyle="#dff8ff";cx.globalAlpha=.55;cx.beginPath();cx.arc(x,y,2+f.z*5,0,6.283);cx.stroke()}}
   else{x+=Math.sin(s*.7+f.p)*22;y=h*(.5+.4*f.y)+Math.cos(s*.9+f.p)*12;const a=.4+.6*Math.abs(Math.sin(s*2+f.p)),q=cx.createRadialGradient(x,y,0,x,y,9);q.addColorStop(0,"rgba(255,248,160,"+a+")");q.addColorStop(1,"rgba(255,248,160,0)");cx.globalAlpha=1;cx.fillStyle=q;cx.fillRect(x-9,y-9,18,18)}}
  cx.globalAlpha=1})}
function ch(p,t,mine){const u=p.uid,o=P.get(u)||{x:p.lb?p.lb.x:.2+.6*rnd(u.length*7+(u.charCodeAt(0)||1)),y:p.lb?p.lb.y:.84,mv:0};P.set(u,o);
 const tx=mine?my.x:(p.lb&&p.lb.x!=null?p.lb.x:o.x),ty=mine?my.y:(p.lb&&p.lb.y!=null?p.lb.y:o.y),dx=tx-o.x,dy=ty-o.y;o.x+=dx*.09;o.y+=dy*.09;o.mv=Math.hypot(dx*W0,dy*H0)>3;o.dir=Math.abs(dx)>.002?Math.sign(dx):(o.dir||1);
 const depth=.62+.5*(o.y-.7),s=depth*(H0/300+.35),x=o.x*W0,y=o.y*H0,hue=Math.abs(Math.floor(rnd(u.length*13+u.charCodeAt(u.length-1))*360)),sw=o.mv?Math.sin(t*14+hue):0,bob=o.mv?Math.abs(Math.sin(t*14+hue))*4*s:Math.sin(t*2+hue)*1.5*s;
 cx.save();cx.translate(x,y);cx.fillStyle="#0007";cx.beginPath();cx.ellipse(0,2*s,17*s,5*s,0,0,6.283);cx.fill();
 cx.lineCap="round";cx.lineWidth=6*s;cx.strokeStyle=`hsl(${hue} 45% 30%)`;cx.beginPath();cx.moveTo(-5*s,-14*s);cx.lineTo(-5*s+sw*6*s,0);cx.moveTo(5*s,-14*s);cx.lineTo(5*s-sw*6*s,0);cx.stroke();
 cx.translate(0,-bob);const bg=cx.createLinearGradient(0,-48*s,0,-12*s);bg.addColorStop(0,`hsl(${hue} 80% 62%)`);bg.addColorStop(1,`hsl(${hue} 70% 40%)`);cx.fillStyle=bg;cx.beginPath();cx.roundRect(-13*s,-46*s,26*s,34*s,11*s);cx.fill();
 cx.strokeStyle=`hsl(${hue} 70% 55%)`;cx.lineWidth=5*s;cx.beginPath();cx.moveTo(-13*s,-38*s);cx.lineTo(-19*s,-24*s-sw*5*s);cx.moveTo(13*s,-38*s);cx.lineTo(19*s,-24*s+sw*5*s);cx.stroke();
 const R=19*s,hy=-62*s,im=img(p);cx.save();cx.beginPath();cx.arc(0,hy,R,0,6.283);cx.clip();if(im){cx.drawImage(im,-R,hy-R,R*2,R*2)}else{cx.fillStyle=`hsl(${hue} 60% 75%)`;cx.fillRect(-R,hy-R,R*2,R*2);cx.fillStyle="#fff";cx.font=`800 ${R}px Cairo`;cx.textAlign="center";cx.textBaseline="middle";cx.fillText([...p.name][0]||"?",0,hy+1)}cx.restore();
 cx.lineWidth=3*s;cx.strokeStyle=mine?"#ffe14d":"#fff";cx.beginPath();cx.arc(0,hy,R,0,6.283);cx.stroke();
 cx.font="800 12px Cairo,sans-serif";cx.textAlign="center";cx.textBaseline="middle";const nm=p.name,tw=cx.measureText(nm).width+14;cx.fillStyle="#000a";cx.beginPath();cx.roundRect(-tw/2,hy-R-24,tw,18,9);cx.fill();cx.fillStyle="#fff";cx.fillText(nm,0,hy-R-15);
 const lb=mine?my:p.lb;if(lb&&lb.e>=0&&lb.t){const age=(Date.now()-lb.t)/1000;if(age<3){const pop=Math.min(1,age*5),fl=age*14;cx.globalAlpha=Math.min(1,(3-age)*1.5);cx.font=`${30*pop*s+6}px sans-serif`;cx.fillText(EMO[lb.e]||"",0,hy-R-40-fl);cx.globalAlpha=1}}
 cx.restore()}
function frame(now){requestAnimationFrame(frame);const slot=document.getElementById("bnArenaSlot");if(!slot){return}
 if(!wrap)build();if(wrap.parentNode!==slot){slot.appendChild(wrap);size();paintBar()}
 const dt=Math.min(.05,(now-last)/1000);last=now;t0+=dt;
 if(now-stAt>250){stAt=now;const s=NET()&&NET().state();if(s){const hc=!st||st.host!==s.host;st=s;const nw=s.world&&s.world.id&&WORLDS[s.world.id]?s.world.id:null;if(nw&&nw!==wid){prevWid=wid;wid=nw;fade=1;initFX();paintBar()}else if(hc)paintBar();const c=document.getElementById("bnxc");if(c)c.textContent="👥 "+s.players.length}}
 if(!cx||!W0)return;cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W0,H0);drawWorld(WORLDS[wid],t0);
 if(st){const me=st.uid,all=[...st.players].sort((a,b)=>((P.get(a.uid)||{y:.8}).y)-((P.get(b.uid)||{y:.8}).y));all.forEach(p=>ch(p,t0,p.uid===me))}
 if(fade>0){cx.fillStyle=`rgba(0,0,0,${fade})`;cx.fillRect(0,0,W0,H0);fade=Math.max(0,fade-dt*2.2)}
 const v=cx.createRadialGradient(W0/2,H0/2,H0*.4,W0/2,H0/2,H0*1.1);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.45)");cx.fillStyle=v;cx.fillRect(0,0,W0,H0)}
requestAnimationFrame(frame)})();
