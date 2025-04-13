import React, { useState, useEffect } from "react";
import "./../managerPage/css/table.css";
import "./../managerPage/css/TabSwitcher.css";
import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/person_four.jpg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { RiApps2AddFill } from "react-icons/ri";
import Swal from "sweetalert2";
import {
  useGetAcademyQuery,
  useCreateUserMutation,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useSoftDeleteUserMutation,
  useGetUsersQuery,
} from "../../slices/userApiSlice";

const AdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Manager");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showModalDepartment, setShowModalDepartment] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAcademy, setSelectedAcademy] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [departments, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  const { data: academies } = useGetAcademyQuery();
  const { data: department, refetch } = useGetDepartmentQuery();

  const { data: users, refetch: refetchUsers } = useGetUsersQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [softDeleteUser] = useSoftDeleteUserMutation();

  const [formError, setFormError] = useState(null);

  // console.log("SA: ", selectedAcademy.value)
  console.log("dep: ", department);

  // Find the Manager's roleId (assuming the user has a 'role' object with an id field)
  const [managerRoleId, setManagerRoleId] = useState(null);
  const [technicianRoleId, setTechnicianRoleId] = useState(null);
  const [supervisorRoleId, setSupervisorRoleId] = useState(null);

  useEffect(() => {
    if (users && Array.isArray(users)) {
      users.forEach((user) => {
        const roleName = user?.role?.name?.toLowerCase();
        const roleId = user?.role?.roleId;

        if (roleName === "manager") setManagerRoleId(roleId);
        else if (roleName === "technician") setTechnicianRoleId(roleId);
        else if (roleName === "supervisor") setSupervisorRoleId(roleId);
      });
    }
  }, [users]);
  console.log(users);

  const handleAddUserClick = () => setShowModal(true);
  const handleAddDepartmentClick = () => setShowModalDepartment(true);

  console.log("AAA", academies);

  const handleCreateUser = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !selectedAcademy ||
      (activeTab !== "Manager" && !selectedDepartment)
    ) {
      alert("Please fill all fields");
      return;
    }

    const roleId =
      activeTab === "Manager"
        ? managerRoleId
        : activeTab === "Supervisor"
        ? supervisorRoleId
        : technicianRoleId;

    const newUser = {
      name,
      email,
      password,
      academyId: selectedAcademy.value,
      departmentId: activeTab !== "Manager" ? selectedDepartment.value : null,
      roleId,
    };

    try {
      const res = await createUser(newUser).unwrap();
      Swal.fire("Success", "User created successfully", "success");
      setName("");
      setEmail("");
      setPassword("");
      setSelectedAcademy(null);
      setSelectedDepartment(null);
      refetchUsers();

      await refetchUsers();
    } catch (err) {
      let errorMessage = "Something went wrong. Please try again.";
      if (err?.status === "PARSING_ERROR")
        errorMessage = err?.data || errorMessage;
      else if (err?.data?.message) errorMessage = err.data.message;

      Swal.fire("Error", errorMessage, "error");
      setFormError(errorMessage);
    }
  };

  const handleCreateDepartment = async () => {
    if (!departments || !description) {
      alert("Please fill in all fields");
      return;
    }

    const departmentData = { name: departments, description };

    try {
      const res = await createDepartment(departmentData).unwrap();
      Swal.fire({
        icon: "success",
        title: "Department Added",
        text: "The department was added successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      setDepartment("");
      setDescription("");
      refetch();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to add department. Please try again.",
      });
    }
  };

  const filteredData = (users || []).filter(
    (item) =>
      item.role?.name.toLowerCase() === activeTab.toLowerCase() &&
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  console.log("FD", filteredData);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
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

  console.log("GAN", getAcademyName);

  return (
    <div className="user-dashboard">
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

        <div className="addUserDep">
          <div className="add-user" onClick={handleAddUserClick}>
            <AiOutlineUsergroupAdd style={{ fontSize: "20px" }} />
            <button style={{ color: "white" }}>Add {activeTab}</button>
          </div>

          <div className="add-user" onClick={handleAddDepartmentClick}>
            <RiApps2AddFill style={{ fontSize: "20px" }} />
            <button style={{ color: "white" }}>Add Department</button>
          </div>
        </div>
      </div>

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

        <div className="table-container">
          <table className="RequestTable">
            <thead>
              <tr>
                {[
                  "Image",
                  "Name",
                  "Email",
                  "Academy",
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
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.academies}</td>
                  {activeTab !== "Manager" && <td>{item.department}</td>}
                  <td>{item.role?.name || "No Role"}</td>
                  <td>{getAcademyName(item.academyId)}</td>
                  {activeTab !== "Manager" && (
                    <td>{getDepartmentName(item.departmentId)}</td>
                  )}
                  <td>{item.role ? item.role.name : "No Role"}</td>
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
            {totalPages > 5 && (
              <>
                <span>...</span>
                <button onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUser;
