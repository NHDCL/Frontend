import React, { useState, useRef, useEffect } from "react";
import "./css/assetTap.css";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

const AssetTap = ({ activeTab, setActiveTab, categories }) => {
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Check if scrolling is needed
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
            key={category.id}
            className={activeTab === category.id ? "active" : ""}
            onClick={() => handleTabClick(category.id)}
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
