import type { CollectionEntry } from 'astro:content';

/** ページの確認状態（frontmatter の `status`） */
export const STATUSES = ['verified', 'unverified'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_INFO: Record<Status, { icon: string; label: string }> = {
	verified: { icon: '✅', label: '確認済み' },
	unverified: { icon: '⚠️', label: '未確認' },
};

/** トップページか（src/content/docs/index.mdx の id は空文字） */
export const isTopPage = (doc: CollectionEntry<'docs'>) => doc.id === '' || doc.id === 'index';

/** 状態を表示するページか（トップページと問題ページの書き方は除く） */
export const hasStatus = (doc: CollectionEntry<'docs'>) => !isTopPage(doc) && doc.id !== 'problems';

export const statusIcon = (doc: CollectionEntry<'docs'>) => (hasStatus(doc) ? STATUS_INFO[doc.data.status].icon : '');
