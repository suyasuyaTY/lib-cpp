// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from "@astrojs/markdown-remark";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// サイドバーに表示するカテゴリ（src/content/docs の直下のフォルダ）と並び順
const categories = [
	['data-structure', 'データ構造'],
	['graph', 'グラフ'],
	['flow', 'フロー'],
	['dp', '動的計画法'],
	['offline-algorithm', 'オフラインアルゴリズム'],
	['math', '数学'],
	['linear-algebra', '線形代数'],
	['polynomial', '多項式'],
	['fps', '形式的冪級数'],
	['bitwise', 'ビット演算'],
	['string', '文字列'],
	['geometry', '幾何'],
	['hashing', 'ハッシュ'],
	['game', 'ゲーム'],
	['cpp', 'C++'],
];

// https://astro.build/config
export default defineConfig({
	site: 'https://suyasuyaty.github.io',
	base: '/lib-cpp',
	markdown: {
		processor: unified({
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
		}),
  	},
	integrations: [
		starlight({
			title: "suyasuyaty's library",
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/suyasuyaTY/lib-cpp' }],
			locales: { root: { label: '日本語', lang: 'ja' } },
			customCss: ['katex/dist/katex.min.css', './src/styles/math.css'],
			components: {
				PageTitle: './src/components/PageTitle.astro',
				MarkdownContent: './src/components/MarkdownContent.astro',
			},
			sidebar: [
				{ label: 'タグ一覧', link: '/#tags' },
				{ label: '問題', collapsed: true, items: [{ autogenerate: { directory: 'problems' } }] },
				...categories.map(([directory, label]) => ({
					label,
					collapsed: true,
					items: [{ autogenerate: { directory } }],
				})),
			],
		}),
	],
});
