import { getCollection, type CollectionEntry } from 'astro:content';
import { TAG_LABELS, type Tag } from '../data/tags';

type Doc = CollectionEntry<'docs'>;

export interface TagIndex {
	/** ページ id -> 実際に付くタグ（手で付けたタグ + uses で参照したページのタグ） */
	tagsOf: Map<string, Tag[]>;
	/** ライブラリページ id -> そのページを uses で参照しているページ */
	usedBy: Map<string, Doc[]>;
	/** タグ -> そのタグが付いたページ */
	pagesOf: Map<Tag, Doc[]>;
	byId: Map<string, Doc>;
}

let cache: Promise<TagIndex> | undefined;

export function getTagIndex(): Promise<TagIndex> {
	cache ??= build();
	return cache;
}

async function build(): Promise<TagIndex> {
	const docs = await getCollection('docs');
	const byId = new Map(docs.map((d) => [d.id, d]));
	const tagsOf = new Map<string, Tag[]>();
	const usedBy = new Map<string, Doc[]>();
	const pagesOf = new Map<Tag, Doc[]>();

	for (const doc of docs) {
		const tags = new Set<Tag>(doc.data.tags);
		for (const ref of doc.data.uses) {
			const lib = byId.get(ref.id);
			if (!lib) continue;
			lib.data.tags.forEach((t) => tags.add(t));
			if (!usedBy.has(lib.id)) usedBy.set(lib.id, []);
			usedBy.get(lib.id)!.push(doc);
		}
		const sorted = [...tags].sort(byLabel);
		tagsOf.set(doc.id, sorted);
		for (const t of sorted) {
			if (!pagesOf.has(t)) pagesOf.set(t, []);
			pagesOf.get(t)!.push(doc);
		}
	}
	for (const list of [...usedBy.values(), ...pagesOf.values()]) {
		list.sort((a, b) => a.id.localeCompare(b.id));
	}
	return { tagsOf, usedBy, pagesOf, byId };
}

const order = Object.keys(TAG_LABELS);
const byLabel = (a: Tag, b: Tag) => order.indexOf(a) - order.indexOf(b);

export const tagLabel = (t: Tag) => TAG_LABELS[t];
export const tagHref = (t: Tag) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/tags/${t}/`;
export const docHref = (id: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${id}/`;

/** サイドバーのグループ名（ページ id の先頭ディレクトリ） */
export const CATEGORY_LABELS: Record<string, string> = {
	'data-structure': 'データ構造',
	graph: 'グラフ',
	flow: 'フロー',
	dp: '動的計画法',
	'offline-algorithm': 'オフラインアルゴリズム',
	math: '数学',
	'linear-algebra': '線形代数',
	polynomial: '多項式',
	fps: '形式的冪級数',
	bitwise: 'ビット演算',
	string: '文字列',
	geometry: '幾何',
	hashing: 'ハッシュ',
	game: 'ゲーム',
	cpp: 'C++',
	problems: '問題',
};
export const categoryOf = (id: string) => CATEGORY_LABELS[id.split('/')[0]] ?? id.split('/')[0];
