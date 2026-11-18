(() => {
  const form = document.getElementById('form');
  if (!form) return;
  const startedAt = Date.now();
  const status = document.getElementById('status');
  const submit = document.getElementById('submit');
  const message = document.getElementById('message');
  const count = document.getElementById('count');
  const kind = document.getElementById('kind');
  const eventField = form.querySelector('[data-for="参加申込"]');

  // URL の ?kind=参加申込&event=第3回 を入力欄に反映
  const q = new URLSearchParams(location.search);
  const qk = q.get('kind');
  if (qk && [...kind.options].some((o) => o.value === qk)) kind.value = qk;
  const qe = q.get('event');
  if (qe) document.getElementById('event').value = qe.slice(0, 50);
  const toggleEvent = () => { eventField.hidden = kind.value !== '参加申込'; };
  kind.addEventListener('change', toggleEvent);
  toggleEvent();

  message.addEventListener('input', () => { count.textContent = String(message.value.length); });

  let sending = false;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (sending) return;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const token = data['cf-turnstile-response'] || '';
    delete data['cf-turnstile-response'];
    sending = true;
    submit.disabled = true;
    status.className = 'form-status';
    status.textContent = '送信しています…';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token, startedAt }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        form.reset();
        count.textContent = '0';
        status.className = 'form-status ok';
        status.textContent = '送信しました。お問い合わせありがとうございます。数日以内にお返事します。';
        submit.hidden = true;
        return;
      }
      status.className = 'form-status ng';
      status.textContent = body.message || '送信できませんでした。時間をおいてもう一度お試しください。';
    } catch {
      status.className = 'form-status ng';
      status.textContent = '通信できませんでした。電波のよい場所でもう一度お試しください。';
    } finally {
      sending = false;
      submit.disabled = false;
      if (window.turnstile) window.turnstile.reset();
    }
  });
})();
