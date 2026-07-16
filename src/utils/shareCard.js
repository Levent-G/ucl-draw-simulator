import { POT_COLORS } from '../data/teams.js'

// Harici kütüphane gerektirmeden, düz Canvas API ile bir "sonuç kartı"
// çizer ve PNG olarak indirir. Gerçek logo kullanılmaz -- sadece metin,
// renkler ve basit şekiller.
export function renderShareCard(team, opponents) {
  const canvas = document.createElement('canvas')
  const width = 720
  const height = 900
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#050b22')
  bg.addColorStop(0.5, '#0c2159')
  bg.addColorStop(1, '#123a7a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '600 18px Arial, sans-serif'
  ctx.fillText('UCL KURA ÇEKİMİ SİMÜLATÖRÜ', width / 2, 56)

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 42px Arial, sans-serif'
  ctx.fillText(team.name.toUpperCase(), width / 2, 112)

  ctx.fillStyle = '#5b9dff'
  ctx.font = '600 16px Arial, sans-serif'
  ctx.fillText('LİG FAZI FİKSTÜRÜ', width / 2, 142)

  const startY = 190
  const rowH = 82
  const rowGap = 8
  opponents.forEach((o, i) => {
    const y = startY + i * (rowH + rowGap)

    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)'
    ctx.fillRect(40, y, width - 80, rowH)

    ctx.fillStyle = POT_COLORS[o.viaPot].main
    ctx.beginPath()
    ctx.arc(70, y + rowH / 2, 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.textAlign = 'left'
    ctx.font = '700 14px Arial, sans-serif'
    ctx.fillStyle = o.home ? '#34d399' : '#e879c9'
    ctx.fillText(o.home ? 'İÇ SAHA' : 'DEPLASMAN', 96, y + rowH / 2 - 10)

    ctx.fillStyle = '#ffffff'
    ctx.font = '600 24px Arial, sans-serif'
    ctx.fillText(o.team ? o.team.name : '—', 96, y + rowH / 2 + 20)
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '400 14px Arial, sans-serif'
  ctx.fillText('Kendi çekilişini yap ve sonucunu paylaş', width / 2, height - 26)

  return canvas
}

export function downloadShareCard(team, opponents) {
  const canvas = renderShareCard(team, opponents)
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${team.short}-ucl-fikstur.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  })
}
