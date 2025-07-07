import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Moon, Sun, ShoppingCart, Users, Home, PackageCheck, Truck, PackageSearch, BarChart2, Headset } from "lucide-react";
import Support from "./Support";

type CardProps = {
  title: string;
  value: string;
};

const Card = ({ title, value }: CardProps) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition text-gray-800 dark:text-white border border-[#f8cdd2] dark:border-[#d6a463]">
    <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

function App() {
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
    <Router>
      <div className="bg-[#fdfbf7] dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex transition-colors duration-300">
        {/* Sidebar */}
        <aside className="w-64 bg-[#f3f4f6] dark:bg-gray-800 p-4 space-y-4 hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Lupita Store</h2>
            <button onClick={toggleTheme} className="hover:scale-110 transition cursor-pointer">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <nav className="space-y-2">
            <Link to="/" className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
              <Home size={20} />
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

            <Link to="/soporte" className="flex items-center space-x-2 hover:bg-[#f8cdd2] dark:hover:bg-[#d6a463] p-2 rounded cursor-pointer">
              <Headset size={20} />
              <span>Soporte</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2">Resumen de Ventas</header>

                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="Ventas Totales" value="Bs. 12,540" />
                    <Card title="Pedidos del Día" value="89" />
                    <Card title="Clientes Nuevos" value="15" />
                  </section>
                </>
              }
            />
            <Route path="/soporte" element={<Support />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
