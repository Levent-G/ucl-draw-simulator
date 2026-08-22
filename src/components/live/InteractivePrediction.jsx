import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { useCompetition } from "../../state/CompetitionContext.jsx";
import { useTeamTactics } from "../../state/TacticsContext.jsx";
import { useAchievements } from "../../state/AchievementsContext.jsx";
import { standingsFromOrder, computeStandingsFromUserScores } from "../../utils/predictionEngine.js";
import { generateKnockoutBracket } from "../../utils/knockoutEngine.js";
import { encodeShareData, decodeShareData, copyToClipboard } from "../../utils/shareLink.js";
import DragStandings from "../fixture/DragStandings.jsx";
import MatchdayTabs from "../fixture/MatchdayTabs.jsx";
import MatchRow from "../fixture/MatchRow.jsx";
import StandingsTable from "../fixture/StandingsTable.jsx";
import TieCard from "../knockout/TieCard.jsx";
import PlayerAvatar from "../PlayerAvatar.jsx";

const MODES = [
  { key: "model", label: "Model Tahmini" },
  { key: "drag", label: "🖐 Sıralamamı Sürükle" },
  { key: "scores", label: "✍️ Skorları Ben Gireyim" },
];

const MODE_LABELS = { model: "Model Tahmini", drag: "Kendi Sıralamam", scores: "Kendi Skorlarım" };

