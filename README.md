# Algorithm Notes

AtCoder を中心とした競技プログラミングのアルゴリズムノート（Astro + Starlight）。

```
npm install
npm run dev
```

```
src/
├─ content/docs/
│  ├─ <分野>/<記事>.md     # 解説と C++ 実装（1 トピック 1 ページ）
│  └─ problems/            # 問題ページ（uses でライブラリを参照）
├─ data/tags.ts            # 使えるタグの一覧
├─ lib/tags.ts             # タグ継承・逆引きの計算
├─ components/             # Starlight の上書き（タグ表示・逆引き一覧）
└─ pages/tags/             # タグ一覧・タグ別ページ
public/labs/               # 対話型のデモページ
```

詳しい書き方は [AGENTS.md](AGENTS.md) を参照。
