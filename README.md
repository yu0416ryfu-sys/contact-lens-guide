# コンタクトレンズ比較ナビ

楽天アフィリエイト向けコンタクトレンズ比較サイト。Astro + Tailwind CSS 製。GitHub Pages で無料公開できます。

## セットアップ

> **⚠️ `.env` を設定してから使用してください。**

```bash
cp .env.example .env
```

`.env` を開いて以下を設定します：

| 変数名 | 説明 |
|--------|------|
| `GITHUB_USERNAME` | GitHub Pages のユーザー名（サイトURL生成に使用） |
| `RAKUTEN_AFFILIATE_ID` | 楽天アフィリエイトID（`src/data/products.ts` の各 `rakutenUrl` に設定） |

## 開発・ビルド

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

## GitHub Pages へのデプロイ

1. `.env` の `GITHUB_USERNAME` を設定
2. `public/robots.txt` の Sitemap URL を確認
3. GitHub にプッシュ → Actions が自動ビルド＆デプロイ

リポジトリの **Settings → Pages → Source** を `GitHub Actions` に設定してください。

## サイト構成

| ページ | パス |
|--------|------|
| トップ | `/` |
| カテゴリ一覧 | `/category/{oneday,twoweek,color,toric,multifocal}/` |
| 商品比較表 | `/compare/{category}/` |
| 商品詳細 | `/products/{slug}/` |
| サイトマップ | `/sitemap.xml` |
