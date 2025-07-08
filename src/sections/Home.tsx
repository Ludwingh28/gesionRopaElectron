import React from "react";

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

const Home = () => {
  return (
    <>
      <header className="text-3xl font-bold border-b border-[#e19ea6] dark:border-[#d6a463] pb-2">
        Resumen de Ventas
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Ventas Totales" value="Bs. 12,540" />
        <Card title="Pedidos del Día" value="89" />
        <Card title="Clientes Nuevos" value="15" />
      </section>
    </>
  );
};

export default Home; 