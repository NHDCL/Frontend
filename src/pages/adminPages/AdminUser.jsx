import React, { useState } from "react";
import "./../managerPage/css/table.css";
import "./../managerPage/css/TabSwitcher.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/person_four.jpg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";

const academies = ["Gyelpozhing", "Tareythang", "Pemathang"];
const departments = ["Plumbing", "Electrical", "Mechanical"];

const AdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Manager");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const handleAddUserClick = () => {
    setShowModal(true);
  };

  const [data, setData] = useState([
    {
      image: img,
      name: "Tenzin Om",
      email: "Omtenzin@gmail.com",
      location: "Khotokha",
      role: "Manager",
    },
    {
      image: img,
      name: "Yangchen Wangmo",
      email: "Omtenzin@gmail.com",
      location: "Khotokha",
      role: "Manager",
    },
    {
      image: img,
      name: "Pema",
      email: "Omtenzin@gmail.com",
      location: "Pemathang",
      role: "Manager",
    },
    {
      image: img,
      name: "Dawa",
      email: "Omtenzin@gmail.com",
      location: "Gyelpozhing",
      role: "Manager",
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
      name: "Sonam Zangmo",
      email: "sonam@example.com",
      location: "Block-C-303",
      department: "Electrical Team",
      role: "Supervisor",
    },
    {
      image: img,
      name: "Pema Choden",
      email: "pema@example.com",
      location: "Block-E-505",
      department: "Mechanical Team",
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
      department: "Electrical Team",
      role: "Technician",
    },
    {
      image: img,
      name: "Ugyen Tenzin",
      email: "ugyen@example.com",
      location: "Block-J-1010",
      department: "Mechanical Team",
      role: "Technician",
    },
  ]);

  const filteredData = data.filter(
    (item) =>
      item.role === activeTab &&
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDelete = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="user-dashboard">
      {/* Tab Switcher */}
      <div className="user-tab-outer">
        <div className="user-tab-container">
          {["Manager", "Supervisor", "Technician"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Add User Button */}
        <div className="add-user" onClick={handleAddUserClick}>
          <AiOutlineUsergroupAdd style={{ fontSize: "20px" }} />
          <button style={{ color: "white" }}> Add {activeTab} </button>
        </div>
      </div>

      <div style={{ margin: "0px", marginTop: "14px" }} className="container">
        {/* Search Bar */}
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
            <thead>
              <tr>
                {[
                  "Image",
                  "Name",
                  "Email",
                  "Location",
                  activeTab !== "Manager" ? "Department" : "",
                  "Role",
                  " ",
                ]
                  .filter(Boolean)
                  .map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
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
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.location}</td>
                  {activeTab !== "Manager" && <td>{item.department}</td>}
                  <td>{item.role}</td>
                  <td>
                    <RiDeleteBin6Line
                      onClick={() => handleDelete(index)}
                      style={{ width: "20px", height: "20px", color: "red" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      {/* Add Academy Modal */}
      {showModal && (
        <div className="AdminUser-modal-overlay">
          <div className="AdminU-modal-content">
            <div className="AdminUser_close">
              <h2>Add {activeTab}</h2>
              <button
                className="AdminUser-close-btn"
                onClick={() => setShowModal(false)}
              >
                <IoIosCloseCircle
                  style={{
                    color: "#897463",
                    width: "20px",
                    height: "20px",
                    marginRight: "-120px",
                  }}
                />
              </button>
            </div>
            <div className="AdminUser-modal-content">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <Select
                classNamePrefix="custommm-select-workstatus"
                options={academies.map((a) => ({ value: a, label: a }))}
                placeholder="Select Academy"
                isClearable
                isSearchable={false}
                required
              />
              {activeTab !== "Manager" && (
                <Select
                  isClearable
                  isSearchable={false}
                  classNamePrefix="custommm-select-workstatus"
                  options={departments.map((d) => ({ value: d, label: d }))}
                  placeholder="Select Department"
                  required
                />
              )}
              <button className="AdminUser-add" type="submit">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUser;
