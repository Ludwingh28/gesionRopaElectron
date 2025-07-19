import { useState, useEffect, useRef } from "react";
import { Search, Plus, Trash2, ShoppingCart, User, CreditCard, FileText, Printer, X } from "lucide-react";

interface Product {
  id: number;
  codigo_interno: string;
  detalle: string;
  precio_venta_base: number;
  precio_promotora: number;
  marca: string;
  categoria: string;
}

interface InventoryItem {
  inventario_id: number;
  sku: string;
  stock_actual: number;
  stock_minimo: number;
  talla: string;
  color: string;
  detalle: string;
  precio_venta_base: number;
  precio_promotora: number;
}

interface SaleItem {
  inventario_id: number;
  sku: string;
  detalle: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  stock_disponible: number;
}

interface Customer {
  nombre: string;
  documento: string;
}

interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

const Shop = () => {
  // Estados principales
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [productCode, setProductCode] = useState("");
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ nombre: "", documento: "" });
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [observations, setObservations] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);
  const [saleDetails, setSaleDetails] = useState<any>(null);

  // Estados para selección de inventario
  const [selectedInventory, setSelectedInventory] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const voucherRef = useRef<HTMLDivElement>(null);

  // Cargar usuario actual al montar el componente
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Limpiar búsqueda cuando se cambia el código
  useEffect(() => {
    if (!productCode.trim()) {
      setSearchedProduct(null);
      setInventory([]);
      setSelectedInventory(null);
    }
  }, [productCode]);

  // Función para buscar producto por código
  // En la función searchProduct, después de obtener el producto:
  const searchProduct = async () => {
    if (!productCode.trim()) {
      setError("Ingrese un código de producto");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const product = await (window.electronAPI as any).getProductByCode(productCode.trim());

      if (!product) {
        setError("Producto no encontrado");
        setSearchedProduct(null);
        setInventory([]);
        setLoading(false);
        return;
      }

      // CORREGIR: Convertir strings a números
      const fixedProduct = {
        ...product,
        precio_venta_base: Number(product.precio_venta_base) || 0,
        precio_promotora: Number(product.precio_promotora) || 0,
      };

      setSearchedProduct(fixedProduct);

      // Obtener inventario disponible
      const inventoryData = await (window.electronAPI as any).getInventoryByProduct(product.id);

      // CORREGIR: Convertir precios en inventario también
      const fixedInventory = inventoryData.map((item: any) => ({
        ...item,
        precio_venta_base: Number(item.precio_venta_base) || 0,
        precio_promotora: Number(item.precio_promotora) || 0,
        stock_actual: Number(item.stock_actual) || 0,
        stock_minimo: Number(item.stock_minimo) || 0,
      }));

      setInventory(fixedInventory);

      if (fixedInventory.length === 0) {
        setError("No hay stock disponible para este producto");
      }
    } catch (err) {
      console.error("Error al buscar producto:", err);
      setError("Error al buscar el producto");
    }

    setLoading(false);
  };

  // Función para agregar item a la venta
  const addItemToSale = () => {
    if (!selectedInventory || !searchedProduct || !currentUser) {
      setError("Seleccione una talla/color y verifique que esté logueado");
      return;
    }

    const inventoryItem = inventory.find((inv) => inv.inventario_id === selectedInventory);
    if (!inventoryItem) {
      setError("Item de inventario no válido");
      return;
    }

    // Asegurar que stock_actual sea número
    const stockActual = Number(inventoryItem.stock_actual) || 0;

    if (quantity > stockActual) {
      setError(`Stock insuficiente. Disponible: ${stockActual}`);
      return;
    }

    // Verificar si el item ya existe en la venta
    const existingItemIndex = saleItems.findIndex((item) => item.inventario_id === selectedInventory);

    if (existingItemIndex >= 0) {
      // Si existe, actualizar cantidad
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].cantidad + quantity;

      if (newQuantity > stockActual) {
        setError(`Stock insuficiente. Disponible: ${stockActual}, Ya agregado: ${updatedItems[existingItemIndex].cantidad}`);
        return;
      }

      updatedItems[existingItemIndex].cantidad = newQuantity;
      updatedItems[existingItemIndex].subtotal = newQuantity * updatedItems[existingItemIndex].precio_unitario;
      setSaleItems(updatedItems);
    } else {
      // Si no existe, agregar nuevo item
      // CORREGIR: Asegurar que los precios sean números
      const precioBase = Number(inventoryItem.precio_venta_base) || 0;
      const precioPromotora = Number(inventoryItem.precio_promotora) || 0;

      const precio = currentUser.rol_nombre === "promotora" ? precioPromotora : precioBase;

      const newItem: SaleItem = {
        inventario_id: selectedInventory,
        sku: inventoryItem.sku,
        detalle: inventoryItem.detalle,
        talla: inventoryItem.talla,
        color: inventoryItem.color,
        cantidad: quantity,
        precio_unitario: precio,
        subtotal: precio * quantity,
        stock_disponible: stockActual,
      };

      setSaleItems([...saleItems, newItem]);
    }

    // Limpiar selección
    setSelectedInventory(null);
    setQuantity(1);
    setProductCode("");
    setSearchedProduct(null);
    setInventory([]);
    setError("");
  };

  // Función para eliminar item de la venta
  const removeItemFromSale = (inventarioId: number) => {
    setSaleItems(saleItems.filter((item) => item.inventario_id !== inventarioId));
  };

  // Función para calcular total de la venta
  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + item.subtotal, 0);
  };

  // Función para finalizar la venta
  const finalizeSale = async () => {
    if (!currentUser) {
      setError("Usuario no autenticado");
      return;
    }

    if (saleItems.length === 0) {
      setError("Agregue al menos un producto a la venta");
      return;
    }

    if (!customer.nombre.trim()) {
      setError("Ingrese el nombre del cliente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Crear la venta
      const saleResult = await (window.electronAPI as any).createSale({
        usuario_id: currentUser.id,
        cliente_nombre: customer.nombre.trim(),
        cliente_documento: customer.documento.trim() || "Sin documento",
        metodo_pago: paymentMethod,
        observaciones: observations.trim(),
      });

      if (!saleResult.venta_id) {
        throw new Error(saleResult.mensaje || "Error al crear la venta");
      }

      const ventaId = saleResult.venta_id;

      // Agregar cada item a la venta
      for (const item of saleItems) {
        const itemResult = await (window.electronAPI as any).addItemToSale({
          venta_id: ventaId,
          inventario_id: item.inventario_id,
          cantidad: item.cantidad,
        });

        if (itemResult.mensaje && !itemResult.mensaje.includes("exitosamente")) {
          console.warn("Advertencia al agregar item:", itemResult.mensaje);
        }
      }

      // Obtener detalles completos de la venta para el voucher
      const details = await (window.electronAPI as any).getSaleDetails(ventaId);
      setSaleDetails(details);

      // Mostrar voucher
      setShowVoucher(true);

      // Limpiar formulario
      clearForm();
    } catch (err) {
      console.error("Error al finalizar venta:", err);
      setError("Error al procesar la venta: " + (err as Error).message);
    }

    setLoading(false);
  };

  // Función para limpiar el formulario
  const clearForm = () => {
    setSaleItems([]);
    setCustomer({ nombre: "", documento: "" });
    setPaymentMethod("efectivo");
    setObservations("");
    setProductCode("");
    setSearchedProduct(null);
    setInventory([]);
    setSelectedInventory(null);
    setQuantity(1);
    setError("");
  };

  // Función para imprimir voucher
  const printVoucher = () => {
    window.print();
  };

  // Función para cerrar voucher y limpiar
  const closeVoucher = () => {
    setShowVoucher(false);
    setSaleDetails(null);
  };

  // Determinar si es promotora
  const isPromotora = currentUser?.rol_nombre === "promotora";

  return (
    <div className="p-6">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2 mb-6">
        Sistema de Ventas
        {currentUser && (
          <div className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
            Usuario: {currentUser.nombre} ({currentUser.rol_nombre})
            {isPromotora && <span className="ml-2 text-orange-600 dark:text-orange-400 font-semibold">(Precios con descuento promotora +20%)</span>}
          </div>
        )}
      </header>

      {error && <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Búsqueda y selección de productos */}
        <div className="space-y-6">
          {/* Búsqueda de producto */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="mr-2" size={20} />
              Buscar Producto
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Código interno del producto (ej: PROD-001000)"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchProduct()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button onClick={searchProduct} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer disabled:opacity-50">
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {/* Producto encontrado */}
            {searchedProduct && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-semibold text-lg">{searchedProduct.detalle}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchedProduct.marca} - {searchedProduct.categoria}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Código: {searchedProduct.codigo_interno}</p>
                <div className="mt-2 flex gap-4">
                  <span className="text-sm">
                    Precio base: <span className="font-semibold">Bs. {searchedProduct.precio_venta_base.toFixed(2)}</span>
                  </span>
                  {isPromotora && (
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      Precio promotora: <span className="font-semibold">Bs. {searchedProduct.precio_promotora.toFixed(2)}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Inventario disponible */}
            {inventory.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-3">Seleccionar Talla y Color:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {inventory.map((item) => (
                    <label
                      key={item.inventario_id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedInventory === item.inventario_id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="inventory"
                        value={item.inventario_id}
                        checked={selectedInventory === item.inventario_id}
                        onChange={(e) => setSelectedInventory(Number(e.target.value))}
                        className="hidden"
                      />
                      <div>
                        <div className="font-medium">
                          {item.talla} - {item.color}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Stock: {item.stock_actual}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Bs. {isPromotora ? item.precio_promotora.toFixed(2) : item.precio_venta_base.toFixed(2)}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {selectedInventory && (
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cantidad:</label>
                      <input
                        type="number"
                        min="1"
                        max={inventory.find((item) => item.inventario_id === selectedInventory)?.stock_actual || 1}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button onClick={addItemToSale} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold cursor-pointer flex items-center">
                      <Plus className="mr-1" size={16} />
                      Agregar a Venta
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Carrito y finalización */}
        <div className="space-y-6">
          {/* Carrito de compras */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="mr-2" size={20} />
              Carrito de Compras ({saleItems.length} items)
            </h3>

            {saleItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay productos en el carrito</p>
            ) : (
              <div className="space-y-3">
                {saleItems.map((item) => (
                  <div key={item.inventario_id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium">{item.detalle}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.talla} - {item.color} | Cantidad: {item.cantidad}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bs. {item.precio_unitario.toFixed(2)} c/u</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Bs. {item.subtotal.toFixed(2)}</div>
                      <button onClick={() => removeItemFromSale(item.inventario_id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mt-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>Bs. {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos del cliente */}
          {saleItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Datos del Cliente
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Cliente *</label>
                  <input
                    type="text"
                    value={customer.nombre}
                    onChange={(e) => setCustomer({ ...customer, nombre: e.target.value })}
                    placeholder="Nombre completo del cliente"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Documento (Opcional)</label>
                  <input
                    type="text"
                    value={customer.documento}
                    onChange={(e) => setCustomer({ ...customer, documento: e.target.value })}
                    placeholder="CI, NIT, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observaciones (Opcional)</label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Comentarios adicionales"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {saleItems.length > 0 && (
            <div className="flex gap-4">
              <button onClick={clearForm} className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold cursor-pointer">
                Limpiar Todo
              </button>
              <button
                onClick={finalizeSale}
                disabled={loading || !customer.nombre.trim()}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  "Procesando..."
                ) : (
                  <>
                    <CreditCard className="mr-2" size={20} />
                    Finalizar Venta
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Voucher */}
      {showVoucher && saleDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="mr-2" size={24} />
                Voucher de Venta
              </h2>
              <button onClick={closeVoucher} className="text-gray-500 hover:text-red-500 text-2xl font-bold">
                <X size={24} />
              </button>
            </div>

            {/* Área imprimible */}
            <div ref={voucherRef} id="voucher-print-area" className="p-6 bg-white text-black">
              {/* Header del voucher */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-pink-600">LUPITA STORE</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión de Ropa</p>
                <div className="mt-2 text-sm">
                  <p>Fecha: {new Date(saleDetails.header.fecha_venta).toLocaleString()}</p>
                  <p>Voucher: {saleDetails.header.numero_venta}</p>
                </div>
              </div>

              {/* Datos del cliente y vendedor */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Datos del Cliente:</h3>
                  <p>
                    <strong>Nombre:</strong> {saleDetails.header.cliente_nombre}
                  </p>
                  <p>
                    <strong>Documento:</strong> {saleDetails.header.cliente_documento}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Datos de la Venta:</h3>
                  <p>
                    <strong>Vendedor:</strong> {saleDetails.header.vendedor}
                  </p>
                  <p>
                    <strong>Método de Pago:</strong> {saleDetails.header.metodo_pago}
                  </p>
                </div>
              </div>

              {/* Detalle de productos */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Detalle de Productos:</h3>
                <table className="w-full border-collapse border border-gray-400 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 px-2 py-1 text-left">Código</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Producto</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Talla</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Color</th>
                      <th className="border border-gray-400 px-2 py-1 text-center">Cant.</th>
                      <th className="border border-gray-400 px-2 py-1 text-right">Precio Unit.</th>
                      <th className="border border-gray-400 px-2 py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleDetails.details.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-400 px-2 py-1">{item.codigo_interno}</td>
                        <td className="border border-gray-400 px-2 py-1">{item.detalle}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{item.talla}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{item.color}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">{item.cantidad}</td>
                        <td className="border border-gray-400 px-2 py-1 text-right">Bs. {Number(item.precio_unitario).toFixed(2)}</td>
                        <td className="border border-gray-400 px-2 py-1 text-right">Bs. {Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="text-right mb-6">
                <div className="inline-block text-left">
                  <div className="flex justify-between gap-8 mb-1">
                    <span>Subtotal:</span>
                    <span>Bs. {Number(saleDetails.header.subtotal).toFixed(2)}</span>
                  </div>
                  {saleDetails.header.descuento > 0 && (
                    <div className="flex justify-between gap-8 mb-1">
                      <span>Descuento:</span>
                      <span>Bs. {Number(saleDetails.header.descuento).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-8 border-t border-gray-400 pt-1 font-bold text-lg">
                    <span>TOTAL:</span>
                    <span>Bs. {Number(saleDetails.header.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {saleDetails.header.observaciones && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Observaciones:</h3>
                  <p className="text-sm">{saleDetails.header.observaciones}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-gray-600 mt-6">
                <p>¡Gracias por su compra!</p>
                <p>Lupita Store - Sistema de Gestión</p>
              </div>
            </div>

            {/* Botones del modal */}
            <div className="flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={printVoucher} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer flex items-center">
                <Printer className="mr-2" size={16} />
                Imprimir
              </button>
              <button onClick={closeVoucher} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold cursor-pointer">
                Cerrar
              </button>
            </div>
          </div>

          {/* Estilos para impresión */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #voucher-print-area, #voucher-print-area * {
                visibility: visible !important;
              }
              #voucher-print-area {
                position: fixed !important;
                left: 0; top: 0; width: 100vw; height: 100vh;
                background: white !important;
                z-index: 9999 !important;
                padding: 20px !important;
              }
              html, body {
                width: 100vw !important;
                height: 100vh !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
              }
              @page {
                size: auto;
                margin: 0.5in;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Shop;
