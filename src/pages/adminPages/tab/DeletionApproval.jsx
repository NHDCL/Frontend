import React, { useEffect, useState, useRef } from "react";
import "./../../managerPage/css/card.css";
import "./../../managerPage/css/table.css";
import "./../../managerPage/css/form.css";
import "./../../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
// import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import {
  useGetAssetQuery,
  useHandleAssetDeletionMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";

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
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
          title: "Approved!",
          text: response.message,
          timer: 2000,
          showConfirmButton: false,
        });

        handleCloseModal(); // close the modal if needed
      } catch (err) {
        setLoadingApprove(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err?.data?.message || "Failed to approve asset.",
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
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
          title: "Declined!",
          text: response.message,
          timer: 2000,
          showConfirmButton: false,
        });

        handleCloseModal(); // close the modal if needed
      } catch (err) {
        setIsDeclining(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err?.data?.message || "Failed to approve asset.",
        });
      }
    }
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
                  "Sl. No.",
                  "Asset_Code",
                  "Asset Name",
                  "Area",
                  "Requested By",
                ].map((header, index) => (
                  <th key={index}>{header}</th>
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
                  <td>{item.title}</td>
                  <td>{item.assetArea}</td>
                  <td>{item.deletedBy}</td>
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
                    <input type="text" value={modalData.acquireDate} readOnly />
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
                    <input type="text" value={modalData.acquireDate} readOnly />
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
                    <input type="text" value={modalData.acquireDate} readOnly />
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
                    <input type="text" value={modalData.acquireDate} readOnly />
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
