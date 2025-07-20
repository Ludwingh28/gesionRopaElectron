import { useState, useEffect } from "react";
import { Moon, Sun, User, Lock, Eye, EyeOff, Mail, MessageCircleCode, User as UserIcon, X } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
}

// Array de datos de soporte (igual que en Support.tsx)
const supportData = [
  {
    nombre: "Ludwing Julian Herrera Justiniano",
    telefono: "+591 78118005",
    email: "ludwingh2807@gmail.com",
  },
  {
    nombre: "Cristian David Ramirez Callejas",
    telefono: "+591 75057788",
    email: "cristian25ramirezrc@gmail.com",
  },
];

// Componente para mostrar una card de soporte (igual que en Support.tsx)
const SupportCard = ({ nombre, telefono, email, ccEmail }: { nombre: string; telefono: string; email: string; ccEmail: string }) => {
  // Eliminar espacios y símbolos para el enlace de WhatsApp
  const phoneNumber = telefono.replace(/[^\d]/g, "");
  const whatsappMessage = encodeURIComponent(`Hola, necesito soporte con el Sistema de Gestión de Ropa "Lupita".`);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-md w-full border border-[#f8cdd2] dark:border-[#d6a463] space-y-6">
      <div className="flex items-center space-x-4">
        <UserIcon className="text-pink-500 dark:text-[#d6a463]" />
        <span className="text-gray-800 dark:text-white">
          <strong>Nombre:</strong> {nombre}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <MessageCircleCode className="text-pink-500 dark:text-[#d6a463]" />
        <span className="text-gray-800 dark:text-white">
          <strong>Whatsapp:</strong>{" "}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline dark:text-green-400">
            {telefono}
          </a>
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Mail className="text-pink-500 dark:text-[#d6a463]" />
        <span className="text-gray-800 dark:text-white">
          <strong>Email:</strong>{" "}
          <a href={`mailto:${email}?cc=${ccEmail}&subject=Soporte: Sistema de Gestion de Ropa "Lupita"`} className="text-blue-600 hover:underline dark:text-blue-400">
            {email}
          </a>
        </span>
      </div>
    </div>
  );
};

const Login = ({ onLoginSuccess }: LoginProps) => {
  // Estado para el usuario y contraseña
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Estado para el mensaje de error
  const [errorMessage, setErrorMessage] = useState("");
  // Estado para el modal de soporte
  const [showSupportModal, setShowSupportModal] = useState(false);

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

  // Función para manejar el envío del formulario de login
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Previene el recargado de la página por defecto del formulario

    setErrorMessage(""); // Limpiar cualquier mensaje de error previo
    setLoading(true);

    if (!username || !password) {
      setErrorMessage("Por favor, ingresa tu usuario y contraseña.");
      setLoading(false);
      return;
    }

    try {
      // Llama a la función de autenticación del proceso principal de Electron
      const response = await window.electronAPI.authenticateUser(username, password);

      if (response.success && response.user) {
        // Guardar información del usuario en sessionStorage
        const userData = {
          id: response.user.id || 1, // Asegurar que tenga un ID
          nombre: response.user.nombre || username,
          usuario: response.user.usuario || username,
          rol_nombre: response.user.rol_nombre,
          email: response.user.email || "",
        };
        sessionStorage.setItem("currentUser", JSON.stringify(userData));

        setLoading(false);

        // Llamar inmediatamente a la función de callback para redirigir
        onLoginSuccess();
      } else if (response.reason === "inactive") {
        setErrorMessage("Usuario inactivo. Por favor, contacte al administrador.");
        setLoading(false);
      } else {
        setErrorMessage("Usuario o contraseña incorrectos.");
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Error al autenticar usuario:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setErrorMessage(`Error de conexión: ${errorMessage}`);
      setLoading(false);
    }
  };

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

        {/* Mensajes de error */}
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

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
            className={`w-full bg-[#e87e8a] dark:bg-[#d6a463] hover:opacity-90 text-white font-semibold py-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              loading ? "opacity-70" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        {/* Texto de ayuda y soporte */}
        <div className="mt-6 text-center">
          <button onClick={() => setShowSupportModal(true)} className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#e87e8a] dark:hover:text-[#d6a463] cursor-pointer transition-colors">
            ¿Necesita ayuda? <span className="underline">Soporte</span>
          </button>
        </div>
      </div>

      {/* Modal de Soporte */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto mx-4">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Soporte</h2>
              <button onClick={() => setShowSupportModal(false)} className="text-gray-500 hover:text-red-500 text-2xl font-bold cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {/* Notificación Tip */}
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    <strong>Tip:</strong> Haga click sobre el método de contacto y deje que nosotros nos encarguemos de abrirle la app
                  </p>
                </div>
              </div>

              {/* Cards de soporte */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {supportData.map((soporte, idx) => {
                  // Determinar el email para CC (el del otro contacto)
                  const ccEmail = supportData.find((_, index) => index !== idx)?.email || "";

                  return (
                    <div key={idx} className={idx === 0 ? "mr-0 md:mr-4" : "ml-0 md:ml-4"}>
                      <SupportCard {...soporte} ccEmail={ccEmail} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
