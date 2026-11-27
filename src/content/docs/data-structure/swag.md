---
title: "SWAG（Sliding Window Aggregation）"
tags: [sliding-window, monoid]
sidebar:
  order: 12
---
## 1. 概要

キューに入っている要素全体の積（集約値）を高速に求めるデータ構造.
モノイドであれば何でもよく、min / max / sum / gcd のほか、行列積やアフィン変換の合成のような**非可換な演算**でも使える.

| 操作 | 計算量 |
| --- | --- |
| 末尾に追加（`push`） | $O(1)$ |
| 先頭を削除（`pop`） | 償却 $O(1)$ |
| 全体の積（`all_prod`） | $O(1)$ |

区間の左端・右端がともに単調に動く「しゃくとり法」で、区間の積を取りながら進めたいときに使う.
演算が min / max なら [スライド最小値](../../data-structure/sliding-window-extrema/) でもよい.

## 2. 前提知識

- **モノイド**: 集合 $S$ と二項演算 $\cdot$ の組で、結合法則 $(a \cdot b) \cdot c = a \cdot (b \cdot c)$ と単位元 $e$（$a \cdot e = e \cdot a = a$）をもつもの. 交換法則は仮定しない.
- **スタック**: 末尾への追加と末尾からの削除が $O(1)$ でできる列.

## 3. SWAG

### 3.1. 2 つのスタックでキューを作る

キューの中身を $q_1, q_2, \dots, q_n$（$q_1$ が先頭）とし、これを前半 $q_1, \dots, q_k$ と後半 $q_{k+1}, \dots, q_n$ に分けて、2 つのスタックで持つ.

- **front**: 前半を、**先頭 $q_1$ がスタックの一番上**になるように持つ（底から $q_k, q_{k-1}, \dots, q_1$）. `pop` はここの一番上を取り除く.
- **back**: 後半を、**末尾 $q_n$ がスタックの一番上**になるように持つ（底から $q_{k+1}, \dots, q_n$）. `push` はここに積む.

`pop` しようとして front が空のときは、back の要素を上から順に（$q_n, q_{n-1}, \dots, q_{k+1}$ の順に）front に積み替える.
すると front の一番上は back の底にあった要素、つまり先頭の要素になり、上の形が保たれる.

### 3.2. 累積の持ち方

各スタックには、要素に加えて**キューの並び順で**掛けた累積を持たせる.
スタックは一番上でしか変化しないので、一番上を含む累積を持っておけば、追加・削除のたびに $O(1)$ で更新できる.

**front** の各位置には、その要素から front の底までをキューの順に掛けたもの、すなわち**右から左への累積**を持つ.
要素 $q_i$ の位置の累積は

$$
F_i = q_i \cdot q_{i+1} \cdots q_k
$$

であり、$q_i$ を積むときは一つ下の累積に $F_i = q_i \cdot F_{i+1}$ と**左から**掛ける.

**back** には、底から一番上までをキューの順に掛けたもの、すなわち**左から右への累積**

$$
B = q_{k+1} \cdot q_{k+2} \cdots q_n
$$

を持つ. $q_{n+1}$ を積むときは $B \leftarrow B \cdot q_{n+1}$ と**右から**掛ける.

すると、キュー全体の積は

$$
q_1 \cdot q_2 \cdots q_n = F_1 \cdot B
$$

で $O(1)$ で求まる. front の一番上の累積 $F_1$ が前半の積、$B$ が後半の積であり、どちらもキューの並び順を崩さずに掛けているので、**交換法則を使っていない**.

:::note[掛ける向きを間違えないこと]
front に積むときは新しい要素を左から、back に積むときは新しい要素を右から掛ける.
min や sum のような可換な演算では向きを間違えても答えが変わらないので、非可換な演算（行列積や文字列の連結など）でテストするとよい.
:::

