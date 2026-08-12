import { chromium } from "playwright";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 390, height: 850 } })).newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const y = await page.evaluate(() => {
  const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
  window.scrollTo(0, s.offsetTop + s.offsetHeight - window.innerHeight * 0.5);
  return s.offsetTop;
});
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(() => {
  const st = Array.from(document.querySelectorAll("div")).filter((d) => getComputedStyle(d).position === "sticky");
  return st.map((d) => ({
    klasse: String(d.className).slice(0, 60),
    text: d.textContent.trim().slice(0, 30),
    kinderMitTransform: Array.from(d.querySelectorAll("*")).filter((e) => e.style && e.style.transform).map((e) => `${e.tagName}:${e.style.transform.slice(0, 34)}`),
  }));
}), null, 1));
await b.close();
