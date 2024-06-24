import "@/styles/global.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "@/App";
import { ThemeProvider } from "@/context/theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
