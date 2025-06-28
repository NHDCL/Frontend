import React, { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import {
  useGetAssetByAcademyQuery,
  useUpdateFloorAndRoomsMutation,
} from "../../../slices/assetApiSlice";
import { useGetUserByEmailQuery } from "../../../slices/userApiSlice";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { IoMdAdd } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import swal from "sweetalert2";
import { TiArrowSortedUp } from "react-icons/ti";

const selectUserInfo = (state) => state.auth.userInfo || {};
const getUserEmail = createSelector(
  selectUserInfo,
  (userInfo) => userInfo?.username || ""
);

const RoomQR = () => {
  const email = useSelector(getUserEmail);
  const { data: manager } = useGetUserByEmailQuery(email);
  const [updateFloorAndRooms, { isLoading }] = useUpdateFloorAndRoomsMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [academyId, setAcademyId] = useState(null);
  const { data: assets, refetch } = useGetAssetByAcademyQuery(academyId);
  const [showForm, setShowForm] = useState(false);
  const [newFloor, setNewFloor] = useState("");
  const [newRooms, setNewRooms] = useState("");
  const [data, setData] = useState([]);
  const [dataRoom, setDataRoom] = useState([]);
  const [roomInput, setRoomInput] = useState("");
  const [floorAndRooms, setFloorAndRooms] = useState({});
  const [floorInput, setFloorInput] = useState("");
  const [selectedAssetTitle, setSelectedAssetTitle] = useState("");
  const [selectedAssetCode, setSelectedAssetCode] = useState("");

  const rowsPerPage = 9; // 3x3 grid for QR codes per page
  const qrSize = 40; // Size of each QR code (adjust as needed)
  const qrSpacing = 12; // Spacing between QR codes

  useEffect(() => {
    if (manager?.user?.academyId) {
      setAcademyId(manager.user.academyId);
    }
  }, [manager?.user?.academyId]);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) =>
          asset.categoryDetails?.name === "Building" &&
          asset.status === "In Usage"
      );
      setData(filteredAssets);
    }
  }, [assets]);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter((asset) => {
        const isBuilding = asset.categoryDetails?.name === "Building";
        const isInUsage = asset.status === "In Usage";

        // Check if it does NOT have an attribute named "Floor and rooms"
        const hasNoFloorAndRooms = !asset.attributes?.some(
          (attr) => attr.name === "Floor and rooms"
        );

        return isBuilding && isInUsage && hasNoFloorAndRooms;
      });

      setDataRoom(filteredAssets);
    }
  }, [assets]);

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
    floorText: {
      fontSize: "14px",
      marginBottom: "4px",
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

  // Sorting and filtering logic
  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  const filteredData = [...data]
  .filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesBuilding =
      selectedBuilding === "" || item.title === selectedBuilding;

    const floorRoomsAttr = item.attributes.find(
      (attr) => attr.name === "Floor and rooms"
    );
    const floorRoomObj = floorRoomsAttr ? JSON.parse(floorRoomsAttr.value) : {};
    const floors = Object.keys(floorRoomObj);
    const rooms = Object.values(floorRoomObj).flat();

    const matchesFloor = selectedFloor === "" || floors.includes(selectedFloor);
    const matchesRoom = selectedRoom === "" || rooms.includes(selectedRoom);

    return matchesSearch && matchesBuilding && matchesFloor && matchesRoom;
  })
  .sort((a, b) => {
    if (!sortOrder.column) return 0;

    let valA = a[sortOrder.column];
    let valB = b[sortOrder.column];

    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";

    if (!isNaN(valA) && !isNaN(valB)) {
      valA = Number(valA);
      valB = Number(valB);
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }

    if (valA < valB) return sortOrder.ascending ? -1 : 1;
    if (valA > valB) return sortOrder.ascending ? 1 : -1;
    return 0;
  });


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const uniqueBuilding = [
    { value: "", label: "All Buildings" },
    ...Array.from(new Set(data.map((item) => item.title))).map((title) => ({
      value: title,
      label: title,
    })),
  ];

  const uniqueFloors = [
    { value: "", label: "All Floors" },
    ...Array.from(
      new Set(
        data
          .filter(
            (item) => selectedBuilding === "" || item.title === selectedBuilding
          )
          .flatMap((item) => {
            const floorRoomAttr = item.attributes.find(
              (attr) => attr.name === "Floor and rooms"
            );
            const floorRoomObj = floorRoomAttr
              ? JSON.parse(floorRoomAttr.value)
              : {};
            return Object.keys(floorRoomObj);
          })
      )
    ).map((floor) => ({
      value: floor,
      label: floor,
    })),
  ];

  const uniqueRoom = [
    { value: "", label: "All Rooms" },
    ...Array.from(
      new Set(
        data
          .filter(
            (item) => selectedBuilding === "" || item.title === selectedBuilding
          )
          .flatMap((item) => {
            const floorRoomAttr = item.attributes.find(
              (attr) => attr.name === "Floor and rooms"
            );
            const floorRoomObj = floorRoomAttr
              ? JSON.parse(floorRoomAttr.value)
              : {};
            return Object.entries(floorRoomObj)
              .filter(
                ([floor]) => selectedFloor === "" || floor === selectedFloor
              )
              .flatMap(([, rooms]) => rooms);
          })
      )
    ).map((room) => ({
      value: room,
      label: `Room ${room}`,
    })),
  ];

  const assetOptions = dataRoom.map((asset) => ({
    value: asset.title,
    label: asset.title,
    assetCode: asset.assetCode,
  }));

  const addRoom = () => {
    if (floorInput.trim() && roomInput.trim()) {
      setFloorAndRooms((prev) => {
        const updatedRooms = { ...prev };
        if (!updatedRooms[floorInput]) {
          updatedRooms[floorInput] = [];
        }
        updatedRooms[floorInput].push(roomInput);
        JSON.stringify(updatedRooms, null, 2); // Update the jsonData
        return updatedRooms;
      });
      setRoomInput(""); // Clear room input
    }
  };

  const handleDownloadPDF = async () => {
    if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
      console.error("No rows selected or selectedRows is not an array.");
      return;
    }

    const doc = new jsPDF();
    let pageY = 10;
    let pageX = 40;
    let rowCount = 0;
    let serialNumber = 1;

    for (const rowKey of selectedRows) {
      if (typeof rowKey !== "string" || !rowKey.includes("_")) {
        console.warn("Invalid rowKey:", rowKey);
        continue;
      }

      const [assetID, floor, room] = rowKey.split("_");

      const rowData = data.find((item) => item.assetID.toString() === assetID);
      if (!rowData) continue;

      const qrCodeAttr = rowData.attributes.find(
        (attr) => attr.name === `QR Code - Room ${room}`
      );
      const qrCodeUrl = qrCodeAttr?.value;
      if (!qrCodeUrl) continue;

      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const reader = new FileReader();

        const base64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        doc.addImage(base64, "PNG", pageX, pageY, qrSize, qrSize);
        doc.setFontSize(8);
        pageY += qrSize + qrSpacing;
        doc.text(`Building Name: ${rowData.title}`, pageX, pageY);
        pageY += 8;
        doc.text(`Floor: ${floor}`, pageX, pageY);
        pageY += 8;
        doc.text(`Room: ${room}`, pageX, pageY);
        pageY += 10;

        rowCount++;
        serialNumber++;

        if (rowCount % 3 === 0) {
          pageX += qrSize + qrSpacing;
          pageY = 10;
        }

        if (rowCount === rowsPerPage) {
          doc.addPage();
          pageY = 10;
          pageX = 40;
          rowCount = 0;
        }
      } catch (err) {
        console.error("Error fetching QR code:", err);
      }
    }

    doc.save("Assets_with_QR_Codes.pdf");
  };

  const handleSelectRow = (assetID, floor, room) => {
    const rowKey = `${assetID}_${floor}_${room}`; // Make sure this is a string
    setSelectedRows((prev) =>
      prev.includes(rowKey)
        ? prev.filter((item) => item !== rowKey)
        : [...prev, rowKey]
    );
  };

  const handleAddFloorRooms = async () => {
    if (!selectedAssetCode) {
      Swal.fire("Warning", "Please select a building first!", "warning");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to add floors/rooms to: ${selectedAssetTitle}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Add",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          assetCode: selectedAssetCode,
          name: "Floor and rooms",
          value: JSON.stringify(floorAndRooms),
        };
        console.log(payload);

        try {
          const res = await updateFloorAndRooms(payload);
          Swal.fire(
            "Success",
            "Floor and rooms added successfully!",
            "success"
          );
          refetch();
          setFloorAndRooms({});
          setFloorInput("");
          setSelectedAssetCode("");
          setShowForm(false);
        } catch (error) {
          console.error("Error adding floor and rooms:", error);
          Swal.fire("Error", "Failed to add floor and rooms.", "error");
        }
      }
    });
  };


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
        column === sortOrder.column
          ? !sortOrder.ascending
          : true;
  
      setSortOrder({
        column,
        ascending: newSortOrder,
      });
  
      sortData(column, newSortOrder);
    };

  return (
    <div className="managerDashboard">
      {/* Search and filter inputs */}
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
        <div className="create-category-btn">
          <IoMdAdd style={{ color: "#ffffff", marginLeft: "12px" }} />
          <button className="category-btn" onClick={() => setShowForm(true)}>
            Add Floor and Rooms
          </button>
        </div>
      </div>

      {/* Dropdowns for filtering */}
      <div className="Building-sort">
        <Select
          classNamePrefix="custom-select-workstatus"
          className="workstatus-dropdown"
          options={uniqueBuilding}
          value={uniqueBuilding.find(
            (option) => option.value === selectedBuilding
          )}
          onChange={(selectedOption) => {
            setSelectedBuilding(selectedOption ? selectedOption.value : "");
            setSelectedFloor(""); // Reset floor selection
          }}
          isClearable
        />
        {selectedBuilding && (
          <Select
            classNamePrefix="custom-select-workstatus"
            className="workstatus-dropdown"
            options={uniqueFloors}
            value={uniqueFloors.find(
              (option) => option.value === selectedFloor
            )}
            onChange={(selectedOption) =>
              setSelectedFloor(selectedOption ? selectedOption.value : "")
            }
            isClearable
          />
        )}
        {selectedFloor && (
          <Select
            classNamePrefix="custom-select-workstatus"
            className="workstatus-dropdown"
            options={uniqueRoom}
            value={uniqueRoom.find((option) => option.value === selectedRoom)}
            onChange={(selectedOption) =>
              setSelectedRoom(selectedOption ? selectedOption.value : "")
            }
            isClearable
          />
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="RequestTable">
          <thead className="table-header">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length ===
                    filteredData.flatMap((item) => {
                      const floorRoomsAttr = item.attributes.find(
                        (attr) => attr.name === "Floor and rooms"
                      );
                      const floorData = floorRoomsAttr
                        ? JSON.parse(floorRoomsAttr.value)
                        : {};
                      return Object.entries(floorData).flatMap(
                        ([floor, rooms]) =>
                          rooms
                            .filter(
                              (room) => !selectedRoom || room === selectedRoom
                            )
                            .map((room) => `${item.assetID}_${floor}_${room}`)
                      );
                    }).length
                  }
                  onChange={() => {
                    const allRowKeys = filteredData.flatMap((item) => {
                      const floorRoomsAttr = item.attributes.find(
                        (attr) => attr.name === "Floor and rooms"
                      );
                      const floorData = floorRoomsAttr
                        ? JSON.parse(floorRoomsAttr.value)
                        : {};
                      return Object.entries(floorData).flatMap(
                        ([floor, rooms]) =>
                          rooms
                            .filter(
                              (room) => !selectedRoom || room === selectedRoom
                            )
                            .map((room) => `${item.assetID}_${floor}_${room}`)
                      );
                    });

                    setSelectedRows(
                      selectedRows.length === allRowKeys.length
                        ? []
                        : allRowKeys
                    );
                  }}
                />
              </th>
              {[
                { label: "Sl. No.", field: null }, // typically used for index
                { label: "Asset Code", field: "assetCode" },
                { label: "Building Name", field: "title" },
                { label: "Floor", field: null },
                { label: "Room", field: null }
              ].map(
                (header, index) => (
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
                                  sortOrder.column === header.field && sortOrder.ascending
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
                )
              )}
              <th>
                {selectedRows.length > 0 && (
                  <button onClick={handleDownloadPDF}>
                    <FaDownload
                      style={{ width: "20px", height: "20px", color: "green" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let index = 0;
              return filteredData.flatMap((item) => {
                const floorRoomsAttr = item.attributes.find(
                  (attr) => attr.name === "Floor and rooms"
                );
                const floorData = floorRoomsAttr
                  ? JSON.parse(floorRoomsAttr.value)
                  : {};

                return Object.entries(floorData).flatMap(([floor, rooms]) => {
                  if (selectedFloor && floor !== selectedFloor) return [];

                  return rooms
                    .filter((room) => !selectedRoom || room === selectedRoom)
                    .map((room) => {
                      const rowKey = `${item.assetID}_${floor}_${room}`;
                      const qrCodeAttr = item.attributes.find(
                        (attr) => attr.name === `QR Code - Room ${room}`
                      );
                      const qrCodeUrl = qrCodeAttr?.value || "";

                      index++; // serial number counter

                      return (
                        <tr key={rowKey}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(rowKey)}
                              onChange={() =>
                                handleSelectRow(item.assetID, floor, room)
                              }
                            />
                          </td>
                          <td>{index}</td> {/* Serial number */}
                          <td>{item.assetCode}</td>
                          <td>{item.title}</td>
                          <td>{floor}</td>
                          <td>{room}</td>
                          <td>
                            {qrCodeUrl && (
                              <img
                                src={qrCodeUrl}
                                alt={`QR for Room ${room}`}
                                style={{ width: qrSize, height: qrSize }}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    });
                });
              });
            })()}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Add Floor and Rooms</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <form className="repair-form">
              <div className="modal-content-field">
                <label>Select Building:</label>
                <div style={{ width: "100%",maxWidth:"350px" }}>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  placeholder="Select Building"
                  isSearchable={false} // 🔒 disables typing/filtering
                  value={
                    assetOptions.find(
                      (opt) => opt.value === selectedAssetTitle
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    setSelectedAssetTitle(selectedOption?.value || "");
                    setSelectedAssetCode(selectedOption?.assetCode || "");
                  }}
                  options={assetOptions}
                />
              </div>
              </div>

              <div className="modal-content-field">
                <label>Floor Name:</label>
                <input
                  type="text"
                  value={floorInput}
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
                      <p style={styles.floorText}>
                        {`${floor}: ${rooms.join(", ")}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="modal-buttons">
                <button
                  type="button" // Prevents form submission
                  className="accept-btn"
                  onClick={handleAddFloorRooms}
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  );
};

export default RoomQR;
