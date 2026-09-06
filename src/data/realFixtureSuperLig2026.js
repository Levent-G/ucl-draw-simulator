// 2026-27 Trendyol Süper Lig sezonunun GERÇEK 34 haftalık fikstürü.
//
// KAYNAKLAR / DOĞRULAMA:
// - 1-3. Haftalar: zaten OYNANMIŞ maçlar -- src/data/liveStatus.js'teki
//   SUPER_LIG_LIVE_RESULTS ile aynı tarih/eşleşmeler (Türkçe Vikipedi
//   "2026-27 Süper Lig" maddesinin ham wikitext'i + sabah.com.tr'nin
//   3. hafta program haberiyle çapraz doğrulandı; 27 maçın TAMAMINDAN
//   yeniden hesaplanan puan durumu Vikipedi'nin puan durumu şablonuyla
//   BİREBİR örtüşüyor).
// - 4. Hafta: sahadan.com'un fikstür sayfasından (4-7 Eylül 2026 tarihli,
//   henüz oynanmamış ama TV programıyla kesinleşmiş) alındı.
// - 5-6. Haftalar: TFF'nin resmi fikstür sayfasından (tff.org/Default.aspx
//   ?pageID=198&hafta=N), maç başına kesin tarih/saat ile.
// - 7-34. Haftalar: eşleşmeler (ev sahibi/deplasman) TFF'nin resmi fikstür
//   sayfasından (aynı URL deseni) alındı ve ayrıca standart çift devreli
//   lig simetrisiyle (n. hafta ile n+17. hafta aynı eşleşmenin ev sahibi/
//   deplasman YER DEĞİŞTİRİLMİŞ hali olmalı) çapraz kontrol edilip
//   doğrulandı. ANCAK bu haftalar için TFF sayfası henüz maç başına ayrı
//   gün/saat vermiyor (bkz. gerçek Süper Lig pratiği: yayıncı (beIN Sports/
//   Tabii/TRT) programı her hafta yaklaştıkça netleşir) -- bu yüzden bu
//   dosyada 7-34. haftaların HER maçına, TFF'nin o hafta için verdiği TEK
//   taslak tarih uygulanmıştır (haftanın 9 maçı da aynı "date" değerini
//   taşır). Bu tarihler ileride (TV programı netleştikçe) maç bazında
//   güncellenmelidir -- eşleşmelerin (kim kime karşı, ev/deplasman) kendisi
//   resmi kaynaktan geldiği için GÜVENİLİRDİR, sadece gün/saat kesinliği
//   haftaya göre değişir.
//
// Format: fixtureEngine.js'in serializeFixture() çıktısıyla aynı şekilde --
// deserializeFixture(REAL_FIXTURE_SUPERLIG_2026, SUPER_LIG_TEAMS) ile
// doğrudan kullanılabilir. id alanları "sr" öneki taşır (UCL'nin "r1m0" gibi
// id'leriyle -- bunlar route/React key olarak kullanıldığından -- ÇAKIŞMASIN
// diye).
export const REAL_FIXTURE_SUPERLIG_2026 = [
  {
    "number": 1,
    "label": "1. Hafta — 14-17 Ağustos 2026",
    "matches": [
      {
        "id": "sr1m0",
        "homeId": "s1",
        "awayId": "s13",
        "date": "2026-08-14"
      },
      {
        "id": "sr1m1",
        "homeId": "s18",
        "awayId": "s2",
        "date": "2026-08-15"
      },
      {
        "id": "sr1m2",
        "homeId": "s8",
        "awayId": "s4",
        "date": "2026-08-15"
      },
      {
        "id": "sr1m3",
        "homeId": "s9",
        "awayId": "s12",
        "date": "2026-08-15"
      },
      {
        "id": "sr1m4",
        "homeId": "s15",
        "awayId": "s10",
        "date": "2026-08-15"
      },
      {
        "id": "sr1m5",
        "homeId": "s3",
        "awayId": "s16",
        "date": "2026-08-16"
      },
      {
        "id": "sr1m6",
        "homeId": "s11",
        "awayId": "s14",
        "date": "2026-08-16"
      },
      {
        "id": "sr1m7",
        "homeId": "s5",
        "awayId": "s17",
        "date": "2026-08-16"
      },
      {
        "id": "sr1m8",
        "homeId": "s6",
        "awayId": "s7",
        "date": "2026-08-17"
      }
    ]
  },
  {
    "number": 2,
    "label": "2. Hafta — 21-24 Ağustos 2026",
    "matches": [
      {
        "id": "sr2m0",
        "homeId": "s14",
        "awayId": "s1",
        "date": "2026-08-21"
      },
      {
        "id": "sr2m1",
        "homeId": "s2",
        "awayId": "s9",
        "date": "2026-08-22"
      },
      {
        "id": "sr2m2",
        "homeId": "s12",
        "awayId": "s6",
        "date": "2026-08-22"
      },
      {
        "id": "sr2m3",
        "homeId": "s13",
        "awayId": "s8",
        "date": "2026-08-22"
      },
      {
        "id": "sr2m4",
        "homeId": "s16",
        "awayId": "s15",
        "date": "2026-08-23"
      },
      {
        "id": "sr2m5",
        "homeId": "s4",
        "awayId": "s5",
        "date": "2026-08-23"
      },
      {
        "id": "sr2m6",
        "homeId": "s7",
        "awayId": "s18",
        "date": "2026-08-23"
      },
      {
        "id": "sr2m7",
        "homeId": "s10",
        "awayId": "s3",
        "date": "2026-08-23"
      },
      {
        "id": "sr2m8",
        "homeId": "s17",
        "awayId": "s11",
        "date": "2026-08-24"
      }
    ]
  },
  {
    "number": 3,
    "label": "3. Hafta — 28-31 Ağustos 2026",
    "matches": [
      {
        "id": "sr3m0",
        "homeId": "s18",
        "awayId": "s14",
        "date": "2026-08-28"
      },
      {
        "id": "sr3m1",
        "homeId": "s9",
        "awayId": "s17",
        "date": "2026-08-29"
      },
      {
        "id": "sr3m2",
        "homeId": "s15",
        "awayId": "s12",
        "date": "2026-08-29"
      },
      {
        "id": "sr3m3",
        "homeId": "s1",
        "awayId": "s7",
        "date": "2026-08-29"
      },
      {
        "id": "sr3m4",
        "homeId": "s16",
        "awayId": "s10",
        "date": "2026-08-30"
      },
      {
        "id": "sr3m5",
        "homeId": "s5",
        "awayId": "s8",
        "date": "2026-08-30"
      },
      {
        "id": "sr3m6",
        "homeId": "s6",
        "awayId": "s2",
        "date": "2026-08-30"
      },
      {
        "id": "sr3m7",
        "homeId": "s11",
        "awayId": "s4",
        "date": "2026-08-31"
      },
      {
        "id": "sr3m8",
        "homeId": "s3",
        "awayId": "s13",
        "date": "2026-08-31"
      }
    ]
  },
  {
    "number": 4,
    "label": "4. Hafta — 4-7 Eylül 2026",
    "matches": [
      {
        "id": "sr4m0",
        "homeId": "s5",
        "awayId": "s1",
        "date": "2026-09-04"
      },
      {
        "id": "sr4m1",
        "homeId": "s14",
        "awayId": "s9",
        "date": "2026-09-05"
      },
      {
        "id": "sr4m2",
        "homeId": "s2",
        "awayId": "s3",
        "date": "2026-09-05"
      },
      {
        "id": "sr4m3",
        "homeId": "s8",
        "awayId": "s11",
        "date": "2026-09-06"
      },
      {
        "id": "sr4m4",
        "homeId": "s13",
        "awayId": "s16",
        "date": "2026-09-06"
      },
      {
        "id": "sr4m5",
        "homeId": "s4",
        "awayId": "s18",
        "date": "2026-09-06"
      },
      {
        "id": "sr4m6",
        "homeId": "s17",
        "awayId": "s6",
        "date": "2026-09-06"
      },
      {
        "id": "sr4m7",
        "homeId": "s12",
        "awayId": "s10",
        "date": "2026-09-07"
      },
      {
        "id": "sr4m8",
        "homeId": "s7",
        "awayId": "s15",
        "date": "2026-09-07"
      }
    ]
  },
  {
    "number": 5,
    "label": "5. Hafta — 11-14 Eylül 2026",
    "matches": [
      {
        "id": "sr5m0",
        "homeId": "s3",
        "awayId": "s14",
        "date": "2026-09-11"
      },
      {
        "id": "sr5m1",
        "homeId": "s16",
        "awayId": "s12",
        "date": "2026-09-12"
      },
      {
        "id": "sr5m2",
        "homeId": "s6",
        "awayId": "s13",
        "date": "2026-09-12"
      },
      {
        "id": "sr5m3",
        "homeId": "s10",
        "awayId": "s7",
        "date": "2026-09-12"
      },
      {
        "id": "sr5m4",
        "homeId": "s9",
        "awayId": "s4",
        "date": "2026-09-12"
      },
      {
        "id": "sr5m5",
        "homeId": "s18",
        "awayId": "s8",
        "date": "2026-09-13"
      },
      {
        "id": "sr5m6",
        "homeId": "s11",
        "awayId": "s5",
        "date": "2026-09-13"
      },
      {
        "id": "sr5m7",
        "homeId": "s1",
        "awayId": "s17",
        "date": "2026-09-13"
      },
      {
        "id": "sr5m8",
        "homeId": "s15",
        "awayId": "s2",
        "date": "2026-09-14"
      }
    ]
  },
  {
    "number": 6,
    "label": "6. Hafta — 18-20 Eylül 2026",
    "matches": [
      {
        "id": "sr6m0",
        "homeId": "s8",
        "awayId": "s9",
        "date": "2026-09-18"
      },
      {
        "id": "sr6m1",
        "homeId": "s13",
        "awayId": "s10",
        "date": "2026-09-19"
      },
      {
        "id": "sr6m2",
        "homeId": "s17",
        "awayId": "s15",
        "date": "2026-09-19"
      },
      {
        "id": "sr6m3",
        "homeId": "s4",
        "awayId": "s1",
        "date": "2026-09-19"
      },
      {
        "id": "sr6m4",
        "homeId": "s5",
        "awayId": "s18",
        "date": "2026-09-19"
      },
      {
        "id": "sr6m5",
        "homeId": "s2",
        "awayId": "s16",
        "date": "2026-09-20"
      },
      {
        "id": "sr6m6",
        "homeId": "s14",
        "awayId": "s6",
        "date": "2026-09-20"
      },
      {
        "id": "sr6m7",
        "homeId": "s11",
        "awayId": "s3",
        "date": "2026-09-20"
      },
      {
        "id": "sr6m8",
        "homeId": "s7",
        "awayId": "s12",
        "date": "2026-09-20"
      }
    ]
  },
  {
    "number": 7,
    "label": "7. Hafta — 11 Ekim 2026 (taslak)",
    "matches": [
      {
        "id": "sr7m0",
        "homeId": "s15",
        "awayId": "s13",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m1",
        "homeId": "s16",
        "awayId": "s7",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m2",
        "homeId": "s10",
        "awayId": "s14",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m3",
        "homeId": "s9",
        "awayId": "s5",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m4",
        "homeId": "s1",
        "awayId": "s8",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m5",
        "homeId": "s3",
        "awayId": "s17",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m6",
        "homeId": "s6",
        "awayId": "s4",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m7",
        "homeId": "s12",
        "awayId": "s2",
        "date": "2026-10-11"
      },
      {
        "id": "sr7m8",
        "homeId": "s18",
        "awayId": "s11",
        "date": "2026-10-11"
      }
    ]
  },
  {
    "number": 8,
    "label": "8. Hafta — 18 Ekim 2026 (taslak)",
    "matches": [
      {
        "id": "sr8m0",
        "homeId": "s4",
        "awayId": "s3",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m1",
        "homeId": "s8",
        "awayId": "s6",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m2",
        "homeId": "s5",
        "awayId": "s15",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m3",
        "homeId": "s11",
        "awayId": "s9",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m4",
        "homeId": "s18",
        "awayId": "s1",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m5",
        "homeId": "s13",
        "awayId": "s12",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m6",
        "homeId": "s2",
        "awayId": "s10",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m7",
        "homeId": "s17",
        "awayId": "s7",
        "date": "2026-10-18"
      },
      {
        "id": "sr8m8",
        "homeId": "s14",
        "awayId": "s16",
        "date": "2026-10-18"
      }
    ]
  },
  {
    "number": 9,
    "label": "9. Hafta — 25 Ekim 2026 (taslak)",
    "matches": [
      {
        "id": "sr9m0",
        "homeId": "s15",
        "awayId": "s14",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m1",
        "homeId": "s16",
        "awayId": "s8",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m2",
        "homeId": "s10",
        "awayId": "s17",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m3",
        "homeId": "s9",
        "awayId": "s18",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m4",
        "homeId": "s1",
        "awayId": "s2",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m5",
        "homeId": "s3",
        "awayId": "s5",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m6",
        "homeId": "s6",
        "awayId": "s11",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m7",
        "homeId": "s12",
        "awayId": "s4",
        "date": "2026-10-25"
      },
      {
        "id": "sr9m8",
        "homeId": "s7",
        "awayId": "s13",
        "date": "2026-10-25"
      }
    ]
  },
  {
    "number": 10,
    "label": "10. Hafta — 1 Kasım 2026 (taslak)",
    "matches": [
      {
        "id": "sr10m0",
        "homeId": "s4",
        "awayId": "s15",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m1",
        "homeId": "s9",
        "awayId": "s1",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m2",
        "homeId": "s2",
        "awayId": "s7",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m3",
        "homeId": "s17",
        "awayId": "s12",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m4",
        "homeId": "s8",
        "awayId": "s3",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m5",
        "homeId": "s5",
        "awayId": "s6",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m6",
        "homeId": "s11",
        "awayId": "s16",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m7",
        "homeId": "s18",
        "awayId": "s10",
        "date": "2026-11-01"
      },
      {
        "id": "sr10m8",
        "homeId": "s14",
        "awayId": "s13",
        "date": "2026-11-01"
      }
    ]
  },
  {
    "number": 11,
    "label": "11. Hafta — 8 Kasım 2026 (taslak)",
    "matches": [
      {
        "id": "sr11m0",
        "homeId": "s15",
        "awayId": "s8",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m1",
        "homeId": "s16",
        "awayId": "s17",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m2",
        "homeId": "s10",
        "awayId": "s4",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m3",
        "homeId": "s12",
        "awayId": "s14",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m4",
        "homeId": "s7",
        "awayId": "s5",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m5",
        "homeId": "s13",
        "awayId": "s2",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m6",
        "homeId": "s1",
        "awayId": "s11",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m7",
        "homeId": "s3",
        "awayId": "s18",
        "date": "2026-11-08"
      },
      {
        "id": "sr11m8",
        "homeId": "s6",
        "awayId": "s9",
        "date": "2026-11-08"
      }
    ]
  },
  {
    "number": 12,
    "label": "12. Hafta — 22 Kasım 2026 (taslak)",
    "matches": [
      {
        "id": "sr12m0",
        "homeId": "s4",
        "awayId": "s16",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m1",
        "homeId": "s8",
        "awayId": "s10",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m2",
        "homeId": "s5",
        "awayId": "s13",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m3",
        "homeId": "s11",
        "awayId": "s12",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m4",
        "homeId": "s18",
        "awayId": "s15",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m5",
        "homeId": "s9",
        "awayId": "s3",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m6",
        "homeId": "s1",
        "awayId": "s6",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m7",
        "homeId": "s17",
        "awayId": "s2",
        "date": "2026-11-22"
      },
      {
        "id": "sr12m8",
        "homeId": "s14",
        "awayId": "s7",
        "date": "2026-11-22"
      }
    ]
  },
  {
    "number": 13,
    "label": "13. Hafta — 29 Kasım 2026 (taslak)",
    "matches": [
      {
        "id": "sr13m0",
        "homeId": "s15",
        "awayId": "s11",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m1",
        "homeId": "s16",
        "awayId": "s5",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m2",
        "homeId": "s10",
        "awayId": "s9",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m3",
        "homeId": "s2",
        "awayId": "s14",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m4",
        "homeId": "s3",
        "awayId": "s1",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m5",
        "homeId": "s6",
        "awayId": "s18",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m6",
        "homeId": "s12",
        "awayId": "s8",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m7",
        "homeId": "s7",
        "awayId": "s4",
        "date": "2026-11-29"
      },
      {
        "id": "sr13m8",
        "homeId": "s13",
        "awayId": "s17",
        "date": "2026-11-29"
      }
    ]
  },
  {
    "number": 14,
    "label": "14. Hafta — 6 Aralık 2026 (taslak)",
    "matches": [
      {
        "id": "sr14m0",
        "homeId": "s4",
        "awayId": "s13",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m1",
        "homeId": "s9",
        "awayId": "s15",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m2",
        "homeId": "s1",
        "awayId": "s12",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m3",
        "homeId": "s3",
        "awayId": "s6",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m4",
        "homeId": "s8",
        "awayId": "s7",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m5",
        "homeId": "s5",
        "awayId": "s2",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m6",
        "homeId": "s11",
        "awayId": "s10",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m7",
        "homeId": "s18",
        "awayId": "s16",
        "date": "2026-12-06"
      },
      {
        "id": "sr14m8",
        "homeId": "s14",
        "awayId": "s17",
        "date": "2026-12-06"
      }
    ]
  },
  {
    "number": 15,
    "label": "15. Hafta — 13 Aralık 2026 (taslak)",
    "matches": [
      {
        "id": "sr15m0",
        "homeId": "s15",
        "awayId": "s3",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m1",
        "homeId": "s16",
        "awayId": "s1",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m2",
        "homeId": "s10",
        "awayId": "s6",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m3",
        "homeId": "s2",
        "awayId": "s4",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m4",
        "homeId": "s17",
        "awayId": "s18",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m5",
        "homeId": "s12",
        "awayId": "s5",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m6",
        "homeId": "s7",
        "awayId": "s9",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m7",
        "homeId": "s13",
        "awayId": "s11",
        "date": "2026-12-13"
      },
      {
        "id": "sr15m8",
        "homeId": "s14",
        "awayId": "s8",
        "date": "2026-12-13"
      }
    ]
  },
  {
    "number": 16,
    "label": "16. Hafta — 20 Aralık 2026 (taslak)",
    "matches": [
      {
        "id": "sr16m0",
        "homeId": "s4",
        "awayId": "s17",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m1",
        "homeId": "s8",
        "awayId": "s2",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m2",
        "homeId": "s5",
        "awayId": "s14",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m3",
        "homeId": "s11",
        "awayId": "s7",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m4",
        "homeId": "s18",
        "awayId": "s13",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m5",
        "homeId": "s9",
        "awayId": "s16",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m6",
        "homeId": "s1",
        "awayId": "s10",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m7",
        "homeId": "s3",
        "awayId": "s12",
        "date": "2026-12-20"
      },
      {
        "id": "sr16m8",
        "homeId": "s6",
        "awayId": "s15",
        "date": "2026-12-20"
      }
    ]
  },
  {
    "number": 17,
    "label": "17. Hafta — 17 Ocak 2027 (taslak)",
    "matches": [
      {
        "id": "sr17m0",
        "homeId": "s15",
        "awayId": "s1",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m1",
        "homeId": "s16",
        "awayId": "s6",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m2",
        "homeId": "s10",
        "awayId": "s5",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m3",
        "homeId": "s2",
        "awayId": "s11",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m4",
        "homeId": "s17",
        "awayId": "s8",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m5",
        "homeId": "s12",
        "awayId": "s18",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m6",
        "homeId": "s7",
        "awayId": "s3",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m7",
        "homeId": "s13",
        "awayId": "s9",
        "date": "2027-01-17"
      },
      {
        "id": "sr17m8",
        "homeId": "s14",
        "awayId": "s4",
        "date": "2027-01-17"
      }
    ]
  },
  {
    "number": 18,
    "label": "18. Hafta — 24 Ocak 2027 (taslak)",
    "matches": [
      {
        "id": "sr18m0",
        "homeId": "s10",
        "awayId": "s15",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m1",
        "homeId": "s4",
        "awayId": "s8",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m2",
        "homeId": "s17",
        "awayId": "s5",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m3",
        "homeId": "s14",
        "awayId": "s11",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m4",
        "homeId": "s2",
        "awayId": "s18",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m5",
        "homeId": "s12",
        "awayId": "s9",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m6",
        "homeId": "s13",
        "awayId": "s1",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m7",
        "homeId": "s16",
        "awayId": "s3",
        "date": "2027-01-24"
      },
      {
        "id": "sr18m8",
        "homeId": "s7",
        "awayId": "s6",
        "date": "2027-01-24"
      }
    ]
  },
  {
    "number": 19,
    "label": "19. Hafta — 31 Ocak 2027 (taslak)",
    "matches": [
      {
        "id": "sr19m0",
        "homeId": "s15",
        "awayId": "s16",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m1",
        "homeId": "s3",
        "awayId": "s10",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m2",
        "homeId": "s6",
        "awayId": "s12",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m3",
        "homeId": "s9",
        "awayId": "s2",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m4",
        "homeId": "s1",
        "awayId": "s14",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m5",
        "homeId": "s5",
        "awayId": "s4",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m6",
        "homeId": "s18",
        "awayId": "s7",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m7",
        "homeId": "s8",
        "awayId": "s13",
        "date": "2027-01-31"
      },
      {
        "id": "sr19m8",
        "homeId": "s11",
        "awayId": "s17",
        "date": "2027-01-31"
      }
    ]
  },
  {
    "number": 20,
    "label": "20. Hafta — 7 Şubat 2027 (taslak)",
    "matches": [
      {
        "id": "sr20m0",
        "homeId": "s10",
        "awayId": "s16",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m1",
        "homeId": "s4",
        "awayId": "s11",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m2",
        "homeId": "s17",
        "awayId": "s9",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m3",
        "homeId": "s2",
        "awayId": "s6",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m4",
        "homeId": "s12",
        "awayId": "s15",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m5",
        "homeId": "s8",
        "awayId": "s5",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m6",
        "homeId": "s14",
        "awayId": "s18",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m7",
        "homeId": "s7",
        "awayId": "s1",
        "date": "2027-02-07"
      },
      {
        "id": "sr20m8",
        "homeId": "s13",
        "awayId": "s3",
        "date": "2027-02-07"
      }
    ]
  },
  {
    "number": 21,
    "label": "21. Hafta — 14 Şubat 2027 (taslak)",
    "matches": [
      {
        "id": "sr21m0",
        "homeId": "s1",
        "awayId": "s5",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m1",
        "homeId": "s10",
        "awayId": "s12",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m2",
        "homeId": "s15",
        "awayId": "s7",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m3",
        "homeId": "s3",
        "awayId": "s2",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m4",
        "homeId": "s6",
        "awayId": "s17",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m5",
        "homeId": "s9",
        "awayId": "s14",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m6",
        "homeId": "s18",
        "awayId": "s4",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m7",
        "homeId": "s11",
        "awayId": "s8",
        "date": "2027-02-14"
      },
      {
        "id": "sr21m8",
        "homeId": "s16",
        "awayId": "s13",
        "date": "2027-02-14"
      }
    ]
  },
  {
    "number": 22,
    "label": "22. Hafta — 21 Şubat 2027 (taslak)",
    "matches": [
      {
        "id": "sr22m0",
        "homeId": "s2",
        "awayId": "s15",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m1",
        "homeId": "s4",
        "awayId": "s9",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m2",
        "homeId": "s17",
        "awayId": "s1",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m3",
        "homeId": "s12",
        "awayId": "s16",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m4",
        "homeId": "s7",
        "awayId": "s10",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m5",
        "homeId": "s5",
        "awayId": "s11",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m6",
        "homeId": "s8",
        "awayId": "s18",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m7",
        "homeId": "s14",
        "awayId": "s3",
        "date": "2027-02-21"
      },
      {
        "id": "sr22m8",
        "homeId": "s13",
        "awayId": "s6",
        "date": "2027-02-21"
      }
    ]
  },
  {
    "number": 23,
    "label": "23. Hafta — 28 Şubat 2027 (taslak)",
    "matches": [
      {
        "id": "sr23m0",
        "homeId": "s1",
        "awayId": "s4",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m1",
        "homeId": "s9",
        "awayId": "s8",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m2",
        "homeId": "s3",
        "awayId": "s11",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m3",
        "homeId": "s10",
        "awayId": "s13",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m4",
        "homeId": "s15",
        "awayId": "s17",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m5",
        "homeId": "s6",
        "awayId": "s14",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m6",
        "homeId": "s18",
        "awayId": "s5",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m7",
        "homeId": "s12",
        "awayId": "s7",
        "date": "2027-02-28"
      },
      {
        "id": "sr23m8",
        "homeId": "s16",
        "awayId": "s2",
        "date": "2027-02-28"
      }
    ]
  },
  {
    "number": 24,
    "label": "24. Hafta — 7 Mart 2027 (taslak)",
    "matches": [
      {
        "id": "sr24m0",
        "homeId": "s2",
        "awayId": "s12",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m1",
        "homeId": "s17",
        "awayId": "s3",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m2",
        "homeId": "s4",
        "awayId": "s6",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m3",
        "homeId": "s13",
        "awayId": "s15",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m4",
        "homeId": "s7",
        "awayId": "s16",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m5",
        "homeId": "s14",
        "awayId": "s10",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m6",
        "homeId": "s11",
        "awayId": "s18",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m7",
        "homeId": "s5",
        "awayId": "s9",
        "date": "2027-03-07"
      },
      {
        "id": "sr24m8",
        "homeId": "s8",
        "awayId": "s1",
        "date": "2027-03-07"
      }
    ]
  },
  {
    "number": 25,
    "label": "25. Hafta — 14 Mart 2027 (taslak)",
    "matches": [
      {
        "id": "sr25m0",
        "homeId": "s3",
        "awayId": "s4",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m1",
        "homeId": "s6",
        "awayId": "s8",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m2",
        "homeId": "s15",
        "awayId": "s5",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m3",
        "homeId": "s9",
        "awayId": "s11",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m4",
        "homeId": "s1",
        "awayId": "s18",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m5",
        "homeId": "s12",
        "awayId": "s13",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m6",
        "homeId": "s10",
        "awayId": "s2",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m7",
        "homeId": "s7",
        "awayId": "s17",
        "date": "2027-03-14"
      },
      {
        "id": "sr25m8",
        "homeId": "s16",
        "awayId": "s14",
        "date": "2027-03-14"
      }
    ]
  },
  {
    "number": 26,
    "label": "26. Hafta — 21 Mart 2027 (taslak)",
    "matches": [
      {
        "id": "sr26m0",
        "homeId": "s17",
        "awayId": "s10",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m1",
        "homeId": "s4",
        "awayId": "s12",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m2",
        "homeId": "s2",
        "awayId": "s1",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m3",
        "homeId": "s14",
        "awayId": "s15",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m4",
        "homeId": "s8",
        "awayId": "s16",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m5",
        "homeId": "s13",
        "awayId": "s7",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m6",
        "homeId": "s18",
        "awayId": "s9",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m7",
        "homeId": "s5",
        "awayId": "s3",
        "date": "2027-03-21"
      },
      {
        "id": "sr26m8",
        "homeId": "s11",
        "awayId": "s6",
        "date": "2027-03-21"
      }
    ]
  },
  {
    "number": 27,
    "label": "27. Hafta — 4 Nisan 2027 (taslak)",
    "matches": [
      {
        "id": "sr27m0",
        "homeId": "s15",
        "awayId": "s4",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m1",
        "homeId": "s3",
        "awayId": "s8",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m2",
        "homeId": "s6",
        "awayId": "s5",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m3",
        "homeId": "s10",
        "awayId": "s18",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m4",
        "homeId": "s1",
        "awayId": "s9",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m5",
        "homeId": "s16",
        "awayId": "s11",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m6",
        "homeId": "s7",
        "awayId": "s2",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m7",
        "homeId": "s12",
        "awayId": "s17",
        "date": "2027-04-04"
      },
      {
        "id": "sr27m8",
        "homeId": "s13",
        "awayId": "s14",
        "date": "2027-04-04"
      }
    ]
  },
  {
    "number": 28,
    "label": "28. Hafta — 11 Nisan 2027 (taslak)",
    "matches": [
      {
        "id": "sr28m0",
        "homeId": "s17",
        "awayId": "s16",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m1",
        "homeId": "s4",
        "awayId": "s10",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m2",
        "homeId": "s14",
        "awayId": "s12",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m3",
        "homeId": "s5",
        "awayId": "s7",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m4",
        "homeId": "s2",
        "awayId": "s13",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m5",
        "homeId": "s11",
        "awayId": "s1",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m6",
        "homeId": "s18",
        "awayId": "s3",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m7",
        "homeId": "s8",
        "awayId": "s15",
        "date": "2027-04-11"
      },
      {
        "id": "sr28m8",
        "homeId": "s9",
        "awayId": "s6",
        "date": "2027-04-11"
      }
    ]
  },
  {
    "number": 29,
    "label": "29. Hafta — 18 Nisan 2027 (taslak)",
    "matches": [
      {
        "id": "sr29m0",
        "homeId": "s10",
        "awayId": "s8",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m1",
        "homeId": "s15",
        "awayId": "s18",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m2",
        "homeId": "s3",
        "awayId": "s9",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m3",
        "homeId": "s6",
        "awayId": "s1",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m4",
        "homeId": "s2",
        "awayId": "s17",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m5",
        "homeId": "s16",
        "awayId": "s4",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m6",
        "homeId": "s13",
        "awayId": "s5",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m7",
        "homeId": "s12",
        "awayId": "s11",
        "date": "2027-04-18"
      },
      {
        "id": "sr29m8",
        "homeId": "s7",
        "awayId": "s14",
        "date": "2027-04-18"
      }
    ]
  },
  {
    "number": 30,
    "label": "30. Hafta — 25 Nisan 2027 (taslak)",
    "matches": [
      {
        "id": "sr30m0",
        "homeId": "s9",
        "awayId": "s10",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m1",
        "homeId": "s4",
        "awayId": "s7",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m2",
        "homeId": "s17",
        "awayId": "s13",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m3",
        "homeId": "s1",
        "awayId": "s3",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m4",
        "homeId": "s11",
        "awayId": "s15",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m5",
        "homeId": "s5",
        "awayId": "s16",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m6",
        "homeId": "s8",
        "awayId": "s12",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m7",
        "homeId": "s14",
        "awayId": "s2",
        "date": "2027-04-25"
      },
      {
        "id": "sr30m8",
        "homeId": "s18",
        "awayId": "s6",
        "date": "2027-04-25"
      }
    ]
  },
  {
    "number": 31,
    "label": "31. Hafta — 2 Mayıs 2027 (taslak)",
    "matches": [
      {
        "id": "sr31m0",
        "homeId": "s2",
        "awayId": "s5",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m1",
        "homeId": "s10",
        "awayId": "s11",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m2",
        "homeId": "s15",
        "awayId": "s9",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m3",
        "homeId": "s6",
        "awayId": "s3",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m4",
        "homeId": "s17",
        "awayId": "s14",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m5",
        "homeId": "s13",
        "awayId": "s4",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m6",
        "homeId": "s7",
        "awayId": "s8",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m7",
        "homeId": "s16",
        "awayId": "s18",
        "date": "2027-05-02"
      },
      {
        "id": "sr31m8",
        "homeId": "s12",
        "awayId": "s1",
        "date": "2027-05-02"
      }
    ]
  },
  {
    "number": 32,
    "label": "32. Hafta — 9 Mayıs 2027 (taslak)",
    "matches": [
      {
        "id": "sr32m0",
        "homeId": "s3",
        "awayId": "s15",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m1",
        "homeId": "s1",
        "awayId": "s16",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m2",
        "homeId": "s6",
        "awayId": "s10",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m3",
        "homeId": "s9",
        "awayId": "s7",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m4",
        "homeId": "s4",
        "awayId": "s2",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m5",
        "homeId": "s5",
        "awayId": "s12",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m6",
        "homeId": "s11",
        "awayId": "s13",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m7",
        "homeId": "s18",
        "awayId": "s17",
        "date": "2027-05-09"
      },
      {
        "id": "sr32m8",
        "homeId": "s8",
        "awayId": "s14",
        "date": "2027-05-09"
      }
    ]
  },
  {
    "number": 33,
    "label": "33. Hafta — 16 Mayıs 2027 (taslak)",
    "matches": [
      {
        "id": "sr33m0",
        "homeId": "s17",
        "awayId": "s4",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m1",
        "homeId": "s2",
        "awayId": "s8",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m2",
        "homeId": "s14",
        "awayId": "s5",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m3",
        "homeId": "s7",
        "awayId": "s11",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m4",
        "homeId": "s13",
        "awayId": "s18",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m5",
        "homeId": "s16",
        "awayId": "s9",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m6",
        "homeId": "s10",
        "awayId": "s1",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m7",
        "homeId": "s12",
        "awayId": "s3",
        "date": "2027-05-16"
      },
      {
        "id": "sr33m8",
        "homeId": "s15",
        "awayId": "s6",
        "date": "2027-05-16"
      }
    ]
  },
  {
    "number": 34,
    "label": "34. Hafta — 23 Mayıs 2027 (taslak)",
    "matches": [
      {
        "id": "sr34m0",
        "homeId": "s1",
        "awayId": "s15",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m1",
        "homeId": "s6",
        "awayId": "s16",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m2",
        "homeId": "s5",
        "awayId": "s10",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m3",
        "homeId": "s18",
        "awayId": "s12",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m4",
        "homeId": "s3",
        "awayId": "s7",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m5",
        "homeId": "s9",
        "awayId": "s13",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m6",
        "homeId": "s11",
        "awayId": "s2",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m7",
        "homeId": "s8",
        "awayId": "s17",
        "date": "2027-05-23"
      },
      {
        "id": "sr34m8",
        "homeId": "s4",
        "awayId": "s14",
        "date": "2027-05-23"
      }
    ]
  }
];
