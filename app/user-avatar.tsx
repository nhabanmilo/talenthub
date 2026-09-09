'use client';
import { useState } from 'react';
export default function UserAvatar({ name, revision, large = false }: { name: string; revision: number; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={large ? 'account-avatar account-avatar-large' : 'account-avatar'}>
    {failed ? name.trim().slice(0,1).toUpperCase() : <img src={'/api/avatar?v=' + revision} alt={'Ảnh đại diện của ' + name} onError={() => setFailed(true)} />}
  </span>;
}
