import React, { useState } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";

import Select from "react-select";

const SupervisorWO = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");

  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const rowsPerPage = 10;

  const [teamMembers, setTeamMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

  const handleAddMember = () => {
    if (newMember.trim() && !teamMembers.includes(newMember)) {
      setTeamMembers([...teamMembers, newMember]);
      setNewMember(""); // Reset input field
    }
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState([
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "In progress",
      description: "Broken geyser",
      action: "Schedule",
      scheduleDetails: {
        technician: "",
        time: "",
        assignDate: "",
        teamMembers: [],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Minor",
      workstatus: "In progress",
      description: "Broken geyser",
      action: "Schedule",
      scheduleDetails: {
        technician: "",
        time: "",
        assignDate: "",
        teamMembers: [],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "Completed",
      description: "Broken geyser",
      action: "Reschedule",
      scheduleDetails: {
        technician: "John Doe",
        time: "10:00 AM",
        assignDate: "25/4/2025",
        teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "In progress",
      description: "Broken geyser",
      action: "Schedule",
      scheduleDetails: {
        technician: "",
        time: "",
        assignDate: "",
        teamMembers: [],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "In progress",
      description: "Broken geyser",
      action: "Schedule",
      scheduleDetails: {
        technician: "",
        time: "",
        assignDate: "",
        teamMembers: [],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "Completed",
      description: "Broken geyser",
      action: "Reschedule",
      scheduleDetails: {
        technician: "Jane Smith",
        time: "02:00 PM",
        assignDate: "26/4/2025",
        teamMembers: ["12210015.gcit@rub.edu.bt"],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "Completed",
      description: "Broken geyser",
      action: "Reschedule",
      scheduleDetails: {
        technician: "Mike Lee",
        time: "11:30 AM",
        assignDate: "27/4/2025",
        teamMembers: ["12210012.gcit@rub.edu.bt", "12210013.gcit@rub.edu.bt"],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "In progress",
      description: "Broken geyser",
      action: "Schedule",
      scheduleDetails: {
        technician: "",
        time: "",
        assignDate: "",
        teamMembers: [],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "Completed",
      description: "Broken geyser",
      action: "Schedule",
      scheduleDetails: {
        technician: "",
        time: "",
        assignDate: "",
        teamMembers: [],
      },
    },
    {
      MID: "#12512B",
      assetName: "Single comfy",
      reportingTime: "07:00 AM",
      date: "23/4/2025",
      assetID: "356",
      area: "Gyalpozhing",
      priority: "Major",
      workstatus: "pending",
      description: "Broken geyser",
      action: "Reschedule",
      scheduleDetails: {
        technician: "Emily Davis",
        time: "09:45 AM",
        assignDate: "28/4/2025",
        teamMembers: ["12210017.gcit@rub.edu.bt", "12210018.gcit@rub.edu.bt"],
      },
    },
  ]);

  // Sample workers list
  const workersList = [
    { value: "Worker A", label: "Worker A" },
    { value: "Worker B", label: "Worker B" },
    { value: "Worker C", label: "Worker C" },
  ];

  const handleAssignRequest = () => {
    if (!assignedWorker || !assignTime || !assignDate) {
      alert("Please fill in all fields before assigning.");
      return;
    }

    alert(
      `Assigned ${modalData.rid} to ${assignedWorker} at ${assignTime} on ${assignDate}`
    );

    // Close the modal after assigning
    handleCloseModal();
  };

  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status"; // Gray color
      case "In progress":
        return "in-progress-status"; // Yellow color
      case "Completed":
        return "completed-status"; // Green color
      default:
        return "";
    }
  };

  // Extract unique priorities from data
  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(new Set(data.map((item) => item.priority))).map(
      (priority) => ({
        value: priority,
        label: priority,
      })
    ),
  ];

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.workstatus))).map(
      (status) => ({
        value: status,
        label: status,
      })
    ),
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.MID - a.MID);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesPriority =
      selectedPriority === "" || item.priority === selectedPriority;
    const matchesWorkStatus =
      selectedWorkStatus === "" || item.workstatus === selectedWorkStatus;

    return matchesSearch && matchesPriority && matchesWorkStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (MID) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(MID)
        ? prevSelectedRows.filter((item) => item !== MID)
        : [...prevSelectedRows, MID]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.MID));
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };
  const handleDeleteRow = (MID) => {
    const updatedData = data.filter((item) => item.MID !== MID);
    setData(updatedData);
  };

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(null); // Reset worker selection when opening modal
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  return (
    <div className="ManagerDashboard">
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
          <div className="dropdown-ls">
            {/* Priority Dropdown */}
            <Select
              classNamePrefix="custom-select"
              className="priority-dropdown"
              options={uniquePriorities}
              value={uniquePriorities.find(
                (option) => option.value === selectedPriority
              )} // Ensure selected value is an object
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setSelectedPriority(selectedOption.value);
                } else {
                  setSelectedPriority(""); // Clear the selected priority when null
                }
              }}
              isClearable
              isSearchable={false}
            />

            {/* Work Status Dropdown */}
            <Select
              classNamePrefix="custom-select-workstatus"
              className="workstatus-dropdown"
              options={uniqueWorkStatuses}
              value={uniqueWorkStatuses.find(
                (option) => option.value === selectedWorkStatus
              )}
              onChange={(selectedOption) => {
                setSelectedWorkStatus(
                  selectedOption ? selectedOption.value : ""
                );
              }}
              isClearable
              isSearchable={false}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                {[
                  "MID",
                  "Asset Name",
                  "Report Time",
                  "Date",
                  "Asset ID",
                  "Area",
                  "Priority",
                  "Workstatus",
                  "Description",
                  "",
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.MID}</td>
                  <td>{item.assetName}</td>
                  <td>{item.reportingTime}</td>
                  <td>{item.date}</td>
                  <td>{item.assetID}</td>
                  <td>{item.area}</td>
                  <td>{item.priority}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.workstatus)}>
                      {item.workstatus}
                    </div>
                  </td>
                  <td className="description">{item.description}</td>

                  <td className="actions">
                    <button
                      className="schedule-btn"
                      onClick={() => handleScheduleView(item)}
                    >
                      Schedule
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.rid)}
                    >
                      <RiDeleteBin6Line
                        style={{ width: "20px", height: "20px" }}
                      />
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

      {/* Modal for schedule Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Schedule Form</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            {/* Assign Dropdown */}
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Assign Technician:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workersList}
                  value={
                    workersList.find((w) => w.value === assignedWorker) || null
                  } // Ensure default value is handled
                  onChange={(selectedOption) => {
                    setAssignedWorker(selectedOption?.value || ""); // Ensure it's updated
                    console.log("Selected Worker:", selectedOption); // Debugging
                  }}
                  isClearable
                />
              </div>
              {/* Assign Date */}
              <div className="modal-content-field">
                <label>Assign Date:</label>
                <input
                  type="date"
                  value={assignDate}
                  min={today}
                  onChange={(e) => setAssignDate(e.target.value)}
                />
              </div>

              <div className="modal-content-field">
                {/* Assign Time */}
                <label>Assign Time:</label>
                <input
                  type="time"
                  value={assignTime}
                  onChange={(e) => setAssignTime(e.target.value)}
                />
              </div>

              <div className="modal-content-field">
                <label>Team Members:</label>
                <div className="TModal-outer-team">
                  <div className="TModal-team-members">
                    <input
                      type="text"
                      placeholder="Enter email"
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                    />
                    <button
                      type="button"
                      className="TModal-add-btn"
                      onClick={handleAddMember}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-content-field">
                <label></label>
                <div className="TModal-outer-team">
                  {/* Render only if team members exist */}
                  {teamMembers.length > 0 && (
                    <div className="TModal-team-list">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="TModal-team-member">
                          {member}{" "}
                          <IoMdCloseCircle
                            onClick={() => handleRemoveMember(index)}
                            style={{ color: "black" }}
                          />
                        </div>
                      ))}
                    </div>

                  )}
                </div>
              </div>
              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleAssignRequest}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorWO;
