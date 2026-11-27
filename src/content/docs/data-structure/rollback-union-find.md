---
title: "Rollback 付き Union-Find"
tags: [union-find, offline]
sidebar:
  order: 18
---
## 1. 概要

[Union-Find](../../data-structure/union-find/) に、直前の `merge` を取り消す `undo` と、記録した状態まで戻す `rollback` を付けたもの.
辺の追加しかできない Union-Find で、分割統治などと組み合わせて「辺を追加して、あとで取り除く」処理を行える.

| 操作 | 計算量 |
| --- | --- |
| 辺の追加（`merge`） | $O(\log N)$ |
| 連結判定・リーダー・サイズ（`same`, `leader`, `size`） | $O(\log N)$ |
| 直前の merge の取り消し（`undo`） | $O(1)$ |
| 状態の記録（`snapshot`, `get_state`） | $O(1)$ |
| 記録した状態に戻す（`rollback`） | $O(\text{取り消す merge の回数})$ |

取り消せるのは**最後に行った merge から順に**だけである（スタック的な取り消し）.

## 2. 前提知識

- [Union-Find](../../data-structure/union-find/): union by size と経路圧縮、根付き森による表現.

## 3. Rollback 付き Union-Find

### 3.1. 経路圧縮をしない理由

経路圧縮は、find で通った頂点の親をすべて書き換える. 1 回の find で書き換わる箇所が多く、それをすべて記録して戻すと、償却計算量の議論が成り立たなくなる（取り消すと、ならした分の「貯金」も消えてしまう）.

そこで**経路圧縮はせず、union by size だけ**を使う. すると find は配列を書き換えず、配列が変わるのは merge のときだけになる.

### 3.2. union by size で $O(\log N)$ になる理由

サイズの小さい木の根を大きい木の根の子にすると、頂点 $v$ の深さが 1 増えるたびに、$v$ を含む木のサイズは 2 倍以上になる.
サイズは $N$ を超えないので、どの頂点の深さも $\log_2 N$ 以下である.
よって根を求める操作は $O(\log N)$ で、merge・same・leader・size も $O(\log N)$ になる.

この評価は**最悪計算量**であり、償却ではない. そのため取り消しをはさんでも計算量は崩れない.

### 3.3. undo の仕組み

各頂点 $v$ の値 `parent_or_size[v]`（根なら $-(\text{サイズ})$、そうでなければ親）を考える.
`merge(a, b)` で $a, b$ の根 $x, y$ を求めて $y$ を $x$ の子にするとき、変わるのは

- `parent_or_size[x]`: $x$ のサイズが増える
- `parent_or_size[y]`: $y$ の親が $x$ になる

の 2 か所だけである. そこで merge のたびに、書き換える前の組 `(x, parent_or_size[x])` と `(y, parent_or_size[y])` を履歴スタックに積む.
`undo` では履歴から 2 個取り出して書き戻せば、直前の merge の前の状態に戻る.

:::note[主張 3.1]
merge を行った順と逆順に undo すると、配列は各 merge の直前の状態に正確に戻る.
:::

<details>
<summary>証明</summary>

経路圧縮をしないので、配列を書き換えるのは merge だけで、1 回の merge は記録した 2 か所以外を書き換えない.
最後の merge を取り消すとき、その 2 か所を記録した値に戻せば、その merge の直前の配列に一致する.
これを繰り返せば、帰納的にどの時点の状態にも戻れる. $\square$

</details>

$a, b$ がすでに連結なときも、何も変えないが履歴には同じく 2 個積む（$x = y$ なので同じ値を 2 回積む）.
こうすると「merge 1 回 = 履歴 2 個」が常に成り立ち、`undo` 1 回が `merge` 1 回にちょうど対応する.

### 3.4. snapshot と rollback

状態を「これまでに行った（取り消していない）merge の回数」$=$ 履歴の長さ $/ 2$ で表す（`get_state`）.

- `snapshot()`: 現在の状態を 1 つ記録する.
- `rollback(state)`: 状態が `state` になるまで `undo` を繰り返す. 引数を省略すると `snapshot` で記録した状態に戻す.

`rollback` の計算量は取り消す merge の回数に比例する. 各 merge は高々 1 回しか取り消されないので、全体では merge の回数で抑えられる.

:::tip
分割統治で使うときは、再帰に入る前に `get_state()` を覚えておき、再帰から戻ったら `rollback(その値)` とすれば、`snapshot` を使わずに入れ子にできる.
:::

