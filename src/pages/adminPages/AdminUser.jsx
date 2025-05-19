import React, { useState, useEffect } from "react";
import "./../managerPage/css/table.css";
import "./../managerPage/css/TabSwitcher.css";
import "./../managerPage/css/dropdown.css";
import "./../managerPage/css/form.css";
// import "./css/AdminAcademies.css";

import { IoIosSearch } from "react-icons/io";
import img from "../../assets/images/defaultImage.png";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { RiApps2AddFill } from "react-icons/ri";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetAcademyQuery,
  useCreateUserMutation,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useGetUsersQuery,
  useGetRolesQuery,
  useSoftDeleteUserMutation,
  useDeleteDepartmentMutation,
  useUpdateDepartmentMutation,

} from "../../slices/userApiSlice";
import Swal from "sweetalert2";
import Tippy from "@tippyjs/react";
import { FaEdit } from "react-icons/fa";

const AdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Department");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showModalDepartment, setShowModalDepartment] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [image, setImage] = useState(img);
  const [selectedAcademy, setSelectedAcademy] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [departments, setDepartment] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [selectedId, setSelectedId] = useState(null);


  const { data: academies, isLoading: isLoadingAcademies } =
    useGetAcademyQuery();
  const {
    data: department,
    refetch: refetchDepartments,
    isLoading: isLoadingDepartments,
  } = useGetDepartmentQuery();
  const {
    data: users,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useGetUsersQuery();
  const [updateDepartment, { isLoading: updating }] = useUpdateDepartmentMutation();

  const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery();

  const [createDepartment] = useCreateDepartmentMutation();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [softDeleteUser] = useSoftDeleteUserMutation();
  const [formError, setFormError] = useState(null);
  const [emailError, setEmailError] = useState("");

  // Find the Manager's roleId (assuming the user has a 'role' object with an id field)
  const [managerRoleId, setManagerRoleId] = useState(null);
  const [technicianRoleId, setTechnicianRoleId] = useState(null);
  const [supervisorRoleId, setSupervisorRoleId] = useState(null);

  useEffect(() => {
    if (
      isLoadingUsers ||
      isLoadingAcademies ||
      isLoadingDepartments ||
      isLoadingRoles
    ) {
      Swal.fire({
        title: "Loading data...",
        text: "Please wait while we fetch the latest information",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      // Only close if the Sweet Alert is currently open
      if (Swal.isVisible()) {
        Swal.close();
      }
    }
  }, [
    isLoadingUsers,
    isLoadingAcademies,
    isLoadingDepartments,
    isLoadingRoles,
  ]);

  useEffect(() => {
    if (roles && Array.isArray(roles)) {
      roles.forEach((role) => {
        const roleName = role?.name?.toLowerCase();
        const roleId = role?.roleId;

        if (roleName === "manager") {
          setManagerRoleId(roleId);
        } else if (roleName === "technician") {
          setTechnicianRoleId(roleId);
        } else if (roleName === "supervisor") {
          setSupervisorRoleId(roleId);
        }
      });
    }
  }, [roles]);

  useEffect(() => {
    if (department && Array.isArray(department)) {
      setDepartment(department); // Set state from the fetched data
    }
  }, [department]);


  const handleEditDepartment = (id) => {
    if (!Array.isArray(departments)) {
      console.error("Departments is not an array");
      return;
    }

    const departmentToEdit = departments.find(
      (dept) => dept?.departmentId === id
    );

    if (departmentToEdit) {
      setEditData({
        name: departmentToEdit.name || "",
        description: departmentToEdit.description || "",
      });
      setSelectedId(id);
      setShowEditDepartmentModal(true);
    } else {
      console.error("Department not found");
    }
  };

  const handleUpdateDepartment = () => {
    updateDepartment({ id: selectedId, ...editData })
      .then(() => {
        Swal.fire("Updated!", "Department updated successfully.", "success");
        setShowEditDepartmentModal(false);
        setSelectedId(null);
        setEditData({ name: '', description: '' });
        refetchDepartments()
      })
      .catch((error) => {
        Swal.fire("Error", "Something went wrong.", "error");
      });
  };
  const [deleteDepartment] = useDeleteDepartmentMutation();

  // Add this function to handle department deletion
  const handleDeleteDepartment = async (departmentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this department?",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDepartment(departmentId).unwrap();
        Swal.fire("Deleted!", "Department has been deleted.", "success");
        refetchDepartments()
      } catch (error) {
        Swal.fire("Error", "Failed to delete department", "error");
      }
    }
  };

  console.log("AAA", academies);

  // Update the button click handlers to handle Department tab
  const handleAddUserClick = () => {
    if (activeTab === "Department") {
      setShowModalDepartment(true);
    } else {
      setShowModal(true);
    }
  };

  const handleAddDepartmentClick = () => {
    setShowModalDepartment(true);
  };

  const handleCreateUser = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !employeeId ||
      !selectedAcademy ||
      (activeTab !== "Manager" && !selectedDepartment)
    ) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill in all required fields",
        confirmButtonColor: "#897463",
      });
      return;
    }

    let imageFile = image; // your image input (e.g., from file input)

    if (!imageFile) {
      const response = await fetch("/default-user.jpg");
      const blob = await response.blob();
      imageFile = new File([blob], "default-user.jpg", { type: "image/jpeg" });
    }

    // If activeTab is "Manager", use the managerRoleId
    const roleId =
      activeTab === "Manager"
        ? managerRoleId
        : activeTab === "Supervisor"
          ? supervisorRoleId
          : activeTab === "Technician"
            ? technicianRoleId
            : null;

    // console.log("roleid: ", roleId)

    const newUser = {
      name,
      employeeId,
      email,
      password,
      academyId: selectedAcademy.value,
      departmentId: activeTab !== "Manager" ? selectedDepartment.value : null,
      roleId: roleId,
      image: imageFile,
    };

    try {
      const res = await createUser(newUser).unwrap();

      console.log("res", res);

      Swal.fire("Success", "User created successfully", "success");
      setName("");
      setEmail("");
      setEmployeeId("");
      setPassword("");
      setSelectedAcademy(null);
      setSelectedDepartment(null);

      setShowModal(false);

      await refetchUsers();
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

  const resetForm = () => {
    setName("");
    setEmployeeId("");
    setEmail("");
    setPassword("");
    setSelectedAcademy(null);
    setSelectedDepartment(null);
    setEmailError("");
  };

  const handleCreateDepartment = async () => {
    if (!newDepartmentName || !description) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill in department name and description",
        confirmButtonColor: "#897463",
      });
      return;
    }
    const departmentData = {
      name: newDepartmentName,
      description: description,
    };

    try {
      const res = await createDepartment(departmentData).unwrap();
      Swal.fire({
        icon: "success",
        title: "Department Added",
        text: "The department was added successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      setNewDepartmentName("")
      setDescription("");
      refetchDepartments();
      // console.log("Department created:", res);
      // setShowModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to add department. Please try again.",
      });
    }
  };

  const [data, setData] = useState(users);
  console.log("data", data);
  useEffect(() => {
    if (users) {
      setData(users);
    }
  }, [users]);

  // Update the filteredData to handle Department tab
  const filteredData =
    activeTab === "Department"
      ? (department || []).filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      : (data || []).filter(
        (item) =>
          item.role?.name.toLowerCase() === activeTab.toLowerCase() && // Compare role name to activeTab
          Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
      );

  console.log("FD", filteredData);

  const handleDelete = async (userId) => {
    console.log("Deleting user with ID:", userId);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this user?",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getAcademyName = (academyId) => {
    const academy = academies?.find((a) => a.academyId === academyId);
    return academy ? academy.name : "Unknown Academy";
  };

  const getDepartmentName = (departmentID) => {
    const depart = department?.find((d) => d.departmentId === departmentID);
    return depart ? depart.name : "Unknown department";
  };

  console.log("GAN", getAcademyName);

  const isValidEmail = (email) => {
    // Simple email regex pattern
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });
  const sortData = (column, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Normalize: Handle undefined, null, numbers, strings consistently
      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      // If both are numbers, compare numerically
      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        // Otherwise, compare as lowercase strings (for emails, names, etc.)
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const handleSort = (column) => {
    const newSortOrder =
      column === sortOrder.column ? !sortOrder.ascending : true;

    setSortOrder({
      column,
      ascending: newSortOrder,
    });

    sortData(column, newSortOrder);
  };

  return (
    <div className="user-dashboard">
      {/* Tab Switcher */}
      <div className="user-tab-outer">
        <div className="user-tab-container">
          {["Department", "Manager", "Supervisor", "Technician"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Add User/Department Button - Single button approach */}
        <div className="addUserDep">
          <div className="add-user" onClick={handleAddUserClick}>
            {activeTab === "Department" ? (
              <RiApps2AddFill style={{ fontSize: "20px" }} />
            ) : (
              <AiOutlineUsergroupAdd style={{ fontSize: "20px" }} />
            )}
            <button style={{ color: "white" }}> Add {activeTab} </button>
          </div>
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

        {/* Data Table - Conditional rendering based on activeTab */}
        <div className="table-container">
          {activeTab === "Department" ? (
            <table className="RequestTable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>
                    <div className="header-title">
                      Name
                      <div className="sort-icons">
                        <button
                          className="sort-btn"
                          onClick={() => handleSort("name")}
                          title="Sort by Name"
                        >
                          <TiArrowSortedUp
                            style={{
                              color: "#305845",
                              transform:
                                sortOrder.column === "name" &&
                                  sortOrder.ascending
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th>Description</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.departmentId}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="description">
                      <Tippy content={item.name || ""} placement="top">
                        <span>
                          {item.name
                            ? item.name.length > 20
                              ? item.name.substring(0, 20) + "..."
                              : item.name
                            : ""}
                        </span>
                      </Tippy>
                    </td>
                    <td className="description">
                      <Tippy content={item.description || ""} placement="top">
                        <span>
                          {item.description
                            ? item.description.length > 40
                              ? item.description.substring(0, 40) + "..."
                              : item.description
                            : ""}
                        </span>
                      </Tippy>
                    </td>
                    <td>
                      <button onClick={() => handleEditDepartment(item.departmentId)}>
                        <FaEdit style={{ width: "20px", height: "20px", color: "green" }} />
                      </button>
                    </td>
                    <td>
                      <RiDeleteBin6Line
                        onClick={() =>
                          handleDeleteDepartment(item.departmentId)
                        }
                        style={{ width: "20px", height: "20px", color: "red" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="RequestTable">
              {/* Your existing user table code here */}
              <thead>
                <tr>
                  {[
                    { label: "Image", field: null },
                    { label: "Name", field: "name" },
                    { label: "Email", field: "email" },
                    { label: "EmployeeId", field: "employeeId" },
                    { label: "Academy", field: null },
                    ...(activeTab !== "Manager"
                      ? [{ label: "Department", field: "departmentId" }]
                      : []),
                    { label: " ", field: null }, // for actions like view/edit
                  ]
                    .filter(Boolean)
                    .map((header, index) => (
                      <th key={index}>
                        {header.field ? (
                          <div className="header-title">
                            {header.label}
                            <div className="sort-icons">
                              <button
                                className="sort-btn"
                                onClick={() => handleSort(header.field)}
                                title={`Sort by ${header.label}`}
                              >
                                <TiArrowSortedUp
                                  style={{
                                    color: "#305845",
                                    transform:
                                      sortOrder.column === header.field &&
                                        sortOrder.ascending
                                        ? "rotate(0deg)"
                                        : "rotate(180deg)",
                                    transition: "transform 0.3s ease",
                                  }}
                                />
                              </button>
                            </div>
                          </div>
                        ) : (
                          header.label // Non-sortable label like "Action"
                        )}
                      </th>
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
                          objectFit: "cover",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.transform = "scale(1.3)")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.transform = "scale(1)")
                        }
                      />
                    </td>
                    <td className="description">
                      <Tippy content={item.name || ""} placement="top">
                        <span>
                          {item.name
                            ? item.name.length > 20
                              ? item.name.substring(0, 20) + "..."
                              : item.name
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    <td className="description">
                      <Tippy content={item.email || ""} placement="top">
                        <span>
                          {item.email
                            ? item.email.length > 20
                              ? item.email.substring(0, 20) + "..."
                              : item.email
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    <td>{item.employeeId || ""}</td>

                    <td className="description">
                      <Tippy
                        content={getAcademyName(item.academyId) || ""}
                        placement="top"
                      >
                        <span>
                          {getAcademyName(item.academyId)
                            ? getAcademyName(item.academyId).length > 20
                              ? getAcademyName(item.academyId).substring(
                                0,
                                20
                              ) + "..."
                              : getAcademyName(item.academyId)
                            : ""}
                        </span>
                      </Tippy>
                    </td>

                    {activeTab !== "Manager" && (
                      <td>{getDepartmentName(item.departmentId)}</td>
                    )}
                    <td>
                      <RiDeleteBin6Line
                        onClick={() => handleDelete(item.userId)}
                        style={{ width: "20px", height: "20px", color: "red" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      {/* create diff user Modal */}
      {showModal && (
        <div className="AdminUser-modal-overlay">
          <div className="AdminU-modal-content">
            <div className="AdminUser_close">
              <h2>Add {activeTab}</h2>
              <button
                // className="AdminUser-close-btn"
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
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
              />
              <input
                type="text"
                placeholder="EmployeeID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                autoComplete="off"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  if (!isValidEmail(value)) {
                    setEmailError("Invalid email format");
                  } else {
                    setEmailError("");
                  }
                }}
                required
                autoComplete="off"
              />
              {emailError && (
                <p style={{ color: "red", fontSize: "0.8rem" }}>{emailError}</p>
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Select
                classNamePrefix="custommm-select-workstatus"
                options={academies?.map((a) => ({
                  value: a.academyId,
                  label: a.name,
                }))}
                placeholder="Select Academy"
                isClearable
                isSearchable={false}
                onChange={setSelectedAcademy}
                required
              />
              {activeTab !== "Manager" && (
                <Select
                  isClearable
                  isSearchable={false}
                  classNamePrefix="custommm-select-workstatus"
                  options={department?.map((d) => ({
                    value: d.departmentId,
                    label: d.name,
                  }))}
                  placeholder="Select Department"
                  onChange={setSelectedDepartment}
                  required
                />
              )}
              <button
                className="AdminUser-add"
                type="submit"
                onClick={handleCreateUser}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditDepartmentModal && (
        <div className="AdminUser-modal-overlay">
          <div className="AdminU-modal-content">
            <div className="AdminUser_close">
              <h2>Edit Department</h2>
              <button
                className="AdminUser-close-btn"
                onClick={() => setShowEditDepartmentModal(false)}
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
                placeholder="Department Name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />
              <button
                disabled={updating}
                className="AdminUser-add"
                type="submit"
                onClick={handleUpdateDepartment}
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Add department Modal */}
      {showModalDepartment && (
        <div className="AdminUser-modal-overlay">
          <div className="AdminU-modal-content">
            <div className="AdminUser_close">
              <h2>Add Department</h2>
              <button
                className="AdminUser-close-btn"
                onClick={() => setShowModalDepartment(false)}
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
                placeholder="Department Name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                required
              />
              <textarea
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <button
                className="AdminUser-add"
                type="submit"
                onClick={handleCreateDepartment}
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

export default AdminUser;
