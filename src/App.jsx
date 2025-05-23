import { BrowserRouter as Router } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import store, { persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { SidebarProvider } from "./context/sidebarContext";
import SessionTimeoutManager from "./pages/sessionTimeoutManager";
// Import your favicon from assets
import faviconIcon from "./assets/images/nhdcl-logo.jpg";

function App() {
  // Use useLayoutEffect instead of useEffect to run synchronously before paint
  useLayoutEffect(() => {
    // Set page title immediately
    document.title = "NHDCL FMS";

    // Set favicon from assets
    const favicon =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    favicon.type = "image/jpeg"; // Changed to jpeg since you're using .jpg
    favicon.rel = "shortcut icon";
    favicon.href = faviconIcon;

    // Remove existing favicon first to avoid conflicts
    const existingFavicon = document.querySelector("link[rel='icon']");
    if (existingFavicon) {
      existingFavicon.remove();
    }

    document.getElementsByTagName("head")[0].appendChild(favicon);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SidebarProvider>
          <Router>
            <AppRoutes />
            <SessionTimeoutManager />
          </Router>
        </SidebarProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
