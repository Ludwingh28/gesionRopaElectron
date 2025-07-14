import { useEffect, useState } from "react";
import { Mail, Phone, User } from "lucide-react";

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
const SupportCard = ({ nombre, telefono, email }: { nombre: string; telefono: string; email: string }) => {
  // Eliminar espacios y símbolos para el enlace de WhatsApp
  const phoneNumber = telefono.replace(/[^\d]/g, "");
  const whatsappMessage = encodeURIComponent("Hola, necesito soporte con la tienda.");
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
        <Phone className="text-pink-500 dark:text-[#d6a463]" />
        <span>
          <strong>Teléfono:</strong>{" "}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline dark:text-green-400"
          >
            {telefono}
          </a>
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Mail className="text-pink-500 dark:text-[#d6a463]" />
        <span>
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${email}?subject=Soporte`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
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
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2">
        Soporte
      </header>

      <section className="mt-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {supportData.map((soporte, idx) => (
            <div key={idx} className={idx === 0 ? 'mr-4' : 'ml-4'}>
              <SupportCard {...soporte} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Support;
