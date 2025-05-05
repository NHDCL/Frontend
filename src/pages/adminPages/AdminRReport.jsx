import React, { useState, useRef, useEffect, useMemo } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { LuDownload } from "react-icons/lu";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "react-select";
import Tippy from "@tippyjs/react";
import { TiArrowSortedUp } from "react-icons/ti";
import { useGetRepairReportsQuery } from "../../slices/maintenanceApiSlice"; // Import the query hook
import Swal from "sweetalert2";

const AdminRReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [editableData, setEditableData] = useState({
    Additional_cost: "",
    Additional_Hour: "",
    Remarks: "",
  });
  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  // Fetch repair reports data using RTK Query
  const { data: apiData, isLoading } = useGetRepairReportsQuery();

  const rowsPerPage = 10;

  // Process API data to normalize it to expected format based on the actual API response
  const processApiData = (rawData) => {
    if (!rawData) return [];

    // Check if the data is an array
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    return dataArray.map((item, index) => {
      return {
        rid: item.repairReportID || `#${1000 + index}`,
        assetName: "Asset", // This field is not present in the API response
        startTime: item.startTime || "N/A",
        endTime: item.endTime || "N/A",
        Date: item.finishedDate || new Date().toLocaleDateString(),
        Area: "N/A", // This field is not present in the API response
        Total_cost: `NU.${item.totalCost || 0}`,
        part_used: item.partsUsed || "N/A",
        location: "N/A", // This field is not present in the API response
        description: "N/A", // This field is not present in the API response
        total_technician: item.technicians
          ? item.technicians.split(",").length.toString()
          : "0",
        Assigned_supervisor: "N/A", // This field is not present in the API response
        Assigned_Technician: item.technicians || "N/A",
        Additional_information: item.information || "",
        imageUrl: item.images || [],

        // Store original data for reference
        original: item,
      };
    });
  };

  // Get processed data
  // const data = processApiData(apiData);
  const [data, setData] = useState([]);
  console.log("Data: ", data);

  useEffect(() => {
    if (apiData) {
      const processed = processApiData(apiData); // your existing function
      setData(processed);
    }
  }, [apiData]);

  // Log the structure of the API data and processed data for debugging
  console.log("Original API data:", apiData);
  console.log("Processed data:", data);

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading repair reports...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  const sortedData = [...data].sort((a, b) => {
    // We want newest reports first, but we don't have a proper way to determine this
    // without a timestamp field, so we'll use the ID for now
    return b.rid.localeCompare(a.rid);
  });

  const getNestedValue = (obj, path) => {
    return path?.split(".").reduce((acc, part) => acc && acc[part], obj) ?? "";
  };
  const filteredData = useMemo(() => {
    let tempData = [...data];

    // Apply search
    if (searchTerm) {
      tempData = tempData.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortOrder.column) {
      tempData.sort((a, b) => {
        const aValue = getNestedValue(a, sortOrder.column);
        const bValue = getNestedValue(b, sortOrder.column);

        // Handle "NU." prefix
        const parseValue = (val) => {
          if (typeof val === "string" && val.startsWith("NU.")) {
            return parseFloat(val.replace("NU.", ""));
          }
          return typeof val === "string" ? val.toLowerCase() : val;
        };

        const aParsed = parseValue(aValue);
        const bParsed = parseValue(bValue);

        if (aParsed < bParsed) return sortOrder.ascending ? -1 : 1;
        if (aParsed > bParsed) return sortOrder.ascending ? 1 : -1;
        return 0;
      });
    }

    return tempData;
  }, [data, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (rid) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rid)
        ? prevSelectedRows.filter((item) => item !== rid)
        : [...prevSelectedRows, rid]
    );
  };

  const handleView = (item) => {
    setModalData(item);
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({ ...prev, [name]: value }));
  };

  // Ref for the modal
  const modalRef = useRef(null);

  // Function to handle PDF download
  const handleDownloadPDF = () => {
    if (!modalData) return; // Prevent function execution if no data is selected

    const doc = new jsPDF();

    // Add title
    doc.text("Repair Report", 14, 15);

    // Define table headers
    const columns = ["Field", "Value"];

    // Map modalData dynamically into table rows
    const rows = [
      ["Report ID", modalData.rid || "N/A"],
      ["Start Time", modalData.startTime || "N/A"],
      ["End Time", modalData.endTime || "N/A"],
      ["Finished Date", modalData.Date || "N/A"],
      ["Total Cost", modalData.Total_cost || "N/A"],
      ["Parts Used", modalData.part_used || "N/A"],
      ["Technicians", modalData.Assigned_Technician || "N/A"],
      ["Additional Information", modalData.Additional_information || "N/A"],
      ["Repair ID", modalData.original?.repairID || "N/A"],
    ];

    // Generate the table using autoTable
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }, // Blue header background
    });

    // Save the PDF
    doc.save(`Repair_Report_${modalData.rid}.pdf`);
  };

  // download selected reports as CSV
  const handleDownloadSelected = () => {
    if (selectedRows.length === 0) return;

    const selectedData = data.filter((item) => selectedRows.includes(item.rid));

    const csvContent = [
      [
        "Report ID",
        "Repair ID",
        "Start Time",
        "End Time",
        "Finished Date",
        "Total Cost",
        "Parts Used",
        "Technicians",
        "Information",
      ],
      ...selectedData.map((item) => [
        item.rid || "",
        item.original?.repairID || "",
        item.startTime || "",
        item.endTime || "",
        item.Date || "",
        item.Total_cost || "",
        item.part_used || "",
        item.Assigned_Technician || "",
        item.Additional_information || "",
      ]),
    ]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repair_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSort = (field) => {
    const ascending = sortOrder.column === field ? !sortOrder.ascending : true;

    const sorted = [...data].sort((a, b) => {
      const aValue = getNestedValue(a, field);
      const bValue = getNestedValue(b, field);

      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });

    setData(sorted);
    setSortOrder({ column: field, ascending });
  };

  return (
    <div className="ManagerDashboard">
      {/* Home table */}
      <div className="container">
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
          {/* Download  */}
          <div className="create-category-btn">
            <button className="category-btn" onClick={handleDownloadSelected}>
              {" "}
              Download
            </button>
            <LuDownload style={{ color: "#ffffff", marginRight: "12px" }} />
          </div>
        </div>
        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === displayedData.length &&
                      displayedData.length > 0
                    }
                    onChange={() =>
                      setSelectedRows(
                        selectedRows.length === displayedData.length
                          ? []
                          : displayedData.map((item) => item.rid)
                      )
                    }
                  />
                </th>
                {[
                  { label: "Sl. No.", field: null },
                  { label: "Start Time", field: "startTime" },
                  { label: "End Time", field: "endTime" },
                  { label: "Date", field: "Date" },
                  { label: "Total Cost", field: "Total_cost" },
                  { label: "Parts Used", field: null },
                  { label: "Technicians", field: "Assigned_Technician" },
                  { label: "Information", field: null },
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
                  {selectedRows.length > 0 ? (
                    <button
                      className="download-btn"
                      onClick={handleDownloadSelected}
                    >
                      <LuDownload
                        style={{
                          width: "35px",
                          height: "35px",
                          color: "#305845",
                          paddingLeft: "12px",
                        }}
                      />
                    </button>
                  ) : (
                    " "
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedData.length > 0 ? (
                displayedData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.rid)}
                        onChange={() => handleSelectRow(item.rid)}
                      />
                    </td>
                    <td>{index+1}</td>
                    <td>{item.startTime}</td>
                    <td>{item.endTime}</td>
                    <td>{item.Date}</td>
                    <td className="description">
                      <Tippy content={item.Total_cost || ""} placement="top">
                        <span>
                          {item.Total_cost
                            ? item.Total_cost.length > 20
                              ? item.Total_cost.substring(0, 20) + "..."
                              : item.Total_cost
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    <td className="description">
                      <Tippy content={item.part_used || ""} placement="top">
                        <span>
                          {item.part_used
                            ? item.part_used.length > 20
                              ? item.part_used.substring(0, 20) + "..."
                              : item.part_used
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    <td className="description">
                      <Tippy
                        content={item.Assigned_Technician || ""}
                        placement="top"
                      >
                        <span>
                          {item.Assigned_Technician
                            ? item.Assigned_Technician.length > 20
                              ? item.Assigned_Technician.substring(0, 20) +
                              "..."
                              : item.Assigned_Technician
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    <td className="description">
                      <Tippy
                        content={item.Additional_information || ""}
                        placement="top"
                      >
                        <span>
                          {item.Additional_information
                            ? item.Additional_information.length > 20
                              ? item.Additional_information.substring(0, 20) +
                              "..."
                              : item.Additional_information
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    <td className="actions">
                      <button
                        style={{ marginLeft: "10px" }}
                        className="view-btn"
                        onClick={() => handleView(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    No repair reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {displayedData.length > 0 && (
          <div className="pagination">
            <span>{filteredData.length} Results</span>
            <div>
              {totalPages > 0 &&
                [...Array(Math.min(totalPages, 5)).keys()].map((num) => (
                  <button
                    key={num}
                    className={currentPage === num + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(num + 1)}
                  >
                    {num + 1}
                  </button>
                ))}
              {totalPages > 5 && (
                <>
                  <span>...</span>
                  <button onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Repair Report</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="modal-body" ref={modalRef}>
              <form className="repair-form">
                <div className="modal-content-field">
                  <label>Report ID:</label>
                  <input type="text" value={modalData.rid || ""} readOnly />
                </div>

                <div className="modal-content-field">
                  <label>Repair ID:</label>
                  <input
                    type="text"
                    value={modalData.original?.repairID || ""}
                    readOnly
                  />
                </div>

                <div className="modal-content-field">
                  <label>Time</label>
                  <div className="time-input">
                    <input
                      type="text"
                      value={modalData.startTime || ""}
                      readOnly
                    />
                    <input
                      type="text"
                      value={modalData.endTime || ""}
                      readOnly
                    />
                  </div>
                </div>
                <div className="modal-content-field">
                  <label>Finished Date</label>
                  <input
                    type="text"
                    value={modalData.Date || "Not completed"}
                    readOnly
                  />
                </div>

                <div className="modal-content-field">
                  <label>Parts used: </label>
                  <input
                    type="text"
                    value={modalData.part_used || ""}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Total Technicians</label>
                  <input
                    type="text"
                    value={modalData.total_technician || ""}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Technicians</label>
                  <input
                    type="text"
                    value={modalData.Assigned_Technician || ""}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Total Cost: </label>
                  <input
                    type="text"
                    value={modalData.Total_cost || ""}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Information: </label>
                  <textarea
                    value={modalData.Additional_information || ""}
                    readOnly
                  />
                </div>

                <div className="modal-content-field">
                  <label>Repair Images:</label>
                  <div className="TModal-profile-img">
                    {Array.isArray(modalData.imageUrl) &&
                      modalData.imageUrl.length > 0 ? (
                      modalData.imageUrl.map((imgSrc, index) => (
                        <img
                          key={index}
                          src={imgSrc}
                          alt={`Work Order ${index + 1}`}
                          className="TModal-modal-image"
                        />
                      ))
                    ) : modalData.imageUrl ? (
                      // If imageUrl is a string, display it as a single image
                      <img
                        src={modalData.imageUrl}
                        alt="Work Order"
                        className="TModal-modal-image"
                      />
                    ) : (
                      <p>No image available</p>
                    )}
                  </div>
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="accept-btn"
                    onClick={handleDownloadPDF}
                  >
                    Download
                    <LuDownload style={{ marginLeft: "12px" }} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRReport;
