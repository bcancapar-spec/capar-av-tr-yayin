/* Makaleyi dinle (2026-11-14): tarayıcının konuşma sentezi (speechSynthesis); çerez, olay ölçümü, dış kaynak yok.
   2026-11-16: hazır ses dosyası kipi (ses/<slug>.mp3, sunucu parts/sesli-oku.php data-ses-* basar; üretim araclar/ses_uret.py).
   Dosya yalnız blok listesinin özeti (SesliOku.ozet) bildirimdekiyle aynıysa çalar; değilse tarayıcı sesi (bayat ses asla çalmaz).
   İşaretleme parts/sesli-oku.php, stil site.css @bolum:sesli-oku; saf işlevler araclar/test_sesli_oku_node.js ve
   araclar/test_ses_dosya_node.js (node) ile sınanır.
   2026-11-16 (kullanıcı: "iphoneda denediğimde ses gelmiyor"): iOS / Safari sağlamlaştırması — sesler yüklenirken ısıtılır, liste
   boşsa aynı dokunuşta yalnız dille konuşulur (speak asla dokunuş dışına bekletilmez); dosyada load() + play() aynı dokunuşta, hız üst
   veriden sonra; düşüşte ve engelde kalıcı iletiler; özet makale-okuma "#" bağlantısından ve iOS veri algılamasından bağımsız.
   Tanı görünümü: adres #ses-tani ya da nota 5 dokunuş (yerinde metin; hiçbir yere gönderilmez). Sıradaki makale ("makale bitince
   sıradaki makaleyi otomatik açsın okusun"; "sıradaki sayfayı da açsın"): 5 sn geri sayım, aynı kökenden sayfa alınır (yalnız o an),
   yumuşak geçişle ekrandaki makale değişir, ses öğesi ve kutu aynı kalır; ayar localStorage "capar-ses-sira", dinlenenler
   sessionStorage "capar-ses-dinlenen" (çerez yok). Arayüz sınaması: araclar/test_ses_zincir_node.js (sahte tarayıcı). */
