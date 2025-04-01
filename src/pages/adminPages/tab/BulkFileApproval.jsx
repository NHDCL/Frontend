import React, { useState } from "react";
import "./../../managerPage/css/card.css";
import "./../../managerPage/css/table.css";
import "./../../managerPage/css/form.css";
import { IoIosSearch } from "react-icons/io";
import { FaFileAlt } from "react-icons/fa";

const BulkFileApproval = () => {
  const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

  
  const [data, setData] = useState([
    { id: 1, fileName: "Batch1.xlsx", uploadedBy: "12210100@nhdcl.bt" },
    { id: 2, fileName: "Batch1.xlsx", uploadedBy: "12210100@nhdcl.bt" },
    { id: 3, fileName: "Batch1.xlsx", uploadedBy: "12210100@nhdcl.bt" },
    { id: 4, fileName: "Batch1.xlsx", uploadedBy: "12210100@nhdcl.bt" },
    { id: 5, fileName: "Batch1.xlsx", uploadedBy: "12210100@nhdcl.bt" },
    { id: 6, fileName: "Batch1.xlsx", uploadedBy: "12210100@nhdcl.bt" },
  ]);

  const handleApprove = (id) => {
    alert(`File ${id} approved.`);
  };

  const handleDecline = (id) => {
    alert(`File ${id} declined.`);
  };

  const sortedData = [...data].sort((a, b) => b.rid - a.rid);

  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesSearch;
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
        </div>
        <div className="table-container">
          <table className="RequestTable">
            <thead className="table-header">
              <tr>
                <th>Sl.No</th>
                <th>File</th>
                <th>Uploaded By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <FaFileAlt style={{ marginRight: "5px" }} />
                    {item.fileName}
                  </td>
                  <td>{item.uploadedBy}</td>
                  <td className="Bulk-actions">
                    <button className="Bulk-download-btn">Download</button>
                    <button
                      className="accept-btn"
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleDecline(item.id)}
                    >
                      Decline
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
      </div>
    // </div>
  );
};

export default BulkFileApproval;
