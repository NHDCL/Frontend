import React, { useState } from "react";
import "./css/TabSwitcher.css";

const Users = () => {
  const [activeTab, setActiveTab] = useState("Technician");

  return (
    <div className="user-tab-container">
      <button
        className={`tab ${activeTab === "Supervisor" ? "active" : ""}`}
        onClick={() => setActiveTab("Supervisor")}
      >
        Supervisor
      </button>
      <button
        className={`tab ${activeTab === "Technician" ? "active" : ""}`}
        onClick={() => setActiveTab("Technician")}
      >
        Technician
      </button>
    </div>
    // <div>
    //   <h1>Users</h1>
    // </div>
  );
};

export default Users;
