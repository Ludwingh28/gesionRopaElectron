import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";
import { useEffect } from "react";
import { Moon, Sun, Shirt, Users, ShoppingCart } from "lucide-react";

type CardProps = {
  title: string;
  value: string;
};

const Card = ({ title, value }: CardProps) => (
  <div className="bg-gray-800 dark:bg-gray-100 p-4 rounded-xl shadow-md hover:shadow-lg transition text-white dark:text-black">
    <h3 className="text-sm text-gray-400">{title}</h3>
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
    <>
      <div className="bg-gray-900 dark:bg-white text-white dark:text-black min-h-screen flex transition-colors duration-300">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 dark:bg-gray-200 p-4 space-y-4 hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Lupita Store</h2>
            <button onClick={toggleTheme} className="hover:scale-110 transition">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <nav className="space-y-2">
            <div className="flex items-center space-x-2 hover:bg-gray-700 dark:hover:bg-gray-300 p-2 rounded cursor-pointer">
              <ShoppingCart size={20} />
              <span>Ventas</span>
            </div>
            <div className="flex items-center space-x-2 hover:bg-gray-700 dark:hover:bg-gray-300 p-2 rounded cursor-pointer">
              <Shirt size={20} />
              <span>Productos</span>
            </div>
            <div className="flex items-center space-x-2 hover:bg-gray-700 dark:hover:bg-gray-300 p-2 rounded cursor-pointer">
              <Users size={20} />
              <span>Clientes</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <header className="text-3xl font-bold border-b border-gray-700 dark:border-gray-300 pb-2">Dashboard de Ventas</header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Ventas Totales" value="Bs. 12,540" />
            <Card title="Pedidos del Día" value="89" />
            <Card title="Clientes Nuevos" value="15" />
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
