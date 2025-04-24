import React, { useState, useEffect } from "react";
import "./../managerPage/css/table.css";
import "./../managerPage/css/TabSwitcher.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/person_four.jpg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";
import { useGetAcademyQuery, useCreateUserMutation, useGetDepartmentQuery, useCreateDepartmentMutation, useGetUsersQuery, useGetRolesQuery } from "../../slices/userApiSlice";
import Swal from "sweetalert2";

const SAdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Manager");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');  
  const [employeeId, setEmployeeId] = useState('');  
  const [image, setImage] = useState(img);

  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formError, setFormError] = useState(null);

  const { data: academies } = useGetAcademyQuery();
  const { data: department } = useGetDepartmentQuery();
  const { data: users, refetch} = useGetUsersQuery();
  const { data: roles } = useGetRolesQuery();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [data, setData] = useState([])
  console.log("data", data)

  const [adminRoleId, setAdminRoleId] = useState(null);
  console.log("users: ",roles)
  console.log("adminRole: ",adminRoleId)

  useEffect(() => {
    if (roles && Array.isArray(roles)) {
      roles.forEach(role => {
        const roleName = role?.name?.toLowerCase();
        const roleId = role?.roleId;

        if (roleName === 'admin') {
          setAdminRoleId(roleId);
        }
      });
    }
  }, [roles]);

  useEffect(() => {
    if (users) {
      setData(users);
    }
  }, [users]);

  const handleCreateUser = async () => {
    if (!name || !email || !password || !employeeId) {
      alert("Please fill all fields");
      return;
    }

    let imageFile = image; // your image input (e.g., from file input)

    if (!imageFile) {
      const response = await fetch("/default-user.jpg");
      const blob = await response.blob();
      imageFile = new File([blob], "default-user.jpg", { type: "image/jpeg" });
    }

    // If activeTab is "Manager", use the managerRoleId
    const roleId = activeTab === "Admin" ? adminRoleId : null;

    console.log("roleid: ", roleId)

    const newUser = {
      name,
      employeeId,
      email,
      password,
      academyId:"null",
      departmentId: activeTab !== "Manager" ? selectedDepartment : "null",
      roleId: roleId,
      image: imageFile,
    };
    console.log(newUser)

    try {
      const res = await createUser(newUser).unwrap();

      console.log("res", res)

      Swal.fire("Success", "User created successfully", "success");
      setName("");
      setEmail("");
      setEmployeeId("");
      setPassword("");
      refetch()
    } catch (err) {
      let errorMessage = "Something went wrong. Please try again.";

      if (err?.status === "PARSING_ERROR") {
        // response was a string, not JSON
        errorMessage = err?.data || errorMessage;
      } else if (err?.data?.message) {
        // if backend returns { message: "error text" }
        errorMessage = err.data.message;
      }

      // Show in Swal or a local error field
      Swal.fire("Error", errorMessage, "error");

      // OR if you want to show under the input:
      setFormError(errorMessage); // Add useState for this
    }

  };

  const handleAddUserClick = () => {
    if (activeTab === "Admin") setShowModal(true);
  };

  

  const filteredData = (users || []).filter(
    (item) =>
      item.role?.name.toLowerCase() === activeTab.toLowerCase() && // Compare role name to activeTab
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


  const getAcademyName = (academyId) => {
    const academy = academies?.find(a => a.academyId === academyId);
    return academy ? academy.name : "Unknown Academy";
  };

  const getDepartmentName = (departmentID) => {
    const depart = department?.find(d => d.departmentId === departmentID);
    return depart ? depart.name : "Unknown department";
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
                      // src={item.image}
                      alt="User"
                      onChange={(e) => setImage(e.target.files[0])}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{getAcademyName(item.academyId)}</td>
                  {activeTab !== "Manager" && <td>{getDepartmentName(item.departmentId)}</td>}
                  <td>{item.role ? item.role.name : "No Role"}</td>
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
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" />
              <input type="text" placeholder="EmployeeID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required autoComplete="off" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />

              <button className="AdminUser-add" type="submit" onClick={handleCreateUser}>
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
