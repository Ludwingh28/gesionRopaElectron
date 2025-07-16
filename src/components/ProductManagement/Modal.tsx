import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

interface Brand {
  id: number;
  nombre: string;
}
interface Category {
  id: number;
  nombre: string;
}
interface ProductBase {
  id?: number;
  detalle: string;
  marca_id: number;
  categoria_id: number;
  costo_compra: number;
  precio_venta_base: number;
  activo: boolean;
}

type Props = {
  product: ProductBase | null;
  onClose: () => void;
  onSave: () => void;
};

const Modal: React.FC<Props> = ({ product, onClose, onSave }) => {
  const isEdit = Boolean(product?.id);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductBase>(
    product ?? {
      detalle: "",
      marca_id: 0,
      categoria_id: 0,
      costo_compra: 0,
      precio_venta_base: 0,
      activo: true,
    }
  );
  // Estados para manejar "Otra..."
  const [isOtherBrand, setIsOtherBrand] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [barcode, setBarcode] = useState<string | null>(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      const b = await (window.electronAPI as any).getBrands();
      const c = await (window.electronAPI as any).getCategories();
      setBrands(b);
      setCategories(c);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checkboxValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    if (name === "marca_id") {
      if (value === "other") {
        setIsOtherBrand(true);
      } else {
        setIsOtherBrand(false);
        setForm((prev) => ({ ...prev, marca_id: Number(value) }));
      }
    } else if (name === "categoria_id") {
      if (value === "other") {
        setIsOtherCategory(true);
      } else {
        setIsOtherCategory(false);
        setForm((prev) => ({ ...prev, categoria_id: Number(value) }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checkboxValue : value,
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Si se seleccionó "Otra" para marca, validar y crear la nueva marca
      if (isOtherBrand) {
        if (!newBrand) {
          alert("Ingrese el nombre de la nueva marca.");
          return;
        }
        // Se asume que existe un endpoint createBrand que devuelve el id creado
        const createdBrand = await (window.electronAPI as any).createBrand({ nombre: newBrand });
        form.marca_id = createdBrand.id;
      }
      // Si se seleccionó "Otra" para categoría, validar y crear la nueva categoría
      if (isOtherCategory) {
        if (!newCategory) {
          alert("Ingrese el nombre de la nueva categoría.");
          return;
        }
        // Se asume que existe un endpoint createCategory que devuelve el id creado
        const createdCategory = await (window.electronAPI as any).createCategory({ nombre: newCategory });
        form.categoria_id = createdCategory.id;
      }
      let createdProduct = null;
      if (isEdit) {
        await (window.electronAPI as any).updateProduct(form);
        onSave();
      } else {
        await (window.electronAPI as any).createProduct(form);
        // Buscar el producto recién creado por detalle y marca (último insertado)
        const productos = await (window.electronAPI as any).getProducts(form.detalle);
        createdProduct = productos.reverse().find((p: any) => p.detalle === form.detalle && p.marca_id === form.marca_id);
        if (createdProduct && createdProduct.codigo_interno) {
          setBarcode(createdProduct.codigo_interno);
          setShowBarcode(true);
        } else {
          onSave(); // fallback si no se encuentra el producto
        }
      }
    } catch (error) {
      console.error("Error al guardar el producto", error);
      alert("Error al guardar producto");
    }
  };

  useEffect(() => {
    if (barcode && showBarcode && barcodeRef.current) {
      // Asegúrate de instalar jsbarcode: npm install jsbarcode
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6 relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-3xl font-bold cursor-pointer">
            <X />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">{isEdit ? "Editar Producto" : "Nuevo Producto"}</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Detalle
                <input name="detalle" value={form.detalle} onChange={handleChange} required className="rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Marca
                <select name="marca_id" value={isOtherBrand ? "other" : form.marca_id || ""} onChange={handleChange} required className="rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white">
                  <option value="">Selecciona…</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nombre}
                    </option>
                  ))}
                  <option value="other">Otra...</option>
                </select>
                {isOtherBrand && (
                  <input
                    type="text"
                    placeholder="Nueva Marca"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="mt-2 rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white"
                  />
                )}
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Categoría
                <select
                  name="categoria_id"
                  value={isOtherCategory ? "other" : form.categoria_id || ""}
                  onChange={handleChange}
                  required
                  className="rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                  <option value="other">Otra...</option>
                </select>
                {isOtherCategory && (
                  <input
                    type="text"
                    placeholder="Nueva Categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-2 rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white"
                  />
                )}
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Costo de compra
                <input
                  type="number"
                  step="0.01"
                  name="costo_compra"
                  value={form.costo_compra}
                  onChange={handleChange}
                  required
                  className="rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Precio base
                <input
                  type="number"
                  step="0.01"
                  name="precio_venta_base"
                  value={form.precio_venta_base}
                  onChange={handleChange}
                  required
                  className="rounded-lg border p-2 bg-white dark:bg-gray-700 dark:text-white"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="h-4 w-4 rounded" />
                Activo
              </label>
            </div>
            <footer className="flex justify-end gap-2 pt-4">
              <button onClick={onClose} type="button" className="rounded-lg border px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 cursor-pointer">
                {isEdit ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </footer>
          </form>
        </div>
      </div>
      {/* Modal de código de barras */}
      {showBarcode && barcode && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center gap-4 relative">
            <button onClick={() => { setShowBarcode(false); setBarcode(null); onClose(); onSave(); }} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold">×</button>
            <h3 className="text-xl font-bold mb-2">Código de Barras del Producto</h3>
            <div className="mb-2 text-center">
              <div className="font-semibold">{product?.detalle || barcode}</div>
            </div>
            <div id="barcode-print-area" className="print-area bg-white p-4 rounded flex flex-col items-center gap-2">
              <canvas ref={barcodeRef} style={{ display: 'block' }} />
              <div className="font-bold text-lg mt-2">{barcode}</div>
              <div className="text-base">{product?.detalle || ''}</div>
            </div>
            <button
              onClick={() => {
                setTimeout(() => window.print(), 100);
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 cursor-pointer mt-2"
            >
              Imprimir
            </button>
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
    </>
  );
};

export default Modal;
