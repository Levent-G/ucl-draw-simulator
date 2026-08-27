// Trendyol Süper Lig - takım verisi
//
// NOT: UEFA Şampiyonlar Ligi / Avrupa Ligi'nin aksine bu, "İsviçre modeli" bir
// kura değil, standart çift devreli lig (herkes herkesle iki kez oynar) formatlı
// bir yapıdır. Bu yüzden torba (pot) kavramı yoktur; her takım için sadece görece
// bir güç puanı (coeff) tutulur.
//
// Takım listesi, 2026-27 sezonu Trendyol Süper Lig'in gerçek 18 takımını
// yansıtacak şekilde Ağustos 2026'da web araştırmasıyla güncellendi (Antalyaspor,
// Kayserispor ve Sivasspor küme düştü; yerlerine yükselen Amed SFK, Çorum FK ve
// Erzurumspor FK eklendi). Coeff değerleri yine kurgusal/gösterim amaçlıdır.
//
// logo: projede zaten bulunan (kullanıcının sağladığı) amblem dosyalarından
// eşleşenler içe aktarılır. Eşleşme bulunamayan takımlar (ör. yeni yükselen
// kulüpler) için alan atlanır -- Crest.jsx bu durumda otomatik olarak kendi
// oluşturduğu SVG rozete geri döner.
import GalatasarayLogo from "../assets/logos/Türkiye - Süper Lig/Galatasaray.png";
import FenerbahceLogo from "../assets/logos/Türkiye - Süper Lig/Fenerbahce.png";
import BesiktasLogo from "../assets/logos/Türkiye - Süper Lig/Besiktas JK.png";
import TrabzonsporLogo from "../assets/logos/Türkiye - Süper Lig/Trabzonspor.png";
import BasaksehirLogo from "../assets/logos/Türkiye - Süper Lig/Basaksehir FK.png";
import SamsunsporLogo from "../assets/logos/Türkiye - Süper Lig/Samsunspor.png";
import GoztepeLogo from "../assets/logos/Türkiye - Süper Lig/Göztepe.png";
import KasimpasaLogo from "../assets/logos/Türkiye - Süper Lig/Kasimpasa.png";
import KonyasporLogo from "../assets/logos/Türkiye - Süper Lig/Konyaspor.png";
import AlanyasporLogo from "../assets/logos/Türkiye - Süper Lig/Alanyaspor.png";
import CaykurRizesporLogo from "../assets/logos/Türkiye - Süper Lig/Caykur Rizespor.png";
import GaziantepFKLogo from "../assets/logos/Türkiye - Süper Lig/Gaziantep FK.png";
import EyupsporLogo from "../assets/logos/Türkiye - Süper Lig/Eyüpspor.png";
import KocaelisporLogo from "../assets/logos/Türkiye - Süper Lig/Kocaelispor.png";
import GenclerbirligiLogo from "../assets/logos/Türkiye - Süper Lig/Genclerbirligi Ankara.png";

export const SUPER_LIG_COUNTRY_NAMES = {
  TUR: "Türkiye",
};

