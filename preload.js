const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Database
    getCategories: () => ipcRenderer.invoke('db:getCategories'),
    addCategory: (data) => ipcRenderer.invoke('db:addCategory', data),
    updateCategory: (data) => ipcRenderer.invoke('db:updateCategory', data),
    deleteCategory: (id) => ipcRenderer.invoke('db:deleteCategory', id),

    getItems: () => ipcRenderer.invoke('db:getItems'),
    addItem: (item) => ipcRenderer.invoke('db:addItem', item),
    updateItem: (item) => ipcRenderer.invoke('db:updateItem', item),
    deleteItem: (id) => ipcRenderer.invoke('db:deleteItem', id),

    addInvoice: (data) => ipcRenderer.invoke('db:addInvoice', data),
    getInvoices: () => ipcRenderer.invoke('db:getInvoices'),

    // Utilities
    printToPDF: (html) => ipcRenderer.invoke('print-to-pdf', html),
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
