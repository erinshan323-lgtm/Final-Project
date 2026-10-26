import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createLocalConfig} from '../local-config.mjs';
test('local configuration persists privately, overrides environment and never returns the key',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'circuit-config-'));
 try{
 const base={PORTKEY_API_KEY:'existing-test-key',OPENAI_API_KEY:'other-test-key'};
 let config=await createLocalConfig(root,base);
 const post=(data,token=config.status().token,origin='http://localhost:4320')=>config.handle(new Request('http://localhost:4320/api/configuration',{method:'POST',headers:{origin,'content-type':'application/json','x-configuration-token':token},body:JSON.stringify(data)}));
 assert.equal(config.status().provider,'Portkey');
 assert.equal((await post({provider:'OpenAI',model:'test-model',key:'new-test-key'},'bad')).status,403);
 assert.equal((await post({provider:'OpenAI',model:'test-model',key:'new-test-key'},config.status().token,'https://evil.example')).status,403);
 assert.equal((await post({provider:'OpenAI',model:'test-model',key:''})).status,400);
 const saved=await post({provider:'OpenAI',model:'test-model',key:'new-test-key'});assert.equal(saved.status,200);assert.ok(!(await saved.text()).includes('new-test-key'));
 assert.equal(config.environment().PORTKEY_API_KEY,'');assert.equal(config.environment().OPENAI_API_KEY,'new-test-key');assert.equal(config.environment().OPENAI_MODEL,'test-model');assert.equal(base.PORTKEY_API_KEY,'existing-test-key');
 assert.equal((await stat(path.join(root,'.local-ai.json'))).mode&0o777,0o600);
 config=await createLocalConfig(root,base);assert.equal(config.environment().OPENAI_API_KEY,'new-test-key');
 assert.equal((await post({provider:'OpenAI',model:'updated-model',key:''})).status,200);assert.equal(config.environment().OPENAI_API_KEY,'new-test-key');
 assert.equal((await post({provider:'OpenAI',model:'invalid model',key:'other'})).status,400);assert.equal(config.environment().OPENAI_MODEL,'updated-model');
 assert.equal((await post({action:'disconnect'})).status,200);assert.equal(config.status().configured,false);assert.ok(!(await readFile(path.join(root,'.local-ai.json'),'utf8')).includes('new-test-key'));
 config=await createLocalConfig(root,base);assert.equal(config.status().configured,false);
 }finally{await rm(root,{recursive:true,force:true});}
});
