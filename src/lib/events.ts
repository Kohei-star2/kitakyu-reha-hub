import { getCollection, type CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;

const today = () => new Date().toISOString().slice(0, 10);

/** 開催日が今日以降で、終了になっていない会（日付の近い順） */
export async function getUpcoming(): Promise<EventEntry[]> {
  const all = await getCollection('events');
  return all
    .filter((e) => e.data.status !== '終了' && e.data.date >= today())
    .sort((a, b) => a.data.date.localeCompare(b.data.date));
}

/** 開催済みの会（新しい順） */
export async function getPast(): Promise<EventEntry[]> {
  const all = await getCollection('events');
  return all
    .filter((e) => e.data.status === '終了' || e.data.date < today())
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const w = ['日', '月', '火', '水', '木', '金', '土'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日（${w}）`;
}
