-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discount REAL DEFAULT 0,
    "discountType" TEXT DEFAULT 'fixed'
);

-- 2. Create Items table
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    author TEXT,
    price REAL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    image TEXT
);

-- 3. Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    "customerName" TEXT,
    "customerContact" TEXT,
    total REAL DEFAULT 0,
    items JSONB
);

-- 4. Enable Row Level Security (RLS) - Optional but recommended
-- For development, you can disable RLS or add a policy to allow all access:
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all access" ON items FOR ALL USING (true);
CREATE POLICY "Allow all access" ON invoices FOR ALL USING (true);

-- 5. Create basic categories if empty
INSERT INTO categories (id, name) 
SELECT 'cat_1', 'Stationery'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat_1');

INSERT INTO categories (id, name) 
SELECT 'cat_2', 'Islamic Books'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat_2');
