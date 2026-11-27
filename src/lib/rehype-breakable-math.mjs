// 1 行のディスプレイ数式を、幅が足りないときに関係記号（= や \leftrightarrow など）の後ろで折り返せるようにする rehype プラグイン.
//
// KaTeX はディスプレイ数式を折り返さないが、インライン数式はトップレベルの関係記号・二項演算子の後ろで折り返す.
// そこで remark-math が作る `pre > code.math-display` のうち、環境（\begin）や改行（\\）を含まないものを
// `div.math-breakable > code.math-inline` に置き換え、先頭に \displaystyle を付ける.
// rehype-katex より前に置くこと.

const SKIP = /\\begin|\\\\|\\tag|\\label|\\notag|\\nonumber/;

const classesOf = (node) => {
	const c = node.properties?.className;
	return Array.isArray(c) ? c : typeof c === 'string' ? c.split(' ') : [];
};

const textOf = (node) =>
	node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');

export default function rehypeBreakableMath() {
	return (tree) => {
		const visit = (node) => {
			if (!node.children) return;
			node.children = node.children.map((child) => {
				if (child.type !== 'element' || child.tagName !== 'pre') return child;
				const code = child.children.find((c) => c.type === 'element' && c.tagName === 'code');
				if (!code || !classesOf(code).includes('math-display')) return child;
				const tex = textOf(code);
				if (SKIP.test(tex)) return child;
				return {
					type: 'element',
					tagName: 'div',
					properties: { className: ['math-breakable'] },
					children: [
						{
							type: 'element',
							tagName: 'code',
							properties: { className: ['math-inline'] },
							children: [{ type: 'text', value: `\\displaystyle ${tex}` }],
						},
					],
				};
			});
			node.children.forEach(visit);
		};
		visit(tree);
	};
}
