// Gerçek 2026-27 UEFA Şampiyonlar Ligi lig fazı çekilişi (27 Ağustos 2026,
// Grimaldi Forum, Monako) sonucu -- kurgusal/rastgele DEĞİL.
//
// Kaynak: UEFA'nın resmi duyurusunu özetleyen haber kaynakları +
// Wikipedia'nın "2026-27 UEFA Champions League league phase" madde tablosu.
// Doğrulama: (1) Real Madrid ve PSV Eindhoven satırları RealMadrid.com/
// Goal.com gibi bağımsız kaynaklarla birebir karşılaştırıldı; (2) TÜM
// tablonun kendi içi tutarlılığı programatik olarak doğrulandı -- her
// maç iki takımın da satırında simetrik (biri ev sahibiyse diğeri
// deplasmanlı, doğru torbayla) görünüyor, hiçbir takım kendi federasyonundan
// bir rakiple eşleşmiyor, ve tam 144 benzersiz maç var (36 takım x 8 / 2).
//
// Format: drawEngine.generateFullDraw()'ın ürettiğiyle AYNI şekil
// (teamId -> [{opponentId, home, viaPot}]) -- bu yüzden doğrudan
// resultsHelpers.buildResultsFromMatches(TEAMS, REAL_DRAW_2026_MATCHES) ile
// CompetitionContext'in beklediği `results` şekline çevrilebilir.
export const REAL_DRAW_2026_MATCHES = {
  "t4": [
    {
      "opponentId": "t7",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t2",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t13",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t20",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t35",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t14",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t32",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t34",
      "home": false,
      "viaPot": 4
    }
  ],
  "t3": [
    {
      "opponentId": "t11",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t10",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t19",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t8",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t36",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t26",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t29",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t30",
      "home": false,
      "viaPot": 4
    }
  ],
  "t1": [
    {
      "opponentId": "t6",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t11",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t24",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t13",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t15",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t18",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t33",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t27",
      "home": false,
      "viaPot": 4
    }
  ],
  "t5": [
    {
      "opponentId": "t10",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t6",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t28",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t17",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t14",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t25",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t22",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t33",
      "home": false,
      "viaPot": 4
    }
  ],
  "t6": [
    {
      "opponentId": "t5",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t1",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t17",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t12",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t18",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t16",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t21",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t32",
      "home": false,
      "viaPot": 4
    }
  ],
  "t2": [
    {
      "opponentId": "t4",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t7",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t23",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t28",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t9",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t15",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t27",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t22",
      "home": false,
      "viaPot": 4
    }
  ],
  "t11": [
    {
      "opponentId": "t1",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t3",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t12",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t19",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t26",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t9",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t31",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t29",
      "home": false,
      "viaPot": 4
    }
  ],
  "t7": [
    {
      "opponentId": "t2",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t4",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t20",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t23",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t16",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t35",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t34",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t31",
      "home": false,
      "viaPot": 4
    }
  ],
  "t10": [
    {
      "opponentId": "t3",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t5",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t8",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t24",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t25",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t36",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t30",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t21",
      "home": false,
      "viaPot": 4
    }
  ],
  "t12": [
    {
      "opponentId": "t6",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t11",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t19",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t20",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t14",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t36",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t27",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t31",
      "home": false,
      "viaPot": 4
    }
  ],
  "t13": [
    {
      "opponentId": "t1",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t4",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t23",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t8",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t26",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t25",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t32",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t27",
      "home": false,
      "viaPot": 4
    }
  ],
  "t23": [
    {
      "opponentId": "t7",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t2",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t8",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t13",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t35",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t18",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t33",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t22",
      "home": false,
      "viaPot": 4
    }
  ],
  "t20": [
    {
      "opponentId": "t4",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t7",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t12",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t17",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t25",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t35",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t30",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t29",
      "home": false,
      "viaPot": 4
    }
  ],
  "t28": [
    {
      "opponentId": "t2",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t5",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t24",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t19",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t9",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t16",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t29",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t33",
      "home": false,
      "viaPot": 4
    }
  ],
  "t8": [
    {
      "opponentId": "t3",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t10",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t13",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t23",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t15",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t14",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t31",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t34",
      "home": false,
      "viaPot": 4
    }
  ],
  "t17": [
    {
      "opponentId": "t5",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t6",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t20",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t24",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t36",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t9",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t22",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t21",
      "home": false,
      "viaPot": 4
    }
  ],
  "t19": [
    {
      "opponentId": "t11",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t3",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t28",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t12",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t16",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t26",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t34",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t32",
      "home": false,
      "viaPot": 4
    }
  ],
  "t24": [
    {
      "opponentId": "t10",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t1",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t17",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t28",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t18",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t15",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t21",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t30",
      "home": false,
      "viaPot": 4
    }
  ],
  "t16": [
    {
      "opponentId": "t6",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t7",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t28",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t19",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t15",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t35",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t34",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t30",
      "home": false,
      "viaPot": 4
    }
  ],
  "t26": [
    {
      "opponentId": "t3",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t11",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t19",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t13",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t35",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t36",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t32",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t21",
      "home": false,
      "viaPot": 4
    }
  ],
  "t36": [
    {
      "opponentId": "t10",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t3",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t12",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t17",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t26",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t9",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t33",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t22",
      "home": false,
      "viaPot": 4
    }
  ],
  "t9": [
    {
      "opponentId": "t11",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t2",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t17",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t28",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t36",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t14",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t30",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t31",
      "home": false,
      "viaPot": 4
    }
  ],
  "t15": [
    {
      "opponentId": "t2",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t1",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t24",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t8",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t18",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t16",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t22",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t34",
      "home": false,
      "viaPot": 4
    }
  ],
  "t14": [
    {
      "opponentId": "t4",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t5",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t8",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t12",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t9",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t25",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t31",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t29",
      "home": false,
      "viaPot": 4
    }
  ],
  "t25": [
    {
      "opponentId": "t5",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t10",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t13",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t20",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t14",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t18",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t29",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t33",
      "home": false,
      "viaPot": 4
    }
  ],
  "t18": [
    {
      "opponentId": "t1",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t6",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t23",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t24",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t25",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t15",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t27",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t32",
      "home": false,
      "viaPot": 4
    }
  ],
  "t35": [
    {
      "opponentId": "t7",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t4",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t20",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t23",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t16",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t26",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t21",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t27",
      "home": false,
      "viaPot": 4
    }
  ],
  "t29": [
    {
      "opponentId": "t11",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t3",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t20",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t28",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t14",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t25",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t22",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t31",
      "home": false,
      "viaPot": 4
    }
  ],
  "t32": [
    {
      "opponentId": "t6",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t4",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t19",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t13",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t18",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t26",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t21",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t33",
      "home": false,
      "viaPot": 4
    }
  ],
  "t21": [
    {
      "opponentId": "t10",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t6",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t17",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t24",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t26",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t35",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t30",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t32",
      "home": false,
      "viaPot": 4
    }
  ],
  "t27": [
    {
      "opponentId": "t1",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t2",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t13",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t12",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t35",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t18",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t33",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t34",
      "home": false,
      "viaPot": 4
    }
  ],
  "t33": [
    {
      "opponentId": "t5",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t1",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t28",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t23",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t25",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t36",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t32",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t27",
      "home": false,
      "viaPot": 4
    }
  ],
  "t34": [
    {
      "opponentId": "t4",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t7",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t8",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t19",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t15",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t16",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t27",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t22",
      "home": false,
      "viaPot": 4
    }
  ],
  "t22": [
    {
      "opponentId": "t2",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t5",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t23",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t17",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t36",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t15",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t34",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t29",
      "home": false,
      "viaPot": 4
    }
  ],
  "t30": [
    {
      "opponentId": "t3",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t10",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t24",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t20",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t16",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t9",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t31",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t21",
      "home": false,
      "viaPot": 4
    }
  ],
  "t31": [
    {
      "opponentId": "t7",
      "home": true,
      "viaPot": 1
    },
    {
      "opponentId": "t11",
      "home": false,
      "viaPot": 1
    },
    {
      "opponentId": "t12",
      "home": true,
      "viaPot": 2
    },
    {
      "opponentId": "t8",
      "home": false,
      "viaPot": 2
    },
    {
      "opponentId": "t9",
      "home": true,
      "viaPot": 3
    },
    {
      "opponentId": "t14",
      "home": false,
      "viaPot": 3
    },
    {
      "opponentId": "t29",
      "home": true,
      "viaPot": 4
    },
    {
      "opponentId": "t30",
      "home": false,
      "viaPot": 4
    }
  ]
};
