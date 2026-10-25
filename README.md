# GREEN BOX

写真が主役の、スマートフォン向けビジュアルコレクション。既存ファイルが空だったため、デザイン仕様 v1.0 を基に新規実装しています。参考画像と掲載素材は未提供で、公開データは空です。

## 開発

Node.js 22.12以上（検証: 24.19）、npmを使用します。

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

ビルド結果は `dist/`。実際のリポジトリ名に合わせ、GitHub Pagesの `/greenbox/` に配置します。mainへのpushで `.github/workflows/pages.yml` がビルドとデプロイを実行します。GitHubの Settings → Pages → Source を GitHub Actions に設定してください。

## コンテンツ登録

`assets/data.js` の `items` に出典・写真利用条件を確認したアイテムを登録します。写真パスは同ファイルからの相対指定またはHTTPS URL。`heroImage`、`thumbnailImage`、任意の `mobileImage` と、`imagePosition` / `thumbnailPosition`（例 `50% 35%`）で画角を調整できます。トップ画像は原則 `contain` で対象物全体を表示し、余白は同じ画像をぼかした背景で埋めます。風景写真など意図的に画面を埋めたい場合だけ `imageFit: 'cover'` を指定してください。画像は十分な解像度のものを選び、縮小版URLをヒーローに指定しないでください。トップの順序は `sortOrder`、件数は実データから自動算出します。

必須情報は `id`、`slug`（一意）、`name`、`description`、`category`、`heroImage`、`sourceUrl`、`imageSourceUrl`、`imageCredit`、`imageLicense`。その他のフィールドは `data.js` に記載しています。色は `colorHex` からRGB/参考CMYKを自動換算。色分類は `colorGroup`、動画は実在を確認した `videoUrl` のみ登録してください。動画未登録時は欄を表示しません。

詳細URLは `/greenbox/#item=slug`。検索は詳細情報全体・カテゴリ・色のOR条件で、未指定の条件は無効です。写真タップでは詳細を開きません。横スワイプ、矢印、左右キーで移動します。詳細/検索はネイティブdialogでフォーカスを管理し、Escapeで閉じられます。

## 検証上の制約

本番用の架空データや写真は含めていません。実写真の切り抜き・文字とのコントラスト・参考画像との再現度は、素材受領後に確認が必要です。ブラウザテスト用データは公開ソースへ登録しません。

ブラウザ検証は `npm run dev` を別ターミナルで起動し、`npm run test:browser`。Chromiumが `/usr/bin/chromium` にある環境で検証しています。別の配置では `CHROMIUM_PATH` を指定します。検証用データをブラウザの通信差し替えで注入し、本番データは変更しません。スクリーンショットは `/tmp/greenbox-artifacts/`（`GREENBOX_ARTIFACTS` で変更可）に生成します。
