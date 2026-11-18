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
  // 申込・問い合わせフォーム（Googleフォームなど）のURL。未設定なら '' のまま
  contactFormUrl: '',
  contactEmail: '',
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

/** メールアドレスとして妥当なものだけを通す */
export function safeEmail(email: string): string | null {
  return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email) ? email : null;
}
