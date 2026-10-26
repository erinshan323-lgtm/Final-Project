import {readFile,mkdir,writeFile,rm,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const names={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/core.js':'core.js','/style.css':'style.css'};
const assets={};for(const [route,file]of Object.entries(names))assets[route]={body:await readFile(path.join(root,'public',file),'utf8'),type:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8'};
const api=await readFile(path.join(root,'api.mjs'),'utf8');
const code=api+'\nconst assets='+JSON.stringify(assets)+';\nexport default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith("/api/"))return api(request,env);const asset=assets[url.pathname];if(!asset)return new Response("Not found",{status:404});return new Response(asset.body,{headers:{"content-type":asset.type,"x-content-type-options":"nosniff"}});}};\n';
await rm(path.join(root,'dist'),{recursive:true,force:true});await mkdir(path.join(root,'dist/server'),{recursive:true});await mkdir(path.join(root,'dist/.openai'),{recursive:true});await writeFile(path.join(root,'dist/server/index.js'),code);try{await copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));}catch(error){if(error.code!=='ENOENT')throw error;}console.log('Built self-contained Worker and browser assets.');
