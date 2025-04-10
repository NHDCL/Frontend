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
import { useGetAcademyQuery, useCreateUserMutation, useGetDepartmentQuery, useCreateDepartmentMutation, useGetUsersQuery } from "../../slices/userApiSlice";
import Swal from 'sweetalert2';

const AdminUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Manager");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showModalDepartment, setShowModalDepartment] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [departments, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  const { data: academies } = useGetAcademyQuery();
  const { data: department, refetch } = useGetDepartmentQuery();
  const { data: users } = useGetUsersQuery();
  const [createDepartment,] = useCreateDepartmentMutation();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [formError, setFormError] = useState(null);

  // console.log("SA: ", selectedAcademy.value)
  // console.log("users: ", users)

  // Find the Manager's roleId (assuming the user has a 'role' object with an id field)
  const [managerRoleId, setManagerRoleId] = useState(null);
  const [technicianRoleId, setTechnicianRoleId] = useState(null);
  const [supervisorRoleId, setSupervisorRoleId] = useState(null);

  useEffect(() => {
    if (users && Array.isArray(users)) {
      users.forEach(user => {
        const roleName = user?.role?.name?.toLowerCase();
        const roleId = user?.role?.roleId;

        if (roleName === 'manager') {
          setManagerRoleId(roleId);
        } else if (roleName === 'technician') {
          setTechnicianRoleId(roleId);
        } else if (roleName === 'supervisor') {
          setSupervisorRoleId(roleId);
        }
      });
    }
  }, [users]);

  // console.log("Mausers: ", managerUser.role.name)
  // console.log("MRoleausers: ", managerRoleId)


  // console.log("AAA",academies)
  const handleAddUserClick = () => {
    setShowModal(true);
  };

  const handleAddDepartmentClick = () => {
    setShowModalDepartment(true);
  };

  const handleCreateUser = async () => {
    if (!name || !email || !password || !selectedAcademy || (activeTab !== "Manager" && !selectedDepartment)) {
      alert("Please fill all fields");
      return;
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
      email,
      password,
      academyId: selectedAcademy.value,
      departmentId: activeTab !== "Manager" ? selectedDepartment.value : null,
      roleId: roleId,
    };

    try {
      const res = await createUser(newUser).unwrap();

      console.log("res", res)
      Swal.fire("Success", "User created successfully", "success");
      setName("");
      setEmail("");
      setPassword("");
      setSelectedAcademy(null);
      setSelectedDepartment(null);
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

  const handleCreateDepartment = async () => {
    if (!departments || !description) {
      alert("Please fill in all fields");
      return;
    }
    const departmentData = {
      name: departments,
      description: description,
    };

    try {
      const res = await createDepartment(departmentData).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Department Added',
        text: 'The department was added successfully!',
        timer: 2000,
        showConfirmButton: false,

      });
      setDepartment("");
      setDescription("");
      refetch();
      // console.log("Department created:", res);
      // setShowModal(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to add department. Please try again.',
      });
    }
  };

  const [data, setData] = useState(users)
  console.log("data", data)
  // const [data, setData] = useState([
  //   {
  //     image: img,
  //     name: "Tenzin Om",
  //     email: "Omtenzin@gmail.com",
  //     location: "Khotokha",
  //     role: "Manager",
  //   },
  //   {
  //     image: img,
  //     name: "Yangchen Wangmo",
  //     email: "Omtenzin@gmail.com",
  //     location: "Khotokha",
  //     role: "Manager",
  //   },
  //   {
  //     image: img,
  //     name: "Pema",
  //     email: "Omtenzin@gmail.com",
  //     location: "Pemathang",
  //     role: "Manager",
  //   },
  //   {
  //     image: img,
  //     name: "Dawa",
  //     email: "Omtenzin@gmail.com",
  //     location: "Gyelpozhing",
  //     role: "Manager",
  //   },
  //   {
  //     image: img,
  //     name: "Karma Tenzin",
  //     email: "karma@example.com",
  //     location: "Block-B-202",
  //     department: "Plumbing Team",
  //     role: "Supervisor",
  //   },
  //   {
  //     image: img,
  //     name: "Sonam Zangmo",
  //     email: "sonam@example.com",
  //     location: "Block-C-303",
  //     department: "Electrical Team",
  //     role: "Supervisor",
  //   },
  //   {
  //     image: img,
  //     name: "Pema Choden",
  //     email: "pema@example.com",
  //     location: "Block-E-505",
  //     department: "Mechanical Team",
  //     role: "Supervisor",
  //   },
  //   {
  //     image: img,
  //     name: "Tshering Zangmo",
  //     email: "tshering@example.com",
  //     location: "Block-F-606",
  //     department: "Plumbing Team",
  //     role: "Technician",
  //   },
  //   {
  //     image: img,
  //     name: "Dorji Wangchuk",
  //     email: "dorji@example.com",
  //     location: "Block-G-707",
  //     department: "Electrical Team",
  //     role: "Technician",
  //   },
  //   {
  //     image: img,
  //     name: "Ugyen Tenzin",
  //     email: "ugyen@example.com",
  //     location: "Block-J-1010",
  //     department: "Mechanical Team",
  //     role: "Technician",
  //   },
  // ]);

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
        <div className="addUserDep">
          <div className="add-user" onClick={handleAddUserClick}>
            <AiOutlineUsergroupAdd style={{ fontSize: "20px" }} />
            <button style={{ color: "white" }}> Add {activeTab} </button>
          </div>

          <div className="add-user" onClick={handleAddDepartmentClick}>
            <RiApps2AddFill style={{ fontSize: "20px" }} />
            <button style={{ color: "white" }}> Add Department </button>
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

        {/* Data Table */}
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

      {/* create diff user Modal */}
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
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Select
                classNamePrefix="custommm-select-workstatus"
                options={academies?.map((a) => ({
                  value: a.academyId
                  , label: a.name
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
                  options={department?.map((d) => ({ value: d.departmentId, label: d.name }))}
                  placeholder="Select Department"
                  onChange={setSelectedDepartment}
                  required
                />
              )}
              <button className="AdminUser-add" type="submit" onClick={handleCreateUser} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add"}
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
              <input type="text" placeholder="Department Name" value={departments} onChange={(e) => setDepartment(e.target.value)} required />
              <textarea type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

              <button className="AdminUser-add" type="submit" onClick={handleCreateDepartment}>
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
