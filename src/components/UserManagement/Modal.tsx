import React, { useEffect, useState } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  user?: any;
  roles: any[];
}

const initialState = {
  nombre: "",
  usuario: "",
  email: "",
  telefono: "",
  password_hash: "",
  rol_id: "",
  activo: true,
};

const Modal: React.FC<ModalProps> = ({ open, onClose, onSave, user, roles }) => {
  const [form, setForm] = useState<any>(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ ...user, password_hash: "" }); // No mostrar hash real
    } else {
      setForm(initialState);
    }
    setError("");
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === "checkbox") {
      val = (e.target as HTMLInputElement).checked;
    }
    setForm((prev: any) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.nombre || !form.usuario || !form.email || !form.rol_id) {
      setError("Todos los campos obligatorios deben estar completos.");
      setLoading(false);
      return;
    }
    if (!user && !form.password_hash) {
      setError("La contraseña es obligatoria para nuevos usuarios.");
      setLoading(false);
      return;
    }
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err.message || "Error al guardar usuario");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-3xl font-bold cursor-pointer"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {user ? "Editar Usuario" : "Agregar Usuario"}
        </h2>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <input
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              placeholder="Usuario"
              className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-2">
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecciona un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
            <input
              name="password_hash"
              value={form.password_hash}
              onChange={handleChange}
              placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña"}
              type="password"
              className="w-1/2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required={!user}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="activo"
                checked={!!form.activo}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-green-600"
              />
              <span className="text-gray-700 dark:text-gray-200">Activo</span>
            </label>
          </div>
          <div className="flex gap-2">
            <input
              name="created_at"
              value={form.created_at || ''}
              disabled
              className="w-1/2 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
              placeholder="Creado"
            />
            <input
              name="updated_at"
              value={form.updated_at || ''}
              disabled
              className="w-1/2 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
              placeholder="Actualizado"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#e87e8a] dark:bg-[#d6a463] text-white font-semibold py-2 rounded-xl transition cursor-pointer flex items-center justify-center disabled:opacity-60 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Guardando..." : user ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
