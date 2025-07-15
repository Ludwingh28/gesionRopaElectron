import React, { useEffect, useState } from "react";
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
      if (isEdit) {
        await (window.electronAPI as any).updateProduct(form);
      } else {
        await (window.electronAPI as any).createProduct(form);
      }
      onSave();
    } catch (error) {
      console.error("Error al guardar el producto", error);
      alert("Error al guardar producto");
    }
  };

  return (
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
  );
};

export default Modal;
