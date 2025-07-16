import React, { useEffect, useState } from "react";
import ProductFormModal from "../components/ProductManagement/Modal";
import DataTable, { DataTableColumn } from "../components/DataTable";

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
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);

  // Estados para mostrar el modal de código de barras desde la tabla
  const [barcode, setBarcode] = useState<string | null>(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const barcodeRef = React.useRef<HTMLCanvasElement>(null);

  const loadProducts = async (searchValue = "") => {
    setLoading(true);
    try {
      const prods = await (window.electronAPI as any).getProducts(searchValue);
      setProducts(prods);
      setTotalProducts(prods.length);
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

  useEffect(() => {
    if (barcode && showBarcode && barcodeRef.current) {
      import('jsbarcode').then((JsBarcode) => {
        JsBarcode.default(barcodeRef.current, barcode, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
        });
      });
    }
  }, [barcode, showBarcode]);

  const handleSave = () => {
    setShowModal(false);
    setEditingProduct(null);
    setCurrentPage(1); // Resetear a la primera página
    loadProducts(search);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetear a la primera página al buscar
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

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Calcular número total de páginas
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Función para cambiar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Función para ir a la página anterior
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para ir a la página siguiente
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generar array de números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un rango inteligente
      if (currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Al final
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // En el medio
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Columnas para DataTable
  const columns: DataTableColumn<Product & { marca?: string; categoria?: string; codigo_interno?: string }>[] = [
    { key: "codigo_interno", label: "Código Interno" },
    { key: "detalle", label: "Detalle" },
    { key: "marca", label: "Marca" },
    { key: "categoria", label: "Categoría" },
    { key: "costo_compra", label: "Costo de Compra", className: "text-center" },
    { key: "precio_venta_base", label: "Precio Base", className: "text-center" },
    {
      key: "precio_promotora",
      label: "Precio Promotoras",
      className: "text-center",
      render: (prod) => (prod.precio_venta_base * 1.2).toFixed(2),
    },
    {
      key: "activo",
      label: "Estado",
      className: "text-center",
      render: (prod) => (
        <button
          onClick={() => handleSwitch(prod.id!, prod.activo)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${prod.activo ? "bg-green-500" : "bg-gray-400"} cursor-pointer`}
          title={prod.activo ? "Activo" : "Inactivo"}
        >
          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${prod.activo ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      ),
    },
  ];

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
          <>
            <DataTable
              columns={columns}
              data={currentProducts}
              loading={loading}
              error={error}
              rowKey={(row) => row.id!}
              actions={(prod) => (
                <>
                  <button onClick={() => handleEdit(prod)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold cursor-pointer">
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setBarcode((prod as any).codigo_interno);
                      setBarcodeProduct(prod);
                      setShowBarcode(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded font-semibold cursor-pointer ml-2"
                  >
                    Imprimir Código
                  </button>
                </>
              )}
            />

            {/* Información de paginación */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indexOfFirstProduct + 1} a {Math.min(indexOfLastProduct, totalProducts)} de {totalProducts} productos
              </div>

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {/* Botón anterior */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNumber, index) => (
                      <React.Fragment key={index}>
                        {pageNumber === '...' ? (
                          <span className="px-2 py-1 text-gray-500">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(pageNumber as number)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                              currentPage === pageNumber
                                ? 'bg-[#e87e8a] dark:bg-[#d6a463] text-white'
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
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
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === totalPages
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {showModal && <ProductFormModal product={editingProduct} onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Modal de código de barras desde la tabla */}
      {showBarcode && barcode && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center gap-4 relative">
            <button onClick={() => { setShowBarcode(false); setBarcode(null); setBarcodeProduct(null); }} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold">×</button>
            <h3 className="text-xl font-bold mb-2">Código de Barras del Producto</h3>
            <div className="mb-2 text-center">
              <div className="font-semibold">{barcodeProduct?.detalle}</div>
              <div className="text-sm text-gray-500">{barcodeProduct?.marca} - {barcodeProduct?.categoria}</div>
            </div>
            {/* Área imprimible */}
            <div id="barcode-print-area" className="print-area bg-white p-4 rounded flex flex-col items-center gap-2">
              <canvas ref={barcodeRef} style={{ display: 'block' }} />
              <div className="font-bold text-lg mt-2">{barcode}</div>
              <div className="text-base">{barcodeProduct?.detalle}</div>
            </div>
            <button
              onClick={() => {
                setTimeout(() => window.print(), 100);
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 cursor-pointer mt-2"
            >
              Imprimir
            </button>
            {/* Estilos para impresión */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #barcode-print-area, #barcode-print-area * {
                  visibility: visible !important;
                }
                #barcode-print-area {
                  position: fixed !important;
                  left: 0; top: 0; width: 100vw; height: 100vh;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  background: white !important;
                  box-shadow: none !important;
                  z-index: 9999 !important;
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
                  margin: 0;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
