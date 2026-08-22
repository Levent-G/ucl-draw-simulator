import zlib from "node:zlib";
import fs from "node:fs";

// CRC32 for PNG chunks
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// 10-point star boundary radius at angle theta (outer/inner alternating).
function starRadius(theta, outerR, innerR, points = 5, rotation = -Math.PI / 2) {
  const seg = Math.PI / points;
  let a = (theta - rotation) % (2 * seg);
  if (a < 0) a += 2 * seg;
  const half = seg;
  const t = a < half ? a / half : (2 * half - a) / half; // 0 at spikes, 1 at valleys... adjust
  // Linear interpolation between outer (at tip, a=0/2*half) and inner (a=half)
  const frac = Math.abs(a - half) / half; // 1 at tip, 0 at valley
  return innerR + (outerR - innerR) * frac;
}

function drawIcon(size, padding = 0) {
  const w = size;
  const h = size;
  const raw = Buffer.alloc(h * (1 + w * 4)); // 1 filter byte + RGBA per row
  const bg1 = hexToRgb("#0a1636");
  const bg2 = hexToRgb("#0e1d4a");
  const ball1 = hexToRgb("#5468ff");
  const ball2 = hexToRgb("#22d3ee");
  const white = [255, 255, 255];
  const cx = w / 2;
  const cy = h / 2;
  const usable = (Math.min(w, h) / 2) * (1 - padding);
  const ballR = usable * 0.86;
  const ringR = usable * 0.98;
  const starOuter = ballR * 0.5;
  const starInner = starOuter * 0.42;

  for (let y = 0; y < h; y++) {
    let offset = y * (1 + w * 4);
    raw[offset] = 0; // filter type none
    offset += 1;
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diagT = (x / w + y / h) / 2;
      let r, g, b, a = 255;

      if (dist <= ballR) {
        // ball fill: radial-ish gradient blue->cyan
        const t = Math.min(1, dist / ballR);
        const [rr, gg, bb] = lerpColor(ball1, ball2, t);
        // star cut-out in the middle (white)
        const theta = Math.atan2(dy, dx);
        const starB = starRadius(theta, starOuter, starInner);
        if (dist <= starB) {
          [r, g, b] = white;
        } else {
          r = rr;
          g = gg;
          b = bb;
        }
      } else if (dist <= ringR) {
        // thin gold ring
        [r, g, b] = [212, 175, 90];
      } else {
        const [rr, gg, bb] = lerpColor(bg1, bg2, diagT);
        r = rr;
        g = gg;
        b = bb;
      }
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  const png = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

fs.mkdirSync("public/icons", { recursive: true });
fs.writeFileSync("public/icons/icon-192.png", drawIcon(192, 0));
fs.writeFileSync("public/icons/icon-512.png", drawIcon(512, 0));
fs.writeFileSync("public/icons/icon-maskable-512.png", drawIcon(512, 0.18));
console.log("icons written");
