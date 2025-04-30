import React, { useState, lazy, Suspense, useEffect } from "react";
import AssetTap from "./AssetTap";
import { useGetCategoryQuery } from "../../slices/assetApiSlice";
import Swal from "sweetalert2";

// Mapping API category names to corresponding component filenames
const categoryMapping = {
  Building: "Building",
  Infrastructure: "Landscaping",
  Facility: "Landscaping",
  Landscaping: "Landscaping",
  Machinery: "Machinery",
  Furniture: "Other",
  RoomQR: "RoomQR", // Fixing casing to match "roomQR" -> "RoomQR"
};

// Default component when category is not found
const DefaultCategory = lazy(() => import("./AssetCategories/Other"));

// Static RoomQr component
const RoomQrComponent = lazy(() => import("./AssetCategories/Room"));

const MAsset = () => {
  const { data: categories, error, isLoading } = useGetCategoryQuery(); // Fetch categories from API

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

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error fetching categories</div>;

  // Get the correct filename based on the category name
  const normalizedTab = activeTab.replace(/\s+/g, "").toLowerCase();
  const componentFile = categoryMapping[activeTab] || "Other";

  // Lazy load the mapped component dynamically or load RoomQr if selected
  const CategoryComponent =
    normalizedTab === "roomqr"
      ? RoomQrComponent
      : lazy(
          () =>
            import(`./AssetCategories/${componentFile}`).catch(
              () => DefaultCategory
            ) // If not found, load 'Other.js'
        );

  return (
    <div className="ManagerDashboard">
      <div className="container">
        <div>
          {/* Render AssetTap with RoomQr included as an option */}
          {categoryList.length > 0 && (
            <AssetTap
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              categories={categoryList}
            />
          )}

          {/* Dynamically Load Component Based on Active Tab */}
          <div className="tab-content">
            <Suspense fallback={<div>Loading...</div>}>
              <CategoryComponent key={activeTab} category={activeTab} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MAsset;
