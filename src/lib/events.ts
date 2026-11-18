import { getCollection, type CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;

const today = () => new Date().toISOString().slice(0, 10);

function isPast(e: EventEntry): boolean {
  if (e.data.status === '終了') return true;
  const d = e.data.date;
  if (!d) return false;
  return d.length === 10 ? d < today() : d < today().slice(0, 7);
}

/** これからの会（回数の若い順） */
export async function getUpcoming(): Promise<EventEntry[]> {
  const all = await getCollection('events');
  return all.filter((e) => !isPast(e)).sort((a, b) => a.data.number - b.data.number);
}

/** 開催済みの会（新しい順） */
export async function getPast(): Promise<EventEntry[]> {
  const all = await getCollection('events');
  return all.filter(isPast).sort((a, b) => b.data.number - a.data.number);
}

const WD = ['日', '月', '火', '水', '木', '金', '土'];

/** 2027年1月23日 土曜日 / 2027年1月 / 空 */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!d) return `${y}年${m}月`;
  const w = WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日 ${w}曜日`;
}

/** 日時の表示。決まっていない部分は調整中と出す */
export function whenLabel(e: EventEntry): string {
  const { date, time } = e.data;
  if (!date) return '日程調整中';
  if (date.length < 10) return `${formatDate(date)} 日程調整中`;
  return time ? `${formatDate(date)} ${time}` : formatDate(date);
}

/** 大きく見せる日付 */
export function bigDate(iso?: string) {
  if (!iso) return { md: '近日', wd: '日程調整中' };
  const [y, m, d] = iso.split('-').map(Number);
  if (!d) return { md: `${m}月`, wd: '日程調整中' };
  return { md: `${m}.${d}`, wd: `${WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}曜日` };
}

export const questionLabel = (e: EventEntry) => e.data.question ?? 'テーマは近日公開';
