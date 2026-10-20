/* Baynna lobby v2 — ساحة اجتماعية خفيفة (Canvas 2D).
   - الرسم والحركة محليًا بالكامل؛ لا كتابة في كل إطار.
   - داخل الغرفة: تُرسل معرّفات السكن والموقع فقط إلى سجل اللاعب نفسه (roomPlayers/{code}/{uid}/lb)
     بحد أقصى كتابة واحدة كل 800ms، ويُحذف السجل تلقائيًا عند المغادرة عبر منطق الغرفة الأصلي.
   - إعداد العالم (rooms/{code}/world) يكتبه المضيف فقط عبر window.BaynnaNet.
   - في الصفحة الرئيسية: معاينة محلية مع شخصيات تجريبية مُعلّمة بوضوح. */
(function(){
  'use strict';
  var KEY='baynna-lobby-v2';

  /* ---------- World Themes: أضف عالمًا جديدًا هنا فقط ---------- */
  var WORLDS={
    kawaii:{name:'عالم الكيوت',icon:'🌸',desc:'باستيل وقلوب ودمى لطيفة',accent:'#ff7ad9',
      backs:[{n:'حديقة الحلوى',sky:['#ffd6ec','#e9d8ff'],ground:'#ffc2df',deco:['🌸','💖','⭐','🐰','🧸']},
             {n:'غيمة النجوم',sky:['#d9d4ff','#ffe3f3'],ground:'#c9b8ff',deco:['☁️','✨','🌙','🐱','🎀']}],
      uniform:{b:6,o:1,h:4}},
    anime:{name:'عالم الأنمي',icon:'🌀',desc:'ساكورا ومدينة مضيئة وطاقة',accent:'#ff4f7b',
      backs:[{n:'حديقة الساكورا',sky:['#ffe1ea','#ffc4d6'],ground:'#f7a8c0',deco:['🌸','⛩️','🍡','🌸','🎐']},
             {n:'سطح المدرسة',sky:['#7cc6ff','#d6efff'],ground:'#9aa7b8',deco:['🏫','☀️','📚','🎒','💫']}],
      uniform:{b:4,o:2,h:2}},
    cyber:{name:'عالم السايبربانك',icon:'🌃',desc:'نيون وروبوتات ومدينة المستقبل',accent:'#2ef2ff',
      backs:[{n:'شارع النيون',sky:['#0b0820','#25124a'],ground:'#2b1460',deco:['🌃','🤖','⚡','💠','🛸']},
             {n:'مختبر الشبكة',sky:['#001a22','#003844'],ground:'#00525e',deco:['💾','🔋','🛰️','🧬','⚙️']}],
      uniform:{b:2,o:3,g:3}},
    meme:{name:'عالم الميمز',icon:'😂',desc:'تعابير مبالغ فيها وفوضى مضحكة',accent:'#f2ee3a',
      backs:[{n:'ساحة الضحك',sky:['#1b1b22','#2a2a33'],ground:'#f2ee3a',deco:['😂','💥','❗','⭐','🐸']},
             {n:'غرفة القطط',sky:['#2a1830','#3b2244'],ground:'#ff3fa4',deco:['🐱','🙀','🍕','🗿','🤡']}],
      uniform:{b:0,o:6,h:6}},
    fantasy:{name:'عالم الفانتازيا',icon:'🏰',desc:'سحرة وفرسان وغابات مسحورة',accent:'#b38cff',
      backs:[{n:'الغابة المسحورة',sky:['#13233a','#2c4f4a'],ground:'#2f6b4f',deco:['🍄','🌲','✨','🦋','🔮']},
             {n:'بوابة القلعة',sky:['#2b1d4a','#5a3d7a'],ground:'#5c5470','deco':['🏰','🐉','🌙','⚔️','💎']}],
      uniform:{b:3,o:4,w:1}},
    street:{name:'ستريت ستايل',icon:'🛹',desc:'هوديز وغرافيتي ورقص',accent:'#ff8a3d',
      backs:[{n:'ساحة الغرافيتي',sky:['#2d2d34','#46464f'],ground:'#5b5b66',deco:['🛹','🎨','🎧','🧃','🏀']},
             {n:'سطح المدينة',sky:['#ff9966','#ff5e62'],ground:'#4a3a3a',deco:['🌆','📻','👟','🧢','🕶️']}],
      uniform:{b:5,o:5,h:1}},
    tactical:{name:'العالم التكتيكي',icon:'🎖️',desc:'قاعدة عمليات وشارات وتحديات جماعية',accent:'#a3c45a',
      backs:[{n:'قاعدة العمليات',sky:['#2b3125','#454d38'],ground:'#5a6145',deco:['🎖️','📡','🗺️','🔦','🏕️']},
             {n:'مركز القيادة',sky:['#1f2226','#3a3f45'],ground:'#4b5058','deco':['🛰️','🧭','📋','🎯','🔭']}],
      uniform:{b:7,o:7,h:5,g:2}},
    cozy:{name:'العالم الهادئ',icon:'☕',desc:'أكواخ ومقاهٍ وإضاءة دافئة',accent:'#ffc46b',
      backs:[{n:'المقهى الدافئ',sky:['#3b2a20','#6b4a33'],ground:'#8a6446',deco:['☕','🕯️','🪴','🐈','📖']},
             {n:'الكوخ الشتوي',sky:['#a9c6e8','#e8eef7'],ground:'#f4f7fb',deco:['🏡','❄️','🧣','🐕','🌲']}],
      uniform:{b:1,o:8,h:3}}
  };
  var WKEYS=Object.keys(WORLDS);

  /* ---------- كتالوج السكنات (معرّفات فقط تُرسل للشبكة) ---------- */
  var BODIES=['#f2ee3a','#ffd9b8','#2ef2ff','#c9a7ff','#ff9eb8','#ff8a3d','#ffffff','#9bb36a'];
  var OUTFITS=[{n:'بدون',c:''},{n:'فستان كيوت',c:'#ff9ed8'},{n:'زي مدرسي',c:'#2a3b7a'},{n:'جاكيت نيون',c:'#7a2cff'},
               {n:'رداء ساحر',c:'#4b2a8a'},{n:'هودي',c:'#ff5e3a'},{n:'بيجاما ميم',c:'#3ad16b'},{n:'زي تكتيكي',c:'#5a6145'},{n:'كنزة شتوية',c:'#b4553a'}];
  var HATS=['','🧢','🎀','👑','🐰','🪖','🤠','🎩','🎧'];
  var GLASSES=['','🕶️','👓','🥽'];
  var WINGS=[{n:'بدون'},{n:'أجنحة',k:'w'},{n:'هالة',k:'h'}];
  var EMOTES=[['wave','👋','تحية'],['laugh','😂','ضحك'],['dance','💃','رقصة'],['win','🏆','احتفال'],['shock','😱','صدمة'],['love','😍','حب']];
  var EMAP={};EMOTES.forEach(function(e){EMAP[e[0]]=e});
  /* مكتبة الستكرات: صور حقيقية من أصول المشروع تظهر فوق الشخصية بدل الإيموجي */
  var STICKERS={laugh:'art/sticker-0.webp',shock:'art/sticker-1.webp',love:'art/sticker-2.webp',win:'art/sticker-3.webp',dance:'art/sticker-5.webp'};
  var stickerImg={};
  function stickerFor(e){var src=STICKERS[e];if(!src)return null;var im=stickerImg[src];
    if(!im){im=stickerImg[src]=new Image();im.src=src}
    return im.complete&&im.naturalWidth?im:null}

  var defaults={b:0,o:0,h:1,g:0,w:0,name:'أنا',lite:false,world:'meme',back:0};
  function load(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('baynna-lobby-v1')||'{}'))}catch(e){return Object.assign({},defaults)}}
  var st=load(); if(!WORLDS[st.world])st.world='meme';
  function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
  var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

  function int(v,max){v=Math.floor(+v);return v>=0&&v<max?v:0}
  function clean(lb){ /* لا نثق بما يأتي من الشبكة */
    lb=lb&&typeof lb==='object'?lb:{};
    return {b:int(lb.b,BODIES.length),o:int(lb.o,OUTFITS.length),h:int(lb.h,HATS.length),g:int(lb.g,GLASSES.length),w:int(lb.w,WINGS.length),
      x:Math.min(95,Math.max(5,+lb.x||50))/100,y:Math.min(82,Math.max(50,+lb.y||72))/100,e:EMAP[lb.e]?lb.e:'',t:+lb.t||0};
  }
  function cleanWorld(w){w=w&&typeof w==='object'?w:{};return {id:WORLDS[w.id]?w.id:'meme',back:int(w.back,2),uniform:!!w.uniform}}
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  /* ---------- حالة محلية ---------- */
  var me={x:.5,y:.72,tx:.5,ty:.72,e:'',et:0};
  var remote={}; /* uid -> {x,y,tx,ty,skin,name,e,et,lastT} */
  var previewWorld=null; /* معاينة المضيف قبل الاعتماد */
  var net=null, lastNet=null;

  function NET(){try{return window.BaynnaNet&&window.BaynnaNet.state()}catch(e){return null}}
  function curWorld(){
    if(previewWorld)return previewWorld;
    if(net&&net.world)return cleanWorld(net.world);
    return {id:st.world,back:st.back,uniform:false};
  }
  function skinFor(s,w){ /* الزي الموحد يغلب السكن الشخصي عند تفعيله */
    if(!w.uniform)return s;var u=WORLDS[w.id].uniform;return Object.assign({},s,{b:u.b!=null?u.b:s.b,o:u.o!=null?u.o:0,h:u.h!=null?u.h:0,g:u.g!=null?u.g:0,w:u.w!=null?u.w:0});
  }

  /* ---------- مزامنة محدودة المعدل ---------- */
  var sendT=0,sendTimer=0,lastSent='';
  function queueSend(){
    if(!net)return;
    var now=Date.now(),wait=Math.max(0,800-(now-sendT));
    clearTimeout(sendTimer);sendTimer=setTimeout(flush,wait);
  }
  function flush(){
    if(!net||!window.BaynnaNet)return;
    var lb={b:st.b,o:st.o,h:st.h,g:st.g,w:st.w,x:Math.round(me.tx*100),y:Math.round(me.ty*100),e:me.e&&Date.now()-(me.etw||0)<1800?me.e:'',t:Date.now()};
    var sig=JSON.stringify([lb.b,lb.o,lb.h,lb.g,lb.w,lb.x,lb.y,lb.e]);
    if(sig===lastSent)return; lastSent=sig; sendT=Date.now();
    window.BaynnaNet.pose(lb).then(function(ok){if(!ok){lastSent='';setStatus('تعذّرت مزامنة حركتك — يظهر شكلك عندك فقط')}else setStatus('')});
  }
  function pull(){
    net=NET();
    if(!net){remote={};return}
    var seen={};
    net.players.forEach(function(p){
      if(p.uid===net.uid){if(!p.lb&&lastSent){lastSent='';queueSend()}return} seen[p.uid]=1;
      var lb=clean(p.lb),r=remote[p.uid];
      if(!r){r=remote[p.uid]={x:lb.x,y:lb.y,lastT:0,et:0}}
      r.tx=lb.x;r.ty=lb.y;r.skin=lb;r.name=p.name;r.host=p.uid===net.owner;
      if(lb.e&&lb.t!==r.lastT){r.e=lb.e;r.et=performance.now()}
      r.lastT=lb.t;
    });
    Object.keys(remote).forEach(function(u){if(!seen[u])delete remote[u]});
  }

  /* ---------- واجهة ---------- */
  var arena=null,raf=0,visible=true,statusEl=null;
  function setStatus(t){if(statusEl){statusEl.textContent=t;statusEl.hidden=!t}}
  function sw(arr,key,fmt,label){return arr.map(function(v,i){return '<button type="button" class="lb-sw'+(st[key]===i?' on':'')+'" data-k="'+key+'" data-i="'+i+'" aria-pressed="'+(st[key]===i)+'" aria-label="'+label+': '+esc(typeof v==='object'?v.n:(v||'بدون'))+'">'+fmt(v)+'</button>'}).join('')}

  function worldCards(sel,attr){return WKEYS.map(function(k){var W=WORLDS[k],b=W.backs[0];
    return '<button type="button" class="lb-wcard'+(sel===k?' on':'')+'" '+attr+'="'+k+'" aria-pressed="'+(sel===k)+'" style="--w1:'+b.sky[0]+';--w2:'+b.sky[1]+';--wa:'+W.accent+'"><span class="lb-wi">'+W.icon+'</span><b>'+W.name+'</b><small>'+W.desc+'</small></button>'}).join('')}

  function hostPanel(){
    if(!net||!net.host)return net?'<div class="lb-card"><b>عالم الغرفة</b><p class="lb-mut">المضيف هو اللي بيختار العالم. أي تغيير بيوصلك تلقائيًا.</p></div>':'';
    var w=curWorld(),W=WORLDS[w.id];
    return '<details class="lb-card lb-host"'+(previewWorld?' open':'')+'><summary><b>👑 إعدادات العالم (للمضيف) — '+W.icon+' '+W.name+'</b></summary>'+
      '<div class="lb-wgrid">'+worldCards(w.id,'data-hw')+'</div>'+
      '<b>خلفية الساحة</b><div class="lb-row">'+W.backs.map(function(b,i){return '<button type="button" class="lb-chip'+(w.back===i?' on':'')+'" data-hb="'+i+'">'+b.n+'</button>'}).join('')+'</div>'+
      '<label class="lb-check"><input type="checkbox" data-hu'+(w.uniform?' checked':'')+'> فرض زي موحد على الجميع</label>'+
      '<div class="lb-row">'+(previewWorld?'<span class="lb-tag">معاينة — لم تُعتمد بعد</span><button type="button" class="lb-btn" data-happly>✓ اعتماد للجميع</button><button type="button" class="lb-chip" data-hcancel>إلغاء</button>':'<span class="lb-mut">اختر لتعاين، ثم اعتمد.</span>')+'</div></details>';
  }

  function panelHTML(){
    var w=curWorld();
    var worldBlock=net?hostPanel():'<div class="lb-card"><b>جرّب عالمًا</b><div class="lb-wgrid">'+worldCards(st.world,'data-w')+'</div><b>الخلفية</b><div class="lb-row">'+WORLDS[st.world].backs.map(function(b,i){return '<button type="button" class="lb-chip'+(st.back===i?' on':'')+'" data-b="'+i+'">'+b.n+'</button>'}).join('')+'</div><p class="lb-mut">عند إنشاء غرفة، المضيف يختار العالم ويشوفه كل الأعضاء.</p></div>';
    var skin='<details class="lb-card lb-skin"'+(net?'':' open')+'><summary><b>🎨 خصّص شخصيتك</b></summary>'+
      (w.uniform?'<p class="lb-tag">المضيف فرض زيًّا موحدًا — سكنك الشخصي محفوظ ويرجع لما يلغيه</p>':'')+
      '<b>اللون</b><div class="lb-row">'+sw(BODIES,'b',function(c){return '<i style="background:'+c+'"></i>'},'اللون')+'</div>'+
      '<b>الملابس</b><div class="lb-row">'+sw(OUTFITS,'o',function(o){return o.c?'<i style="background:'+o.c+'" title="'+o.n+'"></i>':'—'},'الملابس')+'</div>'+
      '<b>الشعر والقبعات</b><div class="lb-row">'+sw(HATS,'h',function(v){return v||'—'},'القبعة')+'</div>'+
      '<b>النظارات</b><div class="lb-row">'+sw(GLASSES,'g',function(v){return v||'—'},'النظارة')+'</div>'+
      '<b>أجنحة وهالات</b><div class="lb-row">'+sw(WINGS,'w',function(v){return v.k==='w'?'🪽':v.k==='h'?'😇':'—'},'الإضافة')+'</div>'+
      '<label class="lb-name">اسمك فوق الشخصية'+(net?' (اسم الغرفة يُستخدم داخلها)':'')+' <input maxlength="14" value="'+esc(st.name)+'"></label>'+
      '<small class="lb-mut">يُحفظ سكنك على هذا الجهاز، ويُرسل للغرفة كمعرّفات صغيرة فقط.</small></details>';
    return worldBlock+skin+'<label class="lb-check"><input type="checkbox" data-lite'+(st.lite?' checked':'')+'> وضع مخفف (أقل حركة وبطارية)</label>';
  }

  function portalsHTML(){
    if(net)return '<div class="lb-portals"><button type="button" data-goto="pick">🎮 اختيار اللعبة</button><button type="button" data-goto="invite">📨 دعوة الأصدقاء</button></div>';
    var tiles=[].slice.call(document.querySelectorAll('.social-game[data-v]')),seen={},out=[];
    tiles.forEach(function(t){var v=t.dataset.v;if(seen[v])return;seen[v]=1;var nm=(t.querySelector('b')||t).textContent.trim().slice(0,18);out.push('<button type="button" data-p="'+esc(v)+'">🚪 '+esc(nm)+'</button>')});
    return '<div class="lb-portals" aria-label="بوابات الألعاب">'+out.slice(0,8).join('')+'</div>';
  }

  function build(){
    var root=document.createElement('section');root.className='lb-section';root.setAttribute('aria-label','ساحة بيننا');
    root.innerHTML='<div class="lb-head"><div><h2><span class="lb-spark">✦</span> ساحة بيننا</h2><p class="lb-mut lb-sub"></p></div><span class="lb-live"></span></div>'+
      '<div class="lb-wrap"><div class="lb-stage"><canvas aria-label="ساحة الانتظار — اضغط لتتحرك" tabindex="0"></canvas>'+
      '<div class="lb-emotes">'+EMOTES.map(function(e){return '<button type="button" data-e="'+e[0]+'" aria-label="'+e[2]+'">'+e[1]+'</button>'}).join('')+'</div>'+
      '<div class="lb-pslot"></div><span class="lb-world-tag"></span><span class="lb-status" hidden></span></div>'+
      '<aside class="lb-panel"></aside></div>';
    statusEl=root.querySelector('.lb-status');
    var cv=root.querySelector('canvas');
    cv.addEventListener('pointerdown',function(e){var r=cv.getBoundingClientRect();moveTo((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)});
    cv.addEventListener('keydown',function(e){var d={ArrowLeft:[-.06,0],ArrowRight:[.06,0],ArrowUp:[0,-.05],ArrowDown:[0,.05]}[e.key];if(d){e.preventDefault();moveTo(me.tx+d[0],me.ty+d[1])}});
    root.addEventListener('click',onClick);
    root.addEventListener('change',onChange);
    root.addEventListener('input',function(e){if(e.target.matches('.lb-name input')){st.name=(e.target.value||'أنا').slice(0,14);save()}});
    return root;
  }
  function moveTo(x,y){me.tx=Math.min(.95,Math.max(.05,x));me.ty=Math.min(.82,Math.max(.5,y));queueSend()}

  function onClick(e){
    var b=e.target.closest('button');if(!b)return;var d=b.dataset;
    if(d.e){me.e=d.e;me.et=performance.now();me.etw=Date.now();queueSend();return}
    if(d.k){st[d.k]=+d.i;save();queueSend();refreshPanel();return}
    if(d.w){st.world=d.w;st.back=0;save();refreshPanel();return}
    if(d.b){st.back=+d.b;save();refreshPanel();return}
    if(d.hw){previewWorld=Object.assign({},curWorld(),{id:d.hw,back:0});refreshPanel();return}
    if(d.hb){previewWorld=Object.assign({},curWorld(),{back:+d.hb});refreshPanel();return}
    if('hcancel' in d){previewWorld=null;refreshPanel();return}
    if('happly' in d){var w=previewWorld;b.disabled=true;
      window.BaynnaNet.setWorld({id:w.id,back:w.back,uniform:!!w.uniform}).then(function(ok){
        if(ok){previewWorld=null;setStatus('')}else setStatus('تعذّر حفظ العالم — تأكد من الاتصال أو قواعد قاعدة البيانات');refreshPanel()});return}
    if(d.p){var t=document.querySelector('.social-game[data-v="'+d.p+'"]');if(t)t.click();return}
    if(d.goto){var el=d.goto==='pick'?document.querySelector('[data-a="rgamepick"]'):document.getElementById('rcode');if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});return}
  }
  function onChange(e){
    var t=e.target;
    if(t.hasAttribute('data-lite')){st.lite=t.checked;save();return}
    if(t.hasAttribute('data-hu')){previewWorld=Object.assign({},curWorld(),{uniform:t.checked});refreshPanel()}
  }
  var panelSig='';
  function refreshPanel(force){
    if(!arena)return;
    var w=curWorld(),sig=JSON.stringify([!!net,net&&net.host,w,previewWorld,st.b,st.o,st.h,st.g,st.w,st.world,st.back]);
    if(!force&&sig===panelSig)return;panelSig=sig;
    var p=arena.querySelector('.lb-panel'),open=p.querySelector('details.lb-skin');var wasOpen=open?open.open:null;
    var ae=document.activeElement,inName=ae&&ae.matches&&ae.matches('.lb-name input');
    if(inName)return; /* لا نقاطع الكتابة */
    p.innerHTML=panelHTML();
    if(wasOpen!=null){var d2=p.querySelector('details.lb-skin');if(d2)d2.open=wasOpen}
    arena.querySelector('.lb-pslot').innerHTML=portalsHTML();
    arena.querySelector('.lb-sub').textContent=net?'أنت في الغرفة '+net.code+' — كل الموجودين هنا لاعبين حقيقيين متصلين.':'اضغط على الساحة لتتحرك وادخل بوابة لعبة. هذه معاينة على جهازك.';
    var lv=arena.querySelector('.lb-live');lv.textContent=net?'● مباشر':'معاينة';lv.classList.toggle('on',!!net);
    var W=WORLDS[w.id];arena.style.setProperty('--wa',W.accent);
    arena.querySelector('.lb-world-tag').textContent=W.icon+' '+W.name+' · '+W.backs[w.back].n+(w.uniform?' · زي موحد':'');
  }

  /* ---------- رسم ---------- */
  var demo=[{x:.22,y:.64,s:{b:3,o:4,h:0,g:0,w:2},n:'تجريبي'},{x:.78,y:.76,s:{b:5,o:5,h:1,g:1,w:0},n:'تجريبي'}];
  function loop(cv,ctx){
    var last=0,dpr=Math.min(window.devicePixelRatio||1,2),cw=0,ch=0;
    function frame(t){
      raf=requestAnimationFrame(frame);
      if(t-(frame.vt||0)>500){frame.vt=t;var rc=cv.getBoundingClientRect();visible=rc.bottom>0&&rc.top<innerHeight}
      if(!visible||document.hidden||!cv.isConnected)return;
      var lite=st.lite||reduce;
      if(lite&&t-last<33)return; last=t;
      var W=cv.clientWidth,H=cv.clientHeight;
      if(W!==cw||H!==ch){cw=W;ch=H;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
      var w=curWorld(),wd=WORLDS[w.id],bk=wd.backs[w.back];
      var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,bk.sky[0]);g.addColorStop(1,bk.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var bgi=art('art/lobby/bg-'+w.id+'.webp');if(bgi){var sc=Math.max(W/bgi.naturalWidth,H/bgi.naturalHeight);ctx.drawImage(bgi,(W-bgi.naturalWidth*sc)/2,(H-bgi.naturalHeight*sc)/2,bgi.naturalWidth*sc,bgi.naturalHeight*sc)}
      if(!bgi){ctx.fillStyle=bk.ground;ctx.beginPath();ctx.ellipse(W/2,H*.86,W*.66,H*.4,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=wd.accent;ctx.globalAlpha=.35;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(W/2,H*.86,W*.5,H*.28,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='26px serif';
      bk.deco.forEach(function(d,i){var bob=lite?0:Math.sin(t/800+i)*5;ctx.fillText(d,W*(.08+i*.21),H*(.14+(i%2)*.12)+bob)})}
      /* لمسة بيننا: غبار ضوئي متطاير بلون العالم — يتحرك ببطء ويتوهج */
      if(!lite){ctx.save();ctx.fillStyle=wd.accent;
        for(var pi=0;pi<16;pi++){var ph=t/2600+pi*1.7,px=(Math.sin(ph*.9+pi)*.5+.5)*W,
          py=(Math.cos(ph*.6+pi*2.3)*.5+.5)*H*.7+10,
          tw=Math.sin(t/420+pi*2.1)*.5+.5;ctx.globalAlpha=.12+tw*.3;
          ctx.beginPath();ctx.arc(px,py,1.2+tw*1.6,0,7);ctx.fill()}
        ctx.restore()}
      var k=lite?.18:.08;
      me.x+=(me.tx-me.x)*k;me.y+=(me.ty-me.y)*k;
      var list=[];
      if(net){Object.keys(remote).forEach(function(u){var r=remote[u];r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;list.push({x:r.x,y:r.y,s:skinFor(r.skin,w),n:r.name,host:r.host,e:r.e&&t-r.et<1800?r.e:''})})}
      else demo.forEach(function(d,i){list.push({x:d.x,y:d.y+(lite?0:Math.sin(t/600+i)*.005),s:skinFor(d.s,w),n:d.n,demo:1})});
      var meName=net?(function(){var p=net.players.find(function(p){return p.uid===net.uid});return p?p.name:st.name})():st.name;
      list.push({x:me.x,y:me.y,s:skinFor(st,w),n:meName,me:1,host:net&&net.host,e:me.e&&t-me.et<1800?me.e:''});
      list.sort(function(a,b){return a.y-b.y});
      list.forEach(function(a){avatar(ctx,a.x*W,a.y*H,a,t,lite,wd.accent)});
    }
    raf=requestAnimationFrame(frame);
  }
  /* ---------- مكتبة الشخصيات: لكل عالم شكل مرسوم مختلف بالكامل ----------
     كل نمط دالة ترسم جسمًا مميزًا (ليس مستطيلًا)، يُصبغ بلون اللاعب،
     وتُركّب فوقه الملابس/القبعات/النظارات/الأجنحة كما هي. */
  function blob(ctx,w,h,r){ctx.beginPath();ctx.roundRect(-w/2,-h,w,h,r)}
  function ear(ctx,x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
  function spike(ctx,pts,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fill()}
  var CHARS={
    kawaii:function(ctx,C){ /* دمية كيوت: جسم كمثري + أذنا أرنب + خدود */
      ear(ctx,-10,-40,7,C);ear(ctx,10,-40,7,C);
      ear(ctx,-10,-40,3.5,'#fff');ear(ctx,10,-40,3.5,'#fff');
      blob(ctx,36,44,20);ctx.fillStyle=C;ctx.fill();
      ctx.fillStyle='rgba(255,120,180,.7)';ctx.beginPath();ctx.arc(-11,-10,3.6,0,7);ctx.arc(11,-10,3.6,0,7);ctx.fill()},
    anime:function(ctx,C){ /* تشيبي: رأس كبير + شعر مُسنّن */
      blob(ctx,40,38,19);ctx.fillStyle=C;ctx.fill();
      spike(ctx,[[-19,-26],[-13,-42],[-6,-28],[0,-44],[6,-28],[13,-42],[19,-26],[10,-20],[-10,-20]],shade(C,-30));
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-8,-12,5,0,7);ctx.arc(8,-12,5,0,7);ctx.fill();
      ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-8,-12,2.4,0,7);ctx.arc(8,-12,2.4,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(-9.4,-13.4,1.1,0,7);ctx.arc(6.6,-13.4,1.1,0,7);ctx.fill();
      return 'eyes'},
    cyber:function(ctx,C){ /* روبوت نيون: جسم معدني + هوائي + عين شاشة */
      ctx.fillStyle=shade(C,-35);blob(ctx,34,42,10);ctx.fill();
      ctx.strokeStyle='#0ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-42);ctx.lineTo(0,-50);ctx.stroke();
      ctx.fillStyle='#0ff';ctx.beginPath();ctx.arc(0,-52,2.6,0,7);ctx.fill();
      ctx.fillStyle='#05070c';ctx.beginPath();ctx.roundRect(-13,-22,26,12,6);ctx.fill();
      ctx.fillStyle='#0ff';ctx.beginPath();ctx.arc(-6,-16,2.6,0,7);ctx.arc(6,-16,2.6,0,7);ctx.fill();
      return 'noeyes'},
    meme:function(ctx,C){ /* ضفدع ميم: عينان جاحظتان + فم عريض */
      blob(ctx,38,36,18);ctx.fillStyle=C;ctx.fill();
      ear(ctx,-10,-36,7,'#fff');ear(ctx,10,-36,7,'#fff');
      ctx.fillStyle='#111';ctx.beginPath();ctx.arc(-10,-36,3,0,7);ctx.arc(10,-36,3,0,7);ctx.fill();
      ctx.strokeStyle='#111';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,-8,11,.15*Math.PI,.85*Math.PI);ctx.stroke();
      return 'noeyes'},
    fantasy:function(ctx,C){ /* ساحر صغير: رداء مخروطي */
      spike(ctx,[[-19,2],[0,-52],[19,2]],shade(C,-25));
      ctx.fillStyle=C;blob(ctx,32,30,15);ctx.fill();
      ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(0,-30,2.6,0,7);ctx.fill()},
    street:function(ctx,C){ /* هودي: جسم + قبعة هود مرفوعة */
      blob(ctx,38,42,16);ctx.fillStyle=C;ctx.fill();
      ctx.strokeStyle=shade(C,-35);ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,-18,17,Math.PI,0);ctx.stroke();
      ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.roundRect(-9,-2,18,14,7);ctx.fill()},
    tactical:function(ctx,C){ /* جندي: خوذة مموّهة + حزام */
      blob(ctx,38,42,14);ctx.fillStyle=C;ctx.fill();
      ctx.fillStyle=shade(C,-30);ctx.beginPath();ctx.arc(0,-24,19,Math.PI,0);ctx.fill();
      ctx.fillRect(-19,-26,38,5);
      ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-16,-4,32,6)},
    cozy:function(ctx,C){ /* دب دافئ: أذنان مدورتان + بطن فاتح */
      ear(ctx,-12,-34,7,C);ear(ctx,12,-34,7,C);
      ear(ctx,-12,-34,3.5,'#fff5e6');ear(ctx,12,-34,3.5,'#fff5e6');
      blob(ctx,38,44,19);ctx.fillStyle=C;ctx.fill();
      ctx.fillStyle='rgba(255,245,230,.85)';ctx.beginPath();ctx.ellipse(0,-4,11,9,0,0,7);ctx.fill()}
  };
  function shade(hex,d){var n=parseInt(hex.slice(1),16),r=Math.min(255,Math.max(0,(n>>16)+d)),g=Math.min(255,Math.max(0,((n>>8)&255)+d)),b=Math.min(255,Math.max(0,(n&255)+d));return 'rgb('+r+','+g+','+b+')'}

  var artImg={};function art(src){var im=artImg[src];if(!im){im=artImg[src]=new Image();im.decoding='async';im.src=src}return im.complete&&im.naturalWidth?im:null}
  function avatar(ctx,x,y,a,t,lite,acc){
    var spr=art('art/lobby/'+curWorld().id+'-'+(a.s.b%4)+'.webp');
    if(spr){var e0=a.e,j0=(e0==='dance'||e0==='win')&&!lite?Math.abs(Math.sin(t/120))*14:0,h0=104,w0=h0*spr.naturalWidth/spr.naturalHeight;
      ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+30,24,7,0,0,7);ctx.fill();
      ctx.strokeStyle=a.me?acc:BODIES[a.s.b];ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+30,28,9,0,0,7);ctx.stroke();
      ctx.save();ctx.translate(x,y+32-j0);if(e0==='dance'&&!lite)ctx.rotate(Math.sin(t/100)*.12);ctx.drawImage(spr,-w0/2,-h0,w0,h0);ctx.restore();
      if(e0){var st0=stickerFor(e0);if(st0)ctx.drawImage(st0,x+18,y-92-j0,40,40);else{ctx.font='28px serif';ctx.fillText(EMAP[e0][1],x+34,y-72-j0)}}
      var lb0=(a.host?'👑 ':'')+(a.me?'★ ':'')+a.n+(a.demo?' (عرض)':'');
      ctx.font='bold 12px Cairo,Tahoma,sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#111';ctx.fillStyle=a.me?acc:a.demo?'#bbb':'#fff';
      ctx.strokeText(lb0,x,y-80-j0);ctx.fillText(lb0,x,y-80-j0);return}
    var s=a.s,e=a.e,jump=(e==='dance'||e==='win')&&!lite?Math.abs(Math.sin(t/120))*14:0,tilt=e==='dance'&&!lite?Math.sin(t/100)*.15:0;
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+30,22,6,0,0,Math.PI*2);ctx.fill();
    if(a.me){ctx.strokeStyle=acc;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+30,28,9,0,0,Math.PI*2);ctx.stroke()}
    ctx.save();ctx.translate(x,y-jump);ctx.rotate(tilt);
    var wg=WINGS[s.w];
    if(wg.k==='w'){ctx.font='30px serif';ctx.fillText('🪽',-24,-2);ctx.save();ctx.scale(-1,1);ctx.fillText('🪽',-24,-2);ctx.restore()}
    var wid=curWorld().id, draw=CHARS[wid]||CHARS.cozy, ink='#111';
    ctx.save();
    var mode=draw(ctx,BODIES[s.b]);
    /* حدّ خارجي خفيف حول الجسم */
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;
    if(mode!=='eyes'&&mode!=='noeyes'){ /* عيون افتراضية لمن لا يرسم عيونه */
      ctx.fillStyle=ink;ctx.beginPath();ctx.arc(-7,-14,3,0,7);ctx.arc(7,-14,3,0,7);ctx.fill()}
    if(mode!=='noeyes'){ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.beginPath();if(e==='shock')ctx.arc(0,-4,4,0,7);else ctx.arc(0,-6,6,0,Math.PI);ctx.stroke()}
    ctx.restore();
    var of=OUTFITS[s.o];if(of.c){ctx.fillStyle=of.c;ctx.beginPath();ctx.roundRect(-16,4,32,20,[0,0,14,14]);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;ctx.stroke()}
    ctx.font='22px serif';if(GLASSES[s.g])ctx.fillText(GLASSES[s.g],0,-12);if(HATS[s.h])ctx.fillText(HATS[s.h],0,-34);
    if(wg.k==='h'){ctx.strokeStyle='#ffe066';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-52,13,4,0,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
    if(e){var m=EMAP[e],sti=stickerFor(e);
      if(sti){var pop=lite?1:1+Math.sin(t/150)*.08;ctx.save();ctx.translate(x+30,y-44-jump);ctx.scale(pop,pop);ctx.drawImage(sti,-20,-20,40,40);ctx.restore()}
      else{ctx.font='28px serif';ctx.fillText(m[1],x+28,y-38-jump)}}
    var label=(a.host?'👑 ':'')+(a.me?'★ ':'')+a.n+(a.demo?' (عرض)':'');
    ctx.font='bold 12px Cairo,Tahoma,sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#111';ctx.fillStyle=a.me?acc:a.demo?'#bbb':'#fff';
    ctx.strokeText(label,x,y-58-jump);ctx.fillText(label,x,y-58-jump);
  }

  /* ---------- التركيب داخل الصفحة الرئيسية أو شاشة انتظار الغرفة ---------- */
  function ensureArena(){
    if(!arena){arena=build();var cv=arena.querySelector('canvas');loop(cv,cv.getContext('2d'))}
    return arena;
  }
  function place(){
    var slot=document.getElementById('bnArenaSlot'),home=document.querySelector('.social-home');
    var wasNet=!!net; pull();
    if(slot){
      var a=ensureArena();if(a.parentNode!==slot)slot.appendChild(a);
      if(!wasNet){lastSent='';me.tx=.3+Math.random()*.4;queueSend()}
    }else if(home){
      var a2=ensureArena();
      if(!home.contains(a2)){var anchor=home.querySelector('.ticker')||home.querySelector('.social-hero');anchor?anchor.after(a2):home.prepend(a2)}
    }else if(arena&&arena.parentNode){arena.parentNode.removeChild(arena)}
    if(!net)previewWorld=null;
    refreshPanel();
  }
  var pending=0;
  function schedule(){if(pending)return;pending=requestAnimationFrame(function(){pending=0;place()})}
  function boot(){var app=document.getElementById('app');if(!app)return setTimeout(boot,200);
    new MutationObserver(schedule).observe(app,{childList:true,subtree:true});place()}
  boot();
})();
