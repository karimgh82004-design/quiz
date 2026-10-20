/* Baynna lobby v3 — ساحة الانتظار داخل الغرفة فقط.
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
              { n: 'قطة بنفسجية', mv: 'wander', dn: ['slide', 'spin'] }, { n: 'فراولة لطيفة', mv: 'hop', dn: ['hop2', 'flip'] }],
      says: ['آوووو كيوت جداً 🥺', 'بدي حلوى 🍰', 'بحبكم كلكم 💖'] },
    anime: { name: 'عالم الأنمي', icon: '🌀', desc: 'ساكورا ومدينة مضيئة وطاقة', accent: '#ff4f7b',
      backs: [{ n: 'حديقة الساكورا', sky: ['#ffe1ea', '#ffc4d6'] }, { n: 'سطح المدرسة', sky: ['#7cc6ff', '#d6efff'] }],
      uniform: { b: 0 },
      chars: [{ n: 'بطل هادئ', mv: 'chill', dn: ['slide', 'robot'] }, { n: 'تشيبي وردية', mv: 'hop', dn: ['spin', 'twist'] },
              { n: 'نينجا', mv: 'wander', dn: ['flip', 'slide'] }, { n: 'ساحرة النجوم', mv: 'float', dn: ['twist', 'spin'] }],
      says: ['نانِي؟! 😱', 'قوة الصداقة! ✨', 'الأوبننغ بدو يبدأ 🎬'] },
    cyber: { name: 'عالم السايبربانك', icon: '🌃', desc: 'نيون وروبوتات ومدينة المستقبل', accent: '#2ef2ff',
      backs: [{ n: 'شارع النيون', sky: ['#0b0820', '#25124a'] }, { n: 'مختبر الشبكة', sky: ['#001a22', '#003844'] }],
      uniform: { b: 0 },
      chars: [{ n: 'شبح النيون', mv: 'robot', dn: ['robot', 'slide'] }, { n: 'أندرويد', mv: 'robot', dn: ['robot', 'shake'] },
              { n: 'بانك سايبر', mv: 'sway', dn: ['shake', 'twist'] }, { n: 'ظلّ الشبكة', mv: 'stoic', dn: ['robot', 'flip'] }],
      says: ['جاري تحميل الحظ... 99%', 'الواي فاي ضعيف 📶', 'أنا مش روبوت 🤖'] },
    meme: { name: 'عالم الميمز', icon: '😂', desc: 'تعابير مبالغ فيها وفوضى مضحكة', accent: '#f2ee3a',
      backs: [{ n: 'ساحة الضحك', sky: ['#1b1b22', '#2a2a33'] }, { n: 'غرفة القطط', sky: ['#2a1830', '#3b2244'] }],
      uniform: { b: 0 },
      chars: [{ n: 'ضفدع المرح', mv: 'hop', dn: ['hop2', 'spin'] }, { n: 'موزة كول', mv: 'sway', dn: ['twist', 'slide'] },
              { n: 'قطة مصدومة', mv: 'jitter', dn: ['shake', 'flip'] }, { n: 'موآي الغامض', mv: 'stoic', dn: ['robot', 'twist'] }],
      says: ['ستونكس 📈', 'بو بو بو 🐸', 'ميم جديد وصل 🔥'] },
    fantasy: { name: 'عالم الفانتازيا', icon: '🏰', desc: 'سحرة وفرسان وغابات مسحورة', accent: '#b38cff',
      backs: [{ n: 'الغابة المسحورة', sky: ['#13233a', '#2c4f4a'] }, { n: 'بوابة القلعة', sky: ['#2b1d4a', '#5a3d7a'] }],
      uniform: { b: 0 },
      chars: [{ n: 'ساحر', mv: 'float', dn: ['spin', 'twist'] }, { n: 'فارس', mv: 'march', dn: ['hop2', 'shake'] },
              { n: 'قناصة الغابة', mv: 'wander', dn: ['slide', 'twist'] }, { n: 'تنين صغير', mv: 'hop', dn: ['hop2', 'flip'] }],
      says: ['بالسحر رح أفوز 🔮', 'وين التنين؟ 🐉', 'مهمة جديدة؟ ⚔️'] },
    street: { name: 'ستريت ستايل', icon: '🛹', desc: 'هوديز وغرافيتي ورقص', accent: '#ff8a3d',
      backs: [{ n: 'ساحة الغرافيتي', sky: ['#2d2d34', '#46464f'] }, { n: 'سطح المدينة', sky: ['#ff9966', '#ff5e62'] }],
      uniform: { b: 0 },
      chars: [{ n: 'سكيتر', mv: 'wander', dn: ['slide', 'flip'] }, { n: 'رابرة', mv: 'sway', dn: ['twist', 'shake'] },
              { n: 'لاعب سلة', mv: 'hop', dn: ['hop2', 'flip'] }, { n: 'ستايل', mv: 'chill', dn: ['slide', 'robot'] }],
      says: ['ستايلي مش عادي 🧢', 'الراب جاهز 🎤', 'ولا حركة وحدة 🛹'] },
    tactical: { name: 'العالم التكتيكي', icon: '🎖️', desc: 'قاعدة عمليات وشارات وتحديات جماعية', accent: '#a3c45a',
      backs: [{ n: 'قاعدة العمليات', sky: ['#2b3125', '#454d38'] }, { n: 'مركز القيادة', sky: ['#1f2226', '#3a3f45'] }],
      uniform: { b: 0 },
      chars: [{ n: 'جندي', mv: 'march', dn: ['robot', 'hop2'] }, { n: 'قنّاص مموّه', mv: 'stoic', dn: ['robot', 'twist'] },
              { n: 'طبيب ميداني', mv: 'chill', dn: ['sway', 'hop2'] }, { n: 'قائد', mv: 'march', dn: ['robot', 'slide'] }],
      says: ['العملية جاهزة 🎯', 'استلمت، انتهى 🎖️', 'الهدف أمامنا 🗺️'] },
    cozy: { name: 'العالم الهادئ', icon: '☕', desc: 'أكواخ ومقاهٍ وإضاءة دافئة', accent: '#ffc46b',
      backs: [{ n: 'المقهى الدافئ', sky: ['#3b2a20', '#6b4a33'] }, { n: 'الكوخ الشتوي', sky: ['#a9c6e8', '#e8eef7'] }],
      uniform: { b: 0 },
      chars: [{ n: 'ولد الكاكاو', mv: 'sway', dn: ['sway', 'hop2'] }, { n: 'ثعلب دافئ', mv: 'wander', dn: ['slide', 'twist'] },
              { n: 'الجدّة', mv: 'chill', dn: ['sway', 'twist'] }, { n: 'دبّ النعسان', mv: 'nod', dn: ['sway', 'shake'] }],
      says: ['قهوة ودفا ☕', 'بدي أنام 😴', 'الشتي حلو 🧣'] }
  };
  var WKEYS = Object.keys(WORLDS);
  var HOW = { hop: 'يتنطّط', sway: 'يتمايل', wander: 'يتمشّى', chill: 'رايق', robot: 'حركات روبوت', jitter: 'متوتر ومضحك',
              stoic: 'جامد ومهيب', march: 'يمشي مكانه', float: 'يطفو', nod: 'نعسان' };

  /* ---------- ردّات الفعل (تُزامَن عبر الشبكة كمعرّف صغير فقط) ---------- */
  /* [key, emoji, label, sticker index|null|-1 عشوائي, motion] */
  var EMOTES = [['wave', '👋', 'تحية', null, 'sway'], ['laugh', '😂', 'ضحك', 0, 'shake'], ['dance', '💃', 'رقصة', 5, 'dance'],
                ['win', '🏆', 'احتفال', 3, 'hop2'], ['shock', '😱', 'صدمة', 1, 'jitter'], ['love', '😍', 'حب', 2, 'sway'],
                ['cry', '😭', 'بكاء', 4, 'droop'], ['meme', '🎲', 'ميم!', -1, 'dance']];
  var EMAP = {}; EMOTES.forEach(function (e) { EMAP[e[0]] = e; });
  var EMO_MS = 3200;

  /* ---------- ميمز: جمل قصيرة (عامة + خاصة بكل عالم) وستكرز من أصول المشروع ---------- */
  var PHRASES = ['يا لطيف شو هاد 😂', 'أنا جاهز... مش جاهز', 'وين الأكل يا جماعة؟ 🍕', 'مين فتح المايك؟', 'أنا بريء والله 😇',
    'يلا شو ناطرين؟', 'حاسس إني رح أخسر 🤡', 'ثواني وبرجع', 'مين الغشاش؟ 🕵️', 'البطل وصل 😎', 'هاي مش لعبة هاي مصيبة',
    'ولا كلمة... 🗿', 'خلّيها على الله', 'أنا الأسطورة هون 👑', 'نص ساعة وجاي', 'ما تتفلسف يا زلمة', 'جيت متأخر بس جيت',
    'شو القصة يا جماعة؟', 'بدي أفوز وبس 🏆', 'اللي يخسر يعزم ☕', 'الحمدلله على السلامة 🗿', 'أنا مش نايم، بفكّر 😴',
    'هو في أمل؟ لا 😭', 'بيننا ولا بيننا؟ 🤔', 'شغّلوا الموسيقى 🎶', 'عيني عليك يا غشاش 👀', 'رقصة النصر جاهزة 💃', 'كل واحد يعترف 👀'];
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

  function NET() { try { return window.BaynnaNet && window.BaynnaNet.state(); } catch (e) { return null; } }
  function curWorld() {
    if (previewWorld) return previewWorld;
    if (net && net.world) return cleanWorld(net.world);
    return { id: st.world, back: st.back, uniform: false };
  }
  function skinB(b, w) { return w.uniform ? (WORLDS[w.id].uniform.b || 0) : b; }
  function mk(uid) { return crowd[uid] || (crowd[uid] = { x: null, y: null, born: performance.now(), e: '', et: 0, tw: 0, lastT: 0 }); }

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
      arr.push({ uid: p.uid, name: p.name, me: isMe, host: p.uid === net.owner, b: isMe ? st.b : lb.b });
    });
    Object.keys(crowd).forEach(function (u) { if (!seen[u]) delete crowd[u]; });
    arr.sort(function (a, b) { return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0; });
    list = arr;
  }

  /* ---------- واجهة ---------- */
  var arena = null, raf = 0, visible = true, statusEl = null, io = null, ro = null;
  function setStatus(t) { if (statusEl) { statusEl.textContent = t; statusEl.hidden = !t; } }

  function worldCards(sel, attr) {
    return WKEYS.map(function (k) {
      var W = WORLDS[k], b = W.backs[0];
      return '<button type="button" class="lb-wcard' + (sel === k ? ' on' : '') + '" ' + attr + '="' + k + '" aria-pressed="' + (sel === k) + '" style="--w1:' + b.sky[0] + ';--w2:' + b.sky[1] + ';--wa:' + W.accent + '"><span class="lb-wi">' + W.icon + '</span><b>' + W.name + '</b><small>' + W.desc + '</small></button>';
    }).join('');
  }
  function hostPanel() {
    if (!net || !net.host) return net ? '<div class="lb-card"><b>عالم الغرفة</b><p class="lb-mut">المضيف هو اللي بيختار العالم. أي تغيير بيوصلك تلقائيًا.</p></div>' : '';
    var w = curWorld(), W = WORLDS[w.id];
    return '<details class="lb-card lb-host"' + (previewWorld ? ' open' : '') + '><summary><b>👑 عالم الغرفة (للمضيف) — ' + W.icon + ' ' + W.name + '</b></summary>' +
      '<div class="lb-wgrid">' + worldCards(w.id, 'data-hw') + '</div>' +
      '<b>خلفية الساحة</b><div class="lb-row">' + W.backs.map(function (b, i) { return '<button type="button" class="lb-chip' + (w.back === i ? ' on' : '') + '" data-hb="' + i + '">' + b.n + '</button>'; }).join('') + '</div>' +
      '<label class="lb-check"><input type="checkbox" data-hu' + (w.uniform ? ' checked' : '') + '> نفس الشخصية للجميع</label>' +
      '<div class="lb-row">' + (previewWorld ? '<span class="lb-tag">معاينة — لم تُعتمد بعد</span><button type="button" class="lb-btn" data-happly>✓ اعتماد للجميع</button><button type="button" class="lb-chip" data-hcancel>إلغاء</button>' : '<span class="lb-mut">اختر لتعاين، ثم اعتمد.</span>') + '</div></details>';
  }
  function panelHTML() {
    var w = curWorld(), W = WORLDS[w.id];
    var picker = '<div class="lb-card"><b>🎭 اختر شخصيتك</b>' + (w.uniform ? '<p class="lb-tag">المضيف فرض شخصية موحّدة — اختيارك محفوظ ويرجع لما يلغيها</p>' : '') +
      '<div class="lb-chars">' + W.chars.map(function (c, i) {
        return '<button type="button" class="lb-char' + (st.b === i ? ' on' : '') + '" data-c="' + i + '" aria-pressed="' + (st.b === i) + '" aria-label="' + esc(c.n) + '"><img src="art/lobby/' + w.id + '-' + i + '.webp" alt="" loading="lazy" decoding="async"><span>' + esc(c.n) + '</span><small>' + HOW[c.mv] + '</small></button>';
      }).join('') + '</div></div>';
    var worldBlock = net ? hostPanel() : '<div class="lb-card"><b>جرّب عالمًا</b><div class="lb-wgrid">' + worldCards(st.world, 'data-w') + '</div></div>';
    return picker + worldBlock + '<label class="lb-check"><input type="checkbox" data-lite' + (st.lite ? ' checked' : '') + '> وضع مخفف (بدون مؤثرات، أوفر للبطارية)</label>';
  }
  function portalsHTML() {
    return '<div class="lb-portals"><button type="button" data-goto="pick">🎮 اختيار اللعبة</button><button type="button" data-goto="invite">📨 دعوة الأصدقاء</button></div>';
  }

  function build() {
    var root = document.createElement('section'); root.className = 'lb-section'; root.setAttribute('aria-label', 'ساحة الغرفة');
    root.innerHTML = '<div class="lb-head"><div><h2><span class="lb-spark">✦</span> ساحة الغرفة</h2><p class="lb-mut lb-sub"></p><span class="lb-world-tag"></span></div><span class="lb-live"></span></div>' +
      '<div class="lb-wrap"><div class="lb-main"><div class="lb-stage"><canvas role="img" aria-label="الشخصيات واقفة جنب بعض وتتحرك وترقص لوحدها"></canvas>' +
      '<span class="lb-status" hidden></span></div>' +
      '<div class="lb-emotes" role="group" aria-label="ردّات فعل">' + EMOTES.map(function (e) { return '<button type="button" data-e="' + e[0] + '" aria-label="' + e[2] + '"><span>' + e[1] + '</span><small>' + e[2] + '</small></button>'; }).join('') + '</div>' +
      '<div class="lb-pslot"></div></div><aside class="lb-panel"></aside></div>';
    statusEl = root.querySelector('.lb-status');
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    return root;
  }

  function onClick(e) {
    var b = e.target.closest('button'); if (!b) return; var d = b.dataset;
    if (d.e) { /* ردّة فعل: ليست تحكمًا بالحركة، فقط تحية/ميم فوق الشخصية */
      var now = Date.now(); if (now - me.last < 700) return; me.last = now;
      me.e = d.e; me.et = performance.now(); me.etw = now; queueSend(); return;
    }
    if (d.c != null) { st.b = int(d.c, 4); save(); queueSend(); refreshPanel(true); return; }
    if (d.w) { st.world = d.w; st.back = 0; save(); refreshPanel(true); return; }
    if (d.hw) { previewWorld = Object.assign({}, curWorld(), { id: d.hw, back: 0 }); refreshPanel(true); return; }
    if (d.hb) { previewWorld = Object.assign({}, curWorld(), { back: +d.hb }); refreshPanel(true); return; }
    if ('hcancel' in d) { previewWorld = null; refreshPanel(true); return; }
    if ('happly' in d) {
      var w = previewWorld; b.disabled = true;
      window.BaynnaNet.setWorld({ id: w.id, back: w.back, uniform: !!w.uniform }).then(function (ok) {
        if (ok) { previewWorld = null; setStatus(''); } else setStatus('تعذّر حفظ العالم — تأكد من الاتصال');
        refreshPanel(true);
      });
      return;
    }
    if (d.goto) { var el = d.goto === 'pick' ? document.querySelector('[data-a="rgamepick"]') : document.getElementById('rcode'); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); return; }
  }
  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute('data-lite')) { st.lite = t.checked; save(); return; }
    if (t.hasAttribute('data-hu')) { previewWorld = Object.assign({}, curWorld(), { uniform: t.checked }); refreshPanel(true); }
  }
  var panelSig = '';
  function refreshPanel(force) {
    if (!arena) return;
    var w = curWorld(), sig = JSON.stringify([!!net, net && net.host, w, previewWorld, st.b, st.world, st.back, st.lite, list.length]);
    if (!force && sig === panelSig) return; panelSig = sig;
    var p = arena.querySelector('.lb-panel'), open = p.querySelector('details.lb-host'), wasOpen = open ? open.open : null;
    p.innerHTML = panelHTML();
    if (wasOpen != null) { var d2 = p.querySelector('details.lb-host'); if (d2) d2.open = wasOpen; }
    arena.querySelector('.lb-pslot').innerHTML = net ? portalsHTML() : '';
    arena.querySelector('.lb-sub').textContent = net ? 'الشخصيات تتحرك وترقص لوحدها — اضغط ردّة فعل تحت الساحة 👇' : 'جاري تحميل الغرفة…';
    var lv = arena.querySelector('.lb-live'); lv.textContent = net ? '● ' + list.length + ' في الغرفة' : 'معاينة'; lv.classList.toggle('on', !!net);
    arena.style.setProperty('--wa', WORLDS[w.id].accent);
    arena.querySelector('.lb-world-tag').textContent = WORLDS[w.id].icon + ' ' + WORLDS[w.id].name + ' · ' + WORLDS[w.id].backs[w.back].n;
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
  var SAY_SLOT = 5200, SAY_LEN = 3400;

  /* ---------- رسم ---------- */
  function ease(x) { x = Math.min(1, Math.max(0, x)); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function wrap(ctx, text, maxW) {
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines.slice(0, 2);
  }
  function bubble(ctx, text, cx, bottom, W, age, dur) {
    var sc = age < 260 ? ease(age / 260) : age > dur - 220 ? Math.max(0, (dur - age) / 220) : 1; if (sc <= .01) return;
    ctx.font = '800 13px Cairo,Tahoma,sans-serif';
    var lines = wrap(ctx, text, 150), w = 0; lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l).width); });
    w += 20; var h = lines.length * 18 + 12; bottom = Math.max(bottom, h + 14); var  x = Math.min(W - 6 - w / 2, Math.max(6 + w / 2, cx)), tx = Math.max(-w / 2 + 12, Math.min(w / 2 - 12, cx - x));
    ctx.save(); ctx.translate(x, bottom); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(255,255,255,.97)'; rr(ctx, -w / 2, -h - 8, w, h, 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - 6, -9); ctx.lineTo(tx, 0); ctx.lineTo(tx + 6, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#14141c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach(function (l, i) { ctx.fillText(l, 0, -h - 8 + 6 + 9 + i * 18); });
    ctx.restore();
  }
  function pill(ctx, text, x, y, fg, bg) {
    ctx.font = '800 12px Cairo,Tahoma,sans-serif'; var w = ctx.measureText(text).width + 16;
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

  function layout(W, H) { /* صف واحد (حتى 6) أو صفّين، واقفين جنب بعض */
    var n = list.length, rows = n > 3 && W * .92 / n < 68 ? 2 : 1, per = rows === 2 ? Math.ceil(n / 2) : n, i = 0, r;
    for (r = 0; r < rows; r++) {
      var cnt = r === 0 ? per : n - per, rs = rows === 2 ? (r === 0 ? .86 : 1) : 1, fy = rows === 2 ? (r === 0 ? .67 : .88) : .85;
      if (cnt < 1) continue;
      var h0 = (rows === 2 ? Math.min(H * .36, 125) : Math.min(H * .46, 150)) * rs, sw = Math.min(W * .92 / cnt, h0 * .92), h = Math.min(h0, sw * 1.7), x0 = W / 2 - sw * cnt / 2;
      for (var k = 0; k < cnt; k++, i++) { var o = list[i]; o.tx = x0 + sw * (k + .5); o.ty = H * fy; o.h = Math.max(54, h); o.sw = sw; o.row = r; }
    }
  }

  var late = []; /* طبقة عليا: الأسماء والستكرز والفقاعات تُرسم بعد كل الشخصيات فلا يغطيها أحد */
  function drawSprite(ctx, a, now, t, W, lite, w, acc) {
    var wd = WORLDS[w.id], bi = skinB(a.b, w), ch = wd.chars[bi], spr = img('art/lobby/' + w.id + '-' + bi + '.webp'), c = mk(a.uid), pn = performance.now();
    if (c.x == null) { c.x = a.tx; c.y = a.ty - 40; }
    c.x += (a.tx - c.x) * .1; c.y += (a.ty - c.y) * .1;
    var h = a.h, k = h / 110, ph = (hash(a.uid) % 1000) / 1000 * 6.283, sp = .85 + (hash(a.uid + 'sp') % 40) / 100;

    /* ما الذي يفعله الآن؟ ردّة فعل > رقصة جماعية > رقصة فردية > طبعه الخاص */
    var em = '', emAge = 0, emote = 0;
    if (a.me) { if (me.e && pn - me.et < EMO_MS) { em = me.e; emAge = pn - me.et; emote = me.etw; } }
    else if (c.e && pn - c.et < EMO_MS) { em = c.e; emAge = pn - c.et; emote = c.tw; }
    var cyc = now % GROUP_PERIOD, group = !lite && cyc > GROUP_PERIOD - GROUP_LEN, b = (now % BEAT) / BEAT, bc = Math.floor(now / BEAT);
    var off = hash(a.uid) % DANCE_PERIOD, kk = Math.floor((now + off) / DANCE_PERIOD), loc = (now + off) % DANCE_PERIOD;
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
    if (a.me) { ctx.strokeStyle = acc; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(c.x, fy + 2, sw0 * .46, h * .085, 0, 0, 7); ctx.stroke(); }
    ctx.save(); ctx.translate(x, fy - lift); ctx.rotate(P.rot); ctx.scale(P.sx * P.fl * bs, P.sy * bs);
    if (spr) ctx.drawImage(spr, -sw0 / 2, -h, sw0, h);
    else { ctx.fillStyle = acc; ctx.globalAlpha = .75; ctx.beginPath(); ctx.ellipse(0, -h / 2, h * .26, h / 2, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.font = (h * .3) + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(wd.icon, 0, -h / 2); }
    ctx.restore();

    var top = fy - lift - h * P.sy - 6, label = (a.host ? '👑 ' : '') + (a.me ? '★ ' : '') + String(a.name || '').slice(0, 14);
    late.push(function () { pill(ctx, label, c.x, fy + 15, a.me ? '#101010' : '#fff', a.me ? acc : 'rgba(10,10,16,.66)'); });

    /* ردّة فعل: ستكر (أو إيموجي) فوق الرأس، وفي "ميم!" جملة أيضًا؛ وإلا ميم عشوائي متزامن */
    var bub = '', bubAge = 0, bubDur = SAY_LEN;
    if (em) {
      var e = EMAP[em], si = e[3], src = si === -1 ? STICKERS[emote % STICKERS.length] : si != null ? STICKERS[si] : null, sI = src && img(src), pop = 1 + S(emAge / 150) * .08;
      if (em === 'meme') { bub = PHRASES[emote % PHRASES.length]; bubAge = emAge; bubDur = EMO_MS; }
      late.push(function () {
        ctx.save(); ctx.translate(c.x + sw0 * .34, top + 4); ctx.scale(pop, pop);
        if (sI) ctx.drawImage(sI, -24, -24, 48, 48); else { ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e[1], 0, 0); }
        ctx.restore();
      });
    } else {
      var slot = Math.floor(now / SAY_SLOT), sl = now % SAY_SLOT, n = list.length, idx = list.indexOf(a);
      var s1 = hash('s' + slot) % n, s2 = n > 1 && hash('t' + slot) % 2 ? (s1 + 1 + hash('u' + slot) % (n - 1)) % n : -1;
      if ((idx === s1 || idx === s2) && sl < SAY_LEN && hash('q' + slot) % 10 < 8) {
        var pool = PHRASES.concat(wd.says, wd.says), pi2 = hash(a.uid + slot) % pool.length; if (idx === s2 && pi2 === hash(list[s1].uid + slot) % pool.length) pi2 = (pi2 + 1) % pool.length; bub = pool[pi2]; bubAge = sl;
        if (hash(a.uid + 'k' + slot) % 3 === 0) {
          var sI2 = img(STICKERS[hash(a.uid + 's' + slot) % STICKERS.length]);
          if (sI2 && sl < SAY_LEN - 300) { var pp = Math.min(1, sl / 300), es = ease(pp); late.push(function () { ctx.save(); ctx.translate(c.x - sw0 * .38, top + 6 - pp * 6); ctx.rotate(-.18 + S(sl / 200) * .06); ctx.scale(es, es); ctx.drawImage(sI2, -20, -20, 40, 40); ctx.restore(); }); }
        }
      }
    }
    if (bub) late.push(function () { bubble(ctx, bub, c.x, top - 26, W, bubAge, bubDur); });
  }

  function frame(tm) {
    raf = requestAnimationFrame(frame);
    if (!arena || !visible || document.hidden) return;
    var lite = st.lite || reduce, cap = lite || coarse ? 33 : 15; if (tm - (frame.last || 0) < cap) return; frame.last = tm;
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
    late.length = 0;
    list.slice().sort(function (a, b) { return a.row - b.row || a.tx - b.tx; }).forEach(function (a) { drawSprite(ctx, a, now, t, W, lite, w, wd.accent); });
    late.forEach(function (f) { f(); });
  }
  function startLoop() {
    var cv = arena.querySelector('canvas'), stage = arena.querySelector('.lb-stage'); frame.ctx = cv.getContext('2d');
    function size() { var r = stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2); frame.dpr = dpr; frame.W = Math.round(r.width); frame.H = Math.round(r.height); cv.width = frame.W * dpr; cv.height = frame.H * dpr; }
    size();
    if (window.ResizeObserver) { ro = new ResizeObserver(size); ro.observe(stage); } else window.addEventListener('resize', size);
    if (window.IntersectionObserver) { io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }); io.observe(stage); }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stopLoop() { cancelAnimationFrame(raf); raf = 0; if (ro) ro.disconnect(); if (io) io.disconnect(); ro = io = null; arena = null; statusEl = null; panelSig = ''; }

  /* ---------- التركيب: داخل شاشة انتظار الغرفة فقط ---------- */
  function place() {
    var slot = document.getElementById('bnArenaSlot');
    if (!slot) { if (arena) { if (arena.parentNode) arena.parentNode.removeChild(arena); stopLoop(); previewWorld = null; } return; }
    pull();
    if (!arena) { arena = build(); slot.appendChild(arena); startLoop(); }
    else if (arena.parentNode !== slot) slot.appendChild(arena);
    refreshPanel();
  }
  var pending = 0;
  function schedule() { if (pending) return; pending = requestAnimationFrame(function () { pending = 0; place(); }); }
  function boot() {
    var app = document.getElementById('app'); if (!app) return setTimeout(boot, 200);
    new MutationObserver(schedule).observe(app, { childList: true, subtree: true }); place();
  }
  boot();
})();
