# Atlas Tracking JS (ATJ)

[![Circle CI](https://circleci.com/gh/Nikkei/atlas-tracking-js/tree/master.svg?style=svg)](https://circleci.com/gh/Nikkei/atlas-tracking-js/tree/master)

一般的なウェブサイト用 Atlas計測ライブラリ

- ATJはAtlas用の計測SDKです
- ATJは、一般的な用途のウェブ解析用ビーコンを送信します
- ATJはブラウザーの現代的な機能である、sendBeacon、requestAnimationFrame、そしてNavigation Timing等を活用します
- いくつかの機能は Event Delegation の仕組みを利用します
- 豊富な自動計測のオプションが用意されています

## ドキュメント

- [英語の説明](./README.md) はこちら ([README in English](./README.md) is available.)
- [設定ガイド](./docs/CONFIGURATION-JP.md) では、c2p.jsを通じて設定可能な全ての機能について説明しています
- ユーティリティ関数がATJコアに用意されています。 [関数一覧](./docs/METHODS-JP.md)から便利なメソッドを見付けられます
- [FAQ](./docs/FAQ-JP.md) はこちらですが、発展途上です
- ATJ は [MITライセンス](./LICENSE.md)のもとで公開しています
- このプロジェクトの [全てのコントリビューター](./docs/CONTRIBUTORS.md) に感謝します
- 現時点では、運用ポリシーにより、日経社外からのプルリクエストはマージされません。もし問題を発見した場合は、GitHubでイシューを作成してください

## ATJのビルド

### 前提条件
以下のいずれかの環境が必要になります：
1. Node 10
2. Docker

#### ビルド環境をDockerで構築
```sh
docker build -t atj ./
docker run --name ATJ -e SDK_API_KEY=your_sdk_api_key -e DEFAULT_ENDPOINT=your.atlas.endpoint -e SDK_NAMESPACE=atlasTracking -i -t -v ${PWD##}:/var/atj atj
```

### 環境変数
|環境変数|目的|デフォルト|例|
|:---:|:---:|:---:|:---:|
|SDK_API_KEY|データ送信先であるエンドポイントでの認証に用いる|`test_api_key`|`abc123xyz789`|
|DEFAULT_ENDPOINT|デフォルトのエンドポイント。c2p.jsの設定変数でエンドポイントを指定しない場合、この値でフォールバックされる|`atlas.local`|`atlas-endpoint.your.domain`|
|SDK_NAMESPACE|ATJで使う全ての関数や変数が格納される名前空間、よってATJはグローバル名前空間を1つだけ使う|`atlasTracking`|`atlasTracking`|

#### 初期設定
```sh
npm install
```

### テスト
- 構文チェックは `npm run eslint` でできます
- ユニットテストを行う場合は `npm run test` を実行
- 統合テストは `npm run integration-test` で行うことができます

### ビルド
- スタンドアロンのATJは `npm run build:dist` （一般的に、これはほとんどの用途に適合します）
- NPMモジュールを生成する場合は, `npm run build:npm`

## 実装ガイド

### 必須要件
- グローバル名前空間から一つの変数が、ATJ関連の変数やメソッドを格納するために必要。この名前はATJをビルドする際に指定できる
- ATJは一意なブラウザを識別するためにCookieを一つ利用する。Cookieの名称は c2p.js で指定できるが、デフォルトでは `atlasId`
- ATJは、スクロール深度、読了、ビューワブルインプレッションの検出のため、`atlasVisibilityStatus` という名前のカスタムイベントを発生させる。発生頻度は `requestAnimationFrame` とスロットリングの組み合わせに依存する
- ATJはpolyfill無しに可能な限り多くのブラウザをサポートしている。ただし、IE9以前の古いブラウザでは動作しない

### 基本的な導入方法
1. [Readme](./README-JP.md) に従ってATJをビルドすると、`./dist` ディレクトリの中に `atj.min.js` が生成される
2. `c2p.js` という名前の設定ファイルを `./dist` ディレクトリ内のサンプルファイルを基に作成する。[設定ガイド](./docs/CONFIGURATION-JP.md) を読んでカスタマイズする
3. `atj.min.js` と `c2p.js` の両ファイルをウェブサイトの各ページの `<body>...</body>` 内で読み込む
    - これらのファイルを、`<script src='{path/to/file}'></script>` のように `script` タグを使って直接埋め込む方法
    - Adobe Dynamic Tag Management や Google Tag Manager といったタグマネジメントツールを通じて展開する方法
4. ウェブサイトをチェックして、スクリプトエラーが起こらず、ATJがビーコンを送信していることを確認する

### c2p.jsの内側
- c2p.js は以下の順でメソッドを発火する:
    1. `config()` を呼び出してATJを初期設定
    2. ページ個別のデータを初期化するために `initPage()` を呼び出す
    3. そして、ページビューを計測するために `trackPage()` を呼び出す
- また、c2p.js はデータ取得やデータの準備のためのカスタムコードを含むことができる
- もしウェブサイトがSPA（Single Page Application）の場合、 `initPage()` と `trackPage()` を画面が変更される度に呼び出すことができる （ATJそのものの初期化をやり直す必要は無い）

### プライバシーのためのオプトアウト機能
ATJは「計測からオプトアウト」をサービス上で実現する機能が組み込まれている。これはいかなる場合でもプライバシーの観点から推奨され、もしGDPRが適用される国へサービスを提供する場合にはオプトアウト機能を提供することを検討する必要がある。

1. 「計測からオプトアウト」ボタンを追加するために、ページやモーダルを追加または編集する
2. `atlasTracking.optout('enable')` を呼ぶための数行のコードを書き、ユーザーがオプトアウトボタンをクリックしたら発火するようにする

- オプトアウトしたユーザーは `atlasTracking.optout('disable');` によってオプトインできる
- ATJの範囲内でユーザーのプライバシーを確実に保護するため、オプトアウト機能は最初のビーコンが送られるよりも前に設置される必要がある。従って、 `initPage()` と `trackPage()` はユーザーが計測に合意した後に発動すべきである
