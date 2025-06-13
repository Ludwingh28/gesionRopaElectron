import { useState, useEffect } from "react";
import { Moon, Sun, User, Lock } from "lucide-react";

const Login = () => {
  const [darkMode, setDarkMode] = useState(true);

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
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] dark:bg-gray-900 transition-colors duration-300">
      {/* Botón modo claro/oscuro */}
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="text-gray-700 dark:text-white hover:scale-110 transition">
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      <div
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl
        border border-[#f8cdd2] dark:border-[#d6a463]"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white font-cursive">LUPITA</h1>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
            <div className="flex items-center bg-[#f3f4f6] dark:bg-gray-700 rounded px-3 py-2">
              <User className="text-gray-600 dark:text-gray-300 mr-2" size={18} />
              <input type="text" placeholder="Ingresa tu usuario" className="bg-transparent outline-none w-full text-gray-800 dark:text-white placeholder-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <div className="flex items-center bg-[#f3f4f6] dark:bg-gray-700 rounded px-3 py-2">
              <Lock className="text-gray-600 dark:text-gray-300 mr-2" size={18} />
              <input type="password" placeholder="••••••••" className="bg-transparent outline-none w-full text-gray-800 dark:text-white placeholder-gray-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#e19ea6] dark:bg-[#d6a463] hover:opacity-90 text-white font-semibold py-2 rounded-xl transition">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
