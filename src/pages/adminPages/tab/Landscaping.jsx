import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { useGetAssetQuery } from "../../../slices/assetApiSlice";
import Tippy from "@tippyjs/react";
import { TiArrowSortedUp } from "react-icons/ti";

const Landscaping = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalData, setModalData] = useState(null);
  const { data: assets } = useGetAssetQuery();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.categoryDetails?.name === category
      );
      setData(filteredAssets);
    }
  }, [assets, category]);

  const rowsPerPage = 10;

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus =
      selectedStatus === "" || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRows.includes(item.AID)));
    setSelectedRows([]);
  };

  const handleView = (item) => {
    setModalData(item);
  };

  // Function to get the class based on workstatus
  const getStatusClass = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In-maintenance-status";
      case "In Usage":
        return "in-usage-status";
      case "Disposed":
        return "disposed-status";
      case "Pending":
        return "Pending-status";
      default:
        return "";
    }
  };

  const getDisplayText = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In Usage"; // Show as 'In Usage'
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  // Extract unique work statuses from data
  const uniqueStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.status))).map((status) => ({
      value: status,
      label: status,
    })),
  ];
  const handleCloseModal = () => {
    setModalData(null);
  };

  const handleDownloadAllImages = () => {
    const imageUrls = modalData.attributes
      .filter((attr) => attr.name.startsWith("image")) // Filter image attributes
      .map((imageAttr) => imageAttr.value); // Get the image URLs

    imageUrls.forEach((imageUrl) => {
      // Create a link element for downloading each image
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop(); // Download the file with its original name

      // Fetch the image as a Blob and trigger the download
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.click(); // Trigger the download
          URL.revokeObjectURL(objectURL); // Clean up
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
        });
    });
  };
  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  const sortData = (column, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      let valA, valB;

      if (column === "Size") {
        const attrA = a.attributes.find((attr) => attr.name === "Size");
        const attrB = b.attributes.find((attr) => attr.name === "Size");
        valA = attrA ? attrA.value : "";
        valB = attrB ? attrB.value : "";
      } else {
        valA = a[column];
        valB = b[column];
      }

      // Normalize: Handle undefined, null, numbers, strings consistently
      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      // If both are numbers, compare numerically
      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        // Otherwise, compare as lowercase strings (for emails, names, etc.)
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const handleSort = (column) => {
    const newSortOrder =
      column === sortOrder.column ? !sortOrder.ascending : true;

    setSortOrder({
      column,
      ascending: newSortOrder,
    });

    sortData(column, newSortOrder);
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "Pending":
        return "The asset is awaiting approval or further action.";
      case "In Usage":
        return "The asset is currently being used.";
      case "In Maintenance":
        return "The asset is currently in use and also undergoing maintenance or repair.";
      case "Disposed":
        return "The asset has been disposed and is no longer in use.";
      default:
        return "Unknown status.";
    }
  };

  return (
    <div className="managerDashboard">
      <div className="search-sort-container">
        <div className="search-container">
          <IoIosSearch style={{ width: "20px", height: "20px" }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dropdown-ls">
          {/* Work Status Dropdown */}
          <Select
            classNamePrefix="custom-select-workstatus"
            className="workstatus-dropdown"
            options={uniqueStatuses}
            value={uniqueStatuses.find(
              (option) => option.value === selectedStatus
            )}
            onChange={(selectedOption) => {
              setSelectedStatus(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            isSearchable={false}
          />
        </div>
      </div>
      {/* Table */}
      <div className="table-container">
        <table className="RequestTable">
          <thead className="table-header">
            <tr>
              {[
                { label: "Sl. No.", field: null },
                { label: "Asset Code", field: "assetCode" },
                { label: "Title", field: "title" },
                { label: "Acquire Date", field: "acquireDate" },
                { label: "Useful Life(year)", field: null },
                { label: "Size", field: "Size" },
                { label: "Depreciated Value (%)", field: null },
                { label: "Status", field: "status" },
              ].map((header, index) => (
                <th key={index}>
                  {header.field ? (
                    <div className="header-title">
                      {header.label}
                      <div className="sort-icons">
                        <button
                          className="sort-btn"
                          onClick={() => handleSort(header.field)}
                          title={`Sort by ${header.label}`}
                        >
                          <TiArrowSortedUp
                            style={{
                              color: "#305845",
                              transform:
                                sortOrder.column === header.field &&
                                sortOrder.ascending
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  ) : (
                    header.label // Non-sortable label like "Action"
                  )}
                </th>
              ))}
              <th>
                {selectedRows.length > 0 && (
                  <button
                    className="delete-all-btn"
                    onClick={handleDeleteSelected}
                  >
                    <RiDeleteBin6Line
                      style={{ width: "20px", height: "20px", color: "red" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {[...displayedData]
              .sort((a, b) => b.assetID - a.assetID) // Sort by assetID DESC
              .map((item, index) => {
                // Extract values from `attributes`
                const sizeAttr = item.attributes.find(
                  (attr) => attr.name === "Size"
                );
                const size = sizeAttr ? sizeAttr.value : "N/A";
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.assetCode}</td>
                    <td className="description">
                      <Tippy content={item.title || ""} placement="top">
                        <span>
                          {item.title?.length > 20
                            ? item.title.substring(0, 20) + "..."
                            : item.title || ""}
                        </span>
                      </Tippy>
                    </td>
                    <td>{formatDate(item.acquireDate)}</td>
                    <td>{item.lifespan}</td>
                    <td>{size}</td>
                    <td>{item.categoryDetails?.depreciatedValue}</td>
                    <td>
                      <Tippy
                        content={getStatusDescription(item.status)}
                        placement="top"
                      >
                        <div className={getStatusClass(item.status)}>
                          {getDisplayText(item.status)}
                        </div>
                      </Tippy>
                    </td>
                    <td className="actions">
                      <button
                        className="view-btn"
                        onClick={() => handleView(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="pagination">
        <span>{filteredData.length} Results</span>
        <div>
          {[...Array(totalPages).keys()].slice(0, 5).map((num) => (
            <button
              key={num}
              className={currentPage === num + 1 ? "active" : ""}
              onClick={() => setCurrentPage(num + 1)}
            >
              {num + 1}
            </button>
          ))}
          <span>...</span>
          <button onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </button>
        </div>
      </div>
      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Asset Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <form className="repair-form">
              <div className="modal-content-field">
                <label>Asset Id:</label>
                <input type="text" value={modalData.assetID} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Title:</label>
                <input type="text" value={modalData.title} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input type="email" value={modalData.assetCode} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Size</label>
                <input
                  type="text"
                  value={
                    modalData?.attributes?.find((attr) => attr.name === "Size")
                      ?.value || "N/A"
                  }
                  readOnly
                />
              </div>

              <div className="modal-content-field">
                <label>Cost:</label>
                <input type="text" value={modalData.cost} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value:</label>
                <input
                  value={modalData.categoryDetails?.depreciatedValue}
                  readOnly
                />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="text"
                  value={formatDate(modalData.acquireDate)}
                  readOnly
                />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData.lifespan} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Status:</label>
                <input value={getDisplayText(modalData.status)} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Category:</label>
                <input value={modalData.categoryDetails?.name} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input value={modalData.assetArea} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Created by</label>
                <input value={modalData.createdBy} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Description: </label>
                <textarea value={modalData.description} readOnly />
              </div>
              {modalData &&
                modalData.attributes &&
                modalData.attributes.filter((attr) =>
                  attr.name.startsWith("image")
                ).length > 0 && (
                  <div className="modal-content-field">
                    <label>Images:</label>
                    <div className="image-gallery">
                      {modalData.attributes
                        .filter((attr) => attr.name.startsWith("image"))
                        .map((imageAttr, index) => (
                          <div key={index} className="image-container">
                            <img
                              src={imageAttr.value}
                              alt={`Asset Image ${index + 1}`}
                              className="asset-image"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              <div className="modal-buttons">
                {/* Align Download Button with Schedule Maintenance */}
                <div className="align-buttons">
                  {modalData.attributes &&
                  modalData.attributes.some((attr) =>
                    attr.name.startsWith("image")
                  ) ? (
                    <button
                      type="button"
                      className="download-all-btn"
                      onClick={handleDownloadAllImages}
                    >
                      Download All Images
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landscaping;
