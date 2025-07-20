import { useState, useEffect, useCallback } from "react";
import { User, ShoppingCart, Package, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

interface DashboardStats {
  // Para Admin
  ventasHoy?: number;
  pedidosHoy?: number;
  stockBajo?: number;
  stockTotal?: number;

  // Para Promotora
  ventasMes?: number;
  gananciasMes?: number;

  // Para Developer
  desarrolladorInfo?: string;
}

const Card = ({
  title,
  value,
  icon: Icon,
  color = "bg-white dark:bg-gray-800",
  textColor = "text-gray-800 dark:text-white",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color?: string;
  textColor?: string;
}) => (
  <div className={`${color} p-6 rounded-xl shadow-md hover:shadow-lg transition border border-[#f8cdd2] dark:border-[#d6a463]`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
        <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
      </div>
      <div className="p-3 bg-[#f8cdd2] dark:bg-[#d6a463] rounded-full">
        <Icon size={24} className="text-[#e87e8a] dark:text-white" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdminStats = useCallback(async () => {
    try {
      // Usar las nuevas funciones del backend
      const [ventasData, stockData] = await Promise.all([window.electronAPI.getVentasHoy(), window.electronAPI.getStockStats()]);

      setStats({
        ventasHoy: ventasData.totalVentas,
        pedidosHoy: ventasData.totalPedidos,
        stockBajo: stockData.stockBajo,
        stockTotal: stockData.stockTotal,
      });
    } catch (err) {
      throw new Error("Error al cargar estadísticas de administrador");
    }
  }, []);

  const loadPromotoraStats = useCallback(async (userId: number) => {
    try {
      // Usar la nueva función del backend para obtener datos de la promotora
      const ventasData = await window.electronAPI.getVentasPromotoraMes(userId);

      setStats({
        ventasMes: ventasData.totalVentas || 0,
        gananciasMes: ventasData.totalGanancias || 0,
      });
    } catch (err) {
      throw new Error("Error al cargar estadísticas de promotora");
    }
  }, []);

  const loadStatsForRole = useCallback(
    async (role: string, userId: number) => {
      setLoading(true);
      setError("");

      try {
        if (role === "admin") {
          await loadAdminStats();
        } else if (role === "promotora") {
          await loadPromotoraStats(userId);
        } else if (role === "developer") {
          setStats({ desarrolladorInfo: "¡Bienvenido al sistema, Developer!" });
        }
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setError("Error al cargar las estadísticas");
      }

      setLoading(false);
    },
    [loadAdminStats, loadPromotoraStats]
  );

  // Cargar usuario del sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (err) {
        console.error("Error al parsear datos de usuario:", err);
        setError("Error al cargar datos del usuario");
      }
    }
  }, []);

  // Cargar estadísticas según el rol
  useEffect(() => {
    if (currentUser) {
      loadStatsForRole(currentUser.rol_nombre, currentUser.id);
    }
  }, [currentUser, loadStatsForRole]);

  // Función para obtener el saludo según la hora
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Función para obtener el mes actual en español
  const getMesActual = () => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[new Date().getMonth()];
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se encontraron datos del usuario</p>
      </div>
    );
  }

  return (
    <>
      {/* Header personalizado */}
      <header className="border-b border-[#e19ea6] dark:border-[#d6a463] pb-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#f8cdd2] dark:bg-[#d6a463] rounded-full">
            <User size={32} className="text-[#e87e8a] dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {getSaludo()}, {currentUser.nombre}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Rol: <span className="font-semibold capitalize">{currentUser.rol_nombre}</span>
              {currentUser.rol_nombre === "promotora" && (
                <span className="ml-2 text-sm bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">Precios especiales +20%</span>
              )}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hoy es{" "}
          {new Date().toLocaleDateString("es-BO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>

      {error && <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e87e8a] dark:border-[#d6a463] mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando estadísticas...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard para Admin */}
          {currentUser.rol_nombre === "admin" && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">📊 Resumen Administrativo</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                  title="Ventas de Hoy"
                  value={`Bs. ${stats.ventasHoy?.toLocaleString() || "0"}`}
                  icon={DollarSign}
                  color="bg-green-50 dark:bg-green-900/20"
                  textColor="text-green-700 dark:text-green-400"
                />
                <Card title="Pedidos del Día" value={stats.pedidosHoy || 0} icon={ShoppingCart} color="bg-blue-50 dark:bg-blue-900/20" textColor="text-blue-700 dark:text-blue-400" />
                <Card
                  title="Stock Total"
                  value={stats.stockTotal?.toLocaleString() || "0"}
                  icon={Package}
                  color="bg-purple-50 dark:bg-purple-900/20"
                  textColor="text-purple-700 dark:text-purple-400"
                />
                <Card title="Productos Stock Bajo" value={stats.stockBajo || 0} icon={AlertTriangle} color="bg-orange-50 dark:bg-orange-900/20" textColor="text-orange-700 dark:text-orange-400" />
              </div>

              {/* Alertas para admin */}
              {(stats.stockBajo ?? 0) > 0 && (
                <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-400 dark:border-orange-700 text-orange-700 dark:text-orange-400 px-6 py-4 rounded-lg mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-3" size={24} />
                    <div>
                      <h3 className="font-semibold">¡Atención requerida!</h3>
                      <p>Tienes {stats.stockBajo} productos con stock bajo que necesitan reposición.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-[#f8cdd2] to-[#e87e8a] dark:from-[#d6a463] dark:to-[#b8934f] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Panel de Control Administrativo</h3>
                <p className="opacity-90">Desde aquí puedes supervisar las operaciones diarias, gestionar el inventario, revisar reportes de ventas y administrar usuarios del sistema.</p>
              </div>
            </section>
          )}

          {/* Dashboard para Promotora */}
          {currentUser.rol_nombre === "promotora" && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">💼 Mi Desempeño en {getMesActual()}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <Card title="Ventas Realizadas" value={stats.ventasMes || 0} icon={ShoppingCart} color="bg-green-50 dark:bg-green-900/20" textColor="text-green-700 dark:text-green-400" />
                <Card
                  title="Comisión del Mes (20%)"
                  value={`Bs. ${stats.gananciasMes?.toLocaleString() || "0"}`}
                  icon={TrendingUp}
                  color="bg-blue-50 dark:bg-blue-900/20"
                  textColor="text-blue-700 dark:text-blue-400"
                />
              </div>

              {/* Información especial para promotoras */}
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="mr-3 text-orange-600 dark:text-orange-400" size={24} />
                  <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">Beneficio Especial Promotora</h3>
                </div>
                <p className="text-orange-700 dark:text-orange-400 mb-2">Como promotora, vendes con precios 20% más altos que el precio base. Esta comisión del 20% es tu ganancia.</p>
                <p className="text-sm text-orange-600 dark:text-orange-500">* Ejemplo: Si admin vende a Bs. 100, tú vendes a Bs. 120 y ganas Bs. 20 de comisión</p>
              </div>

              <div className="bg-gradient-to-r from-[#f8cdd2] to-[#e87e8a] dark:from-[#d6a463] dark:to-[#b8934f] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">¡Sigue así, {currentUser.nombre}!</h3>
                <p className="opacity-90">Tu trabajo como promotora es fundamental para el éxito de Lupita Store. Cada venta cuenta y tu dedicación marca la diferencia.</p>
              </div>
            </section>
          )}

          {/* Dashboard para Developer */}
          {currentUser.rol_nombre === "developer" && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">👨‍💻 Panel de Desarrollador</h2>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <Card title="Estado del Sistema" value="Operativo" icon={CheckCircle} color="bg-green-50 dark:bg-green-900/20" textColor="text-green-700 dark:text-green-400" />
              </div>

              <div className="bg-gradient-to-r from-indigo-100 to-purple-200 dark:from-indigo-900/20 dark:to-purple-800/20 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Users className="mr-3 text-indigo-600 dark:text-indigo-400" size={24} />
                  <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">Acceso Completo</h3>
                </div>
                <p className="text-indigo-700 dark:text-indigo-400 mb-2">Como desarrollador, tienes acceso completo a todas las funcionalidades del sistema.</p>
                <ul className="text-sm text-indigo-600 dark:text-indigo-500 space-y-1">
                  <li>• Gestión completa de usuarios y roles</li>
                  <li>• Administración total del inventario</li>
                  <li>• Acceso a todas las funciones de ventas</li>
                  <li>• Visualización de reportes completos</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-[#f8cdd2] to-[#e87e8a] dark:from-[#d6a463] dark:to-[#b8934f] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Sistema Lupita Store v1.0</h3>
                <p className="opacity-90">
                  Sistema de gestión de inventario y ventas desarrollado con React, TypeScript, Electron y MySQL. Todas las funcionalidades están disponibles para tu uso y pruebas.
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default Home;
