/* ==========================================================================
   SESKA INVESTMENTS LTD — motion system (v2)
   GSAP + ScrollTrigger for choreography, Lenis for smooth scroll.
   Every effect is expressed in print language: registration, paper, ink,
   halftone, guillotine cuts and sheet feeds.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var MOBILE = window.matchMedia('(max-width: 820px)').matches;
  var HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var WHATSAPP = '256200926763';
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  var audioCtx = null, sfxEnabled = false;
  try {
    if (sessionStorage.getItem('seska-sfx') === '1') sfxEnabled = true;
  } catch (e) {}

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  if (!HAS_GSAP) { root.classList.remove('js'); root.classList.add('no-js'); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (!REDUCED && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function stopScroll() { if (lenis) lenis.stop(); document.body.classList.add('menu-open'); }
  function startScroll() { if (lenis) lenis.start(); document.body.classList.remove('menu-open'); }
  function scrollVelocity() { return lenis ? lenis.velocity : 0; }

  /* ---------- Buttons: inject CMYK registration lines ---------- */
  $$('.btn').forEach(function (b) {
    var r = document.createElement('span'); r.className = 'reg-lines'; r.setAttribute('aria-hidden', 'true');
    r.innerHTML = '<i></i><i></i><i></i>'; b.appendChild(r);
  });

  /* ======================================================================
     OPENING LOADER — four CMYK layers register, logo appears,
     the sheet leaves the press.
     ====================================================================== */
  var pageReady = [], isReady = false;
  function onReady(fn) { if (isReady) fn(); else pageReady.push(fn); }
  function fireReady() { isReady = true; pageReady.forEach(function (fn) { fn(); }); pageReady = []; }

  var loader = $('#loader');
  var fromNav = root.classList.contains('from-nav');
  if (loader && !root.classList.contains('seen') && !REDUCED && !fromNav) {
    store.set('seska-seen', '1');
    stopScroll();
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: function () { loader.remove(); startScroll(); } });
    tl.to('.loader-loc', { opacity: 1, duration: .5 }, .15)
      .fromTo('.reg-c', { x: -16, y: -7, opacity: .9 }, { x: 0, y: 0, duration: .55, ease: 'expo.out' }, .35)
      .fromTo('.reg-m', { x: 13, y: 8, opacity: .9 }, { x: 0, y: 0, duration: .55, ease: 'expo.out' }, .38)
      .fromTo('.reg-y', { x: -5, y: 13, opacity: .9 }, { x: 0, y: 0, duration: .55, ease: 'expo.out' }, .41)
      .to('.reg-k', { opacity: 1, duration: .15 }, .9)
      .to('.reg-l', { opacity: 0, duration: .25 }, 1.0)
      .fromTo('.loader-logo', { opacity: 0, y: 14, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .6 }, 1.05)
      .to('.loader-sheet', { yPercent: -108, rotateX: 10, duration: 1.05, ease: 'expo.inOut' }, 1.9)
      .add(fireReady, 2.35);
  } else {
    if (loader) loader.remove();
    store.set('seska-seen', '1');
    fireReady();
  }

  /* ======================================================================
     PAGE TRANSITION — sheet feed in / out
     ====================================================================== */
  var sheet = $('#page-sheet');
  var sheetSpan = sheet && sheet.firstElementChild;
  if (sheet && fromNav) {
    store.del('seska-nav');
    gsap.set(sheet, { visibility: 'visible' });
    gsap.fromTo(sheetSpan, { yPercent: 0 }, { yPercent: -108, rotateX: 8, duration: REDUCED ? 0 : .8, ease: 'expo.inOut', delay: .05,
      onComplete: function () { gsap.set(sheet, { visibility: 'hidden' }); root.classList.remove('from-nav'); } });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || /^(mailto|tel|https?):/i.test(href) || !/\.html(#.*)?$/.test(href)) return;
    if (REDUCED || !sheet) return;
    e.preventDefault();
    store.set('seska-nav', '1');
    gsap.set(sheet, { visibility: 'visible' });
    gsap.fromTo(sheetSpan, { yPercent: 108, rotateX: -10 }, { yPercent: 0, rotateX: 0, duration: .6, ease: 'expo.in', onComplete: function () { window.location.href = href; } });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted && sheet) { gsap.set(sheet, { visibility: 'hidden' }); store.del('seska-nav'); } });

  /* ======================================================================
     FLOATING PILL NAV + PRINTED-SHEET MENU
     ====================================================================== */
  var pill = $('#pill-nav');
  var lastY = 0;
  function onScrollNav(y) {
    if (!pill) return;
    var menuOpen = document.body.classList.contains('menu-open');
    if (!menuOpen) pill.classList.toggle('is-hidden', y > 300 && y > lastY + 2);
    if (y < lastY - 2) pill.classList.remove('is-hidden');
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function (l) { onScrollNav(l.scroll); });
  else window.addEventListener('scroll', function () { onScrollNav(window.scrollY); }, { passive: true });

  var menuBtn = $('.menu-btn'), menu = $('#sheet-menu');
  var menuTl = null;
  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    $('.menu-btn-label').textContent = 'Close';
    stopScroll();
    menuTl = gsap.timeline();
    menuTl.fromTo('.sheet-paper', { clipPath: 'inset(0 0 100% 0)', rotateX: -6 }, { clipPath: 'inset(0 0 0% 0)', rotateX: 0, duration: REDUCED ? 0 : .75, ease: 'expo.inOut' })
      .fromTo('.menu-list a', { yPercent: 110 }, { yPercent: 0, duration: REDUCED ? 0 : .7, stagger: .05, ease: 'expo.out' }, '-=.25')
      .fromTo('.sheet-aside > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .06 }, '-=.5');
    setTimeout(function () { var f = $('.menu-list a'); if (f) f.focus(); }, 300);
  }
  function closeMenu() {
    menuBtn.setAttribute('aria-expanded', 'false');
    $('.menu-btn-label').textContent = 'Menu';
    gsap.to('.sheet-paper', { clipPath: 'inset(0 0 100% 0)', duration: REDUCED ? 0 : .6, ease: 'expo.inOut', onComplete: function () { menu.hidden = true; startScroll(); } });
    menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu(); });
    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') closeMenu();
      if (e.key === 'Tab') {  // keep focus inside the sheet + menu button
        var f = [menuBtn].concat($$('a, button', menu));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ======================================================================
     CROP-MARK CURSOR — only over media / services / products
     ====================================================================== */
  if (FINE && !REDUCED) {
    var cur = $('#cursor'), label = cur && $('.cursor-label', cur);
    if (cur) {
      root.classList.add('has-cursor');
      var cx = -100, cy = -100, tx = -100, ty = -100;
      document.addEventListener('pointermove', function (e) {
        tx = e.clientX; ty = e.clientY;
        var t = e.target.closest && e.target.closest('[data-cursor]');
        if (t) { label.textContent = t.getAttribute('data-cursor'); cur.classList.add('is-on'); }
        else cur.classList.remove('is-on');
      });
      document.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });
      gsap.ticker.add(function () { cx += (tx - cx) * .22; cy += (ty - cy) * .22; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; });
    }

    /* Magnetic buttons */
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .28).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .4).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* ======================================================================
     TEXT VOCABULARY
     ====================================================================== */
  // In-view helper
  function inView(els, fn, opts) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); } });
    }, opts || { threshold: .2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // Vertical cut reveal: split into characters that lock together
  $$('[data-cut]').forEach(function (el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var word = document.createElement('span'); word.style.whiteSpace = 'nowrap'; word.style.display = 'inline-block';
            word.setAttribute('aria-hidden', 'true');
            w.split('').forEach(function (c) {
              var o = document.createElement('span'); o.className = 'cut-char';
              o.style.setProperty('--i', n); o.style.setProperty('--dir', n % 2 ? -1 : 1); n++;
              var inner = document.createElement('span'); inner.textContent = c; o.appendChild(inner); word.appendChild(o);
            });
            frag.appendChild(word);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(el);
  });
  inView($$('[data-cut]'), function (el) { el.classList.add('is-in'); });
  inView($$('[data-inview]'), function (el) { el.classList.add('is-in'); }, { threshold: .15 });
  onReady(function () { inView($$('.mask-reveal:not(.hx-title)'), function (el) { el.classList.add('is-in'); }); });

  // Flip words
  $$('[data-flip]').forEach(function (el) {
    var words = $$('span', el), i = 0;
    if (words.length < 2 || REDUCED) return;
    setInterval(function () {
      var cur = words[i]; i = (i + 1) % words.length; var nx = words[i];
      cur.classList.remove('is-on'); cur.classList.add('is-off');
      nx.classList.remove('is-off'); nx.classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-off'); }, 650);
    }, 2200);
  });

  // Scramble / decode for technical production text
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';
  inView($$('[data-scramble]'), function (el) {
    if (REDUCED) return;
    var final = el.textContent, start = null, dur = 900;
    (function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), out = '';
      for (var i = 0; i < final.length; i++) {
        var ch = final[i];
        out += (ch === ' ' || i / final.length < p) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
    })(performance.now());
  }, { threshold: .6 });

  // Mechanical odometer count
  $$('[data-odo]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-odo'), 10);
    var txt = target.toLocaleString('en-US'), suf = el.getAttribute('data-suffix') || '';
    el.innerHTML = '';
    var di = 0;
    txt.split('').forEach(function (ch) {
      if (/\d/.test(ch)) {
        var col = document.createElement('span'); col.className = 'odo-d'; col.style.setProperty('--i', di++);
        col.setAttribute('data-v', ch);
        for (var k = 0; k <= 9; k++) { var s = document.createElement('span'); s.textContent = k; col.appendChild(s); }
        el.appendChild(col);
      } else { var sp = document.createElement('span'); sp.textContent = ch; el.appendChild(sp); }
    });
    if (suf) { var s2 = document.createElement('span'); s2.className = 'odo-s'; s2.textContent = suf; el.appendChild(s2); }
    $$('span', el).forEach(function (s) { s.setAttribute('aria-hidden', 'true'); });
  });
  inView($$('[data-odo]'), function (el) {
    $$('.odo-d', el).forEach(function (col) { col.style.transform = 'translateY(-' + col.getAttribute('data-v') + 'em)'; });
  }, { threshold: .5 });

  // Variable proximity (service categories): weight follows the pointer
  $$('[data-proximity]').forEach(function (el) {
    var chars = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var f = document.createDocumentFragment();
      n.textContent.split('').forEach(function (c) { var s = document.createElement('span'); s.textContent = c; s.style.transition = 'font-weight .15s'; f.appendChild(s); chars.push(s); });
      el.replaceChild(f, n);
    });
    if (!FINE) return;
    var host = el.closest('[data-proximity-host]') || el;
    host.addEventListener('pointermove', function (e) {
      chars.forEach(function (s) {
        var r = s.getBoundingClientRect(); var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        s.style.fontWeight = Math.round((900 - Math.min(d / 140, 1) * 500) / 100) * 100;
      });
    });
    host.addEventListener('pointerleave', function () { chars.forEach(function (s) { s.style.fontWeight = ''; }); });
  });

  /* ======================================================================
     PRINT TRANSITIONS
     ====================================================================== */
  // CMYK registration: layers snap into alignment as media enters
  $$('[data-reg]').forEach(function (el) {
    el.classList.add('regimg');
    ['c', 'm', 'y'].forEach(function (k) { var s = document.createElement('span'); s.className = 'rl rl-' + k; el.appendChild(s); });
  });
  inView($$('[data-reg]'), function (el) {
    if (REDUCED) return;
    var L = $$('.rl', el), o = [[-18, -8], [14, 9], [-6, 14]];
    L.forEach(function (l, i) {
      gsap.fromTo(l, { opacity: .5, x: o[i][0], y: o[i][1] }, { opacity: 0, x: 0, y: 0, duration: .38, delay: i * .03, ease: 'power2.out' });
    });
    var img = $('img', el);
    if (img) gsap.fromTo(img, { filter: 'saturate(1.8) contrast(1.15)' }, { filter: 'saturate(1) contrast(1)', duration: .5, clearProps: 'filter' });
  }, { threshold: .35 });

  // Halftone resolve: big dots shrink until the photo is clear
  function halftone(img) {
    var wrap = img.parentElement;
    var cvs = document.createElement('canvas'); cvs.className = 'ht-canvas'; cvs.setAttribute('aria-hidden', 'true');
    wrap.appendChild(cvs);
    var ctx = cvs.getContext('2d'), sample = document.createElement('canvas'), sctx = sample.getContext('2d', { willReadFrequently: true });
    var ok = true, lastCell = 0;
    function draw(p) {
      if (!ok || !img.complete || !img.naturalWidth) return;
      var w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
      if (cvs.width !== w) { cvs.width = w; cvs.height = h; }
      var cell = Math.round(22 - p * 16);
      if (p >= .98) { ctx.clearRect(0, 0, w, h); cvs.style.opacity = 0; return; }
      cvs.style.opacity = 1;
      var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      try {
        if (cell !== lastCell) {
          sample.width = cols; sample.height = rows;
          var ir = img.naturalWidth / img.naturalHeight, br = w / h, sw, sh, sx, sy;
          if (ir > br) { sh = img.naturalHeight; sw = sh * br; sx = (img.naturalWidth - sw) / 2; sy = 0; } else { sw = img.naturalWidth; sh = sw / br; sx = 0; sy = (img.naturalHeight - sh) / 2; }
          sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
          lastCell = cell;
        }
        var d = sctx.getImageData(0, 0, cols, rows).data;
      } catch (err) { ok = false; cvs.remove(); return; }   // e.g. opened from file:// — just show the photo
      ctx.globalAlpha = 1 - p * .6;
      ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4, lum = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255;
        var r = cell * .5 * Math.sqrt(1 - lum * .85) * (1 + p * .5);
        ctx.fillStyle = 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')';
        ctx.beginPath(); ctx.arc(x * cell + cell / 2, y * cell + cell / 2, Math.min(r, cell * .72), 0, 6.283); ctx.fill();
      }
    }
    var trig = ST.create({ trigger: wrap, start: 'top 95%', end: 'top 35%', onUpdate: function (s) { draw(s.progress); }, onLeave: function () { draw(1); }, onEnterBack: function (s) { draw(s.progress); } });
    img.addEventListener('load', function () { draw(trig.progress); });
    draw(0);
  }
  if (!REDUCED) $$('img[data-halftone]').forEach(halftone);

  // Paper cut: a guillotine-straight wipe over the previous section
  $$('[data-papercut]').forEach(function (el) {
    if (REDUCED) return;
    gsap.fromTo(el, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: .4 } });
  });

  // Sheet feed: section rises like paper fed into a press
  $$('[data-sheetfeed]').forEach(function (el) {
    if (REDUCED) return;
    gsap.fromTo(el, { rotateX: 16, yPercent: 10, scale: .94 }, { rotateX: 0, yPercent: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: .5 } });
  });

  // Photo drifts inside its frame
  $$('[data-parallax-img]').forEach(function (img) {
    if (REDUCED) return;
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Depth parallax
  $$('[data-parallax]').forEach(function (el) {
    if (REDUCED || MOBILE) return;
    var s = parseFloat(el.getAttribute('data-parallax')) || .1;
    gsap.fromTo(el, { y: s * 600 }, { y: -s * 600, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ======================================================================
     HOME — HERO: contained media → full bleed → type morph → type mask
     ====================================================================== */
  var hero = $('#hero');
  if (hero) {
    // Photo-led production slideshow
    var slides = $$('.hx-slides img', hero), si = 0, slideTimer = null;
    if (slides.length > 1 && !REDUCED) slideTimer = setInterval(function () { slides[si].classList.remove('is-on'); si = (si + 1) % slides.length; slides[si].classList.add('is-on'); }, 3200);

    // Place the mask's zoom origin inside the "I" of PRINT so the video becomes the doorway
    var maskWord = $('.hx-mask span', hero);
    if (maskWord) maskWord.innerHTML = 'PR<i style="font-style:normal">I</i>NT';

    onReady(function () { $('.hx-title', hero).classList.add('is-in'); if (REDUCED) gsap.set('.hx-sub, .hx-loc', { opacity: 1 }); else gsap.fromTo('.hx-sub, .hx-loc', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, delay: .45, stagger: .08, ease: 'power3.out' }); });

    if (REDUCED) {
      gsap.set('.hx-media', { clipPath: 'inset(0% 0% 0% 0% round 0px)' });
      gsap.set('.hx-shade', { opacity: 1 }); gsap.set('.hx-title', { color: '#fff' }); gsap.set('.hx-float', { display: 'none' });
      gsap.set('.hx-loc, .hx-sub .lead', { color: '#fff' }); gsap.set('.hx-actions .btn-ghost', { color: '#fff' });
    } else {
      var mq = gsap.matchMedia();
      mq.add({ desk: '(min-width: 821px)', mob: '(max-width: 820px)' }, function (c) {
        var desk = c.conditions.desk;
        gsap.set('.hx-media', { clipPath: desk ? 'inset(24% 5% 22% 60% round 12px)' : 'inset(70% 5% 4% 5% round 12px)' });
        var i = $('.hx-mask i', hero);
        var htl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: desk ? '+=260%' : '+=190%', scrub: .7, pin: true, anticipatePin: 1,
          onRefresh: function () { if (i) { var r = i.getBoundingClientRect(), p = maskWord.getBoundingClientRect(); gsap.set(maskWord, { transformOrigin: ((r.left + r.width / 2 - p.left) / p.width * 100) + '% 52%' }); } } } });
        htl.to('.hx-media', { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1 }, 0)
          .to('.hx-shade', { opacity: 1, duration: .6 }, .25)
          .fromTo('.hx-loc, .hx-sub, .hx-hint', { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: .35, immediateRender: false }, 0)
          .to('.hx-l1 .mv', { xPercent: -5, duration: 1 }, 0)
          .to('.hx-l2 .mv', { scaleX: 1.16, duration: 1 }, 0)
          .to('.hx-at', { x: '-2vw', duration: 1 }, 0)
          .to('.hx-best', { x: desk ? '12vw' : '6vw', duration: 1 }, 0)
          .to('.hx-title', { color: '#ffffff', duration: .35 }, .2);
        $$('.hx-float', hero).forEach(function (f) {
          var d = parseFloat(f.getAttribute('data-depth')) || -1;
          htl.to(f, { y: d * (desk ? 380 : 220), x: d * 40, rotate: d * 10, opacity: 0, duration: .9 }, 0);
        });
        htl.to('.hx-title', { opacity: 0, y: -80, duration: .45 }, 1.15)
          .to('.hx-mask', { opacity: 1, duration: .22 }, 1.3)
          .fromTo('.hx-mask span', { scale: .9 }, { scale: 1, duration: .35 }, 1.3)
          .to('.hx-mask span', { scale: 60, duration: 1.3, ease: 'power3.in' }, 1.85)
          .to('.hx-mask', { opacity: 0, duration: .2 }, 3.0);
      });
    }
  }

  /* Scroll-velocity ticker */
  $$('[data-velocity]').forEach(function (row) {
    var dir = parseFloat(row.getAttribute('data-velocity')) || 1, x = 0, half = 0;
    function measure() { half = row.scrollWidth / 2; }
    measure(); window.addEventListener('resize', measure);
    if (REDUCED) return;
    gsap.ticker.add(function (t, dt) {
      var v = scrollVelocity();
      x -= dir * (0.06 + Math.min(Math.abs(v) * .03, 1.2)) * dt * (v < 0 ? -1 : 1);
      if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
      row.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    });
  });

  /* Media between text: footage physically opens between the words */
  $$('[data-mbt] .mbt-media').forEach(function (m) {
    if (REDUCED) { m.style.width = '2.2em'; return; }
    gsap.fromTo(m, { width: 0 }, { width: MOBILE ? '1.6em' : '2.4em', ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top 88%', end: 'top 40%', scrub: .5 } });
  });

  /* Flowing services index: band enters from the edge the pointer came in */
  $$('.flow-row').forEach(function (row) {
    var band = $('.flow-band', row), link = $('.flow-link', row);
    function edge(e) { var r = row.getBoundingClientRect(); return (e.clientY - r.top) < r.height / 2 ? -101 : 101; }
    row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; gsap.fromTo(band, { yPercent: edge(e) }, { yPercent: 0, duration: .5, ease: 'expo.out' }); });
    row.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; gsap.to(band, { yPercent: edge(e), duration: .5, ease: 'expo.out' }); });
    link.addEventListener('focus', function () { gsap.to(band, { yPercent: 0, duration: .4 }); });
    link.addEventListener('blur', function () { gsap.to(band, { yPercent: 101, duration: .4 }); });
  });

  /* Image trail: WHAT WE MAKE */
  var trail = $('#trail');
  if (trail && !REDUCED) {
    var pics = ['business-cards', 'pvc-id-card', 'rollup-banner', 'brochures', 'branded-tshirt', 'signage-panel', 'mug', 'stickers', 'work-billboard', 'work-polo-shirts'];
    pics.forEach(function (p) { var im = new Image(); im.src = 'images/' + p + '.jpg'; });
    var lx = null, ly = null, idx = 0, live = 0;
    trail.addEventListener('pointermove', function (e) {
      var r = trail.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (lx === null) { lx = x; ly = y; return; }
      if (Math.hypot(x - lx, y - ly) < (e.pointerType === 'touch' ? 60 : 90) || live > 16) return;
      lx = x; ly = y; live++;
      var el = document.createElement('figure'); el.className = 'trail-img';
      el.innerHTML = '<img src="images/' + pics[idx++ % pics.length] + '.jpg" alt="">';
      trail.appendChild(el);
      var w = el.offsetWidth, h = el.offsetHeight, rot = (Math.random() - .5) * 18;
      gsap.set(el, { x: x - w / 2, y: y - h / 2, rotate: rot });
      gsap.timeline({ onComplete: function () { el.remove(); live--; } })
        .fromTo(el, { scale: .3, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(1.6)' })
        .to(el, { scale: .85, opacity: 0, y: '+=60', rotate: rot * 1.6, duration: .6, ease: 'power2.in' }, .75);
    });
    trail.addEventListener('pointerleave', function () { lx = ly = null; });
  }

  /* 3D PVC ID card: drag to rotate, flip button */
  $$('[data-idcard]').forEach(function (card) {
    var stage = card.parentElement, ry = -18, rx = 6, dragging = false, sx = 0, sy = 0, bry = 0, brx = 0;
    function apply() { card.style.setProperty('--ry', ry + 'deg'); card.style.setProperty('--rx', rx + 'deg'); $$('.id-shine', card).forEach(function (s) { s.style.setProperty('--shine', (50 + (ry % 360) / 3) + '%'); }); }
    apply();
    stage.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; dragging = true; sx = e.clientX; sy = e.clientY; bry = ry; brx = rx; card.classList.add('is-drag'); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', function (e) {
      if (dragging) { ry = bry + (e.clientX - sx) * .6; rx = Math.max(-35, Math.min(35, brx - (e.clientY - sy) * .4)); apply(); }
      else if (FINE) { var r = stage.getBoundingClientRect(); var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; card.style.setProperty('--ry', (ry + px * 22) + 'deg'); card.style.setProperty('--rx', (rx - py * 16) + 'deg'); }
    });
    function end() { dragging = false; card.classList.remove('is-drag'); }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('pointerleave', function () { if (!dragging) apply(); });
    var flip = $('[data-id-flip]', stage);
    if (flip) flip.addEventListener('click', function () { ry += 180; apply(); });
  });

  /* Comet cards: tiny perspective response on premium pieces only */
  if (FINE && !REDUCED) $$('.comet').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - py) * 12).toFixed(2) + 'deg');
      c.style.setProperty('--gx', (px * 100) + '%'); c.style.setProperty('--gy', (py * 100) + '%');
    });
    c.addEventListener('pointerleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  });

  /* INK FLOOD — ink fills the word, the word becomes a window onto the photo */
  var flood = $('#flood');
  if (flood && !REDUCED) {
    var fi = $('.flood-inner', flood), out = $('.flood-out', flood);
    out.innerHTML = 'WO<i style="font-style:normal">R</i>K';
    var ftl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: flood, start: 'top top', end: '+=220%', scrub: .6, pin: true, anticipatePin: 1,
      onRefresh: function () { var r = $('i', out).getBoundingClientRect(), p = fi.getBoundingClientRect(); if (p.width) gsap.set(fi, { transformOrigin: ((r.left + r.width * .22 - p.left) / p.width * 100) + '% 50%' }); } } });
    ftl.fromTo('.flood-inner', { scale: .86 }, { scale: 1, duration: .6 }, 0)
      .to('.flood-ink', { backgroundPosition: '0 100%', duration: 1 }, .1)
      .to('.flood-img', { opacity: 1, duration: .35 }, 1.15)
      .to('.flood-ink, .flood-out', { opacity: 0, duration: .35 }, 1.25)
      .to('.flood-cap', { opacity: 0, duration: .2 }, 1.1)
      .to('.flood-inner', { scale: 26, duration: 1.4, ease: 'power3.in' }, 1.6);
  }

  /* Expand-from-position project viewer (FLIP) */
  var viewer = $('#viewer');
  if (viewer) {
    var vBg = $('.viewer-bg', viewer), vClose = $('.viewer-close', viewer), vInfo = $('.viewer-info', viewer), active = null, clone = null;
    function openViewer(item) {
      var img = $('img', item), r = img.getBoundingClientRect();
      active = item; stopScroll();
      clone = document.createElement('img'); clone.className = 'viewer-img'; clone.src = img.currentSrc || img.src; clone.alt = img.alt;
      $('h2', vInfo).textContent = ($('figcaption', item) || {}).lastChild ? $('figcaption', item).lastChild.textContent : img.alt;
      $('.mono', vInfo).textContent = ($('figcaption .mono', item) || { textContent: '' }).textContent;
      gsap.set(clone, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 10 });
      viewer.insertBefore(clone, vClose);
      viewer.classList.add('is-open'); viewer.setAttribute('aria-hidden', 'false');
      img.style.visibility = 'hidden';
      gsap.timeline()
        .to(vBg, { opacity: 1, duration: .5 }, 0)
        .to(clone, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, duration: REDUCED ? 0 : .85, ease: 'expo.inOut' }, 0)
        .to([vInfo, vClose], { opacity: 1, duration: .4 }, .6);
      vClose.focus();
    }
    function closeViewer() {
      if (!active) return;
      var img = $('img', active), r = img.getBoundingClientRect(), item = active;
      gsap.timeline({ onComplete: function () { img.style.visibility = ''; clone.remove(); viewer.classList.remove('is-open'); viewer.setAttribute('aria-hidden', 'true'); startScroll(); item.focus(); } })
        .to([vInfo, vClose], { opacity: 0, duration: .2 }, 0)
        .to(clone, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 10, duration: REDUCED ? 0 : .75, ease: 'expo.inOut' }, .1)
        .to(vBg, { opacity: 0, duration: .5 }, .3);
      active = null;
    }
    $$('[data-viewer-group] .dm-item').forEach(function (it) {
      it.setAttribute('role', 'button');
      it.setAttribute('aria-label', 'Open project: ' + $('img', it).alt);
      it.addEventListener('click', function () { openViewer(it); });
      it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(it); } });
    });
    vClose.addEventListener('click', closeViewer);
    vBg.addEventListener('click', closeViewer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active) closeViewer(); });
  }

  /* Text along the registration line */
  $$('[data-textpath]').forEach(function (m) {
    var tp = $('textPath', m); if (!tp || REDUCED) return;
    gsap.fromTo(tp, { attr: { startOffset: '5%' } }, { attr: { startOffset: '-55%' }, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: .5 } });
  });

  /* Tracing beam */
  $$('[data-beam]').forEach(function (b) {
    var fill = $('.beam-fill', b);
    if (fill) gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top 70%', end: 'bottom 65%', scrub: .4 } });
    $$('.beam-step', b).forEach(function (s) { ST.create({ trigger: s, start: 'top 68%', onEnter: function () { s.classList.add('is-in'); }, onLeaveBack: function () { s.classList.remove('is-in'); } }); });
  });

  /* Motto: arrives slowly, holds, commands the screen */
  $$('[data-motto]').forEach(function (m) {
    if (REDUCED) return;
    gsap.timeline({ scrollTrigger: { trigger: m, start: 'top top', end: '+=130%', scrub: 1, pin: true } })
      .fromTo($('h2', m), { opacity: 0, y: 30, letterSpacing: '.08em', filter: 'blur(6px)' }, { opacity: 1, y: 0, letterSpacing: '-.005em', filter: 'blur(0px)', duration: .55, ease: 'power1.out' })
      .fromTo($('p', m), { opacity: 0 }, { opacity: 1, duration: .15 }, .5)
      .to({}, { duration: .45 });
  });

  /* Delivery routes draw out of Kampala */
  $$('[data-routes]').forEach(function (box) {
    var paths = $$('.route-draw', box);
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = REDUCED ? 0 : L; });
    if (REDUCED) return;
    gsap.to(paths, { strokeDashoffset: 0, stagger: .12, ease: 'none', scrollTrigger: { trigger: box, start: 'top 80%', end: 'bottom 60%', scrub: .6 } });
  });

  /* Motion footer: registration rule aligns, wordmark rises */
  var foot = $('#footer');
  if (foot && !REDUCED) {
    gsap.fromTo($$('.reg-rule i', foot), { scaleX: 0, x: function (i) { return [-24, 16, -8, 0][i]; } }, { scaleX: 1, x: 0, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: foot, start: 'top 85%' } });
    gsap.fromTo($$('.mfooter-word span', foot), { yPercent: 100 }, { yPercent: 0, ease: 'none', stagger: .06, scrollTrigger: { trigger: '.mfooter-word', start: 'top bottom', end: 'bottom bottom', scrub: .6 } });
  }

  /* ======================================================================
     INNER PAGES
     ====================================================================== */
  /* Sticky scroll reveal (services) */
  $$('[data-sticky]').forEach(function (wrap) {
    var items = $$('[data-sticky-nav] li', wrap), panels = $$('[data-sticky-panel]', wrap);
    panels.forEach(function (p, i) {
      ST.create({ trigger: p, start: 'top 55%', end: 'bottom 55%', onToggle: function (s) { if (s.isActive) items.forEach(function (it, j) { it.classList.toggle('is-active', i === j); }); } });
    });
  });

  /* Filters (portfolio / products) with a guillotine flash between states */
  $$('[data-filter-group]').forEach(function (g) {
    var targets = $$(g.getAttribute('data-filter-group') + ' [data-cat]'), chips = $$('.chip', g);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var v = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var show = targets.filter(function (t) { return v === 'all' || t.getAttribute('data-cat').split(' ').indexOf(v) > -1; });
        gsap.to(targets, { opacity: 0, y: 12, duration: REDUCED ? 0 : .2, onComplete: function () {
          targets.forEach(function (t) { t.classList.toggle('is-hidden', show.indexOf(t) === -1); });
          gsap.fromTo(show, { opacity: 0, y: 20, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)', duration: REDUCED ? 0 : .55, stagger: .04, ease: 'expo.out', clearProps: 'clipPath', onComplete: function () { ST.refresh(); } });
        } });
      });
    });
  });

  /* Before / after (proof → print) comparison */
  $$('[data-compare]').forEach(function (c) {
    var input = $('input', c), top = $('.cmp-top', c), handle = $('.cmp-handle', c);
    function set(v) { top.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)'; handle.style.left = v + '%'; }
    input.addEventListener('input', function () { set(input.value); });
    set(input.value);
  });

  /* Premium artwork upload */
  function fileRow(f) {
    var ext = (f.name.split('.').pop() || '').toUpperCase().slice(0, 4);
    var size = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(f.size / 1024)) + ' KB';
    var li = document.createElement('li'); li.className = 'up-file';
    li.innerHTML = '<span class="up-ext mono"></span><span class="up-name"></span><span class="up-size mono"></span><span class="up-bar"><i></i></span>';
    $('.up-ext', li).textContent = ext; $('.up-name', li).textContent = f.name; $('.up-size', li).textContent = size;
    return li;
  }
  $$('[data-upload]').forEach(function (zone) {
    var input = $('input[type=file]', zone), list = $(zone.getAttribute('data-upload'));
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function () { zone.classList.remove('is-over'); }); });
    zone.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files.length) { try { input.files = e.dataTransfer.files; } catch (err) {} render(e.dataTransfer.files); } });
    input.addEventListener('change', function () { render(input.files); });
    function render(files) {
      if (!list) return; list.innerHTML = '';
      Array.prototype.slice.call(files).forEach(function (f, i) {
        var li = fileRow(f); list.appendChild(li);
        gsap.fromTo(li, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .4, delay: i * .06 });
        gsap.fromTo($('.up-bar i', li), { scaleX: 0 }, { scaleX: 1, duration: .9, delay: .1 + i * .06, ease: 'power2.out' });
      });
    }
  });

  /* Quote stepper — calm, steps morph rather than jump */
  $$('[data-stepper]').forEach(function (form) {
    var steps = $$('.q-step', form), bar = $$('.q-progress i', form), cur = 0, stage = $('.q-stage', form);
    var live = $('.q-live', form);
    function show(n, dir) {
      var from = steps[cur], to = steps[n];
      if (n === cur) return;
      var h0 = stage.offsetHeight;
      from.hidden = true; to.hidden = false;
      var h1 = stage.offsetHeight;
      gsap.fromTo(stage, { height: h0 }, { height: h1, duration: REDUCED ? 0 : .5, ease: 'expo.inOut', clearProps: 'height' });
      gsap.fromTo(to, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: REDUCED ? 0 : .55, ease: 'expo.out' });
      cur = n;
      navState();
      bar.forEach(function (b, i) { b.classList.toggle('is-done', i <= cur); });
      if (live) live.textContent = 'Step ' + (cur + 1) + ' of ' + steps.length + ': ' + ($('h2', to) || { textContent: '' }).textContent;
      var f = $('h2', to); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
      if (lenis) lenis.scrollTo(form, { offset: -120 }); else form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (to.hasAttribute('data-review')) buildReview();
    }
    function navState() {
      var prev = $('[data-prev]', form), next = $('[data-next]', form), send = $('.q-send', form), last = cur === steps.length - 1;
      prev.disabled = cur === 0; next.hidden = last; send.hidden = !last;
    }
    navState();
    function valid(step) {
      var ok = true;
      $$('[required]', step).forEach(function (inp) {
        var field = inp.closest('.q-field') || inp.closest('fieldset');
        var good = inp.type === 'checkbox' ? $$('input[name="' + inp.name + '"]:checked', form).length > 0 : (inp.value.trim() !== '' && inp.checkValidity());
        if (field) field.classList.toggle('has-error', !good);
        if (!good && ok) { inp.focus(); ok = false; }
      });
      var grp = step.querySelector('[data-need-one]');
      if (grp) { var any = $$('input:checked', grp).length > 0; grp.classList.toggle('has-error', !any); if (!any && ok) { $('input', grp).focus(); ok = false; } }
      return ok;
    }
    function buildReview() {
      var out = $('[data-review-list]', form); if (!out) return;
      var fd = new FormData(form), rows = {};
      fd.forEach(function (v, k) { if (typeof v !== 'string' || !v.trim()) return; rows[k] = rows[k] ? rows[k] + ', ' + v : v; });
      out.innerHTML = '';
      Object.keys(rows).forEach(function (k) { var dt = document.createElement('dt'); dt.textContent = k; var dd = document.createElement('dd'); dd.textContent = rows[k]; out.appendChild(dt); out.appendChild(dd); });
      var files = $('input[type=file]', form);
      if (files && files.files.length) { var dt2 = document.createElement('dt'); dt2.textContent = 'Artwork'; var dd2 = document.createElement('dd'); dd2.textContent = files.files.length + ' file(s) — attach them in the WhatsApp chat'; out.appendChild(dt2); out.appendChild(dd2); }
    }
    form.addEventListener('click', function (e) {
      var nx = e.target.closest('[data-next]'), pv = e.target.closest('[data-prev]');
      if (nx) { e.preventDefault(); if (valid(steps[cur])) show(cur + 1, 1); }
      if (pv) { e.preventDefault(); show(cur - 1, -1); }
    });
    form.addEventListener('change', function (e) { var f = e.target.closest('.has-error'); if (f) f.classList.remove('has-error'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid(steps[cur])) return;
      var fd = new FormData(form), lines = ['Hello Seska, I would like a quote.'], rows = {};
      fd.forEach(function (v, k) { if (typeof v === 'string' && v.trim()) rows[k] = rows[k] ? rows[k] + ', ' + v : v; });
      Object.keys(rows).forEach(function (k) { lines.push(k + ': ' + rows[k]); });
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(function () {});
      var done = $(form.getAttribute('data-success'));
      var wa = done && $('[data-wa-link]', done);
      if (wa) wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
      gsap.to(form, { opacity: 0, y: -20, duration: REDUCED ? 0 : .35, onComplete: function () {
        form.hidden = true; done.hidden = false;
        gsap.fromTo(done, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5 });
        done.setAttribute('tabindex', '-1'); done.focus();
      } });
    });
  });

  
  /* ==========================================================================
     FLAGSHIP $1M SUITE: WEB AUDIO, CMYK INSPECTOR, PROOF SLIDER, ESTIMATOR
     ========================================================================== */

  // 1. Web Audio API Tactile Synthesizer
  function initAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal) {
    if (!sfxEnabled || !audioCtx) return;
    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal || 0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  function sfxClick() {
    playTone(820, 'sine', 0.06, 0.08);
  }
  function sfxHover() {
    playTone(1400, 'triangle', 0.03, 0.03);
  }
  function sfxSwitch() {
    playTone(440, 'sine', 0.08, 0.1);
    setTimeout(function() { playTone(880, 'sine', 0.08, 0.08); }, 50);
  }

  var audioToggle = $('#audio-toggle');
  var audioStatus = $('#audio-status');
  if (audioToggle) {
    if (sfxEnabled) {
      audioToggle.classList.add('is-active');
      if (audioStatus) audioStatus.textContent = 'ON';
    }
    audioToggle.addEventListener('click', function() {
      initAudio();
      sfxEnabled = !sfxEnabled;
      try { sessionStorage.setItem('seska-sfx', sfxEnabled ? '1' : '0'); } catch(e) {}
      audioToggle.classList.toggle('is-active', sfxEnabled);
      if (audioStatus) audioStatus.textContent = sfxEnabled ? 'ON' : 'OFF';
      if (sfxEnabled) sfxSwitch();
    });
  }

  // Attach tactile sound feedback to interactive elements across all pages
  $$('.btn, .pill-links a, .cmyk-btn, .comet, .dm-item, .pcard, .c-card, .chip, .q-tile, .wa-float, .menu-btn').forEach(function(el) {
    el.addEventListener('mouseenter', sfxHover);
    el.addEventListener('click', sfxClick);
  });

  // 2. CMYK Press Inspector Console
  var cmykButtons = $$('.cmyk-btn');
  var heroMedia = $('.hx-media');
  if (cmykButtons.length && heroMedia) {
    cmykButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var mode = btn.getAttribute('data-cmyk');
        cmykButtons.forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        heroMedia.classList.remove('sep-cyan', 'sep-magenta', 'sep-yellow', 'sep-black');
        if (mode !== 'all') {
          heroMedia.classList.add('sep-' + mode);
        }
        sfxClick();
      });
    });
  }

  // 3. Proof-to-Print Comparison Slider
  var proofSlider = $('#proof-slider');
  var proofAfter = $('#proof-after');
  var proofHandle = $('#proof-handle');
  if (proofSlider && proofAfter && proofHandle) {
    var isDragging = false;

    function updateSlider(xPos) {
      var rect = proofSlider.getBoundingClientRect();
      var x = Math.max(0, Math.min(xPos - rect.left, rect.width));
      var pct = (x / rect.width) * 100;
      proofAfter.style.width = pct + '%';
      proofHandle.style.left = pct + '%';
      proofHandle.setAttribute('aria-valuenow', Math.round(pct));
    }

    proofSlider.addEventListener('mousedown', function(e) {
      isDragging = true;
      updateSlider(e.clientX);
      sfxClick();
    });
    window.addEventListener('mousemove', function(e) {
      if (isDragging) updateSlider(e.clientX);
    });
    window.addEventListener('mouseup', function() {
      if (isDragging) isDragging = false;
    });

    // Touch support
    proofSlider.addEventListener('touchstart', function(e) {
      isDragging = true;
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', function(e) {
      if (isDragging && e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', function() {
      if (isDragging) isDragging = false;
    });
  }

  // 4. Instant WhatsApp Job Estimator
  var calcCategory = $('#calc-category');
  var calcQty = $('#calc-qty');
  var calcQtyDisp = $('#calc-qty-disp');
  var calcPriceDisp = $('#calc-price-disp');
  var calcWaBtn = $('#calc-whatsapp-btn');

  function updateEstimate() {
    if (!calcCategory || !calcQty || !calcPriceDisp || !calcWaBtn) return;
    var opt = calcCategory.options[calcCategory.selectedIndex];
    var unitRate = parseFloat(opt.getAttribute('data-unit')) || 1000;
    var minQty = parseInt(opt.getAttribute('data-min')) || 1;
    var prodName = opt.getAttribute('data-name') || opt.text;
    var qty = parseInt(calcQty.value) || 100;

    if (calcQtyDisp) calcQtyDisp.textContent = qty.toLocaleString() + ' units';

    // Volume discount curve
    var discount = 1.0;
    if (qty >= 1000) discount = 0.82;
    else if (qty >= 500) discount = 0.88;
    else if (qty >= 250) discount = 0.94;

    var low = Math.round(qty * unitRate * discount * 0.95 / 1000) * 1000;
    var high = Math.round(qty * unitRate * discount * 1.05 / 1000) * 1000;

    var lowStr = 'UGX ' + low.toLocaleString();
    var highStr = high.toLocaleString();
    calcPriceDisp.textContent = lowStr + ' – ' + highStr;

    var msg = 'Hello Seska Investments Ltd,\n\nI would like to order / lock in a spec:\n' +
              '• Product: ' + prodName + '\n' +
              '• Quantity: ' + qty.toLocaleString() + ' units\n' +
              '• Estimated Range: ' + lowStr + ' - ' + highStr + '\n\n' +
              'Please confirm turnaround time and artwork requirements.';
    calcWaBtn.href = 'https://wa.me/256200926763?text=' + encodeURIComponent(msg);
  }

  if (calcCategory && calcQty) {
    calcCategory.addEventListener('change', function() { updateEstimate(); sfxClick(); });
    calcQty.addEventListener('input', updateEstimate);
    updateEstimate();
  }

  // 5. Ambient Ink-Particle Canvas (hero background)
  (function() {
    var canvas = document.createElement('canvas');
    canvas.className = 'ambient-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    var hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 40;
    var COLORS = ['rgba(0,174,239,', 'rgba(236,0,140,', 'rgba(255,242,0,', 'rgba(255,255,255,'];

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 60;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(0.2 + Math.random() * 0.6);
      this.r = 1 + Math.random() * 2.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 0.15 + Math.random() * 0.25;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
    };
    Particle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    };
    Particle.prototype.draw = function() {
      var fade = 1 - (this.life / this.maxLife);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * fade) + ')';
      ctx.fill();
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = new Particle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    var raf;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      raf = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible
    var heroObs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        if (!raf) animate();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }, { threshold: 0.1 });
    heroObs.observe(hero);
  })();

  // Website footage disabled: production photography is used throughout.

  // 7. Cinematic section entrance on scroll
  (function() {
    var targets = document.querySelectorAll('.proof-section .container, .calc-section .calc-grid');
    if (!targets.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function(el) { obs.observe(el); });
  })();

  /* ---------- Keep ScrollTrigger honest after fonts and images ---------- */
  ST.sort && ST.sort();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
