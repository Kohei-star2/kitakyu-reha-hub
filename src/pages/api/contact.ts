import type { APIRoute } from 'astro';

// このファイルだけはサーバーで動く（ほかのページは静的ファイル）
export const prerender = false;

/*
  お問い合わせ・参加申込フォームの受け口。
  攻撃や大量送信への対策を何重にもかけている。
    1. POST・JSON・10KB以下以外は即座に拒否
    2. 自サイト以外（Origin）からの送信を拒否
    3. 同じIPからの連続送信を制限（サーバー内メモリ。本命は Vercel Firewall のレート制限）
    4. 人間には見えない入力欄（ハニーポット）と、入力にかかった時間でボットを弾く
    5. Cloudflare Turnstile（人間かどうかの確認）をサーバー側で検証
    6. 入力値を厳しく検証し、メールは文字列のみで送る（HTML を使わない）
  必要な環境変数（Vercel の Settings → Environment Variables で設定）:
    TURNSTILE_SECRET_KEY, RESEND_API_KEY, CONTACT_TO
  公開してよい値（ビルド時に埋め込む）:
    PUBLIC_TURNSTILE_SITE_KEY
*/

const MAX_BYTES = 10_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 2 * 60 * 60 * 1000;
const KINDS = ['参加申込', '会について質問', '取材', '一緒に活動したい', 'その他'] as const;

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const fail = (status: number, message = '送信できませんでした。時間をおいてもう一度お試しください。') =>
  json(status, { ok: false, message });

// 改行・制御文字の除去（メールヘッダーへの差し込み防止）
const oneLine = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max + 1) : '';
const multiLine = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, max + 1) : '';

const EMAIL = /^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[A-Za-z]{2,}$/;

async function readLimited(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  return new TextDecoder().decode(buf);
}

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const form = new URLSearchParams({ secret, response: token });
  if (ip !== 'unknown') form.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  // 1. 形式チェック
  if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return fail(415);

  // 2. 自サイトからの送信か
  const origin = request.headers.get('origin');
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && new URL(origin).host === url.host;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) return fail(403);

  // 3. 連続送信の制限
  const ip = clientAddress || request.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return fail(429, '短い時間に何度も送信されています。しばらくしてからお試しください。');

  const raw = await readLimited(request);
  if (raw === null) return fail(413);

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400);
  }

  // 4. ボット対策（ハニーポットと入力時間）。ボットには成功したふりをして返す
  const startedAt = Number(body.startedAt);
  const elapsed = Date.now() - startedAt;
  if (oneLine(body.website, 200) !== '' || !Number.isFinite(startedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return json(200, { ok: true });
  }

  // 6. 入力値の検証
  const name = oneLine(body.name, 50);
  const email = oneLine(body.email, 254);
  const kind = oneLine(body.kind, 20);
  const job = oneLine(body.job, 50);
  const event = oneLine(body.event, 50);
  const message = multiLine(body.message, 2000);
  const errors: string[] = [];
  if (!name || name.length > 50) errors.push('お名前は50文字以内で入力してください。');
  if (!EMAIL.test(email) || email.length > 254) errors.push('メールアドレスを正しく入力してください。');
  if (!(KINDS as readonly string[]).includes(kind)) errors.push('お問い合わせの種類を選んでください。');
  if (job.length > 50) errors.push('職種は50文字以内で入力してください。');
  if (event.length > 50) errors.push('参加希望の回は50文字以内で入力してください。');
  if (!message || message.length > 2000) errors.push('内容は2000文字以内で入力してください。');
  if (/https?:\/\//i.test(message) && (message.match(/https?:\/\//gi) ?? []).length > 2) errors.push('URLは2つまでにしてください。');
  if (errors.length) return json(400, { ok: false, message: errors.join('\n') });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!secret || !apiKey || !to) return fail(503, 'フォームは準備中です。');

  // 5. 人間かどうかの確認
  const token = oneLine(body.token, 2048);
  if (!token || !(await verifyTurnstile(token, ip, secret))) {
    return fail(400, '確認に失敗しました。ページを読み込み直してからもう一度お試しください。');
  }

  // メール送信（本文はテキストのみ）
  const text = [
    `種類: ${kind}`,
    `お名前: ${name}`,
    `メール: ${email}`,
    job && `職種: ${job}`,
    event && `参加希望の回: ${event}`,
    '',
    message,
    '',
    '---',
    '北九州リハビリテーションハブ研究会 ウェブサイトのフォームから送信されました',
  ]
    .filter((l) => l !== '')
    .join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || '北九州リハビリテーションハブ研究会 <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `【${kind}】${name} さんから`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return fail(502);
  } catch {
    return fail(502);
  }

  return json(200, { ok: true });
};

// POST 以外はすべて拒否
export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
