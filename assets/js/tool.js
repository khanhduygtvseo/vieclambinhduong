/* Giao diện công cụ tính trợ cấp thôi việc / trợ cấp mất việc làm. Mọi phép tính chạy ngay trong trình duyệt. */
(function () {
  'use strict';
  var C = window.SeveranceCalc, form = document.getElementById('sev-form');
  if (!C || !form) return;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var state = { type: 'thoi-viec', mode: 'avg' };
  var out = {
    amt: $('#res-amt'), words: $('#res-words'), empty: $('#res-empty'), body: $('#res-body'),
    b1: $('.bar .b1'), b2: $('.bar .b2'), b3: $('.bar .b3'), rows: $('#res-rows'), note: $('#res-note'), err: $('#sev-err'),
  };
  var odo = window.CV && out.amt ? new window.CV.Odo(out.amt) : null;

  function num(id) { var el = document.getElementById(id); var v = el ? el.value.replace(/\D/g, '') : ''; return v === '' ? 0 : parseInt(v, 10); }
  function has(id) { var el = document.getElementById(id); return !!(el && el.value.replace(/\D/g, '') !== ''); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function dec(n) { return String(n).replace('.', ','); }
  function ym(months) { var y = Math.floor(months / 12), m = months % 12, s = []; if (y) s.push(y + ' năm'); if (m) s.push(m + ' tháng'); return s.length ? s.join(' ') : '0 tháng'; }

  // định dạng nghìn cho ô tiền
  $$('.money').forEach(function (el) {
    el.addEventListener('input', function () {
      var digits = el.value.replace(/\D/g, '').slice(0, 12);
      el.value = digits ? money(digits) : '';
    });
  });

  function setErr(t) { out.err.textContent = t || ''; }
  function showEmpty(msg) {
    out.empty.hidden = false; out.empty.textContent = msg; out.body.hidden = true;
  }

  function readSalary() {
    if (state.mode === 'avg') return has('s-avg') ? num('s-avg') : null;
    var list = [];
    for (var i = 1; i <= 6; i++) { if (!has('s-' + i)) return null; list.push(num('s-' + i)); }
    var avg = C.average(list);
    var box = document.getElementById('six-avg'); if (box) box.textContent = 'Bình quân 6 tháng: ' + money(avg) + ' đồng';
    return avg;
  }

  function compute() {
    var ty = num('t-y'), tm = num('t-m'), by = num('b-y'), bm = num('b-m'), py = num('p-y'), pm = num('p-m');
    var badMonth = tm > 11 || bm > 11 || pm > 11;
    if (badMonth) { setErr('Ô "tháng" nhập từ 0 đến 11; phần năm nhập ở ô bên cạnh.'); showEmpty('Hãy sửa số tháng để xem kết quả.'); return; }
    var total = ty * 12 + tm;
    var salary = readSalary();
    if (total === 0 && salary === null) { setErr(''); showEmpty('Nhập thời gian làm việc và tiền lương để xem kết quả ngay.'); return; }
    if (total === 0) { setErr(''); showEmpty('Nhập tổng thời gian làm việc để xem kết quả.'); return; }
    if (salary === null) { setErr(''); showEmpty(state.mode === 'avg' ? 'Nhập tiền lương bình quân để xem kết quả.' : 'Nhập đủ tiền lương 6 tháng liền kề để xem kết quả.'); return; }
    var sit = state.type === 'thoi-viec' ? $('#situation').value : 'eligible';
    var r = C.calc({ type: state.type, situation: sit, totalMonths: total, unemploymentMonths: by * 12 + bm, paidMonths: py * 12 + pm, avgSalary: salary });
    if (!r.ok) { setErr(r.error); showEmpty('Hãy sửa dữ liệu để xem kết quả.'); return; }
    setErr(''); render(r);
  }

  function render(r) {
    out.empty.hidden = true; out.body.hidden = false;
    if (odo) odo.set(money(r.amount)); else out.amt.textContent = money(r.amount);
    var unit = $('#res-unit'); if (unit) unit.textContent = 'đồng';
    // thanh phân bổ thời gian
    var bh = r.deductMonths ? Math.min(r.deductMonths, r.totalMonths) : 0;
    var by = num('b-y') * 12 + num('b-m'), py = num('p-y') * 12 + num('p-m');
    var T = r.totalMonths || 1;
    out.b1.style.width = (by / T * 100) + '%'; out.b2.style.width = (py / T * 100) + '%'; out.b3.style.width = (r.netMonths / T * 100) + '%';
    var rows = [['Tổng thời gian làm việc', ym(r.totalMonths)]];
    if (by) rows.push(['Trừ thời gian đã tham gia bảo hiểm thất nghiệp', ym(by)]);
    if (py) rows.push(['Trừ thời gian đã được trả trợ cấp', ym(py)]);
    rows.push(['Thời gian còn lại', ym(r.netMonths)]);
    if (r.eligible) {
      rows.push(['Quy đổi để tính trợ cấp', dec(r.years) + ' năm']);
      rows.push(['Tiền lương bình quân 6 tháng', money(r.avgSalary) + ' đồng']);
      rows.push(['Công thức', r.minApplied ? '2 × ' + money(r.avgSalary) + ' (mức thấp nhất)' : dec(r.rate) + ' × ' + dec(r.years) + ' × ' + money(r.avgSalary)]);
      if (r.minApplied) rows.push(['Số tháng lương được trả', '2 tháng (mức thấp nhất)']);
      else rows.push(['Số tháng lương được trả', dec(r.monthsOfSalary) + ' tháng']);
    }
    out.rows.innerHTML = rows.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('');
    var note = '', bad = false;
    if (!r.eligible) { note = r.reason; bad = true; }
    else if (r.netMonths === 0) { note = 'Toàn bộ thời gian làm việc đã được trừ (đã tham gia bảo hiểm thất nghiệp hoặc đã được trả trợ cấp), nên không còn thời gian để tính khoản này.'; bad = true; }
    else if (r.minApplied) note = 'Đã áp dụng mức thấp nhất của trợ cấp mất việc làm là 02 tháng tiền lương.';
    out.note.hidden = !note; out.note.textContent = note; out.note.className = 'res-note' + (bad ? ' bad' : '');
  }

  // chuyển loại trợ cấp
  $$('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      state.type = b.getAttribute('data-v');
      $('.seg').setAttribute('data-v', state.type);
      $$('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $('#sit-wrap').hidden = state.type !== 'thoi-viec'; $('#mv-hint').hidden = state.type !== 'mat-viec';
      var h = $('#res-title'); if (h) h.textContent = state.type === 'thoi-viec' ? 'Trợ cấp thôi việc ước tính' : 'Trợ cấp mất việc làm ước tính';
      compute();
    });
  });
  // chế độ nhập lương
  $$('.sal-mode button').forEach(function (b) {
    b.addEventListener('click', function () {
      state.mode = b.getAttribute('data-m');
      $$('.sal-mode button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $('#sal-avg').hidden = state.mode !== 'avg'; $('#sal-six').hidden = state.mode !== 'six';
      compute();
    });
  });
  form.addEventListener('input', compute);
  form.addEventListener('change', compute);
  form.addEventListener('submit', function (e) { e.preventDefault(); compute(); });
  var reset = $('#sev-reset');
  if (reset) reset.addEventListener('click', function () { form.reset(); setTimeout(compute, 0); });
  compute();
})();


