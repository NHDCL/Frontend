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
import {
  useUpdateRepairScheduleMutation,
  useGetSchedulesByUserIDQuery,
  useGetPreventiveSchedulesByUserIDQuery
} from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { maintenanceApiSlice } from "../../slices/maintenanceApiSlice";
import Tippy from "@tippyjs/react";

import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
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
  const [status ,setStatus] = useState(null);

  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [selectedTechnicianUpdate, setSelectedTechnicianUpdate] =
    useState(null);

  const rowsPerPage = 10;

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const userID = userByEmial?.user?.userId;

  const academyId = userByEmial?.user?.academyId;

  const departmentId = userByEmial?.user?.departmentId;

  const { data: users, isLoading: usersLoading } = useGetUsersQuery();

  const filteredUsers = users?.filter(
    (user) =>
      user.academyId === academyId &&
      user.departmentId === departmentId &&
      typeof user.role?.name === "string" &&
      user.role.name.toLowerCase() === "technician"
  );

  const workerOptions = filteredUsers?.map((user) => ({
    label: user.email,
    value: user.email,
  }));

  const updatedOption = workerOptions?.find(
    (w) => w.label === selectedTechnicianUpdate
  );

  const {
    data: userSchedules,
    isLoading: userSchedulesLoading,
    error: userSchedulesError,
    refetch,
  } = useGetSchedulesByUserIDQuery(userID, {
    skip: !userID, // skip until userID is available
  });

  const repairID = userSchedules?.repai

  const [data, setData] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const dispatch = useDispatch();

