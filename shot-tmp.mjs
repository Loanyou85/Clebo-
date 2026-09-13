import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/hero.png" });
// clique la première réponse -> bascule dans le questionnaire
await page.click('button:has-text("Il tire en laisse")');
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/q2.png" });
console.log("ERREURS", JSON.stringify(errs));
await browser.close();