// Kullanıcının modelin tahminiyle YETİNMEK ZORUNDA olmadığı, tamamen
// etkileşimli tahmin paneli: puan durumunu sürükleyerek değiştirebilir,
// maç maç kendi skorunu girebilir, kendi gol kralı adayını seçebilir --
// hepsi eleme turunu (varsa) ANINDA yeniden hesaplar. dataSource, UCL/Avrupa
// Ligi'nde (taze/tam sezon) ve Süper Lig'de (gerçek 1. Haftadan devam eden
// kısmi sezon) FARKLI şekillerde hazırlanıp aynı bileşene verilir:
//   { fixture, modelStandings, modelKnockout, initialStandings, hasKnockout }
export default function InteractivePrediction({ competitionKey, dataSource }) {
  const { competition, standingsOrder, setStandingsOrder, userScores, updateUserScore, clearUserScores } =
    useCompetition(competitionKey);
  const { teamTactics } = useTeamTactics(competitionKey);
  const [mode, setMode] = useState("model");
  const [activeMatchday, setActiveMatchday] = useState(1);
  const [myScorerId, setMyScorerId] = useState("");
  const [capturing, setCapturing] = useState(false);
  const captureRef = useRef(null);

  const { fixture, modelStandings, modelKnockout, modelMatchResults, modelPlayerStats, initialStandings, hasKnockout } =
    dataSource;
  const { unlock } = useAchievements();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shareStatus, setShareStatus] = useState("idle");

  // Paylaşılan bir tahmin linkiyle (?d=...) açıldıysa -- ve bu link BU
  // yarışmaya aitse -- kullanıcının sıralama/skor tahminini bir kerede
  // geri yükler.
  useEffect(() => {
    const shared = searchParams.get("d");
    if (!shared) return;
    const data = decodeShareData(shared);
    if (data?.competitionKey === competitionKey) {
      if (data.standingsOrder) setStandingsOrder(data.standingsOrder);
      if (data.userScores) {
        for (const [matchId, entry] of Object.entries(data.userScores)) {
          if (entry?.home !== undefined) updateUserScore(matchId, "home", entry.home);
          if (entry?.away !== undefined) updateUserScore(matchId, "away", entry.away);
        }
      }
      if (data.standingsOrder) setMode("drag");
      else if (data.userScores) setMode("scores");
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSharePrediction = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/canli?d=${encodeShareData({
      competitionKey,
      standingsOrder: mode === "drag" ? standingsOrder : undefined,
      userScores: mode === "scores" ? userScores : undefined,
    })}`;
    const copied = await copyToClipboard(url);
    setShareStatus(copied ? "copied" : "manual");
    window.setTimeout(() => setShareStatus("idle"), 3000);
    if (!copied) window.prompt("Linki kopyala:", url);
  };

  // "Kahin" / "Kahin Pro" başarıları: kullanıcı "Skorları Ben Gireyim"
  // modunda girdiği skorları, modelin o maçlar için ürettiği gerçek
  // skorlarla birebir tutturursa açılır (Pro: 3 farklı maçta tutturma).
  useEffect(() => {
    if (!modelMatchResults) return;
    const modelByMatchId = Object.fromEntries(modelMatchResults.map((m) => [String(m.id), m]));
    const hits = Object.entries(userScores).filter(([matchId, entry]) => {
      if (!entry || entry.home === "" || entry.away === "") return false;
      const model = modelByMatchId[matchId];
      if (!model) return false;
      return Number(entry.home) === model.homeGoals && Number(entry.away) === model.awayGoals;
    }).length;
    if (hits >= 1) unlock("kahin");
    if (hits >= 3) unlock("kahin-pro");
  }, [userScores, modelMatchResults, unlock]);

  // "Sıralama Ustası": kullanıcı sürükle-bırakla kendi sıralamasını kurdu.
  useEffect(() => {
    if (standingsOrder && standingsOrder.length > 0) unlock("siralama-ustasi");
  }, [standingsOrder, unlock]);

  // "Gol Kralı Kahini": kullanıcının seçtiği aday, modelin ürettiği gerçek
  // gol kralıyla (en çok gol atan oyuncu) eşleşirse açılır.
  useEffect(() => {
    if (!myScorerId || !modelPlayerStats) return;
    let topId = null;
    let topGoals = -1;
    for (const [pid, s] of Object.entries(modelPlayerStats)) {
      if ((s.goals || 0) > topGoals) {
        topGoals = s.goals || 0;
        topId = pid;
      }
    }
    if (topId && topGoals > 0 && topId === myScorerId) unlock("gol-krali-kahin");
  }, [myScorerId, modelPlayerStats, unlock]);

  const teamById = useMemo(() => Object.fromEntries(competition.teams.map((t) => [t.id, t])), [competition]);

  const modelOrder = useMemo(
    () => (modelStandings ? modelStandings.map((s) => s.teamId) : competition.teams.map((t) => t.id)),
    [modelStandings, competition]
  );
  const dragOrder =
    standingsOrder && standingsOrder.length === competition.teams.length ? standingsOrder : modelOrder;

  const dragStandings = useMemo(
    () => standingsFromOrder(dragOrder, competition.teams, competition.zones),
    [dragOrder, competition]
  );

  const scoreStandings = useMemo(() => {
    if (!fixture) return null;
    return computeStandingsFromUserScores(fixture, userScores, {
      teams: competition.teams,
      zones: competition.zones,
      initialStandings,
    });
  }, [fixture, userScores, competition, initialStandings]);

  const activeStandings =
    mode === "drag" ? dragStandings : mode === "scores" ? scoreStandings : modelStandings;

  // "model" modunda zaten hazır olan eleme turunu (rastgele yeniden
  // yuvarlamadan) aynen gösterir; diğer modlarda kullanıcının
  // sıralaması/skorları değişir değişmez ANINDA yeniden hesaplanır.
  const liveKnockout = useMemo(() => {
    if (!hasKnockout) return null;
    if (mode === "model") return modelKnockout;
    if (!activeStandings) return null;
    return generateKnockoutBracket(activeStandings, teamById, teamTactics);
  }, [mode, modelKnockout, activeStandings, teamById, teamTactics, hasKnockout]);

  const allPlayers = useMemo(
    () => [...competition.getAllPlayers()].sort((a, b) => b.rating - a.rating),
    [competition]
  );
  const myScorer = allPlayers.find((p) => p.id === myScorerId) || null;

  const activeMatches = useMemo(() => {
    if (!fixture) return [];
    const md = fixture.find((m) => m.number === activeMatchday);
    return md ? md.matches : [];
  }, [fixture, activeMatchday]);

  // Sonuç bölümünü (puan durumu + gol kralı seçimi + eleme turu) bir PNG
  // fotoğrafa çevirip anında indirir -- backend yok, tamamen istemci
  // tarafında (html2canvas ile DOM'u bir canvas'a çizip oradan Blob üretir).
  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0e1d4a",
        scale: 2,
        useCORS: true,
        // <select> native form kontrolü olduğu için html2canvas tarafından
        // güvenilir çizilemiyor -- görüntüde sadece seçilen oyuncu (ip-scorer-pick-chip) görünsün yeter.
        ignoreElements: (el) => el.tagName === "SELECT",
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${competition.shortName.replace(/\s+/g, "-")}-tahminim-${mode}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        unlock("foto-muhabiri");
      }, "image/png");
    } finally {
      setCapturing(false);
    }
  };

  if (!fixture) return null;

  return (
    <div className="interactive-prediction">
      <div className="ip-mode-toggle">
        {MODES.map((m) => (
          <button key={m.key} className={mode === m.key ? "active" : ""} onClick={() => setMode(m.key)}>
            {m.label}
          </button>
        ))}
        <button className="btn-secondary ip-download-btn" onClick={handleDownloadImage} disabled={capturing}>
          {capturing ? "Hazırlanıyor…" : "📸 Tahminimi Fotoğraf Olarak İndir"}
        </button>
        {(mode === "drag" || mode === "scores") && (
          <button className="btn-secondary ip-download-btn" onClick={handleSharePrediction}>
            {shareStatus === "copied" ? "✅ Link Kopyalandı!" : "🔗 Tahminimi Paylaş"}
          </button>
        )}
      </div>

      {mode === "drag" && (
        <div className="standings-card ip-drag-card">
          <p className="drag-standings-hint">
            Takımları sürükleyerek (ya da ok butonlarıyla) kendi final sıralamanı oluştur
            {hasKnockout ? " -- eleme turu buna göre anında yeniden hesaplanır." : "."}
          </p>
          <DragStandings
            teams={competition.teams}
            order={dragOrder}
            onReorder={setStandingsOrder}
            zones={competition.zones}
          />
        </div>
      )}

      {mode === "scores" && (
        <div className="ip-scores-panel">
          <div className="ip-scores-head">
            <p>
              Maçlara kendi skorunu gir; puan durumu{hasKnockout ? " ve eleme turu" : ""} girdiğin
              skorlara göre anında güncellenir.
            </p>
            <button className="btn-ghost" onClick={clearUserScores}>
              Tahminlerimi Temizle
            </button>
          </div>
          <MatchdayTabs matchdays={fixture} active={activeMatchday} onSelect={setActiveMatchday} />
          <div className="match-list">
            {activeMatches.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                competitionKey={competitionKey}
                userScore={userScores[m.id]}
                onUserScoreChange={(field, value) => updateUserScore(m.id, field, value)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="ip-capture-zone" ref={captureRef}>
        <div className="ip-capture-header">
          <span className="ip-capture-title">{competition.name}</span>
          <span className="ip-capture-mode">{MODE_LABELS[mode]}</span>
        </div>

        {mode === "model" && modelStandings && (
          <StandingsTable
            standings={modelStandings}
            teams={competition.teams}
            title="Model Tahmini Puan Durumu"
            competitionKey={competitionKey}
          />
        )}
        {mode === "drag" && (
          <StandingsTable
            standings={dragStandings}
            teams={competition.teams}
            title="Senin Sıralaman"
            competitionKey={competitionKey}
          />
        )}
        {mode === "scores" && scoreStandings && (
          <StandingsTable
            standings={scoreStandings}
            teams={competition.teams}
            title="Kendi Skorlarına Göre Puan Durumu"
            competitionKey={competitionKey}
          />
        )}

        <div className="ip-scorer-pick">
          <label htmlFor={`ip-scorer-select-${competitionKey}`}>⚽ Kendi Gol Kralı Tahminin:</label>
          <select
            id={`ip-scorer-select-${competitionKey}`}
            value={myScorerId}
            onChange={(e) => setMyScorerId(e.target.value)}
          >
            <option value="">Seç…</option>
            {allPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({teamById[p.teamId]?.short})
              </option>
            ))}
          </select>
          {myScorer && (
            <span className="ip-scorer-pick-chip">
              <PlayerAvatar player={myScorer} size={24} />
              {myScorer.name}
            </span>
          )}
        </div>

        {hasKnockout && (
          <div className="chart-card chart-card-wide live-sim-knockout">
            <h3>
              Eleme Turu {mode !== "model" ? "(Senin Sıralamana Göre)" : ""}
              {liveKnockout?.champion ? ` — Şampiyon: ${liveKnockout.champion.name}` : ""}
            </h3>
            {liveKnockout ? (
              liveKnockout.rounds.map((round) => (
                <div key={round.name} className="knockout-round">
                  <h3>{round.name}</h3>
                  <div className="knockout-ties">
                    {round.ties.map((tie, i) => (
                      <TieCard key={i} tie={tie} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="standings-empty">Hesaplanıyor…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
