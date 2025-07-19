import { useState, useEffect } from "react";
import { Search, Package, Plus, RefreshCw, AlertCircle, CheckCircle, Truck } from "lucide-react";

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
  inventario_id: number;
  sku: string;
  stock_actual: number;
  stock_minimo: number;
  talla: string;
  color: string;
  ubicacion?: string;
}

interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

const ProductEntry = () => {
  // Estados principales
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productInventory, setProductInventory] = useState<InventoryItem[]>([]);

  // Estados del formulario
  const [search, setSearch] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar usuario actual
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error al cargar usuario:", err);
      }
    }
  }, []);

  // Buscar productos
  const searchProducts = async () => {
    if (!search.trim()) {
      setProducts([]);
      return;
    }

    setSearching(true);
    setError("");
    try {
      const results = await (window.electronAPI as any).searchProductsWithInventory(search.trim());
      setProducts(results);

      if (results.length === 0) {
        setError("No se encontraron productos");
      }
    } catch (err) {
      console.error("Error al buscar productos:", err);
      setError("Error al buscar productos");
    }
    setSearching(false);
  };

  // Seleccionar producto y cargar su inventario
  const selectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setProductInventory([]);
    setSelectedInventoryId(null);
    setQuantity(1);
    setError("");
    setSuccess("");

    setLoading(true);
    try {
      const inventory = await (window.electronAPI as any).getProductInventoryDetails(product.id);
      setProductInventory(inventory);

      if (inventory.length === 0) {
        setError("Este producto no tiene inventario configurado. Primero debe crear las variantes de talla y color.");
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError("Error al cargar inventario del producto");
    }
    setLoading(false);
  };

  // Agregar stock
  const addStock = async () => {
    if (!selectedInventoryId || !currentUser) {
      setError("Seleccione un producto y talla/color válidos");
      return;
    }

    if (quantity <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (!reason.trim()) {
      setError("Ingrese el motivo del ingreso");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await (window.electronAPI as any).addStockToInventory(selectedInventoryId, quantity, reason.trim(), currentUser.id);

      if (result.success) {
        setSuccess(`Se agregaron ${quantity} unidades al inventario exitosamente`);

        // Recargar inventario del producto
        const updatedInventory = await (window.electronAPI as any).getProductInventoryDetails(selectedProduct!.id);
        setProductInventory(updatedInventory);

        // Limpiar formulario
        setQuantity(1);
        setReason("");
        setSelectedInventoryId(null);
      } else {
        setError(result.error || "Error al agregar stock");
      }
    } catch (err) {
      console.error("Error al agregar stock:", err);
      setError("Error al procesar la operación");
    }
    setLoading(false);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch("");
    setProducts([]);
    setSelectedProduct(null);
    setProductInventory([]);
    setSelectedInventoryId(null);
    setQuantity(1);
    setReason("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="p-6">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2 mb-6 flex items-center">
        <Truck className="mr-3" size={32} />
        Registro de Entrada de Productos
      </header>

      {/* Notificaciones */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Búsqueda */}
        <div className="space-y-6">
          {/* Buscador */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="mr-2" size={20} />
              Buscar Producto
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar por código, descripción o marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchProducts()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={searchProducts}
                disabled={searching || !search.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer disabled:opacity-50 flex items-center"
              >
                {searching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                <span className="ml-2">{searching ? "Buscando..." : "Buscar"}</span>
              </button>
              <button onClick={clearSearch} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold cursor-pointer">
                Limpiar
              </button>
            </div>

            {/* Resultados de búsqueda */}
            {products.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Productos encontrados ({products.length}):</h4>
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="font-medium">{product.detalle}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {product.codigo_interno} | {product.marca} - {product.categoria}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Precio base: Bs. {product.precio_venta_base} | Promotora: Bs. {product.precio_promotora}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Inventario y formulario */}
        <div className="space-y-6">
          {selectedProduct && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                Inventario de {selectedProduct.detalle}
              </h3>

              {loading ? (
                <div className="text-center py-4">
                  <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                  <p>Cargando inventario...</p>
                </div>
              ) : productInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay inventario configurado para este producto</p>
                  <p className="text-sm">Primero debe crear las variantes en Gestión de Productos</p>
                </div>
              ) : (
                <>
                  {/* Lista de inventario */}
                  <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                    {productInventory.map((item) => (
                      <label
                        key={item.inventario_id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedInventoryId === item.inventario_id
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="inventory"
                          value={item.inventario_id}
                          checked={selectedInventoryId === item.inventario_id}
                          onChange={() => setSelectedInventoryId(item.inventario_id)}
                          className="hidden"
                        />
                        <div>
                          <div className="font-medium">
                            {item.talla} - {item.color}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.sku}</div>
                          {item.ubicacion && <div className="text-sm text-gray-600 dark:text-gray-400">Ubicación: {item.ubicacion}</div>}
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${item.stock_actual <= item.stock_minimo ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}>
                            Stock: {item.stock_actual}
                          </div>
                          <div className="text-xs text-gray-500">Mín: {item.stock_minimo}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Formulario de entrada */}
                  {selectedInventoryId && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="font-medium mb-4">Agregar Stock</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Cantidad a agregar:</label>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Motivo del ingreso:</label>
                          <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ej: Compra nueva, Devolución, Ajuste de inventario"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <button
                          onClick={addStock}
                          disabled={loading || !reason.trim() || quantity <= 0}
                          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center"
                        >
                          {loading ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
                          {loading ? "Agregando..." : `Agregar ${quantity} unidades`}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!selectedProduct && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Busca un producto para comenzar</h3>
              <p className="text-gray-500 dark:text-gray-500">Utiliza el buscador para encontrar el producto al que deseas agregar stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductEntry;
