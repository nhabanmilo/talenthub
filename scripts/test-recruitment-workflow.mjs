import assert from 'node:assert/strict';
import { canCloseJob, canModerateJob } from '../lib/recruitment-workflow.ts';

const states = ['draft', 'pending', 'active', 'rejected', 'closed', 'expired', 'hidden'];
for (const state of states) {
  assert.equal(canCloseJob(state), ['pending', 'active'].includes(state), `close ${state}`);
  for (const next of states) {
    const allowed = (state === 'pending' && ['active', 'rejected', 'closed'].includes(next))
      || (state === 'active' && ['hidden', 'closed'].includes(next));
    assert.equal(canModerateJob(state, next), allowed, `${state} -> ${next}`);
  }
}
assert.equal(canModerateJob('unknown', 'active'), false);
assert.equal(canCloseJob('unknown'), false);
console.log('PASS: 49 moderation transitions, close rules and unknown states. No database changes.');
