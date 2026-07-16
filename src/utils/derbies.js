// Takım listemizde (src/data/teams.js) her iki tarafı da bulunan klasik
// rekabetler. Bir eşleşme çekilince özel bir "derbi" banner'ı tetiklenir.
const DERBIES = [
  { pair: ['RMA', 'BAR'], label: 'EL CLÁSICO' },
  { pair: ['RMA', 'ATM'], label: 'MADRID DERBİSİ' },
  { pair: ['ATM', 'BAR'], label: 'İSPANYA DEV EŞLEŞMESİ' },
  { pair: ['BAY', 'BVB'], label: 'DER KLASSIKER' },
  { pair: ['INT', 'MIL'], label: 'MİLANO DERBİSİ' },
  { pair: ['INT', 'JUV'], label: 'İTALYA DEV EŞLEŞMESİ' },
  { pair: ['MIL', 'JUV'], label: 'İTALYA DEV EŞLEŞMESİ' },
  { pair: ['MCI', 'LIV'], label: 'İNGİLTERE DEV EŞLEŞMESİ' },
  { pair: ['ARS', 'CHE'], label: 'LONDRA DERBİSİ' },
  { pair: ['FEY', 'PSV'], label: 'DE TOPPER' },
]

export function findDerby(shortA, shortB) {
  return DERBIES.find(
    (d) =>
      (d.pair[0] === shortA && d.pair[1] === shortB) ||
      (d.pair[0] === shortB && d.pair[1] === shortA)
  )
}
