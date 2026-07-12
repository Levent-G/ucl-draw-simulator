# UCL Kura Çekimi Simülatörü

UEFA Şampiyonlar Ligi lig fazı (İsviçre Modeli) kura çekimini, gerçek kurallara
sadık bir algoritma ve gerçekçi bir tören animasyonuyla simüle eden React
uygulaması.

## Kurulum ve çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır. "Kura Çekimini Başlat" butonuna
basınca çekiliş, gerçek törendeki gibi Torba 1'den Torba 4'e doğru, takım takım
canlanır.

Production build için:

```bash
npm run build
npm run preview
```

## Neden bu proje "gerçeğe yakın"?

### Format ve kurallar
- 36 takım, katsayıya göre 4 torbaya (Pot) ayrılmış, her torbada 9 takım
  (`src/data/teams.js`).
- Her takım toplam **8 maç** oynar: kendi torbası dahil **her torbadan 2 rakip**.
- Torba başına çekilen 2 rakipten biri iç sahada, diğeri deplasmandadır — bu da
  otomatik olarak 4 iç saha + 4 deplasman dengesini verir.
- Bir takım **kendi federasyonundan** (ülkesinden) bir takımla asla eşleşmez.
- Bir takım aynı federasyondan **en fazla 2** farklı rakiple eşleşebilir
  (örn. 5 İngiliz kulübü olsa bile bir takım en fazla 2 İngiliz rakiple oynar).
- Aynı iki takım çekilişte yalnızca bir kez karşılaşır.

### Algoritma (`src/utils/drawEngine.js`)
UEFA'nın gerçek töreninde de sunucu sadece topu çeker; kuralları tutan geçerli
rakip listesini bir bilgisayar hesaplar. Bu projede de aynı yaklaşım var:

1. Aynı torba içi eşleşmeler (Pot1-Pot1, Pot2-Pot2, ...) ülke kısıtına uyan bir
   döngü (Hamilton cycle) olarak kurulur; döngü tek yönde yönlendirilerek her
   takıma otomatik 1 iç saha + 1 deplasman rakibi verilir.
2. Farklı torbalar arası eşleşmeler, iki ayrı permütasyon (biri "iç saha",
   diğeri "deplasman" eşleşmesi) olarak, **kısıtları inşa sırasında** uygulayan
   (forward-checking) rastgele geri izleme (backtracking) ile kurulur.
3. Sonuçta ortaya çıkan tam eşleşme kümesi çift kontrol ile doğrulanır; bir
   çıkmaza girilirse tüm çekiliş yeniden üretilir.

Bu yaklaşım saf "önce rastgele eşleştir, sonra kontrol et" yönteminden çok daha
güvenilirdir — çünkü örneğin 5 takımı olan bir ülke varken bağımsız rastgele
seçimler neredeyse her zaman bir takıma 3+ aynı ülkeden rakip verir ve kuralı
bozar. `scripts/verify-draw.mjs` bu algoritmayı onlarca kez çalıştırıp tüm
kuralların her seferinde sağlandığını doğrular:

```bash
node scripts/verify-draw.mjs
```

### Sayfa düzeni
- **Sol taraf**: "Lig Fazı Kura Tablosu" artık TEK bir dev tablo değil, **4 ayrı
  torba tablosu** (`PotTable.jsx`), 2'li sütun halinde yan yana
  (`PotTablesPanel.jsx`). Her tablo kendi torbasının 9 takımını satır olarak
  sabit gösterir (torba kompozisyonu zaten bilinir), hücreler çekiliş
  ilerledikçe dolar. Başlat düğmesi bu 4 tablonun üzerinde, ortalanmış olarak
  durur.
