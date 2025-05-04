import React, { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import { useGetAssetQuery } from "../../../slices/assetApiSlice";

const RoomQR = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const { data: assets } = useGetAssetQuery();
  const [data, setData] = useState([]);
  console.log(data);

  const rowsPerPage = 9; // 3x3 grid for QR codes per page
  const qrSize = 40; // Size of each QR code (adjust as needed)
  const qrSpacing = 12; // Spacing between QR codes

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

  // Sorting and filtering logic
  const sortedData = [...data].sort((a, b) => b.assetID - a.assetID);
  const filteredData = sortedData.filter((item) => {
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
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const uniqueBuilding = [
    { value: "", label: "All buildings" },
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
              {["Sl. No.", "Asset Code", "Building Name", "Floor", "Room"].map(
                (header, index) => (
                  <th key={index}>{header}</th>
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
