import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {regions,industries} from './content.mjs';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const previous=['C:/Codex/careerviet-web2-v9-editorial','C:/Codex/careerviet-web2-blue','C:/Codex/careerviet-web2-v8'];
const compared=[];
for(const dir of previous)for(const name of ['site.css','site.js','build.mjs','content.mjs']){const file=path.join(dir,name);if(fs.existsSync(file))compared.push({file,sameHash:hash(file)===hash(name)});}
const pages=JSON.parse(fs.readFileSync('pages.json','utf8'));
let prohibitedLinks=0,remoteAssets=0;
for(const p of pages){const html=fs.readFileSync(path.join('dist',p.file),'utf8');prohibitedLinks+=(html.match(/href="https?:\/\/(?:[^/]+\.)?careerviet\.vn/g)||[]).length;remoteAssets+=(html.match(/(?:src|stylesheet" href)="https?:/g)||[]).length;}
const counts=[...regions.map(x=>({...x,type:'region'})),...industries.map(x=>({...x,type:'industry'}))].map(x=>({type:x.type,slug:x.slug,words:x.paragraphs.join(' ').trim().split(/\s+/).length}));
if(compared.some(x=>x.sameHash)||prohibitedLinks||remoteAssets||counts.some(x=>x.words<150||x.words>300))throw new Error('Footprint or word-count check failed: '+JSON.stringify({compared,prohibitedLinks,remoteAssets,counts}));
const report={scope:'Local source comparison, outgoing links and content length; no claim of a search-engine footprint certification.',compared,prohibitedLinks,remoteAssets,counts,palette:['#151626','#1f2f6b','#771933','#e3b858'],samePriorEntryFiles:false,images:{banner:false,officialLogo:true}};
fs.writeFileSync('qa/footprint-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
