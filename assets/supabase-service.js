import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let supabase;

export async function initSupabase(config) {
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    return supabase;
}

// Categories
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*');
    if (error) throw error;
    return data;
}

export async function addCategory(data) {
    const { data: inserted, error } = await supabase
        .from('categories')
        .insert([data])
        .select();
    if (error) throw error;
    return inserted[0].id;
}

export async function updateCategory(data) {
    const { id, ...rest } = data;
    const { error } = await supabase
        .from('categories')
        .update(rest)
        .eq('id', id);
    if (error) throw error;
}

export async function deleteCategory(id) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// Items
export async function getItems() {
    const { data, error } = await supabase
        .from('items')
        .select('*');
    if (error) throw error;
    return data;
}

export async function addItem(item) {
    const { data: inserted, error } = await supabase
        .from('items')
        .insert([item])
        .select();
    if (error) throw error;
    return inserted[0].id;
}

export async function updateItem(item) {
    const { id, ...rest } = item;
    const { error } = await supabase
        .from('items')
        .update(rest)
        .eq('id', id);
    if (error) throw error;
}

export async function deleteItem(id) {
    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// Invoices
export async function getInvoices() {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });
    if (error) throw error;
    return data;
}

export async function addInvoice(data) {
    const { invoice, items } = data;
    // We'll store items as a JSONB column in Supabase for consistency with the Firebase implementation
    const { data: inserted, error } = await supabase
        .from('invoices')
        .insert([{ ...invoice, items }])
        .select();

    if (error) throw error;

    // Update stock levels in items
    for (const item of items) {
        const { error: updateError } = await supabase
            .rpc('decrement_stock', { item_id: item.id, qty: item.quantity });

        // Fallback if RPC doesn't exist (though RPC is recommended for atomicity)
        if (updateError) {
            console.warn("RPC decrement_stock failed, falling back to simple update", updateError);
            const { data: currentItem } = await supabase.from('items').select('stock').eq('id', item.id).single();
            if (currentItem) {
                await supabase.from('items').update({ stock: currentItem.stock - item.quantity }).eq('id', item.id);
            }
        }
    }
    return inserted[0].id;
}
