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
import { TiArrowSortedUp } from "react-icons/ti";
import Swal from "sweetalert2";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import {
  useGetMaintenanceRequestQuery,
  useSendEmailMutation,
  useUpdatePreventiveMaintenanceMutation,
} from "../../slices/maintenanceApiSlice";
import { useGetAssetQuery } from "../../slices/assetApiSlice";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetDepartmentQuery,
} from "../../slices/userApiSlice";
import Tippy from "@tippyjs/react";

const PMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [editModalData, setEditModalData] = useState(null);
  const [userID, setUserID] = useState(null);
  const [supervisor, setEmail] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusPending, setStatusPending] = useState(null);

  const {
    data: maintenanceRequest,
    isLoading,
    refetch: refetchMaintenanceRequest,
  } = useGetMaintenanceRequestQuery();
  const [updatePreventiveMaintenance] =
    useUpdatePreventiveMaintenanceMutation();

  const { data: assetData, refetch: refetchAssetData } = useGetAssetQuery();
  const { data: allUsers } = useGetUsersQuery(); // hypothetical slice
  const { data: allDepartment } = useGetDepartmentQuery(); // hypothetical slice
  const [sendEmail] = useSendEmailMutation();

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const [data, setData] = useState([]);

  useEffect(() => {
    if (
      maintenanceRequest &&
      assetData &&
      userByEmial &&
      allUsers &&
      allDepartment
    ) {
      const userAcademyId = userByEmial?.user?.academyId;

      const filtered = maintenanceRequest
        .map((request) => {
          const matchedAsset = assetData.find(
            (a) =>
              a.assetCode === request.assetCode && a.academyID === userAcademyId
          );
          const user = allUsers.find((u) => u?.userId === request.userID);
          const email = user ? user.email : "N/A";
          const department = user
            ? allDepartment.find((d) => d?.departmentId === user.departmentId)
            : null;
          const departmentName = department ? department.name : "N/A";

          if (matchedAsset) {
            return {
              ...request,
              assetName: matchedAsset.title,
              userEmail: email,
              // userAcademy:
              userDepartment: departmentName,
            };
          }

          return null;
        })
        .filter((r) => r !== null);

      const sortedFiltered = filtered.sort((a, b) =>
        b.maintenanceID.localeCompare(a.maintenanceID)
      );

      setData(sortedFiltered);
    }
  }, [maintenanceRequest, assetData, userByEmial, allUsers, allDepartment]);

  const rowsPerPage = 10;

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Please wait...",
        text: "Loading maintenance data.",
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

  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status"; // Gray color
      case "inprogress":
        return "in-progress-status"; // Yellow color
      case "completed":
        return "completed-status"; // Green color
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
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })
    ),
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b?.assetCode - a?.assetCode);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some(
      (value) =>
        value != null &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()) // Check for null or undefined
    );

    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    return matchesSearch && matchesWorkStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Open Edit Modal
  const handleEditRow = (item) => {
    setEditModalData(item);
    setStatusPending(item?.status);
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

      if (supervisor) {
        await sendEmail({ to: supervisor }).unwrap();
      }

      setUserID(null);
      setEmail(null);

      setData((prevData) =>
        prevData.map((item) =>
          item.maintenanceID === payload.id
            ? { ...item, ...payload.maintenance }
            : item
        )
      );
      Swal.fire({
        icon: "success",
        title: "Record Updated",
        text: "Maintenance record updated and email sent successfully.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });

      setEditModalData(null);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "We couldn't update the maintenance record. Please try again shortly.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Sample workers list
  // Sample workers list with department and academy filtering
  const workersList = (allUsers || [])
    .filter((user) => {
      const dept = allDepartment?.find(
        (d) => d?.departmentId === user?.departmentId
      );

      const matchesDepartment =
        dept?.name?.toLowerCase() ===
        editModalData?.userDepartment?.toLowerCase();

      const matchesAcademy = user?.academyId === userByEmial?.user?.academyId;

      return matchesDepartment && matchesAcademy;
    })
    .map((user) => ({
      value: user.userId,
      label: user.email,
    }));

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

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
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
                  { label: "Asset Code", field: "assetCode" },
                  { label: "Asset Name", field: "assetName" },
                  { label: "Description", field: null },
                  { label: "Schedule(month)", field: null },
                  { label: "From Date", field: "startDate" },
                  { label: "To Date", field: "endDate" },
                  { label: "Assign to", field: "userEmail" },
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
                  <td>{item.assetCode}</td>
                  <td className="description">
                    <Tippy content={item.assetName || ""} placement="top">
                      <span>
                        {item.assetName?.length > 20
                          ? item.assetName.substring(0, 20) + "..."
                          : item.assetName || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.description || ""} placement="top">
                      <span>
                        {item.description?.length > 20
                          ? item.description.substring(0, 20) + "..."
                          : item.description || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>{item.repeat || ""}</td>
                  <td>{formatDate(item.startDate) || ""}</td>
                  <td>{formatDate(item.endDate) || ""}</td>
                  <td className="description">
                    <Tippy content={item.userEmail || ""} placement="top">
                      <span>
                        {item.userEmail?.length > 20
                          ? item.userEmail.substring(0, 20) + "..."
                          : item.userEmail || ""}
                      </span>
                    </Tippy>
                  </td>

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
                    <button
                      className="edit-btn"
                      onClick={() => handleEditRow(item)}
                    >
                      <FaEdit style={{ width: "20px", height: "20px" }} />
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
              <button
                className="close-btn"
                onClick={() => setEditModalData(null)}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            <div className="schedule-form">
              <p className="sub-title">Maintenance Detail</p>
              <div className="modal-content-field">
                <label htmlFor="">Description: </label>
                <input
                  type="text"
                  value={editModalData.description}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Assign: </label>
                <div style={{ width: "100%", maxWidth: "350px" }}>
                  <Select
                    classNamePrefix="custom-select-department"
                    className="workstatus-dropdown"
                    options={workersList}
                    value={
                      workersList.find(
                        (worker) => worker.value === editModalData.userID
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setEditModalData({
                          ...editModalData,
                          userID: selectedOption.value, // Set the userID
                          userEmail: selectedOption.label, // Optionally keep email for display
                        });
                        setUserID(selectedOption.value);
                        setEmail(selectedOption.label);
                      } else {
                        setEditModalData({
                          ...editModalData,
                          userID: "",
                          userEmail: "",
                        });
                        setUserID(null);
                      }
                    }}
                    placeholder="Select worker"
                    isClearable
                    isSearchable
                    noOptionsMessage={() =>
                      "No workers found for this department"
                    }
                  />
                </div>
              </div>

              <p className="sub-title">Schedule Maintenance Notification</p>
              <div className="modal-content-field">
                <label htmlFor="">From date: </label>
                <input
                  type="date"
                  value={editModalData.startDate}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Schedule time: </label>
                <input
                  type="time"
                  value={editModalData.timeStart}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      timeStart: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Repeats: </label>
                <input
                  type="text"
                  value={editModalData.repeat}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      repeat: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">To date: </label>
                <input
                  type="date"
                  value={editModalData.endDate}
                  onChange={(e) =>
                    setEditModalData({
                      ...editModalData,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* <button className="save-btn" onClick={handleSaveEdit}>Save</button> */}

            {statusPending === "Pending" && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PMaintenance;
