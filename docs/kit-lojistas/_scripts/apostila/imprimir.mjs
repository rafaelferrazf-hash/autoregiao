// node imprimir.mjs in.html out.pdf [header.html footer.html]
import { spawn } from "node:child_process"; import { writeFileSync, readFileSync } from "node:fs"; import { resolve } from "node:path"; import { pathToFileURL } from "node:url";
const [inp,pdf,hdr,ftr]=process.argv.slice(2);
const EDGE="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"; const port=9400+Math.floor(Math.random()*80);
const p=spawn(EDGE,["--headless=new","--disable-gpu","--no-first-run","--disable-sync","--disable-features=msImplicitSignin,EdgeSignin","--remote-debugging-port="+port,"--user-data-dir="+process.env.TEMP+"/edge-ap-"+Date.now(),"about:blank"],{stdio:"ignore"});
const espera=ms=>new Promise(r=>setTimeout(r,ms)); let l=[];
for(let i=0;i<60;i++){try{l=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();if(l.some(t=>t.type==="page"&&t.url==="about:blank"))break}catch{} await espera(250)}
const ws=new WebSocket(l.find(t=>t.type==="page"&&t.url==="about:blank").webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener("open",r));
let id=0;const pend=new Map();ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}});
const cmd=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
await cmd("Page.enable"); await cmd("Page.navigate",{url:pathToFileURL(resolve(inp)).href}); await espera(3000);
const op={printBackground:true,preferCSSPageSize:true,transferMode:"ReturnAsStream"};
if(hdr){Object.assign(op,{displayHeaderFooter:true,headerTemplate:readFileSync(hdr,"utf8"),footerTemplate:readFileSync(ftr,"utf8")});}
const r=await cmd("Page.printToPDF",op); if(r.error){console.log(JSON.stringify(r.error));process.exit(2)}
const parts=[];for(;;){const c=await cmd("IO.read",{handle:r.result.stream,size:262144});parts.push(Buffer.from(c.result.data,c.result.base64Encoded?"base64":"latin1"));if(c.result.eof)break}
writeFileSync(pdf,Buffer.concat(parts)); console.log("ok"); p.kill(); process.exit(0);
