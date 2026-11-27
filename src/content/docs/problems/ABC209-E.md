---
title: ABC209 E - Shiritori
problem: https://atcoder.jp/contests/abc209/tasks/abc209_e
uses: [game/winning-strategy]
tags: []
---
[問題](https://atcoder.jp/contests/abc209/tasks/abc209_e)

## 問題

$N$ 個の単語 $s_1, \dots, s_N$ がある. 高橋君と青木君が交互に、直前の単語の末尾 3 文字と先頭 3 文字が一致する単語を言う（大文字と小文字は区別する）. 同じ単語を何度言ってもよい. 単語を言えなくなった人が負け.
各 $i$ について、高橋君が $s_i$ を最初に言ったとき、両者が最善を尽くした場合の勝者（ゲームが終わらなければ引き分け）を求めよ.

制約は $N \le 2 \times 10^5$、$3 \le |s_i| \le 8$、各文字は英大文字か英小文字.

## 1. 条件の言いかえ

次に言える単語は直前の単語の末尾 3 文字だけで決まる.
3 文字の文字列を頂点とし、単語 $s_i$ を「$s_i$ の先頭 3 文字」から「$s_i$ の末尾 3 文字」への有向辺とすると、単語を言うことは辺をたどってコマを動かすことになる.

> 頂点数 $52^3$、辺数 $N$ の有向グラフでコマを動かすゲームで、各頂点の勝ち・負け・引き分けを求めよ.

高橋君が $s_i$ を言った直後は、$s_i$ の末尾 3 文字の頂点で青木君の手番である. 青木君の手番の頂点が負けなら高橋君の勝ち、勝ちなら青木君の勝ちである.

## 2. 後退解析

同じ単語を何度でも言えるのでグラフにはループがあり、引き分けがありうる.
[必勝戦略の考え方](../../game/winning-strategy/) 3.2 節の後退解析で、各頂点の勝ち・負け・引き分けが $O(52^3 + N)$ で求まる.

## 提出コード

```cpp title="abc209_e.cpp"
// solve_game は「必勝戦略の考え方」10.1 節
int main() {
    int N;
    cin >> N;
    auto id = [](char c) { return islower(c) ? c - 'a' : c - 'A' + 26; };
    auto code = [&](const string &s, int p) {
        return (id(s[p]) * 52 + id(s[p + 1])) * 52 + id(s[p + 2]);
    };
    vector<string> s(N);
    vector<pair<int, int>> edges;
    for (auto &w : s) {
        cin >> w;
        edges.push_back({code(w, 0), code(w, w.size() - 3)});
    }
    vector<int> res = solve_game(52 * 52 * 52, edges);
    for (auto &w : s) {
        int r = res[code(w, w.size() - 3)];  // 青木君の手番
        cout << (r == -1 ? "Takahashi" : r == 1 ? "Aoki" : "Draw") << '\n';
    }
}
```
