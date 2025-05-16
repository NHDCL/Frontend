import React, { useState, useEffect } from "react";
import "./../managerPage/css/card.css";
import "./../managerPage/css/table.css";
import "./../managerPage/css/form.css";
import "./../managerPage/css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import Select from "react-select";
import { useGetMaintenanceRequestQuery } from "../../slices/maintenanceApiSlice";
import { useGetAssetQuery } from "../../slices/assetApiSlice";
import { useGetAcademyQuery } from "../../slices/userApiSlice";
import Tippy from "@tippyjs/react";
import Swal from "sweetalert2";
import { TiArrowSortedUp } from "react-icons/ti";

const AdminMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const {
    data: maintenanceRequest,
    isLoading,
    refetch: refetchMaintenanceRequest,
  } = useGetMaintenanceRequestQuery();
  const { data: assetData, refetch: refetchAssetData } = useGetAssetQuery();
  const { data: academy } = useGetAcademyQuery();

  const rowsPerPage = 10;
  const [data, setData] = useState([]);

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading maintenance...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  useEffect(() => {
    if (maintenanceRequest && assetData) {
      const filtered = maintenanceRequest
        .map((request) => {
          const matchedAsset = assetData.find(
            (a) => a.assetCode === request.assetCode
          );

          if (matchedAsset) {
            console.log(
              `Match found for assetCode ${request.assetCode}:`,
              matchedAsset.title
            );
            return {
              ...request,
              assetName: matchedAsset.title, // Attach the asset name
              academyID: matchedAsset.academyID,
            };
          }

          return null;
        })
        .filter((r) => r !== null);

      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(sorted);
    }
  }, [maintenanceRequest, assetData]);

  const getAcademyName = (academyID) => {
    const match = academy?.find((a) => a.academyId === academyID);
    return match ? match.name : "Unknown";
  };

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
      new Set(data.map((item) => getAcademyName(item.academyID)?.toLowerCase()))
    ).map((location) => ({
      value: location,
      label: location.charAt(0).toUpperCase() + location.slice(1),
    })),
  ];

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.assetCode - a.assetCode);

const filteredData = sortedData.filter((item) => {
  const searchLower = searchTerm.toLowerCase();

  const matchesSearch =
    item.maintenanceID?.toString().toLowerCase().includes(searchLower) ||
    Object.values(item).some(
      (value) =>
        value != null &&
        value.toString().toLowerCase().includes(searchLower)
    );

  const matchesWorkStatus =
    selectedWorkStatus === "" ||
    item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

  const matchesLocation =
    selectedLocation === "" ||
    getAcademyName(item.academyID)?.toLowerCase() ===
      selectedLocation.toLowerCase();

  return matchesSearch && matchesWorkStatus && matchesLocation;
});


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });

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

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
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
                  { label: "Asset Code", field: "assetCode" },
                  { label: "Asset Name", field: "assetName" },
                  { label: "Description", field: "description" },
                  { label: "Schedule(month)", field: "repeat" },
                  { label: "From Date", field: "startDate" },
                  { label: "To Date", field: "endDate" },
                  // { label: "Assign to", field: "userEmail" },
                  { label: "Workstatus", field: null },
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
                  <td>{item.assetCode}</td>
                  <td className="description">
                    <Tippy content={item.assetName || ""} placement="top">
                      <span>
                        {item.assetName
                          ? item.assetName.length > 20
                            ? item.assetName.substring(0, 20) + "..."
                            : item.assetName
                          : ""}
                      </span>
                    </Tippy>
                  </td>

                  <td className="description">
                    <Tippy content={item.description || ""} placement="top">
                      <span>
                        {item.description
                          ? item.description.length > 20
                            ? item.description.substring(0, 20) + "..."
                            : item.description
                          : ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>{item.repeat}</td>
                  <td>{formatDate(item.startDate)}</td>
                  <td>{formatDate(item.endDate)}</td>
                  <td>
                    <div
                      className={getWorkOrderStatusClass(
                        item.status.toLowerCase().replace(/\s+/g, "")
                      )}
                    >
                      {item.status}
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
