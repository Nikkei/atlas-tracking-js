# 設定ガイド

## config() に対するライブラリレベルの設定引数

`config()` は設定変数を内包する一つのオブジェクトを受け取る。
`system` を除くほとんどの変数は省略可能だが、明示的に値を指定することを強く推奨する。

### 基本構造

```javascript
{
    'system': {...},
    'defaults': {...},
    'product': {...},
    'options': {
        'useGet': true,
        'exchangeAtlasId': {...},
        'trackClick': {...},
        'trackLink': {...},
        'trackDownload': {...},
        'trackPerformance': {...},
        'trackScroll': {...},
        'trackInfinityScroll': {...},
        'trackRead': {...},
        'trackViewability': {...},
        'trackMedia': {...},
        'trackForm': {...},
        'trackUnload': {...}
    }
}
```

### 変数

#### system

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|endpoint|String|ATJがビーコンを送る宛先|`atlas-endpoint.your.domain`|
|apiKey|String|エンドポイントはこのキーを持つビーコンを受け付ける|`abc123xyz789`|
|beaconTimeout|Integer|エンドポイントとの通信タイムアウトをミリ秒で指定|`2000` (2 sec)|
|cookieName|String|Atlas IDを保存するCookie名|`atlasId`|
|cookieMaxAge|Integer|Atlas IDのCookieの有効期間|`(2 * 365 * 24 * 60 * 60)` (2 years)|
|cookieDomain|String|Cookieを保存する際にドメイン属性として利用するドメイン名|`your.domain`|

#### defaults

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|pageUrl|String|ページビューその他のイベントが発生した場所を指すURL|`window.parent.document.location.href`|
|pageReferrer|String|リファラーURL = 直前のページ|`window.parent.document.referrer`|
|pageTitle|String|ページタイトル|`window.parent.document.title`|

- ページタイトルはページを識別するために便利な反面、各ページで異なる値がセットされている必要がある。

#### product

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|productFamily|String|製品ファミリー。サービスに対して複数のUIやアプリからアクセスできる場合、それらをグループ化する|`MyDigitalService`|
|productName|String|製品名。同じブランドで複数のサービスを持っている場合、この値で個々のサービスを区別する|`MyDigitalService-Web`|

- 1つのブランドのもとで1つの製品のみを持つ場合、両変数に同じ値をセットできる。

#### useGet (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|useGet|Boolean|ビーコンを送信するためのメソッドの切り替え。 `true` = GET、 `false` = POST|`true`|

- 日本固有のプロキシ型セキュリティソフトがPOSTボディを消すが、Content-Lengthを維持する。よって、セキュリティソフトにデータを破壊されないためにGETが安全な選択である。

#### exchangeAtlasId (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|exchangeAtlasId.pass|Boolean|この機能を使うか否か|`true`|
|exchangeAtlasId.passParamKey|String|Atlas IDをセットするGETパラメーターの名前|`atlas_id`|
|exchangeAtlasId.passTargetDomains|Array|Atlas IDを渡すドメイン名の配列|`['domain1','domain2','domain3']`|
|exchangeAtlasId.catch|Boolean|この機能を使うか否か|`true`|
|exchangeAtlasId.catchParamKey|String|Atlas IDを受け取るGETパラメータの名前|`atlas_id`|
|exchangeAtlasId.catchTargetDomains|Array|Atlas IDを受け取るドメイン名の配列|`['domain1','domain2','domain3']`|

- ATJはAtlas IDを複数のドメインを跨いで、サードパーティCookie無しで共有することができ、Atlas IDを交換するためにGETパラメータを使う。
- `pass` はAtlas IDを `passTargetDomains` に列挙された外部のドメインに引き渡す機能
- `catch` はAtlas IDを `catchTargetDomains` に列挙された外部のドメインから受け取る機能

#### trackClick (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackClick.enable|Boolean|この機能を使うか否か|`true`|
|trackClick.targetAttribute|String|ATJはユーザーがこのデータ属性を持つ要素をクリックしたときにデータを収集する|`data-atlas-trackable`|
                    
#### trackLink (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackLink.enable|Boolean|この機能を使うか否か|`true`|
|trackLink.internalDomains|Array|離脱リンクのクリック計測から除外したいドメイン名の配列|`['domain1','domain2','domain3']`|
|trackLink.nameAttribute|String|ここで指定したデータ属性を追加して、離脱リンクに任意の名前を設定できる|`data-atlas-link-name`|

