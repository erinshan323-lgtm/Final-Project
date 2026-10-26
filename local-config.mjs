import {readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {randomUUID,randomBytes,timingSafeEqual} from 'node:crypto';
import path from 'node:path';

export async function createLocalConfig(root,baseEnv){
 const file=path.join(root,'.local-ai.json');
 const token=randomBytes(32).toString('hex');
 let stored=null;
 try{stored=validate(JSON.parse(await readFile(file,'utf8')));}catch(error){if(error.code!=='ENOENT')throw Error('Local AI configuration is invalid. Repair or remove .local-ai.json before starting.');}
 function environment(){
  if(!stored)return {...baseEnv};
  const env={...baseEnv,PORTKEY_API_KEY:'',OPENAI_API_KEY:''};
  if(stored.enabled){env[stored.provider==='Portkey'?'PORTKEY_API_KEY':'OPENAI_API_KEY']=stored.key;env.OPENAI_MODEL=stored.model;}
  return env;
 }
 function status(){const env=environment(),course=Boolean(env.PORTKEY_API_KEY);return {provider:course?'Portkey':stored?.provider||'OpenAI',model:course?'gpt-6-luna':stored?.model||env.OPENAI_MODEL||'gpt-6-astra',configured:Boolean(env.PORTKEY_API_KEY||env.OPENAI_API_KEY),source:stored?'Local settings':'Environment',token};}
 async function persist(next){const temp=file+'.'+randomUUID()+'.tmp';try{await writeFile(temp,JSON.stringify(next),{mode:0o600,flag:'wx'});await rename(temp,file);stored=next;}finally{await unlink(temp).catch(()=>{});}}
 async function handle(request){
  const json=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store'}});
  if(request.method==='GET')return json(status());
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const supplied=request.headers.get('x-configuration-token')||'';
  if(request.headers.get('origin')!==new URL(request.url).origin||!request.headers.get('content-type')?.startsWith('application/json')||Buffer.byteLength(supplied)!==Buffer.byteLength(token)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(token)))return json({error:'Configuration request rejected. Refresh the page and retry.'},403);
  try{
   const raw=await request.text();if(raw.length>6000)return json({error:'Configuration is too large.'},413);
   const input=JSON.parse(raw);
   if(input.action==='disconnect'){await persist({enabled:false,provider:status().provider,model:status().model,key:''});return json(status());}
   const current=status(),env=environment();
   const key=typeof input.key==='string'&&input.key.trim()?input.key.trim():input.provider===current.provider?(env[input.provider==='Portkey'?'PORTKEY_API_KEY':'OPENAI_API_KEY']||''):'';
   const next=validate({enabled:true,provider:input.provider,model:input.provider==='Portkey'?'gpt-6-luna':input.model,key});
   await persist(next);return json(status());
  }catch(error){return json({error:error.code?'Could not save local configuration. Check folder permissions.':error.message==='Invalid configuration.'?'Choose a supported provider, enter a valid API key and model.':'Invalid configuration request.'},400);}
 }
 return {environment,status,handle};
}
function validate(c){if(!c||typeof c.enabled!=='boolean'||!['Portkey','OpenAI'].includes(c.provider)||typeof c.model!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,119}$/.test(c.model)||typeof c.key!=='string'||(c.enabled&&(!c.key||c.key.length>4096||/\s/.test(c.key))))throw Error('Invalid configuration.');return {enabled:c.enabled,provider:c.provider,model:c.provider==='Portkey'?'gpt-6-luna':c.model,key:c.enabled?c.key:''};}
