import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../AssetCategory";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import {
  useGetAssetByAcademyQuery,
  usePostUploadImagesMutation,
  usePostAssetMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";

const Landscaping = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalData, setModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [postAsset, { isLoading: isLoading2 }] = usePostAssetMutation();
  const [newLandscaping, setNewLandscaping] = useState({
    title: "",
    assetCode: "",
    acquireDate: "",
    lifespan: "",
    status: "",
    cost: "",
    assetArea: "",
    Size: "",
  });

  const [academyId, setAcademyId] = useState("67f017257d756710a12c2fa7");
  const [scheduleModalData, setScheduleModalData] = useState(null);
  const { data: assets, refetch } = useGetAssetByAcademyQuery(academyId);
  const [data, setData] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [postUploadImages, { isLoading, error }] =
    usePostUploadImagesMutation();

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.categoryDetails?.name === category
      );
      setData(filteredAssets);
    }
  }, [assets]);

  const CategoryId = data.length > 0 ? data[0]?.categoryDetails?.id : null;

  const rowsPerPage = 10;

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus =
      selectedStatus === "" || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRows.includes(item.AID)));
    setSelectedRows([]);
  };

  const handleView = (item) => {
    setModalData(item);
  };

  const handleScheduleMaintenance = () => {
    if (!modalData) return; // Optional: prevent errors if modalData is undefined

    setScheduleModalData({
      Description: modalData.Description || "",
      Assign: modalData.Assign || "",
      Lastworkorder: modalData.Lastworkorder || "",
      Schedule: modalData.Schedule || "",
      Nextworkorder: modalData.Nextworkorder || "",
    });
  };

  // Function to get the class based on workstatus
  const getStatusClass = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In-maintenance-status";
      case "In Usage":
        return "in-usage-status";
      case "Disposed":
        return "disposed-status";
      case "Pending":
        return "Pending-status";
      default:
        return "";
    }
  };
  // Extract unique work statuses from data
  const uniqueStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.status))).map((status) => ({
      value: status,
      label: status,
    })),
  ];
  const handleCloseModal = () => {
    setModalData(null);
  };

  const handleAddLandscaping = () => {
    setShowAddModal(true);
  };

  const handleSaveNewLandscaping = async () => {
      const payload = {
        assetCode: newLandscaping.assetCode,
        title: newLandscaping.title,
        cost: Number(newLandscaping.cost),
        acquireDate: newLandscaping.acquireDate,
        lifespan: newLandscaping.lifespan,
        assetArea: newLandscaping.assetArea,
        description: newLandscaping.description,
        status: "Pending",
        createdBy: "Admin",
        deletedBy: null,
        academyID: "67f017257d756710a12c2fa7",
        assetCategoryID: CategoryId,
        attributes: [
          { name: "Size", value: newLandscaping.Size }
        ],
      };
  
      try {
        const res = await postAsset(payload).unwrap();
        const assetId = res.assetID;
  
        if (selectedFiles.length > 0) {
          const formData = new FormData();
    
          // Ensure images is an array of File objects before calling forEach
          if (
            !Array.isArray(selectedFiles) ||
            !selectedFiles.every((file) => file instanceof File)
          ) {
            console.error(
              "selectedFiles is not an array of File objects",
              selectedFiles
            );
            return;
          }
    
          // Append assetID to FormData
          formData.append("assetID", assetId); // Make sure assetID is an integer
    
          // Append files to FormData
          selectedFiles.forEach((file) => {
            console.log("Appending file to formData:", file); // Check the file type
            if (file instanceof File) {
              formData.append("images", file); // Append only if it's a valid file
            } else {
              console.error("Invalid file detected:", file);
            }
          });
    
          // Call the mutation
          await postUploadImages(formData);
        }
        Swal.fire({
          icon: "success",
          title: "Asset created successfully!",
          confirmButtonColor: "#305845",
        });
        refetch();
        setNewLandscaping({
          title: "",
          assetCode: "",
          acquireDate: "",
          lifespan: "",
          status: "",
          cost: "",
          assetArea: "",
          Size: "",
        });
        setSelectedFiles([]); // Clear the selected files
        fileInputRef.current.value = null;
        setShowAddModal(false);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed to create asset",
          text: err?.data?.message || "Something went wrong!",
          confirmButtonColor: "#897463",
        });
      }
    };

  const handleFileSelection = (e) => {
    const newFiles = [...e.target.files];
    const totalFiles = newFiles.length + selectedFiles.length;

    if (totalFiles > 5) {
      // Show SweetAlert with a custom message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You can only select up to 5 images!",
        confirmButtonText: "OK",
      }).then(() => {
        // Clear the input and reset the selected files state
        fileInputRef.current.value = null;
      });
      return;
    }

    // Add the selected files to the state
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleUploadButtonClick = (assetID) => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();

      // Ensure images is an array of File objects before calling forEach
      if (
        !Array.isArray(selectedFiles) ||
        !selectedFiles.every((file) => file instanceof File)
      ) {
        console.error(
          "selectedFiles is not an array of File objects",
          selectedFiles
        );
        return;
      }

      // Append assetID to FormData
      formData.append("assetID", assetID); // Make sure assetID is an integer

      // Append files to FormData
      selectedFiles.forEach((file) => {
        console.log("Appending file to formData:", file); // Check the file type
        if (file instanceof File) {
          formData.append("images", file); // Append only if it's a valid file
        } else {
          console.error("Invalid file detected:", file);
        }
      });

      // Call the mutation
      postUploadImages(formData)
        .unwrap()
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Upload Successful!",
            text: "Your images have been uploaded.",
          });
          setSelectedFiles([]); // Clear the selected files
          fileInputRef.current.value = null; // Reset the input value
          refetch();
          setModalData(null);
        })
        .catch((error) => {
          console.log("Error uploading files:", error);
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: error?.message || "An error occurred during upload.",
          });
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Files Selected",
        text: "Please select at least one file to upload.",
      });
    }
  };

  const handleDownloadAllImages = () => {
    const imageUrls = modalData.attributes
      .filter((attr) => attr.name.startsWith("image")) // Filter image attributes
      .map((imageAttr) => imageAttr.value); // Get the image URLs

    imageUrls.forEach((imageUrl) => {
      // Create a link element for downloading each image
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop(); // Download the file with its original name

      // Fetch the image as a Blob and trigger the download
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.click(); // Trigger the download
          URL.revokeObjectURL(objectURL); // Clean up
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
        });
    });
  };

  return (
    <div className="managerDashboard">
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
            options={uniqueStatuses}
            value={uniqueStatuses.find(
              (option) => option.value === selectedStatus
            )}
            onChange={(selectedOption) => {
              setSelectedStatus(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            isSearchable={false}
          />
          <div className="create-category-btn">
            <ImFolderDownload
              style={{ color: "#ffffff", marginLeft: "12px" }}
            />
            <button className="category-btn">Bulk Import</button>
          </div>
          <div className="create-category-btn">
            <IoMdAdd style={{ color: "#ffffff", marginLeft: "12px" }} />
            <button className="category-btn" onClick={handleAddLandscaping}>
              Create Asset
            </button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="table-container">
        <table className="RequestTable">
          <thead className="table-header">
            <tr>
              {[
                "SI.No",
                "Asset Code",
                "Title",
                "Acquire Date",
                "Useful Life(year)",
                "Size",
                "Depreciated Value (%)",
                "Status",
              ].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>
                {selectedRows.length > 0 && (
                  <button
                    className="delete-all-btn"
                    onClick={handleDeleteSelected}
                  >
                    <RiDeleteBin6Line
                      style={{ width: "20px", height: "20px", color: "red" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => {
              // Extract values from `attributes`
              const sizeAttr = item.attributes.find(
                (attr) => attr.name === "Size"
              );
              const size = sizeAttr ? sizeAttr.value : "N/A";
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.assetCode}</td>
                  <td>{item.title}</td>
                  <td>{item.acquireDate}</td>
                  <td>{item.lifespan}</td>
                  <td>{size}</td>
                  <td>{item.categoryDetails?.depreciatedValue}</td>
                  <td>
                    <div className={getStatusClass(item.status)}>
                      {item.status}
                    </div>
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
              );
            })}
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

      {/* Add Landscaping Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Create Asset</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Title:</label>
                <input
                  type="text"
                  value={newLandscaping.title}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input
                  type="text"
                  value={newLandscaping.assetCode}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      assetCode: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Category:</label>
                <input
                  type="text"
                  value={category}
                  readOnly
                />
              </div>

              <div className="modal-content-field">
                <label>Size:</label>
                <input
                  type="text"
                  value={newLandscaping.Size}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      Size: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="date"
                  value={newLandscaping.acquireDate}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      acquireDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Useful Life (Year):</label>
                <input
                  type="text"
                  value={newLandscaping.lifespan}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      lifespan: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Cost:</label>
                <input
                  type="text"
                  value={newLandscaping.cost}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      cost: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input
                  type="text"
                  value={newLandscaping.assetArea}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      assetArea: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <input
                  type="text"
                  value={newLandscaping.description}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Images:</label>
                <div className="image-field">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelection}
                    ref={fileInputRef}
                  />
                </div>
              </div>
              <div className="modal-actions">
              <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleSaveNewLandscaping}
                  disabled={isLoading || isLoading2}
                >
                  {(isLoading || isLoading2) ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Asset Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
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
                    modalData?.attributes?.find((attr) => attr.name === "Size")
                      ?.value || "N/A"
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

              <div className="modal-content-field">
                <label>Images:</label>
                {modalData &&
                modalData.attributes &&
                modalData.attributes.filter((attr) =>
                  attr.name.startsWith("image")
                ).length > 0 ? (
                  <div className="image-gallery">
                    {modalData.attributes
                      .filter((attr) => attr.name.startsWith("image"))
                      .map((imageAttr, index) => (
                        <div key={index} className="image-container">
                          <img
                            src={imageAttr.value}
                            alt={`Asset Image ${index + 1}`}
                            className="asset-image"
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="inputImage">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelection}
                      ref={fileInputRef}
                    />
                  </div>
                )}
              </div>
              {/* Other fields here */}

              <div className="modal-buttons">
                <button
                  type="button"
                  className="accept-btn"
                  style={{ backgroundColor: "red" }}
                >
                  <RiDeleteBin6Line />
                </button>

                <button
                  type="button" // Prevents form submission
                  className="accept-btn"
                  onClick={handleScheduleMaintenance}
                >
                  Schedule Maintenance
                </button>

                {/* Align Download Button with Schedule Maintenance */}
                <div className="align-buttons">
                  {modalData.attributes &&
                  modalData.attributes.some((attr) =>
                    attr.name.startsWith("image")
                  ) ? (
                    <button
                      type="button"
                      className="download-all-btn"
                      onClick={handleDownloadAllImages}
                    >
                      Download All Images
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="download-all-btn"
                        onClick={() =>
                          handleUploadButtonClick(modalData.assetID)
                        }
                        disabled={isLoading}
                      >
                        {isLoading ? "Uploading..." : "Upload Images"}{" "}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landscaping;
