import React, { useState, useEffect } from "react";
import { Package, Search, RefreshCw, Trash2, AlertTriangle, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: number;
  sku: string;
  detalle: string;
  marca: string;
  categoria: string;
  talla: string;
  color: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta_base: number;
  precio_promotora: number;
  producto_id: number;
}

interface Product {
  id: number;
  codigo_interno: string;
  detalle: string;
  marca: string;
  categoria: string;
  precio_venta_base: number;
  precio_promotora: number;
}

// Interface para el usuario actual
interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

const Stock = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "low_stock" | "without_inventory">("all");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  // Cargar usuario actual del sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (err) {
        console.error("Error al parsear datos de usuario:", err);
      }
    }
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const result = await (window.electronAPI as any).getInventoryList("");
      setInventory(result);
      setError("");
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError("Error al cargar inventario");
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const result = await (window.electronAPI as any).getProducts("");
      setProducts(result);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  useEffect(() => {
    loadInventory();
    loadProducts();
  }, []);

  // Resetear página cuando cambie el modo de vista o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getLowStockItems = () => {
    return inventory.filter((item) => (item.stock_actual || 0) <= (item.stock_minimo || 0));
  };

  const getProductsWithoutInventory = () => {
    const productsWithInventory = new Set(inventory.map((item) => item.producto_id));
    return products.filter((product) => !productsWithInventory.has(product.id));
  };

  const getOutOfStockItems = () => {
    return inventory.filter((item) => (item.stock_actual || 0) <= 0);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (currentUser?.rol_nombre === "promotora") {
      alert("Como promotora, no tienes permisos para eliminar elementos del inventario.");
      return;
    }

    if (!confirm(`¿Eliminar inventario de ${item.detalle} (${item.talla} - ${item.color})?`)) {
      return;
    }

    setLoading(true);
    try {
      await (window.electronAPI as any).deleteInventoryItem(item.id);
      setInventory((prev) => prev.filter((inv) => inv.id !== item.id));
      setError("");
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError("Error al eliminar el item de inventario");
    }
    setLoading(false);
  };

  // Determinar si es promotora
  const isPromotora = currentUser?.rol_nombre === "promotora";

  // Estadísticas rápidas
  const stats = {
    totalProducts: products.length,
    productsWithInventory: [...new Set(inventory.map((i) => i.producto_id))].length,
    totalSKUs: inventory.length,
    totalStock: inventory.reduce((sum, item) => sum + (item.stock_actual || 0), 0),
    lowStock: getLowStockItems().length,
    outOfStock: getOutOfStockItems().length,
    withoutInventory: getProductsWithoutInventory().length,
  };

  // Función para obtener datos filtrados
  const getFilteredData = () => {
    let data: any[] = [];

    switch (viewMode) {
      case "all":
        data = inventory;
        break;
      case "low_stock":
        data = getLowStockItems();
        break;
      case "without_inventory":
        data = getProductsWithoutInventory();
        break;
      default:
        data = inventory;
    }

    // Filtrar por búsqueda si hay texto
    if (search.trim()) {
      data = data.filter((item: any) => {
        const searchLower = search.toLowerCase();
        if (viewMode === "without_inventory") {
          return (
            (item.detalle || "").toLowerCase().includes(searchLower) ||
            (item.codigo_interno || "").toLowerCase().includes(searchLower) ||
            (item.marca || "").toLowerCase().includes(searchLower) ||
            (item.categoria || "").toLowerCase().includes(searchLower)
          );
        } else {
          return (
            (item.detalle || "").toLowerCase().includes(searchLower) ||
            (item.sku || "").toLowerCase().includes(searchLower) ||
            (item.marca || "").toLowerCase().includes(searchLower) ||
            (item.color || "").toLowerCase().includes(searchLower) ||
            (item.categoria || "").toLowerCase().includes(searchLower)
          );
        }
      });
    }

    return data;
  };

  // Calcular datos de paginación
  const filteredData = getFilteredData();
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPageData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2 mb-6">
        Stock e Inventario
        {isPromotora && <div className="text-sm font-normal text-blue-600 dark:text-blue-400 mt-2">* Como promotora, puedes consultar el stock disponible pero no modificar inventario</div>}
      </header>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError("")} className="float-right text-red-600 hover:text-red-800 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Estadísticas (solo para admin y developer) */}
      {!isPromotora && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalProducts}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Productos Total</div>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.productsWithInventory}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Con Inventario</div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalSKUs}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">SKUs Total</div>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalStock.toLocaleString()}</div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">Stock Total</div>
          </div>
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.outOfStock}</div>
            <div className="text-sm text-red-700 dark:text-red-300">Sin Stock</div>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStock}</div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Stock Bajo</div>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.withoutInventory}</div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Sin Inventario</div>
          </div>
        </div>
      )}

      {/* Notificaciones/Alertas (solo para admin y developer) */}
      {!isPromotora && (
        <>
          {stats.outOfStock > 0 && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-2 rounded mb-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2" size={16} />
                <div className="text-sm">
                  <strong>¡Productos Agotados!</strong> Tienes {stats.outOfStock} productos sin stock disponible.
                </div>
              </div>
            </div>
          )}

          {stats.lowStock > 0 && (
            <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-400 dark:border-orange-700 text-orange-700 dark:text-orange-400 px-4 py-2 rounded mb-4">
              <div className="flex items-center">
                <TrendingDown className="mr-2" size={16} />
                <div className="text-sm">
                  <strong>¡Stock Bajo!</strong> Tienes {stats.lowStock} productos con stock bajo que necesitan reposición.
                </div>
              </div>
            </div>
          )}

          {stats.withoutInventory > 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded mb-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2" size={16} />
                <div className="text-sm">
                  <strong>¡Sin Inventario!</strong> Tienes {stats.withoutInventory} productos sin inventario configurado.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por SKU, producto, marca, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button type="submit" className="bg-[#e87e8a] dark:bg-[#d6a463] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d16b77] dark:hover:bg-[#c1935a] transition cursor-pointer">
            Buscar
          </button>
        </form>

        <div className="flex gap-2">
          {/* Filtros de vista (solo para admin y developer) */}
          {!isPromotora && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-md font-semibold cursor-pointer flex items-center gap-2 ${
                  viewMode === "all" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <Package size={16} />
                Todo ({stats.totalSKUs})
              </button>
              <button
                onClick={() => setViewMode("low_stock")}
                className={`px-4 py-2 rounded-md font-semibold cursor-pointer flex items-center gap-2 ${
                  viewMode === "low_stock" ? "bg-orange-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <TrendingDown size={16} />
                Stock Bajo ({stats.lowStock})
              </button>
              <button
                onClick={() => setViewMode("without_inventory")}
                className={`px-4 py-2 rounded-md font-semibold cursor-pointer flex items-center gap-2 ${
                  viewMode === "without_inventory" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <AlertTriangle size={16} />
                Sin Inventario ({stats.withoutInventory})
              </button>
            </div>
          )}

          <button onClick={loadInventory} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition cursor-pointer" disabled={loading}>
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Información de paginación */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Mostrando {startIndex + 1} a {endIndex} de {totalItems} {viewMode === "without_inventory" ? "productos" : "elementos"}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 cursor-pointer"
                >
                  Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e87e8a] dark:border-[#d6a463] mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando inventario...</p>
          </div>
        ) : (
          <>
            {/* Tabla principal de inventario */}
            {(viewMode === "all" || isPromotora) && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <th className="text-left py-3 px-4 font-semibold">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold">SKU</th>
                      <th className="text-center py-3 px-4 font-semibold">Talla</th>
                      <th className="text-center py-3 px-4 font-semibold">Color</th>
                      <th className="text-center py-3 px-4 font-semibold">Stock</th>
                      <th className="text-center py-3 px-4 font-semibold">Estado</th>
                      <th className="text-center py-3 px-4 font-semibold">Precio Base</th>
                      {isPromotora && <th className="text-center py-3 px-4 font-semibold">Precio Promotora</th>}
                      {!isPromotora && <th className="text-center py-3 px-4 font-semibold">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.length === 0 ? (
                      <tr>
                        <td colSpan={isPromotora ? 8 : 8} className="text-center py-8 text-gray-500">
                          No se encontraron elementos en el inventario
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{item.detalle || "Sin detalle"}</div>
                              <div className="text-sm text-gray-500">
                                {item.marca || "Sin marca"} - {item.categoria || "Sin categoría"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{item.sku || "Sin SKU"}</td>
                          <td className="py-3 px-4 text-center">{item.talla || "N/A"}</td>
                          <td className="py-3 px-4 text-center">{item.color || "N/A"}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-semibold ${
                                (item.stock_actual || 0) <= 0
                                  ? "text-red-600 dark:text-red-400"
                                  : (item.stock_actual || 0) <= (item.stock_minimo || 0)
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {item.stock_actual || 0}
                            </span>
                            <div className="text-xs text-gray-500">Mín: {item.stock_minimo || 0}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {(item.stock_actual || 0) <= 0 ? (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs">Sin Stock</span>
                            ) : (item.stock_actual || 0) <= (item.stock_minimo || 0) ? (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-xs">Stock Bajo</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">OK</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">Bs. {parseFloat(item.precio_venta_base) > 0 ? parseFloat(item.precio_venta_base).toFixed(2) : "0.00"}</td>
                          {isPromotora && (
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                Bs. {parseFloat(item.precio_promotora) > 0 ? parseFloat(item.precio_promotora).toFixed(2) : "0.00"}
                              </span>
                              <div className="text-xs text-gray-500">+20%</div>
                            </td>
                          )}
                          {!isPromotora && (
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleDeleteItem(item)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Vista de stock bajo (solo para admin y developer) */}
            {viewMode === "low_stock" && !isPromotora && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20">
                      <th className="text-left py-3 px-4 font-semibold">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold">SKU</th>
                      <th className="text-center py-3 px-4 font-semibold">Talla</th>
                      <th className="text-center py-3 px-4 font-semibold">Color</th>
                      <th className="text-center py-3 px-4 font-semibold">Stock Actual</th>
                      <th className="text-center py-3 px-4 font-semibold">Stock Mínimo</th>
                      <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          ¡Excelente! No hay productos con stock bajo
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{item.detalle || "Sin detalle"}</div>
                              <div className="text-sm text-gray-500">
                                {item.marca || "Sin marca"} - {item.categoria || "Sin categoría"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{item.sku || "Sin SKU"}</td>
                          <td className="py-3 px-4 text-center">{item.talla || "N/A"}</td>
                          <td className="py-3 px-4 text-center">{item.color || "N/A"}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-orange-600 dark:text-orange-400">{item.stock_actual || 0}</span>
                          </td>
                          <td className="py-3 px-4 text-center">{item.stock_minimo || 0}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleDeleteItem(item)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Vista de productos sin inventario (solo para admin y developer) */}
            {viewMode === "without_inventory" && !isPromotora && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                      <th className="text-left py-3 px-4 font-semibold">Código</th>
                      <th className="text-left py-3 px-4 font-semibold">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold">Marca</th>
                      <th className="text-left py-3 px-4 font-semibold">Categoría</th>
                      <th className="text-center py-3 px-4 font-semibold">Precio Base</th>
                      <th className="text-center py-3 px-4 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          ¡Perfecto! Todos los productos tienen inventario configurado
                        </td>
                      </tr>
                    ) : (
                      currentPageData.map((product: any) => (
                        <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10">
                          <td className="py-3 px-4 font-mono text-sm">{product.codigo_interno || "Sin código"}</td>
                          <td className="py-3 px-4 font-medium">{product.detalle || "Sin detalle"}</td>
                          <td className="py-3 px-4">{product.marca || "Sin marca"}</td>
                          <td className="py-3 px-4">{product.categoria || "Sin categoría"}</td>
                          <td className="py-3 px-4 text-center">Bs. {parseFloat(product.precio_venta_base) > 0 ? parseFloat(product.precio_venta_base).toFixed(2) : "0.00"}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs flex items-center justify-center gap-1">
                              <AlertTriangle size={12} />
                              Sin Inventario
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Controles de paginación inferiores */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                « Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                Siguiente »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
