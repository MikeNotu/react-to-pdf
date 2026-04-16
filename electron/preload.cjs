const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  app: "react-to-pdf",
});
