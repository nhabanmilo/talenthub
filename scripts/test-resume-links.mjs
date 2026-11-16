import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { resumeLink } from '../lib/resume-link.ts';
let user={id:'candidate',role:'candidate'}, record, inserted, employerAllowed=false;
const check=(ok,message,status=400)=>{if(!ok)throw Object.assign(new Error(message),{status});};
globalThis.__resumeTest={resumeLink,check,csrf:req=>check(req.headers.get('origin')==='https://test.invalid','CSRF',403),requireUser:async(_req,roles)=>{check(user,'Login',401);check(!roles||roles.includes(user.role),'Role',403);return user;},stmt:(_sql,...args)=>({run:async()=>{inserted=args;}}),id:()=> 'resume-id',now:()=> '2026-11-16',required:v=>{check(v,'Required');return v;},response:v=>Response.json(v),error:e=>Response.json({error:e.message},{status:e.status||400}),files:()=>undefined,one:async(sql)=>sql.startsWith('SELECT * FROM resumes')?record:employerAllowed?{id:'application'}:null};
async function load(path){const source=readFileSync(path,'utf8').replace(/import[\s\S]*?from\s*'[^']+';/g,'');return import('data:text/javascript;base64,'+Buffer.from('const {'+Object.keys(globalThis.__resumeTest).join(',')+'}=globalThis.__resumeTest;\n'+stripTypeScriptTypes(source)).toString('base64'));}
const {POST}=await load('app/api/resumes/route.ts');
const {GET}=await load('app/api/resumes/[id]/route.ts');
async function post(url,origin='https://test.invalid'){const body=new FormData();body.set('title','My CV');body.set('url',url);return POST(new Request('https://test.invalid/api/resumes',{method:'POST',headers:{origin},body}));}
for(const url of ['javascript:alert(1)','http://drive.google.com/file','https://user:password@example.com/cv','not-a-url'])assert.equal((await post(url)).status,400);
assert.equal((await post('https://drive.google.com/file/d/example/view')).status,200);assert.equal(inserted[4],'text/uri-list');
assert.equal((await post('https://example.com/cv','https://evil.invalid')).status,403);
record={candidate_id:'candidate',content_type:'text/uri-list',object_key:'https://drive.google.com/file/d/example/view'};
const get=()=>GET(new Request('https://test.invalid/api/resumes/r'),{params:Promise.resolve({id:'r'})});
assert.equal((await get()).status,302);
user={id:'other',role:'candidate'};assert.equal((await get()).status,403);
user={id:'employer',role:'employer'};assert.equal((await get()).status,403);employerAllowed=true;assert.equal((await get()).headers.get('location'),record.object_key);
assert.equal((await post('https://example.com/cv')).status,403);
record.content_type='application/pdf';assert.equal((await get()).status,404);
console.log('PASS: CV links, invalid URLs, CSRF, candidate ownership, employer access, missing legacy storage.');
