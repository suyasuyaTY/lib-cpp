---
title: "Convex Hull Trick"
tags: [dp-optimization, convexity]
sidebar:
  order: 7
---
## 概要

直線集合を管理するデータ構造で、次の 2 種類のクエリを処理できる

- 直線の追加クエリ: $f(x) = ax + b$ を追加
- 最大/最小値の取得クエリ: ある $x$ に対して、最大/最小の $f(x)$ を求める

## 傾きの単調性を必要とする Convex Hull Trick

直線を追加する順番について次の単調性を仮定すると、直線を`stack`や`deque`で管理できる
- 最大値を求める場合: 傾きが単調増加
- 最小値を求める場合: 傾きが単調減少

### 実装

```cpp
struct convex_hull_trick {
  using i128 = __int128_t;

  struct Linear {
    ll a, b;
    Linear(ll a = 0, ll b = 0) : a(a), b(b) {}
    i128 operator()(ll x) const {
      return (i128)a * x + b;
    }
  };

  deque<Linear> ls;

  // l2 が最大値を取る区間を持たないなら true。
  bool unnecessary(
      const Linear& l1,
      const Linear& l2,
      const Linear& l3) {
    // x12 = (b1 - b2) / (a2 - a1), x23 = (b2 - b3) / (a3 - a2)
    // x12 >= x23, なら l2 は不要。

    return (i128)(l1.b - l2.b) * (l3.a - l2.a) >=
           (i128)(l2.b - l3.b) * (l2.a - l1.a);
  }

  // 最大値を求める場合、傾き a を単調増加で追加する。
  void add(ll a, ll b) {
    assert(ls.empty() || ls.back().a <= a);

    // 傾きが同じ場合、切片が大きい方だけ残す。
    if (!ls.empty() && ls.back().a == a) {
      if (ls.back().b >= b) {
        return;
      }
      ls.pop_back();
    }

    Linear line(a, b);

    // 新しい直線を追加することで, 末尾の直線が一度も最大値を取らなくなるなら削除する。
    while (ls.size() >= 2 && unnecessary(*(ls.rbegin() + 1), *ls.rbegin(), line)) {
      ls.pop_back();
    }

    ls.push_back(line);
  }

  // x が単調増加する場合
  i128 query_monotone(ll x) {
    assert(!ls.empty());

    while (ls.size() >= 2) {
      // 次の直線の方が現在の x で良いなら、先頭の直線は今後二度と最大にならない。
      if (ls[0](x) > ls[1](x)) {
        break;
      }

      ls.pop_front();
    }

    return ls.front()(x);
  }

  i128 query(ll x) const {
    assert(!ls.empty());

    // ls[i](x) > ls[i + 1](x) となる最初の i を探す。
    int ng = -1, ok = ls.size() - 1;
    while (ok - ng > 1) {
      int mid = (ok + ng) / 2;

      if (ls[mid](x) > ls[mid + 1](x)) {
        ok = mid;
      } else {
        ng = mid;
      }
    }

    return ls[ok](x);
  }
};
```

> **min**が欲しい場合
> $$\min_{i} f_{i}(x) = - \max_{i} (-f_{i}(x))$$
> 1. 区間追加: `cht.add(-a, -b)`
> 2. 区間取得: `-cht.query(x)` 

### 交点だけを考えればいい理由

最大値の場合を例にとって考える。傾き $a_{1} < a_{2} < a_{3}$ の順番で直線を追加する。

2本の直線
$$
\begin{aligned}
    f_{1}(x) &= a_{1} x + b_{1} \\
    f_{2}(x) &= a_{2} x + b_{2} \\
\end{aligned}
$$
について、交点より左側では $f_{1}(x)$ , 右では $f_{2}(x)$ の方が大きくなる。

一度 $f_{2}(x)$ が上回ったら、その後 $f_{1}(x)$ が再び最大値になることはないので、**最大値を与える直線の傾きは $x$ の増加に伴って単調増加**する。

3本の直線
$$
\begin{aligned}
    f_{1}(x) &= a_{1} x + b_{1} \\
    f_{2}(x) &= a_{2} x + b_{2} \\
    f_{3}(x) &= a_{3} x + b_{3} \\
\end{aligned}
$$
について、$(f_{1}, f_{2})$ の交点を $x_{12}$, $(f_{2}, f_{3})$ の交点を $x_{23}$ とする。

ここで、$f_{2}$ が最大値をとる $x$ が存在するには、 $x_{12} < x_{23}$ である必要がある。逆に、**$x_{12} \geq x_{23}$ なら $f_{2}$ が $f_{1}$ を追い越す時点では、すでに $f_{3}$ の方が $f_{1}$ より大きくなっているので $f_{2}$ は削除できる**。

### $x$ が単調でない場合

取得クエリの $x$ が単調増加でない場合、先頭の直線を削除することはできない。

ただし、凸包上では各直線が最適になる区間が交点によって区間になっているので、その交点を二分探索すればいい。

## 傾きの単調性を必要としない Convex Hull Trick

