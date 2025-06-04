import React, { useState, useRef, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import { LuDownload } from "react-icons/lu";
import jsPDF from "jspdf";
import "tippy.js/dist/tippy.css";
import Tippy from "@tippyjs/react";
import { TiArrowSortedUp } from "react-icons/ti";
import autoTable from "jspdf-autotable";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetAcademyQuery,
} from "../../slices/userApiSlice";
import {
  useGetMaintenanceReportsQuery,
  useGetMaintenanceRequestQuery,
} from "../../slices/maintenanceApiSlice";
import { useGetAssetQuery } from "../../slices/assetApiSlice";
import Swal from "sweetalert2";

const Maintenancereport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [editableData, setEditableData] = useState({
    Additional_cost: "",
    Additional_Hour: "",
    Remarks: "",
  });

  const rowsPerPage = 10;

  const {
    data: maintenanceRequest,
    isLoading,
    refetch: refetchRepairRequest,
  } = useGetMaintenanceRequestQuery();
  const { data: maintenanceReport } = useGetMaintenanceReportsQuery();
  const { data: academy } = useGetAcademyQuery();
  const { data: users } = useGetUsersQuery();
  const { data: assets } = useGetAssetQuery();

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
  );
  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (
      maintenanceReport &&
      maintenanceRequest &&
      academy &&
      userByEmial &&
      users &&
      assets
    ) {
      const loginAcademyId = userByEmial.user.academyId?.trim().toLowerCase();

      const mergedData = maintenanceReport
        .map((report) => {
          const matchingRequest = maintenanceRequest.find(
            (request) =>
              request.maintenanceID === report.preventiveMaintenanceID
          );

          if (!matchingRequest) return null;

          const requestUser = users.find(
            (user) => user.userId === matchingRequest.userID
          );

          if (!requestUser) return null;

          const requestAcademyId = requestUser.academyId?.trim().toLowerCase();

          if (requestAcademyId !== loginAcademyId) return null;

          // 🔍 Count technicians
          let total = 0;
          if (report.technicians) {
            const technicianList = report.technicians
              .split(",")
              .filter((email) => email.trim() !== "");
            total = technicianList.length;
          }

          const matchingAcademy = academy.find(
            (a) => a.academyId?.trim().toLowerCase() === requestAcademyId
          );

          // 🧩 Match asset using assetCode from the request
          const matchingAsset = assets.find(
            (asset) => asset.assetCode === matchingRequest.assetCode
          );

          const merged = {
            ...report,
            academyId: requestUser.academyId || null,
            academyName: matchingAcademy?.name || "Unknown Academy",
            assetName: matchingAsset?.title || "N/A",
            area: matchingAsset?.assetArea || "N/A",
            description: matchingRequest.description || "N/A",
            totalTechnicians: total,
          };
          return merged;
        })
        .filter(Boolean); // ✅ Remove nulls

      const sortedFiltered = mergedData.sort((a, b) =>
        b.maintenanceReportID.localeCompare(a.maintenanceReportID)
      );

      setData(sortedFiltered);
    }
  }, [
    maintenanceReport,
    maintenanceRequest,
    academy,
    userByEmial,
    users,
    assets,
  ]);

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

  const handleDownloadSelected = () => {
    if (selectedRows.length === 0) return;

    const selectedData = data.filter((item) => selectedRows.includes(item.maintenanceReportID));

    const csvContent = [
      [
        "Repair ID",
        "Asset Name",
        "Start Time",
        "End Time",
        "Date",
        "Area",
        "Total Cost",
        "Parts Used",
        // "Location",
        "Description",
        "Total Technicians",
        // "Assigned Supervisor",
        "Assigned Technician",
      ],
      ...selectedData.map((item) => [
        item.maintenanceReportID,
        item.assetName,
        item.startTime,
        item.endTime,
        item.Date,
        item.Area,
        item.totalCost,
        item.partsUsed,
        // item.location,
        item.description,
        item.totalTechnicians,
        // item.Assigned_supervisor,
        item.technicians,
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

  const sortedData = [...data].sort(
    (a, b) => b.maintenanceReportID - a.maintenanceReportID
  );

  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (maintenanceReportID) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(maintenanceReportID)
        ? prevSelectedRows.filter((item) => item !== maintenanceReportID)
        : [...prevSelectedRows, maintenanceReportID]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter(
      (item) => !selectedRows.includes(item.maintenanceReportID)
    );
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
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

  // *Function to handle PDF download*

  // *Function to handle PDF download*
  const handleDownloadPDF = () => {
    if (!modalData) return; // Prevent function execution if no data is selected

    const doc = new jsPDF();

    // Add title
    doc.text("Repair Report", 14, 15);

    // Define table headers
    const columns = ["Field", "Value"];

    // Map modalData dynamically into table rows
    const rows = [
      ["RID", modalData.maintenanceReportID],
      ["Asset Name", modalData.assetName],
      ["Start Time", modalData.startTime],
      ["End Time", modalData.endTime],
      ["Date", modalData.finishedDate],
      ["Area", modalData.area],
      ["Total Cost", modalData.Total_cost],
      ["Part Used", modalData.part_used],
      ["Location", modalData.location],
      ["Description", modalData.description],
      ["Total Technicians", modalData.totalTechnicians],
      ["Assigned Supervisor", modalData.Assigned_supervisor],
      ["Assigned Technician", modalData.Assigned_Technician],
      ["Additional Info", modalData.information],
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
    doc.save(`Repair_Report_${modalData.maintenanceReportID}.pdf`);
  };

  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  const sortData = (column, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const handleSort = (column) => {
    const newSortOrder =
      column === sortOrder.column
        ? !sortOrder.ascending // Toggle the sorting direction if the same column is clicked
        : true; // Start with ascending for a new column

    setSortOrder({
      column,
      ascending: newSortOrder,
    });
    sortData(column, newSortOrder);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
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
                    checked={selectedRows.length === displayedData.length} // Select all checkboxes when all rows are selected
                    onChange={() =>
                      setSelectedRows(
                        selectedRows.length === displayedData.length
                          ? []
                          : displayedData.map(
                              (item) => item.maintenanceReportID
                            )
                      )
                    }
                  />
                </th>
                {[
                  { label: "Sl. No.", field: null },
                  { label: "Asset Name", field: "assetName" },
                  { label: "Time", field: null },
                  { label: "Date", field: "finishedDate" },
                  { label: "Area", field: "area" },
                  { label: "Total Cost", field: "startTime" },
                  { label: "parts_used", field: "partsUsed" },
                  { label: "Description", field: null },
                ].map((header, index) => (
                  <th key={index}>
                    {header.field ? (
                      <div className="header-title">
                        {header.label}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() => handleSort(header.field)}
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
                      header.label
                    )}
                  </th>
                ))}
                <th>
                  {selectedRows.length > 0 ? (
                    <button
                      // className="download-all-btn"
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
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.maintenanceReportID)}
                      onChange={() => handleSelectRow(item.maintenanceReportID)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td className="description">
                    <Tippy content={item.assetName || ""} placement="top">
                      <span>
                        {item.assetName?.length > 20
                          ? item.assetName.substring(0, 20) + "..."
                          : item.assetName || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>{[item.startTime, item.endTime].join(" - ")}</td>
                  <td>{formatDate(item.finishedDate) || ""}</td>
                  <td className="description">
                    <Tippy content={item.area || ""} placement="top">
                      <span>
                        {item.area?.length > 20
                          ? item.area.substring(0, 20) + "..."
                          : item.area || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.totalCost || ""} placement="top">
                      <span>
                        {item.totalCost?.length > 20
                          ? item.totalCost.substring(0, 20) + "..."
                          : item.totalCost || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.partsUsed || ""} placement="top">
                      <span>
                        {item.partsUsed?.length > 20
                          ? item.partsUsed.substring(0, 20) + "..."
                          : item.partsUsed || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.description || ""} placement="top">
                      <span>
                        {item.description?.length > 20
                          ? item.description.substring(0, 20) + "..."
                          : item.description || ""}
                      </span>
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
              ))}
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
        {selectedRows.length > 0 && (
          <button
            className="delete-selected-btn"
            onClick={handleDeleteSelected}
          ></button>
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
                  <label>Asset Name:</label>
                  <input type="text" value={modalData.assetName} readOnly />
                </div>

                <div className="modal-content-field">
                  <label>Time</label>
                  <div className="time-input">
                    <input type="text" value={modalData.startTime} readOnly />
                    <input type="text" value={modalData.endTime} readOnly />
                  </div>
                </div>
                <div className="modal-content-field">
                  <label>Date</label>
                  <input
                    type="text"
                    value={formatDate(modalData.finishedDate)}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Area</label>
                  <input type="text" value={modalData.area} readOnly />
                </div>

                <div className="modal-content-field">
                  <label>Parts used: </label>
                  <input type="text" value={modalData.partsUsed} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Total Technicians</label>
                  <input
                    type="text"
                    value={modalData.totalTechnicians}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Assigned Technicians</label>
                  <input type="text" value={modalData.technicians} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Description:</label>
                  <textarea value={modalData.description} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Total Cost: </label>
                  <input type="text" value={modalData.totalCost} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Additional Informations: </label>
                  <textarea value={modalData.information} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Repaired Images:</label>
                  <div className="TModal-profile-img">
                    {Array.isArray(modalData.images) &&
                    modalData.images.length > 0 ? (
                      modalData.images.map((imgSrc, index) => (
                        <img
                          key={index}
                          src={imgSrc}
                          alt={`Work Order ${index + 1}`}
                          className="TModal-modal-image"
                        />
                      ))
                    ) : modalData.images ? (
                      // If imageUrl is a string, display it as a single image
                      <img
                        src={modalData.images}
                        alt="Work Order"
                        className="TModal-modal-image"
                      />
                    ) : (
                      <p>No image available</p>
                    )}
                  </div>
                </div>
                <div className="modal-content-field">
                  <label>Additional Cost:</label>
                  <input
                    name="Additional_cost"
                    value={editableData.Additional_cost}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-content-field">
                  <label>Additional Hours:</label>
                  <input
                    name="Additional_Hour"
                    value={editableData.Additional_Hour}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-content-field">
                  <label>Remarks:</label>
                  <textarea
                    name="Remarks"
                    value={editableData.Remarks}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-buttons">
                  <button className="accept-btn" onClick={handleDownloadPDF}>
                    Download
                    <LuDownload style={{ marginLeft: "12px" }} />
                  </button>
                  <button className="reject-btn">Done</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenancereport;
