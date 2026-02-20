/**
 * PostgreSQL full-text search helpers.
 *
 * Uses Drizzle's sql template tag to build tsvector queries.
 * The `search_vector` column is maintained by a DB trigger (see migrations).
 *
 * Usage:
 *   const results = await searchProducts({ query: "floral dress", department: "women" })
 */

import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/db/schema";

export interface SearchOptions {
  query: string;
  department?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export async function searchProducts(options: SearchOptions) {
  const { query, department, limit = 20, offset = 0 } = options;

  if (!query.trim()) return { results: [], total: 0 };

  // Convert query to tsquery format (handles multiple words)
  // e.g. "floral dress" → "floral & dress"
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`) // prefix matching
    .join(" & ");

  const baseWhere = sql`
    p.is_active = true
    AND p.search_vector @@ to_tsquery('english', ${tsQuery})
    ${department ? sql`AND p.department IN (${department}, 'all')` : sql``}
  `;

  const [results, countResult] = await Promise.all([
    db.execute(sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.department,
        p.category_id,
        p.tags,
        ts_rank(p.search_vector, to_tsquery('english', ${tsQuery})) AS rank,
        MIN(pv.price) AS min_price,
        pi.url AS primary_image_url,
        pi.blur_data_url AS primary_image_blur,
        pi.public_id AS primary_image_public_id
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      WHERE ${baseWhere}
      GROUP BY p.id, pi.url, pi.blur_data_url, pi.public_id
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${baseWhere}
    `),
  ]);

  return {
    results: results.rows,
    total: Number((countResult.rows[0] as { total: string }).total),
  };
}
