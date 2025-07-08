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
  RoomQR: "RoomQR",
};

// Default and static components
const DefaultCategory = lazy(() => import("./AssetCategories/Other"));
const RoomQrComponent = lazy(() => import("./AssetCategories/Room"));

const MAsset = () => {
  const { data: categories, error, isLoading } = useGetCategoryQuery();
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading assets...",
        text: "Please wait while we fetch the asset categories.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      if (Swal.isVisible()) Swal.close();

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: "Unable to load asset categories. Please try again later.",
        });
      }

      if (categories) {
        const filtered = categories.filter((category) => !category.deleted);
        const defaultTab = filtered.length > 0 ? filtered[0].name : "Room QR";
        setActiveTab(defaultTab);
      }
    }
  }, [isLoading, error, categories]);

  // Filter out deleted categories
  const activeCategories = categories
    ? categories.filter((category) => !category.deleted)
    : [];

  // Add Room QR tab manually
  const categoryList =
    activeCategories.length > 0
      ? [
          ...activeCategories.slice(0, 1),
          { name: "Room QR" },
          ...activeCategories.slice(1),
        ]
      : [{ name: "Room QR" }];

  // Wait until activeTab is ready
  if (isLoading || !activeTab) return null;
  if (error) return null;

  // Determine component to load
  const normalizedTab = activeTab.replace(/\s+/g, "").toLowerCase();
  const componentFile = categoryMapping[activeTab] || "Other";
  const CategoryComponent =
    normalizedTab === "roomqr"
      ? RoomQrComponent
      : lazy(() =>
          import(`./AssetCategories/${componentFile}`).catch(
            () => DefaultCategory
          )
        );

  return (
    <div className="ManagerDashboard">
      <div className="container">
        <div>
          {/* Tabs or fallback */}
          {categoryList.length > 0 ? (
            <AssetTap
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              categories={categoryList}
            />
          ) : (
            <div className="text-center text-muted my-3">
              No categories available
            </div>
          )}

          {/* Dynamic tab content */}
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
