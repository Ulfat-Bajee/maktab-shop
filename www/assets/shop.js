/**
 * Maktab Shop - Premium Logic (Vanilla JS)
 * Handles State, Persistence (LocalStorage), and DOM Updates
 */

// Initial State with some default data if empty
const defaultData = {
    categories: [
        { id: 'cat_1', name: 'Stationery' },
        { id: 'cat_2', name: 'Islamic Books' },
        { id: 'cat_3', name: 'Gifts' }
    ],
    items: [
        {
            id: 'item_1',
            categoryId: 'cat_1',
            title: 'Premium Notebook',
            author: 'Moleskine',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300'
        },
        {
            id: 'item_2',
            categoryId: 'cat_2',
            title: 'Tafseer Ibn Kathir',
            author: 'Ibn Kathir',
            price: 4500,
            image: 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&q=80&w=300'
        }
    ]
};

// State Management
let state = JSON.parse(localStorage.getItem('maktab_data')) || defaultData;
let currentFilter = 'all';

// DOM Elements
const els = {
    categoryList: document.getElementById('categoryList'),
    itemsGrid: document.getElementById('itemsGrid'),
    statsTotalItems: document.getElementById('stat-total-items'),
    statsTotalValue: document.getElementById('stat-total-value'),
    statsCategories: document.getElementById('stat-categories'),
    modal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    categorySelect: document.getElementById('categorySelect'),
    addBtn: document.getElementById('addBtn'),
    searchInput: document.getElementById('searchInput')
};

// Persistence
function saveState() {
    localStorage.setItem('maktab_data', JSON.stringify(state));
    render();
}

// Render Functions
function render() {
    renderStats();
    renderCategories();
    renderItems();
    updateCategorySelect();
}

function renderStats() {
    els.statsTotalItems.textContent = state.items.length;
    const totalValue = state.items.reduce((sum, item) => sum + Number(item.price), 0);
    els.statsTotalValue.textContent = `PKR ${totalValue.toLocaleString()}`;
    els.statsCategories.textContent = state.categories.length;
}

function renderCategories() {
    els.categoryList.innerHTML = `<li class="category-item ${currentFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">
    <span>All Items</span>
    <span class="category-count">${state.items.length}</span>
  </li>`;

    state.categories.forEach(cat => {
        const count = state.items.filter(i => i.categoryId === cat.id).length;
        els.categoryList.innerHTML += `
      <li class="category-item ${currentFilter === cat.id ? 'active' : ''}" onclick="setFilter('${cat.id}')">
        <span>${cat.name}</span>
        <span class="category-count">${count}</span>
        <button class="icon-btn delete" style="width:20px;height:20px;margin-left:auto;font-size:10px" onclick="event.stopPropagation(); deleteCategory('${cat.id}')">✕</button>
      </li>
    `;
    });
}

function renderItems() {
    const filtered = currentFilter === 'all'
        ? state.items
        : state.items.filter(i => i.categoryId === currentFilter);

    // Search Filter
    const query = els.searchInput.value.toLowerCase();
    const searchResults = filtered.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.author.toLowerCase().includes(query)
    );

    els.itemsGrid.innerHTML = '';

    if (searchResults.length === 0) {
        els.itemsGrid.innerHTML = `<div class="empty-state"><h3>No items found</h3><p>Try adding a new item or changing the category.</p></div>`;
        return;
    }

    searchResults.forEach(item => {
        const cat = state.categories.find(c => c.id === item.categoryId)?.name || 'Unknown';
        els.itemsGrid.innerHTML += `
      <div class="item-card">
        <img src="${item.image || 'assets/placeholder.jpg'}" class="item-image" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
        <div class="item-details">
          <div class="item-category">${cat}</div>
          <h3 class="item-title" title="${item.title}">${item.title}</h3>
          <div class="item-author">${item.author || 'Unknown Author'}</div>
          <div class="item-footer">
            <span class="item-price">PKR ${Number(item.price).toLocaleString()}</span>
            <div class="item-actions">
              <button class="icon-btn" onclick="editItem('${item.id}')">✎</button>
              <button class="icon-btn delete" onclick="deleteItem('${item.id}')">🗑</button>
            </div>
          </div>
        </div>
      </div>
    `;
    });
}

function updateCategorySelect() {
    els.categorySelect.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

// Logic Actions
window.setFilter = (id) => {
    currentFilter = id;
    render();
};

window.deleteCategory = (id) => {
    if (confirm('Delete this category? Items in it will remain but become uncategorized (or you can delete them).')) {
        state.categories = state.categories.filter(c => c.id !== id);
        // Optional: Delete items or move to 'Uncategorized'? Let's keep them.
        if (currentFilter === id) currentFilter = 'all';
        saveState();
    }
};

window.addCategory = () => {
    const name = prompt("Enter new category name:");
    if (name) {
        state.categories.push({ id: 'cat_' + Date.now(), name });
        saveState();
    }
};

window.deleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        state.items = state.items.filter(i => i.id !== id);
        saveState();
    }
};

// Modal Logic
let isEditing = null;

window.openModal = () => {
    isEditing = null;
    els.modalTitle.textContent = "Add New Item";
    els.itemForm.reset();
    els.modal.parentElement.classList.add('open');
};

window.editItem = (id) => {
    isEditing = id;
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    els.modalTitle.textContent = "Edit Item";
    document.getElementById('inpTitle').value = item.title;
    document.getElementById('inpAuthor').value = item.author;
    document.getElementById('inpPrice').value = item.price;
    document.getElementById('inpImage').value = item.image;
    document.getElementById('categorySelect').value = item.categoryId;

    els.modal.parentElement.classList.add('open');
};

window.closeModal = () => {
    els.modal.parentElement.classList.remove('open');
};

els.itemForm.onsubmit = (e) => {
    e.preventDefault();

    const newItem = {
        id: isEditing || 'item_' + Date.now(),
        title: document.getElementById('inpTitle').value,
        author: document.getElementById('inpAuthor').value,
        price: document.getElementById('inpPrice').value,
        image: document.getElementById('inpImage').value,
        categoryId: document.getElementById('categorySelect').value
    };

    if (isEditing) {
        const idx = state.items.findIndex(i => i.id === isEditing);
        if (idx !== -1) state.items[idx] = newItem;
    } else {
        state.items.push(newItem);
    }

    saveState();
    closeModal();
};

els.searchInput.addEventListener('input', render);

// Init
render();