(function(G){'use strict';
var L='A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû',ON='(^|[^'+L+'])',SON='(?=[^'+L+']|$)',EK="(?:(['’.])(["+L+']+))?',
AY={tr:'Ocak Şubat Mart Nisan Mayıs Haziran Temmuz Ağustos Eylül Ekim Kasım Aralık'.split(' '),en:'January February March April May June July August September October November December'.split(' ')},
// sözlük (tek yer; tarayıcı sesi ve ses dosyası üretimi aynı sözlüğü kullanır): kurum/kanun = açılım, ek uyarlanır, uyarlanamayan ek
// açılıma kesme işaretiyle eklenir; harf = harf harf okuma, yalnız açılımı bilinmeyen kısaltmalar için son çare (şimdilik boş)
SOZ={harf:{},
kurum:{HD:'Hukuk Dairesi',CD:'Ceza Dairesi',HGK:'Hukuk Genel Kurulu',CGK:'Ceza Genel Kurulu',YHGK:'Yargıtay Hukuk Genel Kurulu',YCGK:'Yargıtay Ceza Genel Kurulu',AYM:'Anayasa Mahkemesi','AİHM':'Avrupa İnsan Hakları Mahkemesi','AİHS':'Avrupa İnsan Hakları Sözleşmesi','İDDK':'İdari Dava Daireleri Kurulu',VDDK:'Vergi Dava Daireleri Kurulu',BAM:'Bölge Adliye Mahkemesi','BİM':'Bölge İdare Mahkemesi','A.Ş.':'Anonim Şirketi','vd.':'ve devamı',
TL:'Türk lirası','YÖK':'Yükseköğretim Kurulu','ÜAK':'Üniversitelerarası Kurul',HSK:'Hâkimler ve Savcılar Kurulu','ÜFE':'Üretici Fiyat Endeksi','TÜFE':'Tüketici Fiyat Endeksi',ABD:'Amerika Birleşik Devletleri',USD:'Amerikan doları',UYAP:'Ulusal Yargı Ağı Bilişim Sistemi',BSMV:'Banka ve Sigorta Muameleleri Vergisi',ZMSS:'Zorunlu Mali Sorumluluk Sigortası','ÇED':'Çevresel Etki Değerlendirmesi',KDV:'Katma Değer Vergisi',TCMB:'Türkiye Cumhuriyet Merkez Bankası',YTM:'Yatırımcı Tazmin Merkezi'},
kanun:{TBK:'Türk Borçlar Kanunu',TMK:'Türk Medeni Kanunu',TCK:'Türk Ceza Kanunu',CMK:'Ceza Muhakemesi Kanunu',HMK:'Hukuk Muhakemeleri Kanunu','İİK':'İcra ve İflas Kanunu',TTK:'Türk Ticaret Kanunu','İYUK':'İdari Yargılama Usulü Kanunu',KVKK:'Kişisel Verilerin Korunması Kanunu',FSEK:'Fikir ve Sanat Eserleri Kanunu',SMK:'Sınai Mülkiyet Kanunu',KTK:'Karayolları Trafik Kanunu',TKHK:'Tüketicinin Korunması Hakkında Kanun',KMK:'Kat Mülkiyeti Kanunu',VUK:'Vergi Usul Kanunu','MÖHUK':'Milletlerarası Özel Hukuk ve Usul Hukuku Hakkında Kanun',HUMK:'Hukuk Usulü Muhakemeleri Kanunu',KHK:'Kanun Hükmünde Kararname',SGK:'Sosyal Güvenlik Kurumu',HAGB:'hükmün açıklanmasının geri bırakılması','İş K.':'İş Kanunu'},
tr:[['vb\\.','ve benzeri'],['vs\\.','vesaire'],['[Bb]kz\\.','bakınız'],['ör\\.','örneğin'],['Av\\.','Avukat'],['Dr\\.','Doktor'],['Prof\\.','Profesör'],['Doç\\.','Doçent'],['T\\.C\\.','Türkiye Cumhuriyeti'],['Ltd\\. ?Şti\\.','Limited Şirketi'],['Ltd\\.','limited şirket'],['\\[GK\\]','Genel Kurul'],['\\[BD\\]','Büyük Daire'],['RG','Resmî Gazete'],['s\\.(?= ?\\d)','sayfa'],['S\\.(?= ?\\d)','sayı'],['f\\.(?= ?\\d)','fıkra'],['b\\.(?= ?\\d)','bent'],['No ?[:.](?= ?\\d)','numara']],
en:[['e\\.g\\.','for example'],['i\\.e\\.','that is'],['et seq\\.','and following'],['cf\\.','compare'],['vs\\.','versus'],['Av\\.','Attorney'],['paras\\.(?= ?\\d)','paragraphs'],['para\\.(?= ?\\d)','paragraph'],['pp\\.(?= ?\\d)','pages'],['p\\.(?= ?\\d)','page'],['Nos\\.(?= ?\\d)','numbers'],['[Nn]o\\.(?= ?\\d)','number']]},
ROMA={VIII:8,III:3,VII:7,XII:12,II:2,IV:4,VI:6,IX:9,XI:11},
M={tr:{esas:'esas',karar:'karar',bolu:' bölü ',basvuru:'başvuru numarası',tarih:'tarih',madde:'madde',fikra:'fıkra',bent:'bent',ile:'ile',yuzde:'yüzde',lira:'Türk lirası',para:'paragraf',
tablo:function(b,n){return'Tablo'+(b?': '+b:'')+'. '+n+' satır; ayrıntı için sayfadaki tabloya bakın.'},
// betiğin kendi arayüz iletileri (2026-11-16; sunucu iletileri data-m-* niteliklerinde)
ui:{yavas:'Bağlantı yavaş; ses yükleniyor…',dokun:'Ses dosyası açılamadı. Dinlemek için düğmeye yeniden dokunun.',dusus:'Ses dosyası açılamadı; tarayıcınızın sesiyle sürdürülüyor.',
sessiz:'Ses gelmiyorsa telefonun sessiz kipini kapatın.',sira:'Sıradaki makale: ',geri:function(n){return n+' sn içinde başlıyor.'},vazgec:'Vazgeç',
simdi:'Şimdi okunan: ',ac:'Makaleyi aç',acildi:'Sıradaki makale açıldı: ',sinir:'Devam etmek için dokunun.',devam:'Dinlemeye devam et',
ayar:'Sıradaki makaleyi kendiliğinden aç ve oku'}},
en:{esas:'docket',karar:'decision',bolu:' slash ',basvuru:'application number',tarih:'dated',madde:'article',fikra:'paragraph',bent:'subparagraph',ile:'to',yuzde:'percent',lira:'Turkish lira',para:'section',
tablo:function(b,n){return'Table'+(b?': '+b:'')+'. '+n+(n===1?' row':' rows')+'; see the table on the page for details.'},
ui:{yavas:'Slow connection; loading audio…',dokun:'The audio file could not be opened. Tap the button again to listen.',dusus:'The audio file could not be opened; continuing with your browser’s voice.',
sessiz:'If you hear nothing, turn off silent mode.',sira:'Next article: ',geri:function(n){return'Starts in '+n+' s.'},vazgec:'Cancel',
simdi:'Now reading: ',ac:'Open article',acildi:'Next article opened: ',sinir:'Tap to continue.',devam:'Continue listening',
ayar:'Open and read the next article automatically'}}};
// açılımı hemen önünde yazılı parantezli kısaltma (2026-11-16; "Sınai Mülkiyet Kanunu (SMK)" iki kez okunuyordu): kısaltma
// sözlüğünden; parantez içinde tek başına kısaltma, ekli de olabilir ("(TBK)", "(SMK’nın)")
var KISK=Object.keys(SOZ.kurum).concat(Object.keys(SOZ.kanun)).sort(function(a,b){return b.length-a.length}),
PAR=new RegExp('\\s*\\(\\s*('+KISK.map(function(k){return k.replace(/\./g,'\\.')}).join('|')+')(?:[\'’][A-Za-zÇĞİÖŞÜçğıöşü]+)?\\s*\\)','g');
// Türkçe küçük harf (toLocaleLowerCase('tr') ile aynı sonuç; yerel ayar desteğine bağlı değil)
function kucuk(s){return String(s).replace(/İ/g,'i').replace(/I/g,'ı').toLowerCase()}
// s (parantezden önceki metin) açılım a ile bitiyor mu: büyük/küçük harf, kesme işareti ve son sözcüğün eki gözetilmez;
// açılımla parantez arasındaki "6100 sayılı" gibi sayı / "sayılı" sözcükleri atlanır
function onunde(s,a){var w=kucuk(s).replace(/[’'‘“”"]/g,'').split(/\s+/).filter(Boolean),e=kucuk(a).split(' '),n=w.length,i,x;
while(n&&/^(?:\d+|sayılı)$/.test(w[n-1]))n--;if(n<e.length)return false;
for(i=0;i<e.length;i++){x=w[n-e.length+i];if(i<e.length-1?x!==e[i]:x.indexOf(e[i])!==0)return false}return true}
function rx(s){return new RegExp(s,'g')}
function roma(s){var d={I:1,V:5,X:10},n=0;for(var i=0;i<s.length;i++)n+=d[s[i]]<(d[s[i+1]]||0)?-d[s[i]]:d[s[i]];return n}
// ek açılıma: iyelikli (HGK'ya → Hukuk Genel Kuruluna, TBK'nın → Kanununun), ünlü (Kararnameye), ünsüz (Kanuna) sonlu; çoğul ve -lık
// (HD'ler → Hukuk Daireleri, TL'lik → Türk liralık); bilinmeyen ekte null
function ekUyarla(a,ek){if(!ek)return a;
var s=kucuk(ek),u=a.match(/[aeıioöuü][^aeıioöuü]*$/i),v=u?kucuk(u[0].charAt(0)):'a',
c='eiöü'.indexOf(v)>=0,y='ouöü'.indexOf(v)>=0,e=c?'e':'a',i=c?(y?'ü':'i'):(y?'u':'ı'),z=a.slice(-1),
U=/[aeıioöuü]/.test(z),P=U&&!/name$/.test(a),h=!U&&'çfhkpsşt'.indexOf(z)>=0,b=P?'n':U?'y':'',D=(P?'n':'')+(h?'t':'d')+e,
K=[[/^n?[ıiuü]n$/,(U?'n':'')+i+'n'],[/^[yn]?[ae]$/,b+e],[/^n?[dt][ae]$/,D],[/^n?[dt][ae]n$/,D+'n'],[/^n?[dt][ae]ki$/,D+'ki'],[/^[yn]?[ıiuü]$/,b+i],[/^y?l[ae]$/,(U?'y':'')+'l'+e],[/^n?[cç][ae]$/,(P?'n':'')+(h?'ç':'c')+e],[/^s[ıiuü]$/,P?'':U?'s'+i:i]];
for(var k=0;k<K.length;k++)if(K[k][0].test(s))return a+K[k][1];
if(/^l([ae]r|[ıiuü]k)$/.test(s)){var g=P?a.replace(/s?[ıiuü]$/,''):a,w=g.match(/[aeıioöuü][^aeıioöuü]*$/i),x=w?kucuk(w[0].charAt(0)):'a',
f='eiöü'.indexOf(x)>=0,r='ouöü'.indexOf(x)>=0,j=f?(r?'ü':'i'):(r?'u':'ı');return s.charAt(1)==='a'||s.charAt(1)==='e'?g+'l'+(f?'e':'a')+'r'+(P?f?'i':'ı':''):g+'l'+j+'k'}
return null}
function normalle(t,dil){var d=dil==='en'?'en':'tr',m=M[d],tr=d==='tr';
t=String(t||'').replace(/https?:\/\/\S+|www\.\S+/g,' ').replace(/­/g,'');
if(tr)t=t.replace(PAR,function(x,k,o,s){return onunde(s.slice(Math.max(0,o-200),o),SOZ.kanun[k]||SOZ.kurum[k])?'':x});
// TR: "5510 s.K." = sayılı Kanun; eğik çizgili tarih (16/06/2020); "HMK.md.33" / "TMK.m.166" (kısaltmaya bitişik madde)
if(tr)t=t.replace(/(\d) ?s\. ?K\.(?![A-Za-zÇĞİÖŞÜçğıöşü])/g,'$1 sayılı Kanun')
.replace(/(^|[^\d\/])(\d{1,2})\/(\d{1,2})\/(\d{4})(?![\d\/])/g,function(x,o,g,a,y){return+g>0&&+g<32&&+a>0&&+a<13?o+(+g)+' '+AY.tr[a-1]+' '+y:x})
.replace(/([A-ZÇĞİÖŞÜ]{2,})\.(?=(?:md?|Md)\. ?\d)/g,'$1 ');
var EN='(\\d{4})\\/((?:\\(\\d+\\))?\\d+(?:-\\d+)?)';
t=t.replace(/B\. ?No ?[:.]? ?(?=\d)/g,m.basvuru+' ')
.replace(rx(EN+' ?([EK])\\.(?![A-Za-z])'),function(x,a,b,k){return a+m.bolu+b+' '+(k==='E'?m.esas:m.karar)})
.replace(rx(ON+'([EK])[.:] ?'+EN),function(x,o,k,a,b){return o+(k==='E'?m.esas:m.karar)+' '+a+m.bolu+b})
.replace(rx(ON+'T\\. ?(?=\\d{1,2}\\.\\d{1,2}\\.\\d{4})'),'$1'+m.tarih+' ')
.replace(rx(ON+(tr?'(md?|Md)':'([Aa]rts?|md?)')+'\\. ?(\\d+)(?:\\/(\\d+|[a-zçğıöşü]|[IVX]{1,4})(?![\\wçğıöşü]))?(?:-(\\d+|[a-zçğıöşü])(?![\\wçğıöşü]))?'),function(x,o,k,n,f,b){
var s=m.madde;if(!tr){s=/s$/.test(k)?'articles':'article';if(/^A/.test(k))s='A'+s.slice(1)}
s=o+s+' '+n;if(f)s+=/^[IVX]+$/.test(f)?' '+m.bent+' '+roma(f):' '+(/\d/.test(f)?m.fikra:m.bent)+' '+f;
if(b)s+=!f&&/^\d+$/.test(b)&&+b>+n?' '+m.ile+' '+b:' '+m.bent+' '+b;return s});
if(tr)t=t.replace(rx('(['+L+'] )No ?[:.] ?(?=\\d)'),'$1numarası ');
t=t.replace(/(^|[^\d\/])(\d{4})\/(\d{1,6})(?![\d\/])/g,'$1$2'+m.bolu+'$3')
.replace(/(^|[^\d.])(\d{1,2})\.(\d{1,2})\.(\d{4})(?!\d)/g,function(x,o,g,a,y){return+g>0&&+g<32&&+a>0&&+a<13?o+(+g)+' '+AY[d][a-1]+' '+y:x})
.replace(/%\s?(\d+(?:[.,]\d+)?)(?:\s?[–-]\s?(\d+(?:[.,]\d+)?))?/g,function(x,a,b){return tr?m.yuzde+' '+a+(b?' '+m.ile+' '+b:''):a+(b?' to '+b:'')+' '+m.yuzde})
.replace(/(\d[\d.,]*)\s?₺|₺\s?(\d[\d.,]*)/g,function(x,a,b){return(a||b)+' '+m.lira}).replace(/§\s?/g,m.para+' ');
if(!tr)t=t.replace(/(\d)\s?TL\b/g,'$1 '+m.lira);
SOZ[d].forEach(function(p){t=t.replace(rx(ON+p[0]+(/[.\]]$|\(\?=/.test(p[0])?'':SON)),'$1'+p[1]+' ')});
if(tr){t=t.replace(rx(ON+'('+Object.keys(ROMA).join('|')+')'+SON),function(x,o,r){return o+ROMA[r]});
// kısaltma + ek ("TCK’nın", "İİK.nun"); ek uyarlanamazsa açılım + özgün ek ("Kanunu’sız"), noktalı yazımda açılım + boşluk
[SOZ.kurum,SOZ.kanun].forEach(function(S){Object.keys(S).forEach(function(k){t=t.replace(rx(ON+k.replace(/\./g,'\\.')+EK+(/\.$/.test(k)?'':SON)),function(x,o,a,e){var r=ekUyarla(S[k],e);return o+(/\d/.test(o)?' ':'')+(r!==null?r:S[k]+(a==='.'?' ':a)+e)})})});
Object.keys(SOZ.harf).forEach(function(k){t=t.replace(rx(ON+k+SON),'$1'+SOZ.harf[k])})}
return t.replace(/\s+([,.;:!?)])/g,'$1').replace(/\(\s+/g,'(').replace(/\s+/g,' ').trim()}
var KIS=/(?:^|[\s(])(?:md?|f|b|vd|vb|s|S|No|Nos|no|Av|Dr|Prof|Doç|Yrd|bkz|Bkz|ör|[Aa]rts?|paras?|pp?|cf|seq|Ltd|Şti|Mrs?|Ms|Inc|Co|Jr|e\.g|i\.e|T\.C|A\.Ş|[A-ZÇĞİÖŞÜ])$/;
// cümle: kısaltma, baş harf, (TR) sayı + noktada bölmez; uzun cümle virgülde
function cumleler(t,sinir,dil){sinir=sinir||180;t=String(t||'').replace(/\s+/g,' ').trim();
var o=[],r=[],bas=0,re=/([.!?…]+["”’)\]]*)\s+(?=["“'‘(\[]?[A-ZÇĞİÖŞÜ0-9])/g,x,on;
while((x=re.exec(t))){on=t.slice(bas,x.index);if(x[1]==='.'&&(KIS.test(on)||dil!=='en'&&/\d$/.test(on)))continue;o.push(t.slice(bas,x.index+x[1].length));bas=re.lastIndex}
if(bas<t.length)o.push(t.slice(bas));
o.forEach(function(c){c=c.trim();while(c.length>sinir){var k=c.slice(0,sinir),i=Math.max(k.lastIndexOf(', '),k.lastIndexOf('; '),k.lastIndexOf(': '));
if(i<sinir*.3)i=k.lastIndexOf(' ');if(i<1)i=sinir;r.push(c.slice(0,i+1).trim());c=c.slice(i+1).trim()}if(c)r.push(c)});return r}
function tabloOzet(b,n,dil){return M[dil==='en'?'en':'tr'].tablo((b||[]).filter(Boolean).join(', '),n)}
// ses: sayfa dilinde en iyisi, yoksa null
function sesSec(v,dil){var en=null,ep=-1;(v||[]).forEach(function(s){var l=String(s.lang||'').replace('_','-').toLowerCase(),n=String(s.name||''),p=0;
if(l.split('-')[0]!==dil)return;if(/^(tr-tr|en-us|en-gb)$/.test(l))p+=2;
p+=/natural|neural/i.test(n)?10:/premium|enhanced|geli[şs](?:tiril)?mi[şs]/i.test(n)?8:/online|google/i.test(n)?6:/yelda|samantha|daniel/i.test(n)?4:0;
if(s['default'])p++;if(p>ep){ep=p;en=s}});return en}
// kuyruk; duraklatma = iptal + kaldığı cümleden sürdürme
function Oynatici(b,mt,olay){var o={i:0,j:0,durum:'bos',hiz:1,hata:0},ns=0;
function bil(a){if(olay)olay(a,o)}
function soyle(){var n=++ns;mt.konus(b[o.i].parcalar[o.j],o.hiz,function(h){if(n!==ns||o.durum!=='caliyor')return;
if(h&&h!=='interrupted'&&h!=='canceled'){if(h==='not-allowed')return dur('izin');if(++o.hata>=3)return dur('hata')}else if(!h)o.hata=0;
if(++o.j>=b[o.i].parcalar.length){o.i++;o.j=0;if(o.i>=b.length)return dur('bitti',1);bil('bolum')}soyle()})}
function kes(){ns++;mt.iptal()}
function dur(a,z){if(!z)kes();ns++;o.durum='bos';o.i=o.j=0;bil(a)}
o.oynat=function(){if(!b.length)return;if(o.durum==='caliyor')return o.duraklat();o.durum='caliyor';o.hata=0;bil('okunuyor');bil('bolum');soyle()};
o.duraklat=function(a){if(o.durum==='caliyor'){kes();o.durum='duraklatildi';bil(a||'durak')}};
o.durdur=function(){if(o.durum!=='bos')dur('dur')};
o.git=function(k){if(o.durum==='bos')return;var y=Math.max(0,Math.min(b.length-1,o.i+k));if(y===o.i&&!o.j)return;o.i=y;o.j=0;bil('bolum');if(o.durum==='caliyor'){kes();soyle()}};
o.hizAyarla=function(h){o.hiz=h;if(o.durum==='caliyor'){kes();soyle()}};
o.bolumler=b;return o}
// ---- blok listesi: başlık → kısa cevap (önce cevap: gövdenin üstünde, data-body=dil) → gövde (SSS); tablo = geçiş cümlesi.
// Herhangi bir Document üzerinde çalışır (canlı sayfa ya da DOMParser belgesi); düzen / boyut ölçümü kullanmaz.
var ATLA='nav,script,style,button,form,img,svg,iframe,template,.bolum-bag,.toc,.ilgili,.ilgili-makaleler,#ilgili-makaleler,.sesli-oku,.okuma-ayar,.paylas,[aria-hidden="true"],[hidden]',
BLOK='p,div,ul,ol,li,table,h1,h2,h3,h4,h5,h6,details,summary,blockquote,dl,dt,dd,section,figure,figcaption';
// makale gövdesindeki h2[id] başlıklarına parts/makale-okuma.php sonradan "#" bölüm bağlantısı (a.bolum-bag) ekler; bağlantı
// sınıfıyla tanınıp metne hiç katılmaz (ATLA): betik çalışmış olsun ya da olmasın (sayfa yüklenirken, fetch belgesi, yumuşak
// geçişten sonra) aynı blok metni ve aynı özet (2026-11-17; önceki özetler "#" içeriyordu, hepsi değişti, kayıtlar yeniden üretilir).
function metin(el){var s='',w=el.ownerDocument.createTreeWalker(el,4),x,p;while((x=w.nextNode())){p=x.parentElement;
if(p.closest(ATLA)&&!el.matches(ATLA)||p.tagName==='A'&&/^\s*(https?:|www\.)/.test(p.textContent))continue;s+=x.nodeValue}return s.replace(/\s+/g,' ').trim()}
function bloklar(doc,dil){dil=dil==='en'?'en':'tr';var mk=doc.querySelector('.article'),g=mk&&(mk.querySelector('.body[data-body="'+dil+'"]')||mk.querySelector('.body')),b=[];if(!g)return b;
function ekle(el,t){var p=cumleler(normalle(t,dil),180,dil).filter(function(c){return rx('[0-9'+L+']').test(c)});if(p.length)b.push({el:el.closest('details:not([open])')||el,parcalar:p})}
function gez(k){var tp='';function bos(){if(tp.trim())ekle(k,tp);tp=''}
[].forEach.call(k.childNodes,function(c){if(c.nodeType===3){tp+=c.nodeValue;return}
if(c.nodeType!==1||c.matches(ATLA)||k===g&&c.classList.contains('kisa-cevap'))return;
// iOS Safari'nin telefon / tarih / adres algılayıp metni sardığı bağlantı: metin olduğu gibi akar (boşluk eklenmez; özet değişmez)
if(c.hasAttribute('x-apple-data-detectors')){tp+=c.textContent;return}
if(c.tagName==='TABLE'){bos();var sat=c.querySelectorAll('tr'),cap=c.querySelector('caption'),hs=c.querySelector('thead tr')||sat[0];
b.push({el:c,parcalar:[tabloOzet(cap?[metin(cap)]:hs?[].map.call(hs.children,metin):[],Math.max(0,sat.length-(hs?1:0)),dil)]})}
else if(c.matches(BLOK)||/-bsl$/.test(c.className)){bos();if(c.querySelector(BLOK))gez(c);else ekle(c,metin(c))}else tp+=metin(c)+' '});bos()}
var h1=mk.querySelector('h1'),kc=mk.querySelector('.kisa-cevap[data-body="'+dil+'"]')||g.querySelector('.kisa-cevap');if(h1)ekle(h1,metin(h1));if(kc)gez(kc);gez(g);return b}
// blok listesinin özeti: her blok parcalar.join(' '), bloklar '\n' ile; UTF-8 baytları üzerinde FNV-1a 32 bit, 8 haneli onaltılık
function ozet(b){var s=(b||[]).map(function(x){return x.parcalar.join(' ')}).join('\n'),h=2166136261,i,c,y,k;
for(i=0;i<s.length;i++){c=s.codePointAt(i);if(c>65535)i++;
y=c<128?[c]:c<2048?[192|c>>6,128|c&63]:c<65536?[224|c>>12,128|c>>6&63,128|c&63]:[240|c>>18,128|c>>12&63,128|c>>6&63,128|c&63];
for(k=0;k<y.length;k++){h^=y[k];h=Math.imul(h,16777619)>>>0}}return('0000000'+(h>>>0).toString(16)).slice(-8)}
// ses üretimi için dışa aktarım (araclar/ses_uret.py girdisi)
function disaAktar(doc,dil){var b=bloklar(doc,dil);return{ozet:ozet(b),bloklar:b.map(function(x){return x.parcalar.join(' ')})}}
// t (blok başlangıç saniyeleri, artan) içinde s anında okunan blok: t[i] ≤ s olan en büyük i (50 ms pay)
function blokBul(t,s){var a=0,z=t.length-1,r=0,m;while(a<=z){m=(a+z)>>1;if(t[m]<=s+.05){r=m;a=m+1}else z=m-1}return r}
function sureYaz(s){s=Math.max(0,Math.floor(+s||0));var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;function p(n){return(n<10?'0':'')+n}return(h?h+':'+p(m):p(m))+':'+p(x)}
// dosya kipi: tek ses öğesi (a: HTMLAudioElement ya da eşi); düğmeler blok sınırlarına (t) göre çalışır.
// iOS (2026-11-16): load() play()'den önce aynı dokunuşta; hız yalnız üst veri gelince / çalma başlayınca atanır (yüklenmeden
// 1 dışı hız iOS'ta sessiz kalabiliyor); 8 sn'de çalma başlamazsa "bağlantı yavaş", 20 sn'de hâlâ veri yoksa düşüş.
// degistir(): sıradaki makalede AYNI ses öğesine yeni kaynak (iOS'ta dokunuşla açılmış öğe sürdürülebilir; yeni öğe yaratılmaz).
// zm: zamanlayıcı {kur(f, ms), sil(id)} (test için); verilmezse setTimeout.
function DosyaOynatici(b,t,a,olay,zm){var o={i:0,j:0,durum:'bos',hiz:1,kip:'dosya',yuk:0,caldi:0,oyn:'-'},bek=null,dus=0,yk=0,z1=0,z2=0,t0=0;
zm=zm||{kur:function(f,ms){return setTimeout(f,ms)},sil:function(i){clearTimeout(i)}};
function bil(x){if(olay)olay(x,o)}
function hiz(){if(a.readyState<1)return;try{if(a.defaultPlaybackRate!==o.hiz)a.defaultPlaybackRate=o.hiz}catch(e){}try{if(a.playbackRate!==o.hiz)a.playbackRate=o.hiz}catch(e){}}
function sil(){if(z1)zm.sil(z1);if(z2)zm.sil(z2);z1=z2=0}
function dusur(){if(dus)return;dus=1;sil();o.durum='bos';bil('dusus')}
function yavas(){if(o.durum==='caliyor'&&!o.caldi&&Date.now()-t0>=3e3)bil('yavas')}
o.an=function(){return a.readyState>0?a.currentTime:bek!==null?bek:0};
o.sure=function(){return isFinite(a.duration)&&a.duration>0?a.duration:0};
o.sar=function(s){s=Math.max(0,+s||0);if(a.readyState>0){a.currentTime=s;bek=null}else bek=s;var k=blokBul(t,s);if(k!==o.i){o.i=k;if(o.durum!=='bos')bil('bolum')}bil('zaman')};
a.addEventListener('loadedmetadata',function(){if(bek!==null){a.currentTime=bek;bek=null}hiz()});
a.addEventListener('timeupdate',function(){var k=blokBul(t,a.currentTime);if(k!==o.i){o.i=k;if(o.durum!=='bos')bil('bolum')}bil('zaman')});
a.addEventListener('waiting',function(){if(o.durum==='caliyor'&&!o.yuk){o.yuk=1;bil('yukleniyor')}});
a.addEventListener('playing',function(){o.caldi=1;sil();hiz();if(o.yuk){o.yuk=0;bil('okunuyor')}});
a.addEventListener('stalled',yavas);a.addEventListener('suspend',yavas);
a.addEventListener('pause',function(){if(o.durum==='caliyor'&&!a.ended){o.durum='duraklatildi';o.yuk=0;bil('durak')}});
a.addEventListener('ended',function(){sil();o.durum='bos';o.yuk=0;o.i=0;o.sar(0);bil('bitti')});
a.addEventListener('error',function(){if(o.durum!=='bos')dusur()});
o.oynat=function(){if(!b.length||dus)return;if(o.durum==='caliyor')return o.duraklat();o.durum='caliyor';
if(a.readyState<3){o.yuk=1;bil('yukleniyor')}else bil('okunuyor');bil('bolum');
if(!yk){yk=1;try{a.load()}catch(e){}}
if(!o.caldi){t0=Date.now();sil();z1=zm.kur(function(){z1=0;if(o.durum==='caliyor'&&!o.caldi)bil('yavas')},8e3);
z2=zm.kur(function(){z2=0;if(o.durum==='caliyor'&&!o.caldi&&a.readyState===0)dusur()},2e4)}
var p;try{p=a.play()}catch(e){o.oyn=e&&e.name||'hata';return dusur()}
if(p&&p.then)p.then(function(){o.oyn='çözüldü';hiz();bil('oyn');if(o.yuk&&a.readyState>2){o.yuk=0;bil('okunuyor')}},function(e){var n=e&&e.name||'hata';o.oyn=n;if(n==='AbortError')return;
if(n==='NotAllowedError'){sil();if(o.durum==='caliyor'){o.durum='duraklatildi';o.yuk=0;bil('izin')}return}if(o.durum!=='bos')dusur()});else o.oyn='söz yok'};
o.duraklat=function(x){if(o.durum==='caliyor'){o.durum='duraklatildi';o.yuk=0;a.pause();bil(x||'durak')}};
o.durdur=function(){if(o.durum!=='bos'){sil();o.durum='bos';o.yuk=0;a.pause();o.i=0;o.sar(0);bil('dur')}};
o.git=function(k){if(o.durum==='bos')return;var y=Math.max(0,Math.min(t.length-1,o.i+k));if(y===o.i&&(k>0||o.an()-t[y]<1))return;o.i=y;o.sar(t[y]);bil('bolum')};
o.hizAyarla=function(h){o.hiz=h;hiz()};
o.birak=function(){sil();dus=1;o.durum='bos';try{a.pause();a.removeAttribute('src');a.load()}catch(e){}};
o.degistir=function(b2,t2,src){sil();b=b2;t=t2;o.bolumler=b2;o.i=o.j=0;bek=null;dus=0;yk=0;o.caldi=0;o.yuk=0;o.durum='bos';try{a.pause()}catch(e){}a.src=src;o.oynat()};
o.bolumler=b;return o}
// ---- sıradaki makale (2026-11-16; kullanıcı: "makale bitince sıradaki makaleyi otomatik açsın okusun") ----
// Adaylar sayfada zaten basılı listelerden: aynı alandaki diğer makaleler (.alan-diger, "ilgili makaleler"), sonra makale sonu
// galerisi (ilk kartı en yeni makale). Yalnız aynı kökenden makale adresleri.
var MYOL=/^\/(?:makale|en\/article)\/[a-z0-9-]{1,120}$/;
function adaylar(doc){var o=[],g={};function ek(a,s){var h=(a.getAttribute('href')||'').split('#')[0];if(!MYOL.test(h)||g[h])return;g[h]=1;o.push({href:h,baslik:String(s||'').replace(/\s+/g,' ').trim()})}
[].forEach.call(doc.querySelectorAll('.alan-diger li a'),function(a){ek(a,a.textContent)});
[].forEach.call(doc.querySelectorAll('section.vitrin a[data-makale]'),function(a){var s=a.querySelector('.vitrin-baslik');ek(a,s?s.textContent:a.textContent)});return o}
function siradaki(ad,dinlenen,simdi){for(var i=0;i<(ad||[]).length;i++){var x=ad[i];if(x.href!==simdi&&(dinlenen||[]).indexOf(x.href)<0)return x}return null}
// kutunun ses dosyası nitelikleri (yoksa null) ve blok listesine uyması (blok sayısı ve özet)
function dosyaBilgi(k){if(!k)return null;var s=k.getAttribute('data-ses-src'),oz=k.getAttribute('data-ses-ozet'),t=(k.getAttribute('data-ses-t')||'').split(',').map(Number);
return s&&oz&&!t.some(isNaN)?{src:s,oz:oz,t:t,sure:+k.getAttribute('data-ses-sure')||0}:null}
function dosyaUyar(f,b){return!!f&&!!b&&b.length===f.t.length&&ozet(b)===f.oz}
// zincir: makale bitince 5 sn geri sayım (Vazgeç), sonra sıradaki sayfa alınır (yalnız o an; önceden yükleme yok) ve okunur;
// aynı oturumda dinlenen yinelenmez; art arda en çok d.sinir (10) makale, sonra "devam etmek için dokunun".
// d: {dil, ayar(), al(href) → Promise<Document>, kur(f, ms), sil(id), goster(tür, aday, n), baslat(m), dinlenen[], kaydet(dizi), sinir}
function Zincir(d){var z={n:0,no:0,durum:'bos',aday:null,dinlenen:d.dinlenen||[]},tm=0,sn=0;
function sil(){if(tm)d.sil(tm);tm=0}
function adim(a){tm=d.kur(function(){tm=0;if(--sn>0){d.goster('geri',a,sn);adim(a)}else z.yukle(a)},1e3)}
z.bitti=function(ad,simdi){sil();z.durum='bos';if(!d.ayar())return false;var a=siradaki(ad,z.dinlenen,simdi);if(!a)return false;z.aday=a;
if(z.n>=(d.sinir||10)){z.durum='sinir';d.goster('sinir',a);return true}z.durum='geri';sn=5;d.goster('geri',a,sn);adim(a);return true};
z.vazgec=function(){var v=z.durum==='geri'||z.durum==='sinir'||z.durum==='yukleniyor';sil();z.no++;z.durum='bos';z.aday=null;if(v)d.goster('vazgec')};
z.yukle=function(a){sil();var n=++z.no;z.durum='yukleniyor';return d.al(a.href).then(function(doc){if(n!==z.no)return;var b=bloklar(doc,d.dil);if(!b.length)throw 0;
var h=doc.querySelector('.article h1');z.n++;if(z.dinlenen.indexOf(a.href)<0)z.dinlenen.push(a.href);if(d.kaydet)d.kaydet(z.dinlenen);z.durum='okunuyor';
d.baslat({href:a.href,baslik:h?h.textContent.replace(/\s+/g,' ').trim():a.baslik,doc:doc,b:b,adaylar:adaylar(doc),kutu:doc.querySelector('#sesli-oku')})})
['catch'](function(){if(n!==z.no)return;z.durum='bos';d.goster('yok')})};
// sıradakine hemen geç: geri sayımda / sınırda dokunuş, kilit ekranında "sonraki"
z.simdi=function(ad,simdi){var a=(z.durum==='geri'||z.durum==='sinir')&&z.aday||siradaki(ad,z.dinlenen,simdi);if(!a||!d.ayar())return false;if(z.durum==='sinir')z.n=0;z.yukle(a);return true};
z.sifirla=function(){z.n=0};
return z}
// yumuşak geçiş (2026-11-16; kullanıcı: "sıradaki sayfayı da açsın"): ekrandaki makale (article.article; makale sonu galerisi;
// başlık, açıklama, kanonik, hreflang, og / article / twitter, JSON-LD, html lang, dil düğmeleri) alınan belgedekiyle
// değiştirilir; "Makaleyi dinle" kutusu (ve çalan ses öğesi) AYNI düğüm olarak yeni makalenin kutusunun yerine taşınır. Yeni
// gövdenin satır içi betikleri (okuma ayarı, galeri) ve makale okuma yardımcıları (#makale-okuma: içindekiler, bölüm bağlantıları,
// tablolar, başa dön) yeniden çalıştırılır. Beklenen kap yoksa hiçbir şey değişmez (false; çağıran yedek yola düşer).
// o: {calistir(eski betik öğesi), it(href) (history.pushState), sayfa (window.CAP_SAYFA)}
var SESN=['data-ses-src','data-ses-ozet','data-ses-sure','data-ses-t'];
function basEtiket(e){var p=e.getAttribute('property')||'',n=e.getAttribute('name')||'',r=e.getAttribute('rel')||'';
return e.tagName==='META'?/^(?:og|article):/.test(p)||/^twitter:/.test(n)||n==='description'||n==='keywords':e.tagName==='LINK'&&(r==='canonical'||r==='alternate'&&e.hasAttribute('hreflang'))}
function gecis(D,doc,href,kutu,o){var eA=D.querySelector('main article.article'),yA=doc.querySelector('main article.article'),yk=yA&&yA.querySelector('#sesli-oku');
if(!eA||!yA||!yk||kutu.closest('article.article')!==eA||!D.head||!doc.head||!MYOL.test(href))return false;
var eG=D.querySelector('main section.vitrin'),yG=doc.querySelector('main section.vitrin'),gB=yG&&yG.nextElementSibling,eL=D.querySelector('.lang[role="group"]'),yL=doc.querySelector('.lang[role="group"]'),
cs=(/CAP_SAYFA=\{[^}]*makale:'([a-z0-9-]+)'/.exec([].map.call(doc.querySelectorAll('script'),function(s){return s.textContent}).join('\n'))||[])[1],mo=D.getElementById('makale-okuma'),x;
function at(e){if(e&&e.parentNode)e.parentNode.removeChild(e)}
function hepsi(k,s){return[].slice.call(k.querySelectorAll(s))}
hepsi(yA,'script').forEach(function(s){if(/sesli-oku\.js/.test(s.getAttribute('src')||'')||/getElementById\("sesli-oku"\)/.test(s.textContent))at(s)});
SESN.forEach(function(n){var v=yk.getAttribute(n);if(v===null)kutu.removeAttribute(n);else kutu.setAttribute(n,v)});
yA=D.adoptNode(yA);yk=yA.querySelector('#sesli-oku');yk.parentNode.replaceChild(kutu,yk);eA.parentNode.replaceChild(yA,eA);
if(eG){x=eG.nextElementSibling;if(x&&x.tagName==='SCRIPT'&&!x.getAttribute('src'))at(x)}
gB=yG&&gB&&gB.tagName==='SCRIPT'&&!gB.getAttribute('src')?D.adoptNode(gB):null;
if(yG){yG=D.adoptNode(yG);if(eG)eG.parentNode.replaceChild(yG,eG);else yA.closest('main').appendChild(yG);if(gB)yG.parentNode.insertBefore(gB,yG.nextSibling)}else at(eG);
[].slice.call(D.head.children).forEach(function(e){if(basEtiket(e))at(e)});
[].slice.call(doc.head.children).forEach(function(e){if(basEtiket(e))D.head.appendChild(D.adoptNode(e))});
D.title=doc.title;x=doc.documentElement.getAttribute('lang');if(x)D.documentElement.setAttribute('lang',x);
hepsi(D,'script[type="application/ld+json"]').forEach(at);
hepsi(doc,'script[type="application/ld+json"]').forEach(function(s){D.body.appendChild(D.adoptNode(s))});
if(eL&&yL)eL.parentNode.replaceChild(D.adoptNode(yL),eL);
if(cs&&o.sayfa)o.sayfa.makale=cs;
hepsi(yA,'script').concat(gB?[gB]:[]).forEach(function(s){if(!s.getAttribute('src')&&!/json/.test(s.getAttribute('type')||''))o.calistir(s)});
hepsi(D,'.basa-don').forEach(at);if(mo)o.calistir(mo);
o.it(href);return true}
// tanı görünümü metni (adres #ses-tani ya da kutudaki nota 5 dokunuş): kişisel veri yok, hiçbir yere gönderilmez
function taniMetin(s){return['sesli-oku.js v='+s.surum,'kip: '+s.kip,'data-ses-src: '+(s.src?'var':'yok')+'; dosya şartı: '+s.sart,
'özet: sayfa '+s.sayfaOz+' ('+s.sayfaN+' blok) / bildirim '+(s.bildOz||'-')+' ('+s.bildN+' blok) → '+(s.bildOz?s.sayfaOz===s.bildOz&&s.sayfaN===s.bildN?'eşit':'farklı':'-'),
'Audio: '+(s.audio?'var':'yok')+'; canPlayType(audio/mpeg): "'+s.cpt+'"','son play(): '+s.oyn,
'readyState: '+s.rs+'; networkState: '+s.ns+'; error.code: '+s.err,'medya olayları: '+(s.medya.length?s.medya.join(', '):'-'),
'speechSynthesis: '+(s.ss?'var':'yok')+'; ses sayısı: '+s.sesN+'; seçilen: '+s.ses,'son konuşma olayı: '+s.konusma,'zincir: '+s.zincir,'UA: '+s.ua].join('\n')}
var API={normalle:normalle,cumleler:cumleler,tabloOzet:tabloOzet,sesSec:sesSec,ekUyarla:ekUyarla,Oynatici:Oynatici,SOZ:SOZ,
bloklar:bloklar,ozet:ozet,disaAktar:disaAktar,blokBul:blokBul,sureYaz:sureYaz,DosyaOynatici:DosyaOynatici,
kucuk:kucuk,adaylar:adaylar,siradaki:siradaki,dosyaBilgi:dosyaBilgi,dosyaUyar:dosyaUyar,Zincir:Zincir,gecis:gecis,taniMetin:taniMetin};
if(typeof module!=='undefined'&&module.exports){module.exports=API;return}
G.SesliOku=API;
var D=G.document,kutu=D&&D.getElementById('sesli-oku');if(!kutu)return;
var dil=(D.documentElement.lang||'').slice(0,2)==='en'?'en':'tr',ss=G.speechSynthesis,Utt=G.SpeechSynthesisUtterance,U=M[dil].ui,N=G.navigator||{},
q=function(s){return kutu.querySelector(s)},durEl=q('.so-durum'),oyn=q('.so-oynat'),sayac=q('.so-sayac'),hizEl=q('.so-hiz'),notEl=q('.so-not'),
sarEl=q('.so-sar'),konEl=q('.so-konum'),sureEl=q('.so-sure'),O=null,FO=null,aud=null,isaret=null,
ses=null,sesler=[],nobet=0,bekle=0,sonIptal=0,konustu=0,dokunus=0,nb=0,az=G.matchMedia&&G.matchMedia('(prefers-reduced-motion: reduce)').matches,
SRC,OZ,SURE,T,notTts=notEl?notEl.textContent:'',kapali=0,kaldi=0,suruk=0,ilk=null,simdiki=null,bekleyen=null,otomatik=0,kaydir=0,Z=null,yol=G.location.pathname,
sc=D.currentScript||D.querySelector('script[src*="sesli-oku.js"]'),SURUM=(sc&&/[?&]v=([\w-]+)/.exec(sc.src)||[])[1]||'?',UA=String(N.userAgent||''),
IOS=/iP(?:hone|ad|od)/.test(UA)||/Macintosh/.test(UA)&&N.maxTouchPoints>1,DK=dil==='en'?'en-US':'tr-TR',tBas=Date.now(),ilkDil=D.documentElement.lang,
tani={medya:[],konusma:'-',basladi:0,sart:'-',sayfaOz:null,sayfaN:0},taniEl=null,dokSay=0,dokZ=0;
function sesNit(){SRC=kutu.getAttribute('data-ses-src');OZ=kutu.getAttribute('data-ses-ozet');SURE=+kutu.getAttribute('data-ses-sure')||0;T=(kutu.getAttribute('data-ses-t')||'').split(',').map(Number)}
sesNit();
// betiğin eklediği öğeler kutunun içinde (blok listesi .sesli-oku'yu atlar; özet değişmez)
function yeni(ad,sinif,ust,once){var e=D.createElement(ad);e.className=sinif;(ust||kutu).insertBefore(e,once===undefined?notEl:once);return e}
var uyariEl=yeni('p','so-uyari'),siraEl=yeni('div','so-sira'),devamEl=yeni('button','so-devam'),ayarEl=null,ayarKutu=null;
uyariEl.hidden=siraEl.hidden=devamEl.hidden=true;uyariEl.setAttribute('aria-live','polite');siraEl.setAttribute('aria-live','polite');
devamEl.type='button';devamEl.textContent=U.devam;
if(G.fetch&&G.DOMParser){ayarEl=yeni('label','so-sira-ayar');ayarKutu=D.createElement('input');ayarKutu.type='checkbox';ayarEl.appendChild(ayarKutu);
var ayarAd=D.createElement('span');ayarAd.textContent=U.ayar;ayarEl.appendChild(ayarAd);
try{ayarKutu.checked=G.localStorage.getItem('capar-ses-sira')!=='0'}catch(e){ayarKutu.checked=true}
ayarKutu.addEventListener('change',function(){try{G.localStorage.setItem('capar-ses-sira',ayarKutu.checked?'1':'0')}catch(e){}if(!ayarKutu.checked&&Z)Z.vazgec()})}
function ayarAcik(){return!!ayarKutu&&ayarKutu.checked}
function yaz(a){var s=kutu.getAttribute('data-m-'+a)||U[a];if(typeof s!=='string')return;if(a==='okunuyor'&&IOS&&O&&O.kip!=='dosya')s+=' '+U.sessiz;durEl.textContent=s}
function uyar(s){uyariEl.textContent=s||'';uyariEl.hidden=!s}
function devamGoster(v){devamEl.hidden=!v}
// dosya kipi şartı (eşzamanlı): dosya var, blok sayısı = t uzunluğu, blok özeti = bildirim özeti; değilse tarayıcı sesi
function dosyaBloklar(){var r=!SRC||!OZ?'ses dosyası yok':kapali?'kapatıldı (düşüş)':!G.Audio?'Audio yok':T.some(isNaN)?'t bozuk':'';
if(r){tani.sart=r;return null}var b=bloklar(D,dil),oz=ozet(b);tani.sayfaOz=oz;tani.sayfaN=b.length;
r=b.length!==T.length?'blok sayısı '+b.length+' ≠ '+T.length:oz!==OZ?'özet '+oz+' ≠ '+OZ:'';tani.sart=r||'tuttu';return r?null:b}
function sarGoster(v){if(sarEl)sarEl.hidden=!v;if(notEl)notEl.textContent=v?kutu.getAttribute('data-m-not-dosya')||notTts:notTts}
function toplam(){return O&&O.kip==='dosya'&&O.sure()||SURE}
function zaman(s){if(!konEl)return;var c=s===undefined?O&&O.kip==='dosya'?O.an():0:s,z=sureYaz(c)+' / '+sureYaz(toplam());
if(!suruk&&s===undefined)konEl.value=c;sureEl.textContent=z;konEl.setAttribute('aria-valuetext',z)}
// sayfa yüklenirken (özet "#" öykünmesiyle betikten bağımsız): tıklamada sayfa değişmişse (iOS veri algılama, çeviri) bu liste kullanılır
var hazir=dosyaBloklar();if(hazir){sarGoster(1);zaman(0)}
// konuşma sentezi yoksa ve dosya da yoksa yalnız not (tanı görünümü yine açılabilir)
if(!ss||!Utt){kutu.setAttribute('data-so',hazir?'bos':'yok');if(hazir)durEl.textContent=''}
// sesler sayfa yüklenirken ısıtılır (iOS'ta ilk getVoices() çoğu zaman boş); liste sonradan gelirse sonraki cümlelerde seçilen ses
function sesleriAl(){try{var v=ss.getVoices();if(v&&v.length){sesler=v;if(!ses){ses=sesSec(v,dil)}}}catch(e){}taniYaz()}
if(ss){sesleriAl();try{if(ss.addEventListener)ss.addEventListener('voiceschanged',sesleriAl);else ss.onvoiceschanged=sesleriAl}catch(e){}}
// cümle başına söyleyiş; ses seçilmemişse yalnız dil (iOS dile göre varsayılan sesi seçer); kayıp onend için nöbet.
// İptalden hemen sonraki söyleyiş 80 ms gecikir (Chrome), ama ilk söyleyiş hiç gecikmez (iOS: dokunuşun içinde kalmalı).
var motor={konus:function(t,hiz,bitti){var u=new Utt(t),tm=0,bas=Date.now(),bs=0;
function son(h){if(tm)return;tm=1;clearInterval(nobet);bitti(h)}
u.lang=ses?ses.lang:DK;if(ses)u.voice=ses;u.rate=hiz;u.onstart=function(){tani.basladi=1;tani.konusma='start';taniYaz()};
u.onend=function(){tani.konusma='end';son(null)};u.onerror=function(e){tani.konusma='error '+(e&&e.error||'?');taniYaz();son(e&&e.error||'hata')};
clearInterval(nobet);nobet=setInterval(function(){if(Date.now()-bas>3e3&&!ss.speaking&&!ss.pending){if(++bs>1)son(null)}else bs=0},1e3);
var f=function(){bekle=0;if(ss.paused)ss.resume();ss.speak(u)};G.__soU=u;if(konustu&&Date.now()-sonIptal<150)bekle=setTimeout(f,80);else f();konustu=1},
iptal:function(){clearInterval(nobet);clearTimeout(bekle);sonIptal=Date.now();ss.cancel()}};
try{var kh=G.localStorage.getItem('capar-ses-hiz');if(kh&&hizEl.querySelector('option[value="'+kh+'"]'))hizEl.value=kh}catch(e){}
function ekranda(){return!simdiki||simdiki.ekran}
function vurgula(el){if(isaret)isaret.classList.remove('so-okunan');isaret=el;if(!el)return;el.classList.add('so-okunan');if(D.hidden)return;
var r=el.getBoundingClientRect();if(r.top<90||r.bottom>G.innerHeight-90)el.scrollIntoView({block:'center',behavior:az?'instant':'smooth'})}
function arayuz(o){if(o.yuk)kutu.setAttribute('data-yuk','');else kutu.removeAttribute('data-yuk');oyn.setAttribute('aria-busy',!!o.yuk);
oyn.setAttribute('aria-pressed',o.durum==='caliyor');kutu.setAttribute('data-so',o.durum);
[].forEach.call(kutu.querySelectorAll('.so-kucuk'),function(x){x.setAttribute('aria-disabled',o.durum==='bos')});
if(o.durum==='bos'){vurgula(null);sayac.textContent=''}}
function olay(a,o){if(o!==O)return;var n=O.bolumler.length;if(a==='dusus')return tarayiciyaGec(o.i);
if(a==='bolum'){sayac.textContent=o.i+1+' / '+n;vurgula(ekranda()?O.bolumler[o.i].el:null)}else if(a==='zaman')zaman();else yaz(a);
if(a==='izin'&&kaldi&&!o.kip)o.i=kaldi;if(a==='dur'||a==='bitti'){kaldi=0;uyar('')}
if(a==='izin'&&otomatik)devamGoster(1);if(a==='okunuyor')devamGoster(0);
arayuz(o);if(a==='bitti')zincirBitti();taniYaz()}
// dosya yüklenemedi: kaldığı bloktan tarayıcı sesiyle sürdür; iOS dokunuş dışı speak'i engellerse kalıcı "yeniden dokunun" iletisi
function tarayiciyaGec(i){var F=O;O=FO=aud=null;kapali=1;F.birak();sarGoster(0);kutu.removeAttribute('data-yuk');
if(!ss||!Utt){kutu.setAttribute('data-so','bos');vurgula(null);sayac.textContent='';return yaz('hata')}kaldi=i;uyar(kutu.getAttribute('data-m-dusus')||U.dusus);ttsBasla(simdiki&&simdiki.b)}
// dokunuşun dışında başlatılan konuşma 2,5 sn içinde başlamadıysa (onstart yok, speaking false): iOS engeli
function engelNobet(){var n=++nb;setTimeout(function(){if(n!==nb||!O||O.kip==='dosya'||O.durum!=='caliyor'||tani.basladi||ss.speaking)return;
O.duraklat('engel');durEl.textContent='';arayuz({durum:'bos'});uyar(kapali?U.dokun:U.sinir);if(otomatik)devamGoster(1);taniYaz()},2500)}
function ttsBasla(b){sesleriAl();ses=sesler.length?sesSec(sesler,dil):null;if(sesler.length&&!ses){kutu.setAttribute('data-so','yok');yaz('yok-ses');return}
O=Oynatici(b||bloklar(D,dil),motor,olay);O.hiz=+hizEl.value||1;if(kaldi)O.i=Math.min(kaldi,O.bolumler.length-1);tani.basladi=0;O.oynat();if(!dokunus)engelNobet()}
function yeniSes(){var a=new G.Audio();try{a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','')}catch(e){}a.preload='none';
try{a.preservesPitch=true}catch(e){}try{a.mozPreservesPitch=true}catch(e){}try{a.webkitPreservesPitch=true}catch(e){}
'loadstart loadedmetadata canplay playing waiting stalled suspend pause ended error abort'.split(' ').forEach(function(n){a.addEventListener(n,function(){
tani.medya.push(n+' '+((Date.now()-tBas)/1e3).toFixed(1));if(tani.medya.length>6)tani.medya.shift();taniYaz()})});return a}
function medya(){var m=N.mediaSession,h=D.querySelector('.article h1');if(!m)return;
try{if(G.MediaMetadata)m.metadata=new G.MediaMetadata({title:simdiki?simdiki.baslik:h?h.textContent.replace(/\s+/g,' ').trim():D.title,artist:'Av. Bayram Can Çapar'})}catch(e){}
[['play',function(){if(O&&O.durum!=='caliyor')O.oynat()}],['pause',function(){if(O)O.duraklat()}],['previoustrack',function(){if(O)O.git(-1)}],
['nexttrack',function(){if(!(Z&&Z.simdi(simdiki?simdiki.adaylar:adaylar(D),yol))&&O)O.git(1)}]].forEach(function(x){try{m.setActionHandler(x[0],x[1])}catch(e){}})}
function basla(){var b;devamGoster(0);tBas=Date.now();tani.sayfaOz=null;if(Z)Z.sifirla();
if(Z&&(Z.durum==='geri'||Z.durum==='sinir'))return Z.simdi(simdiki?simdiki.adaylar:adaylar(D),yol);
if(bekleyen){b=bekleyen;bekleyen=null;return zincirBaslat(b)}
if(O&&O.kip==='dosya')return O.oynat();
if(!O&&(b=dosyaBloklar()||(hazir&&!kapali&&!simdiki&&D.documentElement.lang===ilkDil?hazir:null))){aud=yeniSes();aud.src=SRC;
O=FO=DosyaOynatici(b,T,aud,olay);O.hiz=+hizEl.value||1;if(ilk!==null)O.sar(ilk);sarGoster(1);medya();dinlenenEkle(yol);return O.oynat()}
if(!O)sarGoster(0);if(!ss||!Utt){kutu.setAttribute('data-so','yok');return yaz('hata')}
if(uyariEl.textContent===U.dokun)uyar(kutu.getAttribute('data-m-dusus')||U.dusus);else if(uyariEl.textContent===U.sinir)uyar('');
if((ss.speaking||ss.pending)&&!(O&&O.durum==='caliyor')){sonIptal=Date.now();ss.cancel()}
if(O)return O.oynat();dinlenenEkle(yol);ttsBasla(simdiki&&simdiki.b)}
// ---- sıradaki makale: ayar, oturum belleği, geri sayım kartı, yumuşak geçiş ----
function dinlenenOku(){try{var x=JSON.parse(G.sessionStorage.getItem('capar-ses-dinlenen')||'[]');return Array.isArray(x)?x.slice(-50):[]}catch(e){return[]}}
function dinlenenYaz(x){try{G.sessionStorage.setItem('capar-ses-dinlenen',JSON.stringify(x.slice(-50)))}catch(e){}}
function dinlenenEkle(h){if(Z&&Z.dinlenen.indexOf(h)<0){Z.dinlenen.push(h);dinlenenYaz(Z.dinlenen)}}
function bag(a,s){var e=D.createElement('a');e.href=a+'#dinle';e.textContent=s;return e}
function siraGoster(tur,a,n){while(siraEl.firstChild)siraEl.removeChild(siraEl.firstChild);var y=function(s){siraEl.appendChild(D.createTextNode(s))};
if(tur==='geri'||tur==='sinir'){y(U.sira);siraEl.appendChild(bag(a.href,a.baslik));y(' — '+(tur==='geri'?U.geri(n):U.sinir)+' ');
var v=D.createElement('button');v.type='button';v.className='so-vazgec';v.textContent=U.vazgec;v.addEventListener('click',function(){if(Z)Z.vazgec()});siraEl.appendChild(v)}
else if(tur==='simdi'){if(a.ekran)y(U.acildi+a.baslik);else{y(U.simdi+a.baslik+' · ');siraEl.appendChild(bag(a.href,U.ac))}}
else if(simdiki&&(tur==='vazgec'||tur==='yok'))return siraGoster('simdi',simdiki);
siraEl.hidden=!siraEl.firstChild;taniYaz()}
function sayfaAl(h){if(!MYOL.test(h))return Promise.reject(0);
return G.fetch(h,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(s){return new G.DOMParser().parseFromString(s,'text/html')})}
function calistir(s){var n=D.createElement('script');n.textContent=s.textContent;if(s.id)n.id=s.id;s.parentNode.replaceChild(n,s)}
function yumusak(m){var ok=false;try{ok=gecis(D,m.doc,m.href,kutu,{calistir:calistir,sayfa:G.CAP_SAYFA,it:function(h){G.history.pushState({so:1},'',h)}})}catch(e){ok=false}
if(!ok)return false;yol=m.href;sesNit();tani.sayfaOz=null;
if(D.hidden)kaydir=1;else G.scrollTo(0,0);
try{if(G.localStorage.getItem('capar-cerez')==='accepted'&&G.capOlay)G.capOlay('page_view',{page_location:G.location.href,page_title:D.title})}catch(e){}
return true}
function zincirBaslat(m){var eski=O,f=dosyaBilgi(m.kutu),ok=dosyaUyar(f,m.b);O=null;
if(eski&&eski!==FO&&eski.durum!=='bos')eski.durdur();if(FO&&FO.durum!=='bos')FO.durdur();
vurgula(null);m.ekran=ayarAcik()&&yumusak(m);simdiki=m;if(!m.ekran)dinlenenEkle(m.href);tani.sart=!f?'ses dosyası yok (sıradaki)':ok?'tuttu (sıradaki)':'özet tutmadı (sıradaki)';
if(aud&&FO&&ok&&!kapali){SURE=f.sure;if(konEl)konEl.max=f.sure;O=FO;sarGoster(1);FO.hiz=+hizEl.value||1;FO.degistir(m.b,f.t,f.src)}
else{sarGoster(0);kaldi=0;ttsBasla(m.b)}
siraGoster('simdi',m);medya();tani.zincir=(m.ekran?'yumuşak geçiş':'yedek yol')+'; '+m.href+'; art arda '+(Z?Z.n:0);taniYaz()}
function zincirBitti(){if(Z&&!Z.bitti(simdiki?simdiki.adaylar:adaylar(D),yol)&&simdiki)siraGoster('simdi',simdiki)}
if(ayarKutu)Z=Zincir({dil:dil,ayar:ayarAcik,al:sayfaAl,kur:function(f,ms){return setTimeout(f,ms)},sil:function(i){clearTimeout(i)},goster:function(t,a,n){
tani.zincir=t+(a?' '+a.href:'');siraGoster(t,a,n);if(t==='sinir')durEl.textContent=''},baslat:zincirBaslat,dinlenen:dinlenenOku(),kaydet:dinlenenYaz,sinir:10});
// ---- tanı görünümü ----
function taniYaz(){if(!taniEl)return;var a=aud,s={surum:SURUM,kip:O?O.kip==='dosya'?'dosya':'tarayıcı sesi':kutu.getAttribute('data-so')==='yok'?'yok':'başlamadı',
src:SRC,sart:tani.sart,bildOz:OZ,bildN:SRC?T.length:0,audio:!!G.Audio,cpt:'',oyn:FO?FO.oyn:'-',rs:a?a.readyState:'-',ns:a?a.networkState:'-',err:a&&a.error?a.error.code:'-',
medya:tani.medya,ss:!!ss,sesN:sesler.length,ses:ses?ses.name+' ('+ses.lang+')':'- (yalnız dil '+DK+')',konusma:tani.konusma,zincir:(ayarAcik()?'açık':'kapalı')+'; '+(tani.zincir||'-'),ua:UA};
if(tani.sayfaOz===null){var b=bloklar(D,dil);tani.sayfaOz=ozet(b);tani.sayfaN=b.length}s.sayfaOz=tani.sayfaOz;s.sayfaN=tani.sayfaN;
if(tani.cpt===undefined)try{tani.cpt=G.Audio?new G.Audio().canPlayType('audio/mpeg'):'-'}catch(e){tani.cpt='hata'}s.cpt=tani.cpt;taniEl.textContent=taniMetin(s)}
function taniAc(){if(taniEl)return;taniEl=yeni('pre','so-tani',kutu,null);taniYaz()}
if(/^#ses-tani$/.test(G.location.hash))taniAc();
G.addEventListener('hashchange',function(){if(G.location.hash==='#ses-tani')taniAc()});
if(notEl)notEl.addEventListener('click',function(){clearTimeout(dokZ);dokZ=setTimeout(function(){dokSay=0},4e3);if(++dokSay>=5)taniAc()});
// ---- olaylar ----
kutu.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('button');if(!t||t.classList.contains('so-vazgec'))return;var k=t.getAttribute('data-so-k');
dokunus=1;try{if(k==='oynat'||t===devamEl)basla();else if(k==='dur'){if(Z)Z.vazgec();if(O)O.durdur()}else if(O)O.git(k==='ileri'?1:-1)}finally{dokunus=0}});
hizEl.addEventListener('change',function(){try{G.localStorage.setItem('capar-ses-hiz',hizEl.value)}catch(e){}if(O)O.hizAyarla(+hizEl.value||1)});
if(konEl){konEl.addEventListener('input',function(){suruk=1;zaman(+konEl.value)});
konEl.addEventListener('change',function(){suruk=0;var s=+konEl.value;if(O&&O.kip==='dosya')O.sar(s);else{ilk=s;zaman(s)}})}
// sekme gizlenince yalnız tarayıcı sesi duraklar; ses dosyası arka planda (ekran kapalıyken) çalmayı sürdürür
D.addEventListener('visibilitychange',function(){if(D.hidden&&O&&O.kip!=='dosya')O.duraklat('gizli');if(!D.hidden&&kaydir){kaydir=0;G.scrollTo(0,0)}});
G.addEventListener('pagehide',function(){if(Z)Z.vazgec();if(O)O.durdur();try{if(ss)ss.cancel()}catch(e){}});
// iOS geri / ileri önbelleğinden dönüş: düğme ve iletiler sıfırlanır (pagehide'da durdurulmuştu)
G.addEventListener('pageshow',function(e){if(!e.persisted)return;if(Z)Z.vazgec();if(O&&O.durum!=='bos')O.durdur();bekleyen=null;devamGoster(0);uyar('');durEl.textContent='';
if(kutu.getAttribute('data-so')!=='yok')arayuz({durum:'bos'})});
// yumuşak geçişten sonra geri / ileri: o adres tam sayfa yüklenir (yalnız yol değiştiyse; bölüm çapaları etkilenmez)
G.addEventListener('popstate',function(){if(G.location.pathname!==yol)G.location.reload()});
// #dinle: "Makaleyi aç" bağlantısıyla gelindi; başlatma denenir, engellenirse "Dinlemeye devam et"
if(G.location.hash==='#dinle'){otomatik=1;try{G.history.replaceState(null,'',G.location.pathname+G.location.search)}catch(e){}
try{kutu.scrollIntoView({block:'center'})}catch(e){}basla()}
}(typeof window!=='undefined'?window:this));