## 4. 参考資料

- [RollbackつきUnion Find - Nyaan's Library](https://nyaannyaan.github.io/library/data-structure/rollback-union-find.hpp.html)（履歴に 2 か所を積む実装と `undo` / `snapshot` / `rollback` のインターフェース）
- [Union-Find の計算量上界 - AtCoder Algorithm Lectures](https://info.atcoder.jp/entry/algorithm_lectures/unionfind_complexity)（union by size と経路圧縮の計算量）
- [DSU - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/dsu.html)（インターフェース）

## 5. コード

- `rollback_dsu(n)`: $n$ 頂点、辺なしで初期化する. $O(n)$.
- `merge(a, b)`: 辺 $(a, b)$ を追加し、新しいリーダーを返す. すでに連結でも 1 回の merge として履歴に記録する. $O(\log n)$.
- `same(a, b)`: $a, b$ が連結かを返す. $O(\log n)$.
- `leader(a)`: $a$ を含む連結成分の根を返す. $O(\log n)$.
- `size(a)`: $a$ を含む連結成分の頂点数を返す. $O(\log n)$.
- `undo()`: 直前の merge を取り消す. 取り消していない merge があること. $O(1)$.
- `get_state()`: 現在の状態（取り消していない merge の回数）を返す. $O(1)$.
- `snapshot()`: 現在の状態を記録する. $O(1)$.
- `rollback(state)`: 状態が `state` になるまで undo する. `0 <= state <= get_state()` であること. 省略すると `snapshot` で記録した状態に戻す. $O(\text{取り消す回数})$.

```cpp title="rollback_dsu.cpp"
struct rollback_dsu {
 public:
  rollback_dsu() : _n(0) {}

  // n 頂点、辺なしで初期化する. O(n)
  explicit rollback_dsu(int n) : _n(n), parent_or_size(n, -1), inner_snap(0) {}

  // a と b を連結にし、新しいリーダーを返す. すでに連結でも 1 回の操作として記録する. O(log n)
  int merge(int a, int b) {
    assert(0 <= a && a < _n);
    assert(0 <= b && b < _n);
    int x = leader(a), y = leader(b);
    // 書き換わりうる 2 か所を、書き換える前に記録する
    history.emplace_back(x, parent_or_size[x]);
    history.emplace_back(y, parent_or_size[y]);
    if (x == y) return x;
    if (-parent_or_size[x] < -parent_or_size[y]) swap(x, y);
    parent_or_size[x] += parent_or_size[y];
    parent_or_size[y] = x;
    return x;
  }

  // a と b が連結か. O(log n)
  bool same(int a, int b) {
    assert(0 <= a && a < _n);
    assert(0 <= b && b < _n);
    return leader(a) == leader(b);
  }

  // a を含む連結成分のリーダー（根）. 経路圧縮はしない. O(log n)
  int leader(int a) const {
    assert(0 <= a && a < _n);
    while (parent_or_size[a] >= 0) a = parent_or_size[a];
    return a;
  }

  // a を含む連結成分のサイズ. O(log n)
  int size(int a) const {
    return -parent_or_size[leader(a)];
  }

  // 直前の merge を 1 回取り消す. O(1)
  void undo() {
    assert(!history.empty());
    for (int t = 0; t < 2; t++) {
      auto [v, old] = history.back();
      history.pop_back();
      parent_or_size[v] = old;
    }
  }

  // これまでの merge の回数（取り消した分は除く）. O(1)
  int get_state() const { return history.size() / 2; }

  // 現在の状態を記録する. O(1)
  void snapshot() { inner_snap = get_state(); }

  // merge の回数が state になるまで undo する. state を省略すると snapshot した状態に戻す.
  // O(取り消す merge の回数)
  void rollback(int state = -1) {
    if (state == -1) state = inner_snap;
    assert(0 <= state && state <= get_state());
    while (get_state() > state) undo();
  }

 private:
  int _n;
  // 根なら -(成分のサイズ)、そうでなければ親
  vector<int> parent_or_size;
  // (書き換えた位置, 書き換える前の値). merge 1 回につき 2 個積む
  vector<pair<int, int>> history;
  int inner_snap;
};
```

使用例（連結成分数も一緒に戻す）:

```cpp
rollback_dsu d(n);
int comp = n;
int state = d.get_state(), saved = comp;
if (!d.same(a, b)) comp--;
d.merge(a, b);
// ...
d.rollback(state);  // merge を取り消す
comp = saved;
```
