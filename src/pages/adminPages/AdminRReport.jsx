import React, { useState, useRef } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import { LuDownload } from "react-icons/lu";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import Select from "react-select"

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

  const rowsPerPage = 10;

  const [data, setData] = useState([
    {
      rid: "#1001",
      assetName: "Air Conditioner",
      startTime: "2:00AM",
      endTime: "3:00PM",
      Date: "23/4/2024",
      Area: "Block-203",
      Total_cost: "NU.400",
      part_used: "screw driver",
      location: "Block-A-101",
      description: "I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      total_technician: "4",
      Assigned_supervisor: "12210.gcit@gmail.com",
      Assigned_Technician: "12210.gcit@gmail.com",
      Additional_information: "I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      imageUrl:[
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",

      ],
    },
    {
      rid: "#1002",
      assetName: "Air Conditioner",
      startTime: "2:00AM",
      endTime: "3:00PM",
      Date: "23/4/2024",
      Area: "Block-203",
      Total_cost: "NU.400",
      part_used: "screw driver",
      location: "Block-A-101",
      description: "I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      total_technician: "4",
      Assigned_supervisor: "12210.gcit@gmail.com",
      Assigned_Technician: "12210.gcit@gmail.com",
      Additional_information: "12210.gcit@gmail.com",
      imageUrl:[
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",

      ],
    },
    {
      rid: "#1003",
      assetName: "Air Conditioner",
      startTime: "2:00AM",
      endTime: "3:00PM",
      Date: "23/4/2024",
      Area: "Block-203",
      Total_cost: "NU.400",
      part_used: "screw driver",
      location: "Block-A-101",
      description: "I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      total_technician: "4",
      Assigned_supervisor: "12210.gcit@gmail.com",
      Assigned_Technician: "12210.gcit@gmail.com",
      Additional_information: "I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      imageUrl:[
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",

      ],
    },
    {
      rid: "#1004",
      assetName: "Air Conditioner",
      startTime: "2:00AM",
      endTime: "3:00PM",
      Date: "23/4/2024",
      Area: "Block-203",
      Total_cost: "NU.400",
      part_used: "screw driver",
      location: "Block-A-101",
      description: "Cooling issue",
      total_technician: "4",
      Assigned_supervisor: "12210.gcit@gmail.com",
      Assigned_Technician: "12210.gcit@gmail.com",
      Additional_information: "I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      imageUrl:[
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",

      ],
    },
    {
      rid: "#1004",
      assetName: "Air Conditioner",
      startTime: "2:00AM",
      endTime: "3:00PM",
      Date: "23/4/2024",
      Area: "Block-203",
      Total_cost: "NU.400",
      part_used: "screw driver",
      location: "Block-A-101",
      description: "Cooling issue",
      total_technician: "4",
      Assigned_supervisor: "12210.gcit@gmail.com",
      Assigned_Technician: "12210.gcit@gmail.com",
      Additional_information: "1I am writing to report that the air conditioning unit in Room 305 is not working properly. It is blowing warm air even when set to cooling mode, making the room uncomfortable.",
      imageUrl:[
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",

      ],
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({ ...prev, [name]: value }));
  };

  // Ref for the modal
  const modalRef = useRef(null);

  // **Function to handle PDF download**
  const handleDownloadPDF = () => {
    if (!modalData) return; // Prevent function execution if no data is selected

    const doc = new jsPDF();

    // Add title
    doc.text("Repair Report", 14, 15);

    // Define table headers
    const columns = ["Field", "Value"];

    // Map modalData dynamically into table rows
    const rows = [
      ["RID", modalData.rid],
      ["Asset Name", modalData.assetName],
      ["Start Time", modalData.startTime],
      ["End Time", modalData.endTime],
      ["Date", modalData.Date],
      ["Area", modalData.Area],
      ["Total Cost", modalData.Total_cost],
      ["Part Used", modalData.part_used],
      ["Location", modalData.location],
      ["Description", modalData.description],
      ["Total Technicians", modalData.total_technician],
      ["Assigned Supervisor", modalData.Assigned_supervisor],
      ["Assigned Technician", modalData.Assigned_Technician],
      ["Additional Info", modalData.Additional_information],
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

  // download 
  const handleDownloadSelected = () => {
    if (selectedRows.length === 0) return;

    const selectedData = data.filter((item) => selectedRows.includes(item.rid));

    const csvContent = [
      ["Repair ID", "Asset Name", "Start Time", "End Time", "Date", "Area", "Total Cost", "Parts Used", "Location", "Description", "Total Technicians", "Assigned Supervisor", "Assigned Technician"],
      ...selectedData.map((item) => [
        item.rid, item.assetName, item.startTime, item.endTime, item.Date,
        item.Area, item.Total_cost, item.part_used, item.location,
        item.description, item.total_technician, item.Assigned_supervisor, item.Assigned_Technician
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repair_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            <button className="category-btn" onClick={handleDownloadSelected}> Download</button>
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
                          : displayedData.map((item) => item.rid)
                      )
                    }
                  />
                </th>
                {[
                  "RRID",
                  "Asset Name",
                  "Time",
                  "Date",
                  "Area",
                  "Total Cost",
                  "Parts_used",
                  "Description"
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
                <th>
                  {selectedRows.length > 0 ? (
                    <button
                      className="download-all-btn"
                      onClick={handleDownloadSelected}
                    >
                      < LuDownload
                        style={{ width: "35px", height: "35px", color: "#305845", paddingLeft: "12px" }}
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
                      checked={selectedRows.includes(item.rid)}
                      onChange={() => handleSelectRow(item.rid)}
                    />
                  </td>
                  <td>{item.rid}</td>
                  <td>{item.assetName}</td>
                  <td>{[item.startTime, item.endTime].join(" - ")}</td>
                  <td>{item.Date}</td>
                  <td>{item.Area}</td>
                  <td>{item.Total_cost}</td>
                  <td>{item.part_used}</td>
                  <td className="description">{item.description}</td>
                  <td className="actions">
                    <button style={{marginLeft:"10px"}} className="view-btn" onClick={() => handleView(item)}>
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
                  <input type="text" value={modalData.Date} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Area</label>
                  <input type="text" value={modalData.Area} readOnly />
                </div>

                <div className="modal-content-field">
                  <label>Parts used: </label>
                  <input type="text" value={modalData.part_used} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Total Technicians</label>
                  <input type="text" value={modalData.total_technician} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Assigned Technicians</label>
                  <input type="text" value={modalData.Assigned_Technician} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Assigned Supervisor</label>
                  <input type="text" value={modalData.Assigned_supervisor} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Description:</label>
                  <textarea value={modalData.description} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Total Cost: </label>
                  <input type="text" value={modalData.Total_cost} readOnly />
                </div>
                <div className="modal-content-field">
                  <label>Additional Informations: </label>
                  <textarea value={modalData.Additional_information} readOnly />
                </div>

                <div className="modal-content-field">
            <label>Repaired Images:</label>
            <div className="TModal-profile-img">
              {Array.isArray(modalData.imageUrl) && modalData.imageUrl.length > 0 ? (
                modalData.imageUrl.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Work Order ${index + 1}`}
                    className="TModal-modal-image"
                  />
                ))
              ) : modalData.imageUrl ? (
                // If `imageUrl` is a string, display it as a single image
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
                  <button className="accept-btn" onClick={handleDownloadPDF}>Download
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
