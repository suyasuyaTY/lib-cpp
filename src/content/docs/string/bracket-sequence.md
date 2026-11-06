---
title: "括弧列"
sidebar:
  order: 7
---
## 構築方法

### 使う性質

- $1 \le i \le 2N$において、$S_1, \dots, S_i$のうち$\frac{i}{2}$個以上が`(` である
- $S_1, \dots, S_{2N}$のうちちょうど$N$個が`(` である

### 構築

1. $S_1$を`(` にする
2. $2 \le k \le N$について昇順に、以下の操作を行う
    1. $2k-2, 2k-1$を候補の集合に追加する
    2. 候補の集合から要素$x$を一つ選び、取り除く。その後、$S_x$を`(` にする
3. まだ`(` にしていない$N$個の文字を`)` にする。

### コード

`(` に対応する位置を和を取るときの最大を求める

```cpp
long long ans = 0;
priority_queue<long long, vector<long long> > que;
for (int i = 0; i < n; i++) {
	if (i == 0) {
		que.push(a[i*2-0]);
	} else {
		que.push(a[i*2-1]);
		que.push(a[i*2-0]);
	}
	long long v = que.top();
	que.pop();
	ans += v;
}
```

## 括弧列の判定

### セグメント木に乗せる情報

`(` ,`)` をそれぞれ1, -1の置き換える

- `pair.first` ：区間内の累積和の最小値
    - 正しい括弧列の条件である「途中で`)` が先行しない」をチェックしている
- `pair.secound` ：区間全体の合計値
    - 区間内の`(` の数から`)` の数を引いた値
    - 正しい括弧列の条件である「最終的に`(` ,`)`の数が一致する」をチェックしている

### コード
```cpp
using S = pair<int, int>;

S op(S a, S b){
    return {min(a.first, a.second + b.first), a.second + b.second};
}
S e(){
    return {0, 0};
}

// 初期化
vector<S> v(N);
for (int i = 0; i < N; i++){
	if (s[i] == '(')
		v[i] = {0, 1};
	else
		v[i] = {-1, -1};
} 

segtree<S, op, e> seg(v);
for (int q = 0; q < Q; q++){
	int l, r;
	cin >> l >> r;
	if (seg.prod(l, r + 1) == {0, 0})
		 cout << "Yes" << endl;
  else
	  cout << "No" << endl;
}
```
