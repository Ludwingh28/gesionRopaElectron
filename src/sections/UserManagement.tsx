import React, { useEffect, useState } from "react";
import Modal from "../components/UserManagement/Modal";
import DataTable, { DataTableColumn } from "../components/DataTable";
import type { User, Role, UserCreateData, UserUpdateData } from "../types/global";

// Interface para el usuario actual
interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Cargar usuario actual del localStorage
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (err) {
        console.error("Error al parsear datos de usuario:", err);
      }
    }
  }, []);

  const fetchUsers = async (searchValue = "") => {
    setLoading(true);
    setError("");
    try {
      // @ts-ignore
      const result = await window.electronAPI.getUsers(searchValue);

      // Filtrar usuarios según el rol del usuario actual
      let filteredUsers = result;
      if (currentUser?.rol_nombre === "admin") {
        // Los admin no pueden ver usuarios developers
        filteredUsers = result.filter((user: User) => user.rol_nombre !== "developer");
      }
      // Los developers pueden ver todo, las promotoras no deberían acceder a esta sección

      setUsers(filteredUsers);
    } catch (err) {
      setError("Error al cargar usuarios");
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    // @ts-ignore
    const result = await window.electronAPI.getRoles();

    // Filtrar roles según el usuario actual
    let filteredRoles = result;
    if (currentUser?.rol_nombre === "admin") {
      // Los admin no pueden asignar el rol de developer
      filteredRoles = result.filter((role: Role) => role.nombre !== "developer");
    }
    // Los developers pueden ver todos los roles

    setRoles(filteredRoles);
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchRoles();
    }
  }, [currentUser]);

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

  const handleEdit = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleSave = async (data: UserCreateData | UserUpdateData) => {
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

  // Verificar si el usuario actual tiene acceso a esta sección
  if (currentUser && !["admin", "developer"].includes(currentUser.rol_nombre)) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400">No tienes permisos para acceder a la gestión de usuarios.</p>
        </div>
      </div>
    );
  }

  // Columnas para DataTable
  const columns: DataTableColumn<User>[] = [
    { key: "nombre", label: "Nombre" },
    { key: "usuario", label: "Usuario" },
    { key: "email", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
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
    <div className="max-w-7xl mx-auto">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2 mb-8">
        Gestión de Usuarios
        {currentUser?.rol_nombre === "admin" && (
          <div className="text-sm font-normal text-orange-600 dark:text-orange-400 mt-2">* Como administrador, no puedes ver ni gestionar usuarios desarrolladores por seguridad</div>
        )}
      </header>

      <section className="mt-6">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xl">
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full text-base"
            />
            <button type="submit" className="bg-[#e87e8a] dark:bg-[#d6a463] text-white px-6 py-3 rounded font-semibold cursor-pointer text-base">
              Buscar
            </button>
          </form>
          <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold shadow cursor-pointer text-base">
            Agregar Usuario
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-lg">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={users}
              loading={loading}
              error={error}
              rowKey={(row) => row.id}
              actions={(user) => (
                <button onClick={() => handleEdit(user)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold cursor-pointer text-sm">
                  Editar
                </button>
              )}
            />
          </div>
        )}
      </section>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} user={editUser} roles={roles} />
    </div>
  );
};

export default UserManagement;
