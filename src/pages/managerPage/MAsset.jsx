import React, { useState, lazy, Suspense } from "react";
import AssetTap from "./AssetTap";
import { useGetCategoryQuery } from "../../slices/assetApiSlice";

// Mapping API category names to corresponding component filenames
const categoryMapping = {
  Building: "Building",
  Infrastructure: "Landscaping",
  Facility: "Landscaping",
  Landscaping: "Landscaping",
  Machinery: "Machinery",
  Furniture: "Other",
  RoomQr: "RoomQr", // Adding static RoomQr mapping
};

// Default component when category is not found
const DefaultCategory = lazy(() => import("./AssetCategories/Other"));

// Static RoomQr component
const RoomQrComponent = lazy(() => import("./AssetCategories/Other"));

const MAsset = () => {
  const { data: categories, error, isLoading } = useGetCategoryQuery(); // Fetch categories from API

  // Ensure categories exist before setting defaultTab
  const defaultTab =
    categories && categories.length > 0 ? categories[0].name : "Building";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Adding RoomQr manually to categories to display in the AssetTap
  const categoryList = categories
    ? [...categories, { name: "Room QR" }]
    : [{ name: "RoomQr" }];

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error fetching categories</div>;

  // Get the correct filename based on the category name
  const componentFile = categoryMapping[activeTab] || "Other";

  // Lazy load the mapped component dynamically or load RoomQr if selected
  const CategoryComponent =
    activeTab === "RoomQr"
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
