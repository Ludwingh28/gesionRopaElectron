"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  authenticateUser: (username, password) => electron.ipcRenderer.invoke("authenticateUser", username, password),
  getUsers: (search) => electron.ipcRenderer.invoke("getUsers", search),
  updateUserStatus: (userId, activo) => electron.ipcRenderer.invoke("updateUserStatus", userId, activo),
  createUser: (data) => electron.ipcRenderer.invoke("createUser", data),
  updateUser: (data) => electron.ipcRenderer.invoke("updateUser", data),
  getRoles: () => electron.ipcRenderer.invoke("getRoles"),
  // API para gestión de productos:
  getProducts: (search = "") => electron.ipcRenderer.invoke("getProducts", search),
  createProduct: (data) => electron.ipcRenderer.invoke("createProduct", data),
  updateProduct: (data) => electron.ipcRenderer.invoke("updateProduct", data),
  deleteProduct: (id) => electron.ipcRenderer.invoke("deleteProduct", id),
  updateProductPrice: (productId, newPrice) => electron.ipcRenderer.invoke("updateProductPrice", productId, newPrice),
  getBrands: () => electron.ipcRenderer.invoke("getBrands"),
  getCategories: () => electron.ipcRenderer.invoke("getCategories"),
  createBrand: (data) => electron.ipcRenderer.invoke("createBrand", data),
  createCategory: (data) => electron.ipcRenderer.invoke("createCategory", data),
  // API para gestión de ventas:
  getProductByCode: (codigo) => electron.ipcRenderer.invoke("getProductByCode", codigo),
  getInventoryByProduct: (productId) => electron.ipcRenderer.invoke("getInventoryByProduct", productId),
  createSale: (data) => electron.ipcRenderer.invoke("createSale", data),
  addItemToSale: (data) => electron.ipcRenderer.invoke("addItemToSale", data),
  getSaleDetails: (ventaId) => electron.ipcRenderer.invoke("getSaleDetails", ventaId),
  getUserById: (userId) => electron.ipcRenderer.invoke("getUserById", userId),
  // API para gestión de inventario:
  getInventoryList: () => electron.ipcRenderer.invoke("getInventoryList"),
  getTallas: () => electron.ipcRenderer.invoke("getTallas"),
  getColores: () => electron.ipcRenderer.invoke("getColores"),
  createInventoryItem: (data) => electron.ipcRenderer.invoke("createInventoryItem", data),
  updateInventoryStock: (inventarioId, newStock) => electron.ipcRenderer.invoke("updateInventoryStock", inventarioId, newStock),
  deleteInventoryItem: (inventarioId) => electron.ipcRenderer.invoke("deleteInventoryItem", inventarioId),
  // APIs para estadísticas del dashboard
  getDashboardStats: (userId, rolNombre) => electron.ipcRenderer.invoke("getDashboardStats", userId, rolNombre),
  getVentasHoy: () => electron.ipcRenderer.invoke("getVentasHoy"),
  getStockStats: () => electron.ipcRenderer.invoke("getStockStats"),
  getVentasPromotoraMes: (userId) => electron.ipcRenderer.invoke("getVentasPromotoraMes", userId)
  // You can expose other APTs you need here.
  // ...
});
