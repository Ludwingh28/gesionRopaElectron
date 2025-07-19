import { ipcRenderer, contextBridge } from "electron";

// Definir los tipos para las respuestas
interface AuthUser {
  id?: number;
  nombre?: string;
  usuario: string;
  email?: string;
  rol_nombre: string;
  activo: boolean;
}

interface AuthResponse {
  success: boolean;
  reason?: string;
  user?: AuthUser;
}

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  authenticateUser: (username: string, password: string): Promise<AuthResponse> => ipcRenderer.invoke("authenticateUser", username, password),
  getUsers: (search: string) => ipcRenderer.invoke("getUsers", search),
  updateUserStatus: (userId: number, activo: boolean) => ipcRenderer.invoke("updateUserStatus", userId, activo),
  createUser: (data: any) => ipcRenderer.invoke("createUser", data),
  updateUser: (data: any) => ipcRenderer.invoke("updateUser", data),
  getRoles: () => ipcRenderer.invoke("getRoles"),
  // API para gestión de productos:
  getProducts: (search: string = "") => ipcRenderer.invoke("getProducts", search),
  createProduct: (data: any) => ipcRenderer.invoke("createProduct", data),
  updateProduct: (data: any) => ipcRenderer.invoke("updateProduct", data),
  deleteProduct: (id: number) => ipcRenderer.invoke("deleteProduct", id),
  updateProductPrice: (productId: number, newPrice: number) => ipcRenderer.invoke("updateProductPrice", productId, newPrice),
  getBrands: () => ipcRenderer.invoke("getBrands"),
  getCategories: () => ipcRenderer.invoke("getCategories"),
  createBrand: (data: any) => ipcRenderer.invoke("createBrand", data),
  createCategory: (data: any) => ipcRenderer.invoke("createCategory", data),
  // API para gestión de ventas:
  getProductByCode: (codigo: string) => ipcRenderer.invoke("getProductByCode", codigo),
  getInventoryByProduct: (productId: number) => ipcRenderer.invoke("getInventoryByProduct", productId),
  createSale: (data: any) => ipcRenderer.invoke("createSale", data),
  addItemToSale: (data: any) => ipcRenderer.invoke("addItemToSale", data),
  getSaleDetails: (ventaId: number) => ipcRenderer.invoke("getSaleDetails", ventaId),
  getUserById: (userId: number) => ipcRenderer.invoke("getUserById", userId),
  // API para gestión de inventario:
  getInventoryList: () => ipcRenderer.invoke("getInventoryList"),
  getTallas: () => ipcRenderer.invoke("getTallas"),
  getColores: () => ipcRenderer.invoke("getColores"),
  createInventoryItem: (data: any) => ipcRenderer.invoke("createInventoryItem", data),
  updateInventoryStock: (inventarioId: number, newStock: number) => ipcRenderer.invoke("updateInventoryStock", inventarioId, newStock),
  deleteInventoryItem: (inventarioId: number) => ipcRenderer.invoke("deleteInventoryItem", inventarioId),
  // APIs para estadísticas del dashboard
  getDashboardStats: (userId: number, rolNombre: string) => ipcRenderer.invoke("getDashboardStats", userId, rolNombre),
  getVentasHoy: () => ipcRenderer.invoke("getVentasHoy"),
  getStockStats: () => ipcRenderer.invoke("getStockStats"),
  getVentasPromotoraMes: (userId: number) => ipcRenderer.invoke("getVentasPromotoraMes", userId),
  // You can expose other APTs you need here.
  // ...
});
