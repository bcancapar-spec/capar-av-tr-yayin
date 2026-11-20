/* "Paylaş" düğmesi (2026-11-19) — işaretleme parts/paylas-dugme.php (Python ikizi araclar/paylas_dugme_kural.py).
   navigator.share varsa dokununca cihazın kendi paylaşım menüsü açılır ({title, text, url}); kullanıcı kapatırsa (AbortError)
   hiçbir şey olmaz. Yoksa (ya da menü açılamazsa) küçük menü: Bağlantıyı kopyala, WhatsApp, Telegram, X, LinkedIn, Facebook,
   e-posta — düz bağlantılar, üçüncü taraf betik yok. Adres kanonik adrestir (link rel=canonical; yoksa data-url); başlık ve
   açıklama og:title / og:description'dan, yoksa data-baslik / data-aciklama'dan. Ölçüm mevcut capOlay('paylas', …) kalıbıyla
   (parts/olcum.php; çerez onayı kuralı oradadır): platform = yerel | kopya | whatsapp | telegram | x | linkedin | facebook |
   eposta, konum = dugme-<yer>. Sayfaya HTML yazılmaz: metinler sayfadaki öğelerden textContent ile okunur ve yazılır. */
(function () {
  'use strict';
  var kok = document.querySelector('.pd');
  if (!kok || !kok.closest || !kok.querySelector) { return; }
  var dugme = kok.querySelector('.pd-dugme'), panel = kok.querySelector('.pd-menu'), liste = kok.querySelector('.pd-liste'),
      durum = kok.querySelector('.pd-durum'), yer = kok.getAttribute('data-yer') || '', acik = false, zaman = 0;
  if (!dugme || !panel || !liste || !durum) { return; }
  var SITE = /^https:\/\/capar\.av\.tr\//;

  function icerik(secici) {
    var m = document.querySelector(secici);
    return m ? (m.getAttribute('content') || '').trim() : '';
  }
  function veri() {
    var c = document.querySelector('link[rel="canonical"]'), url = c ? (c.href || '') : '';
    if (!SITE.test(url)) { url = kok.getAttribute('data-url') || ''; }
    if (!SITE.test(url)) { url = location.origin + location.pathname; }
    return {
      title: icerik('meta[property="og:title"]') || kok.getAttribute('data-baslik') || document.title || '',
      text: icerik('meta[property="og:description"]') || kok.getAttribute('data-aciklama') || icerik('meta[name="description"]'),
      url: url
    };
  }
  function adresler(v) {
    var u = encodeURIComponent(v.url), b = encodeURIComponent(v.title);
    return {
      whatsapp: 'https://wa.me/?text=' + encodeURIComponent((v.title ? v.title + ' ' : '') + v.url),
      telegram: 'https://t.me/share/url?url=' + u + '&text=' + b,
      x: 'https://x.com/intent/tweet?url=' + u + '&text=' + b,
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
      eposta: 'mailto:?subject=' + b + '&body=' + encodeURIComponent((v.text ? v.text + '\n\n' : '') + v.url)
    };
  }
  function bagla() {
    var a = adresler(veri());
    liste.querySelectorAll('a.pd-oge').forEach(function (o) {
      var h = a[o.getAttribute('data-ag')];
      if (h) { o.setAttribute('href', h); }
    });
  }
  function ileti(ad) {
    var m = kok.querySelector('.pd-m[data-ad="' + ad + '"]');
    return m ? m.textContent : '';
  }
  function olc(platform) {
    if (typeof window.capOlay === 'function') { window.capOlay('paylas', { platform: platform, konum: 'dugme-' + yer }); }
  }
  function bildir(m) {
    durum.textContent = m;
    clearTimeout(zaman);
    zaman = setTimeout(function () { durum.textContent = ''; }, 4000);
  }
  function ogeler() {
    return Array.prototype.slice.call(liste.querySelectorAll('.pd-oge'));
  }

  function ac(odak) {
    bagla();
    var elle = panel.querySelector('.pd-elle');
    if (elle) { elle.parentNode.removeChild(elle); }
    panel.hidden = false; acik = true;
    dugme.setAttribute('aria-expanded', 'true');
    kok.classList.remove('pd-yukari');
    var r = panel.getBoundingClientRect(), d = dugme.getBoundingClientRect();
    if (r.bottom > window.innerHeight && d.top - r.height - 12 > 0) { kok.classList.add('pd-yukari'); }
    if (odak) { var o = ogeler()[0]; if (o) { o.focus(); } }
  }
  function kapat(odak) {
    if (!acik) { return; }
    panel.hidden = true; acik = false;
    dugme.setAttribute('aria-expanded', 'false');
    if (odak) { dugme.focus(); }
  }

  function kopyala() {
    var url = veri().url;
    function elle() {   // pano yoksa ya da izin verilmediyse: seçili, salt okunur alan
      var a = panel.querySelector('.pd-elle');
      if (!a) {
        a = document.createElement('input');
        a.type = 'text'; a.readOnly = true; a.className = 'pd-elle';
        a.setAttribute('aria-label', ileti('elle'));
        panel.appendChild(a);
      }
      a.value = url;
      a.focus(); a.select();
      bildir(ileti('elle'));
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { kapat(true); bildir(ileti('kopyalandi')); }, elle);
    } else { elle(); }
  }

  dugme.addEventListener('click', function () {
    if (acik) { kapat(false); return; }
    if (navigator.share) {
      var v = veri(), p = { title: v.title, url: v.url };
      if (v.text) { p.text = v.text; }
      olc('yerel');
      var s;
      try { s = navigator.share(p); } catch (h) { ac(true); return; }
      if (s && s.catch) {
        s.catch(function (h) {
          if (h && h.name === 'AbortError') { return; }   // kullanıcı menüyü kapattı
          ac(true);                                       // menü açılamadı: yedek menü
        });
      }
      return;
    }
    ac(true);
  });
  dugme.addEventListener('keydown', function (e) {
    if ((e.key === 'ArrowDown' || e.key === 'Down') && !acik) { e.preventDefault(); ac(true); }
  });
  liste.addEventListener('click', function (e) {
    var o = e.target.closest ? e.target.closest('.pd-oge') : null;
    if (!o) { return; }
    var ag = o.getAttribute('data-ag');
    olc(ag);
    if (ag === 'kopya') { e.preventDefault(); kopyala(); return; }
    setTimeout(function () { kapat(false); }, 0);   // bağlantı kendi yolunda açılır (yeni sekme / e-posta istemcisi)
  });
  kok.addEventListener('keydown', function (e) {
    if (!acik) { return; }
    var k = e.key;
    if (k === 'Escape' || k === 'Esc') { e.preventDefault(); kapat(true); return; }
    if (k !== 'ArrowDown' && k !== 'ArrowUp' && k !== 'Down' && k !== 'Up' && k !== 'Home' && k !== 'End') { return; }
    var o = ogeler(), i = o.indexOf(document.activeElement);
    if (i < 0 && document.activeElement !== dugme) { return; }   // seçilebilir alanda ok tuşları metinde kalır
    e.preventDefault();
    if (k === 'Home') { i = 0; } else if (k === 'End') { i = o.length - 1; }
    else if (k === 'ArrowDown' || k === 'Down') { i = (i + 1) % o.length; } else { i = (i - 1 + o.length) % o.length; }
    o[i].focus();
  });
  kok.addEventListener('focusout', function (e) {
    if (acik && e.relatedTarget && !kok.contains(e.relatedTarget)) { kapat(false); }
  });
  document.addEventListener('click', function (e) {
    if (acik && !kok.contains(e.target)) { kapat(false); }
  });

  if (navigator.share) { dugme.removeAttribute('aria-haspopup'); }   // dokununca cihazın menüsü açılır
  bagla();
  kok.hidden = false;
})();
