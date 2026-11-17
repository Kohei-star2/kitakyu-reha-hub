import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 開催情報と開催報告は、src/content/events/ に1回1ファイルのMarkdownで追加する
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),            // 例: 第1回 本質観取の会
    question: z.string(),         // 問い（テーマ）例: 「連携」とは何か
    date: z.string(),             // 開催日 YYYY-MM-DD
    time: z.string(),             // 例: 14:00〜16:30
    format: z.enum(['対面', 'オンライン', '対面＋オンライン']),
    place: z.string(),            // 会場名やZoomなど
    capacity: z.number().optional(),
    fee: z.string().optional(),   // 例: 500円、無料
    applyUrl: z.string().optional(),
    status: z.enum(['募集中', '満席', '終了']),
    tags: z.array(z.string()).default([]),
    sample: z.boolean().default(false), // サンプルデータの印（本番前に削除）
  }),
});

export const collections = { events };
