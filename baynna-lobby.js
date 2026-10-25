/* Baynna lobby v4 — 12 منصة + شريط لاعبين + قوائم منبثقة للرقص/الشخصية/وضع اللعب
   Baynna lobby v3 — ساحة الانتظار داخل الغرفة فقط.
   - لا يوجد أي تحكم بحركة الشخصيات: كلها تقف في صف وتتحرك لوحدها حسب شخصيتها.
   - الكانفس لا يستقبل أي لمس (pointer-events:none) فلا يتعارض أبدًا مع تمرير الصفحة.
   - الرقصات والميمز محسوبة محليًا من الوقت العام (Date.now) + معرّف اللاعب، فتظهر متزامنة عند الجميع
     بدون أي كتابة على الشبكة. الشبكة تُستخدم فقط لاختيار الشخصية وردّات الفعل (emotes).
   - إعداد العالم (rooms/{code}/world) يكتبه المضيف فقط عبر window.BaynnaNet. */
(function () {
  'use strict';
  var KEY = 'baynna-lobby-v3';

  /* ---------- العوالم: لكل عالم 4 شخصيات، ولكل شخصية طبعها (mv) ورقصاتها (dn) ---------- */
  var WORLDS = {
    kawaii: { name: 'عالم الكيوت', icon: '🌸', desc: 'باستيل وقلوب ودمى لطيفة', accent: '#ff7ad9',
      backs: [{ n: 'حديقة الحلوى', sky: ['#ffd6ec', '#e9d8ff'] }, { n: 'غيمة النجوم', sky: ['#d9d4ff', '#ffe3f3'] }],
      uniform: { b: 0 },
      chars: [{ n: 'أرنبة وردية', mv: 'hop', dn: ['hop2', 'twist'] }, { n: 'دبدوب ناعم', mv: 'sway', dn: ['sway', 'twist'] },
              { n: 'قطة بنفسجية', mv: 'wander', dn: ['slide', 'spin'] }, { n: 'فراولة لطيفة', mv: 'hop', dn: ['hop2', 'flip'] }] },
    anime: { name: 'عالم الأنمي', icon: '🌀', desc: 'ساكورا ومدينة مضيئة وطاقة', accent: '#ff4f7b',
      backs: [{ n: 'حديقة الساكورا', sky: ['#ffe1ea', '#ffc4d6'] }, { n: 'سطح المدرسة', sky: ['#7cc6ff', '#d6efff'] }],
      uniform: { b: 0 },
      chars: [{ n: 'بطل هادئ', mv: 'chill', dn: ['slide', 'robot'] }, { n: 'تشيبي وردية', mv: 'hop', dn: ['spin', 'twist'] },
              { n: 'نينجا', mv: 'wander', dn: ['flip', 'slide'] }, { n: 'ساحرة النجوم', mv: 'float', dn: ['twist', 'spin'] }] },
    cyber: { name: 'عالم السايبربانك', icon: '🌃', desc: 'نيون وروبوتات ومدينة المستقبل', accent: '#2ef2ff',
      backs: [{ n: 'شارع النيون', sky: ['#0b0820', '#25124a'] }, { n: 'مختبر الشبكة', sky: ['#001a22', '#003844'] }],
      uniform: { b: 0 },
      chars: [{ n: 'شبح النيون', mv: 'robot', dn: ['robot', 'slide'] }, { n: 'أندرويد', mv: 'robot', dn: ['robot', 'shake'] },
              { n: 'بانك سايبر', mv: 'sway', dn: ['shake', 'twist'] }, { n: 'ظلّ الشبكة', mv: 'stoic', dn: ['robot', 'flip'] }] },
    meme: { name: 'عالم الميمز', icon: '😂', desc: 'تعابير مبالغ فيها وفوضى مضحكة', accent: '#f2ee3a',
      backs: [{ n: 'ساحة الضحك', sky: ['#1b1b22', '#2a2a33'] }, { n: 'غرفة القطط', sky: ['#2a1830', '#3b2244'] }],
      uniform: { b: 0 },
      chars: [{ n: 'ضفدع المرح', mv: 'hop', dn: ['hop2', 'spin'] }, { n: 'موزة كول', mv: 'sway', dn: ['twist', 'slide'] },
              { n: 'قطة مصدومة', mv: 'jitter', dn: ['shake', 'flip'] }, { n: 'موآي الغامض', mv: 'stoic', dn: ['robot', 'twist'] }] },
    fantasy: { name: 'عالم الفانتازيا', icon: '🏰', desc: 'سحرة وفرسان وغابات مسحورة', accent: '#b38cff',
      backs: [{ n: 'الغابة المسحورة', sky: ['#13233a', '#2c4f4a'] }, { n: 'بوابة القلعة', sky: ['#2b1d4a', '#5a3d7a'] }],
      uniform: { b: 0 },
      chars: [{ n: 'ساحر', mv: 'float', dn: ['spin', 'twist'] }, { n: 'فارس', mv: 'march', dn: ['hop2', 'shake'] },
              { n: 'قناصة الغابة', mv: 'wander', dn: ['slide', 'twist'] }, { n: 'تنين صغير', mv: 'hop', dn: ['hop2', 'flip'] }] },
    street: { name: 'ستريت ستايل', icon: '🛹', desc: 'هوديز وغرافيتي ورقص', accent: '#ff8a3d',
      backs: [{ n: 'ساحة الغرافيتي', sky: ['#2d2d34', '#46464f'] }, { n: 'سطح المدينة', sky: ['#ff9966', '#ff5e62'] }],
      uniform: { b: 0 },
      chars: [{ n: 'سكيتر', mv: 'wander', dn: ['slide', 'flip'] }, { n: 'رابرة', mv: 'sway', dn: ['twist', 'shake'] },
              { n: 'لاعب سلة', mv: 'hop', dn: ['hop2', 'flip'] }, { n: 'ستايل', mv: 'chill', dn: ['slide', 'robot'] }] },
    tactical: { name: 'العالم التكتيكي', icon: '🎖️', desc: 'قاعدة عمليات وشارات وتحديات جماعية', accent: '#a3c45a',
      backs: [{ n: 'قاعدة العمليات', sky: ['#2b3125', '#454d38'] }, { n: 'مركز القيادة', sky: ['#1f2226', '#3a3f45'] }],
      uniform: { b: 0 },
      chars: [{ n: 'جندي', mv: 'march', dn: ['robot', 'hop2'] }, { n: 'قنّاص مموّه', mv: 'stoic', dn: ['robot', 'twist'] },
              { n: 'طبيب ميداني', mv: 'chill', dn: ['sway', 'hop2'] }, { n: 'قائد', mv: 'march', dn: ['robot', 'slide'] }] },
    cozy: { name: 'العالم الهادئ', icon: '☕', desc: 'أكواخ ومقاهٍ وإضاءة دافئة', accent: '#ffc46b',
      backs: [{ n: 'المقهى الدافئ', sky: ['#3b2a20', '#6b4a33'] }, { n: 'الكوخ الشتوي', sky: ['#a9c6e8', '#e8eef7'] }],
      uniform: { b: 0 },
      chars: [{ n: 'ولد الكاكاو', mv: 'sway', dn: ['sway', 'hop2'] }, { n: 'ثعلب دافئ', mv: 'wander', dn: ['slide', 'twist'] },
              { n: 'الجدّة', mv: 'chill', dn: ['sway', 'twist'] }, { n: 'دبّ النعسان', mv: 'nod', dn: ['sway', 'shake'] }] }
  };
  var WKEYS = Object.keys(WORLDS);
  var HOW = { hop: 'يتنطّط', sway: 'يتمايل', wander: 'يتمشّى', chill: 'رايق', robot: 'حركات روبوت', jitter: 'متوتر ومضحك',
              stoic: 'جامد ومهيب', march: 'يمشي مكانه', float: 'يطفو', nod: 'نعسان' };

  /* ---------- ردّات الفعل (تُزامَن عبر الشبكة كمعرّف صغير فقط) ---------- */
  /* [key, emoji, label, sticker index|null|-1 عشوائي, motion] */
  var EMOTES = [['wave', '👋', 'تحية', null, 'sway'], ['laugh', '😂', 'ضحك', 0, 'shake'], ['win', '🏆', 'احتفال', 3, 'hop2'],
                ['shock', '😱', 'صدمة', 1, 'jitter'], ['love', '😍', 'حب', 2, 'sway'], ['cry', '😭', 'بكاء', 4, 'droop'],
                ['meme', '🎲', 'ميم!', -1, 'dance'], ['dance', '💃', 'رقصتي', 5, 'dance']];
  /* رقصات كاملة (تُزامَن بنفس الطريقة: معرّف صغير فقط) */
  var DANCES = [['d_shake', '💥', 'هزّة', 'shake'], ['d_hop', '🦘', 'نطنطة', 'hop2'], ['d_spin', '🌀', 'لفّة', 'spin'], ['d_slide', '🕺', 'زحلقة', 'slide'],
                ['d_twist', '🌪️', 'تويست', 'twist'], ['d_robot', '🤖', 'روبوت', 'robot'], ['d_flip', '🔁', 'قلبة', 'flip'], ['d_sway', '🌊', 'تمايل', 'sway']];
  DANCES.forEach(function (d) { EMOTES.push([d[0], d[1], d[2], null, d[3], 1]); });
  var EMAP = {}; EMOTES.forEach(function (e) { EMAP[e[0]] = e; });
  function emoDur(k) { return EMAP[k] && EMAP[k][5] ? 6400 : 3200; }
  /* كل لعبة لها ماب (عالم + خلفية) يتحدد تلقائيًا لما المضيف يختارها */
  var GAME_MAP = { wyr: { id: 'cozy', back: 0 }, who: { id: 'meme', back: 0 }, rdraw: { id: 'kawaii', back: 0 }, rtruth: { id: 'anime', back: 1 },
                   mafia: { id: 'fantasy', back: 0 }, rtaboo: { id: 'street', back: 0 }, rstn: { id: 'cyber', back: 0 } };
  var SLOTS = 12;
  var EMO_MS = 6400;

  /* ---------- ستكرز ردّات الفعل ---------- */
  var STICKERS = ['art/sticker-0.webp', 'art/sticker-1.webp', 'art/sticker-2.webp', 'art/sticker-3.webp', 'art/sticker-4.webp', 'art/sticker-5.webp'];

  var defaults = { b: 0, world: 'meme', back: 0, lite: false };
  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || localStorage.getItem('baynna-lobby-v2') || '{}')); }
    catch (e) { return Object.assign({}, defaults); }
  }
  var st = load();
  if (!WORLDS[st.world]) st.world = 'meme';
  st.b = ((+st.b || 0) % 4 + 4) % 4;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);

  function int(v, max) { v = Math.floor(+v); return v >= 0 && v < max ? v : 0; }
  function clean(lb) { /* لا نثق بما يأتي من الشبكة */
    lb = lb && typeof lb === 'object' ? lb : {};
    return { b: int(lb.b, 8) % 4, e: EMAP[lb.e] ? lb.e : '', t: +lb.t || 0 };
  }
  function cleanWorld(w) { w = w && typeof w === 'object' ? w : {}; return { id: WORLDS[w.id] ? w.id : 'meme', back: int(w.back, 2), uniform: !!w.uniform }; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hash(s) { s = String(s); var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- حالة محلية ---------- */
  var net = null;
  var previewWorld = null;
  var me = { e: '', et: 0, etw: 0, last: 0 };
  var crowd = {}; /* uid -> {x,y,born,e,et,tw,lastT} */
  var list = [];  /* اللاعبون مرتبون ثابتًا حسب uid */
  var says = {};  /* uid -> آخر رسالة دردشة تظهر فوق شخصيته: {t, dur, text | src} */

  /* تُستدعى من الدردشة عند وصول رسالة جديدة: النص أو الميم يظهر فوق شخصية صاحبه */
  var MEMERX = /^\[\[meme:(\d{1,3})\]\]$/;
  function say(uid, text) {
    text = String(text == null ? '' : text).trim(); if (!uid || !text) return;
    var o = { t: performance.now(), dur: 0 }, mm = MEMERX.exec(text);
    if (mm) { var d = (window.BMEME_DATA || [])[+mm[1]]; if (!d) return; o.src = 'memes/' + d.f; o.dur = 5200; img(o.src); }
    else { o.text = text.slice(0, 120); o.dur = Math.min(8000, 3200 + o.text.length * 70); }
    says[uid] = o;
  }
  window.BaynnaLobby = { say: say };

  function NET() { try { return window.BaynnaNet && window.BaynnaNet.state(); } catch (e) { return null; } }
  function curWorld() {
    if (previewWorld) return previewWorld;
    if (net && net.world) return cleanWorld(net.world);
    return { id: st.world, back: st.back, uniform: false };
  }
  function skinB(b, w) { return w.uniform ? (WORLDS[w.id].uniform.b || 0) : b; }
  function mk(uid) { return crowd[uid] || (crowd[uid] = { hu: hash(uid), x: null, y: null, born: performance.now(), e: '', et: 0, tw: 0, lastT: 0 }); }

  /* ---------- مزامنة: اختيار الشخصية + ردّة الفعل فقط، بحد أقصى كتابة كل 800ms ---------- */
  var sendT = 0, sendTimer = 0, lastSent = '';
  function queueSend() {
    if (!net) return;
    var wait = Math.max(0, 800 - (Date.now() - sendT));
    clearTimeout(sendTimer); sendTimer = setTimeout(flush, wait);
  }
  function flush() {
    if (!net || !window.BaynnaNet) return;
    var live = me.e && Date.now() - me.etw < EMO_MS;
    var lb = { b: st.b, o: 0, h: 0, g: 0, w: 0, x: 50, y: 72, e: live ? me.e : '', t: live ? me.etw : 0 };
    var sig = JSON.stringify([lb.b, lb.e, lb.t]);
    if (sig === lastSent) return;
    lastSent = sig; sendT = Date.now();
    window.BaynnaNet.pose(lb).then(function (ok) {
      if (!ok) { lastSent = ''; setStatus('تعذّرت المزامنة — يظهر اختيارك عندك فقط'); } else setStatus('');
    });
  }
  function pull() {
    net = NET();
    var seen = {}, arr = [];
    if (!net) { list = [{ uid: '__me', name: 'أنا', me: 1, b: st.b }]; return; }
    net.players.forEach(function (p) {
      var lb = clean(p.lb), isMe = p.uid === net.uid, c = mk(p.uid);
      seen[p.uid] = 1;
      if (isMe) { if (!p.lb && lastSent) { lastSent = ''; queueSend(); } }
      else if (lb.e && lb.t !== c.lastT) { c.e = lb.e; c.et = performance.now(); c.tw = lb.t; }
      c.lastT = lb.t;
      arr.push({ uid: p.uid, name: p.name, me: isMe, host: p.uid === net.owner, b: isMe ? st.b : lb.b, talk: !!p.speaking, voice: !!p.voice, avh: p.avh || '' });
    });
    Object.keys(crowd).forEach(function (u) { if (!seen[u]) delete crowd[u]; });
    arr.sort(function (a, b) { return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0; });
    list = arr;
  }

  /* ---------- واجهة: شريط لاعبين + ساحة 12 منصة + شريط أدوات صغير وقوائم منبثقة ---------- */
  var arena = null, raf = 0, visible = true, statusEl = null, io = null, ro = null, sheet = '';
  function setStatus(t) { if (statusEl) { statusEl.textContent = t; statusEl.hidden = !t; } }

  function build() {
    var root = document.createElement('section'); root.className = 'lb-section lb2'; root.setAttribute('aria-label', 'ساحة الغرفة');
    root.innerHTML =
      '<div class="lb2-head"><div class="lb2-title"><b>✦ الساحة</b><span class="lb-world-tag"></span></div><span class="lb-live"></span></div>' +
      '<div class="lb2-strip" role="list" aria-label="اللاعبين"></div>' +
      '<div class="lb-stage lb2-stage"><canvas role="img" aria-label="ساحة فيها 12 منصة، كل لاعب واقف على منصته"></canvas><span class="lb-status" hidden></span></div>' +
      '<div class="lb2-dock">' +
        '<button type="button" class="lb2-dk" data-sheet="dance"><span>💃</span><b>الرقصات</b></button>' +
        '<button type="button" class="lb2-dk" data-sheet="char"><span class="lb2-dk-img"></span><b>شخصيتي</b></button>' +
        '<button type="button" class="lb2-dk" data-sheet="look"><span>🎨</span><b>المظهر</b></button>' +
        '<button type="button" class="lb2-dk lb2-dk-main lb2-dk-play" data-sheet="game"><span class="lb2-dk-gi">🎮</span><b class="lb2-dk-gn">وضع اللعب</b></button>' +
      '</div>' +
      '<div class="lb2-sheet" hidden><div class="lb2-back" data-close></div><div class="lb2-panel" role="dialog" aria-modal="true"><div class="lb2-grab"></div><div class="lb2-sh-head"><b class="lb2-sh-t"></b><button type="button" class="lb2-x" data-close aria-label="إغلاق">✕</button></div><div class="lb2-sh-body"></div></div></div>';
    statusEl = root.querySelector('.lb-status');
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    return root;
  }

  function gameList() { return (net && net.games) || []; }
  function curGame() { var g = gameList(), k = net && net.sel; for (var i = 0; i < g.length; i++) if (g[i].k === k) return g[i]; return null; }

  function sheetHTML(kind) {
    var w = curWorld(), W = WORLDS[w.id];
    if (kind === 'dance') {
      return '<p class="lb2-sec">رقصات</p><div class="lb2-grid">' + DANCES.map(function (d) { return '<button type="button" class="lb2-tile" data-e="' + d[0] + '"><span>' + d[1] + '</span><b>' + d[2] + '</b></button>'; }).join('') + '</div>' +
        '<p class="lb2-sec">ردّات فعل</p><div class="lb2-grid">' + EMOTES.filter(function (e) { return !e[5]; }).map(function (e) { return '<button type="button" class="lb2-tile sm" data-e="' + e[0] + '"><span>' + e[1] + '</span><b>' + e[2] + '</b></button>'; }).join('') + '</div>';
    }
    if (kind === 'char') {
      return (w.uniform ? '<p class="lb-tag">المضيف فرض شخصية موحّدة — اختيارك محفوظ ويرجع لما يلغيها</p>' : '') +
        '<p class="lb2-sec">' + W.icon + ' شخصيات ' + W.name + '</p><div class="lb2-chars">' + W.chars.map(function (c, i) {
          return '<button type="button" class="lb2-char' + (st.b === i ? ' on' : '') + '" data-c="' + i + '" aria-pressed="' + (st.b === i) + '"><img src="art/lobby/' + w.id + '-' + i + '.webp" alt="" loading="lazy" decoding="async"><b>' + esc(c.n) + '</b><small>' + HOW[c.mv] + '</small></button>';
        }).join('') + '</div><p class="lb-mut">الشخصيات بتتغير حسب ماب اللعبة.</p>';
    }
    if (kind === 'game') {
      var host = net && net.host, sel = net && net.sel;
      return (host ? '<p class="lb-mut">اختار اللعبة — الماب بيتحدد تلقائيًا للكل.</p>' : '<p class="lb-mut">المضيف هو اللي بيختار اللعبة، وبتوصلك فورًا.</p>') +
        '<div class="lb2-games">' + gameList().map(function (g) {
          var m = GAME_MAP[g.k] || { id: 'meme', back: 0 }, MW = WORLDS[m.id], bk = MW.backs[m.back];
          return '<button type="button" class="lb2-game' + (sel === g.k ? ' on' : '') + '"' + (host ? ' data-a="rgamepick" data-v="' + esc(g.k) + '" data-gk="' + esc(g.k) + '"' : ' disabled') +
            ' style="--w1:' + bk.sky[0] + ';--w2:' + bk.sky[1] + ';--wa:' + MW.accent + ';--bgi:url(art/lobby/bg-' + m.id + '.webp)">' +
            '<span class="lb2-gi">' + esc(g.i) + '</span><span class="lb2-gt"><b>' + esc(g.n) + '</b><small>' + esc(g.d) + '</small><em>🗺️ ' + MW.icon + ' ' + esc(bk.n) + '</em></span>' + (sel === g.k ? '<i class="lb2-ok">✓</i>' : '') + '</button>';
        }).join('') + '</div>';
    }
    if (kind === 'look') {
      var out = '';
      if (net && net.host) {
        out += '<p class="lb2-sec">عالم الساحة</p><div class="lb-wgrid">' + WKEYS.map(function (k) { var X = WORLDS[k], b = X.backs[0];
          return '<button type="button" class="lb-wcard' + (w.id === k ? ' on' : '') + '" data-hw="' + k + '" style="--w1:' + b.sky[0] + ';--w2:' + b.sky[1] + ';--wa:' + X.accent + '"><span class="lb-wi">' + X.icon + '</span><b>' + X.name + '</b><small>' + X.desc + '</small></button>'; }).join('') + '</div>' +
          '<p class="lb2-sec">الخلفية</p><div class="lb-row">' + W.backs.map(function (b, i) { return '<button type="button" class="lb-chip' + (w.back === i ? ' on' : '') + '" data-hb="' + i + '">' + b.n + '</button>'; }).join('') + '</div>' +
          '<label class="lb-check"><input type="checkbox" data-hu' + (w.uniform ? ' checked' : '') + '> نفس الشخصية للجميع</label>';
      } else out += '<p class="lb-mut">المضيف بيختار عالم الساحة وخلفيتها. حاليًا: ' + W.icon + ' ' + W.name + ' · ' + W.backs[w.back].n + '</p>';
      return out + '<label class="lb-check"><input type="checkbox" data-lite' + (st.lite ? ' checked' : '') + '> وضع مخفف (أوفر للبطارية)</label>';
    }
    return '';
  }
  var TITLES = { dance: '💃 الرقصات', char: '🎭 اختار شخصيتك', game: '🎮 وضع اللعب', look: '🎨 المظهر' };
  function openSheet(kind) {
    sheet = kind; var sh = arena.querySelector('.lb2-sheet');
    sh.querySelector('.lb2-sh-t').textContent = TITLES[kind];
    sh.querySelector('.lb2-sh-body').innerHTML = sheetHTML(kind);
    sh.hidden = false; requestAnimationFrame(function () { sh.classList.add('open'); });
  }
  function closeSheet() {
    if (!arena) return; var sh = arena.querySelector('.lb2-sheet'); sheet = ''; sh.classList.remove('open');
    setTimeout(function () { if (!sheet) sh.hidden = true; }, 220);
  }
  function rerenderSheet() { if (sheet && arena) arena.querySelector('.lb2-sh-body').innerHTML = sheetHTML(sheet); }

  function onClick(e) {
    if (e.target.closest('[data-close]')) { closeSheet(); return; }
    var b = e.target.closest('button'); if (!b) return; var d = b.dataset;
    if (d.sheet) { openSheet(d.sheet); return; }
    if (d.e) {
      var now = Date.now(); if (now - me.last < 700) return; me.last = now;
      me.e = d.e; me.et = performance.now(); me.etw = now; queueSend(); closeSheet(); return;
    }
    if (d.c != null) { st.b = int(d.c, 4); save(); queueSend(); rerenderSheet(); refreshPanel(true); setTimeout(closeSheet, 250); return; }
    if (d.gk) { /* rgamepick يشتغل من المعالج العام؛ هون بس نحدد الماب */
      var m = GAME_MAP[d.gk]; if (m && net && net.host && window.BaynnaNet) { var cw = curWorld(); window.BaynnaNet.setWorld({ id: m.id, back: m.back, uniform: !!cw.uniform }); }
      setTimeout(closeSheet, 200); return;
    }
    if (d.hw || d.hb != null && d.hb !== undefined) {
      if (!net || !net.host) return; var cw2 = curWorld(), nw = d.hw ? { id: d.hw, back: 0, uniform: cw2.uniform } : { id: cw2.id, back: +d.hb, uniform: cw2.uniform };
      window.BaynnaNet.setWorld(nw).then(function (ok) { if (!ok) setStatus('تعذّر حفظ العالم — تأكد من الاتصال'); });
      previewWorld = nw; rerenderSheet(); refreshPanel(true); setTimeout(function () { previewWorld = null; }, 1500); return;
    }
  }
  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute('data-lite')) { st.lite = t.checked; save(); return; }
    if (t.hasAttribute('data-hu') && net && net.host) { var cw = curWorld(); window.BaynnaNet.setWorld({ id: cw.id, back: cw.back, uniform: t.checked }); }
  }

  function stripHTML() {
    var h = list.map(function (a) {
      var cls = 'lb2-p' + (a.talk ? ' talk' : '') + (a.voice ? ' vc' : '') + (a.me ? ' me' : '');
      var mic = a.talk ? '🔊' : a.voice ? '🎙️' : '🔇';
      var kick = net && net.host && !a.me ? '<button type="button" class="lb2-kick" data-a="rkick" data-v="' + esc(a.uid) + '" aria-label="إخراج ' + esc(a.name) + '">✕</button>' : '';
      return '<div class="' + cls + '" role="listitem"><span class="lb2-av">' + (a.avh || '<span class="av">' + esc(String(a.name || '؟').slice(0, 1)) + '</span>') + '<i class="lb2-mic">' + mic + '</i>' + (a.host ? '<i class="lb2-crown">👑</i>' : '') + '</span><b>' + esc(String(a.name || '').slice(0, 10)) + '</b>' + kick + '</div>';
    }).join('');
    for (var i = list.length; i < SLOTS && i < list.length + 2; i++) h += '<div class="lb2-p empty"><span class="lb2-av"><span class="av">+</span></span><b>فاضي</b></div>';
    return h;
  }
  var panelSig = '', stripSig = '';
  function refreshPanel(force) {
    if (!arena) return;
    var w = curWorld(), W = WORLDS[w.id], g = curGame();
    var ss = JSON.stringify([net && net.host, list.map(function (a) { return [a.uid, a.name, a.talk, a.voice, a.host, a.avh.length]; })]);
    if (ss !== stripSig) { stripSig = ss; arena.querySelector('.lb2-strip').innerHTML = stripHTML(); }
    var sig = JSON.stringify([!!net, net && net.host, net && net.sel, w, st.b, st.lite, list.length, gameList().length]);
    if (!force && sig === panelSig) return; panelSig = sig;
    var lv = arena.querySelector('.lb-live'); lv.textContent = net ? '● ' + list.length + '/' + SLOTS : 'معاينة'; lv.classList.toggle('on', !!net);
    arena.style.setProperty('--wa', W.accent);
    arena.querySelector('.lb-world-tag').textContent = W.icon + ' ' + W.backs[w.back].n;
    var bi = skinB(st.b, w); arena.querySelector('.lb2-dk-img').innerHTML = '<img src="art/lobby/' + w.id + '-' + bi + '.webp" alt="">';
    arena.querySelector('.lb2-dk-gi').textContent = g ? g.i : '🎮';
    arena.querySelector('.lb2-dk-gn').textContent = g ? g.n : (net && net.host ? 'اختار لعبة' : 'وضع اللعب');
    if (sheet && sheet !== 'dance') rerenderSheet();
    preload(w.id);
  }

  /* ---------- صور ---------- */
  var imgs = {};
  function img(src) { var im = imgs[src]; if (!im) { im = imgs[src] = new Image(); im.decoding = 'async'; im.src = src; } return im.complete && im.naturalWidth ? im : null; }
  function preload(id) { img('art/lobby/bg-' + id + '.webp'); for (var i = 0; i < 4; i++) img('art/lobby/' + id + '-' + i + '.webp'); STICKERS.forEach(img); }

  /* ---------- حركة: طباع (idle) ورقصات ---------- */
  var P = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, fl: 1 };
  function rst() { P.dx = 0; P.dy = 0; P.rot = 0; P.sx = 1; P.sy = 1; P.fl = 1; }
  var S = Math.sin, A = Math.abs, PI = Math.PI;
  var MV = { /* t بالثواني × سرعة الشخصية، r مدى التمشّي بالبكسل */
    hop: function (t) { var s = A(S(t * 2.6)); P.dy = s * 13; P.sy = .94 + s * .1; P.sx = 1.05 - s * .08; },
    sway: function (t) { P.rot = S(t * 1.8) * .07; P.dx = S(t * 1.8) * 4; P.dy = A(S(t * 1.8)) * 2; },
    wander: function (t, r) { var w = t * .5; P.dx = S(w) * r; P.fl = Math.cos(w) > 0 ? 1 : -1; if (A(Math.cos(w)) > .25) { P.dy = A(S(t * 7)) * 3.5; P.rot = S(t * 7) * .03; } },
    chill: function (t) { P.sy = 1 + S(t * 1.5) * .02; P.rot = S(t * .7) * .02; },
    robot: function (t) { var q = Math.floor(t * 2.2); P.rot = (q % 2 ? 1 : -1) * .05; P.dx = (q % 4 < 2 ? -1 : 1) * 3; P.dy = (t * 2.2 % 1) < .15 ? 3 : 0; },
    jitter: function (t) { P.rot = S(t * 38) * .035; P.dx = S(t * 31) * 1.2; P.dy = Math.max(0, S(t * 1.1) - .85) * 66; },
    stoic: function (t) { P.sy = 1 + S(t * 1.1) * .012; P.rot = S(t * .45) * .015; },
    march: function (t) { P.dy = A(S(t * 3.4)) * 4; P.rot = S(t * 3.4) * .035; },
    float: function (t) { P.dy = 8 + S(t * 1.3) * 6; P.rot = S(t * .9) * .04; },
    nod: function (t) { P.rot = S(t * .9) * .05 + .02; P.sy = 1 + S(t * 1.2) * .02; },
    droop: function (t) { P.rot = S(t * 1.2) * .04; P.sy = .93 + S(t * 2) * .01; P.dy = -3; }
  };
  var DN = { /* b: موضع الضربة 0..1، bc: رقم الضربة */
    shake: function (b) { P.rot = S(b * 4 * PI) * .17; P.dy = A(S(b * PI)) * 9; },
    hop2: function (b) { var s = A(S(b * PI)); P.dy = s * 22; P.sy = .9 + s * .2; P.sx = 1.08 - s * .12; },
    spin: function (b, bc) { if (bc % 4 === 0) { P.sx = Math.cos(b * 2 * PI); P.dy = S(b * PI) * 10; } else P.dy = A(S(b * PI)) * 10; },
    slide: function (b, bc) { var ph = ((bc % 4) + b) / 4; P.dx = S(ph * 2 * PI) * 20; P.rot = Math.cos(ph * 2 * PI) * .1; P.dy = A(S(b * PI)) * 5; },
    twist: function (b) { P.rot = S(b * 2 * PI) * .26; P.sy = 1 + A(S(b * PI)) * .07; },
    robot: function (b, bc) { P.rot = (bc % 2 ? 1 : -1) * .13 * (b < .5 ? 1 : .6); P.dx = (bc % 4 < 2 ? -1 : 1) * 7; P.dy = b < .2 ? 6 : 0; },
    flip: function (b, bc) { P.fl = bc % 2 ? 1 : -1; P.dy = A(S(b * PI)) * 16; },
    sway: function (b) { P.rot = S(b * 2 * PI) * .12; P.dx = S(b * 2 * PI) * 8; }
  };
  var BEAT = 520;          /* ~115 BPM */
  var DANCE_PERIOD = 12000, DANCE_LEN = 3600;
  var GROUP_PERIOD = 48000, GROUP_LEN = 6000; /* آخر 6 ثواني من كل 48: رقصة جماعية متزامنة */

  /* ---------- رسم ---------- */
  function ease(x) { x = Math.min(1, Math.max(0, x)); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function wrap(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    var more = lines.length > 2; lines = lines.slice(0, 2); if (more) lines[1] += '…';
    return lines.map(function (l) { while (l.length > 1 && ctx.measureText(l).width > maxW) l = l.slice(0, -2) + '…'; return l; });
  }
  function bubble(ctx, text, cx, bottom, W, age, dur) {
    var sc = age < 260 ? ease(age / 260) : age > dur - 220 ? Math.max(0, (dur - age) / 220) : 1; if (sc <= .01) return;
    ctx.font = BF; var inf = bc[text]; if (!inf) { if (Object.keys(bc).length > 200) bc = {}; var ls = wrap(ctx, text, 140), mw = 0; ls.forEach(function (l) { mw = Math.max(mw, ctx.measureText(l).width); }); inf = bc[text] = { lines: ls, w: mw }; }
    var lines = inf.lines, w = inf.w;
    w += 20; var h = lines.length * 18 + 12; bottom = Math.max(bottom, h + 14); var  x = Math.min(W - 6 - w / 2, Math.max(6 + w / 2, cx)), tx = Math.max(-w / 2 + 12, Math.min(w / 2 - 12, cx - x));
    ctx.save(); ctx.translate(x, bottom); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(255,255,255,.97)'; rr(ctx, -w / 2, -h - 8, w, h, 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - 6, -9); ctx.lineTo(tx, 0); ctx.lineTo(tx + 6, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#14141c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach(function (l, i) { ctx.fillText(l, 0, -h - 8 + 6 + 9 + i * 18); });
    ctx.restore();
  }
  function memeBubble(ctx, src, cx, bottom, W, age, dur) {
    var im = img(src); if (!im) return;
    var sc = age < 260 ? ease(age / 260) : age > dur - 220 ? Math.max(0, (dur - age) / 220) : 1; if (sc <= .01) return;
    var w = 84, h = 84; bottom = Math.max(bottom, h + 14);
    var x = Math.min(W - 6 - w / 2, Math.max(6 + w / 2, cx)), tx = Math.max(-w / 2 + 12, Math.min(w / 2 - 12, cx - x));
    ctx.save(); ctx.translate(x, bottom); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(255,255,255,.97)'; rr(ctx, -w / 2, -h - 8, w, h, 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - 6, -9); ctx.lineTo(tx, 0); ctx.lineTo(tx + 6, -9); ctx.closePath(); ctx.fill();
    ctx.save(); rr(ctx, -w / 2 + 4, -h - 4, w - 8, h - 8, 9); ctx.clip();
    var s = Math.max((w - 8) / im.naturalWidth, (h - 8) / im.naturalHeight);
    ctx.drawImage(im, -im.naturalWidth * s / 2, -h / 2 - 8 - im.naturalHeight * s / 2, im.naturalWidth * s, im.naturalHeight * s);
    ctx.restore(); ctx.restore();
  }
  function chatBubble(ctx, cs, cx, bottom, W, age) {
    if (cs.src) memeBubble(ctx, cs.src, cx, bottom, W, age, cs.dur); else bubble(ctx, cs.text, cx, bottom, W, age, cs.dur);
  }
  var wc = {}, bc = {}, PF = '800 12px Cairo,Tahoma,sans-serif', BF = '800 13px Cairo,Tahoma,sans-serif';
  function pill(ctx, text, x, y, fg, bg) {
    ctx.font = PF; var w = wc[text]; if (w == null) { if (Object.keys(wc).length > 300) wc = {}; w = wc[text] = ctx.measureText(text).width + 16; }
    ctx.fillStyle = bg; rr(ctx, x - w / 2, y - 11, w, 22, 11); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1);
  }

  var bgc = null, bgKey = '';
  function background(ctx, w, W, H, dpr) {
    var bk = WORLDS[w.id].backs[w.back], im = img('art/lobby/bg-' + w.id + '.webp'), key = [w.id, w.back, W, H, dpr, !!im].join('|');
    if (key !== bgKey) {
      bgKey = key; bgc = document.createElement('canvas'); bgc.width = W * dpr; bgc.height = H * dpr;
      var c = bgc.getContext('2d'); c.scale(dpr, dpr);
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, bk.sky[0]); g.addColorStop(1, bk.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (im) { var sc = Math.max(W / im.naturalWidth, H / im.naturalHeight); c.drawImage(im, (W - im.naturalWidth * sc) / 2, (H - im.naturalHeight * sc) / 2, im.naturalWidth * sc, im.naturalHeight * sc); }
      var v = c.createLinearGradient(0, H * .55, 0, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    }
    ctx.drawImage(bgc, 0, 0, W, H);
  }

  var PODS = [];
  function layout(W, H) {
    PODS.length = 0;
    for (var r = 0; r < 2; r++) {
      var fy = r === 0 ? .55 : .88, sc = r === 0 ? .82 : 1, span = r === 0 ? .80 : .94, sw = W * span / 6;
      for (var k = 0; k < 6; k++) {
        var off = r === 0 ? 0 : 0; PODS.push({ x: W / 2 - W * span / 2 + sw * (k + .5) + off, y: H * fy, sw: sw, sc: sc, row: r });
      }
    }
    /* أول 6 بالصف الأمامي (الأوضح) ثم الخلفي */
    var order = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
    for (var i = 0; i < list.length && i < SLOTS; i++) {
      var o = list[i], pd = PODS[order[i]]; pd.who = o;
      o.tx = pd.x; o.ty = pd.y - pd.sw * .1; o.sw = pd.sw; o.row = pd.row; o.h = Math.max(46, Math.min(H * .34, pd.sw * 1.55) * pd.sc);
    }
  }
  function drawPodiums(ctx, now, acc) {
    PODS.forEach(function (pd) {
      var rx = pd.sw * .42, ry = rx * .32, x = pd.x, y = pd.y, a = pd.who, th = ry * .9;
      ctx.save();
      /* جسم المنصة */
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + th + 3, rx * 1.05, ry * 1.05, 0, 0, 7); ctx.fill();
      ctx.fillStyle = a ? 'rgba(20,20,32,.85)' : 'rgba(20,20,32,.45)'; ctx.fillRect(x - rx, y, rx * 2, th);
      ctx.beginPath(); ctx.ellipse(x, y + th, rx, ry, 0, 0, Math.PI); ctx.fill();
      var g = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
      g.addColorStop(0, a ? acc + 'cc' : 'rgba(255,255,255,.18)'); g.addColorStop(.5, a ? '#ffffffcc' : 'rgba(255,255,255,.32)'); g.addColorStop(1, a ? acc + 'cc' : 'rgba(255,255,255,.18)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = a ? acc : 'rgba(255,255,255,.35)'; if (!a) ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      if (a && a.talk) { /* موجات صوت */
        for (var q = 0; q < 2; q++) { var ph = ((now / 900) + q * .5) % 1; ctx.globalAlpha = 1 - ph; ctx.strokeStyle = '#3dff8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, rx * (1 + ph * .6), ry * (1 + ph * .6), 0, 0, 7); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      if (a && a.me) { ctx.globalAlpha = .3; ctx.strokeStyle = acc; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(x, y, rx * .85, ry * .8, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, rx * .85, ry * .8, 0, 0, 7); ctx.stroke(); }
      if (!a) { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = '700 ' + Math.round(rx * .55) + 'px Cairo,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+', x, y + 1); }
      ctx.restore();
    });
  }

  var chatQ = []; /* فقاعات الدردشة: ترتّب وتتناوب بالارتفاع حتى ما تغطي بعضها */
  var late = []; /* طبقة عليا: الأسماء والستكرز والفقاعات تُرسم بعد كل الشخصيات فلا يغطيها أحد */
  function drawSprite(ctx, a, now, t, W, lite, w, acc) {
    var wd = WORLDS[w.id], bi = skinB(a.b, w), ch = wd.chars[bi], spr = img('art/lobby/' + w.id + '-' + bi + '.webp'), c = mk(a.uid), pn = performance.now();
    if (c.x == null) { c.x = a.tx; c.y = a.ty - 40; }
    c.x += (a.tx - c.x) * .1; c.y += (a.ty - c.y) * .1;
    var h = a.h, k = h / 110, ph = (c.hu % 1000) / 1000 * 6.283, sp = c.sp || (c.sp = .85 + (hash(a.uid + 'sp') % 40) / 100);

    /* ما الذي يفعله الآن؟ ردّة فعل > رقصة جماعية > رقصة فردية > طبعه الخاص */
    var em = '', emAge = 0, emote = 0;
    if (a.me) { if (me.e && pn - me.et < emoDur(me.e)) { em = me.e; emAge = pn - me.et; emote = me.etw; } }
    else if (c.e && pn - c.et < emoDur(c.e)) { em = c.e; emAge = pn - c.et; emote = c.tw; }
    var cyc = now % GROUP_PERIOD, group = !lite && cyc > GROUP_PERIOD - GROUP_LEN, b = (now % BEAT) / BEAT, bc = Math.floor(now / BEAT);
    var off = c.hu % DANCE_PERIOD, kk = Math.floor((now + off) / DANCE_PERIOD), loc = (now + off) % DANCE_PERIOD;
    var solo = !lite && loc < DANCE_LEN && hash(a.uid + kk) % 3 !== 0;
    rst();
    if (em) {
      var mo = EMAP[em][4];
      if (mo === 'dance') DN[ch.dn[0]](b, bc); else if (DN[mo]) DN[mo](b, bc); else MV[mo](t * sp, 0);
      if (em === 'shock') { var pz = 1 + S(emAge / 70) * .03; P.sx *= pz; P.sy *= pz; }
    } else if (group || solo) DN[ch.dn[(group ? 0 : hash(a.uid + 'd' + kk)) % ch.dn.length]](b, bc);
    else MV[ch.mv](t * sp + ph, a.sw * .17);
    if (lite) { P.rot *= .6; P.dy *= .7; }

    var born = Math.min(1, (pn - c.born) / 550), bs = born < 1 ? Math.max(.001, ease(born)) : 1;
    var x = c.x + P.dx * k, fy = c.y, lift = P.dy * k, sw0 = spr ? h * spr.naturalWidth / spr.naturalHeight : h * .6;
    /* ظل + حلقة اللاعب نفسه */
    ctx.fillStyle = 'rgba(0,0,0,' + (.32 - Math.min(.16, lift / 160)) + ')'; ctx.beginPath(); ctx.ellipse(x, fy + 2, Math.max(4, sw0 * .38 * (1 - lift / 220)), h * .06, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(x, fy - lift); ctx.rotate(P.rot); ctx.scale(P.sx * P.fl * bs, P.sy * bs);
    if (spr) ctx.drawImage(spr, -sw0 / 2, -h, sw0, h);
    else { ctx.fillStyle = acc; ctx.globalAlpha = .75; ctx.beginPath(); ctx.ellipse(0, -h / 2, h * .26, h / 2, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.font = (h * .3) + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(wd.icon, 0, -h / 2); }
    ctx.restore();

    var top = fy - lift - h * P.sy - 6, label = (a.talk ? '🔊 ' : '') + (a.host ? '👑 ' : '') + String(a.name || '').slice(0, Math.max(4, Math.min(10, Math.floor(a.sw / 9))));
    late.push(function () { pill(ctx, label, c.x, fy + a.sw * .22 + 12, a.talk ? '#06210f' : a.me ? '#101010' : '#fff', a.talk ? '#3dff8a' : a.me ? acc : 'rgba(10,10,16,.72)'); });

    /* ردّة فعل: ستكر (أو إيموجي) فوق الرأس، وفي "ميم!" جملة أيضًا؛ وإلا ميم عشوائي متزامن */
    if (em) {
      var e = EMAP[em], si = e[3], src = si === -1 ? STICKERS[emote % STICKERS.length] : si != null ? STICKERS[si] : null, sI = src && img(src), pop = 1 + S(emAge / 150) * .08;
      late.push(function () {
        ctx.save(); ctx.translate(c.x + sw0 * .34, top + 4); ctx.scale(pop, pop);
        if (sI) ctx.drawImage(sI, -24, -24, 48, 48); else { ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e[1], 0, 0); }
        ctx.restore();
      });
    }
    var cs = says[a.uid];
    if (cs) {
      var cage = pn - cs.t;
      if (cage > cs.dur) delete says[a.uid];
      else chatQ.push({ cs: cs, x: c.x, b: top - 26, age: cage });
    }
  }

  /* حارس الأداء: لو الجهاز بطيء ننزّل الجودة تلقائيًا (1: بدون مؤثرات، 2: إطارات أقل ودقة أقل) */
  var gov = { ema: 0, n: 0, lv: 0 }, errs = 0, dead = false;
  function frame(tm) {
    raf = requestAnimationFrame(frame);
    if (dead || !arena || !visible || document.hidden) return;
    var lite = st.lite || reduce || gov.lv >= 1, cap = gov.lv >= 2 ? 48 : 33; if (tm - (frame.last || 0) < cap) return; frame.last = tm;
    var t0 = performance.now();
    try { draw(tm, lite); } catch (e) {
      if (++errs === 1) try { console.warn('[baynna-lobby] draw error:', e && e.message, e && e.stack); } catch (x) {}
      if (errs >= 5) killArena('تعذّر عرض الساحة على هذا الجهاز — باقي الغرفة يعمل بشكل طبيعي');
      return;
    }
    var dt = performance.now() - t0; gov.ema = gov.ema * .9 + dt * .1;
    if (++gov.n % 40 === 0 && gov.ema > 8 && gov.lv < 2) { gov.lv++; if (frame.size) frame.size(); }
  }
  function killArena(msg) {
    dead = true; cancelAnimationFrame(raf);
    try { var s = arena && arena.querySelector('.lb-stage'); if (s) s.innerHTML = '<p class="lb-mut" style="padding:24px;text-align:center">' + esc(msg) + '</p>'; } catch (e) {}
  }
  function draw(tm, lite) {
    var ctx = frame.ctx, W = frame.W, H = frame.H; if (!W || !H) return;
    var w = curWorld(), wd = WORLDS[w.id], now = Date.now(), t = tm / 1000, dpr = frame.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); background(ctx, w, W, H, dpr);

    var cyc = now % GROUP_PERIOD, group = !lite && cyc > GROUP_PERIOD - GROUP_LEN, beat = (now % BEAT) / BEAT;
    if (group) { /* ضوء كاشف نابض + ميمز تتساقط + قصاصات */
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var rg = ctx.createRadialGradient(W / 2, H * .78, 10, W / 2, H * .78, W * .6); rg.addColorStop(0, wd.accent + (beat < .5 ? '66' : '33')); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.restore();
      var gt = (cyc - (GROUP_PERIOD - GROUP_LEN)) / GROUP_LEN;
      for (var i = 0; i < 14; i++) {
        var sd = hash('c' + i) / 4294967296, fx = ((sd * 977) % 1) * W, fy = ((gt * (.7 + sd * .6) + sd) % 1) * (H + 40) - 20;
        if (i < 6) { var si = img(STICKERS[i % STICKERS.length]); if (si) { ctx.save(); ctx.translate(fx, fy); ctx.rotate(gt * 6 * (i % 2 ? 1 : -1) + sd * 6); ctx.globalAlpha = .9; ctx.drawImage(si, -17, -17, 34, 34); ctx.restore(); } }
        else { ctx.fillStyle = i % 3 === 0 ? wd.accent : i % 3 === 1 ? '#fff' : '#ff7ad9'; ctx.save(); ctx.translate(fx, fy); ctx.rotate(gt * 8 + i); ctx.fillRect(-3, -2, 6, 4); ctx.restore(); }
      }
      pill(ctx, '🎉 رقصة جماعية!', W / 2, 24, '#101010', wd.accent);
    } else if (!lite) { /* غبار ضوئي خفيف بلون العالم */
      ctx.save(); ctx.fillStyle = wd.accent;
      for (var pi = 0; pi < 14; pi++) {
        var ph = t / 2.6 + pi * 1.7, px = (S(ph * .9 + pi) * .5 + .5) * W, py = (Math.cos(ph * .6 + pi * 2.3) * .5 + .5) * H * .6 + 8, tw = S(t * 2.4 + pi * 2.1) * .5 + .5;
        ctx.globalAlpha = .1 + tw * .28; ctx.beginPath(); ctx.arc(px, py, 1.2 + tw * 1.5, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    layout(W, H);
    drawPodiums(ctx, now, wd.accent);
    late.length = 0; chatQ.length = 0;
    list.slice(0, SLOTS).sort(function (a, b) { return a.row - b.row || a.tx - b.tx; }).forEach(function (a) { drawSprite(ctx, a, now, t, W, lite, w, wd.accent); });
    late.forEach(function (f) { f(); });
    chatQ.sort(function (a, b) { return a.x - b.x; }).forEach(function (q, i) { q.b -= (i % 3) * 52; });
    chatQ.sort(function (a, b) { return a.cs.t - b.cs.t; }).forEach(function (q) { chatBubble(ctx, q.cs, q.x, q.b, W, q.age); });
  }
  function startLoop() {
    var cv = arena.querySelector('canvas'), stage = arena.querySelector('.lb-stage'); frame.ctx = cv.getContext('2d');
    function size() {
      var r = stage.getBoundingClientRect(), dpr = gov.lv >= 2 ? 1 : Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2), W = Math.round(r.width), H = Math.round(r.height);
      if (!W || !H || (W === frame.W && H === frame.H && dpr === frame.dpr)) return;
      frame.dpr = dpr; frame.W = W; frame.H = H; cv.width = W * dpr; cv.height = H * dpr;
    }
    frame.size = size; size();
    function keepH() { var hh = arena && arena.offsetHeight; if (hh > 80) document.documentElement.style.setProperty('--lb-h', hh + 'px'); }
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { size(); keepH(); }); ro.observe(stage); ro.observe(arena); } else window.addEventListener('resize', function () { size(); keepH(); });
    if (window.IntersectionObserver) { io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }); io.observe(stage); }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stopLoop() { cancelAnimationFrame(raf); raf = 0; if (ro) ro.disconnect(); if (io) io.disconnect(); ro = io = null; arena = null; statusEl = null; panelSig = ''; stripSig = ''; sheet = ''; }

  /* ---------- التركيب: داخل شاشة انتظار الغرفة فقط ---------- */
  var warned = 0;
  function place() { try { place0(); } catch (e) { if (!warned++) try { console.warn('[baynna-lobby] place error:', e && e.message, e && e.stack); } catch (x) {} } }
  function place0() {
    var slot = document.getElementById('bnArenaSlot');
    if (!slot) { if (arena) { if (arena.parentNode) arena.parentNode.removeChild(arena); stopLoop(); previewWorld = null; dead = false; errs = 0; } return; }
    pull();
    if (!arena) { arena = build(); slot.appendChild(arena); startLoop(); }
    else if (arena.parentNode !== slot) slot.appendChild(arena);
    refreshPanel();
  }
  var pending = 0;
  function schedule() { if (pending) return; pending = requestAnimationFrame(function () { pending = 0; place(); }); }
  function boot() {
    var app = document.getElementById('app'); if (!app) return setTimeout(boot, 200);
    new MutationObserver(function (ms) { /* تجاهل تغييرات الساحة نفسها: لا حلقات ولا عمل زائد */
      if (arena) { var ext = false; for (var i = 0; i < ms.length; i++) { if (!arena.contains(ms[i].target)) { ext = true; break; } } if (!ext) return; }
      schedule();
    }).observe(app, { childList: true, subtree: true });
    window.addEventListener('baynna-lb', schedule); /* تغيّر lb فقط: لا إعادة رسم للصفحة */
    place();
  }
  boot();
})();
