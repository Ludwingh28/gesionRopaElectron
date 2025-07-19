// Se creo el archivo src/types/global.d.ts para tipos globales

// Tipos para autenticación
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

// Tipos para el API de Electron
interface ElectronAPI {
  // Métodos básicos de IPC
  on(...args: Parameters<import("electron").IpcRenderer["on"]>): void;
  off(...args: Parameters<import("electron").IpcRenderer["off"]>): void;
  send(...args: Parameters<import("electron").IpcRenderer["send"]>): void;
  invoke(...args: Parameters<import("electron").IpcRenderer["invoke"]>): Promise<any>;

  // Autenticación
  authenticateUser: (username: string, password: string) => Promise<AuthResponse>;

  // Gestión de usuarios
  getUsers: (search: string) => Promise<any[]>;
  updateUserStatus: (userId: number, activo: boolean) => Promise<any>;
  createUser: (data: any) => Promise<any>;
  updateUser: (data: any) => Promise<any>;
  getRoles: () => Promise<any[]>;
  getUserById: (userId: number) => Promise<any>;

  // Gestión de productos
  getProducts: (search?: string) => Promise<any[]>;
  createProduct: (data: any) => Promise<any>;
  updateProduct: (data: any) => Promise<any>;
  deleteProduct: (id: number) => Promise<any>;
  updateProductPrice: (productId: number, newPrice: number) => Promise<any>;
  getBrands: () => Promise<any[]>;
  getCategories: () => Promise<any[]>;
  createBrand: (data: any) => Promise<any>;
  createCategory: (data: any) => Promise<any>;

  // Gestión de ventas
  getProductByCode: (codigo: string) => Promise<any>;
  getInventoryByProduct: (productId: number) => Promise<any[]>;
  createSale: (data: any) => Promise<any>;
  addItemToSale: (data: any) => Promise<any>;
  getSaleDetails: (ventaId: number) => Promise<any>;

  // Gestión de inventario
  getInventoryList: () => Promise<any[]>;
  getTallas: () => Promise<any[]>;
  getColores: () => Promise<any[]>;
  createInventoryItem: (data: any) => Promise<any>;
  updateInventoryStock: (inventarioId: number, newStock: number) => Promise<any>;
  deleteInventoryItem: (inventarioId: number) => Promise<any>;

  // APIs para estadísticas del dashboard
  getDashboardStats: (userId: number, rolNombre: string) => Promise<any>;
  getVentasHoy: () => Promise<{ totalVentas: number; totalPedidos: number }>;
  getStockStats: () => Promise<{ stockTotal: number; stockBajo: number }>;
  getVentasPromotoraMes: (userId: number) => Promise<{ totalVentas: number; totalGanancias: number }>;
}

// Gestión de inventario

// Extensión de la interfaz global Window
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer?: import("electron").IpcRenderer;
  }
}

export {};
