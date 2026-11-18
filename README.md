# 北九州リハビリテーションハブ 公式サイト

Astro で作った静的サイトです。Vercel で `kitakyu-reha-hub.vercel.app` として公開する想定です。

## ローカルで確認する

```bash
npm install
npm run dev     # http://localhost:4321
```

## よく行う更新

### 開催情報を追加する
`src/content/events/` に Markdown ファイルを1つ追加します（例: `04.md`）。

```markdown
---
number: 4
title: 第4回 本質観取の会
question: 「連携」とは何か      # 未定なら書かない（テーマは近日公開と表示）
date: "2027-03-20"            # 日にち未定なら "2027-03"、まったく未定なら書かない
time: "14:00-16:30"
format: 対面                  # 対面 / オンライン / 対面＋オンライン
place: 〇〇市民センター 会議室
capacity: 12
fee: 500円
applyUrl: "https://forms.gle/..."
status: 募集中                # 準備中 / 募集中 / 満席 / 終了
tags: [連携]
---
```

- 開催後は `status: 終了` にして、本文（`---` の下）に報告を書きます。書き方は `01-good-rehabilitation.md` を参考に。
- 終了した会は自動で「開催報告」に並びます。

### SNS・代表者情報
`src/site.config.ts` を書き換えます（Instagram / X / LINE、代表者名など）。

### 配色
`src/styles/global.css` の先頭（`:root`）で色を管理しています。メインは空色 `#3ba9d9`、サブはミント `#5cc6a7` です。

## Vercel で公開する

1. このフォルダを GitHub のリポジトリに push する
2. https://vercel.com で「Add New → Project」から、そのリポジトリを選ぶ
3. Framework は「Astro」が自動で選ばれる。そのまま Deploy
4. Project 名を `kitakyu-reha-hub` にすると `kitakyu-reha-hub.vercel.app` になる（空いていれば）

※ Vercel の無料（Hobby）プランは個人・非商用向けです。団体サイトで使えるか、公開前に利用規約を確認してください。

## セキュリティ

- `vercel.json` でセキュリティヘッダーを付けています（CSP、HSTS、クリックジャッキング対策など）。
  - CSP により、このサイト以外のスクリプトは動きません。外部の埋め込み（Googleマップ、YouTube、アクセス解析など）を足すときは、CSP にそのドメインを追加する必要があります。
  - HTML の中に `<script>` や `style="..."` を直接書くと CSP でブロックされます。スクリプトは `public/js/`、見た目は `src/styles/global.css` に書いてください。
- 申込URL・フォームURL・SNSのURLは `https://` で始まるものしか表示されません。
- Dependabot が週1回、依存パッケージの更新を確認してプルリクエストを作ります。
- GitHub Actions がプッシュのたびにビルドと `npm audit`（重大な脆弱性）を確認します。

## お問い合わせ・参加申込フォーム

`/contact` のフォームは `/api/contact`（Vercel のサーバー関数）に送られ、メールで届きます。
動かすには Vercel の **Settings → Environment Variables** に次の4つを登録し、再デプロイします。

| 名前 | 中身 | 取得先 |
| --- | --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー（公開してよい） | Cloudflare → Turnstile |
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレットキー | Cloudflare → Turnstile |
| `RESEND_API_KEY` | メール送信用の API キー | resend.com |
| `CONTACT_TO` | 受け取るメールアドレス | Resend に登録したアドレス |

独自ドメインがない間は、送信元が `onboarding@resend.dev` になり、届け先は Resend に登録したメールアドレスだけです。

### 攻撃・大量送信への対策
- 静的ページは Vercel の CDN から配信され、Vercel の DDoS 対策が自動でかかります。
- フォームの受け口では次を行っています。
  - POST・JSON・10KB 以下以外は拒否
  - 自サイト以外からの送信を拒否
  - 同じ IP から10分に8回までに制限
  - ボット対策（見えない入力欄、入力時間のチェック）
  - Cloudflare Turnstile による人間確認
  - 入力値の厳しい検証
- 攻撃を受けているときは、Vercel の **Firewall → Attack Challenge Mode** をオンにすると、全訪問者に確認をかけて一時的に守れます。
