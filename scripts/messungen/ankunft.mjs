// Der Moment der ANKUNFT: erste Scrollposition, ab der sich der Ball nicht mehr
// bewegt. Gemessen wird seine Lage gegen die Unterkante der haftenden Leiste.
// Dazu die Lage am untersten Punkt der Seite.
import { chromium } from "@playwright/test";

// Host nicht fest verdrahtet — siehe scripts/messungen/README.md.
const BASIS = process.env.MESS_BASIS || "http://localhost:3000";
const FENSTER=[[320,640],[360,800],[390,844],[430,932],[768,1024],[1024,1366],[1280,800],[1440,900]];
const browser=await chromium.launch();
const c0=await browser.newContext();
const rr=await c0.request.post(`${BASIS}/api/player/playerlogin`,{data:{email:"max@test.de",password:"test123"}});
const jj=await rr.json().catch(()=>({})); const TOK=jj?.data?.token||jj?.token; await c0.close();
const navUnten = () => {
  const kandidaten=[...document.querySelectorAll("nav,header")].filter(e=>{
    const s=getComputedStyle(e); return s.position==="sticky"||s.position==="fixed";
  });
  return kandidaten.length?Math.max(...kandidaten.map(e=>e.getBoundingClientRect().bottom)):0;
};
for(const zu of ["aus","an"]){
 console.log(`\n=== ${zu==="an"?"ANGEMELDET":"AUSGELOGGT"} ===`);
 for(const [B,H] of FENSTER){
  const ctx=await browser.newContext({viewport:{width:B,height:H}});
  const page=await ctx.newPage();
  if(zu==="an") await page.addInitScript((t)=>localStorage.setItem("playerAuthToken",t),TOK);
  await page.goto(BASIS,{waitUntil:"networkidle"});
  await page.waitForTimeout(900);
  await page.addScriptTag({content:`window.__navUnten = ${navUnten.toString()}`});
  const max=await page.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight);
  // Erst die ENDLAGE bestimmen, dann die erste Scrollposition suchen, an der sie
  // erreicht ist. (Andersherum meldet die Suche die RUHE VOR dem Flug.)
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  const ziel=await page.evaluate(()=>{
    const b=document.querySelector("[data-pass-ball]").getBoundingClientRect();
    const sec=document.querySelector("[data-passfeld]").getBoundingClientRect();
    return {x:b.left-sec.left,y:b.top-sec.top};
  });
  let ankunft=null;
  for(let s=Math.max(0,max-1600); s<=max; s+=20){
    await page.evaluate((y)=>window.scrollTo(0,y),s);
    await page.waitForTimeout(35);
    const d=await page.evaluate(()=>{
      const b=document.querySelector("[data-pass-ball]").getBoundingClientRect();
      const sec=document.querySelector("[data-passfeld]").getBoundingClientRect();
      return {relX:b.left-sec.left, relY:b.top-sec.top, oben:b.top, unten:b.bottom,
              nav:window.__navUnten(), H:window.innerHeight,
              deck:Number(getComputedStyle(document.querySelector("[data-pass-ball]")).opacity)};
    });
    if(!ankunft && Math.abs(d.relX-ziel.x)<1 && Math.abs(d.relY-ziel.y)<1) ankunft=d;
  }
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  const u=await page.evaluate(()=>{
    const b=document.querySelector("[data-pass-ball]").getBoundingClientRect();
    return {frei:b.top-window.__navUnten()};
  });
  const a = ankunft ? (ankunft.oben-ankunft.nav).toFixed(1) : "n/a";
  const b2 = ankunft ? `${ankunft.unten.toFixed(0)}/${ankunft.H} Deck ${ankunft.deck.toFixed(2)} navU ${ankunft.nav.toFixed(0)}` : "-";
  console.log(`${String(B).padStart(4)}x${String(H).padEnd(4)} | Ankunft: Ball ${String(a).padStart(7)} px unter der Leiste | ganz unten: ${u.frei.toFixed(1).padStart(7)} px | ${b2}`);
  await ctx.close();
 }
}
await browser.close();
