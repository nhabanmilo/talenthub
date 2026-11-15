/** Shared UI/API rules. Company verification and ownership are checked separately. */
export function canCloseJob(status: string) {
  return status === 'active' || status === 'pending';
}

export function canModerateJob(current: string, next: string) {
  if (next === 'active' || next === 'rejected') return current === 'pending';
  if (next === 'hidden') return current === 'active';
  if (next === 'closed') return canCloseJob(current);
  return false;
}
