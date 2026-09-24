
  
(function () {
  let root = document.documentElement;
  let btn = document.getElementById('themeToggle');
  let meta = document.querySelector('meta[name="theme-color"]');
  let barColor = { light: '#eef0fc', dark: '#090a1c' };
  let timer;

  // اعمال تم: رنگ‌ها از CSS و آیکون از روی data-theme عوض می‌شود
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    btn.setAttribute('aria-pressed', theme === 'dark');
    btn.setAttribute('aria-label', theme === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک');
    if (meta) meta.setAttribute('content', barColor[theme]);
  }

  // تغییر نرم: کلاس انیمیشن فقط موقع تغییر تم فعال می‌شود
  function switchTheme(theme, save) {
    root.classList.add('theme-anim');
    apply(theme);
    if (save) { try { localStorage.setItem('theme', theme); } catch (e) {} }
    clearTimeout(timer);
    timer = setTimeout(function () { root.classList.remove('theme-anim'); }, 700);
  }

  apply(root.getAttribute('data-theme') || 'light');

  btn.addEventListener('click', function () {
    switchTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  // اگر کاربر دستی انتخاب نکرده باشد، از تنظیم سیستم پیروی می‌کند
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) switchTheme(e.matches ? 'dark' : 'light', false);
  });
})();



// نوار پایین: فرورفتگی و نقطه زیر آیتم فعال، با انیمیشن لغزشی
(function () {
  var nav = document.querySelector('.bottom-nav');
  var svg = nav.querySelector('.nav-bg');
  var fill = svg.querySelector('.fill');
  var line = svg.querySelector('.line');
  var dot = nav.querySelector('.nav-dot');
  var items = nav.querySelectorAll('.nav-item');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HALF = 42, FLAT = 14, DEPTH = 18; // نصف عرض، نصف کف، و عمق فرورفتگی
  var cur = null, raf = 0;

  function draw(c) {
    var W = nav.clientWidth, H = nav.clientHeight;
    if (!W) return;
    c = Math.max(HALF, Math.min(W - HALF, c));
    var top = 'M0 .5H' + (c - HALF) +
      'C' + (c - HALF + 14) + ' .5 ' + (c - FLAT - 14) + ' ' + DEPTH + ' ' + (c - FLAT) + ' ' + DEPTH +
      'H' + (c + FLAT) +
      'C' + (c + FLAT + 14) + ' ' + DEPTH + ' ' + (c + HALF - 14) + ' .5 ' + (c + HALF) + ' .5' +
      'H' + W;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    fill.setAttribute('d', top + 'V' + H + 'H0Z');
    line.setAttribute('d', top);
    dot.style.transform = 'translateX(' + (c - 5) + 'px)';
  }

  function targetX() {
    var r = nav.querySelector('.nav-item.active').getBoundingClientRect();
    return r.left - nav.getBoundingClientRect().left + r.width / 2;
  }

  function go(to, animate) {
    cancelAnimationFrame(raf);
    if (cur === null || !animate || reduce) { cur = to; draw(to); return; }
    var from = cur, t0 = performance.now(), dur = 480;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), q = p - 1;
      var e = 1 + 2.3 * q * q * q + 1.3 * q * q; // easeOutBack ملایم
      cur = from + (to - from) * e;
      draw(cur);
      if (p < 1) raf = requestAnimationFrame(step); else { cur = to; draw(to); }
    })(t0);
  }

  items.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('href') === '#') e.preventDefault();
      if (a.classList.contains('active')) return;
      var old = nav.querySelector('.nav-item.active');
      old.classList.remove('active'); old.removeAttribute('aria-current');
      a.classList.add('active'); a.setAttribute('aria-current', 'page');
      go(targetX(), true);
    });
  });

  nav.classList.add('has-notch');
  go(targetX(), false);
  new ResizeObserver(function () { go(targetX(), false); }).observe(nav);
})();