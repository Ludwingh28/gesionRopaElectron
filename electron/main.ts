import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  connectToDatabase,
  authenticateUser,
  getUsers,
  updateUserStatus,
  createUser,
  updateUser,
  getRoles,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductPrice,
  getBrands,
  getCategories,
  createBrand,
  createCategory,
  getProductByCode,
  getInventoryByProduct,
  createSale,
  addItemToSale,
  getSaleDetails,
  getUserById,
  getInventoryList,
  getTallas,
  getColores,
  createInventoryItem,
  updateInventoryStock,
  deleteInventoryItem,
  getVentasHoy,
  getStockStats,
  getVentasPromotoraMes,
  getDashboardStats,
  addStockToInventory,
  searchProductsWithInventory,
  getProductInventoryDetails,
  getProductosMasVendidos,
  getRankingPromotoras,
  getComparativoVentasMensuales,
  getAnalisisPorCategorias,
  getAnalisisPorMarcas,
  getReporteInventarioCritico,
  getVentasPorMetodoPago,
  getResumenEjecutivo,
} from "./database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

let win: BrowserWindow | null;

// Función para crear el menú personalizado de producción
function createProductionMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Opciones",
      submenu: [
        {
          label: "Recargar",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            if (win) {
              win.webContents.reload();
            }
          },
        },
        {
          label: "Forzar Recarga",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            if (win) {
              win.webContents.reloadIgnoringCache();
            }
          },
        },
        {
          type: "separator",
        },
        {
          label: "Herramientas de Desarrollo",
          accelerator: process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
          click: () => {
            if (win) {
              win.webContents.toggleDevTools();
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "LupitaLogo.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.maximize();

  // Configurar el menú personalizado para producción
  createProductionMenu();

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//app.whenReady().then(createWindow)
app.whenReady().then(async () => {
  try {
    await connectToDatabase();
    createWindow();
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    app.quit();
    return;
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  ipcMain.handle("authenticateUser", async (_, username, password) => {
    try {
      const user = await authenticateUser(username, password);
      if (!user) {
        return { success: false, reason: "invalid_credentials" };
      }
      if (user.activo === 0 || user.activo === false) {
        return { success: false, reason: "inactive" };
      }
      return { success: true, user };
    } catch (error) {
      console.error("Error durante la autenticacion:", error);
      throw error;
    }
  });

  ipcMain.handle("getUsers", async (_, search) => {
    try {
      const users = await getUsers(search);
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  });

  ipcMain.handle("updateUserStatus", async (_, userId, activo) => {
    try {
      await updateUserStatus(userId, activo);
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar estado de usuario:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("createUser", async (_, data) => {
    try {
      const result = await createUser(data);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("updateUser", async (_, data) => {
    try {
      const result = await updateUser(data);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("getRoles", async () => {
    try {
      const roles = await getRoles();
      return roles;
    } catch (error: any) {
      return [];
    }
  });
});

// Handlers para productos
ipcMain.handle("getProducts", async (_, search = "") => {
  try {
    const products = await getProducts(search);
    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
});

ipcMain.handle("createProduct", async (_, data) => {
  try {
    const result = await createProduct(data);
    return result;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
});

ipcMain.handle("updateProduct", async (_, data) => {
  try {
    const result = await updateProduct(data);
    return result;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
});

ipcMain.handle("deleteProduct", async (_, id: number) => {
  try {
    const result = await deleteProduct(id);
    return result;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
});

ipcMain.handle("updateProductPrice", async (_, productId: number, newPrice: number) => {
  try {
    const result = await updateProductPrice(productId, newPrice);
    return result;
  } catch (error) {
    console.error("Error al actualizar precio de producto:", error);
    throw error;
  }
});

ipcMain.handle("getBrands", async () => {
  try {
    const brands = await getBrands();
    return brands;
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    throw error;
  }
});

ipcMain.handle("getCategories", async () => {
  try {
    const categories = await getCategories();
    return categories;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
});

ipcMain.handle("createBrand", async (_, data) => {
  try {
    const result = await createBrand(data);
    return result;
  } catch (error) {
    console.error("Error al crear marca:", error);
    throw error;
  }
});

ipcMain.handle("createCategory", async (_, data) => {
  try {
    const result = await createCategory(data);
    return result;
  } catch (error) {
    console.error("Error al crear categoría:", error);
    throw error;
  }
});

// Handlers para ventas
ipcMain.handle("getProductByCode", async (_, codigo: string) => {
  try {
    const product = await getProductByCode(codigo);
    return product;
  } catch (error) {
    console.error("Error al buscar producto por código:", error);
    throw error;
  }
});

ipcMain.handle("getInventoryByProduct", async (_, productId: number) => {
  try {
    const inventory = await getInventoryByProduct(productId);
    return inventory;
  } catch (error) {
    console.error("Error al obtener inventario del producto:", error);
    throw error;
  }
});

ipcMain.handle("createSale", async (_, data) => {
  try {
    const result = await createSale(data);
    return result;
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw error;
  }
});

ipcMain.handle("addItemToSale", async (_, data) => {
  try {
    const result = await addItemToSale(data);
    return result;
  } catch (error) {
    console.error("Error al agregar item a venta:", error);
    throw error;
  }
});

ipcMain.handle("getSaleDetails", async (_, ventaId: number) => {
  try {
    const details = await getSaleDetails(ventaId);
    return details;
  } catch (error) {
    console.error("Error al obtener detalles de venta:", error);
    throw error;
  }
});

ipcMain.handle("getUserById", async (_, userId: number) => {
  try {
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
});

// Handlers para gestión de inventario
ipcMain.handle("getInventoryList", async () => {
  try {
    const inventory = await getInventoryList();
    return inventory;
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    throw error;
  }
});

ipcMain.handle("getTallas", async () => {
  try {
    const tallas = await getTallas();
    return tallas;
  } catch (error) {
    console.error("Error al obtener tallas:", error);
    throw error;
  }
});

ipcMain.handle("getColores", async () => {
  try {
    const colores = await getColores();
    return colores;
  } catch (error) {
    console.error("Error al obtener colores:", error);
    throw error;
  }
});

ipcMain.handle("createInventoryItem", async (_, data) => {
  try {
    const result = await createInventoryItem(data);
    return result;
  } catch (error) {
    console.error("Error al crear item de inventario:", error);
    throw error;
  }
});

ipcMain.handle("updateInventoryStock", async (_, inventarioId: number, newStock: number) => {
  try {
    const result = await updateInventoryStock(inventarioId, newStock);
    return result;
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    throw error;
  }
});

ipcMain.handle("deleteInventoryItem", async (_, inventarioId: number) => {
  try {
    const result = await deleteInventoryItem(inventarioId);
    return result;
  } catch (error) {
    console.error("Error al eliminar item de inventario:", error);
    throw error;
  }
});

// Handler para obtener estadísticas del dashboard
ipcMain.handle("getDashboardStats", async (_, userId: number, rolNombre: string) => {
  try {
    const stats = await getDashboardStats(userId, rolNombre);
    return stats;
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    throw error;
  }
});

// Handler para obtener ventas del día (admin)
ipcMain.handle("getVentasHoy", async () => {
  try {
    const stats = await getVentasHoy();
    return stats;
  } catch (error) {
    console.error("Error al obtener ventas de hoy:", error);
    throw error;
  }
});

// Handler para obtener estadísticas de stock (admin)
ipcMain.handle("getStockStats", async () => {
  try {
    const stats = await getStockStats();
    return stats;
  } catch (error) {
    console.error("Error al obtener estadísticas de stock:", error);
    throw error;
  }
});

// Handler para obtener ventas de promotora del mes
ipcMain.handle("getVentasPromotoraMes", async (_, userId: number) => {
  try {
    const stats = await getVentasPromotoraMes(userId);
    return stats;
  } catch (error) {
    console.error("Error al obtener ventas de promotora del mes:", error);
    throw error;
  }
});

// Handler para agregar stock a inventario existente
ipcMain.handle("addStockToInventory", async (_, inventarioId: number, cantidad: number, motivo: string, usuarioId: number) => {
  try {
    const result = await addStockToInventory(inventarioId, cantidad, motivo, usuarioId);
    return result;
  } catch (error) {
    console.error("Error al agregar stock:", error);
    throw error;
  }
});

// Handler para buscar productos con inventario
ipcMain.handle("searchProductsWithInventory", async (_, search: string = "") => {
  try {
    const products = await searchProductsWithInventory(search);
    return products;
  } catch (error) {
    console.error("Error al buscar productos con inventario:", error);
    throw error;
  }
});

// Handler para obtener detalles de inventario de un producto
ipcMain.handle("getProductInventoryDetails", async (_, productId: number) => {
  try {
    const inventory = await getProductInventoryDetails(productId);
    return inventory;
  } catch (error) {
    console.error("Error al obtener detalles de inventario:", error);
    throw error;
  }
});

// Handlers para reportes
ipcMain.handle("getProductosMasVendidos", async (_, fechaInicio?: string, fechaFin?: string, limite: number = 20) => {
  try {
    const result = await getProductosMasVendidos(fechaInicio, fechaFin, limite);
    return result;
  } catch (error) {
    console.error("Error al obtener productos más vendidos:", error);
    throw error;
  }
});

ipcMain.handle("getRankingPromotoras", async (_, fechaInicio?: string, fechaFin?: string) => {
  try {
    const result = await getRankingPromotoras(fechaInicio, fechaFin);
    return result;
  } catch (error) {
    console.error("Error al obtener ranking de promotoras:", error);
    throw error;
  }
});

ipcMain.handle("getComparativoVentasMensuales", async (_, mesesAtras: number = 12) => {
  try {
    const result = await getComparativoVentasMensuales(mesesAtras);
    return result;
  } catch (error) {
    console.error("Error al obtener comparativo ventas mensuales:", error);
    throw error;
  }
});

ipcMain.handle("getAnalisisPorCategorias", async (_, fechaInicio?: string, fechaFin?: string) => {
  try {
    const result = await getAnalisisPorCategorias(fechaInicio, fechaFin);
    return result;
  } catch (error) {
    console.error("Error al obtener análisis por categorías:", error);
    throw error;
  }
});

ipcMain.handle("getAnalisisPorMarcas", async (_, fechaInicio?: string, fechaFin?: string) => {
  try {
    const result = await getAnalisisPorMarcas(fechaInicio, fechaFin);
    return result;
  } catch (error) {
    console.error("Error al obtener análisis por marcas:", error);
    throw error;
  }
});

ipcMain.handle("getReporteInventarioCritico", async () => {
  try {
    const result = await getReporteInventarioCritico();
    return result;
  } catch (error) {
    console.error("Error al obtener reporte inventario crítico:", error);
    throw error;
  }
});

ipcMain.handle("getVentasPorMetodoPago", async (_, fechaInicio?: string, fechaFin?: string) => {
  try {
    const result = await getVentasPorMetodoPago(fechaInicio, fechaFin);
    return result;
  } catch (error) {
    console.error("Error al obtener ventas por método de pago:", error);
    throw error;
  }
});

ipcMain.handle("getResumenEjecutivo", async (_, fechaInicio?: string, fechaFin?: string) => {
  try {
    const result = await getResumenEjecutivo(fechaInicio, fechaFin);
    return result;
  } catch (error) {
    console.error("Error al obtener resumen ejecutivo:", error);
    throw error;
  }
});
