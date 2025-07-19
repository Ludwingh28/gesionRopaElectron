import React, { useState, useEffect } from "react";
import { Package, Trash2, AlertTriangle, RefreshCw, Eye, TrendingDown } from "lucide-react";

interface Product {
  id: number;
  codigo_interno: string;
  detalle: string;
  marca: string;
  categoria: string;
  precio_venta_base: number;
  precio_promotora: number;
}

interface InventoryItem {
  id: number;
  sku: string;
  producto_id: number;
  detalle: string;
  marca: string;
  categoria: string;
  talla: string;
  color: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion?: string;
  codigo_interno: string;
}

const Stock = () => {
  // Estados principales
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"inventory" | "without_inventory" | "low_stock">("inventory");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Resetear página al cambiar modo de vista o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, search]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsData, inventoryData] = await Promise.all([(window.electronAPI as any).getProducts(""), (window.electronAPI as any).getInventoryList()]);

      setProducts(productsData);
      setInventory(inventoryData);
      setError("");
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar datos iniciales");
    }
    setLoading(false);
  };

  // Buscar productos sin inventario
  const getProductsWithoutInventory = () => {
    return products.filter((product) => !inventory.some((inv) => inv.producto_id === product.id));
  };

  // Obtener productos con stock bajo
  const getLowStockItems = () => {
    return inventory.filter((item) => item.stock_actual <= item.stock_minimo);
  };

  // Filtrar inventario por búsqueda
  const filteredInventory = inventory.filter(
    (item) =>
      item.detalle.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.marca.toLowerCase().includes(search.toLowerCase()) ||
      item.codigo_interno.toLowerCase().includes(search.toLowerCase())
  );

  // Productos sin inventario filtrados
  const productsWithoutInventory = getProductsWithoutInventory().filter(
    (product) =>
      product.detalle.toLowerCase().includes(search.toLowerCase()) || product.codigo_interno.toLowerCase().includes(search.toLowerCase()) || product.marca.toLowerCase().includes(search.toLowerCase())
  );

  // Items con stock bajo filtrados
  const lowStockItems = getLowStockItems().filter(
    (item) =>
      item.detalle.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.marca.toLowerCase().includes(search.toLowerCase()) ||
      item.codigo_interno.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular paginación por tipo de vista
  const getInventoryPagination = () => {
    const totalItems = filteredInventory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredInventory.slice(startIndex, endIndex);
    return { totalItems, totalPages, startIndex, endIndex, currentItems };
  };

  const getLowStockPagination = () => {
    const totalItems = lowStockItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = lowStockItems.slice(startIndex, endIndex);
    return { totalItems, totalPages, startIndex, endIndex, currentItems };
  };

  const getWithoutInventoryPagination = () => {
    const totalItems = productsWithoutInventory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = productsWithoutInventory.slice(startIndex, endIndex);
    return { totalItems, totalPages, startIndex, endIndex, currentItems };
  };

  // Obtener paginación actual según el modo
  const getCurrentPagination = () => {
    switch (viewMode) {
      case "inventory":
        return getInventoryPagination();
      case "low_stock":
        return getLowStockPagination();
      case "without_inventory":
        return getWithoutInventoryPagination();
      default:
        return { totalItems: 0, totalPages: 0, startIndex: 0, endIndex: 0, currentItems: [] };
    }
  };

  const { totalItems, totalPages, startIndex, endIndex, currentItems } = getCurrentPagination();

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };
  // Eliminar item de inventario
  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`¿Eliminar inventario de ${item.detalle} (${item.talla} - ${item.color})?`)) {
      return;
    }

    setLoading(true);
    try {
      await (window.electronAPI as any).deleteInventoryItem(item.id);

      // Actualizar el estado local
      setInventory((prev) => prev.filter((inv) => inv.id !== item.id));

      setError("");
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError("Error al eliminar el item de inventario");
    }
    setLoading(false);
  };

  // Estadísticas rápidas
  const stats = {
    totalProducts: products.length,
    productsWithInventory: [...new Set(inventory.map((i) => i.producto_id))].length,
    totalSKUs: inventory.length,
    totalStock: inventory.reduce((sum, item) => sum + item.stock_actual, 0),
    lowStock: getLowStockItems().length,
    withoutInventory: getProductsWithoutInventory().length,
  };

  return (
    <div className="p-6">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2 mb-6">Stock e Inventario</header>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError("")} className="float-right text-red-600 hover:text-red-800 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalStock}</div>
          <div className="text-sm text-indigo-700 dark:text-indigo-300">Stock Total</div>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStock}</div>
          <div className="text-sm text-orange-700 dark:text-orange-300">Stock Bajo</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.withoutInventory}</div>
          <div className="text-sm text-red-700 dark:text-red-300">Sin Inventario</div>
        </div>
      </div>

      {/* Alertas */}
      {stats.lowStock > 0 && (
        <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-400 dark:border-orange-700 text-orange-700 dark:text-orange-400 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <TrendingDown className="mr-2" size={20} />
            <div>
              <strong>¡Atención!</strong> Tienes {stats.lowStock} productos con stock bajo.
            </div>
          </div>
        </div>
      )}

      {stats.withoutInventory > 0 && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            <div>
              <strong>¡Atención!</strong> Tienes {stats.withoutInventory} productos sin inventario.
            </div>
          </div>
        </div>
      )}

      {/* Controles superiores */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Búsqueda */}
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por código, producto, SKU o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 md:w-80 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button onClick={loadInitialData} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Botones de vista */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("inventory")}
            className={`px-4 py-2 rounded-md font-semibold cursor-pointer flex items-center gap-2 ${
              viewMode === "inventory" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <Eye size={16} />
            Inventario ({stats.totalSKUs})
          </button>
          <button
            onClick={() => setViewMode("low_stock")}
            className={`px-4 py-2 rounded-md font-semibold cursor-pointer flex items-center gap-2 ${
              viewMode === "low_stock" ? "bg-orange-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <TrendingDown size={16} />
            Stock Bajo ({stats.lowStock})
          </button>
          <button
            onClick={() => setViewMode("without_inventory")}
            className={`px-4 py-2 rounded-md font-semibold cursor-pointer flex items-center gap-2 ${
              viewMode === "without_inventory" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <AlertTriangle size={16} />
            Sin Inventario ({stats.withoutInventory})
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            {viewMode === "inventory" && (
              <>
                <Package className="mr-2" size={20} />
                Inventario Completo
              </>
            )}
            {viewMode === "low_stock" && (
              <>
                <TrendingDown className="mr-2" size={20} />
                Productos con Stock Bajo
              </>
            )}
            {viewMode === "without_inventory" && (
              <>
                <AlertTriangle className="mr-2" size={20} />
                Productos sin Inventario
              </>
            )}
          </h3>

          {/* Información de paginación */}
          {totalItems > 0 && (
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} {viewMode === "without_inventory" ? "productos" : "items"}
              </span>
              <span>
                Página {currentPage} de {totalPages}
              </span>
            </div>
          )}

          {totalItems === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {search
                ? "No se encontraron resultados"
                : viewMode === "inventory"
                ? "No hay inventario disponible"
                : viewMode === "low_stock"
                ? "No hay productos con stock bajo"
                : "¡Todos los productos tienen inventario!"}
            </p>
          ) : (
            <>
              {/* Tabla para inventario completo */}
              {viewMode === "inventory" && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold">Producto</th>
                        <th className="text-left py-3 px-4 font-semibold">SKU</th>
                        <th className="text-center py-3 px-4 font-semibold">Talla</th>
                        <th className="text-center py-3 px-4 font-semibold">Color</th>
                        <th className="text-center py-3 px-4 font-semibold">Stock</th>
                        <th className="text-center py-3 px-4 font-semibold">Estado</th>
                        <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentItems as InventoryItem[]).map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{item.detalle}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.codigo_interno} | {item.marca}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{item.sku}</td>
                          <td className="py-3 px-4 text-center">{item.talla}</td>
                          <td className="py-3 px-4 text-center">{item.color}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-semibold ${
                                item.stock_actual <= 0
                                  ? "text-red-600 dark:text-red-400"
                                  : item.stock_actual <= item.stock_minimo
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {item.stock_actual}
                            </span>
                            <div className="text-xs text-gray-500">Mín: {item.stock_minimo}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.stock_actual <= 0 ? (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs">Sin Stock</span>
                            ) : item.stock_actual <= item.stock_minimo ? (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-xs">Stock Bajo</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">OK</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleDeleteItem(item)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla para stock bajo */}
              {viewMode === "low_stock" && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold">Producto</th>
                        <th className="text-left py-3 px-4 font-semibold">SKU</th>
                        <th className="text-center py-3 px-4 font-semibold">Talla</th>
                        <th className="text-center py-3 px-4 font-semibold">Color</th>
                        <th className="text-center py-3 px-4 font-semibold">Stock</th>
                        <th className="text-center py-3 px-4 font-semibold">Estado</th>
                        <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentItems as InventoryItem[]).map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{item.detalle}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.codigo_interno} | {item.marca}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{item.sku}</td>
                          <td className="py-3 px-4 text-center">{item.talla}</td>
                          <td className="py-3 px-4 text-center">{item.color}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-orange-600 dark:text-orange-400">{item.stock_actual}</span>
                            <div className="text-xs text-gray-500">Mín: {item.stock_minimo}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-xs">Stock Bajo</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleDeleteItem(item)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Vista de productos sin inventario */}
              {viewMode === "without_inventory" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(currentItems as Product[]).map((product) => (
                    <div key={product.id} className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.detalle}</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {product.codigo_interno} | {product.marca}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Precio: Bs. {product.precio_venta_base}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-red-600 dark:text-red-400 text-sm font-semibold">Necesita inventario</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} {viewMode === "without_inventory" ? "productos" : "items"}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón anterior */}
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === 1
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNumber, index) => (
                        <React.Fragment key={index}>
                          {pageNumber === "..." ? (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => goToPage(pageNumber as number)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                                currentPage === pageNumber
                                  ? "bg-[#e87e8a] dark:bg-[#d6a463] text-white"
                                  : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Botón siguiente */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === totalPages
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;
