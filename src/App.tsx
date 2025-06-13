import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";

function App() {
  return (
    <>
      <div className="container mx-auto p-4">
        <header className="mb-8 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Panel de Ventas</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">Admin User</p>
                <p className="text-sm text-gray-600">admin@example.com</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl text-gray-600">AU</span>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Ventas Totales</h3>
              <p className="text-2xl font-bold text-blue-600">$15,234</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Pedidos</h3>
              <p className="text-2xl font-bold text-blue-600">124</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Clientes</h3>
              <p className="text-2xl font-bold text-blue-600">45</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Ventas Mensuales</h3>
              <div className="bg-gray-100 p-4 rounded">[Gráfica]</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Ventas Recientes</h3>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded">Venta #1234 - $500</li>
                <li className="p-2 hover:bg-gray-50 rounded">Venta #1235 - $300</li>
                <li className="p-2 hover:bg-gray-50 rounded">Venta #1236 - $750</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