back は一番上からしか取り出さず、取り出すのは積み替えでまとめて空にするときだけなので、back は各位置の累積を持たなくても全体の累積 $B$ と要素の列だけでよい.
逆に front は積み替えの後に要素そのものは使わないので、累積 $F_i$ だけ持てばよい.

### 3.3. 計算量

`push` と `all_prod` は $O(1)$ である. `pop` は積み替えが起きると $O(n)$ かかるが、各要素は

1. back に積まれる（1 回）
2. back から front へ積み替えられる（高々 1 回）
3. front から取り除かれる（高々 1 回）

という順にしか動かないので、操作を $Q$ 回行ったときの積み替えの合計は $Q$ 回以下である.
したがって `pop` は償却 $O(1)$ である.

## 4. 参考資料

- [Sliding Window Aggregation - data-structures (Scrapbox)](https://scrapbox.io/data-structures/Sliding_Window_Aggregation)（2 つのスタックで半群の積を持つ方法と償却計算量）
- [Minimum stack / Minimum queue - cp-algorithms](https://cp-algorithms.com/data_structures/stack_queue_modification.html)（累積の最小値を持つスタックと、2 つのスタックによるキュー）
- [Segtree - AtCoder Library](https://atcoder.github.io/ac-library/production/document_ja/segtree.html)（テンプレート引数 `op`, `e` のインターフェース）

## 5. コード

- `swag<S, op, e>`: モノイド $(S, \mathrm{op})$ の要素のキューを管理する. `e()` は単位元を返す. 交換法則は仮定しない.
- `push(x)`: 末尾に $x$ を追加する. $O(1)$.
- `pop()`: 先頭の要素を削除する. キューが空でないこと. 償却 $O(1)$.
- `all_prod()`: $\mathrm{op}(q_1, \dots, q_n)$ を返す. 空なら `e()`. $O(1)$.
- `size()`, `empty()`: 要素数、空かどうか. $O(1)$.

```cpp title="swag.cpp"
template <class S, S (*op)(S, S), S (*e)()>
struct swag {
  // 末尾に x を追加する. O(1)
  void push(S x) {
    back_val.push_back(x);
    back_sum = op(back_sum, x);
  }

  // 先頭の要素を削除する. 償却 O(1)
  void pop() {
    assert(!empty());
    if (front_agg.empty()) {
      // back の要素を右から順に front へ移す. front_agg は右から左への累積になる
      for (int i = (int)back_val.size() - 1; i >= 0; i--) {
        front_agg.push_back(front_agg.empty() ? back_val[i] : op(back_val[i], front_agg.back()));
      }
      back_val.clear();
      back_sum = e();
    }
    front_agg.pop_back();
  }

  // op(先頭, ..., 末尾) を返す. 空なら e(). O(1)
  S all_prod() const {
    return op(front_agg.empty() ? e() : front_agg.back(), back_sum);
  }

  int size() const { return front_agg.size() + back_val.size(); }
  bool empty() const { return size() == 0; }

 private:
  // キュー全体は f[m - 1], ..., f[1], f[0], back_val[0], back_val[1], ... の順に並ぶ（f は front のスタック. 底が f[0]）
  // front_agg[k] = op(f[k], f[k - 1], ..., f[0]). f の値そのものは使わないので持たない
  vector<S> front_agg;
  vector<S> back_val;  // back の要素（左から右の順）
  S back_sum = e();    // back_val の総積
};
```

使用例（アフィン変換の合成. キューに入っている変換を先頭から順に $x$ に施した結果を求める）:

```cpp
const long long MOD = 998244353;
using S = pair<long long, long long>;  // x -> first * x + second

// f を施してから g を施す
S op(S f, S g) { return {f.first * g.first % MOD, (g.first * f.second + g.second) % MOD}; }
S e() { return {1, 0}; }

swag<S, op, e> sw;
sw.push({a, b});
sw.pop();
auto [c, d] = sw.all_prod();
long long y = (c * x + d) % MOD;
```
