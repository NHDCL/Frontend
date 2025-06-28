import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { IoIosCloseCircle } from "react-icons/io";
import { TiArrowSortedUp } from "react-icons/ti";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  useGetRepairRequestQuery,
  useAcceptOrRejectRepairRequestMutation,
  useUpdateRepairByIdMutation,
} from "../../slices/maintenanceApiSlice";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
} from "../../slices/userApiSlice";
import { useGetAssetQuery } from "../../slices/assetApiSlice";
import Tippy from "@tippyjs/react";

const priorities = [
  { value: "Immediate", label: "Immediate (Within 24 hours)" },
  { value: "High", label: "High (Within 1-2 days)" },
  { value: "Moderate", label: "Moderate (Within 1 week)" },
  { value: "Low", label: "Low (More than a week)" },
];
const ManagerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const rowsPerPage = 10;

  const { data: repairRequest, refetch: refetchRepairRequest } =
    useGetRepairRequestQuery();

  const [acceptRepairRequest, { isLoading: isLoadingA }] =
    useAcceptOrRejectRepairRequestMutation();
  const [rejectRepairRequest, { isLoading: isLoadingB }] =
    useAcceptOrRejectRepairRequestMutation();

  const selectUserInfo = (state) => state.auth.userInfo || {};

  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
  );
  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const academyId = userByEmial?.user?.academyId;

  const { data: users, isLoading: usersLoading } = useGetUsersQuery();
  const { data: asset } = useGetAssetQuery();

  const filteredUsers = users?.filter(
    (user) =>
      user.academyId === academyId &&
      typeof user.role?.name === "string" &&
      user.role.name.toLowerCase() === "technician"
  );

  const totalRepair = repairRequest?.filter(
    (req) => req.academyId === academyId && req.accept === true
  );

  const SupervisorsUsers = users?.filter(
    (user) =>
      user.academyId === academyId &&
      typeof user.role?.name === "string" &&
      user.role.name.toLowerCase() === "supervisor"
  );

  const assets = asset?.filter((ass) => ass.academyID === academyId);

  const [data, setData] = useState([]);

  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [editablePriority, setEditablePriority] = useState(null);

  const [updateRepairById, { isLoading: isUpdating }] =
    useUpdateRepairByIdMutation();

  useEffect(() => {
    if (modalData) {
      setEditablePriority(
        priorities.find((p) => p.value === modalData.priority) || null
      );
      setIsEditingPriority(false); // reset edit mode
    }
  }, [modalData]);

  useEffect(() => {
    if (!repairRequest || !userByEmial) return;

    const userAcademy = userByEmial.user.academyId?.trim().toLowerCase();

    const filtered = repairRequest.filter((req) => {
      const requestAcademy = req.academyId?.trim().toLowerCase();
      return requestAcademy === userAcademy && req.accept === null;
    });

    const sortedFiltered = filtered.sort((a, b) =>
      b.repairID.localeCompare(a.repairID)
    );

    setData(sortedFiltered);
  }, [repairRequest, userByEmial]);

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

  const handleAccept = async (repairId, acceptValue) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to accept this repair request?",
      icon: "question",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, accept it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await acceptRepairRequest({
          repairId,
          accept: acceptValue,
        }).unwrap();

        await Swal.fire({
          icon: "success",
          title: "Mail sent successfully to the user.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        handleCloseModal();
        refetchRepairRequest();
      } catch (err) {
        console.error("Error:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Unable to update the repair request at this time. Please try again later.",
        });
      }
    }
  };

  const handleReject = async (repairId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to reject this repair request?",
      icon: "question",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, reject it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await rejectRepairRequest({
          repairId,
          accept: false,
        }).unwrap();

        await Swal.fire({
          icon: "success",
          title: "Repair request rejected successfully.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        handleCloseModal();
        refetchRepairRequest();
      } catch (err) {
        console.error("Error:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "We couldn’t update the repair request at this time. Please try again later.",
        });
      }
    } else {
      handleCloseModal();
    }
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

  // Extract unique priorities from data
  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(
        data.map((item) => item.priority?.toLowerCase()).filter(Boolean) // remove undefined/null
      )
    ).map((priority) => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1), // Capitalize first letter
    })),
  ];

  // const sortedData = [...data].sort((a, b) => b.rid - a.rid);

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPriority =
      selectedPriority === "" ||
      item.priority?.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteSelected = () => {
    const updatedData = data.filter(
      (item) => !selectedRows.includes(item.repairID)
    );
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };

  const handleView = (item) => {
    setModalData(item);
  };
  const handleCloseModal = () => {
    setModalData(null);
  };

  return (
    <div className="ManagerDashboard">
      <div className="cardwrap">
        {/* Card counts */}
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Technician Count</h3>
            <p className="count">{filteredUsers?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Supervisor Count</h3>
            <p className="count">{SupervisorsUsers?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Asset Count</h3>
            <p className="count">{assets?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Repair Request</h3>
            <p className="count">{totalRepair?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Home table */}
      <h3 className="heading">Latest request</h3>
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

          {/* Priority Dropdown */}
          <Select
            classNamePrefix="custom-select"
            className="priority-dropdown"
            options={uniquePriorities}
            value={uniquePriorities.find(
              (option) => option.value === selectedPriority
            )} // Ensure selected value is an object
            onChange={(selectedOption) => {
              if (selectedOption) {
                setSelectedPriority(selectedOption.value);
              } else {
                setSelectedPriority(""); // Clear the selected priority when null
              }
            }}
            isClearable
            isSearchable={false}
          />
        </div>
        <div className="table-container">
          <table
            className="RequestTable"
            style={{ width: "100% ", minWidth: "800px" }}
          >
            <thead className="table-header">
              <tr>
                {[
                  "RID",
                  "Asset Name",
                  "Name",
                  "Phone Number",
                  "Area",
                  "Description",
                ].map((header, index) => (
                  <th key={index}>
                    {header === "Asset Name" || header === "Name" ? (
                      <div className="header-title">
                        {header}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() => handleSort("assetName" || "Name")}
                          >
                            <TiArrowSortedUp
                              style={{
                                color: "#305845",
                                transform:
                                  (sortOrder.column === "assetName" ||
                                    sortOrder.column === "Name") &&
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
                      header
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>

            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
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
                    <Tippy content={item.name || ""} placement="top">
                      <span>
                        {item.name?.length > 20
                          ? item.name.substring(0, 20) + "..."
                          : item.name || ""}
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
                  <td className="description">
                    <Tippy content={item.description || ""} placement="top">
                      <span>
                        {item.description?.length > 20
                          ? item.description.substring(0, 20) + "..."
                          : item.description || ""}
                      </span>
                    </Tippy>
                  </td>

                  <td className="actions">
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
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
        {selectedRows.length > 0 && (
          <button
            className="delete-selected-btn"
            onClick={handleDeleteSelected}
          ></button>
        )}
      </div>

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Repair Request</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <form className="repair-form">
              <div className="modal-content-field">
                <label>Name:</label>
                <input type="text" value={modalData.name} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Phone Number:</label>
                <input type="text" value={modalData.phoneNumber} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Email:</label>
                <input type="email" value={modalData.email} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Area:</label>
                <input type="text" value={modalData.area} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Name:</label>
                <input type="text" value={modalData.assetName} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Priority:</label>

                {!isEditingPriority ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      width: "100%",
                      maxWidth: "350px",
                    }}
                  >
                    <span
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #897463",
                        borderRadius: "10px",
                        fontSize: "13px",
                      }}
                    >
                      {editablePriority?.label || "Not Set"}
                    </span>
                    <button
                      className="accept-btn"
                      type="button"
                      onClick={() => setIsEditingPriority(true)}
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      maxWidth: "350px",
                      width: "100%",
                    }}
                  >
                    <Select
                      classNamePrefix="custom-select-department"
                      className="workstatus-dropdown"
                      options={priorities}
                      value={editablePriority}
                      onChange={(selected) => setEditablePriority(selected)}
                      placeholder="Select priority"
                      isClearable
                    />
                    <div style={{ gap: "1rem" }}>
                      <button
                        className="accept-btn"
                        type="button"
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Are you sure?",
                            text: `Update priority to "${editablePriority?.label}"?`,
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#315845",
                            cancelButtonColor: "#897463",
                            confirmButtonText: "Yes, save it!",
                          });

                          if (result.isConfirmed && editablePriority) {
                            await updateRepairById({
                              repairID: modalData.repairID,
                              updateFields: {
                                priority: editablePriority.value,
                              },
                            });
                            Swal.fire({
                              icon: "success",
                              title: "Priority updated successfully.",
                              toast: true,
                              position: "top-end",
                              showConfirmButton: false,
                              timer: 1500,
                            });

                            setIsEditingPriority(false);
                            refetchRepairRequest();
                          }
                        }}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Saving..." : "Save"}
                      </button>

                      <button
                        className="reject-btn"
                        type="button"
                        onClick={() => {
                          setEditablePriority(
                            priorities.find(
                              (p) => p.value === modalData.priority
                            ) || null
                          );
                          setIsEditingPriority(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <textarea value={modalData.description} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Repaired Images:</label>
                <div className="TModal-profile-img">
                  {Array.isArray(modalData.images) &&
                  modalData.images.length > 0 ? (
                    modalData.images.map((imgSrc, index) => (
                      <img
                        key={index}
                        src={imgSrc}
                        alt={`Work Order ${index + 1}`}
                        className="TModal-modal-image"
                      />
                    ))
                  ) : modalData.images ? (
                    // If imageUrl is a string, display it as a single image
                    <img
                      src={modalData.images}
                      alt="Work Order"
                      className="TModal-modal-image"
                    />
                  ) : (
                    <p>No image available</p>
                  )}
                </div>
              </div>
              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAccept(modalData.repairID, true);
                  }}
                  disabled={isLoadingA}
                >
                  {isLoadingA ? "Accepting..." : "Accept"}
                </button>

                <button
                  className="reject-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleReject(modalData.repairID);
                  }}
                  disabled={isLoadingB}
                >
                  {isLoadingB ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
