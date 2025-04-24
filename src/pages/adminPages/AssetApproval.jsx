import React,{useState} from "react";
import CreationApproval from "./tab/CreationApproval";
import DeletionApproval from "./tab/DeletionApproval";

const AssetApproval = () => {
    const [activeTab, setActiveTab] = useState("creation");

    const categories = [
      { id: "creation", name: "Creation Approval" },
      { id: "deletion", name: "Deletion Approval" },
    ];
  
    return (
      <div className="Approval-tabs-container">
        {/* Tabs */}
        <div className="Approval-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`tab-button ${activeTab === category.id ? "active" : ""}`}
              onClick={() => setActiveTab(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
  
        {/* Tab Content */}
        <div style={{marginRight:"5%"}}>
          {activeTab === "creation" && <CreationApproval />}
          {activeTab === "deletion" && <DeletionApproval />}
        </div>
      </div>
    );
  };
  
  export default AssetApproval;
  