// Onaylı reklam ölçümü (kullanıcı kararı 2026-11-10: "Onaylı dönüşüm ölçümü"). parts/reklam.php bu betiği yalnız
// data/olcum-reklam.json'da bir kimlik varken ekler; yapılandırma #reklam-ayar (JSON) içindedir.
// - Google Ads (gtag.js) ve Meta Pixel yalnız çerez bandında "Kabul et" seçilmişken (kullanıcı kararı 2026-11-16 "geleneksel
//   sistem": iki düğme; kabul ikisini birlikte yazar: 'capar-cerez' ve 'capar-reklam' ikisi de 'accepted') ve async yüklenir.
//   Önceki kutulu sürümden kalan kısmi kayıt (yalnız biri 'accepted') kabul sayılmaz (bant yeniden sorar); "Reddet" ya da
//   tercih yoksa hiçbir üçüncü taraf isteği yapılmaz. Sayfada sonradan kabul edilirse bandın 'capar-onay' olayıyla o anda
//   yüklenir; aynı sayfada sonradan reddedilirse dönüşüm gönderilmez ve Meta Pixel'e rıza geri alımı bildirilir.
// - İzin güncellemesi yalnız ölçüm içindir: ad_storage ve ad_user_data; kişiselleştirilmiş reklam sinyalleri kapalı.
// - Dönüşümler mevcut window.capOlay olaylarından: iletisim_form (form doğrulandı), iletisim_tel, iletisim_eposta,
//   iletisim_whatsapp. Google Ads: olaya özgü etiket yoksa genel etiket; Meta: Lead (form) ve Contact (öteki üçü).
// Sözleşme: araclar/test_yurtdisi.py ve araclar/test_cerez_onay.py (node ile).
(function () {
  var el = document.getElementById('reklam-ayar'), C = null;
  try { C = JSON.parse(el ? el.textContent : 'null'); } catch (_) { C = null; }
  if (!C || (!C.ads && !C.meta)) { return; }
  var yuklendi = false, izinli = false;
  var META = { iletisim_form: 'Lead', iletisim_tel: 'Contact', iletisim_eposta: 'Contact', iletisim_whatsapp: 'Contact' };
  function onay() {
    try { return localStorage.getItem('capar-cerez')==='accepted' && localStorage.getItem('capar-reklam')==='accepted'; } catch (_) { return false; }
  }
  function betik(src) {
    var s = document.createElement('script');
    s.async=true;
    s.src = src;
    document.head.appendChild(s);
  }
  function yukle(izin) {
    if (!(izin || onay())) { return; }
    izinli = true;
    if (yuklendi) {
      if (C.meta && typeof window.fbq === 'function') { window.fbq('consent', 'grant'); }
      if (C.ads && typeof window.gtag === 'function') { window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted' }); }
      return;
    }
    yuklendi = true;
    if (C.ads && typeof window.gtag === 'function') {
      var g = document.createElement('script');
      g.async=true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.ads);
      document.head.appendChild(g);
      window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted' });
      window.gtag('config', C.ads, { allow_ad_personalization_signals: false });
    }
    if (C.meta && !window.fbq) {
      var n = window.fbq = function () { if (n.callMethod) { n.callMethod.apply(n, arguments); } else { n.queue.push(arguments); } };
      window._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      betik('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', C.meta);
      window.fbq('track', 'PageView');
    }
  }
  function donustur(ad) {
    if (!yuklendi || !izinli || !META[ad]) { return; }
    if (C.ads && typeof window.gtag === 'function') {
      var l = (C.etiket && C.etiket[ad]) || C.etiket_genel;
      if (l) { window.gtag('event', 'conversion', { send_to: C.ads + '/' + l }); }
    }
    if (C.meta && typeof window.fbq === 'function') { window.fbq('track', META[ad]); }
  }
  var eskiOlay = window.capOlay;
  window.capOlay = function (ad, p) {
    if (typeof eskiOlay === 'function') { eskiOlay(ad, p); }
    donustur(ad);
  };
  document.addEventListener('capar-onay', function (e) {
    if (e && e.detail && e.detail.reklam === true) { yukle(true); }
    else if (e && e.detail && e.detail.reklam === false && izinli) {
      izinli = false;
      if (C.meta && typeof window.fbq === 'function') { window.fbq('consent', 'revoke'); }
    }
  });
  yukle(false);
})();
