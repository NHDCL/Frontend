import React, { useState, lazy, Suspense } from "react";
import "./../managerPage/css/assetTap.css"; // Ensure this is just a CSS import

import Select from "react-select";
import AssetTap from "./../managerPage/AssetTap"; // Ensure this is the correct component import

// Lazy load category components
const Tab1 = lazy(() => import("./tab/Building"));
const Tab2 = lazy(() => import("./tab/Infrastructure"));
const Tab3 = lazy(() => import("./tab/Facilities"));
const Tab4 = lazy(() => import("./tab/Landscaping"));
const Tab5 = lazy(() => import("./tab/Machinery"));
const Tab6 = lazy(() => import("./tab/Furniture"));
const DefaultCategory = lazy(() => import("./tab/Other")); // Default category

const categoryComponents = {
  Tab1,
  Tab2,
  Tab3,
  Tab4,
  Tab5,
  Tab6,
};

const AdminAssets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [categories, setCategories] = useState([
    { id: "Tab1", name: "Building" },
    { id: "Tab2", name: "Infrastructure & Service" },
    { id: "Tab3", name: "Facilities & Amenities" },
    { id: "Tab4", name: "Landscaping" },
    { id: "Tab5", name: "Machinery & Equipment" },
    { id: "Tab6", name: "Furniture & Fixture" },
  ]);

  const [activeTab, setActiveTab] = useState("Tab1");

  // Function to add a new category dynamically
  const handleAddCategory = (newCategoryName) => {
    const newCategoryId = `Tab${categories.length + 1}`;
    setCategories([...categories, { id: newCategoryId, name: newCategoryName }]);
    setActiveTab(newCategoryId); // Automatically switch to the new category
  };

  // Get the active tab component
  const ActiveComponent = categoryComponents[activeTab] || DefaultCategory;

  return (
    <div className="ManagerDashboard">
      <div className="container">
        <div>
          {/* Tabs */}
          <AssetTap activeTab={activeTab} setActiveTab={setActiveTab} categories={categories} />

          {/* Dynamically Load Component Based on Active Tab */}
          <div className="tab-content">
            <Suspense fallback={<div>Loading...</div>}>
              <ActiveComponent />
            </Suspense>
          </div>

          {/* Button to Add New Category */}
          {/* <button onClick={() => handleAddCategory("New Custom Category")}>Add New Category</button> */}
        </div>
      </div>
    </div>
  );
};

export default AdminAssets;
