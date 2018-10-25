# 関数一覧

## 基本

### config(object)

ATJコアを設定する。
詳細は [設定ガイド](./CONFIGURATION-JP.md#config-に対するライブラリレベルの設定引数) を参照

- 引数
    - object (map : ATJコアレベルの設定情報を含むオブジェクト)
- 戻値
    - void


### initPage(object)

ページに対する変数とイベントリスナーを初期化する。
詳細は [設定ガイド](./CONFIGURATION-JP.md#initpage-に対するページレベルの設定引数) を参照

- 引数
    - object (map : ページに対する設定情報を含むオブジェクト)
- 戻値
    - void


### trackPage()

ページビューイベントを送信する。

- 引数
    - void
- 戻値
    - void


### trackAction(action, category, events, object)

任意のイベントを送信する。
`action` と `category` を指定することを強く推奨する。また、action と category は、粗い粒度であるべき。

例えば、もし「お気に入りアイテムに保存」ボタンのクリック数を計りたい場合：

|評価|Action|Category|Object|メモ|
|:----:|:----:|:----:|:----:|:----:|
|良|`click`|`button`|`{loc:'header',fnc:'save',tgt:'favorite-items'}`|第4引数に機能や場所を指すコンテキストを追加する|
|悪|`click-to-save`|`favorite-items-header-button`|`{}`|これは複数の組み合わせパターンに対して「総ボタンクリック数」を集計したい場合に問題となり得る|

- 引数
    - action (string : 任意。アクションを説明する動詞または動名詞。例： `click`, `open`, `receive`)
    - category (string : 任意。アクションが適用される対象を指す名詞または目的語。例： `button`, `link`, `notification`)
    - events (string : 任意。アクションに対してイベント名を振りたい場合、カンマ区切りまたは単体のイベント名)
    - object (map : 任意。任意の変数を含むオブジェクト)
- 戻値
    - void


## ATJ外部からデータを取得する

### getQueryValue(keyName)

現URLのGETパラメーターをパースして指定したキーの値を得る。

- 引数
    - keyName (string : キー名)
- 戻値
    - GETパラメータの {keyName} が持つ値

```javascript
// 「cid」の値を取得してtracking_codeにセットする
context.tracking_code = atlasTracking.getQueryValue('cid');
```


### getCookieValue(keyName)

ブラウザのCookieをパースし、指定したキーの値を得る。

- 引数
    - keyName (string : キー名)
- 戻値
    - Cookieの {keyName} が持つ値

```javascript
// 「uid」の値を取得してuser_idにセットする
user.user_id = atlasTracking.getCookieValue('uid');
```


### getLocalStorageValue(keyName)

ブラウザのLocal Storageから指定したキーの値を得る。

- 引数
    - keyName (string : キー名)
- 戻値
    - Local Storageの {keyName} が持つ値

```javascript
// 「flags」の値を取得し、パースしてflagsにセットする
context.flags = JSON.parse(atlasTracking.getLocalStorageValue('flags'));
```

### setDataSrc(jsonString)

ATJの外側から供給されるカスタムデータオブジェクトをパースし、ATJ内の一時変数に格納する。

- 引数
    - jsonString (string : StringifyされたJSON文字列)
- 戻値
    - パース結果のMapオブジェクト

```javascript
// GETパラメーターを通じてカスタムオブジェクトをATJに供給する
atlasTracking.setDataSrc(atlasTracking.getQueryValue('custom_data'));
```


### getDataFromSrc(mapPath)

JSONパスを指定することで、 `setDataSrc()` でパースされたカスタムオブジェクトから指定の値を取り出す。

- 引数
    - mapPath (string : 取り出したい値までのパス)
- 戻値
    - DataSrcの一時変数から取り出した、{mapPath} が持つ値

```javascript
// ページ名を外部から供給されるDataSrcから取得してpage_nameにセットする
context.page_name = atlasTracking.getDataFromSrc('page_data.name');
```


## Ingest内部の値を操作する

### setCustomObject(keyName, object)

キー・バリューの組み合わせをカスタムデータを格納するためのcustom_objectに追加する。
custom_objectは64kbまでの大きなオブジェクトを格納できるが、1件のビーコンの合計サイズに配慮すること。

- 引数
    - keyName (string : 追加する値を格納するキー名)
    - object (String, Number, Map, Array : 格納する任意の値)
- 戻値
    - void

```javascript
// A/Bテストの詳細をCustom Objectに追加
atlasTracking.setCustomObject('ab_testing', {target_user:true,pattern_name:'onboarding_cp',creative_id:'benefit_offering_001'});
```

### delCustomObject(keyName)

keyNameで指定された特定のデータを custom_objectから削除する。

- 引数
    - keyName (string : 削除されるキー名)
- 戻値
    - void

```javascript
// A/Bテストの詳細をCustom Objectから削除する
atlasTracking.delCustomVars('ab_testing');
```


### setCustomVars(keyName, object)

Context直下に任意の変数を追加する。

- 引数
    - keyName (string : 追加する値を格納するキー名)
    - object (String, Number, Map, Array : 格納する任意の値)
- 戻値
    - void

```javascript
// 「flags」をグローバル変数「analytics_data」からセットする
atlasTracking.setCustomVars('flags', window.analytics_data);
```

### delCustomVars(keyName)

指定したキー名の値をContext直下から削除する。

- 引数
    - keyName (string : 削除するキー名)
- 戻値
    - void

```javascript
// 「flags」をContext直下から削除する
atlasTracking.delCustomVars('flags');
```


### setCustomId(keyName, customID)

別のシステムでユーザーを識別するための情報を追加する。
もしウェブサイト上で複数のツールを分析やマーケティングに利用している場合、複数のツールのデータをここで指定するカスタムIDをキーにして統合できる。

- 引数
    - keyName (string : 追加する値を格納するキー名)
    - customID (string : カスタムID)
- 戻値
    - void

```javascript
// RtoasterのIDを user.external_ids に追加する
atlasTracking.setCustomId('rtoaster', 'abc123');
```


### delCustomId(keyName)

カスタムIDを削除する。

- 引数
    - keyName (string : 削除するキー名)
- 戻値
    - void

```javascript
// RtoasterのIDを user.external_ids から削除する
atlasTracking.delCustomId('rtoaster');
```


## Other useful functions

### initEventListeners()

イベントリスナーを再初期化する。 `initPage()` の後にページ内の要素が変更される場合、このメソッドを呼ぶことでATJ内部で利用するイベントリスナーをリセットできる。
ただし、ATJ内でイベントリスナーを活用するほとんどの仕組みはイベントデリゲーションが適用されているため、イベントリスナーのリセットの必要性は少ない。

- 引数
    - void
- 戻値
    - void

### getVisibility(htmlElement)
`getVisibility()` は指定した特定のHTML要素の可視性を評価し結果を返す。

- 引数
    - htmlElement (element : 評価対象のエレメント単体)
- 戻値
    - result (map : 以下に説明する可視性についての様々な情報)

|Path|Type|Meaning|Example|
|:----:|:----:|:----:|:----:|
|status.isInView|Boolean|指定要素の一部または全体問わず見えるか否か|`true`|
|status.location|String|all、top、bottomのような大まかな見えている部位|`all`|
|detail.documentHeight|Float|documentの高さのピクセルまたはポイント（iOS）|`4401`|
|detail.documentIsVisible|String|documentの可視性。もしタブがアクティブであれば `visible` 、バックグラウンドであれば `hidden`|`visible`|
|detail.documentScrollUntil|Float|windowにおける可視領域の下端の位置|`894`|
|detail.documentScrollRate|Float|scrollUntil と documentHeight を比較したスクロール率|`0.203135665`|
|detail.documentVisibleTop|Float|documentの可視領域の上端位置|`735`|
|detail.documentVisibleBottom|Float|documentの可視領域の下端位置|`894`|
|detail.targetHeight|Float|対象要素の高さのピクセルまたはポイント（iOS）|`269`|
|detail.targetMarginTop|Float|viewportの上端から対象要素の上端までの距離|`455.03125`|
|detail.targetMarginBottom|Float|viewportの下端から対象要素の下端までの距離|`169.96875`|
|detail.targetScrollRate|Float|対象要素に対する可視領域のスクロース率。1の場合は対象要素の下端まで見えているという意味|`1`|
|detail.targetScrollUntil|Float|対象要素のスクロール深度|`269`|
|detail.targetViewableRate|Float|対象要素の可視領域の割合|`1`|
|detail.targetVisibleTop|Float|対象要素の可視領域の上端位置|`0`|
|detail.targetVisibleBottom|Float|対象要素の可視領域の下端位置|`269`|
|detail.viewportHeight|Float|Viewport（ブラウザウィンドウ内側）の高さ|`894`|
