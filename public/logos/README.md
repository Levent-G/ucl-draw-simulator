# Logo dosyaları buraya

Bu klasöre kendi **lisanslı/kullanım hakkına sahip olduğun** logo dosyalarını
eklersen, uygulama otomatik olarak onları kullanır. Dosya bulunamazsa (404),
sessizce projenin özgün SVG rozetlerine geri döner — hiçbir hata görünmez.

> Not: Gerçek kulüp logoları ve resmi UEFA/Şampiyonlar Ligi amblemi telifli /
> marka korumalı içeriklerdir. Ben (Claude) bunları senin için üretemem ya da
> internetten çekip ekleyemem. Ama sen bu logolara yasal olarak sahipsen
> (örneğin kulüplerin kendi basın kitleri, satın aldığın bir ikon paketi, ya
> da kullanım izni verdiğin görseller), aşağıdaki isimlendirmeyle eklemen
> yeterli.

## Takım logoları

Dosya adı, `src/data/teams.js` içindeki her takımın `logo` alanıyla birebir
eşleşmeli (küçük harf, `.svg`):

```
public/logos/rma.svg   Real Madrid
public/logos/mci.svg   Manchester City
public/logos/bay.svg   Bayern Münih
public/logos/psg.svg   Paris Saint-Germain
public/logos/liv.svg   Liverpool
public/logos/int.svg   Inter
public/logos/bar.svg   Barcelona
public/logos/lev.svg   Bayer Leverkusen
public/logos/ata.svg   Atalanta
public/logos/atm.svg   Atletico Madrid
public/logos/ars.svg   Arsenal
public/logos/bvb.svg   Borussia Dortmund
public/logos/mil.svg   AC Milan
public/logos/juv.svg   Juventus
public/logos/ben.svg   Benfica
public/logos/fey.svg   Feyenoord
public/logos/clb.svg   Club Brugge
public/logos/shk.svg   Shakhtar Donetsk
public/logos/gir.svg   Girona
public/logos/avl.svg   Aston Villa
public/logos/vfb.svg   VfB Stuttgart
public/logos/mon.svg   Monaco
public/logos/spo.svg   Sporting CP
public/logos/psv.svg   PSV Eindhoven
public/logos/cel.svg   Celtic
public/logos/yb.svg    Young Boys
public/logos/spa.svg   Sparta Prag
public/logos/che.svg   Chelsea
public/logos/bre.svg   Brest
public/logos/dzg.svg   Dinamo Zagreb
public/logos/czv.svg   Crvena Zvezda
public/logos/slo.svg   Slovan Bratislava
public/logos/stu.svg   Sturm Graz
public/logos/bod.svg   Bodø/Glimt
public/logos/gal.svg   Galatasaray
public/logos/qar.svg   Qarabağ
```

Takım listesini değiştirirsen (`src/data/teams.js`), her takımın `logo`
alanını yeni dosya yoluna göre güncellemen yeterli.

## UCL / Şampiyonlar Ligi logosu

Header'daki başlığın yanına logo koymak için:

```
public/logos/ucl-logo.png
```

Bu dosya yoksa header'da sadece metin başlık görünür (mevcut hâliyle çalışır).

## Nereleri kullanıyor?

- `src/components/Crest.jsx` — tüm takım amblemleri (küre, kağıt reveal,
  torba panosu, tablolar, final kartları) bu bileşen üzerinden gösterilir.
- `src/App.jsx` — header'daki `ucl-logo-img`.
