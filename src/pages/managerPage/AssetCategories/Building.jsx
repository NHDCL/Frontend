import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../AssetCategory";
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
  const [newBuilding, setNewBuiding] = useState({ Title: "", AssetCode: "", Category: "Building", Floor: "", PlintArea: "", AcquireDate: "", Useful_life: "", status: "", cost: "", Area: "", DepreciatedValue: "", File: "" });
  const [floorAndRooms, setFloorAndRooms] = useState({});
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
  const handleAddBuilding = () => {
    setShowAddModal(true);
    setNewBuiding({ category: "", DepreciatedValue: "" });
  };

  const handleSaveNewBuilding = () => {
    if (newBuilding.Category && newBuilding.DepreciatedValue) {
      const newAID = data.length > 0 ? (Math.max(...data.map((item) => Number(item.SerialNo))) + 1).toString() : "1";
      setData([...data, { AID: newAID, ...newBuilding }]);
      setShowAddModal(false);
      setNewBuiding({}); // Reset form after adding
    }
  };

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

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const handleScheduleMaintenance = () => {
    // Ensure the modalData is correctly populated before opening the schedule modal
    if (modalData) {
      setScheduleModalData({
        Schedule: modalData.Schedule || "",
        Lastworkorder: modalData.Lastworkorder || "",
        Nextworkorder: modalData.Nextworkorder || "",
        Assign: modalData.Assign || "",
        Description: modalData.Description || "", // Add more if needed
      });
  
      // Open the modal
      setIsScheduleModalOpen(true);
    }
  };
  
  

  const closeModal = () => {
    setIsScheduleModalOpen(false); // Close modal
    setScheduleModalData(null); // Reset modal data
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
          <div className="create-category-btn">
            <ImFolderDownload style={{ color: "#ffffff", marginLeft: "12px" }} />
            <button className="category-btn">Bulk Import</button>
          </div>
          <div className="create-category-btn">
            <IoMdAdd style={{ color: "#ffffff", marginLeft: "12px" }} />
            <button className="category-btn" onClick={handleAddBuilding}>Create category</button>
          </div>
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
                  <button className="delete-all-btn" onClick={handleDeleteSelected()}>
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

      {/* Add Building Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Create Asset</h2>
              <button className="close-btn" onClick={closeModal}>
                <IoIosCloseCircle style={{ color: "#897463", width: "20px", height: "20px" }} />
              </button>

            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Title:</label>
                <input
                  type="text"
                  value={newBuilding.Title}
                  onChange={(e) => setNewBuiding({ ...newBuilding, Title: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input
                  type="text"
                  value={newBuilding.AssetCode}
                  onChange={(e) => setNewBuiding({ ...newBuilding, AssetCode: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Category:</label>
                <input
                  type="text"
                  value={newBuilding.Category}
                  onChange={(e) => setNewBuiding({ ...newBuilding, Category: e.target.value })}
                />
              </div>

              <div className="modal-content-field">
                <label>Plint Area(sq.m):</label>
                <input
                  type="text"
                  value={newBuilding.PlintArea}
                  onChange={(e) => setNewBuiding({ ...newBuilding, PlintArea: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="text"
                  value={newBuilding.AcquireDate}
                  onChange={(e) => setNewBuiding({ ...newBuilding, AcquireDate: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Useful Life (Year):</label>
                <input
                  type="text"
                  value={newBuilding.Useful_life}
                  onChange={(e) => setNewBuiding({ ...newBuilding, Useful_life: e.target.value })}
                />
              </div>
              {/* <div className="modal-content-field">
                      <label>Status:</label>
                      <input
                        type="text"
                        value={newBuilding.status}
                        onChange={(e) => setNewBuiding({ ...newBuilding, Useful_life: e.target.value })}
                      />
                    </div> */}
              <div className="modal-content-field">
                <label>Cost:</label>
                <input
                  type="text"
                  value={newBuilding.cost}
                  onChange={(e) => setNewBuiding({ ...newBuilding, cost: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input
                  type="text"
                  value={newBuilding.Area}
                  onChange={(e) => setNewBuiding({ ...newBuilding, Area: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value (%):</label>
                <input
                  type="number"
                  value={newBuilding.DepreciatedValue}
                  onChange={(e) => setNewBuiding({ ...newBuilding, DepreciatedValue: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <input
                  type="text"
                  value={newBuilding.description}
                  onChange={(e) => setNewBuiding({ ...newBuilding, description: e.target.value })}
                />
              </div>

              <h3 style={{ color: "#305845", fontSize: "14px" }}>Floor and Room Data</h3>
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
                <div style={{ display: "flex", width: "100%", maxWidth: "350px" }}>
                  <input
                    type="text"
                    // value={newBuilding.addRoo}
                    onChange={(e) => setRoomInput(e.target.value)}

                  />
                  <button type="button" onClick={addRoom} style={{ backgroundColor: "#897463", color: "white", border: "1px, solid", borderRadius: "10px", marginLeft: "10px" }}>
                    Add Room
                  </button>
                </div>

              </div>



              <h4 style={{ color: "#305845", fontSize: "14px" }}>Current Floor and Room:</h4>
              <div style={styles.textArea}>
                {Object.entries(floorAndRooms).length === 0 ? (
                  <p style={styles.emptyMessage}>No floors or rooms added yet.</p>
                ) : (
                  Object.entries(floorAndRooms).map(([floor, rooms]) => (
                    <div key={floor} style={styles.floorBlock}>
                      <p style={styles.floorTitle}>Floor: {floor}:</p>
                      {rooms.length > 0 ? (
                        rooms.map((room, index) => (
                          <p key={index} style={styles.roomText}>Room:  {room}</p>
                        ))
                      ) : (
                        <p style={styles.noRoomText}>No rooms added</p>
                      )}
                    </div>
                  ))
                )}

              </div>



              <div className="modal-actions">
                <button className="accept-btn" style={{ width: "80px" }} onClick={handleSaveNewBuilding}>Save</button>
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

              <div className="modal-buttons">
                <button className="accept-btn" style={{ backgroundColor: "red" }}>
                  <RiDeleteBin6Line />
                </button>

                <button className="accept-btn" onClick={handleScheduleMaintenance}>
                  Schedule Maintenance
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* scheduleModel */}
      {isScheduleModalOpen && scheduleModalData && ( 
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Preventive maintenance schedule form</h2>
              <button className="close-btn" onClick={() => setIsScheduleModalOpen(false)}>
                <IoIosCloseCircle style={{ color: "#897463", width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="schedule-form">
              <p className="sub-title">Maintenance Detail</p>
              <div className="modal-content-field">
                <label htmlFor="">Description: </label>
                <input type="text" value={scheduleModalData.Description} onChange={(e) => setScheduleModalData({ ...scheduleModalData, Description: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Assign: </label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={workersList.find(worker => worker.value === scheduleModalData.Assign) || null} // Ensure correct selection
                  onChange={(selectedOption) => {
                    setScheduleModalData({ ...scheduleModalData, Assign: selectedOption?.value || "" }); // Update state correctly
                  }}
                  isClearable
                  isSearchable
                />
              </div>

              <p className="sub-title">Schedule</p>
              <div className="modal-content-field">
                <label htmlFor="">Starts on: </label>
                <input
                  type="date"
                  value={scheduleModalData.Lastworkorder ? new Date(scheduleModalData.Lastworkorder).toISOString().split("T")[0] : ""}
                  onChange={(e) => setScheduleModalData({ ...scheduleModalData, Lastworkorder: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Schedule time: </label>
                <input type="time" value={scheduleModalData.Schedule} onChange={(e) => setScheduleModalData({ ...scheduleModalData, Schedule: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Repeats: </label>
                <input type="text" value={scheduleModalData.Schedule} onChange={(e) => setScheduleModalData({ ...scheduleModalData, Schedule: e.target.value })} />
              </div>
              <div className="modal-content-field">
                <label htmlFor="">Ends on: </label>
                <input
                  type="date"
                  value={scheduleModalData.Nextworkorder ? new Date(scheduleModalData.Nextworkorder).toISOString().split("T")[0] : ""}
                  onChange={(e) => setScheduleModalData({ ...scheduleModalData, Nextworkorder: e.target.value })}
                />
              </div>

            </div>

            {/* <button className="save-btn" onClick={handleSaveEdit}>Save</button> */}
            <div className="modal-buttons">
              <button className="accept-btn" style={{ width: "150px" }}>Create Schedule</button>
            </div>
          </div>
        </div>
      )}

    </div >
  )
};

export default Building;