```cpp
// 最小値を求める場合(最大値にするには add_line の大小関係を変更)
struct convex_hull_trick {
  struct line {
    ll a, b;
    line(ll a_ = 0, ll b_ = 0) : a(a_), b(b_) {}
    ll get(ll x) { return a * x + b; };
  };

  struct node {
    line f;
    bool has_line;
    node *left_child, *right_child;

    node() : f(), has_line(false), left_child(nullptr), right_child(nullptr) {}
    node(line f_) : f(f_), has_line(true), left_child(nullptr), right_child(nullptr) {}
    ~node() {
      delete left_child, delete right_child;
    }
  };

 private:
  int n;
  vector<ll> pos;
  node *root;
  const ll ID = LINF;

  // [lb, ub] 全体に直線 f を追加
  node *add_line(node *p, int lb, int ub, line f) {
    if (!p) {
      p = new node();
    }

    // このノードにまだ直線がなければ置くだけ
    if (!p->has_line) {
      p->f = f;
      p->has_line = true;
      return p;
    }

    line &g = p->f;

    // g が両端で f 以下 → g <= f → 更新なし
    if (g.get(pos[lb]) <= f.get(pos[lb]) && g.get(pos[ub]) <= f.get(pos[ub])) {
      return p;
    }

    // f が両端で g 以下 → f < g → f を代表にする
    if (f.get(pos[lb]) <= g.get(pos[lb]) && f.get(pos[ub]) <= g.get(pos[ub])) {
      g = f;
      return p;
    }

    int mid = (lb + ub) / 2;

    // 中央では g が最小になるようにする
    if (f.get(pos[mid]) < g.get(pos[mid])) {
      swap(f, g);
    }

    // 中央で負けた f が左側で小さい → 左側の区間で小さくなる可能性がある
    if (f.get(pos[lb]) < g.get(pos[lb])) {
      p->left_child = add_line(p->left_child, lb, mid, f);
    } else {
      p->right_child = add_line(p->right_child, mid + 1, ub, f);
    }

    return p;
  }

  // 線分追加
  // [lb, ub] 探索区間: [lb, ub], 線分の範囲: [ql, qr]
  node *add_segment(node *p, int lb, int ub, int ql, int qr, line f) {
    // 範囲外
    if (qr < lb || ub < ql) {
      return p;
    }

    // 完全被覆
    if (ql <= lb && ub <= qr) {
      return add_line(p, lb, ub, f);
    }

    // 部分被覆
    // 自分自身には直線を置かず、子へ降りるためだけのノードを作る
    if (!p) {
      p = new node();
    }

    int mid = (lb + ub) / 2;

    p->left_child = add_segment(p->left_child, lb, mid, ql, qr, f);

    p->right_child = add_segment(p->right_child, mid + 1, ub, ql, qr, f);

    return p;
  }

  // 点 x の最小値
  ll query(node *p, int lb, int ub, int t) const {
    if (!p) {
      return ID;
    }

    ll ans = ID;

    if (p->has_line) {
      ans = p->f.get(pos[t]);
    }

    if (lb == ub) {
      return ans;
    }

    int mid = (lb + ub) / 2;
    if (t <= mid) {
      ans = min(ans, query(p->left_child, lb, mid, t));
    } else {
      ans = min(ans, query(p->right_child, mid + 1, ub, t));
    }
    return ans;
  }

 public:
  convex_hull_trick(vector<ll> pos_) : pos(move(pos_)), root(nullptr) {
    ranges::sort(pos);
    pos.erase(unique(pos.begin(), pos.end()), pos.end());

    n = pos.size();
  }
  ~convex_hull_trick() {
    if (root) delete root;
  }

  // 全区間に y = ax + b を追加
  void add_line(ll a, ll b) {
    root = add_line(root, 0, n - 1, line(a, b));
  }
  // [l, r) の範囲だけ y = ax + b を追加
  void add_segment(ll l, ll r, ll a, ll b) {
    int ql = distance(pos.begin(), ranges::lower_bound(pos, l));
    int qr = distance(pos.begin(), ranges::lower_bound(pos, r)) - 1;

    if (ql > qr || ql >= n || qr < 0) return;

    root = add_segment(root, 0, n - 1, ql, qr, line(a, b));
  }

  // x における最小値
  // x は pos に含まれている必要がある
  ll get(ll x) const {
    int t = distance(pos.begin(), ranges::lower_bound(pos, x));

    assert(t < n && pos[t] == x);

    return query(root, 0, n - 1, t);
  };
};
```

## 問題例

### [ABC341-G Highest Ratio](https://atcoder.jp/contests/abc341/tasks/abc341_g)

- ある区間の平均値が $x$ 以上となる条件: $\sum_{i = k}^{r} (x - A[i]) \leq 0$
- $k$ の時, 平均値は $F_{k} = \sum_{i = k}^{N} (x - A[i])$ とすると次のようにあらわせる
  - $(F_{k}, F_{k+1})$ の交点
  - $(F_{k}, F_{k+2})$ の交点
  - $(F_{k}, F_{N})$ の交点
  - $(F_{k}, 0)$ の交点
- $k$ を後ろから追加していくと、$F_{k}$ の傾きは単調増加なので一番右で交点を持つ条件というのは`CHT`の直線追加のクエリと同じことをすればいい

## 参照元

- [傾きの単調性がいらない Convex Hull Trick](https://kazuma8128.hatenablog.com/entry/2018/02/28/102130)
