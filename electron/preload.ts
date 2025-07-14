import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  authenticateUser: (username: string, password: string) => ipcRenderer.invoke("authenticateUser", username, password),
  getUsers: (search: string) => ipcRenderer.invoke("getUsers", search),
  updateUserStatus: (userId: number, activo: boolean) => ipcRenderer.invoke("updateUserStatus", userId, activo),
  createUser: (data: any) => ipcRenderer.invoke("createUser", data),
  updateUser: (data: any) => ipcRenderer.invoke("updateUser", data),
  getRoles: () => ipcRenderer.invoke("getRoles"),

  // You can expose other APTs you need here.
  // ...
});
