import * as supabase from './supabase-service.js';

let useSupabase = false;

export async function init(config) {
    if (config && (config.supabaseUrl || config.apiKey)) {
        try {
            await supabase.initSupabase(config);
            useSupabase = true;
            console.log("Supabase initialized successfully");
        } catch (e) {
            console.error("Supabase initialization failed", e);
        }
    } else {
        console.log("Supabase not configured. Falling back to local/Electron API.");
    }
}

const electronAPI = window.electronAPI || {
    // Mock local API for browsers/Android if Electron is missing and Supabase fails
    getCategories: async () => JSON.parse(localStorage.getItem('categories') || '[]'),
    getItems: async () => JSON.parse(localStorage.getItem('items') || '[]'),
    getInvoices: async () => JSON.parse(localStorage.getItem('invoices') || '[]'),
    addCategory: async (c) => {
        const cats = JSON.parse(localStorage.getItem('categories') || '[]');
        const id = 'cat_' + Date.now();
        cats.push({ ...c, id });
        localStorage.setItem('categories', JSON.stringify(cats));
        return id;
    },
    // ... paths for other methods ...
};

export const api = {
    getCategories: () => useSupabase ? supabase.getCategories() : electronAPI.getCategories(),
    addCategory: (data) => useSupabase ? supabase.addCategory(data) : electronAPI.addCategory(data),
    updateCategory: (data) => useSupabase ? supabase.updateCategory(data) : electronAPI.updateCategory(data),
    deleteCategory: (id) => useSupabase ? supabase.deleteCategory(id) : electronAPI.deleteCategory(id),

    getItems: () => useSupabase ? supabase.getItems() : electronAPI.getItems(),
    addItem: (item) => useSupabase ? supabase.addItem(item) : electronAPI.addItem(item),
    updateItem: (item) => useSupabase ? supabase.updateItem(item) : electronAPI.updateItem(item),
    deleteItem: (id) => useSupabase ? supabase.deleteItem(id) : electronAPI.deleteItem(id),

    addInvoice: (data) => useSupabase ? supabase.addInvoice(data) : electronAPI.addInvoice(data),
    getInvoices: () => useSupabase ? supabase.getInvoices() : electronAPI.getInvoices(),

    printToPDF: (html) => electronAPI.printToPDF ? electronAPI.printToPDF(html) : alert("Printing only supported on Desktop"),
    openExternal: (url) => electronAPI.openExternal ? electronAPI.openExternal(url) : window.open(url, '_blank')
};
