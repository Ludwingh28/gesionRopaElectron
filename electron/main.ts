import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { connectToDatabase, authenticateUser, getUsers, updateUserStatus, createUser, updateUser, getRoles } from "./database";

const require = createRequire(import.meta.url);
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

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

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
    console.log("Conexion a la base de datos establecida con exito.");
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

  ipcMain.handle("authenticateUser", async (event, username, password) => {
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

  ipcMain.handle("getUsers", async (event, search) => {
    try {
      const users = await getUsers(search);
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  });

  ipcMain.handle("updateUserStatus", async (event, userId, activo) => {
    try {
      await updateUserStatus(userId, activo);
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar estado de usuario:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("createUser", async (event, data) => {
    try {
      const result = await createUser(data);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("updateUser", async (event, data) => {
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
