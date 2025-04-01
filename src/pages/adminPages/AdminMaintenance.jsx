import React, { useState } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";

const AdminMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");


  const rowsPerPage = 10;

  const [data, setData] = useState([ 
    {
      mid: "#1001",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "1",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "pending"
    },
    {
      mid: "#1002",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "3",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "pending"
    },
    {
      mid: "#1003",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "4",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "Completed"
    },
    {
      mid: "#1004",
      Assetname: "Yangchen",
      Description: "Temperature check",
      Schedule: "2",
      Lastworkorder: "Nov3, 2024",
      Nextworkorder: "March3, 2025",
      Assign: "Plumbing team",
      workstatus: "In progress"
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

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map(item => item.workstatus))).map(status => ({
      value: status,
      label: status
    }))
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesWorkStatus =
      selectedWorkStatus === "" || item.workstatus === selectedWorkStatus;

    return matchesSearch && matchesWorkStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
                  "MID",
                  "Asset Name",
                  "Description",
                  "Schedule(month)",
                  "Last Work Order",
                  "Next Work Order",
                  "Assign to",
                  "Workstatus"
                ].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
               
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  
                  <td>{item.mid}</td>
                  <td>{item.Assetname}</td>
                  <td>{item.Description}</td>
                  <td>{item.Schedule}</td>
                  <td>{item.Lastworkorder}</td>
                  <td>{item.Nextworkorder}</td>
                  <td>{item.Assign}</td>
                  <td>
                    <div className={getWorkOrderStatusClass(item.workstatus)}>
                      {item.workstatus}
                    </div>
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
      


    </div>
  );
};

export default AdminMaintenance;
