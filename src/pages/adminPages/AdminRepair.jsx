import React, { useState, useEffect } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import Select from "react-select";
import { useGetRepairRequestQuery } from "../../slices/maintenanceApiSlice";
import { useGetAcademyQuery } from "../../slices/userApiSlice";
import Tippy from "@tippyjs/react";
import Swal from "sweetalert2";
import { TiArrowSortedUp } from "react-icons/ti";

const AdminRepair = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const rowsPerPage = 10;
  const {
    data: repairRequest,
    isLoading,
    refetch: refetchRepairRequest,
  } = useGetRepairRequestQuery();
  const { data: academy } = useGetAcademyQuery();

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!repairRequest) return;
    setData(repairRequest);
  }, [repairRequest]);

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading repairs...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  // Function to get the class based on workstatus
  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status"; // Gray color
      case "inprogress":
        return "in-progress-status"; // Yellow color
      case "completed":
        return "completed-status"; // Green color
      default:
        return "";
    }
  };

  const getAcademyName = (academyID) => {
    const match = academy?.find((a) => a.academyId === academyID);
    return match ? match.name : "Unknown";
  };

  // Extract unique priorities from data
  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(data.map((item) => item.priority?.toLowerCase()).filter(Boolean))
    ).map((priority) => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
    })),
  ];

  // Extract unique work statuses from data
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.status?.toLowerCase()))).map(
      (status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })
    ),
  ];

  const uniqueLocation = [
    { value: "", label: "All Location" },
    ...Array.from(
      new Set(data.map((item) => getAcademyName(item.academyId)?.toLowerCase()))
    ).map((location) => ({
      value: location,
      label: location.charAt(0).toUpperCase() + location.slice(1),
    })),
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.repairID - a.repairID);
  const filteredData = sortedData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      item.repairID?.toString().toLowerCase().includes(searchLower) ||
      Object.values(item).some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(searchLower)
      );

    const matchesPriority =
      selectedPriority === "" ||
      item.priority?.toLowerCase() === selectedPriority.toLowerCase();

    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    const matchesLocation =
      selectedLocation === "" ||
      getAcademyName(item.academyId)?.toLowerCase() ===
        selectedLocation.toLowerCase();

    return (
      matchesSearch && matchesPriority && matchesWorkStatus && matchesLocation
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (repairID) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(repairID)
        ? prevSelectedRows.filter((item) => item !== repairID)
        : [...prevSelectedRows, repairID]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter(
      (item) => !selectedRows.includes(item.repairID)
    );
    // Update the data with the filtered result after deletion
    setData(updatedData);
    setSelectedRows([]); // Reset selected rows after deletion
  };

  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  const sortData = (column, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const handleSort = (field) => {
    const ascending = sortOrder.column === field ? !sortOrder.ascending : true;

    const sorted = [...data].sort((a, b) => {
      const aValue = getNestedValue(a, field);
      const bValue = getNestedValue(b, field);

      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });

    setData(sorted);
    setSortOrder({ column: field, ascending });
  };
  const getNestedValue = (obj, path) => {
    return path?.split(".").reduce((acc, part) => acc && acc[part], obj) ?? "";
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

            {/* location dropdown */}
            <Select
              classNamePrefix="custom-select-workstatus"
              className="workstatus-dropdown"
              options={uniqueLocation}
              value={uniqueLocation.find(
                (option) => option.value === selectedLocation
              )}
              onChange={(selectedOption) => {
                setSelectedLocation(selectedOption ? selectedOption.value : "");
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
                  { label: "Sl. No.", field: null },
                  { label: "Image", field: null }, // first image if multiple
                  { label: "Name", field: "name" },
                  { label: "Email", field: "email" },
                  { label: "Phone", field: "phoneNumber" },
                  { label: "Area", field: "area" },
                  { label: "Location", field: null },
                  { label: "Priority", field: "priority" },
                  { label: "Workstatus", field: "status" },
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
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      className="User-profile"
                      src={item.images[0]}
                      alt="User"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td className="description">
                    <Tippy content={item.name || ""} placement="top">
                      <span>
                        {item.name
                          ? item.name.length > 20
                            ? item.name.substring(0, 20) + "..."
                            : item.name
                          : ""}
                      </span>
                    </Tippy>
                  </td>

                  <td className="description">
                    <Tippy content={item.email || ""} placement="top">
                      <span>
                        {item.email
                          ? item.email.length > 20
                            ? item.email.substring(0, 20) + "..."
                            : item.email
                          : ""}
                      </span>
                    </Tippy>
                  </td>

                  <td>{item.phoneNumber || ""}</td>

                  <td className="description">
                    <Tippy content={item.area || ""} placement="top">
                      <span>
                        {item.area
                          ? item.area.length > 20
                            ? item.area.substring(0, 20) + "..."
                            : item.area
                          : ""}
                      </span>
                    </Tippy>
                  </td>

                  <td className="description">
                    <Tippy
                      content={getAcademyName(item.academyId) || ""}
                      placement="top"
                    >
                      <span>
                        {getAcademyName(item.academyId)
                          ? getAcademyName(item.academyId).length > 20
                            ? getAcademyName(item.academyId).substring(0, 20) +
                              "..."
                            : getAcademyName(item.academyId)
                          : ""}
                      </span>
                    </Tippy>
                  </td>

                  <td>{item.priority}</td>
                  <td>
                    <div
                      className={getWorkOrderStatusClass(
                        item.status.toLowerCase().replace(/\s+/g, "")
                      )}
                    >
                      {item.status}
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
