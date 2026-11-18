// ビルド後に vercel.json のセキュリティヘッダーを Vercel の出力設定へ書き込む。
// （アダプターが作る .vercel/output では vercel.json の headers が使われないため）
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const outPath = '.vercel/output/config.json';
if (!existsSync(outPath)) {
  console.error('[add-headers] .vercel/output/config.json がありません');
  process.exit(1);
}
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const out = JSON.parse(readFileSync(outPath, 'utf8'));

const toRegex = (source) => '^' + source.replace(/\(\.\*\)/g, '(.*)') + '$';
const rules = vercel.headers.map(({ source, headers }) => ({
  src: toRegex(source),
  headers: Object.fromEntries(headers.map(({ key, value }) => [key.toLowerCase(), value])),
  continue: true,
}));

out.routes = [...rules, ...out.routes.filter((r) => !(r.continue && r.headers && rules.some((x) => x.src === r.src)))];
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`[add-headers] ${rules.length} 件のヘッダールールを追加しました`);
