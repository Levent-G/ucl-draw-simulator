const fs = require("fs");
const path = require("path");
const https = require("https");

const logos = {
  ucl: "https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg",

  rma: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  mci: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  bay: "https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg",
  psg: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  liv: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  int: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  bar: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  lev: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
  ata: "https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg",

  atm: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  ars: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  bvb: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  mil: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  juv: "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg",
  ben: "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
  fey: "https://upload.wikimedia.org/wikipedia/en/f/f9/Feyenoord_logo.svg",
  clb: "https://upload.wikimedia.org/wikipedia/en/d/d0/Club_Brugge_KV_logo.svg",
  shk: "https://upload.wikimedia.org/wikipedia/en/e/ef/FC_Shakhtar_Donetsk.svg",

  gir: "https://upload.wikimedia.org/wikipedia/en/f/f7/Girona_FC_Logo.svg",
  avl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_FC_crest_%282024%29.svg",
  vfb: "https://upload.wikimedia.org/wikipedia/commons/e/e5/VfB_Stuttgart_1893_Logo.svg",
  mon: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg",
  spo: "https://upload.wikimedia.org/wikipedia/en/e/e4/Sporting_Clube_de_Portugal_%28Logo%29.svg",
  psv: "https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg",
  cel: "https://upload.wikimedia.org/wikipedia/en/3/35/Celtic_FC.svg",
  yb: "https://upload.wikimedia.org/wikipedia/en/6/65/BSC_Young_Boys_logo.svg",
  spa: "https://upload.wikimedia.org/wikipedia/en/4/4b/AC_Sparta_Prague_logo.svg",

  che: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  bre: "https://upload.wikimedia.org/wikipedia/en/8/83/Stade_Brestois_29_logo.svg",
  dzg: "https://upload.wikimedia.org/wikipedia/en/0/0f/GNK_Dinamo_Zagreb_logo.svg",
  czv: "https://upload.wikimedia.org/wikipedia/en/7/72/FK_Crvena_zvezda_logo.svg",
  slo: "https://upload.wikimedia.org/wikipedia/en/8/89/%C5%A0K_Slovan_Bratislava_logo.svg",
  stu: "https://upload.wikimedia.org/wikipedia/en/8/84/SK_Sturm_Graz_logo.svg",
  bod: "https://upload.wikimedia.org/wikipedia/en/9/98/FK_Bod%C3%B8_Glimt_logo.svg",
  gal: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Galatasaray_Sports_Club_Logo.svg",
  qar: "https://upload.wikimedia.org/wikipedia/en/3/34/Qarabag_FK_logo.svg",
};

const dir = path.join(__dirname, "src/assets/logos");

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

Object.entries(logos).forEach(([name, url]) => {
  const ext = url.endsWith(".png") ? "png" : "svg";

  https.get(url, (res) => {
    const file = fs.createWriteStream(path.join(dir, `${name}.${ext}`));
    res.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log(`${name}.${ext} indirildi`);
    });
  });
});