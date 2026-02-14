import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let db;

export async function initFirebase(config) {
    const app = initializeApp(config);
    db = getFirestore(app);
    return db;
}

// Categories
export async function getCategories() {
    const col = collection(db, "categories");
    const snapshot = await getDocs(col);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addCategory(data) {
    const col = collection(db, "categories");
    const docRef = await addDoc(col, data);
    return docRef.id;
}

export async function updateCategory(data) {
    const { id, ...rest } = data;
    await updateDoc(doc(db, "categories", id), rest);
}

export async function deleteCategory(id) {
    await deleteDoc(doc(db, "categories", id));
}

// Items
export async function getItems() {
    const col = collection(db, "items");
    const snapshot = await getDocs(col);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addItem(item) {
    const col = collection(db, "items");
    const docRef = await addDoc(col, item);
    return docRef.id;
}

export async function updateItem(item) {
    const { id, ...rest } = item;
    await updateDoc(doc(db, "items", id), rest);
}

export async function deleteItem(id) {
    await deleteDoc(doc(db, "items", id));
}

// Invoices
export async function getInvoices() {
    const col = collection(db, "invoices");
    const q = query(col, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addInvoice(data) {
    const { invoice, items } = data;
    const col = collection(db, "invoices");
    // Store invoice
    const docRef = await addDoc(col, { ...invoice, items });

    // Update stock levels in items
    for (const item of items) {
        const itemRef = doc(db, "items", item.id);
        // This is a simple update, in a real app you'd use a transaction
        await updateDoc(itemRef, {
            stock: item.stock - item.quantity
        });
    }
    return docRef.id;
}
