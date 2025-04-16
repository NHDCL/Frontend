// import React, { useState, useEffect } from "react";
// import "./css/card.css";
// import "./css/table.css";
// import "./css/form.css";
// import "./css/dropdown.css";
// import { IoIosSearch } from "react-icons/io";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import img from "../../assets/images/person_four.jpg";
// import { IoIosCloseCircle } from "react-icons/io";
// import Select from "react-select";
// import { TiArrowSortedUp } from "react-icons/ti";
// import {
//   useGetRepairRequestQuery,
//   useAssignRepairMutation,
//   usePostRepairScheduleMutation,
// } from "../../slices/maintenanceApiSlice";
// import { useUser } from "../../context/userContext";
// import { useSelector } from "react-redux";
// import {
//   useGetUserByEmailQuery,
//   useGetUsersQuery,
//   useGetDepartmentQuery,
// } from "../../slices/userApiSlice";
// import { createSelector } from "reselect";
// import Swal from "sweetalert2";

// const Repair = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [selectedPriority, setSelectedPriority] = useState("");
//   const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
//   const [assignedWorker, setAssignedWorker] = useState("");
//   const [assignTime, setAssignTime] = useState("");
//   const [assignDate, setAssignDate] = useState("");

//   const rowsPerPage = 10;

//   const { data: repairRequest, refetch: refetchRepairRequest } =
//     useGetRepairRequestQuery();

//   const [assignRepair] = useAssignRepairMutation();

//   const { userInfo, userRole } = useSelector((state) => state.auth);
//   console.log("repairRequest:", repairRequest);

//   const selectUserInfo = (state) => state.auth.userInfo || {};
//   const getUserEmail = createSelector(
//     selectUserInfo,
//     (userInfo) => userInfo?.user?.username || ""
//   );

//   const email = useSelector(getUserEmail);
//   const { data: userByEmial } = useGetUserByEmailQuery(email);

//   console.log("e", userByEmial?.user.academyId);

//   const academyId = userByEmial?.user?.academyId;
//   const { data: departments, isLoading: departmentsLoading } =
//     useGetDepartmentQuery();
//   console.log("dept", departments);

//   // 4. Get all users
//   const { data: users } = useGetUsersQuery();
//   console.log("users:", users);

//   const supervisorsFromSameAcademy =
//     users?.filter(
//       (user) =>
//         user.academyId === academyId &&
//         typeof user.role?.name === "string" &&
//         user.role.name.toLowerCase() === "supervisor"
//     ) || [];

//   console.log("Supervisors from same academy:", supervisorsFromSameAcademy);

//   const uniqueSupervisorDepartmentIds = [
//     ...new Set(supervisorsFromSameAcademy.map((s) => s.departmentId)),
//   ];
//   console.log(
//     "Unique Supervisor Department IDs:",
//     uniqueSupervisorDepartmentIds
//   );

//   const departmentNames = uniqueSupervisorDepartmentIds.map((id) => {
//     const matchedDept = departments?.find((dept) => dept.departmentId === id);
//     return matchedDept ? matchedDept.name : "Unknown";
//   });
//   console.log("Supervisor Department Names:", departmentNames);

//   const [selectedDepartment, setSelectedDepartment] = useState(null);

//   const departmentOptions =
//     departments
//       ?.filter((dep) =>
//         uniqueSupervisorDepartmentIds.includes(dep.departmentId)
//       )
//       .map((dep) => ({
//         value: dep.departmentId,
//         label: dep.name,
//       })) || [];

//   const workerOptions = supervisorsFromSameAcademy.map((user) => ({
//     value: user.userId,
//     label: user.email,
//   }));

//   const [postRepairSchedule] = usePostRepairScheduleMutation();
//   console.log("post", postRepairSchedule);

//   const handleAssignRequest = async () => {
//     if (!assignedWorker || !assignTime || !assignDate || !selectedDepartment) {
//       Swal.fire({
//         icon: "warning",
//         title: "Incomplete fields",
//         text: "Please fill in all fields before assigning.",
//       });
//       return;
//     }

