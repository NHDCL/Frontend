import React, { useState, useEffect, useRef } from "react";
import MaintenanceCard from "./TMaintenanceCard";
import "./css/Thome.css";
import "./css/TModalOverlay.css";
import "./../managerPage/css/dropdown.css";
import Select from "react-select";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { RiImageAddLine } from "react-icons/ri";

import {
  useGetMaintenanceByTechnicianEmailQuery,
  useGetMaintenanceReportByIDQuery,
  useUpdatePreventiveMaintenanceMutation,
  useGiveEndTimeMutation,
  useGiveStartTimeMutation,
  useCompleteMaintenanceReportMutation,
} from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { assetApiSlice } from "../../slices/assetApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

const WorkOrderModal = ({ order, onClose, data = [], refetchTechnicianSchedules }) => {
  const [teamMembers, setTeamMembers] = useState(order.teamMembers || []);
  const [newMember, setNewMember] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState(
    order.status || ""
  );
  const [images, setImages] = useState([]); // Allow multiple images
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const [updateMaintenanceById, { isLoading, error }] =
    useUpdatePreventiveMaintenanceMutation();
  const maintenanceID = order.maintenanceID;

  const [formData, setFormData] = useState({
    maintenanceReportID: "",
    startTime: "",
    endTime: "",
    finishedDate: "",
    totalCost: "",
    information: "",
    partsUsed: "",
    preventiveMaintenanceID: maintenanceID,
    images: [],
  });
  const [giveStartTime] = useGiveStartTimeMutation();
  const [giveEndTime] = useGiveEndTimeMutation();
  const [completeMaintenanceReport, { isLoading: posting }] =
    useCompleteMaintenanceReportMutation();

  const { data: maintenanceReport, refetch } = useGetMaintenanceReportByIDQuery(
    maintenanceID,
    {
      skip: !maintenanceID, // skip until userID is available
    }
  );
  const reportExists =
    Array.isArray(maintenanceReport) && maintenanceReport.length > 0;

  useEffect(() => {
    if (reportExists) {
      const report = maintenanceReport[0];

      setFormData({
        maintenanceReportID: report.maintenanceReportID ?? "",
        startTime: report.startTime ?? "",
        endTime: report.endTime ?? "",
        finishedDate: report.finishedDate ?? "",
        totalCost: report.totalCost ?? "",
        information: report.information ?? "",
        partsUsed: Array.isArray(report.partsUsed)
          ? report.partsUsed.join(", ")
          : "",
        preventiveMaintenanceID: report.maintenanceID ?? "",
        images: report.images ?? [],
      });
    }
  }, [maintenanceReport, reportExists]);

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleAddMember = () => {
    if (newMember.trim() && !teamMembers.includes(newMember)) {
      setTeamMembers([...teamMembers, newMember]);
      setNewMember(""); // Reset input
    }
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  if (!order) return null;

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }
    setImageError("");
    setImages((prevImages) => [...prevImages, ...files]);
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const {
      maintenanceReportID,
      finishedDate,
      totalCost,
      information,
      partsUsed,
    } = formData;

    // basic validation
    if (
      !maintenanceReportID ||
      !finishedDate.trim() ||
      !totalCost.trim() ||
      !information.trim() ||
      !partsUsed.trim() ||
      teamMembers.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Please fill in all fields",
        text: "FinishedDate, TotalCost, Information, PartsUsed, Technicians and Images",
      });
      return;
    }

    // build FormData with ONLY the fields you still need to send
    const sendData = new FormData();
    sendData.append("finishedDate", finishedDate.trim());
    sendData.append("totalCost", totalCost.trim());
    sendData.append("information", information.trim());

    partsUsed
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((part) => sendData.append("partsUsed", part));

    teamMembers
      .map((tech) => tech.trim())
      .filter(Boolean)
      .forEach((tech) => sendData.append("technicians", tech));

    images.forEach((img) => sendData.append("images", img));

    try {
      // call your “complete” mutation
      await completeMaintenanceReport({
        maintenanceReportID, // path param
        formData: sendData, // body
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Maintenance Report completed!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      // reset
      setFormData((f) => ({
        ...f,
        finishedDate: "",
        totalCost: "",
        information: "",
        partsUsed: "",
      }));
      setTeamMembers([]);
      setImages([]);
      refetch();
      refetchTechnicianSchedules();
    } catch (err) {
      console.error("Error completing repair report:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to complete repair report",
        text: err?.data?.message || "Something went wrong.",
      });
    }
  };

  // Extract unique work statuses from data
  const WorkOrder = [
    { value: "Pending", label: "Pending" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const getFilteredWorkStatusOptions = () => {
    switch (selectedWorkStatus) {
      case "Pending":
        return WorkOrder.filter(
          (option) =>
            option.value === "Pending" || option.value === "In Progress"
        );
      case "In Progress":
        return WorkOrder.filter(
          (option) =>
            option.value === "In Progress" || option.value === "Completed"
        );
      case "Completed":
        return WorkOrder.filter((option) => option.value === "Completed");
      default:
        return WorkOrder;
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="TModal-modal-overlay">
      <div className="TModal-modal-content">
        <div className="TModal-modal-header">
          <h2 className="TModal-form-h">Work Order Details</h2>
          <button className="TModal-close-btn" onClick={onClose}>
            <IoIosCloseCircle
              style={{ color: "#897463", width: "20px", height: "20px" }}
            />
          </button>
        </div>
        <form className="TModal-repair-form" onSubmit={handleAdd}>
          <div className="TModal-content-field">
            <label>Asset Name:</label>
            <input type="text" value={order.asset_Details.title} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Date:</label>
            <div className="TModal-time-inputs">
              <input
                className="TModal-WorkOTime"
                type="text"
                value={order.startDate}
                readOnly
              />
              <input
                className="TModal-WorkOTime"
                type="text"
                value={order.endDate}
                readOnly
              />
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Time:</label>
            <input type="text" value={order.timeStart} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Area:</label>
            <input type="text" value={order.asset_Details.assetArea} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Description:</label>
            <textarea value={order.description} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Work Status:</label>
            <div style={{ width: "100%", maxWidth: "350px" }}>
              {/* <Select
                classNamePrefix="customm-select-workstatus"
                className="Wworkstatus-dropdown"
                options={WorkOrder}
                value={WorkOrder.find(
                  (option) => option.value === selectedWorkStatus
                )}
                onChange={async (selectedOption) => {
                  const newStatus = selectedOption ? selectedOption.value : "";
                  setSelectedWorkStatus(newStatus);
                  // ⚡ Update status inside repairInfo
                  try {
                    await updateMaintenanceById({
                      id: order.maintenanceID, // use correct repairID from order
                      maintenance: { status: newStatus }, // this updates repairInfo.status
                    }).unwrap();
                    if (newStatus === "In Progress") {
                      const currentTime = new Date().toLocaleTimeString(
                        "en-GB",
                        {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      const response = await giveStartTime({
                        preventiveMaintenanceID: order.maintenanceID,
                        startTime: currentTime,
                      }).unwrap();
                      setFormData((prev) => ({
                        ...prev,
                        startTime: response.startTime, // Assuming backend returns updated object
                      }));
                    }
                    // Submit end time if status is "Completed"
                    if (newStatus === "Completed") {
                      const currentTime = new Date().toLocaleTimeString(
                        "en-GB",
                        {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );
                      const response = await giveEndTime({
                        maintenanceReportID: formData.maintenanceReportID, // use the correct report ID
                        endTime: currentTime,
                      }).unwrap();

                      setFormData((prev) => ({
                        ...prev,
                        endTime: response.endTime,
                      }));
                    }

                    refetch();
                    Swal.fire({
                      icon: "success",
                      title: "Work Status Updated",
                      text: `Status is now "${newStatus}"`,
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  } catch (err) {
                    console.error("❌ Failed to update work status:", err);
                    Swal.fire({
                      icon: "error",
                      title: "Error Updating Status",
                      text: "Could not update status. Try again later.",
                    });
                  }
                }}
                isClearable
                isSearchable={false}
              /> */}
              <Select
                classNamePrefix="customm-select-workstatus"
                className="Wworkstatus-dropdown"
                options={getFilteredWorkStatusOptions()}
                value={WorkOrder.find(
                  (option) => option.value === selectedWorkStatus
                )}
                onChange={async (selectedOption) => {
                  const newStatus = selectedOption ? selectedOption.value : "";
                  setSelectedWorkStatus(newStatus);

                  try {
                    await updateMaintenanceById({
                      id: order.maintenanceID,
                      maintenance: { status: newStatus },
                    }).unwrap();

                    if (newStatus === "In Progress") {
                      const currentTime = new Date().toLocaleTimeString(
                        "en-GB",
                        {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      const response = await giveStartTime({
                        preventiveMaintenanceID: order.maintenanceID,
                        startTime: currentTime,
                      }).unwrap();

                      setFormData((prev) => ({
                        ...prev,
                        startTime: response.startTime,
                      }));
                    }

                    if (newStatus === "Completed") {
                      const currentTime = new Date().toLocaleTimeString(
                        "en-GB",
                        {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      const response = await giveEndTime({
                        maintenanceReportID: formData.maintenanceReportID,
                        endTime: currentTime,
                      }).unwrap();

                      setFormData((prev) => ({
                        ...prev,
                        endTime: response.endTime,
                      }));
                    }

                    refetch();
                    Swal.fire({
                      icon: "success",
                      title: "Work Status Updated",
                      text: `Status is now "${newStatus}"`,
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  } catch (err) {
                    console.error("❌ Failed to update work status:", err);
                    Swal.fire({
                      icon: "error",
                      title: "Error Updating Status",
                      text: "Could not update status. Try again later.",
                    });
                  }
                }}
                isClearable={false}
                isSearchable={false}
              />
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Time:</label>
            <div className="TModal-time-inputs">
              <input
                className="TModal-WorkOTime"
                type="time"
                value={
                  reportExists && maintenanceReport?.startTime
                    ? maintenanceReport.startTime
                    : formData.startTime
                }
                readOnly={reportExists}
              />
              <input
                className="TModal-WorkOTime"
                type="time"
                // value={formData.endTime}
                value={
                  reportExists && maintenanceReport?.endTime
                    ? maintenanceReport.endTime
                    : formData.endTime
                }
                readOnly={reportExists}
              />
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Finished Date:</label>
            <input
              type="date"
              value={
                reportExists && maintenanceReport?.finishedDate
                  ? maintenanceReport.finishedDate
                  : formData.finishedDate
              }
              min={today}
              onChange={(e) => handleInputChange(e, "finishedDate")}
              readOnly={reportExists && maintenanceReport?.[0]?.finishedDate}
            />
          </div>

          <div className="TModal-content-field">
            <label>Total Cost:</label>
            <input
              type="text"
              value={
                reportExists && maintenanceReport?.totalCost
                  ? maintenanceReport.totalCost
                  : formData.totalCost
              }
              onChange={(e) => handleInputChange(e, "totalCost")}
              placeholder="Enter Total Cost"
              readOnly={reportExists && maintenanceReport?.[0]?.totalCost}
            />
          </div>

          <div className="TModal-content-field">
            <label>Parts Used:</label>
            <input
              type="text"
              value={
                reportExists && maintenanceReport?.[0]?.partsUsed
                  ? maintenanceReport[0].partsUsed
                  : formData.partsUsed
              }
              onChange={(e) =>
                setFormData({ ...formData, partsUsed: e.target.value })
              }
              placeholder="Enter parts used (e.g., wood, metal, screws)"
              readOnly={reportExists && maintenanceReport?.[0]?.partsUsed}
            />
          </div>

          {reportExists && maintenanceReport[0]?.images ? (
            <div className="TModal-content-field">
              <label>Repaired Images:</label>

              <div className="TModal-profile-img">
                {maintenanceReport[0].images.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Work Order ${index + 1}`}
                    className="TModal-modal-image"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="TModal-content-field">
                <label>Upload Images:</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                {imageError && <p className="error-text">{imageError}</p>}
                <div className="TModal-profile-img">
                  {images.map((img, idx) => (
                    <div key={idx} className="mr-preview-wrapper">
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`Preview ${idx}`}
                        className="TModal-modal-image"
                      />
                      <button
                        type="button"
                        className="mr-remove-btn"
                        onClick={() => removeImage(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <div
                      className="mr-upload-box"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RiImageAddLine className="mr-upload-icon" />
                      <p className="mr-pimg">Upload Images</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {reportExists && maintenanceReport[0]?.technicians ? (
            <div className="TModal-content-field">
              <label>Team Members:</label>

              <div className="TModal-outer-team">
                <div className="TModal-team-list">
                  {maintenanceReport[0].technicians
                    .split(",")
                    .map((member, index) => (
                      <span key={index} className="TModal-team-member">
                        {member}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="TModal-content-field">
                <label>Team Members:</label>
                <div className="TModal-outer-team">
                  <div className="TModal-team-members">
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                    />
                    <button
                      type="button"
                      className="TModal-add-btn"
                      onClick={handleAddMember}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="TModal-content-field">
                <label></label>
                <div className="TModal-outer-team">
                  {teamMembers.length > 0 && (
                    <div className="TModal-team-list">
                      {teamMembers.map((member, index) => (
                        <span key={index} className="TModal-team-member">
                          {member}
                          <IoMdCloseCircle
                            onClick={() => handleRemoveMember(index)}
                            style={{
                              color: "black",
                              marginLeft: "4px",
                              cursor: "pointer",
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="TModal-content-field">
            <label>Additional Information:</label>
            <textarea
              value={
                reportExists && maintenanceReport?.information
                  ? maintenanceReport.information
                  : formData.information
              }
              onChange={(e) => handleInputChange(e, "information")}
              placeholder="Enter any additional information"
              readOnly={reportExists && maintenanceReport?.[0]?.information}
            />
          </div>

          {(!reportExists ||
            !maintenanceReport?.[0]?.finishedDate ||
            !maintenanceReport?.[0]?.totalCost ||
            !maintenanceReport?.[0]?.partsUsed ||
            !maintenanceReport?.[0]?.images?.length) && (
            <div disabled={posting} className="TModal-modal-buttons">
              <button type="submit" className="TModal-accept-btn">
                {posting ? "Posting..." : "Done"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const TechnicianMSchedule = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.username || ""
  );
  const [data, setData] = useState([]);

  const email = useSelector(getUserEmail);
  const { data: technicianSchedules, refetch: refetchTechnicianSchedules } =
    useGetMaintenanceByTechnicianEmailQuery(email);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchRepairDetails = async () => {
      if (technicianSchedules?.length) {
        const assetPromises = technicianSchedules.map(async (schedule) => {
          try {
            const Asset = await dispatch(
              assetApiSlice.endpoints.getAssetByAssetCode.initiate(
                schedule?.assetCode
              )
            ).unwrap();

            return {
              ...schedule,
              asset_Details: Asset,
            };
          } catch (err) {
            console.error(
              `❌ Error fetching repair for ID ${schedule?.assetCode}:`,
              err
            );
            return null; // return null to filter out later
          }
        });

        const results = await Promise.all(assetPromises);
        if (isMounted) {
          const validMergedData = results.filter(Boolean);
          setData(validMergedData);
        }
      }
    };

    fetchRepairDetails();

    return () => {
      isMounted = false;
    };
  }, [technicianSchedules, dispatch]);

  const uniqueWorkStatuses = [
    { value: null, label: "All Workstatus" },
    ...Array.from(new Set(data.map((item) => item.status))).map((priority) => ({
      value: priority,
      label: priority,
    })),
  ];

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item)
      .map((value) =>
        value !== null && value !== undefined
          ? value.toString().toLowerCase()
          : ""
      )
      .some((text) => text.includes(searchTerm.toLowerCase()));

    const matchesWorkStatus =
      !selectedWorkStatus || item.status === selectedWorkStatus;

    return matchesSearch && matchesWorkStatus;
  });
  return (
    <div className="work-orders-container">
      <div className="WorkOrder-filter-section">
        <Select
          classNamePrefix="custom-select"
          className="priority-dropdown"
          options={uniqueWorkStatuses}
          value={uniqueWorkStatuses.find(
            (option) => option.value === selectedWorkStatus
          )}
          onChange={(selectedOption) =>
            setSelectedWorkStatus(selectedOption ? selectedOption.value : null)
          }
          isClearable
          isSearchable={false}
        />
      </div>

      <div className="work-orders-grid">
        {filteredData.map((order) => (
          <MaintenanceCard
            key={order.assetCode}
            {...order}
            onView={() => setSelectedOrder(order)}
          />
        ))}
      </div>

      {selectedOrder && (
        <WorkOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          refetchTechnicianSchedules={refetchTechnicianSchedules} // ✅ Pass the prop
        />
      )}
    </div>
  );
};

export default TechnicianMSchedule;