- **Sağ taraf**: "canlı yayın" sütunu — top karışma/çekilme animasyonu
  (`DrumSphere.jsx`, büyütülmüş küre ve daha uzun karışma süresi ile) ve
  altında, sabit yükseklikte kalıp kendi içinde aşağıdan yukarıya akan ve
  kayan canlı spiker paneli (`AnnouncerPanel.jsx`) — bu sütun sayfayı aşağı
  doğru uzatmaz, sadece kendi içinde scroll olur.
  Torbalardaki takım listesini ayrıca göstermiyoruz (torba tabloları zaten bu
  bilgiyi taşıyor).
- **Pot tabloları** artık scroll gerektirmeden tam sığacak şekilde (9 satır +
  başlıklar) gösterilir; scroll sadece çok dar ekranlarda yatay olarak devreye
  girer.

### Tören / animasyon
- **Büyük yuvarlak başlat düğmesi** (`StartOrb.jsx`): 4 tablonun tam ortasında,
  özgün bir "top" motifiyle tasarlanmış (gerçek UEFA amblemi değil). Basılınca
  çekiliş başlar.
- **Top karışma/çekilme efekti** (`DrumSphere.jsx`): kalıcı bir panel değil,
  tam ekran ortalanmış bir katman. Sadece bir sonraki takım çekilmeden hemen
  önce belirir, toplar bir süre karışır, top çekilir, sonra kaybolur — yerini
  kağıt reveal'ine bırakır. Karışma ve çekilme anları kasıtlı olarak yavaş
  tutuldu ki gerçek bir tören gibi hissettirsin.
- **Kağıt açılma efekti** (`PaperReveal.jsx`): top çekilince, ekranın tam
  ortasında bir kağıt/kart açılır gibi animasyonla çekilen takımın adı ve
  amblemi belirir, kısa süre sonra kaybolur.
- **Sol alt canlı bilgi bandı** (`CurrentDrawPanel.jsx`): gerçek yayındaki gibi,
  o an çekilen takımın rakipleri H/A etiketiyle teker teker alta eklenir, en
  altta çekilen takımın adı sabit durur.
- İlgili torba tablosundaki hücreler doldurulmadan hemen önce kısa bir
  "yükleniyor" parıltı efekti (shimmer) gösterir, sonra veriyle dolar.
- Çekiliş bitince konfeti oynar ve tüm 36 takımın fikstürü, 2'li sütun
  halinde alt alta ayrı kartlar olarak da gösterilir (`FinalResultsGrid.jsx`).

## Takım listesini güncelleme

`src/data/teams.js` içindeki `RAW_TEAMS` dizisini güncel sezonun gerçek
katılımcı listesiyle değiştirmen yeterli — algoritma ve arayüz otomatik olarak
uyum sağlar. Her torbada tam 9 takım olmasına dikkat et.

## Proje yapısı

```
src/
  data/teams.js         36 takım, torba/ülke/katsayı verisi + torba renkleri
  utils/drawEngine.js   kura algoritması (kısıt tabanlı backtracking)
  utils/resultsHelpers.js  boş fikstür sonuç yapısı yardımcı fonksiyonu
  components/
    Crest.jsx           özgün takım amblemi (SVG kalkan)
    StartOrb.jsx         büyük yuvarlak başlat düğmesi (özgün top motifi)
    DrumSphere.jsx      top karışma/çekilme animasyonu
    PaperReveal.jsx      ortada kağıt açılma efektiyle takım adı reveal'i
    CurrentDrawPanel.jsx sol altta H/A rakip listesi (canlı yayın bandı)
    AnnouncerPanel.jsx  sağ sütunda akan canlı spiker/anons paneli
    PotTable.jsx        tek bir torbanın 9 takımlık tablosu
    PotTablesPanel.jsx  4 torba tablosunu 2'li sütun halinde birleştiren panel
    FinalResultsGrid.jsx  çekiliş sonu, 2'li sütun halinde tüm takım kartları
    ControlBar.jsx      hız / sıfırla / sonuca-atla kontrolleri
    Confetti.jsx        kutlama efekti
  App.jsx               orkestrasyon: zamanlama, state, olay akışı
scripts/verify-draw.mjs kuralların doğrulanması için bağımsız test scripti
```
