---
title: ABC278 G - Generalized Subtraction Game
problem: https://atcoder.jp/contests/abc278/tasks/abc278_g
uses: [game/winning-strategy, game/nim]
tags: []
---
[問題](https://atcoder.jp/contests/abc278/tasks/abc278_g)

## 問題

インタラクティブ問題. $1$ から $N$ の番号が付いたカードが一列に並んでいる.
2 人が交互に、$L \le y \le R$ を満たす $y$ と $x$ を選び、カード $x, x + 1, \dots, x + y - 1$ を取り除く. ただしカード $x, \dots, x + y - 1$ はすべて残っていなければならない.
手を打てなくなった人が負け. 自分が先手か後手かを選び、ジャッジに勝て.

制約は $1 \le L \le R \le N \le 2000$.

## 1. 条件の言いかえ

カードが取り除かれると、残っているカードはいくつかの連続部分に分かれる.
取り除く $y$ 枚は連続している必要があるので、手は 1 つの連続部分の中でしか打てない.
よって局面は「長さ $\ell_1, \ell_2, \dots$ の列のゲームの和」である.

## 2. まねっこ戦略への帰着

長さ $N$ の列の中央から $y$ 枚を取り、長さ $k = (N - y) / 2$ の列を 2 本作れれば、以降は 2 本の列の間で相手の手をまねて勝てる（[必勝戦略の考え方](../../game/winning-strategy/) 5.2 節）.
カード $1, \dots, k$ の列を $A$、カード $k + y + 1, \dots, N$ の列を $B$ とすると、相手の手 $(a, b)$ に対して

- $a \le k$ なら $(a + k + y, b)$,
- $a > k$ なら $(a - k - y, b)$

を返せばよい. $A$ と $B$ の間には $y$ 枚分の隙間があるので、相手の手と応手が重なることはない.

中央から $y$ 枚を取るには、$y \equiv N \pmod 2$ を満たす $y \in [L, R]$ が必要である.

- $L < R$ なら、$L$ と $L + 1$ のどちらかが $N$ と偶奇が一致する.
- $L = R$ なら、$N \equiv L \pmod 2$ のときだけ取れる.

よってまねっこ戦略が使えないのは $L = R$ かつ $N \not\equiv L \pmod 2$ のときだけである. $L = R$ かつ $N \not\equiv L \pmod 2$ でなければ、先手を選んで勝てる.

## 3. $L = R$ のときの Grundy 数

$L = R$ のとき、長さ $n$ の列の Grundy 数 $g_n$ は、取る $L$ 枚の左に $a$ 枚残すとして

$$
g_n = \operatorname{mex} \lbrace g_a \oplus g_{n - L - a} : 0 \le a \le n - L \rbrace
$$

で計算できる（[Nim](../../game/nim/)）. 全体で $O(N^2)$ である.
$g_N \ne 0$ なら先手、$g_N = 0$ なら後手を選ぶ.

自分の手番では、残っている連続部分の Grundy 数の XOR を $X$ とし、長さ $\ell$ の連続部分の左から $a$ 枚残して $L$ 枚取ったときに $X \oplus g_\ell \oplus g_a \oplus g_{\ell - L - a} = 0$ となる手を探す.
1 手あたり $O(N)$ で、ゲーム全体で $O(N^2)$ である.

## 提出コード

```cpp title="abc278_g.cpp"
int main() {
    int N, L, R;
    cin >> N >> L >> R;
    auto output = [](int x, int y) { cout << x << ' ' << y << endl; };
    auto input = [](int &a, int &b) {
        cin >> a >> b;
        return a > 0;  // 0 0 または -1 -1 なら終了
    };

    if (L < R || (N - L) % 2 == 0) {
        // まねっこ戦略: 真ん中を y 枚取って長さ k の列を 2 つ作る
        int y = ((N - L) % 2 == 0) ? L : L + 1;
        int k = (N - y) / 2;
        cout << "First" << endl;
        output(k + 1, y);
        int a, b;
        while (input(a, b)) {
            if (a <= k) output(a + k + y, b);
            else output(a - k - y, b);
        }
        return 0;
    }

    // L = R のとき: Grundy 数で戦う
    vector<int> g(N + 1, 0);
    for (int n = L; n <= N; n++) {
        vector<bool> seen(N + 2, false);
        for (int a = 0; a <= n - L; a++) seen[g[a] ^ g[n - L - a]] = true;
        while (seen[g[n]]) g[n]++;
    }
    vector<bool> alive(N + 2, true);
    alive[0] = alive[N + 1] = false;
    auto remove = [&](int x, int y) {
        for (int i = x; i < x + y; i++) alive[i] = false;
    };
    auto my_move = [&]() {
        // 残っているカードの連続部分 [s, s + len) を列挙する
        vector<pair<int, int>> segs;
        int X = 0;
        for (int i = 1; i <= N; i++) {
            if (alive[i] && !alive[i - 1]) {
                int j = i;
                while (alive[j]) j++;
                segs.push_back({i, j - i});
                X ^= g[j - i];
            }
        }
        for (auto [s, len] : segs) {
            for (int a = 0; a <= len - L; a++) {
                if ((X ^ g[len] ^ g[a] ^ g[len - L - a]) == 0) {
                    remove(s + a, L);
                    output(s + a, L);
                    return;
                }
            }
        }
    };

    bool first = g[N] != 0;
    cout << (first ? "First" : "Second") << endl;
    if (first) my_move();
    int a, b;
    while (input(a, b)) {
        remove(a, b);
        my_move();
    }
}
```
