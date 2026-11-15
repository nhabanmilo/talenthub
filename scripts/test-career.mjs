import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {salary2026,grossFromNet,cleanCV,recommend} from '../lib/career.ts';
assert.equal(salary2026(15500000,0,0).tax,0);
assert.equal(salary2026(25500000,0,0).tax,500000);
assert.equal(salary2026(45500000,0,0).tax,2500000);
assert.equal(salary2026(75500000,0,0).tax,8500000);
assert.equal(salary2026(115500000,0,0).tax,20500000);
assert.equal(salary2026(125500000,0,0).tax,24000000);
assert.equal(salary2026(21700000,0,1).tax,0);
for(const gross of [0,10000000,25000000,50000000,200000000]) {const ins=Math.min(gross,2625000);assert(Math.abs(grossFromNet(salary2026(gross,ins,0).net,ins,0).gross-gross)<=1);}
assert.throws(()=>salary2026(100,200,0));assert.throws(()=>salary2026(100,0,1.5));assert.throws(()=>grossFromNet(NaN,0,0));
const content={template:'professional',name:'Ứng viên Nguyễn',email:'test@example.test',phone:'',location:'Hà Nội',headline:'Kế toán',summary:'',experience:'',education:'',skills:'Excel',projects:''};
assert.equal(cleanCV(content).name,content.name);assert.throws(()=>cleanCV({...content,template:'bad'}));assert.throws(()=>cleanCV({...content,skills:'x'.repeat(6001)}));
const rec=recommend([{id:'a',category:'Kế toán',title:'Kế toán Excel',salary_max:20,location:'Hà Nội',created_at:'2026-09-01'},{id:'b',category:'Khác',title:'Công việc',created_at:'2026-09-02'}],{category:'Kế toán',skills:'excel, Excel',salary_min:15});assert.deepEqual(rec.map(j=>j.id),['a']);assert.equal(rec[0].reasons.length,3);assert.equal(recommend(rec,{}).length,0);
const base=process.env.TEST_BASE_URL || 'http://localhost:3001';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local tests only');
async function call(path,body,cookie='',origin=base) {const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});const text=await r.text();let data;try{data=JSON.parse(text);}catch{data={error:text};}return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0] || cookie};}
async function account(role) {const r=await call('/api/auth',{action:'register',role,name:'Career Test',email:randomUUID()+'@example.test',password:'Career-'+randomUUID()});assert.equal(r.status,200);return r;}
const a=await account('candidate'),b=await account('candidate'),e=await account('employer');
assert.equal((await call('/api/career')).status,401);assert.equal((await call('/api/career',null,e.cookie)).status,403);
let r=await call('/api/career',{action:'save',title:'CV thử nghiệm',content},a.cookie);assert.equal(r.status,200);const saved=r.data;
assert.equal((await call('/api/career',null,b.cookie)).data.documents.length,0);
assert.equal((await call('/api/career',{action:'save',...saved,title:'Stolen',content},b.cookie)).status,409);
assert.equal((await call('/api/career',{action:'delete',id:saved.id},b.cookie)).status,404);
assert.equal((await call('/api/career',{action:'save',...saved,title:'Updated',content},a.cookie)).status,200);
assert.equal((await call('/api/career',{action:'save',...saved,title:'Stale',content},a.cookie)).status,409);
assert.equal((await call('/api/career',{action:'preferences',salary_min:-1},a.cookie)).status,400);
assert.equal((await call('/api/career',{action:'preferences',category:'Công nghệ thông tin',skills:'React',salary_min:20},a.cookie)).status,200);
assert.equal((await call('/api/career',null,a.cookie)).data.preferences.salary_min,20);
assert.equal((await call('/api/career',{action:'delete',id:saved.id},a.cookie,'https://evil.example')).status,403);
assert.equal((await call('/api/career',{action:'delete',id:saved.id},a.cookie)).status,200);
assert.equal((await call('/api/data')).data.jobs.every(j=>j.is_demo===0),true);
assert.equal((await call('/api/data?demo=1')).data.jobs.every(j=>j.is_demo===1),true);
const config=await call('/api/data');if(!config.data.googleReady)assert.equal((await call('/api/auth/google/start',{role:'candidate'})).status,503);
assert.equal((await call('/api/auth/google/start',{role:'candidate'},'','https://evil.example')).status,403);
console.log('PASS salary boundaries, inverse calculations, CV validation, recommendation ranking, private CV CRUD, stale writes, preferences, real/demo separation and Google configuration guards.');
