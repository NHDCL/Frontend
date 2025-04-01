import React, { useState } from "react";
import "./../managerPage/css/table.css";
import "./../managerPage/css/TabSwitcher.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/person_four.jpg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";

const SAdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Manager");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const handleAddUserClick = () => {
    if (activeTab === "Admin") setShowModal(true);
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
    {
      image: img,
      name: "Dorji Wangchuk",
      email: "dorji@example.com",
      location: "Block-G-707",
      department: "Electrical Team",
      role: "Admin",
    },
    {
      image: img,
      name: "Ugyen Tenzin",
      email: "ugyen@example.com",
      location: "Block-J-1010",
      department: "Mechanical Team",
      role: "Admin",
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
    if (activeTab === "Admin") {
      setData(
        data.filter((user, i) => !(user.role === "Admin" && i === index))
      );
    }
  };

  return (
    <div className="user-dashboard">
      <div className="user-tab-outer">
        <div className="user-tab-container">
          {["Manager", "Supervisor", "Technician", "Admin"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Admin" && (
          <div className="add-user" onClick={handleAddUserClick}>
            <AiOutlineUsergroupAdd style={{ fontSize: "20px" }} />
            <button style={{ color: "white" }}> Add {activeTab} </button>
          </div>
        )}
      </div>
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
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.location}</td>
                  {activeTab !== "Manager" && <td>{item.department}</td>}
                  <td>{item.role}</td>
                  <td>
                    {activeTab === "Admin" && (
                      <RiDeleteBin6Line
                        onClick={() => handleDelete(index)}
                        style={{ width: "20px", height: "20px", color: "red" }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="AdminUser-modal-overlay">
          <div className="AdminU-modal-content">
            <div className="AdminUser_close">
              <h2>Add Admin</h2>
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
              <input type="text" placeholder="Name" required autoComplete="off"/>
              <input type="email" placeholder="Email" required autoComplete="off"/>
              <input type="password" placeholder="Password" required autoComplete="off"/>

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

export default SAdminUser;
