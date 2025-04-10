import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import {
  useGetAssetByAcademyQuery,
  usePostUploadImagesMutation,
  usePostAssetMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";

const Building = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [modalData, setModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [postAsset, { isLoading: isLoading2 }] = usePostAssetMutation();
  const [newBuilding, setNewBuilding] = useState({
    title: "",
    assetCode: "",
    acquireDate: "",
    lifespan: "",
    status: "",
    cost: "",
    assetArea: "",
    PlintArea: "",
  });
  const [floorAndRooms, setFloorAndRooms] = useState({});
  const [floorInput, setFloorInput] = useState("");
  const [roomInput, setRoomInput] = useState("");
  // const [scheduleModalData, setScheduleModalData] = useState(null);
  const [jsonData, setJson] = useState("");
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

  const addRoom = () => {
    if (floorInput.trim() && roomInput.trim()) {
      setFloorAndRooms((prev) => {
        const updatedRooms = { ...prev };
        if (!updatedRooms[floorInput]) {
          updatedRooms[floorInput] = [];
        }
        updatedRooms[floorInput].push(roomInput);
        setJson(JSON.stringify(updatedRooms, null, 2)); // Update the jsonData
        return updatedRooms;
      });
      setRoomInput(""); // Clear room input
    }
  };

  const styles = {
    textArea: {
      width: "100%",
      height: "120px",
      padding: "10px",
      fontSize: "14px",
      background: "#f8f8f8",
      border: "1px solid #ddd",
      borderRadius: "4px",
      resize: "none",
      overflowY: "auto",
    },
    floorBlock: {
      marginBottom: "10px",
    },
    floorTitle: {
      fontWeight: "bold",
      fontSize: "14px",
      color: "#305845",
    },
    roomText: {
      fontSize: "13px",
      color: "#333",
      marginLeft: "10px",
    },
    noRoomText: {
      fontSize: "13px",
      color: "#888",
      fontStyle: "italic",
      marginLeft: "10px",
    },
    emptyMessage: {
      fontStyle: "italic",
      color: "#888",
      textAlign: "center",
    },
  };

  const rowsPerPage = 10;

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus =
      selectedStatus === "" || item.status === selectedStatus;

    const matchesBuilding =
      selectedBuilding === "" || item.title === selectedBuilding;

    const matchesFloor = selectedFloor === "" || item.Floor === selectedFloor;

    return matchesSearch && matchesStatus && matchesBuilding && matchesFloor;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteSelected = () => {
    setData(assets.filter((item) => !selectedRows.includes(item.AID)));
    setSelectedRows([]);
  };
  const handleView = (item) => {
    setModalData(item); // This will set the selected asset data for the modal
  };

  const handleCreateSchedule = () => {
    if (
      !scheduleModalData.Schedule ||
      !scheduleModalData.Lastworkorder ||
      !scheduleModalData.Nextworkorder ||
      !scheduleModalData.Assign
    ) {
      alert("Please fill out all fields before submitting.");
      return;
    }
  
    // If all fields are filled, process the schedule
    console.log("Creating schedule:", scheduleModalData);
  
    // Only close the modal AFTER schedule creation
    // setIsScheduleModalOpen(false); // Removed from here
    setScheduleModalData(null);
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
    setFloorAndRooms({});
  };

  const uniqueBuilding = [
    { value: "", label: "All buildings" },
    ...Array.from(new Set(data.map((item) => item.Title))).map((Title) => ({
      value: Title,
      label: Title,
    })),
  ];

  const uniqueFloors = [
    { value: "", label: "All Floors" },
    ...Array.from(
      new Set(
        data
          .filter(
            (item) => selectedBuilding === "" || item.Title === selectedBuilding
          )
          .map((item) => item.Floor)
      )
    ).map((floor) => ({
      value: floor,
      label: `Floor ${floor}`,
    })),
  ];
  const handleAddBuilding = () => {
    setShowAddModal(true);
  };

  const handleSaveNewBuilding = async () => {
    const payload = {
      assetCode: newBuilding.assetCode,
      title: newBuilding.title,
      cost: Number(newBuilding.cost),
      acquireDate: newBuilding.acquireDate,
      lifespan: newBuilding.lifespan,
      assetArea: newBuilding.assetArea,
      description: newBuilding.description,
      status: "Pending",
      createdBy: "Admin",
      deletedBy: null,
      academyID: "67f017257d756710a12c2fa7",
      assetCategoryID: CategoryId,
      attributes: [
        { name: "Plint_area", value: newBuilding.PlintArea },
        { name: "Floor and rooms", value: JSON.stringify(floorAndRooms) },
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
      setNewBuilding({
        title: "",
        assetCode: "",
        acquireDate: "",
        lifespan: "",
        status: "",
        cost: "",
        assetArea: "",
        PlintArea: "",
      });
      setSelectedFiles([]); // Clear the selected files
      fileInputRef.current.value = null;
      setFloorAndRooms({});
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

  // Sample workers list
  const workersList = [
    { value: "Worker A", label: "Worker A" },
    { value: "Worker B", label: "Worker B" },
    { value: "Worker C", label: "Worker C" },
  ];

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
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
            <button className="category-btn" onClick={handleAddBuilding}>
              Create Asset
            </button>
          </div>
        </div>
      </div>
      <div className="Building-sort">
        {/* Building Dropdown */}
        <Select
          classNamePrefix="custom-select-workstatus"
          className="workstatus-dropdown"
          options={uniqueBuilding}
          value={uniqueBuilding.find(
            (option) => option.value === selectedBuilding
          )}
          onChange={(selectedOption) => {
            setSelectedBuilding(selectedOption ? selectedOption.value : "");
            setSelectedFloor(""); // Reset floor selection when a new building is chosen
          }}
          isClearable
        />

        {/* Floor Dropdown (Only Shows if Building is Selected) */}
        {selectedBuilding && (
          <Select
            classNamePrefix="custom-select-workstatus"
            className="workstatus-dropdown"
            options={uniqueFloors}
            value={uniqueFloors.find(
              (option) => option.value === selectedFloor
            )}
            onChange={(selectedOption) => {
              setSelectedFloor(selectedOption ? selectedOption.value : "");
            }}
            isClearable
          />
        )}
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
                "Floors",
                "Plint_area(sq.,)",
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
              const plintAreaAttr = item.attributes.find(
                (attr) => attr.name === "Plint_area"
              );
              // const depreciatedValueAttr = item.attributes.find(
              //   (attr) => attr.name === "Depreciated_Value"
              // );
              const floorAttr = item.attributes.find(
                (attr) => attr.name === "Floor and rooms"
              );

              // Get values or fallback to 'N/A'
              const plintArea = plintAreaAttr ? plintAreaAttr.value : "N/A";
              // const depreciatedValue = depreciatedValueAttr
              //   ? depreciatedValueAttr.value
              //   : "N/A";
              const floorCount = floorAttr
                ? Object.keys(JSON.parse(floorAttr.value)).length
                : "N/A";

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.assetCode}</td>
                  <td>{item.title}</td>
                  <td>{item.acquireDate}</td>
                  <td>{item.lifespan}</td>
                  <td>{floorCount}</td> {/* Number of floors */}
                  <td>{plintArea}</td> {/* Plint area */}
                  <td>{item.categoryDetails?.depreciatedValue}</td>{" "}
                  {/* Depreciated value */}
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

      {/* Add Building Modal */}
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
                  value={newBuilding.title}
                  onChange={(e) =>
                    setNewBuilding({ ...newBuilding, title: e.target.value })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input
                  type="text"
                  value={newBuilding.assetCode}
                  onChange={(e) =>
                    setNewBuilding({
                      ...newBuilding,
                      assetCode: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Category:</label>
                <input type="text" value={category} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Plint Area(sq.m):</label>
                <input
                  type="text"
                  value={newBuilding.PlintArea}
                  onChange={(e) =>
                    setNewBuilding({
                      ...newBuilding,
                      PlintArea: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="date"
                  value={newBuilding.acquireDate}
                  onChange={(e) =>
                    setNewBuilding({
                      ...newBuilding,
                      acquireDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-content-field">
                <label>Useful Life (Year):</label>
                <input
                  type="text"
                  value={newBuilding.lifespan}
                  onChange={(e) =>
                    setNewBuilding({
                      ...newBuilding,
                      lifespan: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-content-field">
                <label>Cost:</label>
                <input
                  type="text"
                  value={newBuilding.cost}
                  onChange={(e) =>
                    setNewBuilding({ ...newBuilding, cost: e.target.value })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input
                  type="text"
                  value={newBuilding.assetArea}
                  onChange={(e) =>
                    setNewBuilding({
                      ...newBuilding,
                      assetArea: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <input
                  type="text"
                  value={newBuilding.description}
                  onChange={(e) =>
                    setNewBuilding({
                      ...newBuilding,
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

              <h3 style={{ color: "#305845", fontSize: "14px" }}>
                Floor and Room Data
              </h3>
              <div className="modal-content-field">
                <label>Floor Name:</label>
                <input
                  type="text"
                  value={newBuilding.Floor}
                  onChange={(e) => setFloorInput(e.target.value)}
                />
              </div>

              <div className="modal-content-field">
                <label>Room Name:</label>
                <div
                  style={{ display: "flex", width: "100%", maxWidth: "350px" }}
                >
                  <input
                    type="text"
                    // value={newBuilding.addRoo}
                    onChange={(e) => setRoomInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addRoom}
                    style={{
                      backgroundColor: "#897463",
                      color: "white",
                      border: "1px, solid",
                      borderRadius: "10px",
                      marginLeft: "10px",
                    }}
                  >
                    Add Room
                  </button>
                </div>
              </div>

              <h4 style={{ color: "#305845", fontSize: "14px" }}>
                Current Floor and Room:
              </h4>
              <div style={styles.textArea}>
                {Object.entries(floorAndRooms).length === 0 ? (
                  <p style={styles.emptyMessage}>
                    No floors or rooms added yet.
                  </p>
                ) : (
                  Object.entries(floorAndRooms).map(([floor, rooms]) => (
                    <div key={floor} style={styles.floorBlock}>
                      <p style={styles.floorTitle}>Floor: {floor}:</p>
                      {rooms.length > 0 ? (
                        rooms.map((room, index) => (
                          <p key={index} style={styles.roomText}>
                            Room: {room}
                          </p>
                        ))
                      ) : (
                        <p style={styles.noRoomText}>No rooms added</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleSaveNewBuilding}
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
                <label>Floors:</label>
                <input
                  value={(() => {
                    const floorAttr = modalData?.attributes?.find(
                      (attr) => attr.name === "Floor and rooms"
                    );
                    if (floorAttr) {
                      const floorData = JSON.parse(floorAttr.value);
                      return Object.keys(floorData).length; // Total number of floors
                    }
                    return "N/A";
                  })()}
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
                <label>Created by:</label>
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
                  <div className="image-field">
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

      {/* scheduleModel */}
      {isScheduleModalOpen && scheduleModalData && ( 
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Preventive maintenance schedule form</h2>
              <button
                className="close-btn"
                onClick={() => setScheduleModalData(null)}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            <div className="schedule-form">
              <p className="sub-title">Maintenance Detail</p>
              <div className="modal-content-field">
                <label>Description: </label>
                <input
                  type="text"
                  value={scheduleModalData.Description}
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Assign: </label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={
                    workersList.find(
                      (worker) => worker.value === scheduleModalData.Assign
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Assign: selectedOption?.value || "",
                    })
                  }
                  isClearable
                  isSearchable
                />
              </div>

              {/* Schedule fields */}
              <p className="sub-title">Schedule</p>
              <div className="modal-content-field">
                <label>Starts on: </label>
                <input
                  type="date"
                  value={
                    scheduleModalData.Lastworkorder
                      ? new Date(scheduleModalData.Lastworkorder)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Lastworkorder: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Schedule time: </label>
                <input
                  type="time"
                  value={scheduleModalData.Schedule}
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Schedule: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Ends on: </label>
                <input
                  type="date"
                  value={
                    scheduleModalData.Nextworkorder
                      ? new Date(scheduleModalData.Nextworkorder)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Nextworkorder: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-buttons">
                <button className="accept-btn" style={{ width: "150px" }}>
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Building;