#### trackDownload (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackDownload.enable|Boolean|この機能を使うか否か|`true`|
|trackDownload.fileExtensions|Array|ダウンロード計測の対象とするファイル拡張子の配列|`['pdf','zip','tar','gz']`|
|trackDownload.nameAttribute|String|ここで指定したデータ属性を追加して、ダウンロードリンクに任意の名前を設定できる|`data-atlas-link-name`|                    

#### trackPerformance (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackPerformance.enable|Boolean|この機能を使うか否か|`true`|

- Track Performanceは実際のユーザーのパフォーマンス情報を把握するのに役立つが、データオブジェクトは大きい。
- onload までの時間を測定したい場合、読み込みの順序の関係でonloadイベントで `trackAction()` を呼び出す必要があるかもしれない。

#### trackScroll (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackScroll.enable|Boolean|この機能を使うか否か|`true`|
|trackScroll.granularity|Integer|ATJはスクロール深度がここで指定したNパーセント（1-99）以上変化したときにビーコンを送信する|`20`|
|trackScroll.threshold|Integer|ATJはユーザーがスクロール深度をここで定義したT秒維持したらビーコンを送信する|`2`|

- スクロール深度は `granularity` と `threshold` の組み合わせで測定される。よって、ユーザーが90％までスクロールダウンしたが、1秒以内に10%にスクロールアップした場合、ATJはビーコンを送らない。
- スクロール深度計測はし多方向へのスクロール動作のみを観測する。
- もし無限スクロール/遅延読み込みを利用している場合、標準のスクロール深度計測は適さない。したがって `trackScroll` の代わりに `trackInfinityScroll` を使う。

#### trackInfinityScroll (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackInfinityScroll.enable|Boolean|この機能を使うか否か|`true`|
|trackInfinityScroll.step|Integer|スクロール深度がここで指定したNピクセル/ポイント以上変化したときにATJはビーコンを送信する|`600`|
|trackInfinityScroll.threshold|Integer|ATJはユーザーがスクロール深度をここで定義したT秒維持したらビーコンを送信する|`2`|

#### trackRead (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackRead.enable|Boolean|この機能を使うか否か|`true`|
|trackRead.target|Element|観測対象となる要素|`document.getElementById('article_body')`|
|trackRead.granularity|Integer|ATJは読了率がNパーセント（1-99）以上変化したときにビーコンを送信する|`25`|
|trackRead.milestones|Array|ATJはまた、これらのマイルストーンを越えた時点でビーコンを送信する|`[4, 15, 30, 60, 90, 120]`|

- `trackScroll` と `trackRead` の違いは：
    - `trackScroll` はwindowに対するスクロース深度を計測する
    - `trackRead` はコンテンツ本体のブロック要素における可視性の変化に注目する
- `trackScroll` は深度と時間の組み合わせで動くが、 `trackRead` は深度と時間を切り離して扱う

#### trackViewability (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackViewability.enable|Boolean|この機能を使うか否か|`true`|
|trackViewability.targets|Array|観測対象のエレメントの配列|`document.getElementsByClassName('ad_frame')`|

- IABのビューワブルインプレッションの定義が適用されるが、ATJはパフォーマンスの観点から厳密な秒数を計らない。（250ミリ秒ごとに間引く）

#### trackMedia (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackMedia.enable|Boolean|この機能を使うか否か|`true`|
|trackMedia.selector|String|観測対象のエレメントを検知するためのクエリーセレクター文字列|`video, audio`|
|trackMedia.heartbeat|Integer|ユーザーがメディアを再生しているとき、ATJはここで指定するN秒ごとに「ハートビート=心拍」ビーコンを送信する|`5`|

#### trackForm (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackForm.enable|Boolean|この機能を使うか否か|`true`|
|trackForm.target|Element|状態を追跡するフォーム要素のを内包する親要素を渡す|`document.getElementById('form_element')`|

- この機能はまた実験段階である。

#### trackUnload (オプション以下)

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|trackUnload.enable|Boolean|この機能を使うか否か|`true`|

- ATJはユーザーがunloadしようとした時にビーコンを送信するが、精度はエンドポイントとの接続性能、DNS、クライアントに依存する。希にブラウザによってリクエストが中断される。

## initPage() に対するページレベルの設定引数

`initPage()` はページ固有の設定変数を内包する一つのオブジェクトを受け取る。
ほとんどの変数は省略可能だが、明示的に値を指定することを強く推奨する。

### 基本構造

