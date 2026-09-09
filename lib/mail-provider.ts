type Envelope = { id: string; to: string; subject: string; text: string };
type Config = { key: string; from: string };
export async function sendResend(
  message: Envelope,
  config: Config,
  fetcher: typeof fetch = fetch,
) {
  try {
    const res = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + config.key,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'talenthub-notification-' + message.id,
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
      signal: AbortSignal.timeout(7000),
    });
    const payload: any = await res.json().catch(() => ({}));
    if (res.ok && typeof payload.id === 'string' && payload.id.length > 0)
      return { accepted: true, providerId: payload.id, error: '' };
    return {
      accepted: false,
      providerId: null,
      error: `Resend HTTP ${res.status}${typeof payload.name === 'string' ? ': ' + payload.name.slice(0, 80) : ''}`,
    };
  } catch {
    return {
      accepted: false,
      providerId: null,
      error:
        'Không xác nhận được kết quả gửi. Sẽ thử lại với cùng khóa chống trùng.',
    };
  }
}
