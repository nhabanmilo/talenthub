'use client';
import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
export default function PasswordRecovery({token, onLogin}:{token?:string;onLogin:()=>void}) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
  const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[done,setDone]=useState(false);
  async function submit(event:FormEvent) {
    event.preventDefault(); if(busy)return; setError('');setMessage('');
    if(token && password!==confirm){setError('Hai mật khẩu chưa trùng nhau.');return;}
    setBusy(true);
    try {
      const response=await fetch('/api/auth/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(token?{action:'reset',token,password}:{action:'request',email})});
      const result=await response.json() as {error?:string;message:string}; if(!response.ok)throw new Error(result.error||'Chưa thể thực hiện yêu cầu.');
      setMessage(result.message);setDone(true);setPassword('');setConfirm('');
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  return <form className="form-stack" onSubmit={submit}>
    {error&&<p className="feedback error" role="alert">{error}</p>}
    {message&&<p className="feedback" role="status">{message}</p>}
    {!done && <>{token ? <>
      <label className="field">Mật khẩu mới<div className="password-field"><input type={visible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} maxLength={128} autoComplete="new-password"/><button type="button" className="password-toggle" aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>
      <label className="field">Nhập lại mật khẩu<input type={visible?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8} maxLength={128} autoComplete="new-password"/></label>
    </> : <label className="field">Email đã đăng ký<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={150}/></label>}
      <button className="primary" disabled={busy}>{busy?'Đang xử lý…':token?'Đặt lại mật khẩu':'Gửi liên kết khôi phục'}</button>
    </>}
    <button type="button" className="text-button" disabled={busy} onClick={onLogin}>Quay lại đăng nhập</button>
  </form>;
}
