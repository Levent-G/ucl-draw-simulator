// Transfer Merkezi'ndeki "canlı akış" için kurgusal transfer haber başlıkları
// üretir. Bu haberler SADECE atmosfer/eğlence amaçlıdır -- kadroları
// OTOMATİK değiştirmez; gerçek transferler kullanıcının manuel olarak
// onayladığı işlemlerdir (TransferContext).
const FEES = ["serbest transfer", "8M €", "15M €", "24M €", "32M €", "45M €", "60M €", "78M €", "95M €"];

const TEMPLATES = [
  "SON DAKİKA: {player}, {to} ile prensipte anlaştı — bonservis {fee}.",
  "{player}, {from} formasını çıkarıyor: yeni adres {to} ({fee}).",
  "{to} kaynakları doğruladı: {player} transferi bitti, imza törenine gidiliyor.",
  "{from} yönetimi, {player} için {to}'dan gelen teklifi değerlendiriyor ({fee}).",
  "Resmi açıklama geldi: {player} artık bir {to} oyuncusu ({fee}).",
  "{to} taraftarı sosyal medyayı salladı: {player} imza için kentte.",
  "Görüşmeler tamamlandı — {player}, {to} formasını giyecek ({fee}).",
  "{from}'dan ayrılık sinyali: {player}'ın yeni durağı {to} olabilir.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let counter = 0;

export function generateTransferHeadline(players, teams) {
  if (!players.length || teams.length < 2) return null;
  const player = pick(players);
  const fromTeam = teams.find((t) => t.id === player.teamId);
  const candidates = teams.filter((t) => t.id !== player.teamId);
  const toTeam = pick(candidates);
  const fee = pick(FEES);
  const template = pick(TEMPLATES);
  const text = template
    .replaceAll("{player}", player.name)
    .replaceAll("{from}", fromTeam?.name || "eski kulübü")
    .replaceAll("{to}", toTeam.name)
    .replaceAll("{fee}", fee);

  counter += 1;
  return {
    id: `news-${Date.now()}-${counter}`,
    text,
    player,
    fromTeam,
    toTeam,
    fee,
  };
}
