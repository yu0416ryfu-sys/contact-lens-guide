/**
 * 楽天検索ページから実際のデータを取得して src/data/products.ts を更新するスクリプト
 * API キー不要。楽天の公開検索ページから JSON-LD 構造化データを取得する。
 *
 * 使い方:
 *   node scripts/fetch-products.mjs
 *
 * 更新対象フィールド: price / rating / reviewCount / rakutenUrl
 * バックアップ: 実行前に src/data/products.ts.bak を自動作成
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ─── .env を手動パース ───────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    console.error('❌ .env ファイルが見つかりません');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const AFFILIATE_ID = env.RAKUTEN_AFFILIATE_ID;

if (!AFFILIATE_ID) {
  console.error('❌ RAKUTEN_AFFILIATE_ID が .env に設定されていません');
  process.exit(1);
}

// ─── 商品ごとの検索キーワード ──────────────────────────────────────────────
const SEARCH_TARGETS = [
  { slug: 'acuvue-moist',             keyword: 'ワンデーアキュビューモイスト 30枚' },
  { slug: 'dailies-total1',           keyword: 'デイリーズトータルワン 30枚' },
  { slug: 'biotrue-oneday',           keyword: 'バイオトゥルーワンデー 30枚' },
  { slug: 'acuvue-oasys-2w',          keyword: 'アキュビューオアシス 2ウィーク 6枚' },
  { slug: 'medalist-ii',              keyword: 'メダリストII ボシュロム 6枚' },
  { slug: 'biofinity',                keyword: 'バイオフィニティ クーパービジョン 6枚' },
  { slug: 'freshkon-alluring',        keyword: 'フレッシュコン アルーリングアイズ' },
  { slug: 'eyecoffret-1day-uv',       keyword: 'アイコフレワンデーUV シード' },
  { slug: 'acuvue-oasys-toric',       keyword: 'アキュビューオアシス 乱視用 6枚' },
  { slug: 'acuvue-moist-toric',       keyword: 'ワンデーアキュビューモイスト 乱視用 30枚' },
  { slug: 'acuvue-oasys-multifocal',  keyword: 'アキュビューオアシス マルチフォーカル 遠近両用' },
  { slug: 'proclear-1day-multifocal', keyword: 'プロクリア 1日 マルチフォーカル 遠近両用' },
];

// ─── 楽天検索ページから JSON-LD を取得 ─────────────────────────────────────
async function fetchRakutenSearch(keyword) {
  const encodedKeyword = encodeURIComponent(keyword);
  const url = `https://search.rakuten.co.jp/search/mall/${encodedKeyword}/`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ja,en;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // JSON-LD の ItemList ブロックを抽出
  const match = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?ItemList[\s\S]*?)<\/script>/);
  if (!match) throw new Error('JSON-LD ItemList が見つかりませんでした');

  const jsonld = JSON.parse(match[1]);
  if (!jsonld.itemListElement || jsonld.itemListElement.length === 0) {
    throw new Error('検索結果が空です');
  }

  // 1件目の商品データを取得
  const first = jsonld.itemListElement[0].item;
  const itemUrl = first.url.split('?')[0]; // クエリパラメータを除去

  return {
    name: first.name,
    price: first.offers?.price ?? null,
    rating: first.aggregateRating?.ratingValue ?? null,
    reviewCount: first.aggregateRating?.reviewCount ?? null,
    itemUrl,
    affiliateUrl: `https://hb.afl.rakuten.co.jp/hgc/${AFFILIATE_ID}/?pc=${encodeURIComponent(itemUrl)}`,
  };
}

// ─── products.ts の特定 slug ブロック内フィールドを置換 ────────────────────
function updateProductInFile(content, slug, updates) {
  const slugMarker = `slug: '${slug}'`;
  const slugIdx = content.indexOf(slugMarker);
  if (slugIdx === -1) {
    console.warn(`  ⚠ slug '${slug}' が products.ts に見つかりません`);
    return content;
  }

  const nextSlugIdx = content.indexOf("slug: '", slugIdx + slugMarker.length);
  const blockEnd = nextSlugIdx === -1 ? content.length : nextSlugIdx;
  let block = content.slice(slugIdx, blockEnd);

  if ('price' in updates)       block = block.replace(/price: \d+,/, `price: ${updates.price},`);
  if ('rating' in updates)      block = block.replace(/rating: [\d.]+,/, `rating: ${updates.rating},`);
  if ('reviewCount' in updates) block = block.replace(/reviewCount: \d+,/, `reviewCount: ${updates.reviewCount},`);
  if ('rakutenUrl' in updates)  block = block.replace(/rakutenUrl: '[^']*',/, `rakutenUrl: '${updates.rakutenUrl}',`);

  return content.slice(0, slugIdx) + block + content.slice(blockEnd);
}

// ─── メイン処理 ────────────────────────────────────────────────────────────
async function main() {
  console.log('楽天検索ページからデータを取得中...\n');

  const results = [];

  for (const target of SEARCH_TARGETS) {
    process.stdout.write(`  [${target.slug}] `);
    try {
      const data = await fetchRakutenSearch(target.keyword);
      results.push({ ...target, success: true, ...data });
      console.log(`✅ ¥${data.price?.toLocaleString()} / 評価${data.rating} (${data.reviewCount?.toLocaleString()}件)`);
    } catch (e) {
      console.log(`❌ ${e.message}`);
      results.push({ ...target, success: false, reason: e.message });
    }
    // サーバー負荷軽減のため間隔を空ける
    await new Promise(r => setTimeout(r, 1500));
  }

  // ─── 確認テーブル表示 ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log(' 取得結果確認（products.ts 反映前）');
  console.log('═'.repeat(70));

  for (const r of results) {
    if (!r.success) {
      console.log(`\n❌ ${r.slug} → スキップ（${r.reason}）`);
      continue;
    }
    console.log(`\n✅ ${r.slug}`);
    console.log(`   楽天商品名 : ${r.name.slice(0, 60)}`);
    console.log(`   価格       : ¥${r.price?.toLocaleString()}`);
    console.log(`   評価       : ${r.rating} (${r.reviewCount?.toLocaleString()}件)`);
    console.log(`   商品URL    : ${r.itemUrl}`);
  }

  // ─── products.ts を更新 ────────────────────────────────────────────────
  const productsPath = resolve(process.cwd(), 'src/data/products.ts');
  let content = readFileSync(productsPath, 'utf-8');

  writeFileSync(productsPath + '.bak', content, 'utf-8');
  console.log(`\nバックアップ作成: src/data/products.ts.bak`);

  let updatedCount = 0;
  for (const r of results) {
    if (!r.success) continue;

    const updates = {};
    if (r.price !== null)       updates.price = r.price;
    if (r.rating !== null)      updates.rating = Math.round(r.rating * 10) / 10;
    if (r.reviewCount !== null) updates.reviewCount = r.reviewCount;
    updates.rakutenUrl = r.affiliateUrl;

    content = updateProductInFile(content, r.slug, updates);
    updatedCount++;
  }

  writeFileSync(productsPath, content, 'utf-8');
  console.log(`\n✅ products.ts を更新しました（${updatedCount}/${SEARCH_TARGETS.length} 商品）`);
  console.log('次のステップ: npm run build でビルド確認\n');
}

main().catch(e => {
  console.error('予期しないエラー:', e);
  process.exit(1);
});
