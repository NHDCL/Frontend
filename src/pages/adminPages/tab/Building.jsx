import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../../managerPage/AssetCategory";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";


const Building = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [modalData, setModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [floorInput, setFloorInput] = useState("");
  const [roomInput, setRoomInput] = useState("");
  // const [scheduleModalData, setScheduleModalData] = useState(null);
  const [jsonData, setJson] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [title, setTitle] = useState("");
  const [assetCategoryName, setAssetCategoryName] = useState("");
  const [scheduleModalData, setScheduleModalData] = useState({
    Description: "",
    Assign: "",
    Lastworkorder: "",
    Schedule: "",
    Nextworkorder: ""
  });


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

  const [data, setData] = useState([
    {
      SerialNo: "1",
      AssetCode: "NHDCL-22-2003",
      Title: "Block A",
      AcquireDate: "27-02-2024",
      Useful_life: 3,
      Floor: 4,
      PlintArea: 4,
      Depreciated_value: 4,
      status: "In Maintenance",
      cost: 600000,
      Category: {},
      Area: "Area-1",
      Created_by: "12210100.gcit@rub.edu.bt",
      description: "This is the biggest land we own",
    },
    {
      SerialNo: "2",
      AssetCode: "NHDCL-22-2003",
      Title: "Block B",
      AcquireDate: "27-02-2024",
      Useful_life: 3,
      Floor: 4,
      PlintArea: 4,
      Depreciated_value: 4,
      status: "In Maintenance",
      cost: 600000,
      Category: {},
      Area: "Area-1",
      Created_by: "12210100.gcit@rub.edu.bt",
      description: "This is the biggest land we own",
    },
    {
      SerialNo: "3",
      AssetCode: "NHDCL-22-2003",
      Title: "Block C",
      AcquireDate: "27-02-2024",
      Useful_life: 3,
      Floor: 6,
      PlintArea: 4,
      Depreciated_value: 4,
      status: "In Maintenance",
      cost: 600000,
      Category: {},
      Area: "Area-1",
      Created_by: "12210100.gcit@rub.edu.bt",
      description: "This is the biggest land we own",
    },
    {
      SerialNo: "4",
      AssetCode: "NHDCL-22-2003",
      Title: "Block D",
      AcquireDate: "27-02-2024",
      Useful_life: 3,
      Floor: 4,
      PlintArea: 4,
      Depreciated_value: 4,
      status: "In Usage",
      cost: 600000,
      Category: {},
      Area: "Area-1",
      Created_by: "12210100.gcit@rub.edu.bt",
      description: "This is the biggest land we own",
    },
    {
      SerialNo: "5",
      AssetCode: "NHDCL-22-2003",
      Title: "Block E",
      AcquireDate: "27-02-2024",
      Useful_life: 3,
      Floor: 3,
      PlintArea: 4,
      Depreciated_value: 4,
      status: "disposed",
      cost: 600000,
      Category: {},
      Area: "Area-1",
      Created_by: "12210100.gcit@rub.edu.bt",
      description: "This is the biggest land we own",
    },
    {
      SerialNo: "6",
      AssetCode: "NHDCL-22-2003",
      Title: "Block A",
      AcquireDate: "27-02-2024",
      Useful_life: 3,
      Floor: 1,
      PlintArea: 4,
      Depreciated_value: 4,
      status: "In Maintenance",
      cost: 600000,
      Category: {},
      Area: "Area-1",
      Created_by: "12210100.gcit@rub.edu.bt",
      description: "This is the biggest land we own",
    },

  ])

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus =
      selectedStatus === "" || item.status === selectedStatus;

    const matchesBuilding =
      selectedBuilding === "" || item.Title === selectedBuilding;

    const matchesFloor =
      selectedFloor === "" || item.Floor === selectedFloor;

    return matchesSearch && matchesStatus && matchesBuilding && matchesFloor;
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

  // Function to get the class based on workstatus
  const getStatusClass = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In-maintenance-status";
      case "In Usage":
        return "in-usage-status";
      case "disposed":
        return "disposed-status";
      default:
        return "";
    }
  };
  // Extract unique work statuses from data
  const uniqueStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map(item => item.status))).map(status => ({
      value: status,
      label: status
    }))
  ];
  const handleCloseModal = () => {
    setModalData(null);
  };

  // Extract unique work statuses from data
  const uniqueBuilding = [
    { value: "", label: "All buildings" },
    ...Array.from(new Set(data.map(item => item.Title))).map(Title => ({
      value: Title,
      label: Title
    }))
  ];

  const uniqueFloors = [
    { value: "", label: "All Floors" },
    ...Array.from(new Set(
      data
        .filter(item => selectedBuilding === "" || item.Title === selectedBuilding)
        .map(item => item.Floor)
    )).map(floor => ({
      value: floor,
      label: `Floor ${floor}`
    }))
  ];

  // Update Edited Data
  const handleSaveEdit = () => {
    if (!editModalData) return;

    setData((prevData) =>
      prevData.map((row) =>
        row.mid === editModalData.mid ? editModalData : row
      )
    );

    setEditModalData(null); // Close modal after saving
  };
  // const handleSaveSchedule =()=>{

  // }

  // Sample workers list
  const workersList = [
    { value: "Worker A", label: "Worker A" },
    { value: "Worker B", label: "Worker B" },
    { value: "Worker C", label: "Worker C" },
  ];

  const handleScheduleMaintenance = () => {
    setScheduleModalData({
      ...modalData, // Passing in modalData to populate the schedule form
      Schedule: modalData.Schedule || "",
      Lastworkorder: modalData.Lastworkorder || "",
      Nextworkorder: modalData.Nextworkorder || "",
      Assign: modalData.Assign || "",
    });
  };


  return (
    <div className="managerDashboard" >
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
            value={uniqueStatuses.find(option => option.value === selectedStatus)}
            onChange={(selectedOption) => {
              setSelectedStatus(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            isSearchable={false}
          />
        </div>
      </div>
      <div className="Building-sort">
        {/* Building Dropdown */}
        <Select
          classNamePrefix="custom-select-workstatus"
          className="workstatus-dropdown"
          options={uniqueBuilding}
          value={uniqueBuilding.find(option => option.value === selectedBuilding)}
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
            value={uniqueFloors.find(option => option.value === selectedFloor)}
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

              {["SI.No", "Asset Code", "Title", "Acquire Date", "Useful Life(year)", "Floors", "Plint_area(sq.,)", "Depreciated Value (%)", "Status"].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>
                {selectedRows.length > 0 && (
                  <button className="delete-all-btn" onClick={handleDeleteSelected}>
                    <RiDeleteBin6Line style={{ width: "20px", height: "20px", color: "red" }} />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => (
              <tr key={index}>
                <td>{item.SerialNo}</td>
                <td>{item.AssetCode}</td>
                <td>{item.Title}</td>
                <td>{item.AcquireDate}</td>
                <td>{item.Useful_life}</td>
                <td>{item.Floor}</td>
                <td>{item.PlintArea}</td>
                <td>{item.Depreciated_value}</td>
                <td>
                  <div className={getStatusClass(item.status)}>
                    {item.status}
                  </div>
                </td>
                <td className="actions">
                  <button className="view-btn" onClick={() => handleView(item)}>
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
            <button key={num} className={currentPage === num + 1 ? "active" : ""} onClick={() => setCurrentPage(num + 1)}>
              {num + 1}
            </button>
          ))}
          <span>...</span>
          <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
        </div>
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
                <input type="text" value={modalData.SerialNo} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Title:</label>
                <input type="text" value={modalData.Title} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input type="email" value={modalData.AssetCode} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Size</label>
                <input type="text" value={modalData.size} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Cost:</label>
                <input type="text" value={modalData.cost} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value:</label>
                <input value={modalData.Depreciated_value} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input type="text" value={modalData.AcquireDate} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData.Useful_life} readOnly />
              </div>
              <div className="modal-content-field">
                <label>status:</label>
                <input value={modalData.status} readOnly />
              </div>
              <div className="modal-content-field">
                <label>category:</label>
                <input value={modalData.category} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input value={modalData.Area} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Created by:</label>
                <input value={modalData.Created_by} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Description: </label>
                <textarea value={modalData.description} readOnly />
              </div>

            </form>
          </div>
        </div>
      )}

    </div >
  )
};

export default Building;
