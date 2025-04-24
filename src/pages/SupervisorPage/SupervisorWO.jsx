import React, { useState, useEffect } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { useGetMaintenanceRequestQuery, useGetPreventiveSchedulesByUserIDQuery, useGetMaintenanceByAssetCodeQuery } from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { maintenanceApiSlice } from "../../slices/maintenanceApiSlice"
import { useGetAssetByAssetCodeQuery } from "../../slices/assetApiSlice";

import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetDepartmentQuery,
} from "../../slices/userApiSlice";

import Select from "react-select";

const SupervisorWO = () => {
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

  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

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
  } = useGetPreventiveSchedulesByUserIDQuery(userID, {
    skip: !userID,
  })
  console.log("sdf", userSchedules)
  const assetCode = userSchedules?.[0]?.assetCode;
  console.log("rid", assetCode);
  console.log("userSchedule", userSchedules);

  const {
    data: scheduleData,
    isLoading,
    error,
  } = useGetAssetByAssetCodeQuery(assetCode, {
    skip: !assetCode,
  })


  const [data, setData] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (userSchedules && userSchedules.length) {
        const repairPromises = userSchedules.map(async (schedule) => {
          try {
            const asset = await dispatch(
              maintenanceApiSlice.endpoints.getAssetByAssetCode.initiate(schedule?.assetCode)
            ).unwrap();

            return {
              ...schedule,
              asset,
            };
          } catch (err) {
            console.error(`Error fetching asset for ${schedule?.assetCode}:`, err);
            return null;
          }
        });

        const combinedResults = await Promise.all(repairPromises);
        const validResults = combinedResults.filter(Boolean); // filter out failed ones
        setData(validResults); // ✅ Now includes both schedule + asset
      }
    };

    fetchRepairDetails();
  }, [userSchedules, dispatch]);


  console.log("data", data)

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
      case "inusage":
        return "in-progress-status";
      case "completed":
        return "completed-status";
      default:
        return "";
    }
  };


  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.repairInfo.status?.toLowerCase()))).map(
      (status) => ({
        value: status,
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "",
      })
    ),
  ];

  // Filtering data based on search and priority selection and work status
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

    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    return matchesSearch && matchesWorkStatus;
  }) : [];


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (assetCode) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(assetCode)
        ? prevSelectedRows.filter((item) => item !== assetCode)
        : [...prevSelectedRows, assetCode]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.assetCode));
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };
  const handleDeleteRow = (assetCode) => {
    const updatedData = data.filter((item) => item.assetCode !== assetCode);
    setData(updatedData);
  };

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(null); // Reset worker selection when opening modal
  };

  const handleCloseModal = () => {
    setModalData(null);
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
                  "Asset Code",
                  "Asset Name",
                  "Report Time",
                  "Date",
                  "Asset ID",
                  "Area",
                  "Workstatus",
                  "Description",
                  "",
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.assetCode}</td>
                  <td>{item.asset.title}</td>
                  <td>{item.timeStart}</td>
                  <td>{item.startDate}</td>
                  <td>{item.asset.assetID}</td>
                  <td>{item.asset.assetArea}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.status.toLowerCase().replace(/\s+/g, "") || "")}>
                      {item.status}
                    </div>
                  </td>
                  <td className="description">{item.description}</td>

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

export default SupervisorWO;
