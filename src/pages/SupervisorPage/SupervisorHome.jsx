import React, { useState, useEffect } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { TiArrowSortedUp } from "react-icons/ti";
import { useGetRepairRequestQuery, useAssignRepairMutation, useGetSchedulesByRepairIDQuery, useUpdateRepairScheduleMutation, useGetSchedulesByUserIDQuery, useGetRepairByIdQuery } from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { maintenanceApiSlice } from "../../slices/maintenanceApiSlice"

import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetDepartmentQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

import Select from "react-select";

const SupervisorHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [rescheduleModalData, setRescheduleModalData] = useState(null);

  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const rowsPerPage = 10;

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const userID = userByEmial?.user?.userId;

  console.log("userID", userID)

  const {
    data: userSchedules,
    isLoading: userSchedulesLoading,
    error: userSchedulesError,
  } = useGetSchedulesByUserIDQuery(userID, {
    skip: !userID, // skip until userID is available
  });

  const repairID = userSchedules?.[0]?.repairID;
  console.log("rid", repairID);
  console.log("userSchedule", userSchedules);

  // SCHEDULE BY REPAIR ID

  const {
    data: scheduleData,
    isLoading,
    error,
  } = useGetRepairByIdQuery(repairID, {
    skip: !repairID,
  });

  const [data, setData] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (userSchedules && userSchedules.length) {
        const repairPromises = userSchedules.map(async (schedule) => {
          try {
            const repair = await dispatch(
              maintenanceApiSlice.endpoints.getRepairById.initiate(schedule?.repairID)
            ).unwrap();

            return {
              ...schedule, // include all original schedule details
              repairInfo: repair, // attach fetched repair data under `repairInfo`
            };
          } catch (err) {
            console.error(`Error fetching repair ${schedule?.repairID}:`, err);
            return null;
          }
        });

        const repairResults = await Promise.all(repairPromises);
        const validData = repairResults.filter(Boolean);
        setData(validData); // ✅ now contains both schedule & repair info
      }
    };

    fetchRepairDetails();
  }, [userSchedules, dispatch]);


  console.log("Dataaa", data)
  const { data: users } = useGetUsersQuery();

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

  const handleAddMember = () => {
    if (newMember.trim() && !teamMembers.includes(newMember)) {
      setTeamMembers([...teamMembers, newMember]);
      setNewMember(""); // Reset input field
    }
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const today = new Date().toISOString().split("T")[0];


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
      `Assigned ${modalData.rid} to ${assignedWorker} at ${assignTime} on ${assignDate}`
    );

    // Close the modal after assigning
    handleCloseModal();
  };

  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status";
      case "inprogress":
        return "in-progress-status";
      case "completed":
        return "completed-status";
      default:
        return "";
    }
  };

  // Extract unique priorities from data
  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(data.map((item) => item.repairInfo.priority?.toLowerCase()).filter(Boolean))
    ).map((priority) => ({
      value: priority,
      label: priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : ""

    })),
  ];

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.repairInfo.status?.toLowerCase()))).map(
      (status) => ({
        value: status,
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : ""
      })
    ),
  ];

  // Filtering data based on search and priority selection and work status
  // Helper function to recursively search through nested objects
  const searchRecursively = (obj, searchTerm) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj && obj.toString().toLowerCase().includes(searchTerm?.toLowerCase() || '');
    }

    // Check all values in the object (including nested objects)
    return Object.values(obj).some((value) => searchRecursively(value, searchTerm));
  };

  const filteredData = (data && data.length) ? data.filter((item) => {
    // Match search term with any field at any level in the object
    const matchesSearch = searchRecursively(item, searchTerm);
  
    const matchesPriority =
      selectedPriority === "" ||
      item.repairInfo.priority?.toLowerCase() === selectedPriority.toLowerCase();
  
    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.repairInfo.status?.toLowerCase() === selectedWorkStatus.toLowerCase();
  
    return matchesSearch && matchesPriority && matchesWorkStatus;
  }) : [];
  



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
    const updatedData = data.filter(
      (item) => !selectedRows.includes(item.repairID)
    );
    setData(updatedData);
    setSelectedRows([]);
  };

  const handleDeleteRow = (repairID) => {
    const updatedData = data.filter((item) => item.repairID !== repairID);
    setData(updatedData);
  };

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(null);
    setAssignDate("");
    setAssignTime("");
    setSelectedDepartment(null);
  };

  const handleCloseModal = () => {
    setModalData(null);
  };
  const handleRescheduleView = (item) => {
    setRescheduleModalData(item);
    setAssignedWorker(
      item?.assignedWorker
        ? { value: item.assignedWorker.userID, label: item.assignedWorker.email }
        : null
    );
    setAssignDate(item?.reportingDate || "");
    setAssignTime(item?.startTime?.slice(0, 5) || "");
    setSelectedDepartment(item?.departmentId || null);
  };

  const [sortOrder, setSortOrder] = useState({
    column: null,
    direction: "asc",
  });

  const handleSort = (column) => {
    setSortOrder((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortOrder.column) return b.repairID - a.repairID;

    const valA = a[sortOrder.column];
    const valB = b[sortOrder.column];

    if (valA < valB) return sortOrder.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="ManagerDashboard">
      <div className="cardwrap">
        {/* Card counts */}
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total technician</h3>
            <p className="count">45</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Work Order</h3>
            <p className="count">10</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Repair Request</h3>
            <p className="count">56</p>
          </div>
        </div>

      </div>
      <h3 className="heading">Repair request</h3>

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
              value={uniquePriorities.find(
                (option) => option.value === selectedPriority
              )} // Ensure selected value is an object
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
              value={uniqueWorkStatuses.find(
                (option) => option.value === selectedWorkStatus
              )}
              onChange={(selectedOption) => {
                setSelectedWorkStatus(
                  selectedOption ? selectedOption.value : ""
                );
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
                {[
                  "MID",
                  "Asset Name",
                  // "Email",
                  "Date",
                  "Phone No. ",
                  "Area",
                  "Priority",
                  "Workstatus",
                  "Description",
                  "",
                ].map((header, index) => (
                  <th key={index}>
                    {header === "Area" || header === "Name" ? (
                      <div className="header-title">
                        {header}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() =>
                              handleSort(
                                header === "Area"
                                  ? "Area"
                                  : header.toLowerCase().replace(" ", "")
                              )
                            }
                          >
                            <TiArrowSortedUp
                              style={{
                                color: "#305845",
                                transform:
                                  sortOrder.column ===
                                    header.toLowerCase().replace(" ", "") &&
                                    sortOrder.ascending
                                    ? "rotate(0deg)" // Ascending
                                    : sortOrder.column ===
                                      header.toLowerCase().replace(" ", "") &&
                                      !sortOrder.ascending
                                      ? "rotate(180deg)" // Descending
                                      : "rotate(0deg)", // Default
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
                  <td>{index + 1}</td>
                  <td>{item.repairInfo.assetName}</td>
                  {/* <td>{item.email}</td> */}
                  <td>{item.reportingDate}</td>
                  <td>{item.repairInfo.phoneNumber}</td>
                  <td>{item.repairInfo.area}</td>
                  <td>{item.repairInfo.priority}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.repairInfo.status?.toLowerCase().replace(/\s+/g, "") || "")}>
                      {item.repairInfo.status}
                    </div>
                  </td>
                  <td className="description">{item.repairInfo.description}</td>
                  <td className="actions">
                    <button
                      className="schedule-btn"
                      onClick={() => handleScheduleView(item)}
                    >
                      Schedule
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.rid)}
                    >
                      <RiDeleteBin6Line
                        style={{ width: "20px", height: "20px" }}
                      />
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
                <label>Assign Technician:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={
                    workersList.find((w) => w.value === assignedWorker) || null
                  } // Ensure default value is handled
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

              <div className="modal-content-field">
                <label>Team Members:</label>
                <div className="TModal-outer-team">
                  <div className="TModal-team-members">
                    <input
                      type="text"
                      placeholder="Enter email"
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                    />
                    <button
                      type="button"
                      className="TModal-add-btn"
                      onClick={handleAddMember}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-content-field">
                <label></label>
                <div className="TModal-outer-team">
                  {/* Render only if team members exist */}
                  {teamMembers.length > 0 && (
                    <div className="TModal-team-list">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="TModal-team-member">
                          {member}{" "}
                          <IoMdCloseCircle
                            onClick={() => handleRemoveMember(index)}
                            style={{ color: "black" }}
                          />
                        </div>
                      ))}
                    </div>

                  )}
                </div>
              </div>
              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleAssignRequest}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorHome;
