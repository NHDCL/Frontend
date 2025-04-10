import React, { useState } from "react";
import "./css/TabSwitcher.css";
import "./css/table.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/person_four.jpg";
import { TiArrowSortedUp } from "react-icons/ti";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Technician");
  const rowsPerPage = 10;

  const [data, setData] = useState([
    {
      image: img,
      name: "Yangchen Wangmo",
      email: "yangchen@example.com",
      location: "Block-A-101",
      department: "Plumbing Team",
      role: "Technician",
    },
    {
      image: img,
      name: "Karma Tenzin",
      email: "karma@example.com",
      location: "Block-B-202",
      department: "Plumbing Team",
      role: "Supervisor",
    },
    {
      image: img,
      name: "Sonam zangmo",
      email: "sonam@example.com",
      location: "Block-C-303",
      department: "Plumbing Team",
      role: "Supervisor",
    },
    {
      image: img,
      name: "Jigme Norbu",
      email: "jigme@example.com",
      location: "Block-D-404",
      department: "Plumbing Team",
      role: "Technician",
    },
    {
      image: img,
      name: "Pema Choden",
      email: "pema@example.com",
      location: "Block-E-505",
      department: "Plumbing Team",
      role: "Supervisor",
    },
    {
      image: img,
      name: "Tshering Zangmo",
      email: "tshering@example.com",
      location: "Block-F-606",
      department: "Plumbing Team",
      role: "Technician",
    },
    {
      image: img,
      name: "Dorji Wangchuk",
      email: "dorji@example.com",
      location: "Block-G-707",
      department: "Plumbing Team",
      role: "Technician",
    },
    {
      image: img,
      name: "Kinley Dorji",
      email: "kinley@example.com",
      location: "Block-H-808",
      department: "Plumbing Team",
      role: "Supervisor",
    },
    {
      image: img,
      name: "Deki Wangmo",
      email: "deki@example.com",
      location: "Block-I-909",
      department: "Plumbing Team",
      role: "Supervisor",
    },
    {
      image: img,
      name: "Ugyen Tenzin",
      email: "ugyen@example.com",
      location: "Block-J-1010",
      department: "Plumbing Team",
      role: "Technician",
    },
  ]);

  // Filter data based on selected tab and search
  const filteredData = data.filter(
    (item) =>
      item.role === activeTab &&
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
    const newSortOrder = column === sortOrder.column
      ? !sortOrder.ascending // Toggle the sorting direction if the same column is clicked
      : true; // Start with ascending for a new column

    setSortOrder({
      column,
      ascending: newSortOrder,
    });
    sortData(column, newSortOrder);
  };

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
                {["Image", "Name", "Email", "Location", "Department", "Role"].map(
                  (header, index) => (
                    <th key={index}>
                      {header === "Name" || header === "Location" || header === "Department" ? (
                        <div className="header-title">
                          {header}
                          <div className="sort-icons">
                            <button
                              className="sort-btn"
                              onClick={() => handleSort(header.toLowerCase().replace(' ', '', ''))}
                            >
                              <TiArrowSortedUp
                                style={{
                                  color: "#305845",
                                  transform: sortOrder.column === header.toLowerCase().replace(' ', '') && sortOrder.ascending
                                    ? "rotate(0deg)"  // Ascending
                                    : sortOrder.column === header.toLowerCase().replace(' ', '') && !sortOrder.ascending
                                      ? "rotate(180deg)" // Descending
                                      : "rotate(0deg)",  // Default
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, index) => (
                <tr key={index}>
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
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.3)")
                      }
                      onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.location}</td>
                  <td>{item.department}</td>
                  <td>{item.role}</td>
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
