import test from 'node:test';
import assert from 'node:assert/strict';
import {api,validateModuleDraft} from '../api.mjs';
const block={name:'Sensor',kind:'SENSOR',voltage:'',part:'TBD',note:'Supply and interface need confirmation.'};
test('module drafts reject invalid component fields and never produce measurements',()=>{
 assert.equal(validateModuleDraft({summary:'Draft',items:[block]},'architecture').items[0].voltage,'');
 assert.throws(()=>validateModuleDraft({summary:'Draft',items:[{...block,voltage:'unknown'}]},'architecture'));
 for(const qty of ['0','1.5','-2'])assert.throws(()=>validateModuleDraft({summary:'Draft',items:[{ref:'U1',part:'TBD',value:'Sensor',qty,source:''}]},'bom'));
 assert.throws(()=>validateModuleDraft({summary:'Draft',items:[{ref:'U1',part:'TBD',value:'Sensor',qty:'1',source:'javascript:alert(1)'}]},'bom'));
 assert.throws(()=>validateModuleDraft({summary:'Draft',items:[{title:'Plan',detail:''}]},'test-plan'));
});
test('live connection uses provider output and reports actual identity, usage and failures',async()=>{
 const previous=globalThis.fetch;let fail=false;
 try{globalThis.fetch=async()=>fail?new Response('',{status:401}):Response.json({id:'provider-response',model:'provider-model',status:'completed',output:[{content:[{type:'output_text',text:'Connection test received.'}]}],usage:{input_tokens:20,output_tokens:5}});
 const request=()=>new Request('http://localhost/api/connection-test',{method:'POST',body:JSON.stringify({message:'Connection test'})});
 const good=await (await api(request(),{PORTKEY_API_KEY:'test'})).json();assert.equal(good.responseId,'provider-response');assert.equal(good.returnedModel,'provider-model');assert.equal(good.model,'gpt-6-luna');assert.equal(good.usage.output_tokens,5);
 fail=true;const bad=await api(request(),{PORTKEY_API_KEY:'test'});assert.equal(bad.status,502);assert.equal((await bad.json()).responseId,undefined);
 }finally{globalThis.fetch=previous;}
});
test('module endpoint refuses empty analysis and rejects truncated drafts',async()=>{
 const request=(module)=>new Request('http://localhost/api/draft',{method:'POST',body:JSON.stringify({message:'Draft a proposal',module,context:{}})});
 assert.equal((await api(request('analysis'),{PORTKEY_API_KEY:'test'})).status,400);
 assert.equal((await api(request('unknown'),{PORTKEY_API_KEY:'test'})).status,400);
 const previous=globalThis.fetch;
 try{globalThis.fetch=async()=>Response.json({status:'incomplete',output:[{content:[{type:'output_text',text:JSON.stringify({summary:'Draft',items:[block]})}]}]});assert.equal((await api(request('architecture'),{PORTKEY_API_KEY:'test'})).status,502);}finally{globalThis.fetch=previous;}
});
