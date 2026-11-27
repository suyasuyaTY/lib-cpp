import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { TAGS } from './data/tags';
import { STATUSES } from './lib/status';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// 手で付けるタグ（src/data/tags.ts の一覧から選ぶ）
				tags: z.array(z.enum(TAGS)).default([]),
				// 確認状態: 読み直して内容を確認したら verified にする（src/lib/status.ts）
				status: z.enum(STATUSES).default('unverified'),
				// 問題ページ: 使ったライブラリのページ（例: data-structure/segment-tree）
				uses: z.array(reference('docs')).default([]),
				// 問題ページ: 問題と提出の URL
				problem: z.url().optional(),
				submission: z.url().optional(),
			}),
		}),
	}),
};
