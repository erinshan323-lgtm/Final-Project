import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {api} from './api.mjs';
import {createLocalConfig} from './local-config.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
export async function loadEnv(base,env=process.env){for(const p of [path.join(base,'.env'),path.join(base,'..','.env')]){try{const text=await readFile(p,'utf8');for(const line of text.split(/\r?\n/)){const m=line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);if(m&&env[m[1]]===undefined){let v=m[2];if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);else v=v.replace(/\s+#.*$/,'');if(v)env[m[1]]=v;}}}catch(e){if(e.code!=='ENOENT')throw e;}}return env;}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 await loadEnv(root);const port=Number(process.env.PORT||4317);const configuration=await createLocalConfig(root,process.env);
 http.createServer(async(req,res)=>{try{if(![`localhost:${port}`,`127.0.0.1:${port}`].includes(req.headers.host)){res.writeHead(403);res.end();return;}const url=new URL(req.url,`http://${req.headers.host}`);if(url.pathname.startsWith('/api/')){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>55000){res.writeHead(413);res.end();return;}chunks.push(chunk);}const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});const out=url.pathname==='/api/configuration'?await configuration.handle(request):url.pathname==='/api/status'?Response.json({...await (await api(request,configuration.environment())).json(),localConfiguration:true},{headers:{'cache-control':'no-store'}}):await api(request,configuration.environment());res.writeHead(out.status,Object.fromEntries(out.headers));res.end(await out.text());return;}
 const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/core.js':'core.js','/style.css':'style.css'};if(!files[url.pathname]){res.writeHead(404);res.end('Not found');return;}const file=files[url.pathname];res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');res.end(await readFile(path.join(root,'public',file)));}catch{res.writeHead(500);res.end('Server error');}}).listen(port,'127.0.0.1',()=>console.log(`Circuit Journal: http://127.0.0.1:${port}`));
}
