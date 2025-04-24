import React, { useState, useEffect } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { useGetMaintenanceRequestQuery,   useGetSchedulesByUserIDQuery, useUpdatePreventiveMaintenanceMutation,
  useGetPreventiveSchedulesByUserIDQuery, useGetMaintenanceByAssetCodeQuery } from "../../slices/maintenanceApiSlice";
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
import Swal from "sweetalert2";


import Select from "react-select";

const SupervisorWO = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
    const [rescheduleModalData, setRescheduleModalData] = useState(null);
  

  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [selectedTechnicianUpdate, setSelectedTechnicianUpdate] =
      useState(null);
  const rowsPerPage = 10;
  console.log(
    "start supervisor........................................................................."
  );

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const userID = userByEmial?.user?.userId;
  console.log("userID", userID)

  const academyId = userByEmial?.user?.academyId;
  console.log("academyId", academyId);

  const departmentId = userByEmial?.user?.departmentId;
  console.log("departmentId", departmentId);

  const { data: users, isLoading: usersLoading } = useGetUsersQuery();

  const filteredUsers = users?.filter(
    (user) =>
      user.academyId === academyId &&
      user.departmentId === departmentId &&
      typeof user.role?.name === "string" &&
      user.role.name.toLowerCase() === "technician"
  );
  console.log("filteredUsers:", filteredUsers);

  const workerOptions = filteredUsers?.map((user) => ({
    label: user.email,
    value: user.email,
  }));
  console.log("workerOptions:", workerOptions);

  const updatedOption = workerOptions?.find(
    (w) => w.label === selectedTechnicianUpdate
  );

  const {
    data: userSchedules,
    isLoading: userSchedulesLoading,
    error: userSchedulesError,
    refetch
  } = useGetPreventiveSchedulesByUserIDQuery(userID, {
    skip: !userID,
  })
  console.log("sdf", modalData)
  const assetCode = userSchedules?.assetCode;
  console.log("rid", assetCode);
  console.log("userSchedule", userSchedules);

  const {
    data: scheduleData,
   
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

  const today = new Date().toISOString().split("T")[0];

  const [updateSchedule] = useUpdatePreventiveMaintenanceMutation();

const handleSchedule = async () => {
   const maintenanceID = modalData.maintenanceID;  // Ensure the correct way to access repairID
   
       if (!maintenanceID) {
         Swal.fire("Error", "Repair ID not found.", "error");
         return;
       }
       const matchingSchedule = userSchedules.find(schedule => schedule.maintenanceID === maintenanceID);
     
       if (!matchingSchedule) {
         Swal.fire("Error", "No schedule found for the given maintenanceID.", "error");
         return;
       }
     
       const id = matchingSchedule.maintenanceID;
       console.log("scheduleId", id);
     
       if (!selectedTechnicianId) {
         Swal.fire("Error", "Technician email is missing.", "error");
         return;
       }
     
       // Prepare the updated data for the schedule
       const maintenance = {
         technicianEmail: selectedTechnicianId,
         repairID: matchingSchedule.maintenanceID,  // Use repairID from the matching schedule
       };

    try {
      await updateSchedule({ id, maintenance }).unwrap();
      Swal.fire({
        icon: "success",
        title: "Schedule updated successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      // refetchRepairRequest();
      handleCloseModal();
    } catch (error) {
      Swal.fire("Error", error?.data?.message || "Update failed", "error");
      console.error("Update schedule error:", error);
    }
    refetch()

  };


 const handleReschedule = async () => {

  const maintenanceID = rescheduleModalData.maintenanceID;  // Ensure the correct way to access repairID
   
  if (!maintenanceID) {
    Swal.fire("Error", "Repair ID not found.", "error");
    return;
  }
  const matchingSchedule = userSchedules.find(schedule => schedule.maintenanceID === maintenanceID);

  if (!matchingSchedule) {
    Swal.fire("Error", "No Reschedule found for the given maintenanceID.", "error");
    return;
  }

  const id = matchingSchedule.maintenanceID;
  console.log("scheduleId", id);

  if (!selectedTechnicianUpdate) {
    Swal.fire("Error", "Technician email is missing.", "error");
    return;
  }

  // Prepare the updated data for the schedule
  const maintenance = {
    technicianEmail: selectedTechnicianUpdate,
    repairID: matchingSchedule.maintenanceID,  // Use repairID from the matching schedule
  };

    try {
      await updateSchedule({ id, maintenance }).unwrap();
      Swal.fire({
        icon: "success",
        title: "Schedule updated successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      // refetchRepairRequest();
      handleCloseModal2();
    } catch (error) {
      Swal.fire("Error", error?.data?.message || "Update failed", "error");
      console.error("Update schedule error:", error);
    }
    refetch()
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
    ...Array.from(new Set(data.map((item) => item.status?.toLowerCase()))).map(
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


  const handleScheduleView = (item) => {
    setModalData(item);
    setStartDate(item?.startDate);
    setEndDate(item?.endDate);
    setAssignTime(item?.timeStart);

  };
  const handleCloseModal = () => {
    setModalData(null);
    setSelectedTechnicianId(null);
    setStartDate(null);
    setEndDate(null);    
    setAssignTime(null);
  };
  const handleCloseModal2 = () => {
    setRescheduleModalData(null);
    setSelectedTechnicianUpdate(null);
    setStartDate(null);
    setEndDate(null);     
    setAssignTime(null);
  };
  const handleRescheduleView = (item) => {
    setRescheduleModalData(item);
    setSelectedTechnicianUpdate(item?.technicianEmail || "");
    setStartDate(item?.startDate);
    setEndDate(item?.endDate);    
    setAssignTime(item?.timeStart);
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
                    setSelectedTechnicianId(selectedOption?.label || "");
                    console.log("Selected Worker:", selectedOption);
                  }}
                  isClearable
                />
              </div>
                 {/* Assign Date */}
                 <div className="modal-content-field">
                <label>Start Date:</label>
                <input type="text" value={startDate} readOnly />
              </div>
               {/* Assign Date */}
               <div className="modal-content-field">
                <label>End Date:</label>
                <input type="text" value={endDate} readOnly />
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
                >
                  Done
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
              {/* Assign Date */}
              <div className="modal-content-field">
                <label>Start Date:</label>
                <input type="text" value={startDate} readOnly />
              </div>
               {/* Assign Date */}
               <div className="modal-content-field">
                <label>End Date:</label>
                <input type="text" value={endDate} readOnly />
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
                  onClick={handleReschedule}
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
