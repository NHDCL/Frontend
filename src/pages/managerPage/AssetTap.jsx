import React, { useRef, useEffect } from "react";
import "./css/assetTap.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const AssetTap = ({ activeTab, setActiveTab, categories }) => {
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Use category name instead of ID
  };

  // Handle scrolling state
  const handleScroll = () => {
    if (tabsRef.current) {
      setCanScrollLeft(tabsRef.current.scrollLeft > 0);
      setCanScrollRight(
        tabsRef.current.scrollLeft < tabsRef.current.scrollWidth - tabsRef.current.clientWidth
      );
    }
  };

  useEffect(() => {
    handleScroll(); // Initial check on component mount
  }, []);

  return (
    <div className="tabs-container">
      {/* Left Arrow */}
      <button
        className={`arrow arrow-left ${canScrollLeft ? "visible" : ""}`}
        onClick={() => tabsRef.current.scrollBy({ left: -200, behavior: "smooth" })}
      >
        <FaArrowLeft />
      </button>

      {/* Tabs */}
      <div className="tabs" ref={tabsRef} onScroll={handleScroll}>
        {categories.map((category) => (
          <button
            key={category.name}
            className={activeTab === category.name ? "active" : ""}
            onClick={() => handleTabClick(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        className={`arrow arrow-right ${canScrollRight ? "visible" : ""}`}
        onClick={() => tabsRef.current.scrollBy({ left: 200, behavior: "smooth" })}
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

export default AssetTap;
