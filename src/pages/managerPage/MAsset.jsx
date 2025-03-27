import React, { useState, lazy, Suspense } from "react";
import AssetTap from "./AssetTap";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";

import Select from "react-select";


// Lazy load category components correctly
const categoryComponents = {
  Tab1: lazy(() => import("./AssetCategories/Building")),
  Tab2: lazy(() => import("./AssetCategories/Infrastructure")),
  Tab3: lazy(() => import("./AssetCategories/Facilities")),
  Tab4: lazy(() => import("./AssetCategories/Landscaping")),
  Tab5: lazy(() => import("./AssetCategories/Machinery")),
  Tab6: lazy(() => import("./AssetCategories/Furniture")),
};

// Correct path for the default "Other" category
const DefaultCategory = lazy(() => import("./AssetCategories/Other"));

const MAsset = () => {
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


  return (

    <div className="ManagerDashboard">
      <div className="container">
        <div>
          {/* Tabs */}
          <AssetTap activeTab={activeTab} setActiveTab={setActiveTab} categories={categories} />

          {/* Dynamically Load Component Based on Active Tab */}
          <div className="tab-content">
            <Suspense fallback={<div>Loading...</div>}>
              {categoryComponents[activeTab] ? (
                React.createElement(categoryComponents[activeTab])
              ) : (
                <DefaultCategory /> // Use 'Other.js' for newly added categories
              )}
            </Suspense>
          </div>

          {/* Button to Add New Category */}
          {/* <button onClick={() => handleAddCategory("New Custom Category")}>Add New Category</button> */}
        </div>
      </div>
    </div>



  );
};

export default MAsset;
