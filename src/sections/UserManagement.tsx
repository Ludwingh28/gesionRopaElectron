import React, { useEffect, useState } from "react";
import Modal from "../components/UserManagement/Modal";
import DataTable, { DataTableColumn } from "../components/DataTable";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [roles, setRoles] = useState<any[]>([]);

  const fetchUsers = async (searchValue = "") => {
    setLoading(true);
    setError("");
    try {
      // @ts-ignore
      const result = await window.electronAPI.getUsers(searchValue);
      setUsers(result);
    } catch (err) {
      setError("Error al cargar usuarios");
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    // @ts-ignore
    const result = await window.electronAPI.getRoles();
    setRoles(result);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleSwitch = async (userId: number, current: boolean) => {
    // @ts-ignore
    const res = await window.electronAPI.updateUserStatus(userId, !current);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, activo: !current } : u)));
    } else {
      alert("No se pudo actualizar el estado");
    }
  };

  const handleAdd = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleSave = async (data: any) => {
    let res;
    if (editUser) {
      // @ts-ignore
      res = await window.electronAPI.updateUser({ ...editUser, ...data });
    } else {
      // @ts-ignore
      res = await window.electronAPI.createUser(data);
    }
    if (res.success) {
      setModalOpen(false);
      fetchUsers();
    } else {
      throw new Error(res.error || "Error al guardar usuario");
    }
  };

  // Columnas para DataTable
  const columns: DataTableColumn<any>[] = [
    { key: "nombre", label: "Nombre" },
    { key: "usuario", label: "Usuario" },
    { key: "email", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "password_hash", label: "Contraseña" },
    { key: "rol_nombre", label: "Rol" },
    {
      key: "activo",
      label: "Estado",
      render: (user) => (
        <button
          onClick={() => handleSwitch(user.id, !!user.activo)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${user.activo ? "bg-green-500" : "bg-gray-400"} cursor-pointer`}
          title={user.activo ? "Activo" : "Inactivo"}
        >
          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${user.activo ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      ),
      className: "text-center",
    },
  ];

  return (
    <>
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2">Gestión de Usuarios</header>

      <section className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xl">
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
            />
            <button type="submit" className="bg-[#e87e8a] dark:bg-[#d6a463] text-white px-4 py-2 rounded font-semibold cursor-pointer">
              Buscar
            </button>
          </form>
          <button onClick={handleAdd} className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold shadow cursor-pointer">
            Agregar
          </button>
        </div>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            error={error}
            rowKey={(row) => row.id}
            actions={(user) => (
              <button onClick={() => handleEdit(user)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold cursor-pointer">
                Editar
              </button>
            )}
          />
        )}
      </section>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} user={editUser} roles={roles} />
    </>
  );
};

export default UserManagement;
