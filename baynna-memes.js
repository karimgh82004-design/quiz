/* نظام الميمز في بيننا: مكتبة داخل الدردشة + ميمز تلقائية عند أحداث الألعاب.
   الميم يُرسل كرسالة نصية بالشكل [[meme:ID]] حتى يمر عبر نفس مسار الدردشة وقواعدها. */
(function () {
  var D = window.BMEME_DATA || [], BASE = 'memes/';
  var CATS = { all: 'الكل', laugh: '😂 ضحك', shock: '😱 صدمة', confused: '🤔 حيرة', thinking: '🧠 تفكير', flex: '😎 تباهي', win: '🏆 فوز',
    lose: '💔 خسارة', sad: '😢 حزن', angry: '😤 عصبية', suspicious: '🕵️ شك', scared: '😬 توتر', shy: '🙈 خجل', love: '💖 حب', bored: '😴 ملل' };
  /* حدث اللعبة ← الفئات المناسبة (الأولى أقوى) */
  var EV = { end: ['win', 'flex', 'laugh'], mafiaEnd: ['win', 'shock', 'flex'], summary: ['laugh', 'win'], done: ['win', 'laugh'],
    result: ['shock', 'laugh', 'lose'], drawResult: ['laugh', 'shock', 'flex'], stnResult: ['shock', 'laugh'], verdict: ['shock', 'suspicious'],
    mafiaVoteResult: ['shock', 'sad', 'lose'], reveal: ['shock', 'laugh', 'shy'], night: ['scared', 'suspicious'], morning: ['shock', 'scared'],
    vote: ['suspicious', 'thinking'], voting: ['suspicious', 'thinking'], discussion: ['suspicious', 'angry'], guess: ['thinking', 'confused'] };
  var KEY = 'bmeme_auto', auto = true, recent = [], lastAuto = 0, sender = null;
  try { auto = localStorage.getItem(KEY) !== '0'; } catch (e) {}
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function byId(id) { return D[+id]; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /* اختيار ثابت لكل اللاعبين (نفس البذرة) مع تجنب آخر الميمز المعروضة */
  function pick(cats, seed) {
    var pool = [];
    D.forEach(function (m) { var w = 0; cats.forEach(function (c, i) { if (m.c.indexOf(c) === 0) w += 3 - i; else if (m.c.indexOf(c) > 0) w += 1; }); if (w > 0) pool.push({ m: m, w: w }); });
    var fresh = pool.filter(function (p) { return recent.indexOf(p.m.id) < 0; }); if (fresh.length) pool = fresh;
    if (!pool.length) return null;
    var tot = pool.reduce(function (a, p) { return a + p.w; }, 0), r = hash(seed) % tot;
    for (var i = 0; i < pool.length; i++) { r -= pool[i].w; if (r < 0) return pool[i].m; }
    return pool[0].m;
  }
  function remember(id) { recent.push(id); if (recent.length > 10) recent.shift(); }
  function img(m, cls) { return '<img class="' + cls + '" src="' + BASE + m.f + '" alt="' + esc(m.t || 'ميم') + '" loading="lazy" decoding="async">'; }
  function pop(m, label) {
    var old = document.getElementById('bmpop'); if (old) old.remove();
    var d = document.createElement('div'); d.id = 'bmpop'; d.className = 'bmpop'; d.setAttribute('role', 'status');
    d.innerHTML = img(m, '') + (label ? '<span>' + esc(label) + '</span>' : '');
    d.onclick = function () { d.remove(); };
    document.body.appendChild(d); setTimeout(function () { d.classList.add('out'); setTimeout(function () { d.remove(); }, 400); }, 2600);
  }
  var LABEL = { end: 'خلصت اللعبة!', mafiaEnd: 'انكشف كل شي!', result: 'النتيجة!', drawResult: 'شو هالرسمة؟', stnResult: 'النتيجة!', verdict: 'الحكم!',
    mafiaVoteResult: 'انطرد!', reveal: 'انكشفت!', night: 'الليل نزل…', morning: 'صباح الصدمات', vote: 'مين المشكوك فيه؟', voting: 'مين المشكوك فيه؟' };
  function onRoom(prior, v) {
    if (!auto || !v || !prior || prior.phase === v.phase) return;
    var cats = EV[v.phase]; if (!cats) return;
    if (Date.now() - lastAuto < 15000 && v.phase !== 'end' && v.phase !== 'mafiaEnd') return;
    var m = pick(cats, (v.game || '') + '|' + (v.round || 0) + '|' + v.phase + '|' + (v.code || v.owner || ''));
    if (!m) return; lastAuto = Date.now(); remember(m.id); pop(m, LABEL[v.phase]);
  }
  /* رسائل الدردشة */
  var RX = /^\[\[meme:(\d{1,3})\]\]$/;
  function render(t) { var x = RX.exec(t || ''); if (!x) return null; var m = byId(x[1]); return m ? img(m, 'bmchat') : null; }
  function picker() {
    var old = document.getElementById('bmpk'); if (old) { old.remove(); return; }
    var d = document.createElement('div'); d.id = 'bmpk'; d.className = 'bmpk';
    var cat = 'all', qq = '';
    function draw() {
      var list = D.filter(function (m) { return (cat === 'all' || m.c.indexOf(cat) >= 0) && (!qq || m.t.indexOf(qq) >= 0 || m.c.some(function (c) { return CATS[c].indexOf(qq) >= 0; })); });
      d.querySelector('.bmg').innerHTML = list.length ? list.map(function (m) { return '<button data-id="' + m.id + '" aria-label="' + esc(m.t || 'ميم') + '">' + img(m, '') + '</button>'; }).join('') : '<p>ما في ميمز بهالبحث</p>';
      [].forEach.call(d.querySelectorAll('.bmc button'), function (b) { b.classList.toggle('on', b.dataset.c === cat); });
    }
    d.innerHTML = '<div class="bmh"><b>😂 مكتبة الميمز</b><label><input type="checkbox" ' + (auto ? 'checked' : '') + '> ميمز تلقائية</label><button class="x" aria-label="إغلاق">✕</button></div>' +
      '<input class="bms" placeholder="ابحث… (مثلاً: صدمة، معلش)"><div class="bmc">' + Object.keys(CATS).map(function (c) { return '<button data-c="' + c + '">' + CATS[c] + '</button>'; }).join('') + '</div><div class="bmg"></div>';
    document.body.appendChild(d);
    d.querySelector('.x').onclick = function () { d.remove(); };
    d.querySelector('input[type=checkbox]').onchange = function (e) { auto = e.target.checked; try { localStorage.setItem(KEY, auto ? '1' : '0'); } catch (er) {} };
    d.querySelector('.bms').oninput = function (e) { qq = e.target.value.trim(); draw(); };
    d.querySelector('.bmc').onclick = function (e) { var b = e.target.closest('button'); if (b) { cat = b.dataset.c; draw(); } };
    d.querySelector('.bmg').onclick = function (e) { var b = e.target.closest('button'); if (!b || !sender) return; sender('[[meme:' + b.dataset.id + ']]'); d.remove(); };
    draw();
  }
  function close() { var o = document.getElementById('bmpk'); if (o) o.remove(); var p = document.getElementById('bmpop'); if (p) p.remove(); sender = null; }
  window.BMEME = { onRoom: onRoom, render: render, picker: picker, setSender: function (f) { sender = f; }, close: close };
})();
