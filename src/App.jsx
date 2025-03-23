import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Sidebar from "./layout/Sidebar/Sidebar";
import ManagerContent from "./layout/Content/managerContent";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <ManagerContent />
      </div>
    </Router>
  );
}

export default App;
