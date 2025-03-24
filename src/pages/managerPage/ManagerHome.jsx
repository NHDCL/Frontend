import React, { useState } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";

const ManagerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(2);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const rowsPerPage = 10;

  const [data, setData] = useState([
    {
      rid: "#1001",
      assetName: "Air Conditioner",
      name: "Yangchen",
      email: "yangchen@example.com",
      phone: "17748323",
      location: "Block-A-101",
      description: "Cooling issue",
      priority: "Major",
      image: img,
    },
    {
      rid: "#1002",
      assetName: "Heater",
      name: "Sonam",
      email: "sonam@example.com",
      phone: "17654321",
      location: "Block-B-202",
      description: "Not working properly",
      priority: "Minor",
      image: "https://via.placeholder.com/150",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      email: "tashi@example.com",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
      priority: "Major",
      image: "https://via.placeholder.com/150",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      email: "tashi@example.com",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
      priority: "Major",
      image: "https://via.placeholder.com/150",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      email: "tashi@example.com",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
      priority: "Major",
      image: "https://via.placeholder.com/150",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      email: "tashi@example.com",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
      priority: "Major",
      image: "https://via.placeholder.com/150",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      email: "tashi@example.com",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
      priority: "Major",
      image: "https://via.placeholder.com/150",
    },
    {
      rid: "#1003",
      assetName: "Washing Machine",
      name: "Tashi",
      email: "tashi@example.com",
      phone: "17567890",
      location: "Block-C-303",
      description: "Drum not spinning",
      priority: "Major",
      image: "https://via.placeholder.com/150",
    },
  ]);
  // Filtering data based on search and priority selection
  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPriority =
      selectedPriority === "" || item.priority === selectedPriority;

    return matchesSearch && matchesPriority;
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
  const handleDeleteRow = (rid) => {
    const updatedData = data.filter((item) => item.rid !== rid);
    setData(updatedData);
  };

  const handleView = (item) => {
    setModalData(item);
  };
  const handleCloseModal = () => {
    setModalData(null);
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

          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
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
                  <button
                    className="delete-all-btn"
                    onClick={handleDeleteSelected}
                  >
                    <RiDeleteBin6Line
                      style={{ width: "20px", height: "20px", color: "red" }}
                    />
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
                  <button className="view-btn" onClick={() => handleView(item)}>
                    View
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

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Repair Request</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <form className="repair-form">
              <div className="modal-content-field">
                <label>Name:</label>
                <input type="text" value={modalData.name} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Phone Number:</label>
                <input type="text" value={modalData.phone} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Email:</label>
                <input type="email" value={modalData.email} readOnly />
              </div>
              <div className="modal-content-field">
                <label>RID</label>
                <input type="text" value={modalData.rid} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Area:</label>
                <input type="text" value={modalData.location} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Name:</label>
                <input type="text" value={modalData.assetName} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Priority:</label>
                <input type="text" value={modalData.priority} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Description:</label>
                <textarea value={modalData.description} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Image:</label>
                <div className="profile-img">
                  {modalData.image ? (
                    <img
                      src={modalData.image}
                      alt="Asset"
                      className="modal-image"
                    />
                  ) : (
                    <div className="image-upload">
                      <span>📷</span>
                      <p>Click Here to Upload Image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-buttons">
                <button className="accept-btn">Accept</button>
                <button className="reject-btn">Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
