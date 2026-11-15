import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { canCloseJob, canModerateJob } from '../lib/recruitment-workflow.ts';
const database = new DatabaseSync(':memory:');
for (const file of readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort()) database.exec(readFileSync('drizzle/' + file, 'utf8'));
const stmt = (sql, ...args) => ({run: async () => database.prepare(sql).run(...args)});
const one = async (sql, ...args) => database.prepare(sql).get(...args);
const check = (ok, message, status=400) => { if (!ok) throw Object.assign(new Error(message), {status}); };
const str = (s, max=500) => typeof s === 'string' ? s.trim().slice(0,max) : '';
const required = (s, label, max) => { const v=str(s,max); check(v, label); return v; };
let user = {id:'admin',role:'admin',name:'Test admin'};
const now=()=>new Date().toISOString(), id=()=>crypto.randomUUID();
const notice=(uid,content)=>stmt('INSERT INTO notifications(id,user_id,content,created_at) VALUES(?,?,?,?)',id(),uid,content,now());
const auditStmt=(u,action,ref,reason='')=>stmt('INSERT INTO audit_log(id,actor_id,action,reference_id,reason,created_at) VALUES(?,?,?,?,?,?)',id(),u.id,action,ref,reason,now());
globalThis.__adminTest = {stmt,one,check,str,required,now,id,notice,auditStmt,canCloseJob,canModerateJob,
 all:async(sql,...args)=>database.prepare(sql).all(...args), current:async()=>user,
 env:{}, sampleJobs:[], categories:[], specialties:[], normalizeLocation:s=>s, googleReady:()=>false, remindSavedJobs:async()=>0, getChatGPTUser:async()=>null,
 today:()=> '2026-11-15', requireUser:async()=>user, csrf:()=>{}, deliverSafely:async()=>{},
 response:(data,status=200)=>Response.json(data,{status}), error:e=>Response.json({error:e.message},{status:e.status||500}),
 db:()=>({batch:async ops=>{database.exec('BEGIN');try {const results=[];for(const op of ops)results.push(await op.run());database.exec('COMMIT');return results;}catch(e){database.exec('ROLLBACK');throw e;}}})};
