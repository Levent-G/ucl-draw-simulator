import { chromium } from "playwright";
const outDir = "C:\\Users\\286488~1\\AppData\\Local\\Temp\\claude\\c--Users-28648806822-Desktop-ucl-draw-simulator\\b4e195e9-3698-4353-9dd4-80f79ec761cd\\scratchpad";
const browser = await chromium.launch();
const errors = [];

const page = await browser.newPage({ viewport: { width: 1400, height: 700 } });
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(err.message));
await page.goto("http://localhost:5174/#/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
try { await page.click("text=Anladım, Başlayalım", { timeout: 1500 }); await page.waitForTimeout(300); } catch {}
await page.screenshot({ path: `${outDir}\\hero-3btn.png` });

const mobile = await browser.newPage({ viewport: { width: 390, height: 700 } });
await mobile.goto("http://localhost:5174/#/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(1000);
try { await mobile.click("text=Anladım, Başlayalım", { timeout: 1500 }); await mobile.waitForTimeout(300); } catch {}
await mobile.screenshot({ path: `${outDir}\\hero-3btn-mobile.png` });

await browser.close();
console.log("DONE", JSON.stringify(errors));
