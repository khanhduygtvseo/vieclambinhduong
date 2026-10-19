import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const pages=JSON.parse(fs.readFileSync(path.join(root,'pages.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(root,'config.json'),'utf8'));
const titles=new Set(),descriptions=new Set();let links=0;
for(const page of pages){
 const pageFile=path.join(root,'dist',page.file);const html=fs.readFileSync(pageFile,'utf8');const ctx=page.route;
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,ctx+' H1 count');assert.ok(html.startsWith('<!doctype html>'),ctx+' doctype');
 assert.ok(html.includes('lang="vi"'),ctx+' language');assert.ok(!titles.has(page.title),ctx+' duplicate title');titles.add(page.title);
 assert.ok(!descriptions.has(page.description),ctx+' duplicate description');descriptions.add(page.description);
 assert.ok(html.includes(`<link rel="canonical" href="${config.origin}${page.route}">`),ctx+' canonical');
 assert.ok(html.includes(config.preview?'noindex, nofollow':'index, follow')||page.status404,ctx+' index state');
 assert.ok(!/<iframe|rel="(?:shortcut )?icon"|<svg|data:image/i.test(html),ctx+' excluded assets');
 const imageSources=[...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match=>match[1]);
 const logoSources=imageSources.filter(src=>/logo-careerviet\.png\?v=/.test(src));
 assert.equal(logoSources.length,2,ctx+' header/footer logo count');
 assert.ok(imageSources.every(src=>/logo-careerviet\.png\?v=|media\/[a-z-]+\.webp\?v=/.test(src)),ctx+' unexpected image asset');
 assert.ok(!/href=["']https?:\/\/(?:[^/]+\.)?careerviet\.vn\b/i.test(html),ctx+' prohibited source backlink');
 const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ');
 assert.ok(!/chưa kiểm chứng|tham khảo nguồn từ|placeholder|lorem ipsum|TODO|example\.com|file:\/\//i.test(visible),ctx+' internal text leak');
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){const schemas=JSON.parse(match[1]);schemas.forEach(schema=>assert.ok(schema['@type']));}
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));assert.equal(ids.size,[...html.matchAll(/\bid="([^"]+)"/g)].length,ctx+' duplicate IDs');
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=m[1];if(/^(https?:|mailto:|tel:)/.test(url))continue;
  const [target,fragment]=url.split('#');const normalized=target.split('?')[0];
  const local=normalized.startsWith('/')?path.join(root,'dist',normalized.slice(1)):path.resolve(path.dirname(pageFile),normalized);
  if(target)assert.ok(fs.existsSync(normalized.endsWith('/')?path.join(local,'index.html'):local),`${ctx} broken ${url}`);
  else if(fragment)assert.ok(ids.has(fragment),`${ctx} broken fragment ${url}`);
  links++;
 }
 for(const control of html.matchAll(/aria-controls="([^"]+)"/g))assert.ok(ids.has(control[1]),ctx+' invalid aria-controls');
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'.openai','hosting.json'),'utf8'));assert.equal(manifest.static.directory,'dist');
const mediaFiles=['location-workplaces.webp','industry-workplaces.webp','career-direction.webp','cv-preparation.webp','job-interview.webp','overtime-workspace.webp','career-collaboration.webp'];
const hashes={};for(const file of ['site.css','site.js','calculator.mjs','logo-careerviet.png','hero-home-career.jpg',...mediaFiles.map(file=>`media/${file}`)]){const source=fs.readFileSync(path.join(root,file));const built=fs.readFileSync(path.join(root,'dist/assets',file));assert.deepEqual(source,built,file+' source/build mismatch');hashes[file]=crypto.createHash('sha256').update(built).digest('hex');}
const assets=fs.readdirSync(path.join(root,'dist/assets'));assert.deepEqual(assets.sort(),['calculator.mjs','hero-home-career.jpg','logo-careerviet.png','media','site.css','site.js']);assert.equal(fs.readdirSync(path.join(root,'dist/assets/media')).length,7);assert.ok(!fs.existsSync(path.join(root,'dist/favicon.ico')));
const report={pages:pages.length,internalLinks:links,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,preview:config.preview,images:{uniqueAssets:9,usage:'Official CareerViet logo, supplied homepage hero and seven approved editorial images'},favicon:false,hashes};
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa','static-checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
