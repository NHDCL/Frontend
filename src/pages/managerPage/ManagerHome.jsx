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
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  useGetRepairRequestQuery,
  useAcceptOrRejectRepairRequestMutation,
} from "../../slices/maintenanceApiSlice";
import { useGetUserByEmailQuery } from "../../slices/userApiSlice";
import Tippy from "@tippyjs/react";

const ManagerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const rowsPerPage = 10;

  const { data: repairRequest, refetch: refetchRepairRequest } =
    useGetRepairRequestQuery();
  const [acceptOrRejectRepairRequest, { isLoading, error, isSuccess }] =
    useAcceptOrRejectRepairRequestMutation();

  const selectUserInfo = (state) => state.auth.userInfo || {};

  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );
  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const [data, setData] = useState([]);
  console.log("data: ", data);

  useEffect(() => {
    if (!repairRequest || !userByEmial) return;

    // console.log("User Email:", email);
    // console.log("User Academy ID:", userByEmial?.user.academyId);

    const userAcademy = userByEmial?.user.academyId?.trim().toLowerCase();

    const filtered = repairRequest.filter((req) => {
      console.log("Request Academy ID:", req.academyId); // Log each one
      const requestAcademy = req.academyId?.trim().toLowerCase();
      return requestAcademy === userAcademy && req.accept === null;
    });

    console.log("Filtered Length:", filtered.length);
    setData(
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
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
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, accept it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await acceptOrRejectRepairRequest({
          repairId,
          accept: acceptValue,
        }).unwrap();

        console.log("Server response:", response);

        await Swal.fire({
          title: "Accepted!",
          text: "Successed mail successfully sent to user.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        handleCloseModal();
        refetchRepairRequest();
      } catch (err) {
        console.error("Error:", err);
        Swal.fire("Error", "Failed to update repair request.", "error");
      }
    }
  };

  const handleReject = async (repairId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to reject this repair request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reject it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await acceptOrRejectRepairRequest({
          repairId,
          accept: false, // Set accept to false to reject
        }).unwrap();

        console.log("Server response:", response);

        await Swal.fire({
          title: "Rejected!",
          text: "Repair request has been rejected successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Close the modal after success
        handleCloseModal(); // Add this line to close the modal

        refetchRepairRequest();
      } catch (err) {
        console.error("Error:", err);
        Swal.fire("Error", "Failed to update repair request.", "error");
      }
    } else {
      // Close the modal if the user cancels the rejection
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
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };
  const handleDeleteRow = (repairID) => {
    const updatedData = data.filter((item) => item.repairID !== repairID);
    setData(updatedData);
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
            <p className="count">45</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Supervisor Count</h3>
            <p className="count">45</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Asset Count</h3>
            <p className="count">56</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Repair Request</h3>
            <p className="count">78</p>
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
                    {header === "Asset Name" || header === "Location" ? (
                      <div className="header-title">
                        {header}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() =>
                              handleSort("assetName" || "Location")
                            }
                          >
                            <TiArrowSortedUp
                              style={{
                                color: "#305845",
                                transform:
                                  (sortOrder.column === "assetName" ||
                                    sortOrder.column === "Location") &&
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
              {/* <div className="modal-content-field">
                <label>RID</label>
                <input type="text" value={modalData.rid} readOnly />
              </div> */}

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
                <input type="text" value={modalData.priority} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <textarea value={modalData.description} readOnly />
              </div>
              {/* <div className="modal-content-field">
                <label>Image:</label>
                <div className="profile-img">
                  {modalData.images ? (
                    <img
                      src={modalData.images[0]}
                      alt="Asset"
                      className="modal-image"
                    />
                  ) : (
                    <div className="image-upload">
                      <span>📷</span>
                      <p>Click Here to Upload Image</p>
                    </div>
                  )}
                </div>
              </div> */}
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
                  disabled={isLoading}
                >
                  {/* Accept */}
                  {isLoading ? "Accepting.." : "Accept   "}{" "}
                </button>

                <button
                  className="reject-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleReject(modalData.repairID, false);
                  }}
                  disabled={isLoading}
                >
                  {/* Reject */}
                  {isLoading ? "Rejecting.." : "Reject"}{" "}
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
