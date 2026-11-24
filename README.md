# 北九州リハビリテーションハブ研究会 公式サイト

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
  - CSP により、このサイト以外のスクリプトは動きません。埋め込めるのは Google フォームだけです。Googleマップ、YouTube、アクセス解析などを足すときは、CSP にそのドメインを追加する必要があります。
  - HTML の中に `<script>` や `style="..."` を直接書くと CSP でブロックされます。スクリプトは `public/js/`、見た目は `src/styles/global.css` に書いてください。
- 申込URL・SNSのURLは `https://` で始まるもの、フォームは Google フォームの URL しか表示されません。
- Dependabot が週1回、依存パッケージの更新を確認してプルリクエストを作ります。
- GitHub Actions がプッシュのたびにビルドと `npm audit`（重大な脆弱性）を確認します。

## お問い合わせ・参加申込フォーム

Google フォームを埋め込んでいます。

1. Google フォームで質問を作る（例：お問い合わせの種類、お名前、メールアドレス、職種、参加希望の回、内容）
2. 右上の「送信」→ リンクのタブで URL をコピー（「URL を短縮」はオフ）
3. `src/site.config.ts` の `googleFormUrl` に貼る

回答は Google フォームの「回答」タブ、またはスプレッドシートで確認できます。
「設定」→「回答」→「メール通知を受け取る」をオンにすると、送信のたびにメールが届きます。

### 運用で守ること（2026年11月の診断より）
- フォームの埋め込みは、送信先が Google 以外に移れないよう制限（sandbox）をかけています。
- GitHub Actions は、使う部品のバージョンを固定（コミットの SHA を指定）しています。Dependabot が更新を提案してくれます。
- `.env` や鍵ファイルはコミットしないよう `.gitignore` に入れています。キーやパスワードはリポジトリに書かず、必要なら Vercel の環境変数に入れてください。
- 脆弱性の連絡先を `/.well-known/security.txt` に置いています。有効期限（Expires）が切れる前に1年ごとに更新してください。
- GitHub アカウントは2段階認証を有効にし、リポジトリの Settings → Code security で Dependabot alerts と Secret scanning をオンにしてください。
