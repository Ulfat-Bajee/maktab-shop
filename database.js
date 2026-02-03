const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;

// Helper to run queries with promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Database not initialized"));
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Database not initialized"));
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Database not initialized"));
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Initialize tables
async function createTables() {
  await exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      discount REAL DEFAULT 0,
      discountType TEXT DEFAULT 'fixed' -- 'fixed' or 'percent'
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      categoryId TEXT,
      title TEXT NOT NULL,
      author TEXT,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      image TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customerName TEXT,
      customerContact TEXT,
      total REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoiceId TEXT,
      itemId TEXT,
      quantity INTEGER,
      price REAL,
      discount REAL DEFAULT 0,
      discountType TEXT DEFAULT 'fixed',
      FOREIGN KEY (invoiceId) REFERENCES invoices(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    );
  `);

  const cats = await all('SELECT * FROM categories');
  if (cats.length === 0) {
    await run('INSERT INTO categories (id, name) VALUES (?, ?)', ['cat_1', 'Stationery']);
    await run('INSERT INTO categories (id, name) VALUES (?, ?)', ['cat_2', 'Islamic Books']);
  }
}

module.exports = {
  init: (dbPath) => {
    return new Promise((resolve, reject) => {
      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error("Could not connect to database", err);
          reject(err);
        } else {
          console.log("Connected to database at", dbPath);
          try {
            await createTables();
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  },

  getCategories: () => all('SELECT * FROM categories'),
  addCategory: async (data) => {
    const id = 'cat_' + Date.now();
    await run('INSERT INTO categories (id, name, discount, discountType) VALUES (?, ?, ?, ?)', [id, data.name, data.discount || 0, data.discountType || 'fixed']);
    return id;
  },
  updateCategory: async (data) => {
    await run('UPDATE categories SET name = ?, discount = ?, discountType = ? WHERE id = ?', [data.name, data.discount, data.discountType, data.id]);
  },
  deleteCategory: (id) => run('DELETE FROM categories WHERE id = ?', [id]),

  getItems: () => all('SELECT * FROM items'),
  addItem: async (item) => {
    const id = item.id || 'item_' + Date.now();
    await run('INSERT INTO items (id, categoryId, title, author, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, item.categoryId, item.title, item.author, item.price, item.stock || 0, item.image]);
    return id;
  },
  updateItem: (item) => run('UPDATE items SET categoryId = ?, title = ?, author = ?, price = ?, stock = ?, image = ? WHERE id = ?',
    [item.categoryId, item.title, item.author, item.price, item.stock, item.image, item.id]),
  deleteItem: (id) => run('DELETE FROM items WHERE id = ?', [id]),

  addInvoice: async (invoice, items) => {
    const invId = 'inv_' + Date.now();
    await run('INSERT INTO invoices (id, date, customerName, customerContact, total) VALUES (?, ?, ?, ?, ?)',
      [invId, invoice.date, invoice.customerName, invoice.customerContact, invoice.total]);

    for (const item of items) {
      const recId = 'ii_' + Math.random().toString(36).substr(2, 9);
      await run('INSERT INTO invoice_items (id, invoiceId, itemId, quantity, price, discount, discountType) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [recId, invId, item.id, item.quantity, item.price, item.discount || 0, item.discountType || 'fixed']);
      await run('UPDATE items SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }
    return invId;
  },
  getInvoices: () => all('SELECT * FROM invoices ORDER BY date DESC')
};
