import type { APIRoute } from 'astro';
import { products } from '../data/products';

export const GET: APIRoute = ({ site, url }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const siteOrigin = site?.toString().replace(/\/$/, '') ?? url.origin;
  const root = `${siteOrigin}${base}`;

  const categories = ['oneday', 'twoweek', 'color', 'toric', 'multifocal'];

  const staticPages = [
    { loc: `${root}/`, priority: '1.0', changefreq: 'weekly' },
  ];

  const categoryPages = categories.map(cat => ({
    loc: `${root}/category/${cat}/`,
    priority: '0.9',
    changefreq: 'weekly',
  }));

  const comparePages = categories.map(cat => ({
    loc: `${root}/compare/${cat}/`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const productPages = products.map(p => ({
    loc: `${root}/products/${p.slug}/`,
    priority: '0.7',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...categoryPages, ...comparePages, ...productPages];

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
