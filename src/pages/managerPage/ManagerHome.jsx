import React, { useState } from "react";
import "./css/card.css";
import "./css/table.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";

const ManagerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(2);
  const [selectedRows, setSelectedRows] = useState([]); // To track selected rows
  const rowsPerPage = 7;

  const [data, setData] =useState ([
    {
      rid: "#1001",
      assetName: "Air Conditioner",
      name: "Yangchen",
      phone: "17748323",
      location: "Block-A-101",
      description: "Cooling issue disgfbjkdbv;ojdflgbvjd;fb",
    },
    {
      rid: "#1002",
      assetName: "Heater",
      name: "Sonam",
      phone: "17654321",
      location: "Block-B-202",
      description: "Not working properly",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
    },
    {
      rid: "#1004",
      assetName: "Refrigerator",
      name: "Karma",
      phone: "17432156",
      location: "Block-D-404",
      description: "Leaking water",
    },
    {
      rid: "#1005",
      assetName: "Microwave",
      name: "Pema",
      phone: "17345678",
      location: "Block-E-505",
      description: "Not heating food",
    },
    {
      rid: "#1006",
      assetName: "Geyser",
      name: "Dawa",
      phone: "17234567",
      location: "Block-F-606",
      description: "No hot water",
    },
    {
      rid: "#1007",
      assetName: "Vacuum Cleaner",
      name: "Thinley",
      phone: "17123456",
      location: "Block-G-707",
      description: "Low suction power",
    },
    {
      rid: "#1008",
      assetName: "Television",
      name: "Jigme",
      phone: "17678901",
      location: "Block-H-808",
      description: "No signal detected",
    },
    {
      rid: "#1009",
      assetName: "Laptop",
      name: "Dorji",
      phone: "17543210",
      location: "Block-I-909",
      description: "Battery not charging",
    },
    {
      rid: "#1010",
      assetName: "Fan",
      name: "Choki",
      phone: "17456789",
      location: "Block-J-1010",
      description: "Making noise",
    },
  ]);

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
  const handleDeleteRow = (rid) => {
    const updatedData = data.filter((item) => item.rid !== rid);
    setData(updatedData); // Update the state
  };

  return (
    <div className="ManagerDashboard">
      <div className="cardwrap">
        {/* Card counts */}
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total technician Count</h3>
            <p className="count">45</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total technician Count</h3>
            <p className="count">45</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total technician Count</h3>
            <p className="count">56</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total technician Count</h3>
            <p className="count">78</p>
          </div>
        </div>
      </div>

      {/* Home table */}
      <h3>Latest request</h3>
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

          <select>
            <option>Priority</option>
            <option>Minor</option>
            <option>Major</option>
          </select>
        </div>
        <table>
          <thead className="table-header">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === displayedData.length} // Select all checkboxes when all rows are selected
                  onChange={() =>
                    setSelectedRows(
                      selectedRows.length === displayedData.length
                        ? []
                        : displayedData.map((item) => item.rid)
                    )
                  }
                />
              </th>
              {[
                "RID",
                "Asset Name",
                "Name",
                "Phone Number",
                "Location",
                "Description",
              ].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>
                {selectedRows.length > 0 ? (
                  <button className="delete-all-btn" onClick={handleDeleteSelected}>
                    <RiDeleteBin6Line style={{ width: "20px", height: "20px", color:"red" }} />
                  </button>
                ) : (
                  " "
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.rid)}
                    onChange={() => handleSelectRow(item.rid)}
                  />
                </td>
                <td>{item.rid}</td>
                <td>{item.assetName}</td>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.location}</td>
                <td className="description">{item.description}</td>
                <td className="actions">
                  <button className="view-btn">View</button>
                  <button className="delete-btn" onClick={() => handleDeleteRow(item.rid)}>
                    <RiDeleteBin6Line
                      style={{ width: "20px", height: "20px" }}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
        {selectedRows.length > 0 && (
          <button
            className="delete-selected-btn"
            onClick={handleDeleteSelected}
          ></button>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
