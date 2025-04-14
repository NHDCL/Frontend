import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { TiArrowSortedUp } from "react-icons/ti";
import { useGetRepairRequestQuery } from "../../slices/maintenanceApiSlice";
import { useUser } from "../../context/userContext";
import { useSelector } from "react-redux";
import { useGetUserByEmailQuery } from "../../slices/userApiSlice";
import { createSelector } from "reselect";

const Repair = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");

  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");

  const rowsPerPage = 10;

  const { data: repairRequest, refetch: refetchRepairRequest } = useGetRepairRequestQuery();
  const { userInfo, userRole } = useSelector((state) => state.auth);
  console.log("repairRequest:", repairRequest);


  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );
  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  console.log("e", userByEmial?.user.academyId)



  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState([]);
  console.log('data: ', data)

  useEffect(() => {
    if (!repairRequest || !userByEmial) return;
  
    const userAcademy = userByEmial?.user.academyId?.trim().toLowerCase();
  
    const filtered = repairRequest.filter((req) => {
      const requestAcademy = req.academyId?.trim().toLowerCase();
      return requestAcademy === userAcademy && req.accept === true;
    });
  
    console.log("Filtered Length:", filtered.length);
    setData(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [repairRequest, userByEmial]);
  

  // Sample workers list
  const workersList = [
    { value: "Worker A", label: "Worker A" },
    { value: "Worker B", label: "Worker B" },
    { value: "Worker C", label: "Worker C" },
  ];

  const handleAssignRequest = () => {
    if (!assignedWorker || !assignTime || !assignDate) {
      alert("Please fill in all fields before assigning.");
      return;
    }

    alert(
      `Assigned ${modalData.repairID} to ${assignedWorker} at ${assignTime} on ${assignDate}`
    );

    // Close the modal after assigning
    handleCloseModal();
  };

  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status";  // Gray color
      case "inprogress":
        return "in-progress-status";  // Yellow color
      case "completed":
        return "completed-status";  // Green color
      default:
        return "";
    }
  };

  // Extract unique priorities from data
  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(
        data.map(item => item.priority?.toLowerCase()).filter(Boolean)
      )
    ).map(priority => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1)
    }))
  ];

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map(item => item.status?.toLowerCase()))).map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }))
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.repairID - a.repairID);

  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesPriority =
      selectedPriority === "" ||
      item.priority?.toLowerCase() === selectedPriority.toLowerCase();

    const matchesWorkStatus =
      selectedWorkStatus === "" || item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    return matchesSearch && matchesPriority && matchesWorkStatus;
  });


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (repairID) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(repairID)
        ? prevSelectedRows.filter((item) => item !== repairID)
        : [...prevSelectedRows, repairID]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.repairID));
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };
  const handleDeleteRow = (repairID) => {
    const updatedData = data.filter((item) => item.repairID !== repairID);
    setData(updatedData);
  };

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(null); // Reset worker selection when opening modal
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  // Sorting
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
    const newSortOrder = column === sortOrder.column
      ? !sortOrder.ascending // Toggle the sorting direction if the same column is clicked
      : true; // Start with ascending for a new column

    setSortOrder({
      column,
      ascending: newSortOrder,
    });
    sortData(column, newSortOrder);
  };

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
            {/* Priority Dropdown */}
            <Select
              classNamePrefix="custom-select"
              className="priority-dropdown"
              options={uniquePriorities}
              value={uniquePriorities.find(option => option.value === selectedPriority)}
              onChange={(selectedOption) => {
                setSelectedPriority(selectedOption ? selectedOption.value : "");
              }}
              isClearable
              isSearchable={false}
            />

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
                          : displayedData.map((item) => item.repairID)
                      )
                    }
                  />
                </th>
                {[
                  "RID",
                  "Image",
                  "Name",
                  "Email",
                  "phone",
                  "Area",
                  "Priority",
                  "Workstatus"
                ].map((header, index) => (
                  <th key={index}>
                    {header === "Area" || header === "Name" ? (
                      <div className="header-title">
                        {header}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() =>
                              handleSort(header === "Area" ? "Area" : header.toLowerCase().replace(' ', ''))
                            }
                          >
                            <TiArrowSortedUp
                              style={{
                                color: "#305845",
                                transform: sortOrder.column === header.toLowerCase().replace(' ', '') && sortOrder.ascending
                                  ? "rotate(0deg)"  // Ascending
                                  : sortOrder.column === header.toLowerCase().replace(' ', '') && !sortOrder.ascending
                                    ? "rotate(180deg)" // Descending
                                    : "rotate(0deg)",  // Default
                                transition: "transform 0.3s ease",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      header
                    )}
                  </th>
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
                      checked={selectedRows.includes(item.repairID)}
                      onChange={() => handleSelectRow(item.repairID)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      className="User-profile"
                      src={item.images[0]}
                      alt="User"
                      style={{
                        width: "100px",
                        height: "100px",
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phoneNumber}</td>
                  <td>{item.area}</td>
                  <td>{item.priority}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.status.toLowerCase().replace(/\s+/g, ""))}>
                      {item.status}
                    </div>
                  </td>
                  <td className="actions">
                    <button className="schedule-btn" onClick={() => handleScheduleView(item)}>
                      Schedule
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.repairID)}
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

      {/* Modal for schedule Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Schedule Form</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            {/* Assign Dropdown */}
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Assign Worker:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={workersList.find((w) => w.value === assignedWorker) || null} // Ensure default value is handled
                  onChange={(selectedOption) => {
                    setAssignedWorker(selectedOption?.value || ""); // Ensure it's updated
                    console.log("Selected Worker:", selectedOption); // Debugging
                  }}
                  isClearable
                />
              </div>
              {/* Assign Date */}
              <div className="modal-content-field">
                <label>Assign Date:</label>
                <input
                  type="date"
                  value={assignDate}
                  min={today}
                  onChange={(e) => setAssignDate(e.target.value)}
                />
              </div>

              <div className="modal-content-field">
                {/* Assign Time */}
                <label>Assign Time:</label>
                <input
                  type="time"
                  value={assignTime}
                  onChange={(e) => setAssignTime(e.target.value)}
                />
              </div>
              <div className="modal-buttons">
                <button className="accept-btn" style={{ width: "80px" }} onClick={handleAssignRequest}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Repair;