let source=readFileSync('app/api/data/route.ts','utf8').replace(/import\s*\{([\s\S]*?)\}\s*from\s*'[^']+';/g,(_,names)=>'const {'+names.replace(/\bas\b/g,':')+'} = globalThis.__adminTest;');
const {POST,GET}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
for(const [uid,role] of [['admin','admin'],['admin2','admin'],['employer','employer'],['candidate','candidate']]) await stmt('INSERT INTO users(id,email,password_hash,role,name,created_at) VALUES(?,?,?,?,?,?)',uid,uid+'@example.test','disabled',role,uid,now()).run();
await stmt("INSERT INTO companies(id,owner_id,name,status) VALUES('company','employer','Test company','pending')").run();
await stmt("INSERT INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,created_at,updated_at) VALUES('job','company','employer','IT','Test','Test','Test','Test','Hanoi',1,2,'2099-01-01',?,?)",now(),now()).run();
const post=async(body,status=200)=>{const res=await POST(new Request('https://test.invalid/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(res.status,status,JSON.stringify(await res.json()));};
for(const role of ['candidate','employer']) {user={id:role,role};for(const action of ['moderate','company-status','user-status','category'])await post({action,id:'job',status:'active'},403);}
user={id:'admin',role:'admin'};
await post({action:'moderate',id:'job',status:'active'},409);
await post({action:'company-status',id:'company',status:'verified'});
const count=()=>database.prepare('SELECT count(*) n FROM notifications').get().n;
let before=count();await post({action:'company-status',id:'company',status:'verified'});assert.equal(count(),before);
await post({action:'moderate',id:'job',status:'active'});
await post({action:'moderate',id:'job',status:'active'},409);
await post({action:'moderate',id:'job',status:'hidden'},400);
await post({action:'moderate',id:'job',status:'hidden',reason:'Test reason'});
assert.equal((await one("SELECT status FROM jobs WHERE id='job'")).status,'hidden');
await post({action:'user-status',id:'admin',status:'locked'},400);
await post({action:'user-status',id:'admin2',status:'locked'},403);
await stmt("INSERT INTO sessions(token,user_id,expires_at) VALUES('test-token','candidate',9999999999999)").run();
await post({action:'user-status',id:'candidate',status:'locked'});
assert.equal((await one("SELECT count(*) n FROM sessions WHERE user_id='candidate'")).n,0);
await post({action:'category',name:'Inactive test',is_active:false});
assert.equal((await one("SELECT is_active FROM categories WHERE name='Inactive test'")).is_active,0);
assert.equal((await one("SELECT count(*) n FROM audit_log WHERE action='job:hidden' AND reason='Test reason'")).n,1);
// Candidate and employer ownership/availability checks use the same isolated database.
await stmt("UPDATE users SET status='active' WHERE id='candidate'").run();
for (const [uid,role] of [['candidate2','candidate'],['employer2','employer']]) await stmt('INSERT INTO users(id,email,password_hash,role,name,created_at) VALUES(?,?,?,?,?,?)',uid,uid+'@example.test','disabled',role,uid,now()).run();
for (const uid of ['candidate','candidate2']) await stmt('INSERT INTO resumes(id,candidate_id,title,object_key,content_type,size,created_at) VALUES(?,?,?,?,?,?,?)','cv-'+uid,uid,'CV','test/'+uid,'application/pdf',100,now()).run();
user={id:'candidate',role:'candidate'};
await post({action:'save',id:'job',saved:true},409);
await stmt("UPDATE jobs SET status='active' WHERE id='job'").run();
await post({action:'save',id:'job',saved:true});
await post({action:'apply',id:'job',resume_id:'cv-candidate2'},400);
await post({action:'apply',id:'job',resume_id:'cv-candidate'});
await post({action:'apply',id:'job',resume_id:'cv-candidate'},409);
const application=await one("SELECT id FROM applications WHERE candidate_id='candidate'");
await post({action:'application-status',id:application.id,status:'hired'},403);
await post({action:'resume-delete',id:'cv-candidate2'},404);
await stmt("UPDATE jobs SET status='closed' WHERE id='job'").run();
await post({action:'save',id:'job',saved:false});
assert.equal((await one("SELECT count(*) n FROM saved_jobs WHERE candidate_id='candidate'")).n,0);
await post({action:'apply',id:'job',resume_id:'cv-candidate'},409);
user={id:'employer2',role:'employer'};
await post({action:'application-status',id:application.id,status:'hired'},403);
await post({action:'job-close',id:'job'},403);
user={id:'employer',role:'employer'};
await post({action:'application-status',id:application.id,status:'shortlisted',note:'internal'});
before=count();
await post({action:'application-status',id:application.id,status:'shortlisted',note:'updated internal'});
assert.equal(count(),before);
await stmt("UPDATE companies SET status='blocked' WHERE id='company'").run();
await post({action:'application-status',id:application.id,status:'hired'},403);
await post({action:'job-save',title:'Blocked attempt'},400);
await stmt("INSERT INTO setup(id,value) VALUES('demo_seeded','test')").run();
const get=async(query='')=>{const res=await GET(new Request('https://test.invalid/api/data'+query));const data=await res.json();assert.equal(res.status,200,JSON.stringify(data));return data;};
user={id:'candidate',role:'candidate'};
let data=await get();assert.equal(data.applications.length,1);assert.equal('note' in data.applications[0],false);assert.equal(data.users.length,0);assert.equal(data.managedJobs.length,0);
user={id:'candidate2',role:'candidate'};data=await get();assert.equal(data.applications.length,0);assert.equal(data.resumes.length,1);assert.equal(data.resumes[0].id,'cv-candidate2');
user={id:'employer2',role:'employer'};data=await get();assert.equal(data.applications.length,0);assert.equal(data.managedJobs.length,0);
user=null;data=await get('?saved=1');assert.equal(data.jobs.length,0);assert.equal(data.user,null);
await stmt("UPDATE companies SET status='verified' WHERE id='company'").run();
await stmt("UPDATE jobs SET status='active' WHERE id='job'").run();
data=await get('?page=999.5');assert.equal(data.page,1);assert.equal(data.jobs.length,1);
user={id:'admin',role:'admin'};data=await get();assert(data.users.length>0);assert(data.audit.length>0);
for (const role of ['candidate', 'employer', 'admin']) {
  user={id:role,role};
  await post({action:'account-name',id:'candidate2',name:'Updated '+role});
  assert.equal((await one('SELECT name FROM users WHERE id=?',role)).name,'Updated '+role);
  assert.equal((await one("SELECT name FROM users WHERE id='candidate2'")).name,'candidate2');
  await post({action:'account-name',name:'   '},400);
}
delete globalThis.__adminTest;database.close();
console.log('PASS role-specific reads: no internal notes for candidate, no cross-account applications/CVs/jobs, guest saved route and page clamping.');
console.log('PASS candidate/employer: private CV ownership, duplicate applications, closed jobs, unsave unavailable jobs, cross-employer access, blocked company and unchanged-status notifications.');
console.log('PASS admin API: role checks, verified-company approval, invalid transitions, mandatory reasons, duplicate suppression, protected admins, session revocation, category flag and audit. In-memory database only; auth transport mocked.');

