# 北九州リハビリテーションハブ 公式サイト

Astro で作った静的サイトです。Vercel で `kitakyu-reha-hub.vercel.app` として公開する想定です。

## ローカルで確認する

```bash
npm install
npm run dev     # http://localhost:4321
```

## よく行う更新

### 開催情報を追加する
`src/content/events/` に Markdown ファイルを1つ追加します（例: `2027-01-23.md`）。

```markdown
---
title: 第1回 本質観取の会
question: 「連携」とは何か
date: "2027-01-23"
time: "14:00〜16:30"
format: 対面            # 対面 / オンライン / 対面＋オンライン
place: 〇〇市民センター 会議室
capacity: 12
fee: 500円
applyUrl: "https://forms.gle/..."   # 申込フォームのURL
status: 募集中          # 募集中 / 満席 / 終了
tags: [連携]
---
```

- 開催日が過ぎた会、または `status: 終了` の会は自動で「開催報告」に移ります。
- 開催後は本文（`---` の下）に報告を書き足してください。書き方は `sample-00.md` を参考に。
- サイトはビルド時点の日付で振り分けるので、開催日を過ぎたら一度デプロイし直してください（Vercel なら push するだけ）。

### サンプルを消す
`src/content/events/sample-00.md` と `sample-01.md` はサンプルです。公開前に削除または書き換えてください。

### フォーム・SNS・代表者情報
`src/site.config.ts` を書き換えます（問い合わせフォームURL、メール、Instagram / X / LINE）。

### 配色
`src/styles/global.css` の先頭（`:root`）で色を管理しています。メインは空色 `#3ba9d9`、サブはミント `#5cc6a7` です。

## Vercel で公開する

1. このフォルダを GitHub のリポジトリに push する
2. https://vercel.com で「Add New → Project」から、そのリポジトリを選ぶ
3. Framework は「Astro」が自動で選ばれる。そのまま Deploy
4. Project 名を `kitakyu-reha-hub` にすると `kitakyu-reha-hub.vercel.app` になる（空いていれば）

※ Vercel の無料（Hobby）プランは個人・非商用向けです。団体サイトで使えるか、公開前に利用規約を確認してください。
