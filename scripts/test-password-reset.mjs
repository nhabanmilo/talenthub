import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+f,'utf8'));
const stmt=(sql,...args)=>({first:async()=>db.prepare(sql).get(...args),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...args).changes)}})});
const one=async(sql,...args)=>db.prepare(sql).get(...args);
const messages=[];let configured=true;
const sha=async s=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))).toString('hex');
globalThis.__resetTest={one,stmt,sha,id:()=>crypto.randomUUID(),now:()=>new Date().toISOString(),passwordHash:async s=>'test-hash:'+s,
 check:(ok,msg,status=400)=>{if(!ok)throw Object.assign(new Error(msg),{status});},
 db:()=>({batch:async ops=>{db.exec('BEGIN');try{const out=[];for(const op of ops)out.push(await op.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}}),
 mailReady:()=>configured,mailConfig:()=>({url:'https://talenthub.example',key:'test',from:'test@example.test'}),sendResend:async m=>{messages.push(m);return {accepted:true};}};
const source=readFileSync('lib/password-reset.ts','utf8').replace(/import\s*\{([\s\S]*?)\}\s*from\s*'[^']+';/g,(_,names)=>'const {'+names+'}=globalThis.__resetTest;');
const {passwordRecovery}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
const req=new Request('https://talenthub.example/api/auth/password',{headers:{'cf-connecting-ip':'192.0.2.1'}});
await stmt("INSERT INTO users(id,email,password_hash,role,status,name,created_at) VALUES('user','user@example.test','old','candidate','active','User','2026-11-15')").run();
const unknown=await passwordRecovery(req,{action:'request',email:'absent@example.test'});
const known=await passwordRecovery(req,{action:'request',email:'user@example.test'});assert.deepEqual(unknown,known);assert.equal(messages.length,1);
await passwordRecovery(req,{action:'request',email:'user@example.test'});assert.equal(messages.length,1);
const token=messages[0].text.match(/reset-password=([a-f0-9]{64})/)[1];assert.notEqual((await one('SELECT token_hash FROM password_resets')).token_hash,token);
await stmt("INSERT INTO sessions VALUES('old-session','user',9999999999999)").run();
await passwordRecovery(req,{action:'reset',token,password:'new-password-123'});
assert.equal((await one("SELECT password_hash FROM users WHERE id='user'")).password_hash,'test-hash:new-password-123');assert.equal((await one('SELECT count(*) n FROM sessions')).n,0);
await assert.rejects(()=>passwordRecovery(req,{action:'reset',token,password:'different-password'}));
assert.equal((await one("SELECT password_hash FROM users WHERE id='user'")).password_hash,'test-hash:new-password-123');
const expired='a'.repeat(64);await stmt('INSERT INTO password_resets VALUES(?,?,?,NULL,?)',await sha(expired),'user',Date.now()-1,'now').run();await assert.rejects(()=>passwordRecovery(req,{action:'reset',token:expired,password:'new-password'}));
configured=false;await assert.rejects(()=>passwordRecovery(req,{action:'request',email:'user@example.test'}),e=>e.status===503);
configured=true;for(let i=0;i<21;i++){try{await passwordRecovery(req,{action:'request',email:'absent@example.test'});}catch(e){assert.equal(e.status,429);}}
await assert.rejects(()=>passwordRecovery(req,{action:'request',email:'absent@example.test'}),e=>e.status===429);
delete globalThis.__resetTest;db.close();console.log('PASS password recovery: generic responses, cooldown, hashed token, one-time use, expiry, session revocation, missing mail config and rate limit. In-memory; no email sent.');
