import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Moon, Sun, ShoppingCart, Users, Home as HomeIcon, PackageCheck, Truck, PackageSearch, BarChart2, Headset } from "lucide-react";
import Support from "./sections/Support";
import Home from "./sections/Home";

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

        <div className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
          <ShoppingCart size={20} />
          <span>Ventas</span>
        </div>

        <div className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
          <PackageCheck size={20} />
          <span>Stock Disponible</span>
        </div>

        <div className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
          <Truck size={20} />
          <span>Registrar Ingreso de Productos</span>
        </div>

        <div className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
          <PackageSearch size={20} />
          <span>Gestión de Productos</span>
        </div>

        <div className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
          <BarChart2 size={20} />
          <span>Reportes</span>
        </div>

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
            localStorage.removeItem("session");
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
