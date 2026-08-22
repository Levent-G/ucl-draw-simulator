import { chromium } from "playwright";
const BASE = "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (err) => console.log("PAGE ERR:", String(err)));

// --- Transfer Market: collapsed by default, expand/collapse works ---
await page.goto(`${BASE}/#/transferler`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const boardHeight1 = await page.evaluate(() => document.querySelector(".transfer-board")?.getBoundingClientRect().height);
console.log("Transfer board height (all collapsed):", boardHeight1);
const openCount1 = await page.locator(".transfer-team-card.is-open").count();
console.log("Open cards initially:", openCount1);

// click first card header to expand
await page.locator(".transfer-team-card-header").first().click();
await page.waitForTimeout(200);
const openCount2 = await page.locator(".transfer-team-card.is-open").count();
console.log("Open cards after 1 click:", openCount2);

// Tümünü Aç
await page.click("button:has-text('Tümünü Aç')");
await page.waitForTimeout(200);
const openCount3 = await page.locator(".transfer-team-card.is-open").count();
const totalCards = await page.locator(".transfer-team-card").count();
console.log("Open cards after 'Tümünü Aç':", openCount3, "/", totalCards);

// Search auto-opens matches
await page.click("button:has-text('Tümünü Kapat')");
await page.waitForTimeout(200);
await page.fill(".transfer-board-search", "messi");
await page.waitForTimeout(300);
const visibleAfterSearch = await page.locator(".transfer-team-card").count();
console.log("Cards visible after searching 'messi':", visibleAfterSearch);
await page.fill(".transfer-board-search", "");

// --- Standings truncation on Fixture page ---
await page.goto(`${BASE}/#/ucl`, { waitUntil: "networkidle" });
await page.locator(".table-start-overlay .start-orb").click({ force: true });
await page.waitForTimeout(400);
await page.locator(".draw-skip-fab").click({ force: true });
await page.waitForTimeout(800);
await page.goto(`${BASE}/#/ucl/fikstur`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const standingsRows1 = await page.locator(".standings-table tbody tr").count();
console.log("Standings visible rows (collapsed):", standingsRows1);
const toggleBtnExists = await page.locator(".standings-toggle-btn").count();
console.log("Toggle button present:", toggleBtnExists);
if (toggleBtnExists > 0) {
  await page.click(".standings-toggle-btn");
  await page.waitForTimeout(200);
  const standingsRows2 = await page.locator(".standings-table tbody tr").count();
  console.log("Standings visible rows (expanded):", standingsRows2);
}

await browser.close();
console.log("DONE");
