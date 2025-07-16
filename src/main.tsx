import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./Login.tsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);

// Use contextBridge
if (window.ipcRenderer && typeof window.ipcRenderer.on === 'function') {
  window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
  });
}
