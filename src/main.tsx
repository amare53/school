import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import NotificationSystem from "./shared/components/ui/NotificationSystem.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <NotificationSystem />
  </StrictMode>
);
