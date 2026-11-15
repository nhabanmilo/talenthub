import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
const database=new DatabaseSync(':memory:');
for(const file of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())database.exec(readFileSync('drizzle/'+file,'utf8'));
let logged=null,deleted=[],sessions=[],requests=0;
const sha=async s=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))).toString('hex');
const stmt=(sql,...args)=>({first:async()=>database.prepare(sql).get(...args),run:async()=>database.prepare(sql).run(...args)});
globalThis.__googleTest={googleConfig:()=>({clientId:'fake-client',secret:'fake-secret',origin:'https://talenthub.example'}),googleReady:()=>true,safeGooglePicture:v=>typeof v==='string' && v.startsWith('https://lh3.googleusercontent.com/')?v:'',current:async()=>logged,sha,same:(a,b)=>a===b,stmt,one:async(sql,...args)=>database.prepare(sql).get(...args),db:()=>({batch:async ops=>{for(const op of ops)await op.run();}}),id:()=>crypto.randomUUID(),now:()=>new Date().toISOString(),session:async(_req,user)=>{sessions.push(user);return new Response(null,{headers:{'Set-Cookie':'th_session=synthetic; HttpOnly; Secure'}});},check:(v,m)=>{if(!v)throw new Error(m);},files:()=>({delete:async key=>deleted.push(key)})};
const source=readFileSync('app/api/auth/google/callback/route.ts','utf8').replace(/^import[\s\S]*?;\r?\n/gm,'');
const code='const {'+Object.keys(globalThis.__googleTest).join(',')+'}=globalThis.__googleTest;\n'+stripTypeScriptTypes(source);
const {GET}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
let info={sub:'google-user-1',email:'google@example.test',email_verified:true,name:'Google User',picture:'https://lh3.googleusercontent.com/photo'};
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{requests++;if(url==='https://oauth2.googleapis.com/token'){assert.equal(new URLSearchParams(options.body).get('code_verifier'),'verifier');return Response.json({access_token:'synthetic'});}assert.equal(url,'https://openidconnect.googleapis.com/v1/userinfo');return Response.json(info);};
async function state(link=null,role='candidate') {const value=crypto.randomUUID();await stmt('INSERT INTO oauth_states VALUES(?,?,?,?,?)',await sha(value),'verifier',link,role,Date.now()+600000).run();return value;}
const req=(state,cookie=state)=>new Request('https://talenthub.example/api/auth/google/callback?code=fake&state='+state,{headers:{Cookie:'th_google_state='+cookie}});
let s=await state(),r=await GET(req(s,'mismatch'));assert.equal(r.headers.get('location'),'/?google=failed');assert.equal(requests,0);
r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=success');assert.equal(sessions.at(-1).role,'candidate');const owner=sessions.at(-1);
const n=requests;r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=failed');assert.equal(requests,n);
// Existing password accounts are never silently linked based on matching email.
database.prepare('INSERT INTO users(id,email,password_hash,role,status,name,created_at) VALUES(?,?,?,?,?,?,?)').run('password-owner','password@example.test','disabled','candidate','active','Password owner','2026-09-23');
info={...info,sub:'google-user-2',email:'password@example.test'};s=await state();r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=link-required');
logged={id:'password-owner',email:'password@example.test',role:'candidate',status:'active',name:'Password owner'};s=await state(logged.id);r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=success');assert(deleted.includes('avatars/password-owner/profile'));
// A different logged-in account cannot claim an existing Google identity.
logged=owner;s=await state(owner.id);r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=already-linked');
logged=null;info={...info,sub:'google-new',email:'new@example.test',email_verified:false};s=await state();r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=failed');
info={...info,email_verified:true};s=await state(null,'employer');r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=success');assert.equal(sessions.at(-1).role,'employer');
database.prepare("UPDATE users SET status='locked' WHERE id=?").run(sessions.at(-1).id);s=await state();r=await GET(req(s));assert.equal(r.headers.get('location'),'/?google=failed');
globalThis.fetch=originalFetch;delete globalThis.__googleTest;
console.log('PASS Google callback: state/cookie, one-time use, candidate/employer registration, verified email, explicit linking, identity ownership, locked users, avatar sync. Provider responses mocked; no real Google sign-in performed.');
