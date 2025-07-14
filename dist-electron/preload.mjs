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
  createCategory: (data) => electron.ipcRenderer.invoke("createCategory", data)
  // You can expose other APTs you need here.
  // ...
});
