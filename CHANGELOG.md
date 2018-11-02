# ATJ Change Log

## 2018

### 2018-10-30

#### v2.12.4

- `site_search` を `search` に改名（アプリ他ウェブサイト以外にも汎用的に適用できる命名）

### 2018-10-30

#### v2.12.3
- 複数の計測機能において `dataset` 変数の階層を1段繰り上げた
- `trackClick` が指定のデータ属性に基づいて要素の階層を表現し `context.action.name` に格納するようにした
- `trackAction` の引数として渡すカスタムオブジェクトにおいて、`custom_value` を `custom_vars` に置き換えた（送信時の変数名との整合性）

### 2018-10-05

#### v2.12.2
- localStorageから値を取得する `getLocalStorageValue` メソッドを追加

### 2018-09-10

#### v2.12.1

##### Improvements
- クリック計測の Event Delegationのターゲットをdocumentではなくbodyに変更
- クリック計測において touchstart のバインディングをやめた（Clickとして成立していないのに計測してしまう、スクロール時のパフォーマンスに影響する）

### 2018-09-07

#### v2.12.0

##### New Features
- フォーム分析に `trackForm` を追加

### 2018-09-03

#### v2.11.0

##### Breaking Changes
- `setDataSrc` メソッドを廃止
- `observeMutation` オプションを廃止
- メディア計測の対象をNodeListではなく、クエリーセレクター文字列を渡す形に変更

##### New Features
- `data-trackable` によるクリック計測

##### Improvements
- リンク処理をEvent Delegation化
- メディア計測をEvent Delegation化
- Google Analyticsで一般的な `utm_` 系キャンペーン計測変数をサポート
- 内部で利用する変数名を短縮しファイルサイズを縮小
