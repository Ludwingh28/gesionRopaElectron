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
const SupportCard = ({ nombre, telefono, email }: { nombre: string; telefono: string; email: string }) => (
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
        <strong>Teléfono:</strong> {telefono}
      </span>
    </div>
    <div className="flex items-center space-x-4">
      <Mail className="text-pink-500 dark:text-[#d6a463]" />
      <span>
        <strong>Email:</strong> {email}
      </span>
    </div>
  </div>
);

const Support = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2 ">Soporte</header>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
        {supportData.map((soporte, idx) => (
          <div key={idx} className={idx === 0 ? 'mr-4' : 'ml-4'}>
            <SupportCard {...soporte} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
