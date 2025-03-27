import React, { useState } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";

const Category = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ category: "", DepreciatedValue: "" });

  const rowsPerPage = 10;

  const [data, setData] = useState([
    { AID: "1", category: "Building", DepreciatedValue: "3" },
    { AID: "2", category: "Infrastructure and Services", DepreciatedValue: "3" },
    { AID: "3", category: "Facilities and Amenities", DepreciatedValue: "3" },
    { AID: "4", category: "Landscaping", DepreciatedValue: "3" },
    { AID: "5", category: "Machinery and Equipment", DepreciatedValue: "3" },
    { AID: "6", category: "Furniture and Fixture", DepreciatedValue: "3" }
  ]);

  // Filtering and sorting data
  const filteredData = [...data]
    .sort((a, b) => b.AID - a.AID)
    .filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSelectRow = (AID) => {
    setSelectedRows((prev) =>
      prev.includes(AID) ? prev.filter((item) => item !== AID) : [...prev, AID]
    );
  };

  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRows.includes(item.AID)));
    setSelectedRows([]);
  };

  const handleDeleteRow = (AID) => {
    setData(data.filter((item) => item.AID !== AID));
  };

  const handleEditRow = (item) => {
    setEditModalData({ ...item });
  };

  const handleSaveEdit = () => {
    setData((prevData) =>
      prevData.map((row) => (row.AID === editModalData.AID ? editModalData : row))
    );
    setEditModalData(null);
  };
  const handleCloseModal = () => {
    setModalData(null);
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
    setNewCategory({ category: "", DepreciatedValue: "" });
  };

  const handleSaveNewCategory = () => {
    if (newCategory.category && newCategory.DepreciatedValue) {
      const newAID = (Math.max(...data.map((item) => Number(item.AID)), 0) + 1).toString();
      setData([...data, { AID: newAID, ...newCategory }]);
      setShowAddModal(false);
    }
  };

  return (
    <div className="ManagerDashboard">
      <div className="container">
        {/* Search and Create Button */}
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
          <div className="create-category-btn">
            <IoMdAdd style={{ color: "#ffffff" }} />
            <button className="category-btn" onClick={handleAddCategory}>Create category</button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === displayedData.length && displayedData.length > 0}
                    onChange={() =>
                      setSelectedRows(
                        selectedRows.length === displayedData.length ? [] : displayedData.map((item) => item.AID)
                      )
                    }
                  />
                </th>
                {["SI.No", "Category", "Depreciated Value (%)"].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
                <th>
                  {selectedRows.length > 0 && (
                    <button className="delete-all-btn" onClick={handleDeleteSelected}>
                      <RiDeleteBin6Line style={{ width: "20px", height: "20px", color: "red" }} />
                    </button>
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
                      checked={selectedRows.includes(item.AID)}
                      onChange={() => handleSelectRow(item.AID)}
                    />
                  </td>
                  <td>{item.AID}</td>
                  <td>{item.category}</td>
                  <td>{item.DepreciatedValue}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => handleEditRow(item)}>
                      <FaEdit style={{ width: "20px", height: "20px" }} />
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteRow(item.AID)}>
                      <RiDeleteBin6Line style={{ width: "20px", height: "20px" }} />
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
      </div>
      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Create Asset Category</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <IoIosCloseCircle style={{ color: "#897463", width: "20px", height: "20px" }} />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Category Name:</label>
                <input
                  type="text"
                  value={newCategory.category}
                  onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value (%):</label>
                <input
                  type="number"
                  value={newCategory.DepreciatedValue}
                  onChange={(e) => setNewCategory({ ...newCategory, DepreciatedValue: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button className="accept-btn" style={{ width: "80px" }} onClick={handleSaveNewCategory}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Edit Modal */}
      {editModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Edit Asset category</h2>
              <button className="close-btn" onClick={() => setEditModalData(null)}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Category:</label>
                <input
                  type="text"
                  value={editModalData.category}
                  onChange={(e) => setEditModalData({ ...editModalData, category: e.target.value })}
                />
              </div>

              <div className="modal-content-field">
                <label>Depreciated Value (%):</label>
                <input
                  type="number"
                  value={editModalData.DepreciatedValue}
                  onChange={(e) => setEditModalData({ ...editModalData, DepreciatedValue: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button className="accept-btn" style={{ width: "80px" }} onClick={handleSaveEdit}>Save</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
