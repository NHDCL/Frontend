import React, { useState, lazy, Suspense, useEffect } from "react";
import "./../managerPage/css/assetTap.css";
import AssetTap from "./../managerPage/AssetTap";
import { useGetCategoryQuery } from "../../slices/assetApiSlice";
import Swal from "sweetalert2"; // Import SweetAlert2

const categoryMapping = {
  Building: "Building",
  Infrastructure: "Landscaping",
  Facility: "Landscaping",
  Landscaping: "Landscaping",
  Machinery: "Machinery",
  Furniture: "Other",
  RoomQR: "RoomQR",
};

// Default component when category is not found
const DefaultCategory = lazy(() => import("./tab/Other"));

// Static RoomQr component
const RoomQrComponent = lazy(() => import("./tab/Room"));

const AdminAssets = () => {
  const { data: categories, error, isLoading } = useGetCategoryQuery();

  // Use SweetAlert2 for loading state
  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading assets...",
        text: "Please wait while we fetch the asset categories",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      // Close the alert when loading is complete
      if (Swal.isVisible()) {
        Swal.close();
      }

      // Show error message if there was an error
      if (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load asset categories. Please try again later.",
        });
      }
    }
  }, [isLoading, error]);

  // Filter out categories where 'deleted' is true
  const activeCategories = categories
    ? categories.filter((category) => !category.deleted)
    : [];

  // Ensure categories exist before setting defaultTab
  const defaultTab =
    activeCategories.length > 0 ? activeCategories[0].name : "Building";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Adding RoomQr manually to categories to display in the AssetTap
  const categoryList = [
    ...activeCategories.slice(0, 1),
    { name: "Room QR" },
    ...activeCategories.slice(1)
  ];

  // Get the correct filename based on the category name
  const normalizedTab = activeTab.replace(/\s+/g, "").toLowerCase();
  const componentFile = categoryMapping[activeTab] || "Other";

  // Lazy load the mapped component dynamically or load RoomQr if selected
  const CategoryComponent =
    normalizedTab === "roomqr"
      ? RoomQrComponent
      : lazy(() =>
          import(`./tab/${componentFile}`).catch(() => DefaultCategory)
        );

  // Add loading state for Suspense fallback
  const [tabLoading, setTabLoading] = useState(false);

  // Handle tab change with loading indicator
  const handleTabChange = (tab) => {
    setTabLoading(true);
    setActiveTab(tab);
    // The loading state will be handled by Suspense
  };

  return (
    <div className="ManagerDashboard">
      <div className="container">
        <div>
          {/* Render AssetTap with categories */}
          {categoryList.length > 0 && (
            <AssetTap
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              categories={categoryList}
            />
          )}

          {/* Suspense with enhanced loading state for tab content */}
          <div className="tab-content">
            <Suspense
              fallback={
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading content...</p>
                </div>
              }
            >
              <CategoryComponent
                key={activeTab}
                category={activeTab}
                onLoad={() => setTabLoading(false)}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssets;
