import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Moon, Sun, ShoppingCart, Users, Home as HomeIcon, PackageCheck, Truck, PackageSearch, BarChart2, Headset } from "lucide-react";
import Support from "./sections/Support";
import Home from "./sections/Home";
import Shop from "./sections/Shop";
import Stock from "./sections/Stock";
import ProductEntry from "./sections/ProductEntry";
import ProductManagement from "./sections/ProductManagement";
import Reports from "./sections/Reports";

// Componente Sidebar que puede usar useLocation
const Sidebar = ({ darkMode, toggleTheme }: { darkMode: boolean; toggleTheme: () => void }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#f3f4f6] dark:bg-gray-800 p-4 space-y-4 hidden md:block">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Lupita Store</h2>
        <button onClick={toggleTheme} className="hover:scale-110 transition cursor-pointer">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <nav className="space-y-2">
        <Link 
          to="/" 
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/") 
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium" 
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <HomeIcon size={20} />
          <span>Inicio</span>
        </Link>

        <Link
          to="/shop"
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/shop")
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium"
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <ShoppingCart size={20} />
          <span>Ventas</span>
        </Link>

        <Link
          to="/stock"
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/stock")
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium"
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <PackageCheck size={20} />
          <span>Stock Disponible</span>
        </Link>

        <Link
          to="/product-entry"
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/product-entry")
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium"
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <Truck size={20} />
          <span>Registrar Ingreso de Productos</span>
        </Link>

        <Link
          to="/product-management"
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/product-management")
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium"
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <PackageSearch size={20} />
          <span>Gestión de Productos</span>
        </Link>

        <Link
          to="/reports"
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/reports")
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium"
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <BarChart2 size={20} />
          <span>Reportes</span>
        </Link>

        <Link 
          to="/soporte" 
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
            isActive("/soporte") 
              ? "bg-[#f8cdd2] dark:bg-[#d6a463] text-gray-900 dark:text-white font-medium" 
              : "hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463]"
          }`}
        >
          <Headset size={20} />
          <span>Soporte</span>
        </Link>

        {/* Botón de cerrar sesión */}
        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="w-full flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors mt-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 font-medium justify-center"
        >
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </aside>
  );
};

// Componente principal que maneja el estado del tema
const AppContent = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);

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
      <Sidebar darkMode={darkMode} toggleTheme={toggleTheme} />
      
      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/product-entry" element={<ProductEntry />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/soporte" element={<Support />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
