import React, { useState, useEffect } from "react";
import "./../managerPage/css/table.css";
import "./../managerPage/css/TabSwitcher.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/defaultImage.png";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";
import {
  useGetAcademyQuery,
  useCreateUserMutation,
  useGetDepartmentQuery,
  useGetUsersQuery,
  useSoftDeleteUserMutation,
} from "../../slices/userApiSlice";
import Swal from "sweetalert2";

const SAdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Manager");
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeID] = useState("");
  const [image] = useState(null);

  const [selectedAcademy] = useState("");
  const [selectedDepartment] = useState(null);
  const [formError, setFormError] = useState(null);

  const { data: academies } = useGetAcademyQuery();
  const { data: department } = useGetDepartmentQuery();
  const { data: users, refetch: refetchUsers } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();

  const [softDeleteUser] = useSoftDeleteUserMutation();

  const [adminRoleId, setAdminRoleId] = useState(null);
  console.log("users: ", users);

  useEffect(() => {
    if (users && Array.isArray(users)) {
      users.forEach((user) => {
        const roleName = user?.role?.name?.toLowerCase();
        const roleId = user?.role?.roleId;

        if (roleName === "admin") {
          setAdminRoleId(roleId);
        }
      });
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

    console.log("roleid: ", roleId);

    const newUser = {
      name,
      email,
      password,
      employeeId,
      academyId: selectedAcademy,
      departmentId: activeTab !== "Manager" ? selectedDepartment : null,
      roleId: roleId,
      image: imageFile,
    };

    try {
      const res = await createUser(newUser).unwrap();

      console.log("res", res);

      Swal.fire("Success", "User created successfully", "success");
      setName("");
      setEmail("");
      setPassword("");
      setEmployeeID("");
      setShowModal(false);
      refetchUsers();
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
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleDelete = async (userId) => {
    console.log("Deleting user with ID:", userId);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await softDeleteUser(userId).unwrap();
        Swal.fire("Deleted!", "User has been deleted.", "success");
        refetchUsers();
      } catch (error) {
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  const getAcademyName = (academyId) => {
    const academy = academies?.find((a) => a.academyId === academyId);
    return academy ? academy.name : "Unknown Academy";
  };

  const getDepartmentName = (departmentID) => {
    const depart = department?.find((d) => d.departmentId === departmentID);
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
                  activeTab !== "Admin" ? "Location" : "",
                  activeTab !== "Admin" && activeTab !== "Manager"
                    ? "Department"
                    : "",
                  "Role",
                  activeTab === "Admin" ? "Action" : "",
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
                      src={item.image || img}
                      alt="User"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        objectFit: "cover", // This ensures the image maintains aspect ratio
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
                  {activeTab !== "Admin" && (
                    <td>{getAcademyName(item.academyId)}</td>
                  )}
                  {activeTab !== "Admin" && activeTab !== "Manager" && (
                    <td>{getDepartmentName(item.departmentId)}</td>
                  )}
                  <td>{item.role ? item.role.name : "No Role"}</td>
                  {activeTab === "Admin" && (
                    <td>
                      <RiDeleteBin6Line
                        onClick={() => handleDelete(item.userId)}
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "red",
                          cursor: "pointer",
                        }}
                      />
                    </td>
                  )}
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
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="EmployeeID"
                value={employeeId}
                onChange={(e) => setEmployeeID(e.target.value)}
                required
                autoComplete="off"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
              />

              <button
                className="AdminUser-add"
                type="submit"
                onClick={handleCreateUser}
              >
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
