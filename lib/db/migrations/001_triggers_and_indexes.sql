-- ============================================================
-- riziki-next — PostgreSQL migration helpers
-- Run AFTER drizzle-kit push / migrate to set up triggers.
-- ============================================================


-- ─── 1. Full-text search trigger on products ─────────────────────────────────
--
-- Keeps `search_vector` up-to-date automatically on every INSERT / UPDATE.
-- Weights:
--   A = product name (highest relevance)
--   B = brand
--   C = description
--   D = tags (comma-joined)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;

CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, brand, description, tags
  ON products
  FOR EACH ROW
EXECUTE FUNCTION products_search_vector_update();

-- Backfill existing rows
UPDATE products SET name = name;


-- ─── 2. GIN index (if not already created by Drizzle) ───────────────────────

CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN (search_vector);


-- ─── 3. Useful indexes ───────────────────────────────────────────────────────

-- Products
CREATE INDEX IF NOT EXISTS products_department_idx ON products (department);
CREATE INDEX IF NOT EXISTS products_category_idx   ON products (category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx       ON products (slug);
CREATE INDEX IF NOT EXISTS products_is_active_idx  ON products (is_active);
CREATE INDEX IF NOT EXISTS products_is_new_idx     ON products (is_new);
CREATE INDEX IF NOT EXISTS products_is_sale_idx    ON products (is_sale);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);

-- Orders
CREATE INDEX IF NOT EXISTS orders_user_id_idx     ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx      ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx  ON orders (created_at DESC);

-- Carts
CREATE INDEX IF NOT EXISTS carts_user_id_idx      ON carts (user_id);
CREATE INDEX IF NOT EXISTS carts_session_id_idx   ON carts (session_id);
CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON cart_items (cart_id);

-- Wishlists
CREATE INDEX IF NOT EXISTS wishlist_items_product_id_idx ON wishlist_items (product_id);

-- Recently viewed
CREATE INDEX IF NOT EXISTS recently_viewed_user_id_idx   ON recently_viewed (user_id);
CREATE INDEX IF NOT EXISTS recently_viewed_product_id_idx ON recently_viewed (product_id);

-- Mega menu
CREATE INDEX IF NOT EXISTS mega_menu_sections_dept_idx ON mega_menu_sections (department);
CREATE INDEX IF NOT EXISTS mega_menu_sections_sort_idx ON mega_menu_sections (sort_order);

-- Looks
CREATE INDEX IF NOT EXISTS looks_dept_idx  ON looks (department);
CREATE INDEX IF NOT EXISTS looks_sort_idx  ON looks (sort_order);
CREATE INDEX IF NOT EXISTS looks_slug_idx  ON looks (slug);

-- Banners
CREATE INDEX IF NOT EXISTS banners_dept_idx    ON banners (department);
CREATE INDEX IF NOT EXISTS banners_type_idx    ON banners (type);
CREATE INDEX IF NOT EXISTS banners_active_idx  ON banners (is_active);
CREATE INDEX IF NOT EXISTS banners_sort_idx    ON banners (sort_order);
