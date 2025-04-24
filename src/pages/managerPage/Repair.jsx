import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetRepairRequestQuery,
  useAssignRepairMutation,
  usePostRepairScheduleMutation,
  useGetRepairRequestScheduleQuery,
  useGetSchedulesByRepairIDQuery,
  useUpdateRepairScheduleMutation,
} from "../../slices/maintenanceApiSlice";
import { useUser } from "../../context/userContext";
import { useSelector } from "react-redux";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetDepartmentQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

const Repair = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [rescheduleModalData, setRescheduleModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  console.log("dt",assignDate)

  const rowsPerPage = 10;

  const { data: repairRequest, refetch: refetchRepairRequest } =
    useGetRepairRequestQuery();

  const repairID = rescheduleModalData?.repairID;
  console.log("rid", repairID);

  const {
    data: scheduleData,
    isLoading,
    error,
  } = useGetSchedulesByRepairIDQuery(repairID, {
    skip: !repairID,
  });

  const [updateSchedule] = useUpdateRepairScheduleMutation();


  useEffect(() => {
    if (repairID) {
      console.log("Fetching schedule for repair ID:", repairID);
    }
  }, [repairID]);

  if (error) {
    console.error("Error fetching schedule data:", error);
  }
  console.log("Schedule Data:", scheduleData);

  const [assignRepair, {isLoading:scheduling}] = useAssignRepairMutation();
  const { userInfo, userRole } = useSelector((state) => state.auth);

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const academyId = userByEmial?.user?.academyId;
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartmentQuery();

  const { data: users } = useGetUsersQuery();

  const supervisorsFromSameAcademy =
    users?.filter(
      (user) =>
        user.academyId === academyId &&
        typeof user.role?.name === "string" &&
        user.role.name.toLowerCase() === "supervisor"
    ) || [];

  const uniqueSupervisorDepartmentIds = [
    ...new Set(supervisorsFromSameAcademy.map((s) => s.departmentId)),
  ];

  const departmentNames = uniqueSupervisorDepartmentIds.map((id) => {
    const matchedDept = departments?.find((dept) => dept.departmentId === id);
    return matchedDept ? matchedDept.name : "Unknown";
  });

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const departmentOptions =
    departments
      ?.filter((dep) =>
        uniqueSupervisorDepartmentIds.includes(dep.departmentId)
      )
      .map((dep) => ({
        value: dep.departmentId,
        label: dep.name,
      })) || [];

  const workerOptions = supervisorsFromSameAcademy
  .filter(user => user.departmentId === selectedDepartment)
  .map(user => ({
    value: user.userId,
    label: user.email,
  }));

  const [postRepairSchedule] = usePostRepairScheduleMutation();
  console.log("aw", assignedWorker);


  const handleAssignAndSchedule = async () => {
    if (!assignedWorker || !assignTime || !assignDate || !modalData?.repairID) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    const formattedDate = new Date(assignDate).toISOString().split("T")[0];
    const scheduleData = {
      repairID: modalData.repairID,
      reportingDate: formattedDate,
      startTime: `${assignTime}:00`,
      userID: assignedWorker?.value, // user ID from Select's value
    };
    console.log("sc data", scheduleData);

    try {
      // 1. First assign the repair
      const assignmentResponse = await assignRepair({
        repairId: modalData.repairID,
        email: assignedWorker?.label,
      });

      console.log("Assign Response Message:", assignmentResponse);

      // 2. Then post the schedule to backend
      const scheduleResponse = await postRepairSchedule(scheduleData);
      console.log("Schedule Response:", scheduleResponse);

      // Swal.fire(
      //   "Success",
      //   assignmentResponse.message || "Repair assigned and scheduled!",
      //   "success"
      // );
       Swal.fire({
                icon: "success",
                title: "Repair Request assigned and scheduled!",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000,
              });

      refetchRepairRequest();
      handleCloseModal();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.data?.message || JSON.stringify(error) || "Something went wrong",
        "error"
      );
      console.log("Full Error:", error);
    }
  };

  const handleUpdateSchedule = async () => {
    // Ensure that scheduleData is not empty or undefined
    if (!scheduleData || scheduleData.length === 0) {
      Swal.fire("Warning", "No schedule data found to update.", "warning");
      return;
    }
  
    // Assuming you're working with the first item in the scheduleData array (adjust as needed)
    const scheduleToUpdate = scheduleData[0];
    
    // Log the selected schedule data to ensure we're getting the correct schedule
    console.log("Selected Schedule to Update:", scheduleToUpdate);
  
    const scheduleId = scheduleToUpdate?.scheduleId; // Extract scheduleId from the selected schedule
    
    if (!scheduleId) {
      Swal.fire("Error", "Schedule ID is missing.", "error");
      return;
    }
  
    console.log("Schedule ID to Update:", scheduleId);
  
    // Prepare updated data
    const updatedData = {
      startTime: `${assignTime}:00`,  // Ensure this comes from the input
      endTime: "16:00",  // Change this if necessary to dynamically set the end time
    };
    console.log("Updated Data:", updatedData);
    try {
      // Make the API request using the mutation
      const response = await updateSchedule({
        scheduleId,
        updatedData,
      }).unwrap(); // unwrap to handle the response directly
  
      console.log("API Response:", response);
  
      Swal.fire("Success", "Schedule updated successfully!", "success");
      refetchRepairRequest();  // Refetch repair requests if necessary
      handleCloseModal2();  // Close the modal after success
    } catch (error) {
      Swal.fire("Error", error?.data?.message || "Update failed", "error");
      console.error("Error while updating schedule:", error);
    }
  };
  
  
  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!repairRequest || !userByEmial) return;

    const userAcademy = userByEmial?.user.academyId?.trim().toLowerCase();

    const filtered = repairRequest.filter((req) => {
      const requestAcademy = req.academyId?.trim().toLowerCase();
      return requestAcademy === userAcademy && req.accept === true;
    });

    setData(
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  }, [repairRequest, userByEmial]);

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

  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(data.map((item) => item.priority?.toLowerCase()).filter(Boolean))
    ).map((priority) => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
    })),
  ];

  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.status?.toLowerCase()))).map(
      (status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })
    ),
  ];

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      (value || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesPriority =
      selectedPriority === "" ||
      item.priority?.toLowerCase() === selectedPriority.toLowerCase();

    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

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
  const handleCloseModal2 = () => {
    setRescheduleModalData(null);
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
              )}
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
                  "Workstatus",
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
                    <div
                      className={getWorkOrderStatusClass(
                        item.status.toLowerCase().replace(/\s+/g, "")
                      )}
                    >
                      {item.status}
                    </div>
                  </td>
                  <td className="actions">
                    {item.scheduled === false ? (
                      <button
                        className="schedule-btn"
                        onClick={() => handleScheduleView(item)}
                      >
                        Schedule
                      </button>
                    ) : (
                      <button
                        className="schedule-btn"
                        style={{ backgroundColor: "#979797" }}
                        onClick={() => handleRescheduleView(item)}
                      >
                        Reschedule
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.repairID)}
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
                <label>Department:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={departmentOptions}
                  value={
                    departmentOptions.find(
                      (opt) => opt.value === selectedDepartment
                    ) || null
                  }
                  onChange={(option) =>
                    setSelectedDepartment(option?.value || "")
                  }
                  isLoading={departmentsLoading}
                  isClearable
                />
              </div>

              <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={assignedWorker}
                  onChange={(selectedOption) => {
                    setAssignedWorker(selectedOption || null); // full object with { value, label }
                    console.log(
                      "Selected Worker Email:",
                      selectedOption?.label || "None"
                    );
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
                <button
                  className="accept-btn"
                  style={{ width: "100px" }}
                  onClick={handleAssignAndSchedule}
                  disabled={scheduling}

                >
                  {/* Done */}
                  {scheduling ? "Scheduling.." : "Schedule   "}{" "}

                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Reschedule Request */}
      {rescheduleModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reschedule Form: {rescheduleModalData.repairID}</h2>
              <button className="close-btn" onClick={handleCloseModal2}>
                <IoIosCloseCircle />
              </button>
            </div>
            <div className="schedule-form">
              <div>
                <label>Department:</label>
                <Select
                  options={departmentOptions}
                  value={departmentOptions.find((opt) => opt.value === selectedDepartment) || null}
                  onChange={(option) => setSelectedDepartment(option?.value || "")}
                  isLoading={departmentsLoading}
                  isClearable
                />
              </div>
              <div>
                <label>Assign Supervisor:</label>
                <Select
                  options={workerOptions}
                  value={assignedWorker}
                  onChange={setAssignedWorker}
                  isClearable
                />
              </div>
              <div>
                <label>Assign Date:</label>
                <input type="date" value={assignDate} min={today} onChange={(e) => setAssignDate(e.target.value)} />
              </div>
              <div>
                <label>Assign Time:</label>
                <input type="time" value={assignTime} onChange={(e) => setAssignTime(e.target.value)} />
              </div>
              <div>
                <button className="accept-btn" onClick={handleUpdateSchedule}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repair;