const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const db = require('./database');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Maktab Shop - Inventory Management",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'assets/icon.png')
    });

    win.loadFile('inventory.html');

    // Open external links in browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(async () => {
    try {
        // Setup Database Path
        // We use 'Documents/MaktabShop' because that folder is usually auto-synced by OneDrive on Windows
        const dbPath = path.join(app.getPath('documents'), 'MaktabShop', 'inventory.db');
        console.log("Initializing database at:", dbPath);

        await db.init(dbPath);

        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    } catch (err) {
        console.error("Failed to initialize app:", err);
        // Show a simple error dialog if possible or just quit
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for Database
ipcMain.handle('db:getCategories', async () => db.getCategories());
ipcMain.handle('db:addCategory', async (event, data) => db.addCategory(data));
ipcMain.handle('db:updateCategory', async (event, data) => db.updateCategory(data));
ipcMain.handle('db:deleteCategory', async (event, id) => db.deleteCategory(id));

ipcMain.handle('db:getItems', async () => db.getItems());
ipcMain.handle('db:addItem', async (event, item) => db.addItem(item));
ipcMain.handle('db:updateItem', async (event, item) => db.updateItem(item));
ipcMain.handle('db:deleteItem', async (event, id) => db.deleteItem(id));

ipcMain.handle('db:addInvoice', async (event, { invoice, items }) => db.addInvoice(invoice, items));
ipcMain.handle('db:getInvoices', async () => db.getInvoices());

ipcMain.handle('open-external', async (event, url) => {
    shell.openExternal(url);
});

// IPC Handler for Invoices Printing/Sharing
ipcMain.handle('print-to-pdf', async (event, htmlContent) => {
    const win = new BrowserWindow({ show: false });
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    const pdfPath = path.join(app.getPath('downloads'), `invoice_${Date.now()}.pdf`);
    const data = await win.webContents.printToPDF({});
    fs.writeFileSync(pdfPath, data);
    shell.showItemInFolder(pdfPath);
    win.close();
    return pdfPath;
});
