import React from "react";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind/theme.css";
import "./style.css";
import App from "./App";

document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);

const root = document.getElementById("root")!;
root.className = "antialiased bg-background";

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
