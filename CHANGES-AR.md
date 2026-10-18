# بيننا — تحديث الساحة الاجتماعية (v2)

## الملفات المعدّلة
- `baynna-lobby.js` — أعيدت كتابته: ساحة Canvas خفيفة، 8 عوالم (World Themes)، سكنات، تعبيرات، مزامنة داخل الغرف.
- `baynna-social.css` — أنماط الساحة الجديدة (موبايل أولًا).
- `index.html` — تعديلان صغيران فقط:
  1. جسر `window.BaynnaNet` (قبل `function rLobby`) يعرض حالة الغرفة، ويكتب فقط في `roomPlayers/{code}/{uid}/lb` (سجل اللاعب نفسه) و`rooms/{code}/world` (للمضيف فقط).
  2. شاشة انتظار الغرفة تضيف `<div id="bnArenaSlot">` فوق محتواها الأصلي.
  3. إصلاح خطأ قديم: مغادرة المضيف كانت ترمي خطأ `Cannot read properties of null (reading 'room')`.
- لم يُلمس `firebase.json` ولا `.firebaserc` (غير موجودين في الأرشيف أصلًا).

## البيانات المُرسلة
- `lb`: {b,o,h,g,w,x,y,e,t} — أرقام صغيرة فقط، كتابة واحدة كحد أقصى كل 800ms، وفقط عند الضغط/التعبير.
- `world`: {id,back,uniform} — يكتبه المضيف عند الضغط على «اعتماد».
- لا مستمعات جديدة: الساحة تقرأ من مستمعات الغرفة الموجودة أصلًا.

## قواعد مقترحة (للمراجعة قبل النشر)
داخل `roomPlayers/$code/$uid` و`rooms/$code`:
```json
"lb": { ".validate": "newData.hasChildren(['x','y']) && newData.child('x').isNumber() && newData.child('y').isNumber()" },
"world": { ".write": "auth != null && root.child('rooms/'+$code+'/owner').val() === auth.uid",
           ".validate": "newData.child('id').isString() && newData.child('id').val().length < 16" }
```
