import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initPreviewAuthListener } from "@/api/auth.js";
import "./index.css";
import MiniApp from "./App.jsx";

initPreviewAuthListener();
const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <StrictMode><QueryClientProvider client={queryClient}><MiniApp /></QueryClientProvider></StrictMode>,
);
