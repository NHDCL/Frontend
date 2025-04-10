import React, { useEffect, useState, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";
import {
  useGetAssetByAcademyQuery,
  usePostAssetMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";
import CreatableSelect from "react-select/creatable";

const Machinery = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalData, setModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [postAsset, { isLoading: isLoading2 }] = usePostAssetMutation();
  const [newMachinery, setNewMachinery] = useState({
    title: "",
    assetCode: "",
    acquireDate: "",
    lifespan: "",
    status: "",
    cost: "",
    assetArea: "",
    Serial_number: "",
  });
  const [academyId, setAcademyId] = useState("67f017257d756710a12c2fa7");
  const { data: assets, refetch } = useGetAssetByAcademyQuery(academyId);
  const [data, setData] = useState([]);
  const [Building, setBuilding] = useState([]);
  const qrRefs = useRef([]);

  const rowsPerPage = 9; // 3x3 grid for QR codes per page
  const qrSize = 40; // Size of each QR code (adjust as needed)
  const qrSpacing = 12; // Spacing between QR codes

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.categoryDetails?.name === category
      );
      setData(filteredAssets);
    }
  }, [assets]);

  useEffect(() => {
    if (assets) {
      const filteredAssets2 = assets.filter(
        (asset) => asset.categoryDetails?.name === "Building"
      );
      setBuilding(filteredAssets2);
    }
  }, [assets]);

  const CategoryId = data.length > 0 ? data[0]?.categoryDetails?.id : null;

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isNewBlock, setIsNewBlock] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); 

  const convertAssetsToBlockData = (Building) => {
    const blockData = {};

    Building.forEach((build) => {
      const blockName = build.title; // e.g., "Block T"
      const floorRoomsAttr = build.attributes.find(
        (attr) => attr.name === "Floor and rooms"
      );

      if (floorRoomsAttr) {
        try {
          const floorRooms = JSON.parse(floorRoomsAttr.value); // Parse floor-room JSON

          blockData[blockName] = {};

          Object.entries(floorRooms).forEach(([floor, rooms]) => {
            blockData[blockName][floor] = rooms;
          });
        } catch (error) {
          console.error("Failed to parse floor and rooms JSON:", error);
        }
      }
    });

    return blockData;
  };

  const blockData = convertAssetsToBlockData(Building);
  console.log(blockData);
  const convertAssetsToBlockTitles = (Building) => {
    const blockTitles = [];

    Building.forEach((build) => {
      const blockName = build.title; // e.g., "Block T"

      // Ensure that we only add the blockName if it isn't already in the array
      if (blockName && !blockTitles.includes(blockName)) {
        blockTitles.push(blockName);
      }
    });

    return blockTitles; // Return an array of block titles
  };

  const blockTitles = convertAssetsToBlockTitles(Building);
  console.log(blockTitles);

  const handleBlockChange = (selectedOption, { action }) => { 
    if (action === "create-option") {
      // If a new block is created by the user, set it as the asset area directly
      setSelectedBlock(selectedOption?.value || null);
      setIsNewBlock(true);
      setSelectedFloor(null);
      setSelectedRoom(null);
      
      // Set the asset area as the newly created block
      setNewMachinery((prev) => ({
        ...prev,
        assetArea: selectedOption?.value || "", // Directly set the new block name as asset area
      }));
    } else {
      // If an existing block is selected
      setIsNewBlock(false);
      setSelectedBlock(selectedOption?.value || null);
      setSelectedFloor(null);
      setSelectedRoom(null);
    }
  };

  const handleFloorChange = (option) => {
    setSelectedFloor(option?.value);
    setSelectedRoom(null);
  };

  const handleRoomChange = (option) => {
    setSelectedRoom(option?.value);
  };

  useEffect(() => {
    if (selectedBlock && selectedFloor && selectedRoom) {
      const areaString = `${selectedBlock} - ${selectedFloor} - ${selectedRoom}`;
      setNewMachinery((prev) => ({
        ...prev,
        assetArea: areaString,
      }));
    }
  }, [selectedBlock, selectedFloor, selectedRoom]);

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

  const dropdownStyles = {
    menu: (provided) => ({
      ...provided,
      maxHeight: 150, // Set the height you want
      overflowY: "auto",
      zIndex: 9999, // So it appears above other content
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 150,
      overflowY: "auto",
    }),
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
    setSelectedBlock(null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setIsNewBlock(false);
    setIsFormSubmitted(true);
  };

  const handleAddMachinery = () => {
    setShowAddModal(true);
  };

  const handleSaveNewMachinery = async () => {
    const payload = {
      assetCode: newMachinery.assetCode,
      title: newMachinery.title,
      cost: Number(newMachinery.cost),
      acquireDate: newMachinery.acquireDate,
      lifespan: newMachinery.lifespan,
      assetArea: newMachinery.assetArea,
      description: newMachinery.description,
      status: "Pending",
      createdBy: "Admin",
      deletedBy: null,
      academyID: "67f017257d756710a12c2fa7",
      assetCategoryID: CategoryId,
      attributes: [
        { name: "Serial_number", value: newMachinery.Serial_number },
      ],
    };

    try {
      await postAsset(payload).unwrap();
      Swal.fire({
        icon: "success",
        title: "Asset created successfully!",
        confirmButtonColor: "#305845",
      });
      refetch();
      setShowAddModal(false);
      setSelectedBlock(null);
      setSelectedFloor(null);
      setSelectedRoom(null);
      setIsNewBlock(false);
      setIsFormSubmitted(true);
      setNewMachinery({
        title: "",
        assetCode: "",
        acquireDate: "",
        lifespan: "",
        status: "",
        cost: "",
        assetArea: "",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to create asset",
        text: err?.data?.message || "Something went wrong!",
        confirmButtonColor: "#897463",
      });
    }
  };

  const getQrImageUrl = (attributes) => {
    const qrAttr = attributes?.find((attr) => attr.name === "QR Code");
    return qrAttr?.value || "";
  };

  const loadImageAsDataURL = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleSelectRow = (assetCode) => {
    setSelectedRows((prev) =>
      prev.includes(assetCode)
        ? prev.filter((item) => item !== assetCode)
        : [...prev, assetCode]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]); // Deselect all if all are selected
    } else {
      setSelectedRows(filteredData.map((item) => item.assetCode)); // Select all
    }
  };

  const handleDownloadPDF = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one asset.");
      return;
    }

    const doc = new jsPDF();
    let pageY = 10;
    let pageX = 20;
    let rowCount = 0;

    // Loop over selected rows
    for (const assetID of selectedRows) {
      const rowData = data.find((item) => item.assetCode === assetID);
      if (!rowData) continue;

      const qrUrl = getQrImageUrl(rowData.attributes);
      if (!qrUrl) continue;

      try {
        const qrDataUrl = await loadImageAsDataURL(qrUrl);
        doc.addImage(qrDataUrl, "PNG", pageX, pageY, qrSize, qrSize);

        doc.setFontSize(8);
        pageY += qrSize + 4;
        doc.text(`Asset Code: ${rowData.assetCode}`, pageX, pageY);
        pageY += 6;
        doc.text(`Title: ${rowData.title}`, pageX, pageY);
        pageY += 6;
        doc.text(`Category: ${rowData.categoryDetails?.name}`, pageX, pageY);
        pageY += 10;

        rowCount++;

        if (rowCount % 3 === 0) {
          pageX += qrSize + 30;
          pageY = 10;
        }

        if (rowCount % rowsPerPage === 0) {
          doc.addPage();
          pageY = 10;
          pageX = 20;
        }
      } catch (err) {
        console.error("Failed to load QR image:", err);
      }
    }

    doc.save("Assets_with_QR_Codes.pdf");
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
            <button className="category-btn" onClick={handleAddMachinery}>
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
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredData.length}
                  onChange={handleSelectAllRows}
                />
              </th>
              {[
                "SI.No",
                "Asset Code",
                "Title",
                "Acquire Date",
                "Useful Life(year)",
                "Depreciated Value (%)",
                "Status",
              ].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>
                {selectedRows.length > 0 && (
                  <button
                    className="delete-all-btn"
                    style={{ paddingLeft: "98px" }}
                    onClick={handleDownloadPDF}
                  >
                    <FaDownload
                      style={{ width: "20px", height: "20px", color: "green" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const isSelected = selectedRows.includes(item.assetCode); // Use assetCode to track selection
              return (
                <tr key={item.assetCode}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(item.assetCode)}
                    />
                  </td>
                  <td>{index + 1}</td> {/* Just showing serial # in table */}
                  <td>{item.assetCode}</td>
                  <td>{item.title}</td>
                  <td>{item.acquireDate}</td>
                  <td>{item.lifespan}</td>
                  <td>{item.categoryDetails?.depreciatedValue}</td>
                  <td>
                    <div className={getStatusClass(item.status)}>
                      {item.status}
                    </div>
                  </td>
                  <td
                    className="actions"
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      maxWidth: "150px",
                    }}
                  >
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                    <img
                      src={getQrImageUrl(item.attributes)}
                      alt="QR Code"
                      style={{ width: qrSize, height: qrSize }}
                    />
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

      {/* Add Machinery Modal */}
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
                  value={newMachinery.title}
                  onChange={(e) =>
                    setNewMachinery({ ...newMachinery, title: e.target.value })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input
                  type="text"
                  value={newMachinery.assetCode}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
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
                <label>Serial Number:</label>
                <input
                  type="text"
                  value={newMachinery.Serial_number}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      Serial_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <div className="select-group">
                  <div className="select-wrapper">
                    <CreatableSelect
                      classNamePrefix="select"
                      isClearable
                      styles={dropdownStyles}
                      onChange={handleBlockChange}
                      options={blockTitles.map((block) => ({
                        value: block,
                        label: block,
                      }))}
                      placeholder="Select or create block"
                    />
                  </div>

                  {selectedBlock && !isNewBlock && !isFormSubmitted &&(
                    <div className="select-wrapper">
                      <Select
                        isClearable
                        isSearchable
                        styles={dropdownStyles}
                        onChange={handleFloorChange}
                        options={Object.keys(
                          blockData[selectedBlock] || {}
                        ).map((floor) => ({
                          value: floor,
                          label: floor,
                        }))}
                        placeholder="Select floor"
                      />
                    </div>
                  )}

                  {selectedBlock && selectedFloor && !isNewBlock && !isFormSubmitted && (
                    <div className="select-wrapper">
                      <Select
                        isClearable
                        isSearchable
                        styles={dropdownStyles}
                        onChange={handleRoomChange}
                        options={(
                          blockData[selectedBlock]?.[selectedFloor] || []
                        ).map((room) => ({ value: room, label: room }))}
                        placeholder="Select room"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="date"
                  value={newMachinery.acquireDate}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      acquireDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Useful Life (Year):</label>
                <input
                  type="text"
                  value={newMachinery.lifespan}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      lifespan: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Cost:</label>
                <input
                  type="text"
                  value={newMachinery.cost}
                  onChange={(e) =>
                    setNewMachinery({ ...newMachinery, cost: e.target.value })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <input
                  type="text"
                  value={newMachinery.description}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleSaveNewMachinery}
                  disabled={isLoading2}
                >
                  {isLoading2 ? "Saving..." : "Save"}
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
              <div className="modal-content-field">
                <label>QR: </label>
                <div className="image-container">
                  <img
                    src={getQrImageUrl(modalData.attributes)}
                    alt="QR Code"
                    style={{ width: 300, height: 300 }}
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  style={{ backgroundColor: "red" }}
                >
                  <RiDeleteBin6Line />
                </button>
                <button className="accept-btn">Schedule Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Button for downloading selected PDFs
            {selectedRows.length > 0 && (
                <button onClick={handleDownloadPDF}>
                    <FaDownload /> Download Selected QR Codes & Details
                </button>
            )} */}
    </div>
  );
};

export default Machinery;
