/**
 * Maktab Shop - Inventory Management Logic (Renderer Process)
 */

let state = {
    categories: [],
    items: [],
    invoices: [],
    cart: []
};

// --- Initialization ---
async function init() {
    await refreshData();
    setupEventListeners();
    renderDashboard();
}

async function refreshData() {
    state.categories = await window.appApi.getCategories();
    state.items = await window.appApi.getItems();
    state.invoices = await window.appApi.getInvoices();
}

function setupEventListeners() {
    // Tab Switching
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        };
    });

    // Theme Toggle
    document.getElementById('theme-toggle').onclick = () => {
        const body = document.body;
        const current = body.getAttribute('data-theme');
        body.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    };

    // Item Form
    document.getElementById('item-form').onsubmit = handleItemSubmit;
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');

    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');

    document.getElementById('tab-title').textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);

    // Refresh view based on tab
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'inventory') renderInventory();
    if (tabId === 'invoices') renderInvoices();
    if (tabId === 'pos') renderPos();
}

// --- Dashboard ---
function renderDashboard() {
    document.getElementById('stat-total-items').textContent = state.items.length;
    const totalValue = state.items.reduce((sum, item) => sum + (item.price * item.stock), 0);
    document.getElementById('stat-stock-value').textContent = `PKR ${totalValue.toLocaleString()}`;
    const lowStock = state.items.filter(i => i.stock < 10).length;
    document.getElementById('stat-low-stock').textContent = lowStock;

    // Recent Invoices
    const tbody = document.querySelector('#recent-invoices-table tbody');
    tbody.innerHTML = state.invoices.slice(0, 5).map(inv => `
        <tr>
            <td>${inv.id}</td>
            <td>${new Date(inv.date).toLocaleDateString()}</td>
            <td>${inv.customerName || 'Walk-in'}</td>
            <td>PKR ${inv.total.toLocaleString()}</td>
            <td><button class="btn btn-secondary" onclick="viewInvoice('${inv.id}')">View</button></td>
        </tr>
    `).join('');
}

