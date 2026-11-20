// Yurt dışında yaşayanlar sayfası (yurt-disinda-yasayanlar.php, parts/yurtdisi.php): iletişim formuna yurt dışı ön satırı ve
// WhatsApp tıklama olayı. Ülke, saat dilimi, iş türü, sayfa dili ve UTM (utm_source / utm_medium / utm_campaign) tek satır
// olarak /iletisim adresinin çapasına (#yd=...) yazılır; çapa sunucuya gitmez, iletisim.php satırı mesaj kutusunun başına
// ekler (gonder.php değişmez: satır mevcut "mesaj" alanıyla gider). Çerez ya da tarayıcı deposu kullanılmaz.
// Sözleşme: araclar/test_yurtdisi.py (node ile).
(function () {
  function temiz(s, n) {
    return String(s || '').replace(/[\[\]<>{}"'`\\|#]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
  }
  function kaynak() {
    var q = new URLSearchParams(location.search || ''), k = [];
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (a) {
      var v = (q.get(a) || '').replace(/[^A-Za-z0-9_.\-]/g, '').slice(0, 60);
      if (v) { k.push(v); }
    });
    return k.join('/');
  }
  var f = document.getElementById('yd-form');
  if (f) {
    var sd = document.getElementById('yd-saat');
    try { if (sd && !sd.value) { sd.value = temiz(Intl.DateTimeFormat().resolvedOptions().timeZone, 40); } } catch (_) {}
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = ['Yurt dışı'], u = temiz(f.ulke.value, 40), s = temiz(f.saat.value, 40), i = temiz(f.is.value, 60), k = kaynak();
      if (u) { p.push('Ülke: ' + u); }
      if (s) { p.push('Saat dilimi: ' + s); }
      if (i) { p.push('İş: ' + i); }
      p.push('Sayfa: ' + temiz(f.getAttribute('data-dil'), 4));
      if (k) { p.push('Kaynak: ' + k); }
      location.href = f.getAttribute('data-hedef') + '#yd=' + encodeURIComponent('[' + p.join(' · ') + ']');
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="https://wa.me/"]') : null;
    if (a && typeof window.capOlay === 'function') { window.capOlay('iletisim_whatsapp', { konum: 'yurtdisi' }); }
  }, true);
})();
