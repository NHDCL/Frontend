import { BrowserRouter as Router } from "react-router-dom";
import { useLayoutEffect } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import store from "./store"; // removed persistor
import { SidebarProvider } from "./context/sidebarContext";
import SessionTimeoutManager from "./pages/sessionTimeoutManager";
import faviconIcon from "./assets/images/nhdcl-logo.jpg";

function App() {
  useLayoutEffect(() => {
    document.title = "NHDCL FMS";

    const favicon =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    favicon.type = "image/jpeg";
    favicon.rel = "shortcut icon";
    favicon.href = faviconIcon;

    const existingFavicon = document.querySelector("link[rel='icon']");
    if (existingFavicon) {
      existingFavicon.remove();
    }

    document.getElementsByTagName("head")[0].appendChild(favicon);
  }, []);

  return (
    <Provider store={store}>
      <SidebarProvider>
        <Router>
          <AppRoutes />
          <SessionTimeoutManager />
        </Router>
      </SidebarProvider>
    </Provider>
  );
}

export default App;
