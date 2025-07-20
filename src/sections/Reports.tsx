import { useState, useEffect, useCallback } from "react";
import { BarChart2, TrendingUp, Package, AlertTriangle, Calendar, RefreshCw, FileText, DollarSign, Printer, Award, ShoppingBag } from "lucide-react";
import DataTable from "../components/DataTable";

interface CurrentUser {
  id: number;
  nombre: string;
  usuario: string;
  rol_nombre: string;
  email: string;
}

const Reports = () => {
  // Estados principales
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("resumen");

  // Estados de datos con tipos específicos
  const [resumenEjecutivo, setResumenEjecutivo] = useState<any>(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState<any[]>([]);
  const [rankingPromotoras, setRankingPromotoras] = useState<any[]>([]);
  const [comparativoMensual, setComparativoMensual] = useState<any[]>([]);
  const [analisisCategorias, setAnalisisCategorias] = useState<any[]>([]);
  const [analisisMarcas, setAnalisisMarcas] = useState<any[]>([]);
  const [inventarioCritico, setInventarioCritico] = useState<any[]>([]);
  const [ventasPorPago, setVentasPorPago] = useState<any[]>([]);

  // Estados de filtros
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [limite, setLimite] = useState(20);

  const loadAllReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [resumen, productos, promotoras, mensual, categorias, marcas, inventario, metodosPago] = await Promise.all([
        window.electronAPI.getResumenEjecutivo(fechaInicio, fechaFin),
        window.electronAPI.getProductosMasVendidos(fechaInicio, fechaFin, limite),
        window.electronAPI.getRankingPromotoras(fechaInicio, fechaFin),
        window.electronAPI.getComparativoVentasMensuales(12),
        window.electronAPI.getAnalisisPorCategorias(fechaInicio, fechaFin),
        window.electronAPI.getAnalisisPorMarcas(fechaInicio, fechaFin),
        window.electronAPI.getReporteInventarioCritico(),
        window.electronAPI.getVentasPorMetodoPago(fechaInicio, fechaFin),
      ]);

      setResumenEjecutivo(resumen);
      setProductosMasVendidos(productos);
      setRankingPromotoras(promotoras);
      setComparativoMensual(mensual);
      setAnalisisCategorias(categorias);
      setAnalisisMarcas(marcas);
      setInventarioCritico(inventario);
      setVentasPorPago(metodosPago);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
      setError("Error al cargar los reportes");
    }

    setLoading(false);
  }, [fechaInicio, fechaFin, limite]);

  // Cargar usuario actual
  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error al cargar usuario:", err);
      }
    }

    // Establecer fechas por defecto (mes actual)
    const now = new Date();
    const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
    const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFechaInicio(primerDia.toISOString().split("T")[0]);
    setFechaFin(ultimoDia.toISOString().split("T")[0]);
  }, []);

  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      loadAllReports();
    }
  }, [loadAllReports]);

  const exportToPDF = () => {
    // Crear una nueva ventana para el reporte
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Error: No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada por el navegador.");
      return;
    }

    // Obtener el contenido del reporte según la pestaña activa
    let reportContent = "";

    switch (activeTab) {
      case "resumen":
        if (resumenEjecutivo) {
          reportContent = generateResumenEjecutivoHTML();
        }
        break;

      case "productos":
        if (productosMasVendidos.length > 0) {
          reportContent = generateProductosTopHTML();
        }
        break;

      case "promotoras":
        if (rankingPromotoras.length > 0) {
          reportContent = generateRankingPromotorasHTML();
        }
        break;

      case "tendencias":
        if (comparativoMensual.length > 0) {
          reportContent = generateTendenciasHTML();
        }
        break;

      case "inventario":
        if (inventarioCritico.length > 0) {
          reportContent = generateInventarioCriticoHTML();
        }
        break;

      default:
        alert("Selecciona una pestaña válida para exportar");
        printWindow.close();
        return;
    }

    if (!reportContent) {
      alert("No hay datos para exportar en la pestaña seleccionada");
      printWindow.close();
      return;
    }

    // HTML completo para la ventana de impresión
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte - Lupita Store</title>
      <style>
        ${getReportStyles()}
      </style>
    </head>
    <body>
      ${reportContent}
    </body>
    </html>
  `;

    // Escribir el contenido en la nueva ventana
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego abrir el diálogo de impresión
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  // Funciones para generar HTML de cada tipo de reporte
  const generateReportHeader = (reportType: string) => {
    const reportDate = new Date().toLocaleDateString("es-ES");

    return `
    <div class="report-container">
      <header class="report-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="./LupitaLogo.ico" alt="Lupita Logo" 
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;height: 60px; width: 60px; background-color: #fce7f3; border-radius: 50%; display: flex; align-items: center; justify-content: center;&quot;><span style=&quot;color: #ec4899; font-weight: bold; font-size: 24px;&quot;>L</span></div>';" />
          </div>
          <div class="title-section">
            <h1>LUPITA</h1>
            <p>Sistema de Gestión</p>
          </div>
          <div class="info-section">
            <div>
              <h2>Fecha del Reporte</h2>
              <p>${reportDate}</p>
            </div>
          </div>
        </div>
        <div class="type-section">
          <h2>Tipo de Reporte</h2>
          <p>${reportType}</p>
        </div>
      </header>
  `;
  };

  const generateReportFooter = () => {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

    return `
      <footer class="report-footer">
        <p>Reporte emitido por el Sistema de Gestión Lupita Store. (${currentDate})</p>
      </footer>
    </div>
  `;
  };

  const generateResumenEjecutivoHTML = () => {
    const description = `Este reporte presenta un análisis integral del desempeño comercial para el período comprendido entre ${fechaInicio} y ${fechaFin}. Incluye métricas clave de ventas, análisis de productos más vendidos, ranking de promotoras y tendencias generales del negocio.`;

    return `
    ${generateReportHeader("Resumen Ejecutivo de Ventas")}
    <section class="description-section">
      <p>${description}</p>
    </section>
    <main class="report-content">
      <section class="no-page-break">
        <h3>Métricas Principales</h3>
        <div class="metrics-grid">
          <div class="metric-card bg-blue-50">
            <h4 class="text-blue-800">Total Ventas</h4>
            <p class="text-blue-600">${resumenEjecutivo?.estadisticas?.total_ventas || 0}</p>
          </div>
          <div class="metric-card bg-green-50">
            <h4 class="text-green-800">Total Facturado</h4>
            <p class="text-green-600">Bs. ${Number(resumenEjecutivo?.estadisticas?.total_facturado || 0).toLocaleString()}</p>
          </div>
          <div class="metric-card bg-purple-50">
            <h4 class="text-purple-800">Promedio por Venta</h4>
            <p class="text-purple-600">Bs. ${Number(resumenEjecutivo?.estadisticas?.promedio_venta || 0).toFixed(2)}</p>
          </div>
          <div class="metric-card bg-orange-50">
            <h4 class="text-orange-800">Artículos Vendidos</h4>
            <p class="text-orange-600">${resumenEjecutivo?.estadisticas?.articulos_vendidos || 0}</p>
          </div>
        </div>
      </section>
      
      <section>
        <h3>Top 5 Productos Más Vendidos</h3>
        <div class="table-container no-page-break">
          <table>
            <thead>
              <tr>
                <th>Posición</th>
                <th>Producto</th>
                <th>Unidades Vendidas</th>
                <th>Total Facturado</th>
              </tr>
            </thead>
            <tbody>
              ${
                resumenEjecutivo?.topProductos
                  ?.slice(0, 5)
                  .map(
                    (producto: any, index: number) => `
                <tr>
                  <td class="font-bold text-center">${index + 1}</td>
                  <td>${producto.detalle || "N/A"}</td>
                  <td class="text-center">${producto.total_vendido || 0}</td>
                  <td class="text-right">Bs. ${Number(producto.total_facturado || 0).toLocaleString()}</td>
                </tr>
              `
                  )
                  .join("") || ""
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
    ${generateReportFooter()}
  `;
  };

  const generateProductosTopHTML = () => {
    const description = `Análisis detallado de los ${limite} productos con mejor desempeño en ventas durante el período ${fechaInicio} al ${fechaFin}. Este reporte permite identificar los artículos de mayor rotación y su contribución al total de ingresos.`;

    return `
    ${generateReportHeader("Reporte de Productos Más Vendidos")}
    <section class="description-section">
      <p>${description}</p>
    </section>
    <main class="report-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Posición</th>
              <th>Código</th>
              <th>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Unidades Vendidas</th>
              <th>Total Facturado</th>
            </tr>
          </thead>
          <tbody>
            ${productosMasVendidos
              .map(
                (producto: any, index: number) => `
              <tr>
                <td class="font-bold text-center">${index + 1}</td>
                <td class="font-mono">${producto.codigo_interno || "N/A"}</td>
                <td>${producto.detalle || "N/A"}</td>
                <td>${producto.marca || "N/A"}</td>
                <td>${producto.categoria || "N/A"}</td>
                <td class="text-center font-semibold">${producto.total_vendido || 0}</td>
                <td class="text-right font-semibold">Bs. ${Number(producto.total_facturado || 0).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </main>
    ${generateReportFooter()}
  `;
  };

  const generateRankingPromotorasHTML = () => {
    const description = `Evaluación del desempeño de las promotoras de ventas durante el período ${fechaInicio} al ${fechaFin}. Este análisis incluye métricas de ventas totales, número de transacciones y promedio por venta, permitiendo identificar a las mejores vendedoras.`;

    return `
    ${generateReportHeader("Ranking de Promotoras")}
    <section class="description-section">
      <p>${description}</p>
    </section>
    <main class="report-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Posición</th>
              <th>Promotora</th>
              <th>Total Ventas</th>
              <th>Total Facturado</th>
              <th>Promedio por Venta</th>
              <th>Artículos Vendidos</th>
            </tr>
          </thead>
          <tbody>
            ${rankingPromotoras
              .map(
                (promotora: any, index: number) => `
              <tr>
                <td class="font-bold text-center">${index + 1}</td>
                <td class="font-semibold">${promotora.nombre || "N/A"}</td>
                <td class="text-center">${promotora.total_ventas || 0}</td>
                <td class="text-right font-semibold">Bs. ${Number(promotora.total_facturado || 0).toLocaleString()}</td>
                <td class="text-right">Bs. ${Number(promotora.promedio_venta || 0).toFixed(2)}</td>
                <td class="text-center">${promotora.articulos_vendidos || 0}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </main>
    ${generateReportFooter()}
  `;
  };

  const generateTendenciasHTML = () => {
    const description = `Análisis comparativo de las tendencias de ventas durante los últimos 12 meses. Este reporte muestra la evolución mensual de las ventas, permitiendo identificar patrones estacionales y tendencias de crecimiento o decrecimiento en el negocio.`;

    return `
    ${generateReportHeader("Análisis de Tendencias de Ventas")}
    <section class="description-section">
      <p>${description}</p>
    </section>
    <main class="report-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Mes</th>
              <th>Total Ventas</th>
              <th>Total Facturado</th>
              <th>Artículos Vendidos</th>
              <th>Promedio por Venta</th>
              <th>Vendedores Activos</th>
            </tr>
          </thead>
          <tbody>
            ${comparativoMensual
              .map(
                (mes: any) => `
              <tr>
                <td class="text-center">${mes.ano || mes.año}</td>
                <td class="font-semibold">${mes.nombre_mes}</td>
                <td class="text-center">${mes.total_ventas || 0}</td>
                <td class="text-right font-semibold">Bs. ${Number(mes.total_facturado || 0).toLocaleString()}</td>
                <td class="text-center">${mes.articulos_vendidos || 0}</td>
                <td class="text-right">Bs. ${Number(mes.promedio_venta || 0).toFixed(2)}</td>
                <td class="text-center">${mes.vendedores_activos || 0}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </main>
    ${generateReportFooter()}
  `;
  };

  const generateInventarioCriticoHTML = () => {
    const description = `Listado de productos que requieren reposición urgente por encontrarse en niveles de stock críticos o por debajo del mínimo establecido. Este reporte es fundamental para la gestión de compras y evitar desabastecimientos.`;

    return `
    ${generateReportHeader("Reporte de Inventario Crítico")}
    <section class="description-section">
      <p>${description}</p>
    </section>
    <main class="report-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Talla</th>
              <th>Color</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${inventarioCritico
              .map(
                (item: any) => `
              <tr>
                <td class="font-mono">${item.sku || "N/A"}</td>
                <td>${item.detalle || "N/A"}</td>
                <td class="text-center">${item.talla || "N/A"}</td>
                <td>${item.color || "N/A"}</td>
                <td class="text-center font-bold ${item.stock_actual <= 0 ? "text-red-600" : "text-orange-600"}">${item.stock_actual || 0}</td>
                <td class="text-center">${item.stock_minimo || 0}</td>
                <td class="font-semibold ${item.stock_actual <= 0 ? "text-red-600" : "text-orange-600"}">
                  ${item.stock_actual <= 0 ? "SIN STOCK" : "STOCK BAJO"}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </main>
    ${generateReportFooter()}
  `;
  };

  // Función para obtener los estilos CSS
  const getReportStyles = () => {
    return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.4;
      color: #333;
      background: white;
    }
    
    .report-container {
      background: white;
      color: #333;
      padding: 30px;
      max-width: 100%;
      margin: 0 auto;
    }
    
    .report-header {
      margin-bottom: 40px;
      border-bottom: 3px solid #e5e7eb;
      padding-bottom: 25px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      gap: 20px;
    }
    
    .logo-section img {
      height: 70px;
      width: 70px;
      object-fit: contain;
      border-radius: 8px;
    }
    
    .title-section {
      text-align: center;
      flex: 1;
    }
    
    .title-section h1 {
      font-size: 42px;
      font-weight: bold;
      color: #ec4899;
      letter-spacing: 3px;
      margin-bottom: 8px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    
    .title-section p {
      font-size: 16px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .info-section {
      text-align: right;
      min-width: 150px;
    }
    
    .info-section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    
    .info-section p {
      color: #6b7280;
      font-size: 16px;
      font-weight: 500;
    }
    
    .type-section {
      margin-top: 15px;
    }
    
    .type-section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    
    .type-section p {
      font-size: 20px;
      font-weight: bold;
      color: #ec4899;
    }
    
    .description-section {
      margin-bottom: 35px;
      padding: 20px;
      background: #f8fafc;
      border-left: 4px solid #ec4899;
      border-radius: 0 8px 8px 0;
    }
    
    .description-section p {
      color: #4b5563;
      line-height: 1.7;
      text-align: justify;
      font-size: 15px;
      margin: 0;
    }
    
    .report-content section {
      margin-bottom: 35px;
    }
    
    .report-content h3 {
      font-size: 22px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 20px;
      border-bottom: 2px solid #ec4899;
      padding-bottom: 10px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      padding: 20px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }
    
    .metric-card h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .metric-card p {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    
    .bg-blue-50 { background-color: #eff6ff; }
    .text-blue-800 { color: #1e40af; }
    .text-blue-600 { color: #2563eb; }
    
    .bg-green-50 { background-color: #f0fdf4; }
    .text-green-800 { color: #166534; }
    .text-green-600 { color: #16a34a; }
    
    .bg-purple-50 { background-color: #faf5ff; }
    .text-purple-800 { color: #6b21a8; }
    .text-purple-600 { color: #9333ea; }
    
    .bg-orange-50 { background-color: #fff7ed; }
    .text-orange-800 { color: #9a3412; }
    .text-orange-600 { color: #ea580c; }
    
    .table-container {
      overflow-x: auto;
      margin: 25px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      background: white;
    }
    
    table th {
      background: linear-gradient(135deg, #fce7f3, #fbcfe8);
      color: #374151;
      font-weight: 700;
      padding: 15px 12px;
      text-align: left;
      border-bottom: 3px solid #ec4899;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
    }
    
    table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: 'Courier New', monospace; }
    .text-red-600 { color: #dc2626; }
    .text-orange-600 { color: #ea580c; }
    
    .report-footer {
      margin-top: 50px;
      padding-top: 25px;
      border-top: 3px solid #e5e7eb;
      text-align: center;
    }
    
    .report-footer p {
      color: #6b7280;
      font-weight: 600;
      font-size: 14px;
      margin: 0;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .no-page-break {
      page-break-inside: avoid;
    }
    
    @media print {
      .report-container {
        padding: 15mm;
        font-size: 11pt;
      }
      .title-section h1 {
        font-size: 24pt;
        color: #333 !important;
      }
      table {
        font-size: 9pt;
      }
      table th {
        background: #f0f0f0 !important;
        color: #333 !important;
      }
    }
  `;
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    change,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color?: string;
    change?: number;
  }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? "text-green-600" : "text-red-600"}`}>
              {change > 0 ? "+" : ""}
              {change}% vs mes anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon size={24} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "resumen", name: "Resumen Ejecutivo", icon: FileText },
    { id: "productos", name: "Productos Top", icon: Package },
    { id: "promotoras", name: "Ranking Promotoras", icon: Award },
    { id: "tendencias", name: "Tendencias", icon: TrendingUp },
    { id: "inventario", name: "Inventario Crítico", icon: AlertTriangle },
  ];

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se encontraron datos del usuario</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="border-b border-[#e19ea6] dark:border-[#d6a463] pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="mr-3" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reportes y Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Dashboard de métricas y tendencias de ventas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={exportToPDF} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer">
              <Printer className="mr-2" size={16} />
              Exportar PDF
            </button>
            <button
              onClick={loadAllReports}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 ${loading ? "animate-spin" : ""}`} size={16} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="text-sm font-medium">Periodo:</span>
          </div>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">hasta</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Límite:</span>
            <select
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">{error}</div>}

      {/* Pestañas */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#e87e8a] text-[#e87e8a] dark:border-[#d6a463] dark:text-[#d6a463]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="mr-2" size={16} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div id="report-content">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
              <p className="text-gray-500">Cargando reportes...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab: Resumen Ejecutivo */}
            {activeTab === "resumen" && resumenEjecutivo && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-6">Resumen Ejecutivo</h2>

                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Ventas" value={resumenEjecutivo.estadisticas.total_ventas || 0} icon={ShoppingBag} color="blue" />
                  <StatCard title="Total Facturado" value={`Bs. ${Number(resumenEjecutivo.estadisticas.total_facturado || 0).toLocaleString()}`} icon={DollarSign} color="green" />
                  <StatCard title="Promedio por Venta" value={`Bs. ${Number(resumenEjecutivo.estadisticas.promedio_venta || 0).toFixed(2)}`} icon={TrendingUp} color="purple" />
                  <StatCard title="Artículos Vendidos" value={resumenEjecutivo.estadisticas.articulos_vendidos || 0} icon={Package} color="orange" />
                </div>

                {/* Top 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Top 3 Productos</h3>
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {resumenEjecutivo.topProductos.map((producto: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                                index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-400"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="truncate">{producto.detalle}</span>
                          </div>
                          <span className="font-semibold">{producto.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Top 3 Promotoras</h3>
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {resumenEjecutivo.topPromotoras.map((promotora: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                                index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-400"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="truncate">{promotora.nombre}</span>
                          </div>
                          <span className="font-semibold">Bs. {Number(promotora.total).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Productos Más Vendidos */}
            {activeTab === "productos" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Productos Más Vendidos</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <DataTable
                    data={productosMasVendidos}
                    rowKey={(row) => row.codigo_interno || row.id}
                    columns={[
                      {
                        key: "codigo_interno",
                        label: "Código",
                        render: (row) => <span className="font-mono text-sm">{row.codigo_interno}</span>,
                      },
                      {
                        key: "detalle",
                        label: "Producto",
                        render: (row) => <span className="font-medium">{row.detalle}</span>,
                      },
                      {
                        key: "marca",
                        label: "Marca",
                        render: (row) => <span>{row.marca}</span>,
                      },
                      {
                        key: "categoria",
                        label: "Categoría",
                        render: (row) => <span>{row.categoria}</span>,
                      },
                      {
                        key: "total_vendido",
                        label: "Cantidad Vendida",
                        render: (row) => <span className="text-center font-semibold text-blue-600">{row.total_vendido}</span>,
                      },
                      {
                        key: "total_facturado",
                        label: "Total Facturado",
                        render: (row) => <span className="text-right font-semibold">Bs. {Number(row.total_facturado).toLocaleString()}</span>,
                      },
                      {
                        key: "precio_promedio",
                        label: "Precio Promedio",
                        render: (row) => <span className="text-right">Bs. {Number(row.precio_promedio).toFixed(2)}</span>,
                      },
                      {
                        key: "numero_ventas",
                        label: "Núm. Ventas",
                        render: (row) => <span className="text-center">{row.numero_ventas}</span>,
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Tab: Ranking Promotoras */}
            {activeTab === "promotoras" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Ranking de Promotoras</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <DataTable
                    data={rankingPromotoras}
                    rowKey={(row) => row.promotora || row.id}
                    columns={[
                      {
                        key: "ranking",
                        label: "Ranking",
                        render: (row) => (
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              rankingPromotoras.indexOf(row) === 0
                                ? "bg-yellow-500"
                                : rankingPromotoras.indexOf(row) === 1
                                ? "bg-gray-400"
                                : rankingPromotoras.indexOf(row) === 2
                                ? "bg-orange-400"
                                : "bg-blue-500"
                            }`}
                          >
                            {rankingPromotoras.indexOf(row) + 1}
                          </span>
                        ),
                      },
                      {
                        key: "promotora",
                        label: "Promotora",
                        render: (row) => <span className="font-medium">{row.promotora}</span>,
                      },
                      {
                        key: "total_ventas",
                        label: "Total Ventas",
                        render: (row) => <span className="text-center">{row.total_ventas}</span>,
                      },
                      {
                        key: "total_facturado",
                        label: "Total Facturado",
                        render: (row) => <span className="text-right font-semibold">Bs. {Number(row.total_facturado).toLocaleString()}</span>,
                      },
                      {
                        key: "articulos_vendidos",
                        label: "Artículos Vendidos",
                        render: (row) => <span className="text-center">{row.articulos_vendidos}</span>,
                      },
                      {
                        key: "promedio_venta",
                        label: "Promedio Venta",
                        render: (row) => <span className="text-right">Bs. {Number(row.promedio_venta).toFixed(2)}</span>,
                      },
                      {
                        key: "comision_ganada",
                        label: "Comisión Ganada",
                        render: (row) => <span className="text-right font-semibold text-green-600">Bs. {Number(row.comision_ganada).toLocaleString()}</span>,
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Tab: Tendencias */}
            {activeTab === "tendencias" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Análisis de Tendencias</h2>

                {/* Comparativo Mensual */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Evolución Mensual (Últimos 12 meses)</h3>
                  <div className="overflow-x-auto">
                    <DataTable
                      data={comparativoMensual}
                      rowKey={(row) => `${row.año}-${row.mes}`}
                      columns={[
                        {
                          key: "mes",
                          label: "Mes",
                          render: (row) => (
                            <span className="font-medium">
                              {row.nombre_mes} {row.año}
                            </span>
                          ),
                        },
                        {
                          key: "total_ventas",
                          label: "Ventas",
                          render: (row) => <span className="text-center">{row.total_ventas}</span>,
                        },
                        {
                          key: "total_facturado",
                          label: "Facturado",
                          render: (row) => <span className="text-right">Bs. {Number(row.total_facturado).toLocaleString()}</span>,
                        },
                        {
                          key: "articulos_vendidos",
                          label: "Artículos",
                          render: (row) => <span className="text-center">{row.articulos_vendidos}</span>,
                        },
                        {
                          key: "promedio_venta",
                          label: "Promedio",
                          render: (row) => <span className="text-right">Bs. {Number(row.promedio_venta).toFixed(2)}</span>,
                        },
                        {
                          key: "vendedores_activos",
                          label: "Vendedores",
                          render: (row) => <span className="text-center">{row.vendedores_activos}</span>,
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Análisis por Categorías y Marcas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Categorías</h3>
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analisisCategorias.slice(0, 5).map((categoria: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="font-medium">{categoria.categoria}</span>
                          <div className="text-right">
                            <div className="font-semibold">{categoria.total_vendido} unidades</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Bs. {Number(categoria.total_facturado).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Marcas</h3>
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analisisMarcas.slice(0, 5).map((marca: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="font-medium">{marca.marca}</span>
                          <div className="text-right">
                            <div className="font-semibold">{marca.total_vendido} unidades</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Bs. {Number(marca.total_facturado).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Métodos de Pago */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Ventas por Método de Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {ventasPorPago.map((metodo: any, index: number) => (
                      <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold capitalize">{metodo.metodo_pago}</h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metodo.numero_transacciones}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bs. {Number(metodo.total_facturado).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Inventario Crítico */}
            {activeTab === "inventario" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Inventario Crítico</h2>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                    {inventarioCritico.length} productos necesitan reposición
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <DataTable
                    data={inventarioCritico}
                    rowKey={(row) => row.sku || row.id}
                    columns={[
                      {
                        key: "sku",
                        label: "SKU",
                        render: (row) => <span className="font-mono text-sm">{row.sku}</span>,
                      },
                      {
                        key: "detalle",
                        label: "Producto",
                        render: (row) => <span className="font-medium">{row.detalle}</span>,
                      },
                      {
                        key: "marca",
                        label: "Marca",
                        render: (row) => <span>{row.marca}</span>,
                      },
                      {
                        key: "talla",
                        label: "Talla/Color",
                        render: (row) => (
                          <span>
                            {row.talla} - {row.color}
                          </span>
                        ),
                      },
                      {
                        key: "stock_actual",
                        label: "Stock Actual",
                        render: (row) => <span className={`text-center font-semibold ${row.stock_actual === 0 ? "text-red-600" : "text-orange-600"}`}>{row.stock_actual}</span>,
                      },
                      {
                        key: "stock_minimo",
                        label: "Stock Mínimo",
                        render: (row) => <span className="text-center">{row.stock_minimo}</span>,
                      },
                      {
                        key: "deficit",
                        label: "Déficit",
                        render: (row) => <span className="text-center font-semibold text-red-600">{row.deficit}</span>,
                      },
                      {
                        key: "valor_reposicion_sugerida",
                        label: "Valor Reposición",
                        render: (row) => <span className="text-right font-semibold">Bs. {Number(row.valor_reposicion_sugerida || 0).toLocaleString()}</span>,
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
