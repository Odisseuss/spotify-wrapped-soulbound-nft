import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import App from "./components/App/App";
import { DAppProvider } from "@usedapp/core";
import { useDappConfig } from "./utils/config";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <DAppProvider config={useDappConfig}>
      <App />
    </DAppProvider>
  </React.StrictMode>
);

reportWebVitals();
