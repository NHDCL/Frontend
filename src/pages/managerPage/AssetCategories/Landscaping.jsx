import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../AssetCategory";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { TiArrowSortedUp } from "react-icons/ti";
import {
  useGetAssetByAcademyQuery,
  usePostUploadImagesMutation,
  usePostAssetMutation,
  useGetCategoryQuery,
  useUploadExcelMutation,
  useRequestDisposeMutation,
  useUpdateAssetStatusMutation,
} from "../../../slices/assetApiSlice";
import Swal from "sweetalert2";
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

const Landscaping = ({ category }) => {
  const email = useSelector(getUserEmail);
  const { data: manager } = useGetUserByEmailQuery(email);
  const { data: categories } = useGetCategoryQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalData, setModalData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [postAsset, { isLoading: isLoading2 }] = usePostAssetMutation();
  const [newLandscaping, setNewLandscaping] = useState({
    title: "",
    assetCode: "",
    acquireDate: "",
    lifespan: "",
    status: "",
    cost: "",
    assetArea: "",
    Size: "",
  });

  const [academyId, setAcademyId] = useState(null);
  const [CategoryId, setCategoryId] = useState(null);
  const [scheduleModalData, setScheduleModalData] = useState(null);
  const { data: assets, refetch } = useGetAssetByAcademyQuery(academyId);
  const [data, setData] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [postUploadImages, { isLoading, error }] =
    usePostUploadImagesMutation();
  const [uploadExcel, { isLoading: upLoading }] = useUploadExcelMutation();
  const [requestDispose, { isLoading: isDeleting }] =
    useRequestDisposeMutation();
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
  const [updateAssetStatus] = useUpdateAssetStatusMutation();

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
    if (categories) {
      const filteredCategories = categories.filter(
        (categorie) => categorie.name === category
      );
      setCategoryId(filteredCategories[0].id);
    }
  }, [assets]);

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
        createdBy: email,
        academyID: academyId,
        assetCategoryID: CategoryId,
        // Any extra dynamic attributes can be added too
        Size: "2m hieght",
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

  const validateForm = () => {
    const errors = {};
    if (!newLandscaping.title?.trim()) errors.title = "Title is required";
    if (!newLandscaping.assetCode?.trim())
      errors.assetCode = "Asset Code is required";
    if (!newLandscaping.Size?.trim()) errors.Size = "Size is required";
    if (!newLandscaping.acquireDate?.trim())
      errors.acquireDate = "Acquired Date is required";
    if (!newLandscaping.lifespan?.trim())
      errors.lifespan = "Lifespan is required";
    if (!newLandscaping.cost?.trim()) errors.cost = "Cost is required";
    if (!newLandscaping.assetArea?.trim())
      errors.assetArea = "Area is required";
    return errors;
  };

  const rowsPerPage = 10;

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

  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRows.includes(item.AID)));
    setSelectedRows([]);
  };

  const handleView = (item) => {
    setModalData(item);
  };

  const [file, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
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

  const getDisplayText = (status) => {
    switch (status) {
      case "In Maintenance":
        return "In Usage"; // Show as 'In Usage'
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
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
  };

  const handleAddLandscaping = () => {
    setShowAddModal(true);
  };

  const handleBulkImport = () => {
    setShowBulkModal(true);
  };

  const handleBulk = async () => {
    if (!file) {
      return Swal.fire({
        icon: "warning",
        title: "No File",
        text: "Please select an Excel file first.",
      });
    }

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // 1. Check for duplicate assetCodes in the uploaded file
        const uploadedAssetCodes = jsonData.map((item) => item.assetCode);
        const uniqueUploadedCodes = new Set(uploadedAssetCodes);

        if (uniqueUploadedCodes.size !== uploadedAssetCodes.length) {
          return Swal.fire({
            icon: "error",
            title: "Duplicate Asset Code",
            text: "Each assetCode must be unique within the Excel file.",
          });
        }

        // 2. Check if any uploaded assetCode already exists in fetched assets
        const existingAssetCodes = new Set(assets.map((a) => a.assetCode));
        const duplicatesWithDatabase = uploadedAssetCodes.filter((code) =>
          existingAssetCodes.has(code)
        );

        if (duplicatesWithDatabase.length > 0) {
          return Swal.fire({
            icon: "error",
            title: "Duplicate in Database",
            html: `The following assetCodes already exist: <br/><strong>${duplicatesWithDatabase.join(
              ", "
            )}</strong>`,
          });
        }

        // 3. Check if all rows match the current academyId and categoryId
        const invalidRow = jsonData.find(
          (item) =>
            item.academyID !== academyId || item.assetCategoryID !== CategoryId
        );

        if (invalidRow) {
          return Swal.fire({
            icon: "error",
            title: "Invalid Data",
            html: `
              <p>academyID or assetCategoryID in one or more rows does not match the selected values.</p>
              <p><strong>Row Values:</strong></p>
              <ul>
                <li><strong>academyID:</strong> ${invalidRow.academyID}</li>
                <li><strong>assetCategoryID:</strong> ${invalidRow.assetCategoryID}</li>
              </ul>
              <p><strong>Expected:</strong></p>
              <ul>
                <li>academyID: ${academyId}</li>
                <li>assetCategoryID: ${CategoryId}</li>
              </ul>
            `,
          });
        }

        // ✅ All checks passed — Upload
        const res = await uploadExcel(file).unwrap();
        refetch();
        setSelectedFile(null);
        setShowBulkModal(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Excel file uploaded successfully!",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err?.data?.message || "Something went wrong while uploading.",
      });
    }
  };

  const handleSaveNewLandscaping = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const payload = {
      assetCode: newLandscaping.assetCode,
      title: newLandscaping.title,
      cost: Number(newLandscaping.cost),
      acquireDate: newLandscaping.acquireDate,
      lifespan: newLandscaping.lifespan,
      assetArea: newLandscaping.assetArea,
      description: newLandscaping.description,
      status: "Pending",
      createdBy: email,
      deletedBy: null,
      academyID: academyId,
      assetCategoryID: CategoryId,
      attributes: [{ name: "Size", value: newLandscaping.Size }],
    };

    try {
      const res = await postAsset(payload).unwrap();
      const assetId = res.assetID;

      if (selectedFiles.length > 0) {
        const formData = new FormData();

        // Ensure images is an array of File objects before calling forEach
        if (
          !Array.isArray(selectedFiles) ||
          !selectedFiles.every((file) => file instanceof File)
        ) {
          console.error(
            "selectedFiles is not an array of File objects",
            selectedFiles
          );
          return;
        }

        // Append assetID to FormData
        formData.append("assetID", assetId); // Make sure assetID is an integer

        // Append files to FormData
        selectedFiles.forEach((file) => {
          console.log("Appending file to formData:", file); // Check the file type
          if (file instanceof File) {
            formData.append("images", file); // Append only if it's a valid file
          } else {
            console.error("Invalid file detected:", file);
          }
        });

        // Call the mutation
        await postUploadImages(formData);
      }
      Swal.fire({
        icon: "success",
        title: "Asset creation request submitted.",
        text: "Asset creation request has been successfully submitted. Please wait for admin approval.",
        confirmButtonColor: "#305845",
      });
      refetch();
      setNewLandscaping({
        title: "",
        assetCode: "",
        acquireDate: "",
        lifespan: "",
        status: "",
        cost: "",
        assetArea: "",
        Size: "",
      });
      setSelectedFiles([]); // Clear the selected files
      fileInputRef.current.value = null;
      setShowAddModal(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to create asset",
        text: err?.data?.message || "Something went wrong!",
        confirmButtonColor: "#897463",
      });
    }
  };

  const handleFileSelection = (e) => {
    const newFiles = [...e.target.files];
    const totalFiles = newFiles.length + selectedFiles.length;

    if (totalFiles > 5) {
      // Show SweetAlert with a custom message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You can only select up to 5 images!",
        confirmButtonText: "OK",
      }).then(() => {
        // Clear the input and reset the selected files state
        fileInputRef.current.value = null;
      });
      return;
    }

    // Add the selected files to the state
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleUploadButtonClick = (assetID) => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();

      // Ensure images is an array of File objects before calling forEach
      if (
        !Array.isArray(selectedFiles) ||
        !selectedFiles.every((file) => file instanceof File)
      ) {
        console.error(
          "selectedFiles is not an array of File objects",
          selectedFiles
        );
        return;
      }

      // Append assetID to FormData
      formData.append("assetID", assetID); // Make sure assetID is an integer

      // Append files to FormData
      selectedFiles.forEach((file) => {
        console.log("Appending file to formData:", file); // Check the file type
        if (file instanceof File) {
          formData.append("images", file); // Append only if it's a valid file
        } else {
          console.error("Invalid file detected:", file);
        }
      });

      // Call the mutation
      postUploadImages(formData)
        .unwrap()
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Upload Successful!",
            text: "Your images have been uploaded.",
          });
          setSelectedFiles([]); // Clear the selected files
          fileInputRef.current.value = null; // Reset the input value
          refetch();
          setModalData(null);
        })
        .catch((error) => {
          console.log("Error uploading files:", error);
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: error?.message || "An error occurred during upload.",
          });
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Files Selected",
        text: "Please select at least one file to upload.",
      });
    }
  };

  const handleDownloadAllImages = () => {
    const imageUrls = modalData.attributes
      .filter((attr) => attr.name.startsWith("image")) // Filter image attributes
      .map((imageAttr) => imageAttr.value); // Get the image URLs

    imageUrls.forEach((imageUrl) => {
      // Create a link element for downloading each image
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop(); // Download the file with its original name

      // Fetch the image as a Blob and trigger the download
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.click(); // Trigger the download
          URL.revokeObjectURL(objectURL); // Clean up
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
        });
    });
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
      Schedule: getCurrentTime(),
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
      const assetCode = scheduleModalData.assetCode;

      await createMaintenance({
        timeStart: scheduleModalData.Schedule,
        startDate: scheduleModalData.Lastworkorder,
        endDate: scheduleModalData.Nextworkorder,
        description: scheduleModalData.Description,
        status: "Pending",
        repeat: repeatFrequency?.value || "none",
        userID: assignedWorker?.value || "",
        assetCode,
        academyId: academyId,
      }).unwrap();

      // Send email to the assigned worker
      await Promise.all([
        updateAssetStatus({ assetCode, status: "In Maintenance" }).unwrap(),
        assignedWorker?.label
          ? sendEmail({ to: assignedWorker.label }).unwrap()
          : Promise.resolve(),
      ]);

      Swal.fire({
        icon: "success",
        title: "Schedule Created",
        text: "Preventive maintenance has been scheduled successfully",
      });

      // Optionally close modal
      setIsScheduleModalOpen(false);
      setRepeatFrequency(null);
      setAssignedWorker(null);
      setScheduleModalData(null);
      refetch();
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
      let valA, valB;

      if (column === "Size") {
        const attrA = a.attributes.find((attr) => attr.name === "Size");
        const attrB = b.attributes.find((attr) => attr.name === "Size");
        valA = attrA ? attrA.value : "";
        valB = attrB ? attrB.value : "";
      } else {
        valA = a[column];
        valB = b[column];
      }

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
  const getStatusDescription = (status) => {
    switch (status) {
      case "Pending":
        return "The asset is awaiting approval or further action.";
      case "In Usage":
        return "The asset is currently being used.";
      case "In Maintenance":
        return "The asset is currently in use and also undergoing maintenance or repair.";
      case "Disposed":
        return "The asset has been disposed and is no longer in use.";
      default:
        return "Unknown status.";
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // returns "HH:MM"
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
              Bulk Upload
            </button>
          </div>
          <div className="create-category-btn">
            <IoMdAdd style={{ color: "#ffffff", marginLeft: "12px" }} />
            <button className="category-btn" onClick={handleAddLandscaping}>
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
              {[
                { label: "Sl. No.", field: null },
                { label: "Asset Code", field: "assetCode" },
                { label: "Name", field: "title" },
                { label: "Acquire Date", field: "acquireDate" },
                { label: "Useful Life(year)", field: null },
                { label: "Size", field: "Size" },
                { label: "Depreciated Value (%)", field: null },
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
              <th>
                {selectedRows.length > 0 && (
                  <button
                    className="delete-all-btn"
                    onClick={handleDeleteSelected}
                  >
                    <RiDeleteBin6Line
                      style={{ width: "20px", height: "20px", color: "red" }}
                    />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => {
              // Extract values from `attributes`
              const sizeAttr = item.attributes.find(
                (attr) => attr.name === "Size"
              );
              const size = sizeAttr ? sizeAttr.value : "N/A";
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
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
                  <td>{formatDate(item.acquireDate)}</td>
                  <td>{item.lifespan}</td>
                  <td>{size}</td>
                  <td>{item.categoryDetails?.depreciatedValue}</td>
                 <td>
                        <Tippy
                          content={getStatusDescription(item.status)}
                          placement="top"
                        >
                          <div className={getStatusClass(item.status)}>
                            {getDisplayText(item.status)}
                          </div>
                        </Tippy>
                      </td>
                  <td className="actions">
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
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

      {/* Add Landscaping Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="form-h">Create Asset</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setFormErrors({});
                }}
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>
            <div className="schedule-form">
              <div className="modal-content-field">
                <label>Name:</label>
                <input
                  type="text"
                  value={newLandscaping.title}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.title && (
                <span className="error-text">{formErrors.title}</span>
              )}
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input
                  type="text"
                  value={newLandscaping.assetCode}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      assetCode: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.assetCode && (
                <span className="error-text">{formErrors.assetCode}</span>
              )}
              <div className="modal-content-field">
                <label>Category:</label>
                <input type="text" value={category} readOnly />
              </div>

              <div className="modal-content-field">
                <label>Size:</label>
                <input
                  type="text"
                  value={newLandscaping.Size}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      Size: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.Size && (
                <span className="error-text">{formErrors.Size}</span>
              )}
              <div className="modal-content-field">
                <label>Acquired Date:</label>
                <input
                  type="date"
                  value={newLandscaping.acquireDate}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      acquireDate: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.acquireDate && (
                <span className="error-text">{formErrors.acquireDate}</span>
              )}
              <div className="modal-content-field">
                <label>Useful Life (Year):</label>
                <input
                  type="text"
                  value={newLandscaping.lifespan}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      lifespan: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.lifespan && (
                <span className="error-text">{formErrors.lifespan}</span>
              )}
              <div className="modal-content-field">
                <label>Cost:</label>
                <input
                  type="text"
                  value={newLandscaping.cost}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      cost: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.cost && (
                <span className="error-text">{formErrors.cost}</span>
              )}
              <div className="modal-content-field">
                <label>Area:</label>
                <input
                  type="text"
                  value={newLandscaping.assetArea}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      assetArea: e.target.value,
                    })
                  }
                />
              </div>
              {formErrors.assetArea && (
                <span className="error-text">{formErrors.assetArea}</span>
              )}
              <div className="modal-content-field">
                <label>Description:</label>
                <input
                  type="text"
                  value={newLandscaping.description}
                  onChange={(e) =>
                    setNewLandscaping({
                      ...newLandscaping,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-content-field">
                <label>Images:</label>
                <div className="image-field">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelection}
                    ref={fileInputRef}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="accept-btn"
                  style={{ width: "110px" }}
                  onClick={handleSaveNewLandscaping}
                  disabled={isLoading || isLoading2}
                >
                  {isLoading || isLoading2 ? "Submitting..." : "Submit"}
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
                <label>Name:</label>
                <input type="text" value={modalData.title} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Asset Code:</label>
                <input type="email" value={modalData.assetCode} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Size</label>
                <input
                  type="text"
                  value={
                    modalData?.attributes?.find((attr) => attr.name === "Size")
                      ?.value || "N/A"
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
                <input
                  type="text"
                  value={formatDate(modalData.acquireDate)}
                  readOnly
                />
              </div>
              <div className="modal-content-field">
                <label>Useful Life(Years):</label>
                <input value={modalData.lifespan} readOnly />
              </div>
              <div className="modal-content-field">
                <label>Status:</label>
                <input value={getDisplayText(modalData.status)} readOnly />
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
                <label>Images:</label>
                {modalData &&
                modalData.attributes &&
                modalData.attributes.filter((attr) =>
                  attr.name.startsWith("image")
                ).length > 0 ? (
                  <div className="image-gallery">
                    {modalData.attributes
                      .filter((attr) => attr.name.startsWith("image"))
                      .map((imageAttr, index) => (
                        <div key={index} className="image-container">
                          <img
                            src={imageAttr.value}
                            alt={`Asset Image ${index + 1}`}
                            className="asset-image"
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="inputImage">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelection}
                      ref={fileInputRef}
                    />
                  </div>
                )}
              </div>
              {/* Other fields here */}

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
                {modalData.status !== "Pending" && (
                  <button
                    type="button"
                    className="accept-btn"
                    onClick={handleScheduleMaintenance}
                  >
                    Schedule Maintenance
                  </button>
                )}

                {/* Align Download Button with Schedule Maintenance */}
                <div className="align-buttons">
                  {modalData.attributes &&
                  modalData.attributes.some((attr) =>
                    attr.name.startsWith("image")
                  ) ? (
                    <button
                      type="button"
                      className="download-all-btn"
                      onClick={handleDownloadAllImages}
                    >
                      Download All Images
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="download-all-btn"
                        onClick={() =>
                          handleUploadButtonClick(modalData.assetID)
                        }
                        disabled={isLoading}
                      >
                        {isLoading ? "Uploading..." : "Upload Images"}{" "}
                      </button>
                    </>
                  )}
                </div>
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
                <div style={{ width: "100%",maxWidth:"350px" }}>
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
              </div>

              <div className="modal-content-field">
                <label>Assign Supervisor:</label>
                <div style={{ width: "100%",maxWidth:"350px" }}>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={workerOptions}
                  value={assignedWorker}
                  onChange={setAssignedWorker}
                  isClearable
                />
              </div>
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
              <p className="sub-title">Schedule Maintenance Notification</p>
              <div className="modal-content-field">
                <label>Repeat:</label>
                <div style={{ width: "100%",maxWidth:"350px" }}>
                <Select
                  classNamePrefix="custom-select-department"
                  className="workstatus-dropdown"
                  options={repeatOptions}
                  value={repeatFrequency}
                  onChange={setRepeatFrequency}
                  isClearable
                />
              </div>
              </div>

              <div className="modal-content-field">
                <label>From date: </label>
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
                  readOnly
                  disabled
                />
              </div>
              <div className="modal-content-field">
                <label>To date: </label>
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

export default Landscaping;
