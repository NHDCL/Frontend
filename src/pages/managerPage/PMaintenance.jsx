import React, { useState } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";

const PMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [editModalData, setEditModalData] = useState(null);

  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");

  const rowsPerPage = 10;

  const [data, setData] = useState([
    {
      mid: "#1001",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "1",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "pending"
    },
    {
      mid: "#1002",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "3",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "pending"
    },
    {
      mid: "#1003",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "4",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "Completed"
    },
    {
      mid: "#1004",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "2",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "In progress"
    }
  ]);

  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status";  // Gray color
      case "In progress":
        return "in-progress-status";  // Yellow color
      case "Completed":
        return "completed-status";  // Green color
      default:
        return "";
    }
  };

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map(item => item.workstatus))).map(status => ({
      value: status,
      label: status
    }))
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesWorkStatus =
      selectedWorkStatus === "" || item.workstatus === selectedWorkStatus;

    return matchesSearch && matchesWorkStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (mid) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(mid)
        ? prevSelectedRows.filter((item) => item !== mid)
        : [...prevSelectedRows, mid]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.mid));
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };
  const handleDeleteRow = (mid) => {
    const updatedData = data.filter((item) => item.mid !== mid);
    setData(updatedData);
  };

  const handleScheduleView = (item) => {
    setModalData(item);
  };
  const handleCloseModal = () => {
    setModalData(null);
  };


  // Open Edit Modal
  const handleEditRow = (item) => {
    setEditModalData(item);
  };

  // Update Edited Data
  const handleSaveEdit = () => {
    if (!editModalData) return;

    setData((prevData) =>
      prevData.map((row) =>
        row.mid === editModalData.mid ? editModalData : row
      )
    );

    setEditModalData(null); // Close modal after saving
  };


  const handleAssignRequest = () => {
    if (!assignedWorker || !assignTime || !assignDate) {
      alert("Please fill in all fields before assigning.");
      return;
    }

    alert(
      `Assigned ${modalData.rid} to ${assignedWorker} at ${assignTime} on ${assignDate}`
    );

    // Close the modal after assigning
    handleCloseModal();
  };

  // Sample workers list
  const workersList = [
    { value: "Worker A", label: "Worker A" },
    { value: "Worker B", label: "Worker B" },
    { value: "Worker C", label: "Worker C" },
  ];


  return (
    <div className="ManagerDashboard">
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
          <div className="dropdown-ls">

            {/* Work Status Dropdown */}
            <Select
              classNamePrefix="custom-select-workstatus"
              className="workstatus-dropdown"
              options={uniqueWorkStatuses}
              value={uniqueWorkStatuses.find(option => option.value === selectedWorkStatus)}
              onChange={(selectedOption) => {
                setSelectedWorkStatus(selectedOption ? selectedOption.value : "");
              }}
              isClearable
              isSearchable={false}
            />
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
                          : displayedData.map((item) => item.mid)
                      )
                    }
                  />
                </th>
                {[
                  "MID",
                  "Asset Name",
                  "Description",
                  "Schedule(month)",
                  "Last Work Order",
                  "Next Work Order",
                  "Assign to",
                  "Workstatus"
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.mid)}
                      onChange={() => handleSelectRow(item.mid)}
                    />
                  </td>
                  <td>{item.mid}</td>
                  <td>{item.Assetname}</td>
                  <td>{item.Description}</td>
                  <td>{item.Schedule}</td>
                  <td>{item.Lastworkorder}</td>
                  <td>{item.Nextworkorder}</td>
                  <td>{item.Assign}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.workstatus)}>
                      {item.workstatus}
                    </div>
                  </td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditRow(item)}
                    >
                      <FaEdit style={{ width: "20px", height: "20px" }} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.mid)}
                    >
                      <RiDeleteBin6Line style={{ width: "20px", height: "20px" }} />
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
      {/* Edit Modal */}
      {editModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Preventive maintenance schedule form</h2>
              <button className="close-btn" onClick={() => setEditModalData(null)}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            <div className="schedule-form">
              <p className="sub-title">Maintenance Detail</p>
              <div className="modal-content-field">
                <label htmlFor="">Description: </label>
                <input type="text" value={editModalData.Description} onChange={(e) => setEditModalData({ ...editModalData, Description: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Assign: </label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={workersList.find(worker => worker.value === editModalData.Assign) || null} // Ensure correct selection
                  onChange={(selectedOption) => {
                    setEditModalData({ ...editModalData, Assign: selectedOption?.value || "" }); // Update state correctly
                  }}
                  isClearable
                  isSearchable
                />


              </div>

              <p className="sub-title">Schedule</p>
              <div className="modal-content-field">
                <label htmlFor="">Starts on: </label>
                <input
                  type="date"
                  value={editModalData.Lastworkorder ? new Date(editModalData.Lastworkorder).toISOString().split("T")[0] : ""}
                  onChange={(e) => setEditModalData({ ...editModalData, Lastworkorder: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Schedule time: </label>
                <input type="time" value={editModalData.Schedule} onChange={(e) => setEditModalData({ ...editModalData, Schedule: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Repeats: </label>
                <input type="text" value={editModalData.Schedule} onChange={(e) => setEditModalData({ ...editModalData, Schedule: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Ends on: </label>
                <input
                  type="date"
                  value={editModalData.Nextworkorder ? new Date(editModalData.Nextworkorder).toISOString().split("T")[0] : ""}
                  onChange={(e) => setEditModalData({ ...editModalData, Nextworkorder: e.target.value })}
                />
              </div>

            </div>

            {/* <button className="save-btn" onClick={handleSaveEdit}>Save</button> */}
            <div className="modal-buttons">
              <button className="accept-btn" style={{ width: "80px" }} onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PMaintenance;