//     // Format the reporting date as YYYY-MM-DD
//     const formattedDate = new Date(assignDate).toISOString().slice(0, 10);

//     // const schedulePayload = {
//     //   repairID: modalData.repairID,
//     //   userID: assignedWorker,
//     //   reportingDate: formattedDate,
//     //   startTime: assignTime,
//     // };
//     const schedulePayload = {
//       repairID: modalData.repairID,
//       userID: assignedWorker.value,
//       reportingDate: formattedDate,
//       startTime: assignTime,
//     };
//     console.log("sc", schedulePayload);

//     try {
//       await postRepairSchedule(schedulePayload).unwrap();
//       Swal.fire({
//         icon: "success",
//         title: "Schedule assigned successfully!",
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 2000,
//       });
//       refetchRepairRequest();
//       handleCloseModal();
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Failed to assign",
//         text: "Please try again later.",
//       });
//       console.error("Failed to assign schedule:", error);
//     }
//   };

//   const assignedWorkerEmail = users?.find(user => user.userId === assignedWorker)?.email;
//   console.log("ass:", assignedWorkerEmail)
//   const handleAssignRequested = async () => {
//     if (!modalData?.repairID || !assignedWorker) {
//       Swal.fire("Error", "Missing repair ID or assigned worker.", "error");
//       return;
//     }

//     try {
//       // await assignRepair({ repairId: modalData.repairID, email: assignedWorker }).unwrap();
//       await assignRepair({
//         repairId: modalData.repairID,
//         email: assignedWorker.label, // assuming label is email
//       });
//       Swal.fire("Success", "Repair task assigned successfully!", "success");
//       refetchRepairRequest();
//       handleCloseModal();
//     } catch (error) {
//       // console.error("Assignment failed:", error.message);
//       Swal.fire(
//         "Assignment Failed",
//         error?.data?.message || "Something went wrong.",
//         "error"
//       );
//     }
//   };

//   const today = new Date().toISOString().split("T")[0];

//   const [data, setData] = useState([]);
//   console.log("data: ", data);

//   useEffect(() => {
//     if (!repairRequest || !userByEmial) return;

//     const userAcademy = userByEmial?.user.academyId?.trim().toLowerCase();

//     const filtered = repairRequest.filter((req) => {
//       const requestAcademy = req.academyId?.trim().toLowerCase();
//       return requestAcademy === userAcademy && req.accept === true;
//     });
//     console.log("useracademy: ", userAcademy);

//     console.log("Filtered Length:", filtered.length);
//     setData(
//       filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//     );
//   }, [repairRequest, userByEmial]);

//   // Function to get the class based on workstatus
//   const getWorkOrderStatusClass = (status) => {
//     switch (status) {
//       case "pending":
//         return "pending-status"; // Gray color
//       case "inprogress":
//         return "in-progress-status"; // Yellow color
//       case "completed":
//         return "completed-status"; // Green color
//       default:
//         return "";
//     }
//   };

//   // Extract unique priorities from data
//   const uniquePriorities = [
//     { value: "", label: "All Priorities" },
//     ...Array.from(
//       new Set(data.map((item) => item.priority?.toLowerCase()).filter(Boolean))
//     ).map((priority) => ({
//       value: priority,
//       label: priority.charAt(0).toUpperCase() + priority.slice(1),
//     })),
//   ];

//   // Extract unique work statuses from data
//   const uniqueWorkStatuses = [
//     { value: "", label: "All Work status" },
//     ...Array.from(new Set(data.map((item) => item.status?.toLowerCase()))).map(
//       (status) => ({
//         value: status,
//         label: status.charAt(0).toUpperCase() + status.slice(1),
//       })
//     ),
//   ];

