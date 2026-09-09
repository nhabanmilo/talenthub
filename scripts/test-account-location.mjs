import assert from 'node:assert/strict';
import { provinces, locations, normalizeLocation, locationAliases } from '../lib/locations.ts';
assert.equal(provinces.length,34);
assert.equal(new Set(provinces).size,34);
assert.equal(locations.length,35);
assert.equal(normalizeLocation('Bình Dương'),'TP. Hồ Chí Minh');
assert(locationAliases('TP. Hồ Chí Minh').includes('Bà Rịa - Vũng Tàu'));
const base='http://localhost:3001';
const password='Test-'+crypto.randomUUID();
async function call(path, body, cookie='', method=body?'POST':'GET', origin=base) {
 const res=await fetch(base+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body && !(body instanceof FormData)?{'Content-Type':'application/json'}:{})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
 return res;
}
async function candidate() {
 const res=await call('/api/auth',{action:'register',name:'Avatar test',email:crypto.randomUUID()+'@example.test',password,role:'candidate'});
 assert.equal(res.status,200);return res.headers.get('set-cookie').split(';')[0];
}
const a=await candidate(), b=await candidate();
assert.equal((await call('/api/avatar')).status,401);
assert.equal((await call('/api/avatar',null,a)).status,404);
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jxXcAAAAASUVORK5CYII=','base64');
const form=(bytes,type)=>{const f=new FormData();f.append('file',new Blob([bytes],{type}),'avatar');return f;};
assert.equal((await call('/api/avatar',form(png,'image/png'),a,'POST','https://evil.example')).status,403);
assert.equal((await call('/api/avatar',form('<svg onload="alert(1)"></svg>','image/svg+xml'),a)).status,400);
assert.equal((await call('/api/avatar',form(png,'image/png'),a)).status,200);
const image=await call('/api/avatar',null,a);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.equal(image.headers.get('cache-control'),'private, no-store');assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);
assert.equal((await call('/api/avatar',null,b)).status,404);
assert.equal((await call('/api/avatar',null,a,'DELETE')).status,200);
assert.equal((await call('/api/avatar',null,a)).status,404);
const old=await (await call('/api/data?location='+encodeURIComponent('Bình Dương'))).json();
const current=await (await call('/api/data?location='+encodeURIComponent('TP. Hồ Chí Minh'))).json();
assert(current.total>0);assert.equal(old.total,current.total);assert.deepEqual(old.jobs.map(j=>j.id),current.jobs.map(j=>j.id));
assert.equal((await call('/api/auth',{action:'logout'},a)).status,200);
assert.equal((await call('/api/avatar',null,a)).status,401);
console.log('PASS: 34 provinces, legacy filters, avatar upload/isolation/delete/CSRF, logout invalidates session.');