useEffect(() => {
  const fetchRepairDetails = async () => {
    if (userSchedules && userSchedules.length) {
      const repairPromises = userSchedules.map(async (schedule) => {
        try {
          const repair = await dispatch(
            maintenanceApiSlice.endpoints.getRepairById.initiate(
              schedule?.repairID
            )
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

      // 🔽 Sort newest first using repairID
      const sortedData = validData.sort((a, b) =>
        b.repairID.localeCompare(a.repairID)
      );

      setData(sortedData);
    }
  };

  fetchRepairDetails();
}, [userSchedules, dispatch]);



  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [updateSchedule, { isLoading: updating }] = useUpdateRepairScheduleMutation();

  const handleSchedule = async () => {
    const repairID = modalData.repairID; // Ensure the correct way to access repairID

    if (!repairID) {
      Swal.fire("Error", "Repair ID not found.", "error");
      return;
    }
    const matchingSchedule = userSchedules.find(
      (schedule) => schedule.repairID === repairID
    );

    if (!matchingSchedule) {
      Swal.fire("Error", "No schedule found for the given repairID.", "error");
      return;
    }

    const scheduleId = matchingSchedule.scheduleID;

    if (!selectedTechnicianId) {
      Swal.fire("Error", "Technician email is missing.", "error");
      return;
    }

    // Prepare the updated data for the schedule
    const updatedData = {
      technicianEmail: selectedTechnicianId,
      repairID: matchingSchedule.repairID, // Use repairID from the matching schedule
    };

    try {
      await updateSchedule({ scheduleId, updatedData }).unwrap();
      Swal.fire({
        icon: "success",
        title: "Scheduled successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      // refetchRepairRequest();
      handleCloseModal();
    } catch (error) {
      Swal.fire("Error", error?.data?.message || "Schedule failed", "error");
      console.error("Schedule error:", error);
    }
    refetch();
  };

  const handleReschedule = async () => {
    // Assuming userSchedules is an array and repairID is available within the schedules.
    // We need to find the matching schedule using repairID
    const repairID = rescheduleModalData.repairID; // Ensure the correct way to access repairID

    if (!repairID) {
      Swal.fire("Error", "Repair ID not found.", "error");
      return;
    }

    // Find the schedule that matches the repairID
    const matchingSchedule = userSchedules.find(
      (schedule) => schedule.repairID === repairID
    );

    // If no matching schedule is found, show an error
    if (!matchingSchedule) {
      Swal.fire("Error", "No schedule found for the given repairID.", "error");
      return;
    }

    // Get the scheduleId from the matching schedule
    const scheduleId = matchingSchedule.scheduleID;
    console.log("scheduleId", scheduleId);

    // Ensure that the selectedTechnicianUpdate exists before proceeding
    if (!selectedTechnicianUpdate) {
      Swal.fire("Error", "Technician email is missing.", "error");
      return;
    }

    // Prepare the updated data for the schedule
    const updatedData = {
      technicianEmail: selectedTechnicianUpdate,
      repairID: matchingSchedule.repairID, // Use repairID from the matching schedule
    };

    console.log("Updated Data:", updatedData);

    // Try updating the schedule with the new data
    try {
      await updateSchedule({ scheduleId, updatedData }).unwrap();
      Swal.fire({
        icon: "success",
        title: "Schedule updated successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      handleCloseModal2(); // Close modal on succes
    } catch (error) {
      Swal.fire("Error", error?.data?.message || "Update failed", "error");
      console.error("Update schedule error:", error);
    }
    refetch();
  };

  const userIDD = userByEmial?.user?.userId;
  const [maintenanceData, setMaintenanceData] = useState([]);
  const {
    data: userSchedulesM,
    isLoading: userSchedulesLoadingM,
    error: userSchedulesErrorM,
  } = useGetPreventiveSchedulesByUserIDQuery(userIDD, {
    skip: !userIDD,
  });
  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (userSchedulesM && userSchedulesM.length) {
        const repairPromises = userSchedulesM.map(async (schedule) => {
          try {
            const asset = await dispatch(
              maintenanceApiSlice.endpoints.getAssetByAssetCode.initiate(
                schedule?.assetCode
              )
            ).unwrap();

            return {
              ...schedule,
              asset,
            };
          } catch (err) {
            console.error(
              `Error fetching asset for ${schedule?.assetCode}:`,
              err
            );
            return null;
          }
        });

        const combinedResults = await Promise.all(repairPromises);
        const validResults = combinedResults.filter(Boolean); // filter out failed ones
        setMaintenanceData(validResults); // ✅ Now includes both schedule + asset
      }
    };

    fetchRepairDetails();
  }, [userSchedules, dispatch]);

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
      new Set(
        data
          .map((item) => item.repairInfo.priority?.toLowerCase())
          .filter(Boolean)
      )
    ).map((priority) => ({
      value: priority,
      label: priority
        ? priority.charAt(0).toUpperCase() + priority.slice(1)
        : "",
    })),
  ];

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(
      new Set(data.map((item) => item.repairInfo.status?.toLowerCase()))
    ).map((status) => ({
      value: status,
      label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "",
    })),
  ];
  // Filtering data based on search and priority selection and work status
  // Helper function to recursively search through nested objects
  const searchRecursively = (obj, searchTerm) => {
    if (typeof obj !== "object" || obj === null) {
      return (
        obj &&
        obj
          .toString()
          .toLowerCase()
          .includes(searchTerm?.toLowerCase() || "")
      );
    }

    // Check all values in the object (including nested objects)
    return Object.values(obj).some((value) =>
      searchRecursively(value, searchTerm)
    );
  };

  const filteredData =
    data && data.length
      ? data.filter((item) => {
        // Match search term with any field at any level in the object
        const matchesSearch = searchRecursively(item, searchTerm);

        const matchesPriority =
          selectedPriority === "" ||
          item.repairInfo.priority?.toLowerCase() ===
          selectedPriority.toLowerCase();

        const matchesWorkStatus =
          selectedWorkStatus === "" ||
          item.repairInfo.status?.toLowerCase() ===
          selectedWorkStatus.toLowerCase();

        return matchesSearch && matchesPriority && matchesWorkStatus;
      })
      : [];

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignDate(item?.reportingDate);
    setAssignTime(item?.startTime);
  };

  const handleCloseModal = () => {
    setModalData(null);
    setSelectedTechnicianId(null);
    setAssignDate(null);
    setAssignTime(null);
  };
  const handleCloseModal2 = () => {
    setRescheduleModalData(null);
    setSelectedTechnicianUpdate(null);
    setAssignDate(null);
    setAssignTime(null);
    setStatus(null)
  };

  const handleRescheduleView = (item) => {
    setRescheduleModalData(item);
    setSelectedTechnicianUpdate(item?.technicianEmail || "");
    setAssignDate(item?.reportingDate);
    setAssignTime(item?.startTime);
    setStatus(item?.repairInfo?.status);

    console.log("item",item)
  };
  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  // const sortData = (column, ascending) => {
  //   const sortedData = [...data].sort((a, b) => {
  //     if (a[column] < b[column]) return ascending ? -1 : 1;
  //     if (a[column] > b[column]) return ascending ? 1 : -1;
  //     return 0;
  //   });
  //   setData(sortedData);
  // };

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
  
  const getNestedValue = (obj, path) => {
    return path?.split('.').reduce((acc, part) => acc && acc[part], obj) ?? "";
  };

  return (
    <div className="ManagerDashboard">
      <div className="cardwrap">
        {/* Card counts */}
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total technician</h3>
            <p className="count">{filteredUsers?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Work Order</h3>
            <p className="count">{maintenanceData?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Repair Request</h3>
            <p className="count">{data?.length || 0}</p>
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
                  { label: "MID", field: null },
                  { label: "Asset Name", field: "repairInfo.assetName" },
                  // { label: "Email", field: "email" }, // Uncomment if needed
                  { label: "Date", field: "reportingDate" },
                  { label: "Phone No.", field: "repairInfo.phoneNumber" },
                  { label: "Area", field: "repairInfo.area" },
                  { label: "Priority", field: "repairInfo.priority" },
                  { label: "Workstatus", field: "repairInfo.status" },
                  { label: "Description", field: null },
                  { label: "Action", field: null }, // Action buttons
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
                                  sortOrder.column === header.field && sortOrder.ascending
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
              </tr>

            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="description">
                    <Tippy
                      content={item.repairInfo?.assetName || ""}
                      placement="top"
                    >
                      <span>
                        {item.repairInfo?.assetName &&
                          item.repairInfo.assetName.length > 20
                          ? item.repairInfo.assetName.substring(0, 20) + "..."
                          : item.repairInfo?.assetName || ""}
                      </span>
                    </Tippy>
                  </td>

                  <td>{item.reportingDate}</td>
                  <td>{item.repairInfo.phoneNumber}</td>
                  <td className="description">
                    <Tippy
                      content={item.repairInfo?.area || ""}
                      placement="top"
                    >
                      <span>
                        {item.repairInfo?.area &&
                          item.repairInfo.area.length > 20
                          ? item.repairInfo.area.substring(0, 20) + "..."
                          : item.repairInfo?.area || ""}
                      </span>
                    </Tippy>
                  </td>

                  <td>{item.repairInfo.priority}</td>
                  <td>
                    <div
                      className={getWorkOrderStatusClass(
                        item.repairInfo.status
                          ?.toLowerCase()
                          .replace(/\s+/g, "") || ""
                      )}
                    >
                      {item.repairInfo.status}
                    </div>
                  </td>
                  <td className="description">
                    <Tippy
                      content={item.repairInfo?.description || ""}
                      placement="top"
                    >
                      <span>
                        {item.repairInfo?.description &&
                          item.repairInfo.description.length > 20
                          ? item.repairInfo.description.substring(0, 20) + "..."
                          : item.repairInfo?.description || ""}
                      </span>
                    </Tippy>
                  </td>

                  <td className="actions">
                    {item.technicianEmail === null ? (
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
                <label>Assign Technician:</label>
                <div style={{ width: "100%",maxWidth:"350px" }}>

                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={
                    workerOptions?.find(
                      (w) => w.value === selectedTechnicianId
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    setSelectedTechnicianId(selectedOption?.value || "");
                    console.log("Selected Worker:", selectedOption);
                  }}
                  isClearable
                />
              </div>
              </div>

              {/* Assign Date */}
              <div className="modal-content-field">
                <label>Assign Date:</label>
                <input type="text" value={assignDate} readOnly />
              </div>

              <div className="modal-content-field">
                {/* Assign Time */}
                <label>Assign Time:</label>
                <input type="text" value={assignTime} readOnly />
              </div>

              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleSchedule}
                  disabled={updating}
                  >
                    {updating ? "Saving..." : "Done"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal for schedule Request */}
      {rescheduleModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 style={{ fontSize: "18px" }} className="form-h">
                Reschedule Form
              </h2>
              <button className="close-btn" onClick={handleCloseModal2}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            {/* Assign Dropdown */}
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Assign Technician:</label>
                <div style={{ width: "100%",maxWidth:"350px" }}>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={
                    workerOptions?.find(
                      (w) => w.value === selectedTechnicianUpdate
                    ) ||
                    updatedOption ||
                    null
                  }
                  onChange={(selectedOption) => {
                    setSelectedTechnicianUpdate(selectedOption?.value || "");
                    console.log("Selected Worker:", selectedOption);
                  }}
                  isClearable
                />
              </div>
              </div>

              {/* Assign Date */}
              <div className="modal-content-field">
                <label>Assign Date:</label>
                <input type="text" value={assignDate} readOnly />
              </div>

              <div className="modal-content-field">
                {/* Assign Time */}
                <label>Assign Time:</label>
                <input type="text" value={assignTime} readOnly />
              </div>

              {status === "Pending" && (
                <div className="modal-buttons">
                  <button
                    className="accept-btn"
                    style={{ width: "80px" }}
                    onClick={handleReschedule}
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Done"}
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

export default SupervisorHome;
