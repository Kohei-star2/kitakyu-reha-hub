import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';


// 開催情報と開催報告は、src/content/events/ に1回1ファイルのMarkdownで追加する
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    number: z.number(),                // 第何回か
    title: z.string(),                 // 例: 第1回 本質観取の会
    question: z.string().optional(),   // 問い（テーマ）。未定なら書かない
    date: z.string().optional(),       // YYYY-MM-DD。日にち未定なら YYYY-MM、未定なら書かない
    time: z.string().optional(),       // 例: 14:00-16:30
    format: z.enum(['対面', 'オンライン', '対面＋オンライン']).optional(),
    place: z.string().optional(),
    capacity: z.number().optional(),
    fee: z.string().optional(),
    applyUrl: z.string().regex(/^https:\/\/[^\s"'<>]+$/, '申込URLは https:// で始まる必要があります').optional(),
    status: z.enum(['準備中', '募集中', '満席', '終了']),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { events };
