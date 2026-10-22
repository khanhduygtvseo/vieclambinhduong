/* Việc Làm Bình Dương · tương tác giao diện (không gọi dịch vụ ngoài, không lưu dữ liệu người dùng) */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.remove('no-js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ---------- Mở trực tiếp từ máy (file://): thêm index.html vào liên kết thư mục ---------- */
  if (location.protocol === 'file:') {
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
      var m = h.match(/^([^#]*)(#.*)?$/), p = m[1], hash = m[2] || '';
      if (p === '' ) return;
      if (p === './' || /\/$/.test(p)) a.setAttribute('href', p + 'index.html' + hash);
    });
  }

  /* ---------- Chuyển trang: tấm màn 5 cột ---------- */
  var FLAG = 'bd-wipe';
  try { if (sessionStorage.getItem(FLAG)) { root.classList.add('is-entering'); sessionStorage.removeItem(FLAG); setTimeout(function () { root.classList.remove('is-entering'); }, 900); } } catch (e) {}
  window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('is-leaving'); });
  if (!reduce) {
    d.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      if (a.protocol !== location.protocol || a.host !== location.host) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel):/.test(href)) return;
      if (a.pathname === location.pathname && a.hash) return;
      if (a.pathname === location.pathname && a.search === location.search) return;
      e.preventDefault();
      try { sessionStorage.setItem(FLAG, '1'); } catch (er) {}
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = a.href; }, 460);
    });
  }

  /* ---------- Header: ẩn khi cuộn xuống, hiện khi cuộn lên ---------- */
  var hd = $('.hd'), lastY = window.pageYOffset, ticking = false;
  var ring = $('.top-ring'), fg = ring && $('.fg', ring);
  function onScroll() {
    var y = window.pageYOffset;
    if (hd) {
      hd.classList.toggle('raised', y > 8);
      var open = root.classList.contains('nav-open');
      if (!open) hd.classList.toggle('hide', y > lastY && y > 220);
    }
    if (ring) {
      var h = d.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, y / h) : 0;
      if (fg) fg.style.strokeDashoffset = String(163.4 * (1 - p));
      ring.classList.toggle('on', y > 520);
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(onScroll); } }, { passive: true });
  onScroll();
  if (ring) ring.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- Menu ---------- */
  var burger = $('.burger');
  if (burger) burger.addEventListener('click', function () {
    var on = root.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (hd) hd.classList.remove('hide');
  });
  $$('.dd-t').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var it = b.closest('.nav-item'), on = it.classList.toggle('open');
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  });
  d.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item')) $$('.nav-item.open').forEach(function (i) { i.classList.remove('open'); var t = $('.dd-t', i); if (t) t.setAttribute('aria-expanded', 'false'); });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { $$('.nav-item.open').forEach(function (i) { i.classList.remove('open'); }); root.classList.remove('nav-open'); }
  });

  /* ---------- Tách chữ và hiện dần khi cuộn ---------- */
  var wi = 0;
  function splitNode(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = d.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
          var sp = d.createElement('span'), inner = d.createElement('span');
          sp.className = 'sp'; sp.setAttribute('aria-hidden', 'true');
          inner.textContent = part; inner.style.setProperty('--w', wi++);
          sp.appendChild(inner); frag.appendChild(sp);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) splitNode(n);
    });
  }
  $$('[data-split]').forEach(function (el) {
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    wi = 0; splitNode(el);
    el.setAttribute('aria-label', label);
  });
  var targets = $$('[data-r], [data-split]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else targets.forEach(function (t) { t.classList.add('in'); });

  /* ---------- Bộ đếm cuốn chiếu ---------- */
  function Odo(el) { this.el = el; this.len = -1; }
  Odo.prototype.set = function (str) {
    var el = this.el;
    if (this.len !== str.length) {
      el.innerHTML = '';
      for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        if (/\d/.test(ch)) {
          var w = d.createElement('span'); w.className = 'odo-d';
          var col = d.createElement('span'); col.className = 'col';
          for (var k = 0; k < 10; k++) { var it = d.createElement('i'); it.textContent = k; col.appendChild(it); }
          w.appendChild(col); el.appendChild(w);
        } else { var s = d.createElement('span'); s.className = 'odo-s'; s.textContent = ch; el.appendChild(s); }
      }
      this.len = str.length;
    }
    var cols = $$('.col', el), j = 0;
    for (var m = 0; m < str.length; m++) if (/\d/.test(str.charAt(m))) { cols[j++].style.transform = 'translateY(' + (-1.2 * Number(str.charAt(m))) + 'em)'; }
    el.setAttribute('aria-label', str);
  };
  window.CV = { Odo: Odo, reduce: reduce };
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  $$('[data-odo]').forEach(function (el) {
    var target = Number(el.getAttribute('data-odo')), o = new Odo(el);
    var settle = function () { el.textContent = fmt(target); el.setAttribute('aria-label', fmt(target)); };
    if (reduce) { settle(); return; }
    o.set(fmt(target).replace(/\d/g, '0'));
    var obs = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { obs.disconnect(); setTimeout(function () { o.set(fmt(target)); setTimeout(settle, 2000); }, 150); }
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  /* ---------- Nghiêng 3D và đèn rọi theo chuột ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(function (el) {
      var f = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        if (f) return;
        f = raf(function () {
          f = null;
          el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
          el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 9).toFixed(2) + 'deg) translateZ(0)';
        });
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    // vòng con trỏ
    var cur = d.createElement('div'); cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true'); d.body.appendChild(cur);
    var cx = 0, cy = 0, tx = 0, ty = 0, run = false;
    function loop() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) raf(loop); else run = false; }
    d.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); if (!run) { run = true; raf(loop); } });
    d.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
    d.addEventListener('pointerover', function (e) { cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button, summary, .area-row, .scroll-track'))); });
    d.addEventListener('pointerdown', function () { cur.classList.add('down'); });
    d.addEventListener('pointerup', function () { cur.classList.remove('down'); });
  }

  /* ---------- Hero: trượt ảnh ---------- */
  var hero = $('.hero');
  if (hero) {
    var slides = $$('.hero-slide', hero), pills = $$('.pill', hero), cur2 = 0, timer = null;
    var go = function (n) {
      if (n === cur2 || !slides[n]) return;
      slides.forEach(function (s) { s.classList.remove('prev'); });
      slides[cur2].classList.remove('on'); slides[cur2].classList.add('prev');
      slides[n].classList.add('on');
      slides.forEach(function (s, i) { s.tabIndex = i === n ? 0 : -1; });
      pills.forEach(function (p, i) { p.classList.toggle('on', i === n); p.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
      var old = cur2; cur2 = n;
      clearTimeout(timer); timer = setTimeout(function () { slides[old].classList.remove('prev'); }, 1100);
    };
    pills.forEach(function (p, i) {
      p.addEventListener('click', function () {
        if (i === cur2) return;
        // khởi động lại thanh tiến độ
        p.classList.remove('on'); void p.offsetWidth; go(i);
      });
      var bar = $('i', p);
      if (bar && !reduce) bar.addEventListener('animationend', function () { if (p.classList.contains('on')) go((cur2 + 1) % slides.length); });
    });
    hero.addEventListener('pointerenter', function () { hero.classList.add('paused'); });
    hero.addEventListener('pointerleave', function () { hero.classList.remove('paused'); });
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go((cur2 + (dx < 0 ? 1 : slides.length - 1)) % slides.length);
    }, { passive: true });
  }

  /* ---------- Thanh cuộn ngang (kéo bằng chuột) ---------- */
  $$('.scroller').forEach(function (sc) {
    var tr = $('.scroll-track', sc), bar = $('.scroll-bar i', sc), down = false, sx = 0, sl = 0, moved = 0;
    function upd() { var max = tr.scrollWidth - tr.clientWidth; var w = tr.clientWidth / tr.scrollWidth * 100; if (bar) { bar.style.width = w + '%'; bar.style.marginLeft = (max > 0 ? tr.scrollLeft / max * (100 - w) : 0) + '%'; } }
    tr.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    tr.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = tr.scrollLeft; tr.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); tr.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; tr.classList.remove('drag'); });
    tr.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    $$('.round', sc).forEach(function (b) { b.addEventListener('click', function () { tr.scrollBy({ left: Number(b.getAttribute('data-dir')) * 362, behavior: reduce ? 'auto' : 'smooth' }); }); });
  });

  /* ---------- Tab lọc bài viết ---------- */
  var tabs = $$('.tab');
  if (tabs.length) {
    var cards = $$('.pcard[data-tab]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        var id = t.getAttribute('data-tab'), k = 0;
        cards.forEach(function (c) {
          var show = id === 'all' || c.getAttribute('data-tab') === id;
          c.classList.toggle('hide', !show);
          c.classList.remove('pop');
          if (show) { void c.offsetWidth; c.style.animationDelay = (k++ * 70) + 'ms'; c.classList.add('pop'); }
        });
      });
    });
    // mở sẵn chủ đề theo đường dẫn, ví dụ cam-nang/#ung-tuyen
    var pick = function () { var id = location.hash.slice(1); tabs.forEach(function (t) { if (id && t.getAttribute('data-tab') === id) { t.click(); } }); };
    pick(); window.addEventListener('hashchange', pick);
  }

  /* ---------- Mục lục theo dõi cuộn ---------- */
  var toc = $('.toc');
  if (toc) {
    var links = $$('ol a', toc), ind = $('.toc-ind', toc), heads = links.map(function (a) { return d.getElementById(a.getAttribute('href').slice(1)); });
    var tg = $('.toc-toggle', toc);
    if (tg) tg.addEventListener('click', function () { var o = toc.classList.toggle('open'); tg.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    links.forEach(function (a) { a.addEventListener('click', function () { toc.classList.remove('open'); }); });
    var setOn = function (i) {
      links.forEach(function (a, k) { a.classList.toggle('on', k === i); });
      if (ind && links[i]) { ind.style.top = links[i].offsetTop + 'px'; ind.style.height = links[i].offsetHeight + 'px'; }
    };
    var spy = function () {
      var cur = 0, line = window.innerHeight * 0.3;
      heads.forEach(function (h, i) { if (h && h.getBoundingClientRect().top < line) cur = i; });
      setOn(cur);
    };
    window.addEventListener('scroll', function () { raf(spy); }, { passive: true }); spy();
  }

  /* ---------- Hỏi đáp: mở đóng mượt ---------- */
  $$('.faq details').forEach(function (det) {
    var sum = $('summary', det), ans = $('.ans', det);
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (reduce || !ans.animate) { det.open = !det.open; return; }
      if (!det.open) {
        det.open = true; var h = ans.scrollHeight;
        ans.animate([{ height: '0px' }, { height: h + 'px' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else {
        var h2 = ans.offsetHeight;
        var an = ans.animate([{ height: h2 + 'px' }, { height: '0px' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
        an.onfinish = function () { det.open = false; };
      }
    });
  });
})();
