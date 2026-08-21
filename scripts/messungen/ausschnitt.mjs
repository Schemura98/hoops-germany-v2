import fs from "node:fs";
import { chromium } from "@playwright/test";

// Host nicht fest verdrahtet — siehe scripts/messungen/README.md.
const BASIS = process.env.MESS_BASIS || "http://localhost:3000";
const ORT = process.env.MESS_ORT || "tmp/messungen";
fs.mkdirSync(ORT, { recursive: true });
const [B,H,sel,name] = [Number(process.argv[2]),Number(process.argv[3]),process.argv[4],process.argv[5]];
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:B,height:H},deviceScaleFactor:3});
await page.goto(BASIS,{waitUntil:"networkidle"});
await page.waitForTimeout(900);
await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
await page.waitForTimeout(1200);
const box = await page.evaluate((s)=>{
  const sec=document.querySelector("[data-passfeld]");
  const el=[...sec.querySelectorAll("h2,p,a")].find(e=>e.textContent.includes(s));
  const r=el.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};
},sel);
await page.screenshot({path:`${ORT}/${name}.png`,clip:{x:Math.max(0,box.x-10),y:Math.max(0,box.y-14),width:Math.min(B,box.w+20),height:box.h+28}});
await browser.close(); console.log("ok");