// coeff: 1-99 arası kurgusal/gösterim amaçlı görece güç puanı
// pedigree (opsiyonel, 0-20): kulübün Süper Lig/Türkiye futbolu TARİHİNDEKİ
// derinliği -- teams.js'teki UCL pedigree alanının doğrudan yerel benzeri:
// orada Avrupa Kupası/UCL kupa sayısı esas alınıyordu, burada TÜRKİYE LİGİ
// ŞAMPİYONLUK SAYISI esas alınır (+ "sürekli iddialı büyük kulüp" statüsüne
// küçük bir pay). predictionEngine.js'teki strengthShare bunu coeff'e KÜÇÜK
// bir ek olarak katar -- amaç, coeff'in (son yılların görece formu) tek
// başına yakalayamadığı "bu kulüp tarihi boyunca hiç zirvede bitirmedi"
// gerçeğini modele az da olsa yansıtmak. Değerler Ağustos 2026'da web
// araştırmasıyla TEYİT EDİLEN gerçek şampiyonluk sayılarına dayanır (bkz.
// Süper Lig şampiyonlar listesi, Vikipedi/gzt.com/beIN SPORTS kaynakları):
// Galatasaray 26 şampiyonluk (en çok, tarihin her döneminde baskın, ayrıca
// Türkiye'nin tek Avrupa kupası sahibi kulübü -- 2000 UEFA Kupası) -> 20;
// Fenerbahçe 19 şampiyonluk -> 15; Beşiktaş 16 şampiyonluk -> 12; Trabzonspor
// 7 şampiyonluk (6'sı 1976-1984 "altın çağı"nda + 2021-22) -> 8 (bu dörtlü
// dışındaki hiçbir güncel Süper Lig takımının şampiyonluğu YOKTUR). İstanbul
// Başakşehir'in TEK şampiyonluğu var (2019-20, ilk ve tek kez) -> 3. Göztepe
// (1968-69 Türkiye Kupası) ve Kocaelispor (1996-97 ve 2001-02 Türkiye Kupası)
// birer/ikişer kupa geçmişine sahip ama hiç lig şampiyonluğu yok -> 1 (kupa
// tarihi bir liglik seviye/istikrar kanıtı değildir, o yüzden sadece küçük
// bir işaret). Kalan takımların (Samsunspor, Kasımpaşa, Konyaspor, Alanyaspor,
// Amed SFK, Çaykur Rizespor, Çorum FK, Erzurumspor FK, Gaziantep FK, Eyüpspor,
// Gençlerbirliği) hiç lig şampiyonluğu ya da büyük kupa geçmişi yoktur -> 0
// (alan tanımlı ama sıfır -- coeff-only davranışla pratikte özdeş).
const RAW_SUPER_LIG_TEAMS = [
  { name: "Galatasaray", short: "GAL", country: "TUR", pot: null, coeff: 92.0, pedigree: 20, logo: GalatasarayLogo },
  { name: "Fenerbahçe", short: "FEN", country: "TUR", pot: null, coeff: 90.0, pedigree: 15, logo: FenerbahceLogo },
  { name: "Beşiktaş", short: "BJK", country: "TUR", pot: null, coeff: 82.0, pedigree: 12, logo: BesiktasLogo },
  { name: "Trabzonspor", short: "TRA", country: "TUR", pot: null, coeff: 78.0, pedigree: 8, logo: TrabzonsporLogo },
  { name: "İstanbul Başakşehir", short: "BAS", country: "TUR", pot: null, coeff: 62.0, pedigree: 3, logo: BasaksehirLogo },
  { name: "Samsunspor", short: "SAM", country: "TUR", pot: null, coeff: 60.0, pedigree: 0, logo: SamsunsporLogo },
  { name: "Göztepe", short: "GOZ", country: "TUR", pot: null, coeff: 58.0, pedigree: 1, logo: GoztepeLogo },
  { name: "Kasımpaşa", short: "KAS", country: "TUR", pot: null, coeff: 55.0, pedigree: 0, logo: KasimpasaLogo },
  { name: "Konyaspor", short: "KON", country: "TUR", pot: null, coeff: 54.0, pedigree: 0, logo: KonyasporLogo },
  { name: "Alanyaspor", short: "ALN", country: "TUR", pot: null, coeff: 53.0, pedigree: 0, logo: AlanyasporLogo },
  { name: "Amed SFK", short: "AMD", country: "TUR", pot: null, coeff: 52.0, pedigree: 0 },
  { name: "Çaykur Rizespor", short: "RIZ", country: "TUR", pot: null, coeff: 50.0, pedigree: 0, logo: CaykurRizesporLogo },
  { name: "Çorum FK", short: "COR", country: "TUR", pot: null, coeff: 44.0, pedigree: 0 },
  { name: "Erzurumspor FK", short: "ERZ", country: "TUR", pot: null, coeff: 43.0, pedigree: 0 },
  { name: "Gaziantep FK", short: "GAZ", country: "TUR", pot: null, coeff: 46.0, pedigree: 0, logo: GaziantepFKLogo },
  { name: "Eyüpspor", short: "EYU", country: "TUR", pot: null, coeff: 45.0, pedigree: 0, logo: EyupsporLogo },
  { name: "Kocaelispor", short: "KOC", country: "TUR", pot: null, coeff: 40.0, pedigree: 1, logo: KocaelisporLogo },
  { name: "Gençlerbirliği", short: "GEN", country: "TUR", pot: null, coeff: 38.0, pedigree: 0, logo: GenclerbirligiLogo },
];

export const SUPER_LIG_TEAMS = RAW_SUPER_LIG_TEAMS.map((t, i) => ({
  id: `s${i + 1}`,
  ...t,
}));
