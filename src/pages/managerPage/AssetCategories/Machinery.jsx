import React, { useEffect, useState, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetAssetByAcademyQuery,
  usePostAssetMutation,
  useGetCategoryQuery,
  useUploadExcelMutation,
  useRequestDisposeMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";
import CreatableSelect from "react-select/creatable";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  useGetDepartmentQuery,
  useGetUserByEmailQuery,
  useGetUsersQuery,
} from "../../../slices/userApiSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  useCreateMaintenanceMutation,
  useSendEmailMutation,
} from "../../../slices/maintenanceApiSlice";
import Tippy from "@tippyjs/react";

const selectUserInfo = (state) => state.auth.userInfo || {};
const getUserEmail = createSelector(
  selectUserInfo,
  (userInfo) => userInfo?.user?.username || ""
);

const Machinery = ({ category }) => {
  const email = useSelector(getUserEmail);
  const { data: manager } = useGetUserByEmailQuery(email);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalData, setModalData] = useState(null);
  const [editModalData, setEditModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [postAsset, { isLoading: isLoading2 }] = usePostAssetMutation();
  const { data: categories } = useGetCategoryQuery();
  const [newMachinery, setNewMachinery] = useState({
    title: "",
    assetCode: "",
    acquireDate: "",
    lifespan: "",
    status: "",
    cost: "",
    assetArea: "",
    Serial_number: "",
  });
  const [academyId, setAcademyId] = useState(null);
  const { data: assets, refetch } = useGetAssetByAcademyQuery(academyId);
  const [data, setData] = useState([]);
  const [Building, setBuilding] = useState([]);
  const [errors, setErrors] = useState({});
  const [CategoryId, setCategoryId] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploadExcel, { isLoading: upLoading }] = useUploadExcelMutation();
  const [requestDispose, { isLoading: isDeleting }] =
    useRequestDisposeMutation();
  const rowsPerPage = 9; // 3x3 grid for QR codes per page
  const qrSize = 40; // Size of each QR code (adjust as needed)
  const qrSpacing = 12; // Spacing between QR codes
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartmentQuery();
  const { data: users } = useGetUsersQuery();
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [createMaintenance] = useCreateMaintenanceMutation();
  const [repeatFrequency, setRepeatFrequency] = useState(null);
  const [sendEmail] = useSendEmailMutation();
  const [isCreating, setIsCreating] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalData, setScheduleModalData] = useState(null);

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

  useEffect(() => {
    if (manager?.user?.academyId) {
      setAcademyId(manager.user.academyId);
    }
  }, [manager?.user?.academyId]);

  useEffect(() => {
    if (assets) {
      const filteredAssets = assets.filter(
        (asset) => asset.categoryDetails?.name === category
      );
      setData(filteredAssets);
    }
  }, [assets, category]);

  useEffect(() => {
    if (assets) {
      const filteredAssets2 = assets.filter(
        (asset) => asset.categoryDetails?.name === "Building"
      );
      setBuilding(filteredAssets2);
    }
  }, [assets]);

  useEffect(() => {
    if (categories) {
      const filteredCategories = categories.filter(
        (categorie) => categorie.name === category
      );
      setCategoryId(filteredCategories[0].id);
    }
  }, [assets]);

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isNewBlock, setIsNewBlock] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const convertAssetsToBlockData = (Building) => {
    const blockData = {};

    Building.forEach((build) => {
      const blockName = build.title; // e.g., "Block T"
      const floorRoomsAttr = build.attributes.find(
        (attr) => attr.name === "Floor and rooms"
      );

      if (floorRoomsAttr) {
        try {
          const floorRooms = JSON.parse(floorRoomsAttr.value); // Parse floor-room JSON

          blockData[blockName] = {};

          Object.entries(floorRooms).forEach(([floor, rooms]) => {
            blockData[blockName][floor] = rooms;
          });
        } catch (error) {
          console.error("Failed to parse floor and rooms JSON:", error);
        }
      }
    });

    return blockData;
  };

  const downloadDummyExcel = () => {
    const data = [
      {
        assetCode: "A001",
        title: "Monitor",
        cost: 500,
        acquireDate: "01/10/2023", // Date as string to match your backend expectation
        lifespan: "5 years",
        assetArea: "Office Room",
        description: "24-inch LCD monitor",
        createdBy: "jigme@gmail.com",
        academyID: academyId,
        assetCategoryID: CategoryId,
        // Any extra dynamic attributes can be added too
        Serial_number: "AB-201-23",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Asset_Template.xlsx");
  };

  const blockData = convertAssetsToBlockData(Building);
  const convertAssetsToBlockTitles = (Building) => {
    const blockTitles = [];

    Building.forEach((build) => {
      const blockName = build.title; // e.g., "Block T"

      // Ensure that we only add the blockName if it isn't already in the array
      if (blockName && !blockTitles.includes(blockName)) {
        blockTitles.push(blockName);
      }
    });

    return blockTitles; // Return an array of block titles
  };

  const blockTitles = convertAssetsToBlockTitles(Building);

  const handleBlockChange = (selectedOption, { action }) => {
    if (action === "create-option") {
      // If a new block is created by the user, set it as the asset area directly
      setSelectedBlock(selectedOption?.value || null);
      setIsNewBlock(true);
      setSelectedFloor(null);
      setSelectedRoom(null);

      // Set the asset area as the newly created block
      setNewMachinery((prev) => ({
        ...prev,
        assetArea: selectedOption?.value || "", // Directly set the new block name as asset area
      }));
    } else {
      // If an existing block is selected
      setIsNewBlock(false);
      setSelectedBlock(selectedOption?.value || null);
      setSelectedFloor(null);
      setSelectedRoom(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newMachinery.title) newErrors.title = "Title is required";
    if (!newMachinery.assetCode) newErrors.assetCode = "Asset Code is required";
    if (!newMachinery.Serial_number)
      newErrors.Serial_number = "Serial Number is required";
    if (!newMachinery.acquireDate)
      newErrors.acquireDate = "Acquired Date is required";
    if (!newMachinery.lifespan || isNaN(newMachinery.lifespan))
      newErrors.lifespan = "Useful Life must be a valid number";
    if (!newMachinery.cost || isNaN(newMachinery.cost))
      newErrors.cost = "Cost must be a valid number";
    if (!selectedBlock) newErrors.block = "Area field is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if there are no errors
  };

  const [file, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFloorChange = (option) => {
    setSelectedFloor(option?.value);
    setSelectedRoom(null);
  };

  const handleRoomChange = (option) => {
    setSelectedRoom(option?.value);
  };

  useEffect(() => {
    const parts = [selectedBlock, selectedFloor, selectedRoom].filter(Boolean);
    if (parts.length > 0) {
      const areaString = parts.join(" - ");
      setNewMachinery((prev) => ({
        ...prev,
        assetArea: areaString,
      }));
    }
  }, [selectedBlock, selectedFloor, selectedRoom]);

  // Filtering data based on search and priority selection and work status
  const sortedData = [...data].sort((a, b) => b.mid - a.mid);
  const filteredData = sortedData.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus =
      selectedStatus === "" || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleBulkImport = () => {
    setShowBulkModal(true);
  };

  const handleBulk = async () => {
    if (file) {
      try {
        const res = await uploadExcel(file).unwrap();
        refetch();
        setSelectedFile(null);
        setShowBulkModal(false);
        console.log(res);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Excel file uploaded successfully!",
        });
      } catch (err) {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: err?.data?.message || "Something went wrong while uploading.",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "No File",
        text: "Please select an Excel file first.",
      });
    }
  };

  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRows.includes(item.AID)));
    setSelectedRows([]);
  };

  const handleView = (item) => {
    setModalData(item);
  };

  const dropdownStyles = {
    menu: (provided) => ({
      ...provided,
      maxHeight: 150, // Set the height you want
      overflowY: "auto",
      zIndex: 9999, // So it appears above other content
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 150,
      overflowY: "auto",
    }),
  };

  // Function to get the class based on workstatus
  const getStatusClass = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In-maintenance-status";
      case "In Usage":
        return "in-usage-status";
      case "Disposed":
        return "disposed-status";
      case "Pending":
        return "Pending-status";
      default:
        return "";
    }
  };
  // Extract unique work statuses from data
  const uniqueStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.status))).map((status) => ({
      value: status,
      label: status,
    })),
  ];
  const handleCloseModal = () => {
    setModalData(null);
    setSelectedBlock(null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setIsNewBlock(false);
    setIsFormSubmitted(true);
  };

  const handleAddMachinery = () => {
    setShowAddModal(true);
  };

  const handleSaveNewMachinery = async () => {
    if (validateForm()) {
      const payload = {
        assetCode: newMachinery.assetCode,
        title: newMachinery.title,
        cost: Number(newMachinery.cost),
        acquireDate: newMachinery.acquireDate,
        lifespan: newMachinery.lifespan,
        assetArea: newMachinery.assetArea,
        description: newMachinery.description,
        status: "Pending",
        createdBy: email,
        deletedBy: null,
        academyID: academyId,
        assetCategoryID: CategoryId,
        attributes: [
          { name: "Serial_number", value: newMachinery.Serial_number },
        ],
      };

      try {
        await postAsset(payload).unwrap();
        Swal.fire({
          icon: "success",
          title: "Asset created successfully!",
          confirmButtonColor: "#305845",
        });
        refetch();
        setShowAddModal(false);
        setSelectedBlock(null);
        setSelectedFloor(null);
        setSelectedRoom(null);
        setIsNewBlock(false);
        setIsFormSubmitted(true);
        setNewMachinery({
          title: "",
          assetCode: "",
          acquireDate: "",
          lifespan: "",
          status: "",
          cost: "",
          assetArea: "",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed to create asset",
          text: err?.data?.message || "Something went wrong!",
          confirmButtonColor: "#897463",
        });
      }
    }
  };

  const getQrImageUrl = (attributes) => {
    const qrAttr = attributes?.find((attr) => attr.name === "QR Code");
    return qrAttr?.value || "";
  };

  const loadImageAsDataURL = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleSelectRow = (assetCode) => {
    setSelectedRows((prev) =>
      prev.includes(assetCode)
        ? prev.filter((item) => item !== assetCode)
        : [...prev, assetCode]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]); // Deselect all if all are selected
    } else {
      setSelectedRows(filteredData.map((item) => item.assetCode)); // Select all
    }
  };

  const handleDownloadPDF = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one asset.");
      return;
    }

    const doc = new jsPDF();
    let pageY = 10;
    let pageX = 20;
    let rowCount = 0;

    // Loop over selected rows
    for (const assetID of selectedRows) {
      const rowData = data.find((item) => item.assetCode === assetID);
      if (!rowData) continue;

      const qrUrl = getQrImageUrl(rowData.attributes);
      if (!qrUrl) continue;

      try {
        const qrDataUrl = await loadImageAsDataURL(qrUrl);
        doc.addImage(qrDataUrl, "PNG", pageX, pageY, qrSize, qrSize);

        doc.setFontSize(8);
        pageY += qrSize + 4;
        doc.text(`Asset Code: ${rowData.assetCode}`, pageX, pageY);
        pageY += 6;
        doc.text(`Title: ${rowData.title}`, pageX, pageY);
        pageY += 6;
        doc.text(`Category: ${rowData.categoryDetails?.name}`, pageX, pageY);
        pageY += 10;

        rowCount++;

        if (rowCount % 3 === 0) {
          pageX += qrSize + 30;
          pageY = 10;
        }

        if (rowCount % rowsPerPage === 0) {
          doc.addPage();
          pageY = 10;
          pageX = 20;
        }
      } catch (err) {
        console.error("Failed to load QR image:", err);
      }
    }

    doc.save("Assets_with_QR_Codes.pdf");
  };

  const handleDeleteAsset = async () => {
    if (!modalData.assetCode && !email) return;

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to mark this asset as disposed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
      try {
        const result = await requestDispose({
          assetCode: modalData.assetCode,
          email: email,
        }).unwrap();
        console.log(result);
        refetch();
        setModalData(null);

        Swal.fire({
          title: "Deleted!",
          text: result.message || "Asset marked as disposed.",
          icon: "success",
        });

        // Optionally close modal or refresh list
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: err?.data?.message || "Something went wrong.",
          icon: "error",
        });
      }
    }
  };

  const repeatOptions = [
    { value: "none", label: "None" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const handleScheduleMaintenance = () => {
    if (!modalData) return; // Optional: prevent errors if modalData is undefined

    setScheduleModalData({
      Description: modalData.Description || "",
      Assign: modalData.Assign || "",
      Lastworkorder: modalData.Lastworkorder || "",
      Schedule: modalData.Schedule || "",
      Nextworkorder: modalData.Nextworkorder || "",
      assetCode: modalData.assetCode || "",
    });
    setIsScheduleModalOpen(true);
    setModalData(null);
  };
  // preventive manintenance
  const departmentOptions =
    departments
      ?.filter((dep) =>
        uniqueSupervisorDepartmentIds.includes(dep.departmentId)
      )
      .map((dep) => ({
        value: dep.departmentId,
        label: dep.name,
      })) || [];

  const workerOptions = supervisorsFromSameAcademy
    .filter((user) => user.departmentId === selectedDepartment)
    .map((user) => ({
      value: user.userId,
      label: user.email,
    }));

  const handleCreateSchedule = async () => {
    setIsCreating(true);
    try {
      await createMaintenance({
        timeStart: scheduleModalData.Schedule,
        startDate: scheduleModalData.Lastworkorder,
        endDate: scheduleModalData.Nextworkorder,
        description: scheduleModalData.Description,
        status: "Pending",
        repeat: repeatFrequency?.value || "none",
        userID: assignedWorker?.value || "",
        assetCode: scheduleModalData.assetCode,
        academyId: academyId,
      }).unwrap();

      // Send email to the assigned worker
      if (assignedWorker?.label) {
        await sendEmail({
          to: assignedWorker.label,
        }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Schedule Created",
          text: "Preventive maintenance has been scheduled successfully",
        });
      }

      // Optionally close modal
      setIsScheduleModalOpen(false);
      setRepeatFrequency(null);
      setAssignedWorker(null);
      setScheduleModalData(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Schedule",
        text: error?.data?.message || "Something went wrong. Please try again.",
      });
    }
    setIsCreating(false);
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
      column === sortOrder.column
        ? !sortOrder.ascending
        : true;

    setSortOrder({
      column,
      ascending: newSortOrder,
    });

    sortData(column, newSortOrder);
  };

  return (
    <div className="managerDashboard">
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
          {/* Work Status Dropdown */}
          <Select
            classNamePrefix="custom-select-workstatus"
            className="workstatus-dropdown"
            options={uniqueStatuses}
            value={uniqueStatuses.find(
              (option) => option.value === selectedStatus
            )}
            onChange={(selectedOption) => {
              setSelectedStatus(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            isSearchable={false}
          />
          <div className="create-category-btn">
            <ImFolderDownload
              style={{ color: "#ffffff", marginLeft: "12px" }}
            />
            <button className="category-btn" onClick={handleBulkImport}>
              Bulk Import
            </button>
          </div>
          <div className="create-category-btn">
            <IoMdAdd style={{ color: "#ffffff", marginLeft: "12px" }} />
            <button className="category-btn" onClick={handleAddMachinery}>
              Create Asset
            </button>
          </div>
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
                  checked={selectedRows.length === filteredData.length}
                  onChange={handleSelectAllRows}
                />
              </th>
              {[
                { label: "Sl. No.", field: null },
                { label: "Asset Code", field: "assetCode" },
                { label: "Title", field: "title" },
                { label: "Acquire Date", field: "acquireDate" },
                { label: "Useful Life(year)", field: "usefulLife" },
                { label: "Area", field: "assetArea" },
                { label: "Status", field: "status" },
              ].map((header, index) => (
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
                                sortOrder.column === header.field && sortOrder.ascending
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
              <th>
                {selectedRows.length > 0 && (
                  <button
                    className="delete-all-btn"
                    style={{ paddingLeft: "98px" }}
                    onClick={handleDownloadPDF}
                  >
                    <FaDownload
                      style={{ width: "20px", height: "20px", color: "green" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const isSelected = selectedRows.includes(item.assetCode); // Use assetCode to track selection
              return (
                <tr key={item.assetCode}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(item.assetCode)}
                    />
                  </td>
                  <td>{index + 1}</td> {/* Just showing serial # in table */}
                  <td>{item.assetCode}</td>
                  <td className="description">
                    <Tippy content={item.title || ""} placement="top">
                      <span>
                        {item.title?.length > 20
                          ? item.title.substring(0, 20) + "..."
                          : item.title || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>{item.acquireDate}</td>
                  <td>{item.lifespan}</td>
                  <td className="description">
                    <Tippy content={item.assetArea || ""} placement="top">
                      <span>
                        {item.assetArea?.length > 20
                          ? item.assetArea.substring(0, 20) + "..."
                          : item.assetArea || ""}
                      </span>
                    </Tippy>
                  </td>
                  <td>
                    <div className={getStatusClass(item.status)}>
                      {item.status}
                    </div>
                  </td>
                  <td
                    className="actions"
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      maxWidth: "150px",
                    }}
                  >
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                    <img
                      src={getQrImageUrl(item.attributes)}
                      alt="QR Code"
                      style={{ width: qrSize, height: qrSize }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Upload your file</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowBulkModal(false);
                  setSelectedFile(null);
                }}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileChange}
            />

            <div style={{ marginTop: "20px" }}>
              <button
                className="download-all-btn"
                style={{ marginBottom: "10px" }}
                onClick={downloadDummyExcel}
              >
                Download Dummy Excel
              </button>

              <button
                className="accept-btn"
                onClick={handleBulk}
                disabled={upLoading}
              >
                {upLoading ? "Uploading..." : "Upload"}
              </button>
              <button
                className="reject-btn"
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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

      {/* Add Machinery Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Create Asset</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  // Reset area selection fields when closing the modal
                  setSelectedBlock(null);
                  setSelectedFloor(null);
                  setSelectedRoom(null);
                  setIsNewBlock(false);
                  setErrors({});
                }}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Title:</label>
                <input
                  type="text"
                  value={newMachinery.title}
                  onChange={(e) =>
                    setNewMachinery({ ...newMachinery, title: e.target.value })
                  }
                />
              </div>
              {errors.title && <p className="error-text">{errors.title}</p>}
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input
                  type="text"
                  value={newMachinery.assetCode}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      assetCode: e.target.value,
                    })
                  }
                />
              </div>
              {errors.assetCode && (
                <p className="error-text">{errors.assetCode}</p>
              )}
              <div className="modal-content-field">
                <label>Category:</label>
                <input type="text" value={category} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Serial Number:</label>
                <input
                  type="text"
                  value={newMachinery.Serial_number}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      Serial_number: e.target.value,
                    })
                  }
                />
              </div>
              {errors.Serial_number && (
                <p className="error-text">{errors.Serial_number}</p>
              )}
              <div className="modal-content-field">
                <label>Area:</label>
                <div className="select-group">
                  <div className="select-wrapper">
                    <CreatableSelect
                      classNamePrefix="select"
                      isClearable
                      styles={dropdownStyles}
                      onChange={handleBlockChange}
                      options={blockTitles.map((block) => ({
                        value: block,
                        label: block,
                      }))}
                      placeholder="Select or create block"
                    />
                  </div>
                  {errors.block && <p className="error-text">{errors.block}</p>}
                  {selectedBlock && !isNewBlock && !isFormSubmitted && (
                    <div className="select-wrapper">
                      <Select
                        isClearable
                        isSearchable
                        styles={dropdownStyles}
                        onChange={handleFloorChange}
                        options={Object.keys(
                          blockData[selectedBlock] || {}
                        ).map((floor) => ({
                          value: floor,
                          label: floor,
                        }))}
                        placeholder="Select floor"
                      />
                    </div>
                  )}

                  {selectedBlock &&
                    selectedFloor &&
                    !isNewBlock &&
                    !isFormSubmitted && (
                      <div className="select-wrapper">
                        <Select
                          isClearable
                          isSearchable
                          styles={dropdownStyles}
                          onChange={handleRoomChange}
                          options={(
                            blockData[selectedBlock]?.[selectedFloor] || []
                          ).map((room) => ({ value: room, label: room }))}
                          placeholder="Select room"
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="date"
                  value={newMachinery.acquireDate}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      acquireDate: e.target.value,
                    })
                  }
                />
              </div>
              {errors.acquireDate && (
                <p className="error-text">{errors.acquireDate}</p>
              )}
              <div className="modal-content-field">
                <label>Useful Life (Year):</label>
                <input
                  type="text"
                  value={newMachinery.lifespan}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      lifespan: e.target.value,
                    })
                  }
                />
              </div>
              {errors.lifespan && (
                <p className="error-text">{errors.lifespan}</p>
              )}
              <div className="modal-content-field">
                <label>Cost:</label>
                <input
                  type="text"
                  value={newMachinery.cost}
                  onChange={(e) =>
                    setNewMachinery({ ...newMachinery, cost: e.target.value })
                  }
                />
              </div>
              {errors.cost && <p className="error-text">{errors.cost}</p>}
              <div className="modal-content-field">
                <label>Description:</label>
                <input
                  type="text"
                  value={newMachinery.description}
                  onChange={(e) =>
                    setNewMachinery({
                      ...newMachinery,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  className="accept-btn"
                  style={{ width: "80px" }}
                  onClick={handleSaveNewMachinery}
                  disabled={isLoading2}
                >
                  {isLoading2 ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Viewing Request */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <div className="modal-header">
              <h2 className="form-h">Asset Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <form className="repair-form">
              <div className="modal-content-field">
                <label>Asset Id:</label>
                <input type="text" value={modalData.assetID} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Title:</label>
                <input type="text" value={modalData.title} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input type="email" value={modalData.assetCode} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Serial Number:</label>
                <input
                  type="text"
                  value={
                    modalData?.attributes?.find(
                      (attr) => attr.name === "Serial_number"
                    )?.value || "N/A"
                  }
                  readOnly
                />
              </div>

              <div className="modal-content-field">
                <label>Cost:</label>
                <input type="text" value={modalData.cost} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Depreciated Value:</label>
                <input
                  value={modalData.categoryDetails?.depreciatedValue}
                  readOnly
                />
              </div>
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input type="text" value={modalData.acquireDate} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData.lifespan} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Status:</label>
                <input value={modalData.status} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Category:</label>
                <input value={modalData.categoryDetails?.name} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Area:</label>
                <input value={modalData.assetArea} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Created by</label>
                <input value={modalData.createdBy} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Description: </label>
                <textarea value={modalData.description} readOnly />
              </div>
              <div className="modal-content-field">
                <label>QR: </label>
                <div className="image-container">
                  <img
                    src={getQrImageUrl(modalData.attributes)}
                    alt="QR Code"
                    style={{ width: 300, height: 300 }}
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="accept-btn"
                  style={{ backgroundColor: "red" }}
                  onClick={handleDeleteAsset}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : <RiDeleteBin6Line />}
                </button>
                <button
                  type="button" // Prevents form submission
                  className="accept-btn"
                  onClick={handleScheduleMaintenance}
                >
                  Schedule Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* scheduleModel */}
      {isScheduleModalOpen && scheduleModalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Preventive maintenance schedule form</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setScheduleModalData(null);
                  setIsScheduleModalOpen(false);
                }}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            <div className="schedule-form">
              <p className="sub-title">Maintenance Detail</p>
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
                  isClearable
                />
              </div>
              <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={assignedWorker}
                  onChange={setAssignedWorker}
                  isClearable
                />
              </div>
              <div className="modal-content-field">
                <label>Description: </label>
                <input
                  type="text"
                  value={scheduleModalData.Description}
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Schedule fields */}
              <p className="sub-title">Schedule</p>
              <div className="modal-content-field">
                <label>Repeat:</label>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={repeatOptions}
                  value={repeatFrequency}
                  onChange={setRepeatFrequency}
                  isClearable
                />
              </div>
              <div className="modal-content-field">
                <label>Starts on: </label>
                <input
                  type="date"
                  value={
                    scheduleModalData.Lastworkorder
                      ? new Date(scheduleModalData.Lastworkorder)
                        .toISOString()
                        .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Lastworkorder: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Schedule time: </label>
                <input
                  type="time"
                  value={scheduleModalData.Schedule}
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Schedule: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Ends on: </label>
                <input
                  type="date"
                  value={
                    scheduleModalData.Nextworkorder
                      ? new Date(scheduleModalData.Nextworkorder)
                        .toISOString()
                        .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setScheduleModalData({
                      ...scheduleModalData,
                      Nextworkorder: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-buttons">
                <button
                  className="accept-btn"
                  style={{ width: "150px" }}
                  onClick={handleCreateSchedule}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machinery;
