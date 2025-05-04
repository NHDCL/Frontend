import React, { useEffect, useState, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { useGetAssetQuery } from "../../../slices/assetApiSlice";
import Tippy from "@tippyjs/react";
import { TiArrowSortedUp } from "react-icons/ti";

const Machinery = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalData, setModalData] = useState(null);
  const { data: assets } = useGetAssetQuery();
  const [data, setData] = useState([]);
  const rowsPerPage = 9; // 3x3 grid for QR codes per page
  const qrSize = 40; // Size of each QR code (adjust as needed)
  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.categoryDetails?.name === category
      );
      setData(filteredAssets);
    }
  }, [assets, category]);

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

  const getQrImageUrl = (attributes) => {
    const qrAttr = attributes?.find((attr) => attr.name === "QR Code");
    return qrAttr?.value || "";
  };

  const loadImageAsDataURL = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleSelectRow = (assetCode) => {
    setSelectedRows((prev) =>
      prev.includes(assetCode)
        ? prev.filter((item) => item !== assetCode)
        : [...prev, assetCode]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]); // Deselect all if all are selected
    } else {
      setSelectedRows(filteredData.map((item) => item.assetCode)); // Select all
    }
  };

  const handleDownloadPDF = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one asset.");
      return;
    }

    const doc = new jsPDF();
    let pageY = 10;
    let pageX = 20;
    let rowCount = 0;

    // Loop over selected rows
    for (const assetID of selectedRows) {
      const rowData = data.find((item) => item.assetCode === assetID);
      if (!rowData) continue;

      const qrUrl = getQrImageUrl(rowData.attributes);
      if (!qrUrl) continue;

      try {
        const qrDataUrl = await loadImageAsDataURL(qrUrl);
        doc.addImage(qrDataUrl, "PNG", pageX, pageY, qrSize, qrSize);

        doc.setFontSize(8);
        pageY += qrSize + 4;
        doc.text(`Asset Code: ${rowData.assetCode}`, pageX, pageY);
        pageY += 6;
        doc.text(`Title: ${rowData.title}`, pageX, pageY);
        pageY += 6;
        doc.text(`Category: ${rowData.categoryDetails?.name}`, pageX, pageY);
        pageY += 10;

        rowCount++;

        if (rowCount % 3 === 0) {
          pageX += qrSize + 30;
          pageY = 10;
        }

        if (rowCount % rowsPerPage === 0) {
          doc.addPage();
          pageY = 10;
          pageX = 20;
        }
      } catch (err) {
        console.error("Failed to load QR image:", err);
      }
    }

    doc.save("Assets_with_QR_Codes.pdf");
  };

  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });

  const sortData = (column, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

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
      column === sortOrder.column
        ? !sortOrder.ascending
        : true;

    setSortOrder({
      column,
      ascending: newSortOrder,
    });

    sortData(column, newSortOrder);
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
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredData.length}
                  onChange={handleSelectAllRows}
                />
              </th>
              {[
                { label: "Sl. No.", field: null },
                { label: "Asset Code", field: "assetCode" },
                { label: "Title", field: "title" },
                { label: "Acquire Date", field: "acquireDate" },
                { label: "Useful Life(year)", field: "usefulLife" },
                { label: "Area", field: "assetArea" },
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
                                sortOrder.column === header.field && sortOrder.ascending
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
                    style={{ paddingLeft: "98px" }}
                    onClick={handleDownloadPDF}
                  >
                    <FaDownload
                      style={{ width: "20px", height: "20px", color: "green" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const isSelected = selectedRows.includes(item.assetCode); // Use assetCode to track selection
              return (
                <tr key={item.assetCode}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(item.assetCode)}
                    />
                  </td>
                  <td>{index + 1}</td> {/* Just showing serial # in table */}
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
                  <td>{item.acquireDate}</td>
                  <td>{item.lifespan}</td>
                  <td className="description">
                    <Tippy content={item.assetArea || ""} placement="top">
                      <span>
                        {item.assetArea?.length > 20
                          ? item.assetArea.substring(0, 20) + "..."
                          : item.assetArea || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>
                    <div className={getStatusClass(item.status)}>
                      {item.status}
                    </div>
                  </td>
                  <td
                    className="actions"
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      maxWidth: "150px",
                    }}
                  >
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                    <img
                      src={getQrImageUrl(item.attributes)}
                      alt="QR Code"
                      style={{ width: qrSize, height: qrSize }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
                <label>Serial Number:</label>
                <input
                  type="text"
                  value={
                    modalData?.attributes?.find(
                      (attr) => attr.name === "Serial_number"
                    )?.value || "N/A"
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
                <input type="text" value={modalData.acquireDate} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData.lifespan} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Status:</label>
                <input value={modalData.status} readOnly />
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
              <div className="modal-content-field">
                <label>QR: </label>
                <div className="image-container">
                  <img
                    src={getQrImageUrl(modalData.attributes)}
                    alt="QR Code"
                    style={{ width: 300, height: 300 }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machinery;