//   // Filtering data based on search and priority selection and work status
//   // const sortedData = [...data].sort((a, b) => b.repairID - a.repairID);

//   const filteredData = sortedData.filter((item) => {
//     // const matchesSearch = Object.values(item).some((value) =>
//     //   value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     // );
//     const matchesSearch = Object.values(item).some((value) =>
//       (value || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const matchesPriority =
//       selectedPriority === "" ||
//       item.priority?.toLowerCase() === selectedPriority.toLowerCase();

//     const matchesWorkStatus =
//       selectedWorkStatus === "" ||
//       item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

//     return matchesSearch && matchesPriority && matchesWorkStatus;
//   });

//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);
//   const displayedData = filteredData.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handleSelectRow = (repairID) => {
//     setSelectedRows((prevSelectedRows) =>
//       prevSelectedRows.includes(repairID)
//         ? prevSelectedRows.filter((item) => item !== repairID)
//         : [...prevSelectedRows, repairID]
//     );
//   };

//   const handleDeleteSelected = () => {
//     const updatedData = data.filter(
//       (item) => !selectedRows.includes(item.repairID)
//     );
//     // Update the data with the filtered result after deletion
//     setData(updatedData);
//     setSelectedRows([]); // Reset selected rows after deletion
//   };
//   const handleDeleteRow = (repairID) => {
//     const updatedData = data.filter((item) => item.repairID !== repairID);
//     setData(updatedData);
//   };

//   // const handleScheduleView = (item) => {
//   //   setModalData(item);
//   //   setAssignedWorker(null); // Reset worker selection when opening modal
//   // };
//   const handleScheduleView = (item) => {
//     console.log("Clicked Repair Item:", item); // 👈 should show repairID

//     setModalData(item);
//     setAssignedWorker(null);
//     setAssignDate("");
//     setAssignTime("");
//     setSelectedDepartment(null);
//   };

//   const handleCloseModal = () => {
//     setModalData(null);
//   };
//   const handleRescheduleView = (item) => {
//     console.log("Clicked Reschedule for:", item);
//     setModalData(item);
//     setAssignedWorker(item?.assignedWorker || null); // Optional: pre-fill existing values
//     setAssignDate(item?.assignDate || "");
//     setAssignTime(item?.assignTime || "");
//     setSelectedDepartment(item?.departmentId || null);
//   };

//   // Sorting
//   const [sortOrder, setSortOrder] = useState({ column: null, ascending: true });

//   const sortData = (column, ascending) => {
//     const sortedData = [...data].sort((a, b) => {
//       if (a[column] < b[column]) return ascending ? -1 : 1;
//       if (a[column] > b[column]) return ascending ? 1 : -1;
//       return 0;
//     });
//     setData(sortedData);
//   };

//   // const handleSort = (column) => {
//   //   const newSortOrder =
//   //     column === sortOrder.column
//   //       ? !sortOrder.ascending // Toggle the sorting direction if the same column is clicked
//   //       : true; // Start with ascending for a new column

//   //   setSortOrder({
//   //     column,
//   //     ascending: newSortOrder,
//   //   });
//   //   sortData(column, newSortOrder);
//   // };
//   const handleSort = (column) => {
//     setSortOrder((prev) => ({
//       column,
//       direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const sortedData = [...data].sort((a, b) => {
//     if (!sortOrder.column) return b.repairID - a.repairID;

//     const valA = a[sortOrder.column];
//     const valB = b[sortOrder.column];

//     if (valA < valB) return sortOrder.direction === "asc" ? -1 : 1;
//     if (valA > valB) return sortOrder.direction === "asc" ? 1 : -1;
//     return 0;
//   });

import React, { useState, useEffect } from "react";
import "./css/card.css";
import "./css/table.css";
import "./css/form.css";
import "./css/dropdown.css";
import { IoIosSearch } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import img from "../../assets/images/person_four.jpg";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetRepairRequestQuery,
  useAssignRepairMutation,
  usePostRepairScheduleMutation,
} from "../../slices/maintenanceApiSlice";
import { useUser } from "../../context/userContext";
import { useSelector } from "react-redux";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
  useGetDepartmentQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

