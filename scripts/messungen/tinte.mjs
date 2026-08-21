// Beruehrt eine sichtbare Linie die TINTE? Gemessen an den Zeilenkaesten der
// Textknoten (Range.getClientRects), nicht an der Elementbox: Eine mittige
// Zeile in einem randfuellenden <p> hat eine Box, die drei- bis viermal so
// breit ist wie ihre Buchstaben.
import { chromium } from "@playwright/test";

// Host nicht fest verdrahtet — siehe scripts/messungen/README.md.
const BASIS = process.env.MESS_BASIS || "http://localhost:3000";
const FENSTER=[[320,640],[360,800],[375,812],[390,844],[430,932],[768,1024],[1024,1366],[1280,800],[1440,900],[1920,1080]];
const browser=await chromium.launch();
const c0=await browser.newContext();
const rr=await c0.request.post(`${BASIS}/api/player/playerlogin`,{data:{email:"max@test.de",password:"test123"}});
const jj=await rr.json().catch(()=>({})); const TOK=jj?.data?.token||jj?.token; await c0.close();
const alphaNah=(d)=>{const st=[[0,1],[2.0,1],[2.9,0.85],[3.6,0.35],[4.2,0],[6,0]];
  if(d<=0)return 1; if(d>=6)return 0;
  for(let i=1;i<st.length;i++) if(d<=st[i][0]){const[a,pa]=st[i-1],[b,pb]=st[i];return pa+(pb-pa)*(d-a)/(b-a);} return 0;};
const alphaFern=(d)=>0.85*(d<=7?1:Math.max(0,1-(d-7)/2));

let gesamt=0, sichtbar=0;
for(const zu of ["aus","an"]){
 console.log(`\n=== ${zu==="an"?"ANGEMELDET":"AUSGELOGGT"} ===`);
 for(const [B,H] of FENSTER){
  const ctx=await browser.newContext({viewport:{width:B,height:H}});
  const page=await ctx.newPage();
  if(zu==="an") await page.addInitScript((t)=>localStorage.setItem("playerAuthToken",t),TOK);
  await page.goto(BASIS,{waitUntil:"networkidle"});
  await page.waitForTimeout(800);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await page.waitForTimeout(1100);
  const r=await page.evaluate(()=>{
    const sec=document.querySelector("[data-passfeld]");
    const svg=sec.querySelector("[data-endfeld-svg]");
    const inv=svg.getScreenCTM().inverse(); const pt=svg.createSVGPoint();
    const pfade=[...svg.querySelectorAll('[data-endfeld]')];
    // Zeilenkaesten aller Textknoten
    const kaesten=[];
    const lauf=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT);
    let k; while((k=lauf.nextNode())){
      if(!k.textContent.trim()) continue;
      const rg=document.createRange(); rg.selectNodeContents(k);
      for(const b of rg.getClientRects()) if(b.width>0&&b.height>0)
        kaesten.push({t:k.textContent.trim().slice(0,24),b:{l:b.left,r:b.right,o:b.top,u:b.bottom}});
    }
    const funde=[];
    for(const {t,b} of kaesten){
      let best=null;
      for(let x=b.l;x<=b.r;x+=1) for(let y=b.o;y<=b.u;y+=1){
        pt.x=x;pt.y=y;const p=pt.matrixTransform(inv);
        for(const e of pfade) if(e.isPointInStroke(p)){
          const tiefe=(720-p.y)/60;
          if(!best||tiefe<best.tiefe) best={tiefe,pfad:e.getAttribute("data-endfeld")};
        }
      }
      if(best) funde.push({t,...best});
    }
    return funde;
  });
  gesamt++;
  if(!r.length) console.log(`${String(B).padStart(4)}x${String(H).padEnd(4)}: 0 Beruehrungen der Tinte`);
  else for(const f of r){
    const a=f.pfad==="drei"?alphaFern(f.tiefe):alphaNah(f.tiefe);
    if(a>0.02) sichtbar++;
    console.log(`${String(B).padStart(4)}x${String(H).padEnd(4)} | "${f.t}" ← ${f.pfad} @ ${f.tiefe.toFixed(2)} m ⇒ Deckkraft ${a.toFixed(3)}${a>0.02?"   <<< SICHTBAR":""}`);
  }
  await ctx.close();
 }
}
console.log(`\n${gesamt} Faelle geprueft, ${sichtbar} sichtbare Tintenberuehrungen`);
await browser.close();
