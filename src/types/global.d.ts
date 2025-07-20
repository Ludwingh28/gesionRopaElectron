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

// Tipos para usuarios
interface User {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
  telefono: string;
  rol_nombre: string;
  activo: boolean;
}

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

// Tipos para roles
interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Tipos para respuestas de API
interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// Tipos para productos
interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  codigo: string;
  marca_id: number;
  categoria_id: number;
  marca_nombre?: string;
  categoria_nombre?: string;
}

interface ProductCreateData {
  nombre: string;
  descripcion?: string;
  precio: number;
  codigo: string;
  marca_id: number;
  categoria_id: number;
}

interface Brand {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Tipos para ventas
interface Sale {
  id: number;
  fecha: string;
  total: number;
  metodo_pago: string;
  usuario_id: number;
  usuario_nombre?: string;
}

interface SaleItem {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
}

interface SaleCreateData {
  total: number;
  metodo_pago: string;
  usuario_id: number;
}

// Tipos para inventario
interface InventoryItem {
  id: number;
  producto_id: number;
  talla: string;
  color: string;
  stock: number;
  producto_nombre?: string;
  producto_codigo?: string;
}

interface InventoryCreateData {
  producto_id: number;
  talla: string;
  color: string;
  stock: number;
}

interface Size {
  id: number;
  nombre: string;
}

interface Color {
  id: number;
  nombre: string;
}

// Tipos para reportes
interface ProductSalesReport {
  producto_id: number;
  producto_nombre: string;
  total_vendido: number;
  cantidad_vendida: number;
}

interface PromoterRanking {
  usuario_id: number;
  usuario_nombre: string;
  total_ventas: number;
  total_ganancias: number;
}

interface MonthlySalesComparison {
  mes: string;
  total_ventas: number;
  total_ganancias: number;
}

interface CategoryAnalysis {
  categoria_id: number;
  categoria_nombre: string;
  total_ventas: number;
  cantidad_vendida: number;
}

interface BrandAnalysis {
  marca_id: number;
  marca_nombre: string;
  total_ventas: number;
  cantidad_vendida: number;
}

interface CriticalInventoryReport {
  producto_id: number;
  producto_nombre: string;
  stock_actual: number;
  stock_minimo: number;
}

interface PaymentMethodReport {
  metodo_pago: string;
  total_ventas: number;
  cantidad_ventas: number;
}

interface ExecutiveSummary {
  total_ventas: number;
  total_ganancias: number;
  cantidad_ventas: number;
  promedio_venta: number;
}

// Tipos para dashboard
interface DashboardStats {
  total_ventas_hoy: number;
  total_pedidos_hoy: number;
  stock_total: number;
  stock_bajo: number;
  ventas_mes: number;
  ganancias_mes: number;
}

// Tipos para el API de Electron
interface ElectronAPI {
  // Métodos básicos de IPC
  on(...args: Parameters<import("electron").IpcRenderer["on"]>): void;
  off(...args: Parameters<import("electron").IpcRenderer["off"]>): void;
  send(...args: Parameters<import("electron").IpcRenderer["send"]>): void;
  invoke(...args: Parameters<import("electron").IpcRenderer["invoke"]>): Promise<unknown>;

  // Autenticación
  authenticateUser: (username: string, password: string) => Promise<AuthResponse>;

  // Gestión de usuarios
  getUsers: (search: string) => Promise<User[]>;
  updateUserStatus: (userId: number, activo: boolean) => Promise<ApiResponse>;
  createUser: (data: UserCreateData) => Promise<ApiResponse>;
  updateUser: (data: UserUpdateData & { id: number }) => Promise<ApiResponse>;
  getRoles: () => Promise<Role[]>;
  getUserById: (userId: number) => Promise<User>;

  // Gestión de productos
  getProducts: (search?: string) => Promise<Product[]>;
  createProduct: (data: ProductCreateData) => Promise<ApiResponse>;
  updateProduct: (data: Product) => Promise<ApiResponse>;
  deleteProduct: (id: number) => Promise<ApiResponse>;
  updateProductPrice: (productId: number, newPrice: number) => Promise<ApiResponse>;
  getBrands: () => Promise<Brand[]>;
  getCategories: () => Promise<Category[]>;
  createBrand: (data: Brand) => Promise<ApiResponse>;
  createCategory: (data: Category) => Promise<ApiResponse>;

  // Gestión de ventas
  getProductByCode: (codigo: string) => Promise<Product>;
  getInventoryByProduct: (productId: number) => Promise<InventoryItem[]>;
  createSale: (data: SaleCreateData) => Promise<Sale>;
  addItemToSale: (data: SaleItem) => Promise<SaleItem>;
  getSaleDetails: (ventaId: number) => Promise<Sale & { items: SaleItem[] }>;

  // Gestión de inventario
  getInventoryList: () => Promise<InventoryItem[]>;
  getTallas: () => Promise<Size[]>;
  getColores: () => Promise<Color[]>;
  createInventoryItem: (data: InventoryCreateData) => Promise<InventoryItem>;
  updateInventoryStock: (inventarioId: number, newStock: number) => Promise<InventoryItem>;
  deleteInventoryItem: (inventarioId: number) => Promise<ApiResponse>;

  // APIs para estadísticas del dashboard
  getDashboardStats: (userId: number, rolNombre: string) => Promise<DashboardStats>;
  getVentasHoy: () => Promise<{ totalVentas: number; totalPedidos: number }>;
  getStockStats: () => Promise<{ stockTotal: number; stockBajo: number }>;
  getVentasPromotoraMes: (userId: number) => Promise<{ totalVentas: number; totalGanancias: number }>;
  // APIs para gestión de entrada de productos/inventario
  addStockToInventory: (inventarioId: number, cantidad: number, motivo: string, usuarioId: number) => Promise<InventoryItem>;
  searchProductsWithInventory: (search?: string) => Promise<Product[]>;
  getProductInventoryDetails: (productId: number) => Promise<InventoryItem[]>;
  // APIs para reportes
  getProductosMasVendidos: (fechaInicio?: string, fechaFin?: string, limite?: number) => Promise<ProductSalesReport[]>;
  getRankingPromotoras: (fechaInicio?: string, fechaFin?: string) => Promise<PromoterRanking[]>;
  getComparativoVentasMensuales: (mesesAtras?: number) => Promise<MonthlySalesComparison[]>;
  getAnalisisPorCategorias: (fechaInicio?: string, fechaFin?: string) => Promise<CategoryAnalysis[]>;
  getAnalisisPorMarcas: (fechaInicio?: string, fechaFin?: string) => Promise<BrandAnalysis[]>;
  getReporteInventarioCritico: () => Promise<CriticalInventoryReport[]>;
  getVentasPorMetodoPago: (fechaInicio?: string, fechaFin?: string) => Promise<PaymentMethodReport[]>;
  getResumenEjecutivo: (fechaInicio?: string, fechaFin?: string) => Promise<ExecutiveSummary>;
}

// Gestión de inventario

// Extensión de la interfaz global Window
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer?: import("electron").IpcRenderer;
  }
}

export { 
  User, Role, UserCreateData, UserUpdateData, ApiResponse,
  Product, ProductCreateData, Brand, Category,
  Sale, SaleItem, SaleCreateData,
  InventoryItem, InventoryCreateData, Size, Color,
  ProductSalesReport, PromoterRanking, MonthlySalesComparison,
  CategoryAnalysis, BrandAnalysis, CriticalInventoryReport,
  PaymentMethodReport, ExecutiveSummary, DashboardStats
};
