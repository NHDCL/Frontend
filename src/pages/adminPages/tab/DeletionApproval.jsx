import React, { useEffect, useState, useRef } from "react";
import "./../../managerPage/css/card.css";
import "./../../managerPage/css/table.css";
import "./../../managerPage/css/form.css";
import "./../../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
// import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetAssetQuery,
  useHandleAssetDeletionMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";
import Tippy from "@tippyjs/react";

const DeletionApproval = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const { data: assets, refetch } = useGetAssetQuery();
  const [data, setData] = useState([]);
  const [isDeclining, setIsDeclining] = useState(false);
  const [handleAssetDeletion, { isLoading }] = useHandleAssetDeletionMutation();
  const [loadingApprove, setLoadingApprove] = useState(false);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.status === "Pending" && asset.deleted === true
      );
      setData(filteredAssets);
    }
  }, [assets]);
  const rowsPerPage = 10;

  const sortedData = [...data].sort((a, b) => b.rid - a.rid);

  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleInputChange = (e, field) => {
    setModalData({ ...modalData, [field]: e.target.value });
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.rid));
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

  // Ref for the modal
  const modalRef = useRef(null);

  const handleApprove = async (e) => {
    e.preventDefault();

    const assetCode = modalData.assetCode;
    const email = modalData.deletedBy;
    const action = "accept";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to approve this asset deletion request.",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, approve it!",
    });

    if (result.isConfirmed) {
      try {
        setLoadingApprove(true);
        const response = await handleAssetDeletion({
          assetCode,
          email,
          action,
        }).unwrap();
        refetch();
        setLoadingApprove(false);

        Swal.fire({
          icon: "success",
          title: "Asset deletion approved successfully!",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        handleCloseModal(); // close the modal if needed
      } catch (err) {
        setLoadingApprove(false);
        Swal.fire({
          icon: "error",
          title: "Approval Failed",
          text:
            err?.data?.message ||
            "Unable to approve the asset at this time. Please try again later.",
        });
      }
    }
  };

  const handleDecline = async (e) => {
    e.preventDefault();

    const assetCode = modalData.assetCode;
    const email = modalData.deletedBy;
    const action = "decline";
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to decline this asset deletion request.",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, decline it!",
    });

    if (result.isConfirmed) {
      try {
        setIsDeclining(true);
        const response = await handleAssetDeletion({
          assetCode,
          email,
          action,
        }).unwrap();
        refetch();
        setIsDeclining(false);

        Swal.fire({
          icon: "success",
          title: "Asset deletion declined successfully!",
          toast: true,
          position: "top-end",
          timer: 2000,
        });

        handleCloseModal(); // close the modal if needed
      } catch (err) {
        setIsDeclining(false);
        Swal.fire({
          icon: "error",
          title: "Decline Failed",
          text:
            err?.data?.message ||
            "An error occurred while declining the asset. Please try again later.",
        });
      }
    }
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
      column === sortOrder.column ? !sortOrder.ascending : true;

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
      {/* Home table */}
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
        </div>
        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                {[
                  { label: "Sl. No.", field: null }, // Usually index-based
                  { label: "Asset_Code", field: "assetCode" },
                  { label: "Asset Name", field: "title" },
                  { label: "Area", field: "assetArea" },
                  { label: "Requested By", field: "deleteBy" },
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
                      header.label // Non-sortable label like "Action"
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
                  <td>{item.assetCode}</td>

                  <td className="description">
                    <Tippy content={item.title || ""} placement="top">
                      <span>
                        {item.title?.length > 20
                          ? item.title.substring(0, 20) + "..."
                          : item.title || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.assetArea || ""} placement="top">
                      <span>
                        {item.assetArea?.length > 20
                          ? item.assetArea.substring(0, 20) + "..."
                          : item.assetArea || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.deletedBy || ""} placement="top">
                      <span>
                        {item.deletedBy?.length > 20
                          ? item.deletedBy.substring(0, 20) + "..."
                          : item.deletedBy || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="actions">
                    <button
                      style={{ marginLeft: "10px" }}
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
      </div>

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="form-h">Asset Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {modalData.categoryDetails?.name === "Building" && (
                <form className="repair-form">
                  <div className="modal-content-field">
                    <label>Asset Id:</label>
                    <input type="text" value={modalData.assetID} readOnly />
                  </div>

                  <div className="modal-content-field">
                    <label>Title:</label>
                    <input type="text" value={modalData.title} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Asset Code:</label>
                    <input type="email" value={modalData.assetCode} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Cost:</label>
                    <input type="text" value={modalData.cost} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Plint Area:</label>
                    <input
                      value={
                        modalData?.attributes?.find(
                          (attr) => attr.name === "Plint_area"
                        )?.value || "N/A"
                      }
                      readOnly
                    />
                  </div>

                  <div className="modal-content-field">
                    <label>Depreciated Value:</label>
                    <input
                      value={modalData.categoryDetails?.depreciatedValue}
                      readOnly
                    />
                  </div>

                  <div className="modal-content-field">
                    <label>Floors & Rooms:</label>
                    <div className="floor-room-list">
                      {(() => {
                        const floorAttr = modalData?.attributes?.find(
                          (attr) => attr.name === "Floor and rooms"
                        );
                        if (floorAttr) {
                          try {
                            const floorData = JSON.parse(floorAttr.value);
                            return Object.entries(floorData).map(
                              ([floorName, rooms]) => (
                                <div
                                  key={floorName}
                                  className="floor-room-item"
                                >
                                  <strong>{floorName}</strong>:{" "}
                                  {rooms.join(", ")}
                                </div>
                              )
                            );
                          } catch (error) {
                            return <span>Invalid floor data</span>;
                          }
                        }
                        return <span>N/A</span>;
                      })()}
                    </div>
                  </div>
                  <div className="modal-content-field">
                    <label>Acquired Date:</label>
                    <input
                      type="text"
                      value={formatDate(modalData.acquireDate)}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Useful Life(Years):</label>
                    <input value={modalData.lifespan} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Status:</label>
                    <input value={modalData.status} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Category:</label>
                    <input value={modalData.categoryDetails?.name} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Area:</label>
                    <input value={modalData.assetArea} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Delete Request by:</label>
                    <input value={modalData.deletedBy} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Description: </label>
                    <textarea value={modalData.description} readOnly />
                  </div>
                  <div className="modal-buttons">
                    <button
                      className="accept-btn"
                      onClick={handleApprove}
                      disabled={loadingApprove}
                    >
                      {loadingApprove ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      className="reject-btn"
                      onClick={handleDecline}
                      disabled={isDeclining}
                    >
                      {isDeclining ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </form>
              )}

              {(modalData.categoryDetails?.name === "Landscaping" ||
                modalData.categoryDetails?.name === "Facility" ||
                modalData.categoryDetails?.name === "Infrastructure") && (
                <form className="repair-form">
                  <div className="modal-content-field">
                    <label>Asset Id:</label>
                    <input type="text" value={modalData.assetID} readOnly />
                  </div>

                  <div className="modal-content-field">
                    <label>Title:</label>
                    <input type="text" value={modalData.title} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Asset Code:</label>
                    <input type="email" value={modalData.assetCode} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Size</label>
                    <input
                      type="text"
                      value={
                        modalData?.attributes?.find(
                          (attr) => attr.name === "Size"
                        )?.value || "N/A"
                      }
                      readOnly
                    />
                  </div>

                  <div className="modal-content-field">
                    <label>Cost:</label>
                    <input type="text" value={modalData.cost} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Depreciated Value:</label>
                    <input
                      value={modalData.categoryDetails?.depreciatedValue}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Acquired Date:</label>
                    <input
                      type="text"
                      value={formatDate(modalData.acquireDate)}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Useful Life(Years):</label>
                    <input value={modalData.lifespan} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>status:</label>
                    <input value={modalData.status} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>category:</label>
                    <input value={modalData.categoryDetails?.name} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Area:</label>
                    <input value={modalData.assetArea} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Created by</label>
                    <input value={modalData.createdBy} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Description: </label>
                    <textarea value={modalData.description} readOnly />
                  </div>
                  <div className="modal-buttons">
                    <button
                      className="accept-btn"
                      onClick={handleApprove}
                      disabled={loadingApprove}
                    >
                      {loadingApprove ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      className="reject-btn"
                      onClick={handleDecline}
                      disabled={isDeclining}
                    >
                      {isDeclining ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </form>
              )}

              {modalData.categoryDetails?.name === "Machinery" && (
                <form className="repair-form">
                  <div className="modal-content-field">
                    <label>Asset Id:</label>
                    <input type="text" value={modalData.assetID} readOnly />
                  </div>

                  <div className="modal-content-field">
                    <label>Title:</label>
                    <input type="text" value={modalData.title} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Asset Code:</label>
                    <input type="email" value={modalData.assetCode} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Serial Number:</label>
                    <input
                      type="text"
                      value={
                        modalData?.attributes?.find(
                          (attr) => attr.name === "Serial_number"
                        )?.value || "N/A"
                      }
                      readOnly
                    />
                  </div>

                  <div className="modal-content-field">
                    <label>Cost:</label>
                    <input type="text" value={modalData.cost} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Depreciated Value:</label>
                    <input
                      value={modalData.categoryDetails?.depreciatedValue}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Acquired Date:</label>
                    <input
                      type="text"
                      value={formatDate(modalData.acquireDate)}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Useful Life(Years):</label>
                    <input value={modalData.lifespan} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Status:</label>
                    <input value={modalData.status} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Category:</label>
                    <input value={modalData.categoryDetails?.name} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Area:</label>
                    <input value={modalData.assetArea} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Created by</label>
                    <input value={modalData.createdBy} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Description: </label>
                    <textarea value={modalData.description} readOnly />
                  </div>
                  <div className="modal-buttons">
                    <button
                      className="accept-btn"
                      onClick={handleApprove}
                      disabled={loadingApprove}
                    >
                      {loadingApprove ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      className="reject-btn"
                      onClick={handleDecline}
                      disabled={isDeclining}
                    >
                      {isDeclining ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </form>
              )}

              {/* For other categories */}
              {![
                "Building",
                "Landscaping",
                "Facility",
                "Infrastructure",
                "Machinery",
              ].includes(modalData.categoryDetails?.name) && (
                <form className="repair-form">
                  <div className="modal-content-field">
                    <label>Asset Id:</label>
                    <input type="text" value={modalData.assetID} readOnly />
                  </div>

                  <div className="modal-content-field">
                    <label>Title:</label>
                    <input type="text" value={modalData.title} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Asset Code:</label>
                    <input type="email" value={modalData.assetCode} readOnly />
                  </div>

                  <div className="modal-content-field">
                    <label>Cost:</label>
                    <input type="text" value={modalData.cost} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Depreciated Value:</label>
                    <input
                      value={modalData.categoryDetails?.depreciatedValue}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Acquired Date:</label>
                    <input
                      type="text"
                      value={formatDate(modalData.acquireDate)}
                      readOnly
                    />
                  </div>
                  <div className="modal-content-field">
                    <label>Useful Life(Years):</label>
                    <input value={modalData.lifespan} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Status:</label>
                    <input value={modalData.status} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Category:</label>
                    <input value={modalData.categoryDetails?.name} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Area:</label>
                    <input value={modalData.assetArea} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Created by</label>
                    <input value={modalData.createdBy} readOnly />
                  </div>
                  <div className="modal-content-field">
                    <label>Description: </label>
                    <textarea value={modalData.description} readOnly />
                  </div>
                  <div className="modal-buttons">
                    <button
                      className="accept-btn"
                      onClick={handleApprove}
                      disabled={loadingApprove}
                    >
                      {loadingApprove ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      className="reject-btn"
                      onClick={handleDecline}
                      disabled={isDeclining}
                    >
                      {isDeclining ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletionApproval;