```javascript
{
    user: {...},
    context: {...}
}
```

### 変数

#### user

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|user_id|String|サービス側で認識したユーザーID|`abc123`|
|user_status|String|ログイン状態、権限、料金プランのようなユーザーのステータス|`loggedin`|
|site_session|String|サービス側で扱われているセッションID。Atlasのデータとサーバーログを紐付ける場合、これがキーとなる|`ce6b2f45-5362-4aec-a1e0-e93474f6d898`|
|external_ids|Map|Atlasのデータと他のシステムを統合するための付加的なユーザーID|`{thirdparty_tool: '987xyz'}`|

- `user` はユーザーIDや環境などユーザー側の情報を格納するためのもの。
- Atlas エンドポイントはセッション管理を内蔵しているので `site_session` はセッション管理に不要である。
- `external_ids` は `initPage()` 以降に `setCustomId()` と `delCustomId()` で管理される。
                		
#### context

|変数|型|目的|例|
|:----:|:----:|:----:|:----:|
|app|String|現在のページを担当しているアプリケーションやマイクロサービスの名称|`Hub`|
|app_version|String|`app` に関して、アプリケーションやマイクロサービスのバージョン|`2.1.3`|
|source|String|コンテンツがどこから提供されているか|`Nikkei`|
|edition|String|コンテンツのエディション|`Online`|
|content_id|String|コンテンツを識別するための一意な値|`abc123`|
|content_name|String|コンテンツの見出し|`Nikkei made Atlas public as an opensource software`|
|content_status|String|ペイウォールやメーターシステムを持つサービスの場合、コンテンツの可視性についてセットできる|`open`|
|page_name|String|ページに対するページ名だが、コンテンツの見出しではない|`article`|
|page_num|Integer|ページ番号|`atlasTracking.getQueryValue('page') `|| 1`|
|category_l1|String|カテゴリー名。L1はコンテンツの大きなグループ|`Shoes`|
|category_l2|String|カテゴリー名。L2はコンテンツの中規模のグループ|`Casual Shoes`|
|category_l3|String|カテゴリー名。L3はコンテンツの細かいグループ|`Sneakers`|
|tracking_code|String|AA互換のトラッキングコード用変数|`atlasTracking.getQueryValue('cid')`|
|events|String|ページ上での購入（`purchase`）や送信（`submit`）、完了（`complete`）… といったイベントを指定できる|`purchase`|
|campaign.name|String|GA互換のトラッキングパラメーター用変数|`atlasTracking.getQueryValue('utm_campaign')`|
|campaign.source|String|GA互換のトラッキングパラメーター用変数|`atlasTracking.getQueryValue('utm_source')`|
|campaign.medium|String|GA互換のトラッキングパラメーター用変数|`atlasTracking.getQueryValue('utm_medium')`|
|campaign.term|String|GA互換のトラッキングパラメーター用変数|`atlasTracking.getQueryValue('utm_term')`|
|campaign.content|String|GA互換のトラッキングパラメーター用変数|`atlasTracking.getQueryValue('utm_content')`|
|search.term|String|サイト内検索に用いられたキーワード|`atlasTracking.getQueryValue('keyword')`|
|search.options|Map|サイト内検索で適用された検索オプション|`{Region:'Asia',Limit:20}`|
|search.results|Integer|サイト内検索の結果の件数|`document.getElementsByClassName('result-item').length`|
|funnel.funnel_name|String|フォームの名前|`Subscription`|
|funnel.funnel_steps|Integer|フォーム内の総ステップ数|`4`|
|funnel.step_name|String|現在のフォームのステップの分かりやすい名前|`Confirmation`|
|funnel.step_number|Integer|現在のフォームのステップの番号|`3`|
|funnel.step_state|String|現在のステップの状態。例えば、ユーザーが誤った値を入力した場合、確認で失敗するので「failed」の状態となる|`success`|
|funnel.products|Map|（実験段階）|`{}`|
|flags|Map|特にサービスやユーザーについてのフラグデータのための任意のデータオブジェクト|`{ab_test_target:true}`|
|custom_object|Map|事前定義済みではない任意のデータオブジェクト|`{foo:'bar'}`|

- `context` は、コンテンツ名やコンテンツのカテゴリのようなコンテンツやサーバー側の情報を格納する。
- `custom_object` は `initPage()` 以降に `setCustomObject()` と `delCustomObject()` で管理される。
- `context` 直下の変数は `setCustomVars()` と `delCustomVars()` で追加/削除できる。