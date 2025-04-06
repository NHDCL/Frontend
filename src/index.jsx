import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { SidebarProvider } from "./context/sidebarContext.jsx";
import { AuthProvider } from "./context/AuthContext"; // Import the AuthProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <SidebarProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SidebarProvider>
);
