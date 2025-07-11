import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetRepairRequestQuery,
  useAssignRepairMutation,
  usePostRepairScheduleMutation,
  useGetSchedulesByRepairIDQuery,
  useUpdateRepairScheduleMutation,
} from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetDepartmentQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";
import Tippy from "@tippyjs/react";

const Repair = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [rescheduleModalData, setRescheduleModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [assignTimeU, setAssignTimeU] = useState("");
  const [assignDateU, setAssignDateU] = useState("");
  const [statusPending, setStatusPending] = useState(null);
  const [supervisorWorker, setSupervisorOption] = useState(null);

  const rowsPerPage = 10;

  const {
    data: repairRequest,
    isLoading,
    refetch: refetchRepairRequest,
  } = useGetRepairRequestQuery();

  const repairID = rescheduleModalData?.repairID;

  const { data: scheduleData, error } = useGetSchedulesByRepairIDQuery(
    repairID,
    {
      skip: !repairID,
    }
  );

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Please wait...",
        text: "Loading repair data.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  const [updateSchedule, { isLoading: updating }] =
    useUpdateRepairScheduleMutation();

  if (error) {
    console.error("Error fetching schedule data:", error);
  }

  const [assignRepair, { isLoading: scheduling }] = useAssignRepairMutation();

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
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
    .filter((user) => user.departmentId === selectedDepartment)
    .map((user) => ({
      value: user.userId,
      label: user.email,
    }));

  const userID = scheduleData?.[0]?.userID;

  const matchedSupervisor = supervisorsFromSameAcademy?.find(
    (supervisor) => supervisor.userId === userID
  );

  const supervisorEmail = matchedSupervisor?.email;

  const supervisorDepartmentId = matchedSupervisor?.departmentId;
  const supervisorDepartment = Array.isArray(departments)
    ? departments.find((dept) => dept.departmentId === supervisorDepartmentId)
    : null;
  const departmentName = supervisorDepartment?.name || "Unknown";

  // Manage state
  const [selectedDepartmentU, setSelectedDepartmentU] = useState(
    supervisorDepartmentId
  );
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);

  // Update selected department when matchedSupervisor is found
  useEffect(() => {
    if (supervisorDepartmentId) {
      setSelectedDepartmentU(supervisorDepartmentId);
    }
  }, [supervisorDepartmentId, departmentName]);

  // Supervisor select options
  const supervisorsInDepartment =
    supervisorsFromSameAcademy
      ?.filter(
        (user) => String(user.departmentId) === String(selectedDepartmentU) // only check department
      )
      .map((user) => ({
        label: user.email,
        value: user.userId,
      })) || [];

  const supervisorOption = supervisorEmail
    ? { label: supervisorEmail, value: matchedSupervisor?.userId }
    : null;

  const finalOptions =
    supervisorsInDepartment.length > 0
      ? supervisorsInDepartment
      : supervisorOption
        ? [supervisorOption]
        : [];

  // Department dropdown options
  const departmentOptionsU =
    departments
      ?.filter((dep) =>
        uniqueSupervisorDepartmentIds.includes(dep.departmentId)
      )
      .map((dep) => ({
        value: dep.departmentId,
        label: dep.name,
      })) || [];
  // For default department selection
  const initialDepartmentOption = departmentOptionsU.find(
    (opt) => opt.label === departmentName
  );

  // Set reporting time/date
  useEffect(() => {
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const schedule = scheduleData[0];
      setAssignDateU(schedule.reportingDate);
      setAssignTimeU(schedule.startTime);
    }
  }, [scheduleData]);

  const handleRescheduleView = async (item) => {
    setRescheduleModalData(item);

    setAssignDateU(item?.reportingDate || "");
    setAssignTimeU(item?.startTime?.slice(0, 5) || "");
    setStatusPending(item?.status);
  };

  const [postRepairSchedule] = usePostRepairScheduleMutation();

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

    try {
      // 1. First assign the repair
      await assignRepair({
        repairId: modalData.repairID,
        email: assignedWorker?.label,
      });

      // 2. Then post the schedule to backend
      await postRepairSchedule(scheduleData);

      Swal.fire({
        icon: "success",
        title: "Repair Request Scheduled",
        text: "The request has been successfully assigned and scheduled.",
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
    }
  };

  const handleUpdateSchedule = async () => {
    if (!scheduleData?.[0]?.scheduleID) {
      Swal.fire({
        icon: "error",
        title: "Schedule Not Found",
        text: "We couldn’t locate the schedule data. Please check and try again.",
      });

      return;
    }
    const scheduleId = scheduleData[0].scheduleID;

    let formattedTime = assignTimeU;
    if (assignTimeU.length === 5) {
      formattedTime = `${assignTimeU}:00`;
    }

    const updatedData = {
      startTime: formattedTime,
      reportingDate: assignDateU,
      userID: selectedSupervisorId || supervisorWorker?.value,
      repairID: scheduleData[0].repairID,
    };

    try {
      // ✅ Step 1: Assign the repair to new supervisor
      await assignRepair({
        repairId: scheduleData[0].repairID,
        email: supervisorWorker?.label, // assuming label is email
      });

      // ✅ Step 2: Update the schedule
      await updateSchedule({ scheduleId, updatedData }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Schedule Updated",
        text: "Repair has been reassigned successfully.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      refetchRepairRequest();
      handleCloseModal2();
    } catch (error) {
      Swal.fire("Error", error?.data?.message || "Update failed", "error");
      console.error("Update schedule error:", error);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState([]);
  console.log("dataaaa", data)

  useEffect(() => {
    if (!repairRequest || !userByEmial) return;

    const userAcademy = userByEmial?.user.academyId?.trim().toLowerCase();

    const filtered = repairRequest.filter((req) => {
      const requestAcademy = req.academyId?.trim().toLowerCase();
      return requestAcademy === userAcademy && req.accept === true;
    });

    const sortedFiltered = filtered.sort((a, b) =>
      b.repairID.localeCompare(a.repairID)
    );
    setData(sortedFiltered);
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

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(null);
    setAssignDate("");
    setAssignTime("");
    setSelectedDepartment(null);
  };

  const handleCloseModal = () => {
    setModalData(null);
    setAssignedWorker(null);
    setAssignDate(null);
    setAssignTime(null);
    setSelectedDepartment(null);
    refetchRepairRequest();
  };
  const handleCloseModal2 = () => {
    setRescheduleModalData(null);
    setAssignedWorker(null);
    setAssignDate(null);
    setAssignTime(null);
    setSelectedDepartment(null);
    setSelectedSupervisorId(null);
    refetchRepairRequest();
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
        ? !sortOrder.ascending // Toggle the sorting direction if the same column is clicked
        : true; // Start with ascending for a new column

    setSortOrder({
      column,
      ascending: newSortOrder,
    });
    sortData(column, newSortOrder);
  };
  const getLocalCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  useEffect(() => {
    if (modalData) {
      setAssignTime(getLocalCurrentTime());
    }
  }, [modalData]);

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
                {[
                  { label: "Sl.No", field: null },
                  { label: "Image", field: null },
                  { label: "Name", field: "name" },
                  { label: "Email", field: null },
                  { label: "phone", field: null },
                  { label: "Area", field: "area" },
                  { label: "Priority", field: null },
                  { label: "Workstatus", field: null },
                  { label: " ", field: null },
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
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      className="User-profile"
                      src={item.images[0]}
                      alt="User"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td className="description">
                    <Tippy content={item.name || ""} placement="top">
                      <span>
                        {item.name?.length > 20
                          ? item.name.substring(0, 20) + "..."
                          : item.name || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.email || ""} placement="top">
                      <span>
                        {item.email?.length > 20
                          ? item.email.substring(0, 20) + "..."
                          : item.email || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>{item.phoneNumber || ""}</td>
                  <td className="description">
                    <Tippy content={item.area || ""} placement="top">
                      <span>
                        {item.area?.length > 20
                          ? item.area.substring(0, 20) + "..."
                          : item.area || ""}
                      </span>
                    </Tippy>
                  </td>

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
                    {(item.status === "Completed" || item.status === "In Progress") ? (
                      <button
                        className="schedule-btn"
                        onClick={() =>
                          item.scheduled === false
                            ? handleScheduleView(item)
                            : handleRescheduleView(item)
                        }
                      >
                        View
                      </button>
                    ) : item.scheduled === false ? (
                      <button
                        className="schedule-btn"
                        onClick={() => handleScheduleView(item)}
                      >
                        Schedule
                      </button>
                    ) : (
                      <button
                        className="schedule-btn"
                        style={{ backgroundColor: "#315845" }}
                        onClick={() => handleRescheduleView(item)}
                      >
                        Reschedule
                      </button>
                    )}
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
              <h2 style={{ fontSize: "18px" }} className="form-h">
                Schedule Form
              </h2>
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
                <div style={{ width: "100%", maxWidth: "350px" }}>
                  <Select
                    classNamePrefix="custom-select-department"
                    // className="workstatus-dropdown"
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
              </div>

              <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                <div style={{ width: "100%", maxWidth: "350px" }}>
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
                // onChange={(e) => setAssignTime(e.target.value)}
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
              <h2 style={{ fontSize: "18px" }} className="form-h">
                {statusPending === "Pending" ? "Reschedule Form" : "Schedule Details"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal2}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Department:</label>
                <div style={{ width: "100%", maxWidth: "350px" }}>
                  <Select
                    classNamePrefix="custom-select-department"
                    className="workstatus-dropdown"
                    options={departmentOptionsU}
                    value={
                      departmentOptionsU.find(
                        (opt) => opt.value === selectedDepartmentU
                      ) ||
                      initialDepartmentOption ||
                      null
                    }
                    onChange={(selected) =>
                      setSelectedDepartmentU(selected.value)
                    }
                  />
                </div>
              </div>

              <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                <div style={{ width: "100%", maxWidth: "350px" }}>
                  <Select
                    classNamePrefix="custom-select-department"
                    className="workstatus-dropdown"
                    value={
                      finalOptions.find(
                        (opt) => opt.value === selectedSupervisorId
                      ) ||
                      supervisorOption ||
                      null
                    }
                    options={finalOptions}
                    isClearable
                    onChange={(selectedOption) => {
                      setSelectedSupervisorId(selectedOption?.value || null);
                      setSupervisorOption(selectedOption || null);
                      console.log(
                        "Selected Supervisor Email:",
                        selectedOption?.label || "None"
                      );
                    }}
                  />
                </div>
              </div>

              <div className="modal-content-field">
                <label>Assign Date:</label>
                <input
                  type="date"
                  value={
                    assignDateU !== ""
                      ? assignDateU
                      : rescheduleModalData?.reportingDate || ""
                  }
                  min={today}
                  onChange={(e) => setAssignDateU(e.target.value)}
                />
              </div>

              <div className="modal-content-field">
                <label>Assign Time:</label>
                <input
                  type="time"
                  value={
                    assignTimeU !== ""
                      ? assignTimeU
                      : rescheduleModalData?.startTime?.slice(0, 5) || ""
                  }
                  onChange={(e) => setAssignTimeU(getLocalCurrentTime())}
                />
              </div>

              {statusPending === "Pending" && (
                <div>
                  <button
                    disabled={updating}
                    className="accept-btn"
                    onClick={handleUpdateSchedule}
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repair;