const Repair = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [assignedWorker, setAssignedWorker] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");

  const rowsPerPage = 10;

  const { data: repairRequest, refetch: refetchRepairRequest } =
    useGetRepairRequestQuery();

  const [assignRepair] = useAssignRepairMutation();
  const { userInfo, userRole } = useSelector((state) => state.auth);

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );

  const email = useSelector(getUserEmail);
  const { data: userByEmial } = useGetUserByEmailQuery(email);
  // console.log("assignedWorker email", email);

  const academyId = userByEmial?.user?.academyId;
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartmentQuery();

  const { data: users } = useGetUsersQuery();

  const supervisorsFromSameAcademy =
    users?.filter(
      (user) =>
        user.academyId === academyId &&
        typeof user.role?.name === "string" &&
        user.role.name.toLowerCase() === "supervisor"
    ) || [];

  const uniqueSupervisorDepartmentIds = [
    ...new Set(supervisorsFromSameAcademy.map((s) => s.departmentId)),
  ];

  const departmentNames = uniqueSupervisorDepartmentIds.map((id) => {
    const matchedDept = departments?.find((dept) => dept.departmentId === id);
    return matchedDept ? matchedDept.name : "Unknown";
  });

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const departmentOptions =
    departments
      ?.filter((dep) =>
        uniqueSupervisorDepartmentIds.includes(dep.departmentId)
      )
      .map((dep) => ({
        value: dep.departmentId,
        label: dep.name,
      })) || [];

  const workerOptions = supervisorsFromSameAcademy.map((user) => ({
    value: user.userId,
    label: user.email,
  }));

  const [postRepairSchedule] = usePostRepairScheduleMutation();

  console.log("aw", assignedWorker);

  // const handleAssignAndSchedule = async () => {
  //   if (!assignedWorker || !assignTime || !assignDate || !modalData?.repairID) {
  //     Swal.fire("Warning", "Please fill all required fields.", "warning");
  //     return;
  //   }

  //   const formattedDate = new Date(assignDate).toISOString().split("T")[0];

  //   const schedulePayload = {
  //     startTime: assignTime ? `${assignTime}:00` : "",
  //     reportingDate: assignDate || "",
  //     userID: assignedWorker || "",
  //     repairID: modalData?.repairID || "",
  //   };
  //   console.log("scpayload",schedulePayload)

  //   try {
  //     await assignRepair({
  //       repairId: modalData.repairID,
  //       email: assignedWorker.label,
  //     }).unwrap();

  //     await postRepairSchedule(schedulePayload).unwrap();

  //     Swal.fire("Success", "Repair assigned and scheduled!", "success");
  //     refetchRepairRequest();
  //     handleCloseModal();
  //   } catch (error) {
  //     Swal.fire("Error", error?.data?.message || "Something went wrong", "error");
  //   }
  // };
  // const handleAssignAndSchedule = async () => {
  //   if (!assignedWorker || !assignTime || !assignDate || !modalData?.repairID) {
  //     Swal.fire("Warning", "Please fill all required fields.", "warning");
  //     return;
  //   }

  //   const formattedDate = new Date(assignDate).toISOString().split("T")[0];

  //   const schedulePayload = {
  //     startTime: `${assignTime}:00`,                // format as HH:mm:00
  //     reportingDate: formattedDate,                // format as YYYY-MM-DD
  //     userID: assignedWorker?.value,                // user ID from select's value
  //     repairID: modalData.repairID,
  //   };
  //   console.log("Assigning to:", assignedWorker?.value);

  //   console.log("Schedule Payload:", schedulePayload);

  //   try {
  //     // Step 1: Assign repair using email
  //     await assignRepair({
  //       repairId: modalData.repairID,
  //       email: assignedWorker?.label, // email now safely accessed
  //     }).unwrap();
  //     console.log("assignedWorker.label",assignedWorker?.label)
  //     // if (!assignedWorker?.value) {
  //     //   console.error("Email is missing in assignedWorker");
  //     //   return;
  //     // }

  //     // Step 2: Schedule the repair
  //     await postRepairSchedule(schedulePayload).unwrap();

  //     Swal.fire("Success", "Repair assigned and scheduled!", "success");
  //     refetchRepairRequest();
  //     handleCloseModal();
  //   } catch (error) {
  //     Swal.fire("Error", error?.data?.message || "Something went wrong", "error");
  //     console.error("Full Error:", error); // Add this for debugging
  //   }
  // };

  const handleAssignAndSchedule = async () => {
    if (!assignedWorker || !assignTime || !assignDate || !modalData?.repairID) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }

    const formattedDate = new Date(assignDate).toISOString().split("T")[0];

    const scheduleData = {
      startTime: `${assignTime}:00`,
      reportingDate: formattedDate,
      userID: assignedWorker?.value, // user ID from Select's value
      repairID: modalData.repairID,
    };
      console.log("sc data", scheduleData);


  //   try {
  //     const assignmentResponse = await assignRepair({
  //       repairId: modalData.repairID,
  //       email: assignedWorker?.label,
  //     }).unwrap();

  //     console.log("Assign Response Message:", assignmentResponse.message); // this works now

  //     Swal.fire(
  //       "Success",
  //       assignmentResponse.message || "Repair assigned!",
  //       "success"
  //     );

  //     refetchRepairRequest();
  //     handleCloseModal();
  //   } catch (error) {
  //     Swal.fire(
  //       "Error",
  //       error?.data?.message || "Something went wrong",
  //       "error"
  //     );
  //     console.error("Full Error:", error);
  //   }
  // };
  try {
    // 1. First assign the repair
    const assignmentResponse = await assignRepair({
      repairId: modalData.repairID,
      email: assignedWorker?.label,
    }).unwrap();

    console.log("Assign Response Message:", assignmentResponse.message);

    // 2. Then post the schedule to backend
    await postRepairSchedule(scheduleData).unwrap();

    Swal.fire(
      "Success",
      assignmentResponse.message || "Repair assigned and scheduled!",
      "success"
    );

    refetchRepairRequest();
    handleCloseModal();
  } catch (error) {
    Swal.fire(
      "Error",
      error?.data?.message || "Something went wrong",
      "error"
    );
    console.error("Full Error:", error);
  }
};

  const handleAssignRequested = async () => {
    if (!modalData?.repairID || !assignedWorker) {
      Swal.fire("Error", "Missing repair ID or assigned worker.", "error");
      return;
    }

    try {
      // await assignRepair({
      //   repairId: modalData.repairID,
      //   email: assignedWorker.label,
      // });
      // Swal.fire("Success", "Repair task assigned successfully!", "success");
      // refetchRepairRequest();
      // handleCloseModal();
      const assignmentResponse = await assignRepair({
        repairId: modalData.repairID,
        email: assignedWorker?.label,
      }).unwrap();

      console.log("Assign Response Message:", assignmentResponse.message); // this works now

      Swal.fire(
        "Success",
        assignmentResponse.message || "Repair assigned!",
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Assignment Failed",
        error?.data?.message || "Something went wrong.",
        "error"
      );
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!repairRequest || !userByEmial) return;

    const userAcademy = userByEmial?.user.academyId?.trim().toLowerCase();

    const filtered = repairRequest.filter((req) => {
      const requestAcademy = req.academyId?.trim().toLowerCase();
      return requestAcademy === userAcademy && req.accept === true;
    });

    setData(
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  }, [repairRequest, userByEmial]);

  const getWorkOrderStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending-status";
      case "inprogress":
        return "in-progress-status";
      case "completed":
        return "completed-status";
      default:
        return "";
    }
  };

  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(data.map((item) => item.priority?.toLowerCase()).filter(Boolean))
    ).map((priority) => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
    })),
  ];

  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.status?.toLowerCase()))).map(
      (status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })
    ),
  ];

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      (value || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesPriority =
      selectedPriority === "" ||
      item.priority?.toLowerCase() === selectedPriority.toLowerCase();

    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    return matchesSearch && matchesPriority && matchesWorkStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectRow = (repairID) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(repairID)
        ? prevSelectedRows.filter((item) => item !== repairID)
        : [...prevSelectedRows, repairID]
    );
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter(
      (item) => !selectedRows.includes(item.repairID)
    );
    setData(updatedData);
    setSelectedRows([]);
  };

  const handleDeleteRow = (repairID) => {
    const updatedData = data.filter((item) => item.repairID !== repairID);
    setData(updatedData);
  };

  const handleScheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(null);
    setAssignDate("");
    setAssignTime("");
    setSelectedDepartment(null);
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  const handleRescheduleView = (item) => {
    setModalData(item);
    setAssignedWorker(item?.assignedWorker || null);
    setAssignDate(item?.assignDate || "");
    setAssignTime(item?.assignTime || "");
    setSelectedDepartment(item?.departmentId || null);
  };

  const [sortOrder, setSortOrder] = useState({
    column: null,
    direction: "asc",
  });

  const handleSort = (column) => {
    setSortOrder((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortOrder.column) return b.repairID - a.repairID;

    const valA = a[sortOrder.column];
    const valB = b[sortOrder.column];

    if (valA < valB) return sortOrder.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder.direction === "asc" ? 1 : -1;
    return 0;
  });

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
          <div className="dropdown-ls">
            {/* Priority Dropdown */}
            <Select
              classNamePrefix="custom-select"
              className="priority-dropdown"
              options={uniquePriorities}
              value={uniquePriorities.find(
                (option) => option.value === selectedPriority
              )}
              onChange={(selectedOption) => {
                setSelectedPriority(selectedOption ? selectedOption.value : "");
              }}
              isClearable
              isSearchable={false}
            />

            {/* Work Status Dropdown */}
            <Select
              classNamePrefix="custom-select-workstatus"
              className="workstatus-dropdown"
              options={uniqueWorkStatuses}
              value={uniqueWorkStatuses.find(
                (option) => option.value === selectedWorkStatus
              )}
              onChange={(selectedOption) => {
                setSelectedWorkStatus(
                  selectedOption ? selectedOption.value : ""
                );
              }}
              isClearable
              isSearchable={false}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="RequestTable">
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
                          : displayedData.map((item) => item.repairID)
                      )
                    }
                  />
                </th>
                {[
                  "RID",
                  "Image",
                  "Name",
                  "Email",
                  "phone",
                  "Area",
                  "Priority",
                  "Workstatus",
                ].map((header, index) => (
                  <th key={index}>
                    {header === "Area" || header === "Name" ? (
                      <div className="header-title">
                        {header}
                        <div className="sort-icons">
                          <button
                            className="sort-btn"
                            onClick={() =>
                              handleSort(
                                header === "Area"
                                  ? "Area"
                                  : header.toLowerCase().replace(" ", "")
                              )
                            }
                          >
                            <TiArrowSortedUp
                              style={{
                                color: "#305845",
                                transform:
                                  sortOrder.column ===
                                    header.toLowerCase().replace(" ", "") &&
                                  sortOrder.ascending
                                    ? "rotate(0deg)" // Ascending
                                    : sortOrder.column ===
                                        header.toLowerCase().replace(" ", "") &&
                                      !sortOrder.ascending
                                    ? "rotate(180deg)" // Descending
                                    : "rotate(0deg)", // Default
                                transition: "transform 0.3s ease",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      header
                    )}
                  </th>
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
                      checked={selectedRows.includes(item.repairID)}
                      onChange={() => handleSelectRow(item.repairID)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      className="User-profile"
                      src={item.images[0]}
                      alt="User"
                      style={{
                        width: "100px",
                        height: "100px",
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phoneNumber}</td>
                  <td>{item.area}</td>
                  <td>{item.priority}</td>
                  <td>
                    <div
                      className={getWorkOrderStatusClass(
                        item.status.toLowerCase().replace(/\s+/g, "")
                      )}
                    >
                      {item.status}
                    </div>
                  </td>
                  <td className="actions">
                    {/* <button
                      className="schedule-btn"
                      onClick={() => handleScheduleView(item)}
                    >
                      Schedule
                    </button> */}
                    {item.scheduled === false ? (
                      <button
                        className="schedule-btn"
                        onClick={() => handleScheduleView(item)}
                      >
                        Schedule
                      </button>
                    ) : (
                      <button
                        className="schedule-btn"
                        style={{ backgroundColor: "#979797" }}
                        onClick={() => handleRescheduleView(item)}
                      >
                        Reschedule
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRow(item.repairID)}
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

      {/* Modal for schedule Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Schedule Form: {modalData.repairID}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            {/* Assign Dropdown */}
            <div className="schedule-form">
              {/* <div className="modal-content-field">
                <label>Department:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={departmentOptions}
                  value={departmentOptions.find(
                    (opt) => opt.value === selectedDepartment
                  )}
                  onChange={(option) => setSelectedDepartment(
  departmentOptions.find((opt) => opt.value === item?.departmentId) || null
)}
                  isLoading={departmentsLoading}
                  isClearable
                />
              </div> */}

              {/* <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={
                    workerOptions.find((w) => w.value === assignedWorker) ||
                    null
                  }
                  onChange={(selectedOption) => {
                    setAssignedWorker(selectedOption?.value || "");
                    console.log("Selected Worker Email:", selectedOption);
                  }}
                  isClearable
                />
              </div> */}

              <div className="modal-content-field">
                <label>Department:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={departmentOptions}
                  value={
                    departmentOptions.find(
                      (opt) => opt.value === selectedDepartment
                    ) || null
                  }
                  onChange={(option) =>
                    setSelectedDepartment(option?.value || "")
                  }
                  isLoading={departmentsLoading}
                  isClearable
                />
              </div>

              <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                {/* <Select
    classNamePrefix="custom-select-department"
    className="workstatus-dropdown"
    options={workerOptions}
    // value={workerOptions.find((w) => w.value === assignedWorker) || null}
    // onChange={(selectedOption) => {
    //   setAssignedWorker(selectedOption?.value || "");
    //   console.log("Selected Worker Email:", selectedOption?.label || "None");
    // }}
    // value={assignedWorker}
    value={workerOptions.find((w) => w.value === assignedWorker) || null}

    onChange={(selectedOption) => {
      setAssignedWorker(selectedOption || null); // store full object
      console.log("Selected Worker Email:", selectedOption?.label || "None");
    }}
    isClearable
  /> */}
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={assignedWorker}
                  onChange={(selectedOption) => {
                    setAssignedWorker(selectedOption || null); // full object with { value, label }
                    console.log(
                      "Selected Worker Email:",
                      selectedOption?.label || "None"
                    );
                  }}
                  isClearable
                />
              </div>

              {/* Assign Date */}
              <div className="modal-content-field">
                <label>Assign Date:</label>
                <input
                  type="date"
                  value={assignDate}
                  min={today}
                  onChange={(e) => setAssignDate(e.target.value)}
                />
              </div>

              <div className="modal-content-field">
                {/* Assign Time */}
                <label>Assign Time:</label>
                <input
                  type="time"
                  value={assignTime}
                  onChange={(e) => setAssignTime(e.target.value)}
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  // onClick={handleAssignRequested}
                  onClick={handleAssignAndSchedule}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repair;
