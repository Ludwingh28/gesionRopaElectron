import { useState, useEffect } from "react";
import { Moon, Sun, User, Lock, Eye, EyeOff } from "lucide-react";
import App from "./App";

declare global {
  interface Window {
    electronAPI: {
      authenticateUser: (username: string, password: string) => Promise<{ success: boolean; reason?: string }>;
      // Aquí podrías añadir un método para obtener datos del usuario autenticado si lo necesitas
      // getAuthenticatedUserData: () => Promise<any>;
    };
  }
}

const Login = () => {
  // Estado para el usuario y contraseña
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Estado para el mensaje de error
  const [errorMessage, setErrorMessage] = useState("");
  // Estado para el usuario autenticado (podría ser un objeto de usuario en lugar de null)
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null); // Cambiado a string para el nombre de usuario
  // Estado para el mensaje de éxito
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para el modo oscuro
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

  // --- Nueva función para manejar el envío del formulario de login ---
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Previene el recargado de la página por defecto del formulario

    setErrorMessage(""); // Limpiar cualquier mensaje de error previo
    setSuccessMessage(""); // Limpiar cualquier mensaje de éxito previo
    setLoading(true);

    if (!username || !password) {
      setErrorMessage("Por favor, ingresa tu usuario y contraseña.");
      setLoading(false);
      return;
    }

    try {
      // Llama a la función de autenticación del proceso principal de Electron
      const response = await window.electronAPI.authenticateUser(username, password);

      if (response.success) {
        setSuccessMessage("¡Inicio de sesión exitoso!");
        setAuthenticatedUser(username); // Guarda el nombre de usuario autenticado
        setLoading(false);
      } else if (response.reason === "inactive") {
        setErrorMessage("Usuario inactivo. Por favor, contacte al administrador.");
        setAuthenticatedUser(null);
        setLoading(false);
      } else {
        setErrorMessage("Usuario o contraseña incorrectos.");
        setAuthenticatedUser(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error al autenticar usuario:", error);
      setErrorMessage(`Error de conexión: ${error.message}`);
      setAuthenticatedUser(null);
      setLoading(false);
    }
  };

  // Si el usuario ya está autenticado, podrías mostrar un mensaje o redirigir
  if (authenticatedUser) {
    return <App />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] dark:bg-gray-900 transition-colors duration-300">
      {/* Botón modo claro/oscuro */}
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="text-gray-700 dark:text-white hover:scale-110 transition cursor-pointer">
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      <div
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl
        border border-[#f8cdd2] dark:border-[#d6a463]"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white font-cursive">LUPITA</h1>

        {/* Mensajes de error/éxito */}
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        {/* Conectamos el formulario con handleLogin */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
            <div className="flex items-center bg-[#f3f4f6] dark:bg-gray-700 rounded px-3 py-2">
              <User className="text-gray-600 dark:text-gray-300 mr-2" size={18} />
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                className="bg-transparent outline-none w-full text-gray-800 dark:text-white placeholder-gray-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Conecta el estado del usuario
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <div className="flex items-center bg-[#f3f4f6] dark:bg-gray-700 rounded px-3 py-2">
              <Lock className="text-gray-600 dark:text-gray-300 mr-2" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-gray-800 dark:text-white placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-2 text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-[#e87e8a] dark:bg-[#d6a463] hover:opacity-90 text-white font-semibold py-2 rounded-xl transition cursor-pointer flex items-center justify-center ${loading ? 'opacity-70' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