// --- Inventory ---
async function renderInventory() {
    const filter = document.getElementById('category-filter').value;
    const items = filter === 'all' ? state.items : state.items.filter(i => i.categoryId === filter);

    // Update category dropdowns
    const catSelect = document.getElementById('item-category');
    catSelect.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    const catFilter = document.getElementById('category-filter');
    const currentFilter = catFilter.value;
    catFilter.innerHTML = `<option value="all">All Categories</option>` + state.categories.map(c => `<option value="${c.id}" ${c.id === currentFilter ? 'selected' : ''}>${c.name}</option>`).join('');

    const tbody = document.getElementById('inventory-list');
    tbody.innerHTML = items.map(item => {
        const catName = state.categories.find(c => c.id === item.categoryId)?.name || 'Unknown';
        return `
            <tr>
                <td><img src="${item.image || 'https://via.placeholder.com/40'}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
                <td style="font-weight:600">${item.title}</td>
                <td style="color:var(--text-muted)">${item.author || '-'}</td>
                <td><span class="badge">${catName}</span></td>
                <td>PKR ${item.price.toLocaleString()}</td>
                <td style="color: ${item.stock < 10 ? 'var(--danger)' : 'inherit'}; font-weight:600">${item.stock}</td>
                <td>
                    <button class="icon-btn" onclick="editItem('${item.id}')">✎</button>
                    <button class="icon-btn" style="color:var(--danger)" onclick="deleteItem('${item.id}')">🗑</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.openItemModal = () => {
    document.getElementById('edit-item-id').value = '';
    document.getElementById('item-form').reset();
    document.getElementById('modal-title').textContent = 'Add New Item';
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('item-modal').style.display = 'block';
    document.getElementById('category-modal').style.display = 'none';
};

window.editItem = (id) => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('item-title').value = item.title;
    document.getElementById('item-author').value = item.author;
    document.getElementById('item-category').value = item.categoryId;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-stock').value = item.stock;
    document.getElementById('item-image').value = item.image;

    document.getElementById('modal-title').textContent = 'Edit Item';
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('item-modal').style.display = 'block';
    document.getElementById('category-modal').style.display = 'none';
};

window.closeModal = () => {
    document.getElementById('modal-overlay').classList.remove('active');
};

async function handleItemSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-item-id').value;
    const item = {
        id: id || null,
        title: document.getElementById('item-title').value,
        author: document.getElementById('item-author').value,
        categoryId: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        stock: parseInt(document.getElementById('item-stock').value),
        image: document.getElementById('item-image').value
    };

    if (id) {
        await window.appApi.updateItem(item);
    } else {
        await window.appApi.addItem(item);
    }

    closeModal();
    await refreshData();
    renderInventory();
    renderDashboard();
}

window.deleteItem = async (id) => {
    if (confirm('Delete this item?')) {
        await window.appApi.deleteItem(id);
        await refreshData();
        renderInventory();
    }
};

// --- Category Management ---
window.manageCategories = () => {
    document.getElementById('edit-cat-id').value = '';
    document.getElementById('new-cat-name').value = '';
    document.getElementById('new-cat-discount').value = '';
    document.getElementById('new-cat-discount-type').value = 'fixed';
    document.getElementById('btn-save-cat').textContent = 'Add Category';

    renderCategoryList();
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('item-modal').style.display = 'none';
    document.getElementById('category-modal').style.display = 'block';
};

function renderCategoryList() {
    const list = document.getElementById('cat-list-manager');
    list.innerHTML = state.categories.map(c => `
        <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border)">
            <div>
                <div style="font-weight:600">${c.name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted)">Discount: ${c.discount || 0} ${c.discountType === 'percent' ? '%' : 'PKR'}</div>
            </div>
            <div>
                <button class="icon-btn" onclick="editCategory('${c.id}')">✎</button>
                <button class="icon-btn" style="color:var(--danger)" onclick="handleDeleteCategory('${c.id}')">✕</button>
            </div>
        </li>
    `).join('');
}

window.editCategory = (id) => {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;
    document.getElementById('edit-cat-id').value = cat.id;
    document.getElementById('new-cat-name').value = cat.name;
    document.getElementById('new-cat-discount').value = cat.discount || 0;
    document.getElementById('new-cat-discount-type').value = cat.discountType || 'fixed';
    document.getElementById('btn-save-cat').textContent = 'Update Category';
};

window.handleSaveCategory = async () => {
    const id = document.getElementById('edit-cat-id').value;
    const data = {
        id: id || null,
        name: document.getElementById('new-cat-name').value,
        discount: parseFloat(document.getElementById('new-cat-discount').value) || 0,
        discountType: document.getElementById('new-cat-discount-type').value
    };

    if (!data.name) return;

    if (id) {
        await window.appApi.updateCategory(data);
    } else {
        await window.appApi.addCategory(data);
    }

    document.getElementById('edit-cat-id').value = '';
    document.getElementById('new-cat-name').value = '';
    document.getElementById('new-cat-discount').value = '';
    document.getElementById('btn-save-cat').textContent = 'Add Category';

    await refreshData();
    renderCategoryList();
    renderInventory();
};

window.handleDeleteCategory = async (id) => {
    if (confirm('Delete category? Items will need a new category.')) {
        await window.appApi.deleteCategory(id);
        await refreshData();
        renderCategoryList();
        renderInventory();
    }
};

// --- POS / Invoice Generation ---
function renderPos() {
    renderCart();
}

window.searchPosItems = () => {
    const q = document.getElementById('pos-item-search').value.toLowerCase();
    const resultsDiv = document.getElementById('pos-search-results');
    if (!q) { resultsDiv.innerHTML = ''; return; }

    const matches = state.items.filter(i => (i.title.toLowerCase().includes(q) || (i.author && i.author.toLowerCase().includes(q))) && i.stock > 0);
    resultsDiv.innerHTML = matches.map(i => `
        <div class="search-item" onclick="addToCart('${i.id}')">
            <span>${i.title} (${i.stock} in stock)</span>
            <span>PKR ${i.price}</span>
        </div>
    `).join('');
};

window.addToCart = (id) => {
    const item = state.items.find(i => i.id === id);
    const inCart = state.cart.find(c => c.id === id);

    // Get category default discount
    const category = state.categories.find(c => c.id === item.categoryId);
    const defaultDiscount = category?.discount || 0;
    const defaultDiscountType = category?.discountType || 'fixed';

    if (inCart) {
        if (inCart.quantity < item.stock) inCart.quantity++;
    } else {
        state.cart.push({
            ...item,
            quantity: 1,
            discount: defaultDiscount,
            discountType: defaultDiscountType
        });
    }
    document.getElementById('pos-search-results').innerHTML = '';
    document.getElementById('pos-item-search').value = '';
    renderCart();
};

function renderCart() {
    const tbody = document.querySelector('#cart-table tbody');
    tbody.innerHTML = state.cart.map((item, index) => {
        const itemTotal = calculateItemTotal(item);
        return `
            <tr>
                <td>${item.title}</td>
                <td><input type="number" value="${item.quantity}" min="1" max="${item.stock}" onchange="updateCartQty(${index}, this.value)" style="width:50px"></td>
                <td>${item.price}</td>
                <td>
                    <div style="display:flex; gap:2px;">
                        <input type="number" value="${item.discount}" onchange="updateCartDiscount(${index}, this.value)" style="width:60px">
                        <select onchange="updateCartDiscountType(${index}, this.value)" style="padding:0">
                            <option value="fixed" ${item.discountType === 'fixed' ? 'selected' : ''}>PKR</option>
                            <option value="percent" ${item.discountType === 'percent' ? 'selected' : ''}>%</option>
                        </select>
                    </div>
                </td>
                <td>${itemTotal.toLocaleString()}</td>
                <td><button class="icon-btn" onclick="removeFromCart(${index})">✕</button></td>
            </tr>
        `;
    }).join('');

    updateTotals();
}

function calculateItemTotal(item) {
    let disc = item.discount || 0;
    if (item.discountType === 'percent') {
        disc = (item.price * item.discount) / 100;
    }
    return (item.price - disc) * item.quantity;
}

function updateTotals() {
    let subtotal = 0;
    let totalDiscount = 0;

    state.cart.forEach(item => {
        subtotal += item.price * item.quantity;
        let disc = item.discount || 0;
        if (item.discountType === 'percent') {
            disc = (item.price * item.discount) / 100;
        }
        totalDiscount += disc * item.quantity;
    });

    const grandTotal = subtotal - totalDiscount;

    document.getElementById('cart-subtotal').textContent = `PKR ${subtotal.toLocaleString()}`;
    document.getElementById('cart-discount').textContent = `PKR ${totalDiscount.toLocaleString()}`;
    document.getElementById('cart-total').textContent = `PKR ${grandTotal.toLocaleString()}`;
}

window.updateCartQty = (index, val) => {
    state.cart[index].quantity = parseInt(val) || 1;
    renderCart();
};

window.updateCartDiscount = (index, val) => {
    state.cart[index].discount = parseFloat(val) || 0;
    renderCart();
};

window.updateCartDiscountType = (index, val) => {
    state.cart[index].discountType = val;
    renderCart();
};

window.removeFromCart = (index) => {
    state.cart.splice(index, 1);
    renderCart();
};

window.generateInvoice = async () => {
    if (state.cart.length === 0) { alert('Cart is empty'); return; }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = state.cart.reduce((sum, item) => {
        let disc = item.discount || 0;
        if (item.discountType === 'percent') disc = (item.price * item.discount) / 100;
        return sum + (disc * item.quantity);
    }, 0);

    const invoice = {
        date: new Date().toISOString(),
        customerName: document.getElementById('cust-name').value || 'Walk-in Customer',
        customerContact: document.getElementById('cust-contact').value || '-',
        total: subtotal - totalDiscount
    };

    const invId = await window.appApi.addInvoice({ invoice, items: state.cart });

    // Generate HTML for PDF
    const html = `
        <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #333; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
                .header h1 { color: #4f46e5; margin: 0; }
                .inv-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #f9fafb; padding: 12px; text-align: left; border-bottom: 2px solid #eee; }
                td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                .totals-section { margin-top: 30px; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
                .totals-section div { font-size: 1rem; }
                .grand-total { font-size: 1.5rem !important; font-weight: bold; color: #4f46e5; margin-top: 10px; border-top: 2px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MAKTAB SHOP</h1>
                <p>Premium Islamic Books & Stationery</p>
                <p><strong>Invoice ID: ${invId}</strong></p>
            </div>
            <div class="inv-details">
                <div>
                    <strong>BILL TO:</strong><br>
                    ${invoice.customerName}<br>
                    Contact: ${invoice.customerContact}
                </div>
                <div>
                    <strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}<br>
                    <strong>Status:</strong> PAID
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.cart.map(i => {
        let discText = i.discountType === 'percent' ? `${i.discount}%` : `PKR ${i.discount}`;
        return `<tr>
                            <td>${i.title}</td>
                            <td>${i.quantity}</td>
                            <td>${i.price}</td>
                            <td>${discText}</td>
                            <td>PKR ${calculateItemTotal(i).toLocaleString()}</td>
                        </tr>`;
    }).join('')}
                </tbody>
            </table>
            <div class="totals-section">
                <div>Subtotal: PKR ${subtotal.toLocaleString()}</div>
                <div style="color: #ef4444;">Total Discount: -PKR ${totalDiscount.toLocaleString()}</div>
                <div class="grand-total">Grand Total: PKR ${invoice.total.toLocaleString()}</div>
            </div>
            <p style="margin-top:60px; text-align:center; color:#888;">Thank you for your business!<br>Visit again at Maktab Shop</p>
        </body>
        </html>
    `;

    await window.appApi.printToPDF(html);

    // Sharing logic
    const shareText = `*Invoice from Maktab Shop*%0A` +
        `Customer: ${invoice.customerName}%0A` +
        `Total: PKR ${invoice.total.toLocaleString()}%0A` +
        `Items:%0A` + state.cart.map(i => `- ${i.title} x ${i.quantity}`).join('%0A');

    const choice = confirm('Invoice generated!\\nPDF saved to Downloads.\\n\\nWould you like to share via WhatsApp?');
    if (choice) {
        const phone = invoice.customerContact.replace(/\D/g, '');
        window.appApi.openExternal(`https://wa.me/${phone}?text=${shareText}`);
    }

    state.cart = [];
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-contact').value = '';
    await refreshData();
    renderCart();
};

// --- Invoices Tab ---
function renderInvoices() {
    const tbody = document.querySelector('#all-invoices-table tbody');
    tbody.innerHTML = state.invoices.map(inv => `
        <tr>
            <td>${inv.id}</td>
            <td>${new Date(inv.date).toLocaleDateString()}</td>
            <td>${inv.customerName}</td>
            <td>${inv.customerContact}</td>
            <td>PKR ${inv.total.toLocaleString()}</td>
            <td><button class="btn btn-secondary" onclick="viewInvoice('${inv.id}')">View</button></td>
        </tr>
    `).join('');
}

// Init
init();
