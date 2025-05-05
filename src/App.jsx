import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import store, { persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { SidebarProvider } from "./context/sidebarContext";
import SessionTimeoutManager from "./pages/sessionTimeoutManager";

function App() {
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
