import React, { useEffect, useState } from "react";
import "./css/TabSwitcher.css";
import "./css/table.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/defaultImage.png";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetAcademyQuery,
  useGetDepartmentQuery,
  useGetUsersQuery,
} from "../../slices/userApiSlice";
import { useGetUserByEmailQuery } from "../../slices/userApiSlice";
import {
  useGetMaintenanceByTechnicianEmailQuery,
  useGetSchedulesByTechnicianEmailQuery,
} from "../../slices/maintenanceApiSlice";

import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import Swal from "sweetalert2";
import Tippy from "@tippyjs/react";

const WorkAssigned = ({ email }) => {
  const { data: maintenanceData, isLoading: maintenanceLoading } = useGetMaintenanceByTechnicianEmailQuery(email);
  const { data: repairData, isLoading: repairLoading } = useGetSchedulesByTechnicianEmailQuery(email);
  // console.log("email", email);

  if (maintenanceLoading || repairLoading) {
    return <span>Loading...</span>;
  }

  const maintenanceCount = Array.isArray(maintenanceData) ? maintenanceData.length : 0;
  const repairCount = Array.isArray(repairData) ? repairData.length : 0;

  const totalWork = maintenanceCount + repairCount;

  return <span>{totalWork}</span>;
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Technician");
  const rowsPerPage = 10;

  const { data: academies, isLoading: academiesLoading } = useGetAcademyQuery();
  const { data: department, isLoading: departmentLoading } =
    useGetDepartmentQuery();
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
  );
  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);

  const getAcademyName = (academyId) => {
    const academy = academies?.find((a) => a.academyId === academyId);
    return academy ? academy.name : "Unknown Academy";
  };

  const getDepartmentName = (departmentID) => {
    const depart = department?.find((d) => d.departmentId === departmentID);
    return depart ? depart.name : "Unknown department";
  };

  // Filter data based on selected tab and search

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!users || !userByEmial?.user?.academyId) return;

    const loginAcademyId = userByEmial.user.academyId?.trim().toLowerCase();
    console.log("loh", loginAcademyId);

    // Filter users based on login user's academy
    const filtered = users.filter(
      (user) => user.academyId?.trim().toLowerCase() === loginAcademyId
    );
    console.log("mm", filtered);

    setData(filtered);
  }, [users, userByEmial]);

  console.log("DAT", data);

  const filteredData = (data || []).filter(
    (item) =>
      item.role?.name.toLowerCase() === activeTab.toLowerCase() &&
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const emails = displayedData.map((item) => item.email);
  console.log("emails", emails);
  
  // Sorting
  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });

  const sortData = (column, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const handleSort = (column) => {
    const newSortOrder =
      column === sortOrder.column
        ? !sortOrder.ascending // Toggle the sorting direction if the same column is clicked
        : true; // Start with ascending for a new column

    setSortOrder({
      column,
      ascending: newSortOrder,
    });
    sortData(column, newSortOrder);
  };

  useEffect(() => {
    const isLoading = academiesLoading || departmentLoading || usersLoading;

    if (isLoading) {
      Swal.fire({
        title: "Loading data...",
        html: "Please wait while we fetch the latest information",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [academiesLoading, departmentLoading, usersLoading]);

  return (
    <div className="user-dashboard">
      {/* Tab Switcher */}
      <div className="user-tab-container">
        <button
          className={`tab ${activeTab === "Supervisor" ? "active" : ""}`}
          onClick={() => setActiveTab("Supervisor")}
        >
          Supervisor
        </button>
        <button
          className={`tab ${activeTab === "Technician" ? "active" : ""}`}
          onClick={() => setActiveTab("Technician")}
        >
          Technician
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ margin: "0px", marginTop: "14px" }} className="container">
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

        {/* Data Table */}
        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                {[
                  "Image",
                  "Name",
                  "Email",
                  "Location",
                  "Department",
                  "Role",
                  ...(activeTab === "Technician" ? ["Work Assigned"] : []),
                ].map((header, index) => (
                  <th key={index}>
                    {header === "Name" ||
                    header === "Location" ||
                    header === "Department" ? (
                      <div className="header-title">
                        {header}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() =>
                              handleSort(
                                header.toLowerCase().replace(" ", "", "")
                              )
                            }
                          >
                            <TiArrowSortedUp
                              style={{
                                color: "#305845",
                                transform:
                                  sortOrder.column ===
                                    header.toLowerCase().replace(" ", "") &&
                                  sortOrder.ascending
                                    ? "rotate(0deg)" // Ascending
                                    : sortOrder.column ===
                                        header.toLowerCase().replace(" ", "") &&
                                      !sortOrder.ascending
                                    ? "rotate(180deg)" // Descending
                                    : "rotate(0deg)", // Default
                                transition: "transform 0.3s ease",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      className="User-profile"
                      src={item.image || img}
                      alt="User"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.3)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </td>
                  <td className="description">
                    <Tippy content={item.name || ""} placement="top">
                      <span>
                        {item.name?.length > 20
                          ? item.name.substring(0, 20) + "..."
                          : item.name || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy content={item.email || ""} placement="top">
                      <span>
                        {item.email?.length > 20
                          ? item.email.substring(0, 20) + "..."
                          : item.email || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy
                      content={getAcademyName(item.academyId) || ""}
                      placement="top"
                    >
                      <span>
                        {getAcademyName(item.academyId)?.length > 20
                          ? getAcademyName(item.academyId).substring(0, 20) +
                            "..."
                          : getAcademyName(item.academyId) || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td className="description">
                    <Tippy
                      content={getDepartmentName(item.departmentId) || ""}
                      placement="top"
                    >
                      <span>
                        {getDepartmentName(item.departmentId)?.length > 20
                          ? getDepartmentName(item.departmentId).substring(
                              0,
                              20
                            ) + "..."
                          : getDepartmentName(item.departmentId) || ""}
                      </span>
                    </Tippy>
                  </td>

                  <td>{item.role ? item.role.name : "No Role"}</td>
                  {activeTab === "Technician" && (
                    // <td>{loading ? "Loading..." : totalWorkCount ?? 0}</td>
                    
                    <td>
                      <WorkAssigned email={item.email} />
                    </td>

                  )}
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

export default Users;
