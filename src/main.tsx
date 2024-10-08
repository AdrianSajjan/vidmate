import "@/styles/global.css";

import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/context/theme";
import { queryClient } from "@/config/api";
import { App } from "@/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ThemeProvider>,
);
