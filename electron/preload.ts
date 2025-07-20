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

// Interfaces para datos de usuario
interface UserCreateData {
  nombre: string;
  usuario: string;
  email: string;
  telefono: string;
  password: string;
  rol_id: number;
}

interface UserUpdateData {
  nombre?: string;
  usuario?: string;
  email?: string;
  telefono?: string;
  password?: string;
  rol_id?: number;
}

// Interfaces para productos
interface ProductCreateData {
  detalle: string;
  marca_id: number;
  categoria_id: number;
  costo_compra: number;
  precio_venta_base: number;
  activo: boolean;
}

interface Product {
  id: number;
  detalle: string;
  marca_id: number;
  categoria_id: number;
  costo_compra: number;
  precio_venta_base: number;
  activo: boolean;
}

interface Brand {
  id: number;
  nombre: string;
}

interface Category {
  id: number;
  nombre: string;
}

// Interfaces para ventas
interface SaleCreateData {
  usuario_id: number;
  cliente_nombre: string;
  cliente_documento: string;
  metodo_pago: string;
  observaciones?: string;
}

interface SaleItem {
  venta_id: number;
  inventario_id: number;
  cantidad: number;
}

// Interfaces para inventario
interface InventoryCreateData {
  producto_id: number;
  talla_id: number;
  color_id: number;
  stock_actual: number;
  stock_minimo: number;
  ubicacion?: string;
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
  createUser: (data: UserCreateData) => ipcRenderer.invoke("createUser", data),
  updateUser: (data: UserUpdateData & { id: number }) => ipcRenderer.invoke("updateUser", data),
  getRoles: () => ipcRenderer.invoke("getRoles"),
  // API para gestión de productos:
  getProducts: (search: string = "") => ipcRenderer.invoke("getProducts", search),
  createProduct: (data: ProductCreateData) => ipcRenderer.invoke("createProduct", data),
  updateProduct: (data: Product) => ipcRenderer.invoke("updateProduct", data),
  deleteProduct: (id: number) => ipcRenderer.invoke("deleteProduct", id),
  updateProductPrice: (productId: number, newPrice: number) => ipcRenderer.invoke("updateProductPrice", productId, newPrice),
  getBrands: () => ipcRenderer.invoke("getBrands"),
  getCategories: () => ipcRenderer.invoke("getCategories"),
  createBrand: (data: Brand) => ipcRenderer.invoke("createBrand", data),
  createCategory: (data: Category) => ipcRenderer.invoke("createCategory", data),
  // API para gestión de ventas:
  getProductByCode: (codigo: string) => ipcRenderer.invoke("getProductByCode", codigo),
  getInventoryByProduct: (productId: number) => ipcRenderer.invoke("getInventoryByProduct", productId),
  createSale: (data: SaleCreateData) => ipcRenderer.invoke("createSale", data),
  addItemToSale: (data: SaleItem) => ipcRenderer.invoke("addItemToSale", data),
  getSaleDetails: (ventaId: number) => ipcRenderer.invoke("getSaleDetails", ventaId),
  getUserById: (userId: number) => ipcRenderer.invoke("getUserById", userId),
  // API para gestión de inventario:
  getInventoryList: () => ipcRenderer.invoke("getInventoryList"),
  getTallas: () => ipcRenderer.invoke("getTallas"),
  getColores: () => ipcRenderer.invoke("getColores"),
  createInventoryItem: (data: InventoryCreateData) => ipcRenderer.invoke("createInventoryItem", data),
  updateInventoryStock: (inventarioId: number, newStock: number) => ipcRenderer.invoke("updateInventoryStock", inventarioId, newStock),
  deleteInventoryItem: (inventarioId: number) => ipcRenderer.invoke("deleteInventoryItem", inventarioId),
  // APIs para estadísticas del dashboard
  getDashboardStats: (userId: number, rolNombre: string) => ipcRenderer.invoke("getDashboardStats", userId, rolNombre),
  getVentasHoy: () => ipcRenderer.invoke("getVentasHoy"),
  getStockStats: () => ipcRenderer.invoke("getStockStats"),
  getVentasPromotoraMes: (userId: number) => ipcRenderer.invoke("getVentasPromotoraMes", userId),
  // APIs para gestión de entrada de productos/inventario
  addStockToInventory: (inventarioId: number, cantidad: number, motivo: string, usuarioId: number) => ipcRenderer.invoke("addStockToInventory", inventarioId, cantidad, motivo, usuarioId),
  searchProductsWithInventory: (search?: string) => ipcRenderer.invoke("searchProductsWithInventory", search),
  getProductInventoryDetails: (productId: number) => ipcRenderer.invoke("getProductInventoryDetails", productId),
  // APIs para reportes
  getProductosMasVendidos: (fechaInicio?: string, fechaFin?: string, limite?: number) => ipcRenderer.invoke("getProductosMasVendidos", fechaInicio, fechaFin, limite),
  getRankingPromotoras: (fechaInicio?: string, fechaFin?: string) => ipcRenderer.invoke("getRankingPromotoras", fechaInicio, fechaFin),
  getComparativoVentasMensuales: (mesesAtras?: number) => ipcRenderer.invoke("getComparativoVentasMensuales", mesesAtras),
  getAnalisisPorCategorias: (fechaInicio?: string, fechaFin?: string) => ipcRenderer.invoke("getAnalisisPorCategorias", fechaInicio, fechaFin),
  getAnalisisPorMarcas: (fechaInicio?: string, fechaFin?: string) => ipcRenderer.invoke("getAnalisisPorMarcas", fechaInicio, fechaFin),
  getReporteInventarioCritico: () => ipcRenderer.invoke("getReporteInventarioCritico"),
  getVentasPorMetodoPago: (fechaInicio?: string, fechaFin?: string) => ipcRenderer.invoke("getVentasPorMetodoPago", fechaInicio, fechaFin),
  getResumenEjecutivo: (fechaInicio?: string, fechaFin?: string) => ipcRenderer.invoke("getResumenEjecutivo", fechaInicio, fechaFin),
  // You can expose other APTs you need here.
  // ...
});
