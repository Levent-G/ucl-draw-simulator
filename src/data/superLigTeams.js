// Trendyol Süper Lig - takım verisi
//
// NOT: UEFA Şampiyonlar Ligi / Avrupa Ligi'nin aksine bu, "İsviçre modeli" bir
// kura değil, standart çift devreli lig (herkes herkesle iki kez oynar) formatlı
// bir yapıdır. Bu yüzden torba (pot) kavramı yoktur; her takım için sadece görece
// bir güç puanı (coeff) tutulur. Liste best-effort güncel kulüp/gücü tahminidir,
// gerçek sezon sıralamasıyla birebir aynı olmak zorunda değildir.
//
// logo: projede zaten bulunan (kullanıcının sağladığı) amblem dosyalarından
// eşleşenler içe aktarılır. Eşleşme bulunamayan takımlar (ör. Sivasspor) için
// alan atlanır -- Crest.jsx bu durumda otomatik olarak kendi oluşturduğu SVG
// rozete geri döner.
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
import AntalyasporLogo from "../assets/logos/Türkiye - Süper Lig/Antalyaspor.png";
import CaykurRizesporLogo from "../assets/logos/Türkiye - Süper Lig/Caykur Rizespor.png";
import KayserisporLogo from "../assets/logos/Türkiye - Süper Lig/Kayserispor.png";
import GaziantepFKLogo from "../assets/logos/Türkiye - Süper Lig/Gaziantep FK.png";
import EyupsporLogo from "../assets/logos/Türkiye - Süper Lig/Eyüpspor.png";
import KocaelisporLogo from "../assets/logos/Türkiye - Süper Lig/Kocaelispor.png";
import GenclerbirligiLogo from "../assets/logos/Türkiye - Süper Lig/Genclerbirligi Ankara.png";

export const SUPER_LIG_COUNTRY_NAMES = {
  TUR: "Türkiye",
};

// coeff: 1-99 arası kurgusal/gösterim amaçlı görece güç puanı
const RAW_SUPER_LIG_TEAMS = [
  { name: "Galatasaray", short: "GAL", country: "TUR", pot: null, coeff: 92.0, logo: GalatasarayLogo },
  { name: "Fenerbahçe", short: "FEN", country: "TUR", pot: null, coeff: 90.0, logo: FenerbahceLogo },
  { name: "Beşiktaş", short: "BJK", country: "TUR", pot: null, coeff: 82.0, logo: BesiktasLogo },
  { name: "Trabzonspor", short: "TRA", country: "TUR", pot: null, coeff: 78.0, logo: TrabzonsporLogo },
  { name: "İstanbul Başakşehir", short: "BAS", country: "TUR", pot: null, coeff: 62.0, logo: BasaksehirLogo },
  { name: "Samsunspor", short: "SAM", country: "TUR", pot: null, coeff: 60.0, logo: SamsunsporLogo },
  { name: "Göztepe", short: "GOZ", country: "TUR", pot: null, coeff: 58.0, logo: GoztepeLogo },
  { name: "Kasımpaşa", short: "KAS", country: "TUR", pot: null, coeff: 55.0, logo: KasimpasaLogo },
  { name: "Konyaspor", short: "KON", country: "TUR", pot: null, coeff: 54.0, logo: KonyasporLogo },
  { name: "Alanyaspor", short: "ALN", country: "TUR", pot: null, coeff: 53.0, logo: AlanyasporLogo },
  { name: "Antalyaspor", short: "ANT", country: "TUR", pot: null, coeff: 52.0, logo: AntalyasporLogo },
  { name: "Çaykur Rizespor", short: "RIZ", country: "TUR", pot: null, coeff: 50.0, logo: CaykurRizesporLogo },
  { name: "Kayserispor", short: "KAY", country: "TUR", pot: null, coeff: 49.0, logo: KayserisporLogo },
  { name: "Sivasspor", short: "SIV", country: "TUR", pot: null, coeff: 47.0 },
  { name: "Gaziantep FK", short: "GAZ", country: "TUR", pot: null, coeff: 46.0, logo: GaziantepFKLogo },
  { name: "Eyüpspor", short: "EYU", country: "TUR", pot: null, coeff: 45.0, logo: EyupsporLogo },
  { name: "Kocaelispor", short: "KOC", country: "TUR", pot: null, coeff: 40.0, logo: KocaelisporLogo },
  { name: "Gençlerbirliği", short: "GEN", country: "TUR", pot: null, coeff: 38.0, logo: GenclerbirligiLogo },
];

export const SUPER_LIG_TEAMS = RAW_SUPER_LIG_TEAMS.map((t, i) => ({
  id: `s${i + 1}`,
  ...t,
}));
