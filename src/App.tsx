import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Moon, Sun, ShoppingCart, Users, Home as HomeIcon, PackageCheck, Truck, PackageSearch, BarChart2, Headset, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Support from "./sections/Support";
import Home from "./sections/Home";
import Shop from "./sections/Shop";
import Stock from "./sections/Stock";
import ProductEntry from "./sections/ProductEntry";
import ProductManagement from "./sections/ProductManagement";
import Reports from "./sections/Reports";
import UserManagement from "./sections/UserManagement";

// Definir interface para el usuario actual
interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

interface AppProps {
  onLogout: () => void;
}

// Componente Sidebar que puede usar useLocation
const Sidebar = ({
  darkMode,
  toggleTheme,
  collapsed,
  setCollapsed,
  onLogout,
}: {
  darkMode: boolean;
  toggleTheme: () => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
}) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Cargar usuario del sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (err) {
        console.error("Error al parsear datos de usuario:", err);
      }
    }
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Definir todos los elementos del navbar
  const allNavItems = [
    { to: "/", icon: <HomeIcon size={20} />, label: "Inicio" },
    { to: "/shop", icon: <ShoppingCart size={20} />, label: "Ventas" },
    { to: "/stock", icon: <PackageCheck size={20} />, label: "Stock Disponible" },
    { to: "/product-entry", icon: <Truck size={20} />, label: "Registrar Ingreso de Productos" },
    { to: "/product-management", icon: <PackageSearch size={20} />, label: "Gestión de Productos" },
    { to: "/reports", icon: <BarChart2 size={20} />, label: "Reportes" },
    { to: "/user-management", icon: <Users size={20} />, label: "Gestión de Usuarios" },
    { to: "/soporte", icon: <Headset size={20} />, label: "Soporte" },
  ];

  // Filtrar elementos del navbar según el rol
  const getNavItemsForRole = (role: string) => {
    switch (role) {
      case "developer":
        // Developer puede ver todo
        return allNavItems;

      case "admin":
        // Admin puede ver todo
        return allNavItems;

      case "promotora":
        // Promotoras solo pueden ver: Inicio, Ventas, Stock Disponible y Soporte
        return allNavItems.filter((item) => ["/", "/shop", "/stock", "/soporte"].includes(item.to));

      default:
        // Por defecto, solo inicio y soporte
        return allNavItems.filter((item) => ["/", "/soporte"].includes(item.to));
    }
  };

  // Obtener los elementos del navbar para el rol actual
  const navItems = currentUser ? getNavItemsForRole(currentUser.rol_nombre) : [];

  // Sidebar para desktop
  return (
    <>
      {/* Botón flotante para abrir sidebar en mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700"
        onClick={() => setMobileOpen(true)}
        style={{ display: mobileOpen ? "none" : "block" }}
        aria-label="Abrir menú"
      >
        <ChevronRight size={24} />
      </button>

      {/* Sidebar overlay para mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} md:hidden`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[#f3f4f6] dark:bg-gray-800 p-4 space-y-4 flex flex-col transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          shadow-lg
        `}
        style={{ minHeight: "100vh" }}
      >
        <div className={`flex items-center justify-between mb-6 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && <h2 className="text-2xl font-bold">Lupita Store</h2>}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="hover:scale-110 transition cursor-pointer">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Botón para colapsar/expandir sidebar en desktop */}
            <button
              className="hidden md:inline-flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            {/* Botón para cerrar sidebar en mobile */}
            <button
              className="md:hidden inline-flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              style={{ display: mobileOpen ? "inline-flex" : "none" }}
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center ${collapsed ? "justify-center" : ""} space-x-2 p-2 rounded cursor-pointer transition-colors relative
                ${isActive(to) ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium" : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"}
              `}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
              {/* Tooltip solo cuando está colapsado */}
              {collapsed && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {label}
                </span>
              )}
            </Link>
          ))}
          {/* Botón de cerrar sesión */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : ""
            } space-x-2 p-2 rounded cursor-pointer transition-colors mt-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 font-medium relative group`}
            type="button"
          >
            <LogOut size={20} />
            {!collapsed && <span>Cerrar sesión</span>}
            {collapsed && (
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Cerrar sesión
              </span>
            )}
          </button>
        </nav>
      </aside>
    </>
  );
};

// Componente principal que maneja el estado del tema
const AppContent = ({ onLogout }: AppProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <div className="bg-[#fdfbf7] dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex transition-colors duration-300">
      <Sidebar darkMode={darkMode} toggleTheme={toggleTheme} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={onLogout} />

      {/* Main Content */}
      <main className={`flex-1 p-6 space-y-6 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/product-entry" element={<ProductEntry />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/soporte" element={<Support />} />
        </Routes>
      </main>
    </div>
  );
};

function App({ onLogout }: AppProps) {
  return (
    <Router>
      <AppContent onLogout={onLogout} />
    </Router>
  );
}

export default App;
