import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";
import Swal from 'sweetalert2';
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { useGetMaintenanceRequestQuery, useUpdatePreventiveMaintenanceMutation } from "../../slices/maintenanceApiSlice";
import { useGetAssetQuery } from "../../slices/assetApiSlice";
import { useGetUserByEmailQuery, useGetUsersQuery, useGetDepartmentQuery } from "../../slices/userApiSlice";


const PMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [editModalData, setEditModalData] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const { data: maintenanceRequest, refetch: refetchMaintenanceRequest } = useGetMaintenanceRequestQuery();
  const [updatePreventiveMaintenance, { isLoading, error }] = useUpdatePreventiveMaintenanceMutation();
  const { data: assetData, refetch: refetchAssetData } = useGetAssetQuery();
  const { data: allUsers } = useGetUsersQuery(); // hypothetical slice
  const { data: allDepartment } = useGetDepartmentQuery(); // hypothetical slice

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const academyName = userByEmial?.user.academyId;

  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState([]);
  // console.log('mdata: ', maintenanceRequest)
  // console.log('adata: ', assetData)
  console.log('data: ', data)

  useEffect(() => {
    if (maintenanceRequest && assetData && userByEmial && allUsers && allDepartment) {
      console.log("🔧 Raw Maintenance Requests:", maintenanceRequest);
      console.log("📦 Asset Data:", assetData);
      console.log("📧 All Users:", allUsers);
      console.log("🏛️ Departments:", allDepartment);
      console.log("👤 Logged-in User:", userByEmial);

      const userAcademyId = userByEmial?.user?.academyId;
      console.log("🏫 User's Academy ID:", userAcademyId);

      const filtered = maintenanceRequest
        .map((request) => {
          const matchedAsset = assetData.find(
            (a) =>
              a.assetCode === request.assetCode &&
              a.academyID === userAcademyId
          );

          const user = allUsers.find((u) => u?.userId === request.userID);
          const email = user ? user.email : "N/A";
          const department = user
            ? allDepartment.find((d) => d?.departmentId === user.departmentId)
            : null;
          const departmentName = department ? department.name : "N/A";

          console.log("📝 Request:", request);
          console.log("📎 Matched Asset:", matchedAsset);
          console.log("📨 User Email:", email);
          console.log("🏛️ Department Name:", departmentName);

          if (matchedAsset) {
            return {
              ...request,
              assetName: matchedAsset.title,
              userEmail: email,
              userDepartment: departmentName,
            };
          }

          return null;
        })
        .filter((r) => r !== null);

      console.log("✅ Filtered & Enriched Requests:", filtered);

      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log("📊 Sorted Requests:", sorted);

      setData(sorted);
    }
  }, [maintenanceRequest, assetData, userByEmial, allUsers, allDepartment]);



  const rowsPerPage = 10;

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


  const handleUpdate = async () => {
    const updatedMaintenance = {
      title: "New Title",
      description: "Updated description",
      // ...other fields
    };

    try {
      const res = await updatePreventiveMaintenance({
        id: "1234567890",
        maintenance: updatedMaintenance,
      }).unwrap();
      console.log("Update successful:", res);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map(item => item.status?.toLowerCase()))).map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }))
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.assetCode - a.assetCode);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesWorkStatus =
      selectedWorkStatus === "" || item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    return matchesSearch && matchesWorkStatus;
  });

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
  };
  const handleCloseModal = () => {
    setModalData(null);
  };


  // Open Edit Modal
  const handleEditRow = (item) => {
    setEditModalData(item);
  };

  const handleSaveEdit = async () => {
    if (!editModalData) return;

    setIsSaving(true);

    try {
      const payload = {
        id: editModalData.maintenanceID,
        maintenance: {
          description: editModalData.description,
          startDate: editModalData.startDate,
          timeStart: editModalData.timeStart,
          repeat: editModalData.repeat,
          endDate: editModalData.endDate,
          status: editModalData.status || "pending",
          userID: userID,
        },
      };

      const response = await updatePreventiveMaintenance(payload).unwrap();
      console.log("✅ Maintenance updated:", response);

      setUserID(null);

      setData((prevData) =>
        prevData.map((item) =>
          item.maintenanceID === payload.id ? { ...item, ...payload.maintenance } : item
        )
      );

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "The maintenance record has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setEditModalData(null);
    } catch (err) {
      console.error("❌ Failed to update maintenance:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update the maintenance record. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
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
  const workersList = (allUsers || [])
    .filter(user => {
      const dept = allDepartment?.find(d => d?.departmentId === user?.departmentId);
      return dept?.name === editModalData?.userDepartment;
    })
    .map(user => ({
      value: user.userId, // This is what you want to send to backend
      label: user.email,  // Display the email
    }));

  console.log("🛠️ Workers List for Department:", editModalData?.userDepartment);
  console.log("👥 Matched Workers:", workersList);

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
                          : displayedData.map((item) => item.assetCode)
                      )
                    }
                  />
                </th>
                {[
                  "Asset Code",
                  "Asset Name",
                  "Description",
                  "Schedule(month)",
                  "Start Date",
                  "End Date",
                  "Assign to",
                  "Workstatus"
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
                <th>
                  {selectedRows.length > 0 ? (
                    <button
                      className="deleteMaintenance-all-btn"
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
                      checked={selectedRows.includes(item.maintenanceID)}
                      onChange={() => handleSelectRow(item.maintenanceID)}
                    />
                  </td>
                  <td>{item.assetCode}</td>
                  <td>{item.assetName}</td>
                  <td>{item.description}</td>
                  <td>{item.repeat}</td>
                  <td>{item.startDate}</td>
                  <td>{item.endDate}</td>
                  <td>{item.userEmail}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.status.toLowerCase().replace(/\s+/g, ""))}>
                      {item.status}
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
                      onClick={() => handleDeleteRow(item.assetCode)}
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
                <input type="text" value={editModalData.description} onChange={(e) => setEditModalData({ ...editModalData, description: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Assign: </label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={
                    workersList.find(worker => worker.value === editModalData.userID) || null
                  }
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setEditModalData({
                        ...editModalData,
                        userID: selectedOption.value,      // Set the userID
                        userEmail: selectedOption.label,   // Optionally keep email for display
                      });
                      setUserID(selectedOption.value);     // Keep in sync
                    } else {
                      setEditModalData({ ...editModalData, userID: "", userEmail: "" });
                      setUserID(null);
                    }
                  }}
                  placeholder="Select worker"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No workers found for this department"}
                />


              </div>

              <p className="sub-title">Schedule</p>
              <div className="modal-content-field">
                <label htmlFor="">Starts on: </label>
                <input
                  type="date"
                  value={editModalData.startDate}
                  onChange={(e) =>
                    setEditModalData({ ...editModalData, startDate: e.target.value })
                  } />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Schedule time: </label>
                <input type="time" value={editModalData.timeStart} onChange={(e) => setEditModalData({ ...editModalData, timeStart: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Repeats: </label>
                <input type="text" value={editModalData.repeat} onChange={(e) => setEditModalData({ ...editModalData, repeat: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Ends on: </label>
                <input
                  type="date"
                  value={editModalData.endDate}
                  onChange={(e) =>
                    setEditModalData({ ...editModalData, endDate: e.target.value })
                  } />
              </div>

            </div>

            {/* <button className="save-btn" onClick={handleSaveEdit}>Save</button> */}
            <div className="modal-buttons">
              <button
                className="accept-btn"
                style={{ width: "80px" }}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PMaintenance;
