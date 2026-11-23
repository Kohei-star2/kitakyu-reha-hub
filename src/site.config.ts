// サイト全体の設定。URLが決まったらここを書き換える
export const SITE = {
  name: '北九州リハビリテーションハブ研究会',
  tagline: '問い、語り、共に本質を探究する',
  shortName: 'Kitakyushu Rehab Hub',
  description:
    '北九州市の医療職が、顔の見える「ほんとうの連携」ができるように。哲学対話（本質観取の会）を開いている研究会です。',
  founded: '2026年',
  representatives: ['水津 文昭', '舩津 康平'],
  area: '北九州市',
  // お問い合わせ・参加申込の Google フォームの URL（フォームの「送信」→リンクでコピーしたもの）
  googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe-u3c5k5xkpqLcu-Pn6Oh7UWGZ-tOS2O7V-c5f0vSh8FWwYQ/viewform',
  sns: {
    instagram: '',
    x: '',
    line: '',
  },
};

/** https:// で始まる正しい URL だけを通す（javascript: などを防ぐ） */
export function safeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

/** Google フォームの URL だけを通し、埋め込み用（embedded=true）にする */
export function googleFormEmbedUrl(url: string): string | null {
  const safe = safeUrl(url);
  if (!safe) return null;
  const u = new URL(safe);
  const ok = (u.hostname === 'docs.google.com' && u.pathname.startsWith('/forms/')) || u.hostname === 'forms.gle';
  if (!ok) return null;
  if (u.hostname === 'forms.gle') return null; // 短縮URLは埋め込めないので docs.google.com の URL を使う
  u.pathname = u.pathname.replace(/\/(edit|viewform)?$/, '/viewform');
  u.searchParams.set('embedded', 'true');
  return u.href;
}
