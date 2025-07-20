import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Login from "./Login.tsx";
import App from "./App.tsx";

import "./index.css";

// Componente principal que maneja la autenticación
const MainApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado en localStorage
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error al parsear datos de usuario:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e87e8a] dark:border-[#d6a463] mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <App onLogout={handleLogout} /> : <Login onLoginSuccess={handleLoginSuccess} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);

// Use contextBridge
if (window.ipcRenderer && typeof window.ipcRenderer.on === 'function') {
  window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
  });
}
