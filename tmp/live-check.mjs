import { chromium } from "@playwright/test";
const b = await chromium.launch();
console.log("Viewport  | Ball fliegt | Bilder | Ball dx zum Korb | Konsolenfehler");
for (const [w,h] of [[375,812],[1440,900]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  const fehler=[];
  p.on("console", m => { if(m.type()==="error") fehler.push(m.text().slice(0,70)); });
  p.on("pageerror", e => fehler.push("pageerror: "+e.message.slice(0,70)));
  await p.addInitScript(`document.addEventListener("DOMContentLoaded",()=>{window.__s=[];
    new MutationObserver(()=>{const e=document.querySelector(".hero-ball-sprite");if(!e)return;
      const m=/translate3d\\([^,]+,\\s*([-\\d.]+)px/.exec(e.style.transform);
      if(m) window.__s.push({y:Number(m[1]),b:e.style.backgroundPositionX});
    }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:["style"]});});`);
  await p.goto("https://hoopsgermany.de/", { waitUntil:"domcontentloaded" });
  await p.waitForTimeout(3200);
  const s = await p.evaluate("window.__s || []");
  const weg = s.length ? Math.max(...s.map(x=>x.y))-Math.min(...s.map(x=>x.y)) : 0;
  const bilder = new Set(s.map(x=>x.b).filter(Boolean)).size;
  await p.evaluate("window.scrollTo(0, document.body.scrollHeight*0.92)");
  await p.waitForTimeout(2600);
  const dx = await p.evaluate(() => {
    const netz=[...document.querySelectorAll('svg[viewBox="0 0 20 14"]')]
      .filter(s=>s.getBoundingClientRect().width>0).find(s=>s.querySelector("g"));
    const ball=[...document.querySelectorAll('svg[width="20"]')]
      .map(e=>e.getBoundingClientRect()).find(r=>r.width>0);
    if(!netz||!ball) return null;
    const n=netz.getBoundingClientRect();
    return +(ball.left+ball.width/2-(n.left+n.width/2)).toFixed(1);
  });
  console.log(`${String(w+"x"+h).padStart(9)} | ${String(weg.toFixed(0)+"px").padStart(11)} | ${String(bilder).padStart(6)} | ${String(dx).padStart(16)} | ${fehler.length}${fehler.length?" -> "+fehler[0]:""}`);
  await p.close();
}
await b.close();
