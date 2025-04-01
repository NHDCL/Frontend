import React, { useState, useRef } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import Select from "react-select";

const AdminRepair = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");


  const rowsPerPage = 10;


  const [data, setData] = useState([
    {
      rid: "#1001",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Minor",
      workstatus: "pending"
    },
    {
      rid: "#1002",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Major",
      workstatus: "In progress"
    },
    {
      rid: "#1003",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Major",
      workstatus: "Completed"
    },
    {
      rid: "#1004",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Minor",
      workstatus: "pending"
    },
    {
      rid: "#1005",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Major",
      workstatus: "In progress"
    },
    {
      rid: "#1006",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Major",
      workstatus: "In progress"
    },
    {
      rid: "#1007",
      image: img,
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      Area: "Block-A-101",
      priority: "Major",
      workstatus: "pending"
    }
  ]);


  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status";  // Gray color
      case "In progress":
        return "in-progress-status";  // Yellow color
      case "Completed":
        return "completed-status";  // Green color
      default:
        return "";
    }
  };

  // Extract unique priorities from data
  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(new Set(data.map(item => item.priority))).map(priority => ({
      value: priority,
      label: priority
    }))
  ];

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map(item => item.workstatus))).map(status => ({
      value: status,
      label: status
    }))
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.rid - a.rid);
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

  const handleSelectRow = (rid) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rid)
        ? prevSelectedRows.filter((item) => item !== rid)
        : [...prevSelectedRows, rid]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((item) => !selectedRows.includes(item.rid));
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
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
              value={uniquePriorities.find(option => option.value === selectedPriority)} // Ensure selected value is an object
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
              value={uniqueWorkStatuses.find(option => option.value === selectedWorkStatus)}
              onChange={(selectedOption) => {
                setSelectedWorkStatus(selectedOption ? selectedOption.value : "");
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
                  "RID",
                  "Image",
                  "Name",
                  "Email",
                  "phone",
                  "Area",
                  "Priority",
                  "Workstatus"
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.rid}</td>
                  <td>
                    <img
                      className="User-profile"
                      src={item.image}
                      alt="User"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                  <td>{item.Area}</td>
                  <td>{item.priority}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.workstatus)}>
                      {item.workstatus}
                    </div>
                  </td>
                  {/* <td className="actions">
                    <button className="schedule-btn" onClick={() => handleScheduleView(item)}>
                      Schedule
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.rid)}
                    >
                      <RiDeleteBin6Line style={{ width: "20px", height: "20px" }} />
                    </button>
                  </td> */}
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

      

    </div>
  );
};

export default AdminRepair;


