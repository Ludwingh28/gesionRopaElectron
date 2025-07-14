import React, { useEffect, useState } from "react";
import ProductFormModal from "../components/ModalProducts/ProductFormModal";

interface Product {
  id?: number;
  detalle: string;
  marca_id: number;
  categoria_id: number;
  costo_compra: number;
  precio_venta_base: number;
  activo: boolean;
}

const ProductManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async (searchValue = "") => {
    setLoading(true);
    try {
      const prods = await (window.electronAPI as any).getProducts(searchValue);
      setProducts(prods);
      setError("");
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = () => {
    setShowModal(false);
    setEditingProduct(null);
    loadProducts(search);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(search);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSwitch = async (productId: number, current: boolean) => {
    const updatedProduct = products.find((p) => p.id === productId);
    if (!updatedProduct) return;
    const newProduct = { ...updatedProduct, activo: !current };
    try {
      // Se asume que updateProduct actualiza todos los campos del producto.
      await (window.electronAPI as any).updateProduct(newProduct);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, activo: !current } : p)));
    } catch (err) {
      alert("No se pudo actualizar el estado.");
    }
  };

  return (
    <div className="p-6">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2">Gestión de Productos</header>

      <section className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xl">
            <input
              type="text"
              placeholder="Buscar por ID o Detalle"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
            />
            <button type="submit" className="bg-[#e87e8a] dark:bg-[#d6a463] text-white px-4 py-2 rounded font-semibold cursor-pointer">
              Buscar
            </button>
          </form>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold shadow cursor-pointer"
          >
            Agregar
          </button>
        </div>

        {loading ? (
          <p>Cargando productos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Detalle</th>
                  <th className="px-4 py-2">Costo de Compra</th>
                  <th className="px-4 py-2">Precio Base</th>
                  <th className="px-4 py-2">Precio Promotoras</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod: Product) => (
                  <tr key={prod.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 text-xs">{prod.id}</td>
                    <td className="px-4 py-2 text-xs break-all">{prod.detalle}</td>
                    <td className="px-4 py-2 text-xs  text-center">{prod.costo_compra}</td>
                    <td className="px-4 py-2 text-xs  text-center">{prod.precio_venta_base}</td>
                    <td className="px-4 py-2 text-xs  text-center">{(prod.precio_venta_base * 1.2).toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleSwitch(prod.id!, prod.activo)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${prod.activo ? "bg-green-500" : "bg-gray-400"} cursor-pointer`}
                        title={prod.activo ? "Activo" : "Inactivo"}
                      >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${prod.activo ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => handleEdit(prod)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold cursor-pointer">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && <ProductFormModal product={editingProduct} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
};

export default ProductManagement;
