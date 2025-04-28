import React, { useState, useEffect, useRef } from "react";
import WorkOrderCard from "./TWorkCard";
import "./css/Thome.css";
import "./css/TModalOverlay.css";
import "./../managerPage/css/dropdown.css";
import Select from "react-select";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { RiImageAddLine } from "react-icons/ri";

import {
  useUpdateRepairByIdMutation,
  useGetSchedulesByTechnicianEmailQuery,
  useCreateRepairReportMutation,
  useGetRepairReportByIDQuery,
} from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { maintenanceApiSlice } from "../../slices/maintenanceApiSlice";

import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

const WorkOrderModal = ({ order, onClose, data = [] }) => {
  const [teamMembers, setTeamMembers] = useState(order.teamMembers || []);
  const [newMember, setNewMember] = useState("");
  // const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [images, setImages] = useState([]); // Allow multiple images
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const [selectedWorkStatus, setSelectedWorkStatus] = useState(
    order.repairInfo.status || ""
  );

  const [updateRepairById, { isLoading, error }] =
    useUpdateRepairByIdMutation();

  const [createRepairReport, { isLoading: posting }] =
    useCreateRepairReportMutation();

  const repairID = order.repairInfo.repairID;
  console.log("rip", repairID);
  const tm = teamMembers.join(", ");

  const {
    data: repairReport,
    isLoading: repairReportLoading,
    error: repairReportError,
    refetch,
  } = useGetRepairReportByIDQuery(repairID, {
    skip: !repairID, // skip until userID is available
  });
  console.log("repairReport", repairReport);

  const reportExists = Array.isArray(repairReport) && repairReport.length > 0;

  useEffect(() => {
    console.log("reportExists", reportExists);

    if (reportExists) {
      const report = repairReport[0];
      console.log(report); // Check the structure of the report

      setFormData({
        startTime: report.startTime ?? "",
        endTime: report.endTime ?? "",
        finishedDate: report.finishedDate ?? "",
        totalCost: report.totalCost ?? "",
        information: report.information ?? "",
        partsUsed: Array.isArray(report.partsUsed)
          ? report.partsUsed.join(", ")
          : "",
        repairID: report.repairID ?? "",
        images: report.images ?? [],
      });
    }
  }, [repairReport, reportExists]);

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    finishedDate: "",
    totalCost: "",
    information: "",
    partsUsed: "",
    repairID: repairID,
    images: [],
  });
  console.log("formdata", formData);


  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };
  // Handle adding new team member
  const handleAddMember = () => {
    if (newMember.trim() && !teamMembers.includes(newMember)) {
      setTeamMembers([...teamMembers, newMember]);
      setNewMember(""); // Reset input
    }
  };

  // Handle removing team member
  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }
    setImageError("");
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    // Combine teamMembers into a comma-separated string
    const {
      startTime,
      endTime,
      finishedDate,
      totalCost,
      information,
      partsUsed,
    } = formData;

    if (
      !startTime.trim() ||
      !endTime.trim() ||
      !finishedDate.trim() ||
      !totalCost.trim() ||
      !information.trim() ||
      !partsUsed.trim() ||
      teamMembers.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Please fill in all fields",
        text: "StartTime, EndTime, FinishedDate, TotalCost, Information, PartsUsed, Technicians and Images",
      });
      return;
    }

    const sendData = new FormData();
    sendData.append("startTime", startTime.trim());
    sendData.append("endTime", endTime.trim());
    sendData.append("finishedDate", finishedDate.trim());
    sendData.append("totalCost", totalCost.trim());
    sendData.append("information", information.trim());
    sendData.append("repairID", repairID);

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

    // Optional: Debug formData
    for (let pair of sendData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      await createRepairReport(sendData).unwrap();

      Swal.fire({
        icon: "success",
        title: "Repair Report added!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      // setShowModal(false);
      setFormData({
        startTime: "",
        endTime: "",
        finishedDate: "",
        totalCost: "",
        information: "",
        partsUsed: "",
        technicians: "",
        repairID: "",
        images: [],
      });
      setTeamMembers([]);
      setImages([]);

      // refetch();
    } catch (err) {
      console.error("Error in adding repair report:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to add repair report",
        text: err?.data?.message || "Something went wrong.",
      });
    }
    refetch();
  };

  const WorkOrder = [
    { value: "pending", label: "Pending" },
    { value: "In progress", label: "In progress" },
    { value: "completed", label: "Completed" },
  ];
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
            <input type="text" value={order.repairInfo.assetName} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Date:</label>
            <input type="text" value={order.reportingDate || "N/A"} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Area:</label>
            <input
              type="text"
              value={order.repairInfo.area || "N/A"}
              readOnly
            />
          </div>

          <div className="TModal-content-field">
            <label>Description:</label>
            <textarea
              value={order.repairInfo.description || "No description"}
              readOnly
            />
          </div>

          {/* Display Multiple Asset Images */}
          <div className="TModal-content-field">
            <label>Asset Images:</label>
            <div className="TModal-profile-img">
              {Array.isArray(order.repairInfo.images) &&
              order.repairInfo.images.length > 0 ? (
                order.repairInfo.images.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Work Order ${index + 1}`}
                    className="TModal-modal-image"
                  />
                ))
              ) : order.repairInfo.images ? (
                // If `imageUrl` is a string, display it as a single image
                <img
                  src={order.repairInfo.images}
                  alt="Work Order"
                  className="TModal-modal-image"
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Work Status:</label>
            <Select
              classNamePrefix="customm-select-workstatus"
              className="Wworkstatus-dropdown"
              options={WorkOrder}
              value={WorkOrder.find(
                (option) => option.value === selectedWorkStatus
              )}
              onChange={async (selectedOption) => {
                const newStatus = selectedOption ? selectedOption.value : "";
                setSelectedWorkStatus(newStatus);
                console.log("🟡 Selected Status:", newStatus); // ✅ Log selected value
                console.log("🛠 Repair ID:", order.repairID);

                // ⚡ Update status inside repairInfo
                try {
                  const response = await updateRepairById({
                    repairID: order.repairID, // use correct repairID from `order`
                    updateFields: { status: newStatus }, // this updates repairInfo.status
                  }).unwrap();

                  console.log("✅ Status updated in repairInfo:", response);

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
            />
          </div>
          <div className="TModal-content-field">
            <label>Time:</label>
            <div className="TModal-time-inputs">
              <input
                className="TModal-WorkOTime"
                type="time"
                value={
                  reportExists && repairReport?.startTime
                    ? repairReport.startTime
                    : formData.startTime
                }
                onChange={(e) => handleInputChange(e, "startTime")}
                readOnly={reportExists}
              />
              <input
                className="TModal-WorkOTime"
                type="time"
                // value={formData.endTime}
                value={
                  reportExists && repairReport?.endTime
                    ? repairReport.endTime
                    : formData.endTime
                }
                onChange={(e) => handleInputChange(e, "endTime")}
                readOnly={reportExists}
              />
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Finished Date:</label>
            <input
              type="date"
              // value={formData.finishedDate}
              value={
                reportExists && repairReport?.finishedDate
                  ? repairReport.finishedDate
                  : formData.finishedDate
              }
              min={today}
              onChange={(e) => handleInputChange(e, "finishedDate")}
              readOnly={reportExists}
            />
          </div>

          <div className="TModal-content-field">
            <label>Total Cost:</label>
            <input
              type="text"
              // value={formData.totalCost}
              value={
                reportExists && repairReport?.totalCost
                  ? repairReport.totalCost
                  : formData.totalCost
              }
              onChange={(e) => handleInputChange(e, "totalCost")}
              placeholder="Enter Total Cost"
              readOnly={reportExists}
            />
          </div>

          <div className="TModal-content-field">
            <label>Parts Used:</label>
            <input
              type="text"
              value={
                reportExists && repairReport?.[0]?.partsUsed
                  ? repairReport[0].partsUsed
                  : formData.partsUsed
              }
              onChange={(e) =>
                setFormData({ ...formData, partsUsed: e.target.value })
              }
              placeholder="Enter parts used (e.g., wood, metal, screws)"
              readOnly={reportExists}
            />
          </div>

          {reportExists && repairReport[0]?.images ? (
            <div className="TModal-content-field">
              <label>Repaired Images:</label>

              <div className="TModal-profile-img">
                {repairReport[0].images.map((imgSrc, index) => (
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

          {reportExists && repairReport[0]?.technicians ? (
            <div className="TModal-content-field">
              <label>Team Members:</label>

              <div className="TModal-outer-team">
                <div className="TModal-team-list">
                  {repairReport[0].technicians
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
                      placeholder="Enter email"
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
              // value={formData.information}
              value={
                reportExists && repairReport?.information
                  ? repairReport.information
                  : formData.information
              }
              onChange={(e) => handleInputChange(e, "information")}
              placeholder="Enter any additional information"
              readOnly={reportExists}
            ></textarea>
          </div>

          {!reportExists && (
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

const TechnicianHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");

  const selectUserInfo = (state) => state.auth.userInfo || {};
  const getUserEmail = createSelector(
    selectUserInfo,
    (userInfo) => userInfo?.user?.username || ""
  );
  const [data, setData] = useState([]);
  const email = useSelector(getUserEmail);
  const { data: technicianSchedules } =
    useGetSchedulesByTechnicianEmailQuery(email);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (technicianSchedules && technicianSchedules.length) {
        const repairPromises = technicianSchedules.map(async (schedule) => {
          try {
            const repair = await dispatch(
              maintenanceApiSlice.endpoints.getRepairById.initiate(
                schedule?.repairID, {
                  forceRefetch:true,
                }
              )
            ).unwrap();

            return {
              ...schedule,
              repairInfo: repair, // attach the repair detail here
            };
          } catch (err) {
            console.error(
              `❌ Error fetching repair for ID ${schedule?.repairID}:`,
              err
            );
            return null; // return null to filter out later
          }
        });

        const results = await Promise.all(repairPromises);
        const validMergedData = results.filter(Boolean); // filter out failed ones
        setData(validMergedData); // ⬅️ final combined array
      }
    };

    fetchRepairDetails();
  }, [technicianSchedules, dispatch]);

  console.log("Dataaa", data);

  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(
        data
          .map((item) => item.repairInfo.priority?.toLowerCase())
          .filter(Boolean)
      )
    ).map((priority) => ({
      value: priority,
      label: priority
        ? priority.charAt(0).toUpperCase() + priority.slice(1)
        : "",
    })),
  ];

  // Filtering data based on search and priority selection and work status
  // Helper function to recursively search through nested objects
  const searchRecursively = (obj, searchTerm) => {
    if (typeof obj !== "object" || obj === null) {
      return (
        obj &&
        obj
          .toString()
          .toLowerCase()
          .includes(searchTerm?.toLowerCase() || "")
      );
    }

    // Check all values in the object (including nested objects)
    return Object.values(obj).some((value) =>
      searchRecursively(value, searchTerm)
    );
  };

  const filteredData =
    data && data.length
      ? data.filter((item) => {
          // Match search term with any field at any level in the object
          const matchesSearch = searchRecursively(item, searchTerm);

          const matchesPriority =
            selectedPriority === "" ||
            item.repairInfo.priority?.toLowerCase() ===
              selectedPriority.toLowerCase();

          const matchesWorkStatus =
            selectedWorkStatus === "" ||
            item.repairInfo.status?.toLowerCase() ===
              selectedWorkStatus.toLowerCase();

          return matchesSearch && matchesPriority && matchesWorkStatus;
        })
      : [];

  return (
    <div className="work-orders-container">
      <div className="WorkOrder-filter-section">
        <Select
          classNamePrefix="custom-select"
          className="priority-dropdown"
          options={uniquePriorities}
          value={uniquePriorities.find(
            (option) => option.value === selectedPriority
          )} // Ensure selected value is an object
          onChange={(selectedOption) => {
            if (selectedOption) {
              setSelectedPriority(selectedOption.value);
            } else {
              setSelectedPriority(""); // Clear the selected priority when null
            }
          }}
          isClearable
          isSearchable={false}
        />
      </div>

      <div className="work-orders-grid">
        {filteredData.map((order) => (
          <WorkOrderCard
            key={order.scheduleID}
            {...order}
            onView={() => setSelectedOrder(order)}
          />
        ))}
      </div>

      {selectedOrder && (
        <WorkOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          data={data}
        />
      )}
    </div>
  );
};

export default TechnicianHome;
