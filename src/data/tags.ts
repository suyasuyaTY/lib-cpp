// frontmatter の `tags` に書けるタグの一覧。
// キーは URL に使う英語のスラッグ、値は表示名。ここにないタグを書くとビルドエラーになる。
export const TAG_LABELS = {
	// 区間・列
	'range-query': '区間クエリ',
	'point-update': '一点更新',
	'range-update': '区間更新',
	static: '静的な列',
	monoid: 'モノイド',
	'inverse-required': '逆元が必要',
	'sliding-window': 'スライド窓',
	'monotonic-stack': '単調スタック',
	interval: '区間の管理',
	'2d': '二次元',
	persistent: '永続',
	sqrt: '平方分割',
	offline: 'オフライン',
	// 木・グラフ
	tree: '木',
	'path-query': 'パスクエリ',
	'subtree-query': '部分木クエリ',
	'union-find': 'Union-Find',
	potential: 'ポテンシャル',
	'shortest-path': '最短経路',
	'min-cut': '最小カット',
	doubling: 'ダブリング',
	matroid: 'マトロイド',
	// DP・最適化
	'dp-optimization': 'DP 高速化',
	'bit-dp': 'bit DP',
	convexity: '凸性',
	greedy: '貪欲',
	'binary-search': '二分探索',
	'brute-force': '全探索',
	// 数学
	counting: '数え上げ',
	'number-theory': '整数論',
	modular: 'mod 演算',
	convolution: '畳み込み',
	xor: 'XOR',
	precision: '誤差対策',
	// 文字列・その他
	'string-search': '文字列検索',
	hashing: 'ハッシュ',
	randomized: '乱択',
} as const;

export type Tag = keyof typeof TAG_LABELS;
export const TAGS = Object.keys(TAG_LABELS) as [Tag, ...Tag[]];
