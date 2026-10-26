export const uid=()=>globalThis.crypto.randomUUID();
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initialProject(){return {id:uid(),name:'Untitled project',description:'',category:'Hardware R&D',version:'V1',created:new Date().toISOString(),requirements:[],stages:[],bom:[],tests:[],decisions:[],revisions:[],messages:[],events:[]};}

export function parseCSV(text){
 if(typeof text!=='string'||text.length>2_000_000)throw Error('CSV must be smaller than 2 MB.');
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell.trim());cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('CSV contains an unclosed quotation mark.');row.push(cell.trim());if(row.some(Boolean))rows.push(row);
 if(rows.length<3)throw Error('CSV needs a header and at least two data rows.');
 const headers=rows.shift().map(h=>h.replace(/^\uFEFF/,''));
 if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw Error('Column names must be nonempty and unique.');
 if(rows.length>10000)throw Error('Up to 10,000 rows are supported. Export a smaller segment.');
 if(rows.some(r=>r.length!==headers.length))throw Error('Every CSV row must have the same number of columns.');
 return {headers,rows};
}
export function analyzeCSV(parsed,{x,y,unit='V',target='',tolerance=''}={}){
 const xi=parsed.headers.indexOf(x),yi=parsed.headers.indexOf(y);if(xi<0||yi<0||xi===yi)throw Error('Choose different columns for time and measurements.');
 const factor={V:1,mV:.001,A:1,mA:.001,C:1}[unit];if(factor===undefined)throw Error('Unsupported unit.');
 const points=parsed.rows.map((r,i)=>{if(r[xi]===''||r[yi]===''||!Number.isFinite(Number(r[xi]))||!Number.isFinite(Number(r[yi])))throw Error(`Row ${i+2} has an empty or nonnumeric value. No data was silently discarded.`);return {x:Number(r[xi]),y:Number(r[yi])*factor};});
 if(points.some((p,i)=>i&&p.x<=points[i-1].x))throw Error('Time must increase strictly. Check the time column for duplicate samples.');
 const values=points.map(p=>p.y),mean=values.reduce((a,b)=>a+b,0)/values.length,min=Math.min(...values),max=Math.max(...values),std=Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/values.length);
 const hasTarget=target!==''&&target!==null&&target!==undefined,hasTolerance=tolerance!==''&&tolerance!==null&&tolerance!==undefined;
 if(hasTarget&&!Number.isFinite(Number(target)))throw Error('Target must be a finite number.');
 if(hasTolerance&&(!Number.isFinite(Number(tolerance))||Number(tolerance)<0))throw Error('Tolerance must be a nonnegative number.');
 const t=hasTarget?Number(target):null,tol=hasTolerance?Number(tolerance):null;
 let failed=null,status='insufficient';if(t!==null&&tol!==null){failed=values.filter(v=>Math.abs(v-t)>tol+1e-12).length;status=failed?'fail':'pass';}
 return {points,mean,min,max,std,peakToPeak:max-min,count:points.length,unit:unit==='mV'?'V':unit==='mA'?'A':unit,target:t,tolerance:tol,failed,status};
}
export function validateProject(p){
 if(!p||typeof p!=='object'||typeof p.id!=='string'||typeof p.name!=='string'||!p.name.trim()||p.name.length>200||typeof p.version!=='string')throw Error('Invalid project file.');
 const groups={requirements:['id','name','value','status'],stages:['id','name','kind','voltage','part','note'],bom:['id','ref','part','value','qty','source'],tests:['id','title','version','date','conditions','notes'],decisions:['id','title','detail','date'],revisions:['id','version','date'],messages:['role','text'],events:['id','title','detail','date','type']};
 for(const [key,fields]of Object.entries(groups)){if(!Array.isArray(p[key])||p[key].length>500)throw Error(`Invalid project field: ${key}`);for(const item of p[key]){if(!item||fields.some(f=>typeof item[f]!=='string'))throw Error(`Invalid project record: ${key}`);}}
 for(const t of p.tests){if(t.analysis){const a=t.analysis;if(!Array.isArray(a.points)||a.points.length<2||a.points.length>10000||a.points.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.y))||!['mean','min','max','std','peakToPeak','count'].every(k=>Number.isFinite(a[k]))||!['pass','fail','insufficient'].includes(a.status))throw Error('Invalid test analysis format.');}}
 if(p.requirementDraft!=null){
  const d=p.requirementDraft;
  if(!d||typeof d.id!=='string'||typeof d.idea!=='string'||typeof d.summary!=='string'||d.idea.length>6000||d.summary.length>1500||!Array.isArray(d.rows)||!d.rows.length||d.rows.length>12||!Array.isArray(d.questions)||d.questions.length>8||d.questions.some(q=>typeof q!=='string'||q.length>700))throw Error('Invalid requirements draft in project backup.');
  for(const r of d.rows)if(!r||!['id','name','value','rationale','source_quote'].every(k=>typeof r[k]==='string')||r.name.length>120||r.value.length>500||r.rationale.length>700||r.source_quote.length>500||typeof r.include!=='boolean'||!['stated','missing','proposal'].includes(r.basis)||!['pending','confirmed'].includes(r.status))throw Error('Invalid draft row in project backup.');
 }
 for(const m of p.messages){if(m.moduleDraft){const fields={architecture:['name','kind','voltage','part','note'],bom:['ref','part','value','qty','source'],'test-plan':['title','detail'],analysis:['title','detail'],decision:['title','detail'],handoff:['title','detail'],summary:['title','detail']}[m.module];const d=m.moduleDraft;if(!fields||typeof d.summary!=='string'||!Array.isArray(d.items)||!d.items.length||d.items.length>12||d.items.some(r=>!r||fields.some(k=>typeof r[k]!=='string'||r[k].length>8000)))throw Error('Invalid module draft in project backup.');if(m.sources&&(!Array.isArray(m.sources)||m.sources.some(x=>!x||typeof x.url!=='string'||typeof x.title!=='string')))throw Error('Invalid draft sources.');}}
 return p;
}
export function schematicSVG(project){const e=escapeHTML;const width=Math.max(900,project.stages.length*245+80);return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 300"><rect width="100%" height="100%" fill="#f8faf9"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#16816b"/></marker></defs><text x="35" y="35" font-size="16" fill="#183e36" font-family="sans-serif">${e(project.name)} · ${e(project.version)} · Architecture draft</text>${project.stages.map((s,i)=>{let x=35+i*245;return `<rect x="${x}" y="85" width="200" height="135" rx="12" fill="white" stroke="#b9d4ca"/><text x="${x+18}" y="112" font-family="monospace" font-size="11" fill="#16816b">${e(s.kind)}</text><text x="${x+18}" y="146" font-family="sans-serif" font-size="18" fill="#183e36">${e(s.name)}</text><text x="${x+18}" y="177" font-family="monospace" font-size="15" fill="#16816b">${e(s.voltage||'?')} V</text><text x="${x+18}" y="202" font-family="sans-serif" font-size="11" fill="#63716b">${e(s.part)}</text>${i<project.stages.length-1?`<path d="M${x+200} 150h40" stroke="#16816b" fill="none" marker-end="url(#arrow)"/>`:''}`;}).join('')}<text x="35" y="265" font-family="sans-serif" font-size="12" fill="#63716b">Architecture draft only. No pin-level connections or ERC; not ready for fabrication.</text></svg>`;}
