import { useEffect, useState } from "react";
import { Mail, MessageCircleCode, User } from "lucide-react";

// Array de datos de soporte
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

// Componente para mostrar una card de soporte
const SupportCard = ({ nombre, telefono, email, ccEmail }: { nombre: string; telefono: string; email: string; ccEmail: string }) => {
  // Eliminar espacios y símbolos para el enlace de WhatsApp
  const phoneNumber = telefono.replace(/[^\d]/g, "");
  const whatsappMessage = encodeURIComponent(`Hola, necesito soporte con el Sistema de Gestión de Ropa "Lupita".`);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-w-md w-full border border-[#f8cdd2] dark:border-[#d6a463] space-y-6">
      <div className="flex items-center space-x-4">
        <User className="text-pink-500 dark:text-[#d6a463]" />
        <span>
          <strong>Nombre:</strong> {nombre}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <MessageCircleCode className="text-pink-500 dark:text-[#d6a463]" />
        <span>
          <strong>Whatsapp:</strong>{" "}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline dark:text-green-400">
            {telefono}
          </a>
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Mail className="text-pink-500 dark:text-[#d6a463]" />
        <span>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${email}?cc=${ccEmail}&subject=Soporte: Sistema de Gestion de Ropa "Lupita"`} className="text-blue-600 hover:underline dark:text-blue-400">
            {email}
          </a>
        </span>
      </div>
    </div>
  );
};

const Support = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return (
    <>
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2">Soporte</header>

      {/* Notificación Tip */}
      <div className="mt-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-4xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
            <strong>Tip:</strong> Haga click sobre el método de contacto y deje que nosotros nos encarguemos de abrirle la app
          </p>
        </div>
      </div>

      <section className="mt-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {supportData.map((soporte, idx) => {
            // Determinar el email para CC (el del otro contacto)
            const ccEmail = supportData.find((item, index) => index !== idx)?.email || "";

            return (
              <div key={idx} className={idx === 0 ? "mr-4" : "ml-4"}>
                <SupportCard {...soporte} ccEmail={ccEmail} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Support;
