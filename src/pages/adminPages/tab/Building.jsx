import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { useGetAssetQuery } from "../../../slices/assetApiSlice";
import Tippy from "@tippyjs/react";
import { FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { TiArrowSortedUp } from "react-icons/ti";

const Building = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [modalData, setModalData] = useState(null);
  const { data: assets } = useGetAssetQuery();
  const [data, setData] = useState([]);
  const [building, setBuilding] = useState([]);
  const [Other, setOther] = useState([]);
  const qrSize = 40;
  const itemsPerPage = 10;
  const [modalData2, setModalData2] = useState(null);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.categoryDetails?.name === category
      );
      setData(filteredAssets);
    }
  }, [assets, category]);

  const rowsPerPage = 10;

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) =>
          asset.categoryDetails?.name === "Building" &&
          asset.status === "In Usage"
      );
      setBuilding(filteredAssets);
    }
  }, [assets]);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter((asset) => {
        const area = asset.assetArea || "";
        const normalize = (str) => str?.toLowerCase().trim();

        const matchesBuilding = selectedBuilding
          ? normalize(area).includes(normalize(selectedBuilding))
          : true;

        const matchesFloor = selectedFloor
          ? normalize(area).includes(normalize(selectedFloor))
          : true;

        const matchesRoom = selectedRoom
          ? normalize(area).includes(normalize(selectedRoom))
          : true;

        return matchesBuilding && matchesFloor && matchesRoom;
      });

      setOther(filteredAssets);
    }
  }, [assets, selectedBuilding, selectedFloor, selectedRoom]);

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

  const handleView = (item) => {
    setModalData(item); // This will set the selected asset data for the modal
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

  const getDisplayText = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In Usage"; // Show as 'In Usage'
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  // Extract unique work statuses from data
  const uniqueStatuses = [
    { value: "", label: "All Work Status" },
    ...Array.from(new Set(data.map((item) => item.status))).map((status) => ({
      value: status,
      label: status,
    })),
  ];
  const handleCloseModal = () => {
    setModalData(null);
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

  const uniqueBuilding = [
    { value: "", label: "All Buildings" },
    ...Array.from(new Set(building.map((item) => item.title))).map((title) => ({
      value: title,
      label: title,
    })),
  ];

  const uniqueFloors = [
    { value: "", label: "All Floors" },
    ...Array.from(
      new Set(
        building
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
        building
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

  const handleSelectAllRows = () => {
    if (selectedRows.length === Other.length) {
      setSelectedRows([]); // Deselect all if all are selected
    } else {
      setSelectedRows(Other.map((item) => item.assetCode)); // Select all
    }
  };

  const handleSelectRow = (assetCode) => {
    setSelectedRows((prev) =>
      prev.includes(assetCode)
        ? prev.filter((item) => item !== assetCode)
        : [...prev, assetCode]
    );
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
      const rowData = Other.find((item) => item.assetCode === assetID);
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

  const handleView2 = (item) => {
    setModalData2(item); // This will set the selected asset data for the modal
  };

  const handleCloseModal2 = () => {
    setModalData2(null);
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

  const sortDatas = (column, ascending) => {
    const sortedData = [...Other].sort((a, b) => {
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

    setOther(sortedData);
  };

  const handleSorts = (column) => {
    const newSortOrder =
      column === sortOrder.column ? !sortOrder.ascending : true;

    setSortOrder({
      column,
      ascending: newSortOrder,
    });

    sortDatas(column, newSortOrder);
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
        </div>
      </div>
      {/* Dropdowns for filtering */}
      <div className="Building-sort">
        <div style={{ marginRight: "5px" }}>
          <Select
            classNamePrefix="custom-select-workstatus"
            className="workstatus-dropdown"
            options={uniqueBuilding}
            value={uniqueBuilding.find(
              (option) => option.value === selectedBuilding
            )}
            onChange={(selectedOption) => {
              const value = selectedOption ? selectedOption.value : "";
              setSelectedBuilding(value);
              setSelectedFloor("");
              setSelectedRoom("");
            }}
            isClearable
          />
        </div>

        {selectedBuilding && (
          <div style={{ marginRight: "5px" }}>
            <Select
              classNamePrefix="custom-select-workstatus"
              className="workstatus-dropdown"
              options={uniqueFloors}
              value={uniqueFloors.find(
                (option) => option.value === selectedFloor
              )}
              onChange={(selectedOption) => {
                const value = selectedOption ? selectedOption.value : "";
                setSelectedFloor(value);
                setSelectedRoom("");
              }}
              isClearable
            />
          </div>
        )}

        {selectedFloor && (
          <div>
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
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {selectedBuilding || selectedFloor || selectedRoom ? (
          // 🔁 Second Table when a dropdown value is selected
          <div>
            <table className="RequestTable">
              <thead className="table-header">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === Other.length}
                      onChange={handleSelectAllRows}
                    />
                  </th>
                  {[
                    { label: "Sl. No.", field: null }, // for index or row number
                    { label: "Asset Code", field: "assetCode" },
                    { label: "Title", field: "title" },
                    { label: "Acquire Date", field: "acquireDate" },
                    { label: "Useful Life(year)", field: null },
                    { label: "Area", field: "assetArea" },
                    { label: "Status", field: "status" },
                  ].map((header, index) => (
                    <th key={index}>
                      {header.field ? (
                        <div className="header-title">
                          {header.label}
                          <div className="sort-icons">
                            <button
                              className="sort-btn"
                              onClick={() => handleSorts(header.field)}
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
                    {selectedRows.length > 0 && (
                      <button
                        className="delete-all-btn"
                        style={{ paddingLeft: "98px" }}
                        onClick={handleDownloadPDF}
                      >
                        <FaDownload
                          style={{
                            width: "20px",
                            height: "20px",
                            color: "green",
                          }}
                        />
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Other.map((item, index) => {
                  const isSelected = selectedRows.includes(item.assetCode);
                  return (
                    <tr key={item.assetCode}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(item.assetCode)}
                        />
                      </td>
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
                      <td>{formatDate(item.acquireDate)}</td>
                      <td>{item.lifespan}</td>
                      <td className="description">
                        <Tippy content={item.assetArea || ""} placement="top">
                          <span>
                            {item.assetArea?.length > 20
                              ? item.assetArea.substring(0, 20) + "..."
                              : item.assetArea || ""}
                          </span>
                        </Tippy>
                      </td>
                      <td>
                        <div className={getStatusClass(item.status)}>
                          {getDisplayText(item.status)}
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
                          onClick={() => handleView2(item)}
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

            {/* Pagination for the second table */}
            <div className="pagination">
              <span>{Other.length} Results</span>
              <div>
                {[...Array(Math.ceil(Other.length / itemsPerPage)).keys()]
                  .slice(0, 5)
                  .map((num) => (
                    <button
                      key={num}
                      className={currentPage === num + 1 ? "active" : ""}
                      onClick={() => setCurrentPage(num + 1)}
                    >
                      {num + 1}
                    </button>
                  ))}
                <span>...</span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.ceil(Other.length / itemsPerPage))
                  }
                >
                  {Math.ceil(Other.length / itemsPerPage)}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 🔁 Default Table when no dropdown value is selected
          <div>
            <table className="RequestTable">
              <thead className="table-header">
                <tr>
                  {[
                    { label: "Sl. No.", field: null }, // for index or row number
                    { label: "Asset Code", field: "assetCode" },
                    { label: "Title", field: "title" },
                    { label: "Acquire Date", field: "acquireDate" },
                    { label: "Useful Life(year)", field: null },
                    { label: "Floors", field: null },
                    { label: "Plint_area(sq.,)", field: null },
                    { label: "Depreciated Value (%)", field: null },
                    { label: "Status", field: "status" },
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((item, index) => {
                  const plintAreaAttr = item.attributes.find(
                    (attr) => attr.name === "Plint_area"
                  );
                  const floorAttr = item.attributes.find(
                    (attr) => attr.name === "Floor and rooms"
                  );
                  const plintArea = plintAreaAttr ? plintAreaAttr.value : "N/A";
                  const floorCount = floorAttr
                    ? Object.keys(JSON.parse(floorAttr.value)).length
                    : "N/A";

                  return (
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
                      <td>{formatDate(item.acquireDate)}</td>
                      <td>{item.lifespan}</td>
                      <td>{floorCount}</td>
                      <td>{plintArea}</td>
                      <td>{item.categoryDetails?.depreciatedValue}</td>
                      <td>
                        <div className={getStatusClass(item.status)}>
                          {getDisplayText(item.status)}
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

            {/* Pagination for the default table */}
            <div className="pagination">
              <span>{displayedData.length} Results</span>
              <div>
                {[
                  ...Array(
                    Math.ceil(displayedData.length / itemsPerPage)
                  ).keys(),
                ]
                  .slice(0, 5)
                  .map((num) => (
                    <button
                      key={num}
                      className={currentPage === num + 1 ? "active" : ""}
                      onClick={() => setCurrentPage(num + 1)}
                    >
                      {num + 1}
                    </button>
                  ))}
                <span>...</span>
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.ceil(displayedData.length / itemsPerPage)
                    )
                  }
                >
                  {Math.ceil(displayedData.length / itemsPerPage)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <input type="text" value={formatDate(modalData.acquireDate)} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData.lifespan} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Status:</label>
                <input value={getDisplayText(modalData.status)} readOnly />
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
              {modalData &&
                modalData.attributes &&
                modalData.attributes.filter((attr) =>
                  attr.name.startsWith("image")
                ).length > 0 && (
                  <div className="modal-content-field">
                    <label>Images:</label>
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
                  </div>
                )}

              <div className="modal-buttons">
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
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalData2 && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Asset Details</h2>
              <button className="close-btn" onClick={handleCloseModal2}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <form className="repair-form">
              <div className="modal-content-field">
                <label>Asset Id:</label>
                <input type="text" value={modalData2.assetID} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Title:</label>
                <input type="text" value={modalData2.title} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input type="email" value={modalData2.assetCode} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Cost:</label>
                <input type="text" value={modalData2.cost} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value:</label>
                <input
                  value={modalData2.categoryDetails?.depreciatedValue}
                  readOnly
                />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input type="text" value={formatDate(modalData2.acquireDate)} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData2.lifespan} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Status:</label>
                <input value={getDisplayText(modalData2.status)} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Category:</label>
                <input value={modalData2.categoryDetails?.name} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input value={modalData2.assetArea} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Created by</label>
                <input value={modalData2.createdBy} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Description: </label>
                <textarea value={modalData2.description} readOnly />
              </div>
              <div className="modal-content-field">
                <label>QR: </label>
                <div className="image-container">
                  <img
                    src={getQrImageUrl(modalData2.attributes)}
                    alt="QR Code"
                    style={{ width: 300, height: 300 }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Building;
