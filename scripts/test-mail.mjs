import assert from 'node:assert/strict';
import { sendResend } from '../lib/mail-provider.ts';
const envelope = {
  id: 'test-event',
  to: 'test@example.test',
  subject: 'Lời mời phỏng vấn',
  text: 'Nội dung kiểm tra',
};
const config = {
  key: 'synthetic-test-key',
  from: 'TalentHub <test@example.test>',
};
let seen = [];
const success = async (url, options) => {
  seen.push({ url, options });
  return Response.json({ id: 'email-test' });
};
let result = await sendResend(envelope, config, success);
assert.equal(result.accepted, true);
assert.equal(result.providerId, 'email-test');
assert.equal(seen[0].url, 'https://api.resend.com/emails');
assert.equal(JSON.parse(seen[0].options.body).text, envelope.text);
await sendResend(envelope, config, success);
assert.equal(
  seen[0].options.headers['Idempotency-Key'],
  seen[1].options.headers['Idempotency-Key'],
);
for (const status of [400, 401, 429, 500]) {
  result = await sendResend(envelope, config, async () =>
    Response.json({ name: 'provider_error' }, { status }),
  );
  assert.equal(result.accepted, false);
  assert.equal(result.providerId, null);
}
result = await sendResend(envelope, config, async () => {
  throw new Error('Transport ' + config.key);
});
assert.equal(result.accepted, false);
assert(!result.error.includes(config.key));
result = await sendResend(
  envelope,
  config,
  async () => new Response('invalid json'),
);
assert.equal(result.accepted, false);
result = await sendResend(envelope, config, async () => Response.json({}));
assert.equal(result.accepted, false);
console.log(
  'PASS Resend transport: request shape, stable idempotency, HTTP errors, timeout/network uncertainty and malformed responses. No real email sent.',
);
