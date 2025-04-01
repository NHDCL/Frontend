import React, { useState, useRef } from "react";
import "./../../managerPage/css/card.css";
import "./../../managerPage/css/table.css";
import "./../../managerPage/css/form.css";
import "./../../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
// import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Select from "react-select";

const DeletionApproval = () => {
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

  const [data, setData] = useState([
    {
      Asset_ID: "128",
      Title: "Laptop",
      Asset_Code: "NHDCL-22-2003",
      Serial_Number: "NHDCL-22-2003",
      Cost: "600",
      Acquired_Date: "25/3/2025",
      Estimated_Lifespan: "1 year",
      Status: "In Maintenance",
      Category: "Machinery & Equipment",
      Area: "Block-C, 2nd Floor, Room 203",
      Description: "This laptop was brought from BT",
      Deleted_By: "12210100.gcit@rub.edu.bt",
    },
    {
      Asset_ID: "129",
      Title: "Printer",
      Asset_Code: "NHDCL-22-2004",
      Serial_Number: "NHDCL-22-2004",
      Cost: "1200",
      Acquired_Date: "12/5/2024",
      Estimated_Lifespan: "3 years",
      Status: "Operational",
      Category: "Office Equipment",
      Area: "Block-B, 1st Floor, Room 102",
      Description: "Printer for office use, HP LaserJet",
      Deleted_By: "12210101.gcit@rub.edu.bt",
    },
    {
      Asset_ID: "130",
      Title: "Projector",
      Asset_Code: "NHDCL-22-2005",
      Serial_Number: "NHDCL-22-2005",
      Cost: "800",
      Acquired_Date: "30/7/2023",
      Estimated_Lifespan: "5 years",
      Status: "Needs Repair",
      Category: "Multimedia Equipment",
      Area: "Block-A, 3rd Floor, Room 305",
      Description: "Ceiling-mounted projector with HDMI support",
      Deleted_By: "12210102.gcit@rub.edu.bt",
    },
  ]);

  const sortedData = [...data].sort((a, b) => b.rid - a.rid);

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

  const handleSelectRow = (rid) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rid)
        ? prevSelectedRows.filter((item) => item !== rid)
        : [...prevSelectedRows, rid]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.rid));
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

  // Ref for the modal
  const modalRef = useRef(null);

  // **Function to handle PDF download**
  const handleDownloadPDF = (e) => {
    e.preventDefault(); // Prevents unwanted form submission

    if (modalRef.current) {
      html2canvas(modalRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4"); // Set A4 size (portrait)
        const imgWidth = 190; // Adjust image width
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("Repair_Report.pdf");
      });
    }
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
        </div>
        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                {[
                  "Asset ID",
                  "Asset_Code",
                  "Asset Name",
                  "Area",
                  "Requested By",
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
                <th>
                  {selectedRows.length > 0 ? (
                    <button
                      className="delete-all-btn"
                      onClick={handleDeleteSelected}
                    >
                      <RiDeleteBin6Line
                        style={{ width: "20px", height: "20px", color: "red" }}
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
                  <td>{item.Asset_ID}</td>
                  <td>{item.Asset_Code}</td>
                  <td>{item.Title}</td>
                  <td>{item.Area}</td>
                  <td>{item.Deleted_By}</td>
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
      </div>

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Asset Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="modal-body" ref={modalRef}>
              <form className="repair-form">
                <div className="modal-content-field">
                  <label>Asset ID:</label>
                  <input type="text" value={modalData.Asset_ID} readOnly />
                </div>

                <div className="modal-content-field">
                  <label>Title</label>
                  <input type="text" value={modalData.Title} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Asset Code: </label>
                  <input type="text" value={modalData.Asset_Code} readOnly />
                </div>

                <div className="modal-content-field">
                  <label>Serial Number: </label>
                  <input type="text" value={modalData.Serial_Number} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Cost: </label>
                  <input type="text" value={modalData.Cost} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Acquired Date:</label>
                  <input type="text" value={modalData.Acquired_Date} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Estimated Lifespan: </label>
                  <input
                    type="text"
                    value={modalData.Estimated_Lifespan}
                    readOnly
                  />
                </div>
                <div className="modal-content-field">
                  <label>Status</label>
                  <input type="text" value={modalData.Status} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Category: </label>
                  <input type="text" value={modalData.Category} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Area: </label>
                  <input type="text" value={modalData.Area} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Description: </label>
                  <textarea value={modalData.Description} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Deleted_By: </label>
                  <input type="text" value={modalData.Deleted_By} readOnly />
                </div>
                <div className="modal-buttons">
                  <button className="accept-btn">Approve</button>
                  <button className="reject-btn">Decline</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletionApproval;
