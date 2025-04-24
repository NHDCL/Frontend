import React, { useState, useEffect } from "react";
import WorkOrderCard from "./TWorkOrderCard";
import "./css/Thome.css";
import "./css/TModalOverlay.css";
import "./css/dropdownTechnician.css";
import "../managerPage/css/dropdown.css";
import Select from "react-select";
import { MdWorkHistory } from "react-icons/md";
import { IoIosCloseCircle, IoMdCloseCircle } from "react-icons/io";
import { RiImageAddLine } from "react-icons/ri";

import { useGetSchedulesByUserIDQuery, useGetRepairByIdQuery, useUpdateRepairByIdMutation, useGetSchedulesByTechnicianEmailQuery, useCreateRepairReportMutation } from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { maintenanceApiSlice } from "../../slices/maintenanceApiSlice"

import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

const WorkOrderModal = ({ order, onClose, data = [] }) => {

  const [teamMembers, setTeamMembers] = useState(order.teamMembers || []);
  const [newMember, setNewMember] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState(order.repairInfo.status || "");
  const [images, setImages] = useState([]); // Allow multiple images
  const [imageError, setImageError] = useState("");

  const [updateRepairById, { isLoading, error }] = useUpdateRepairByIdMutation();

  const [createRepairReport] = useCreateRepairReportMutation();
  const [formState, setFormState] = useState({
    startTime: '',
    endTime: '',
    finishedDate: '',
    totalCost: 0,
    information: '',
    partsUsed: '',
    technicians: '',
    repairID: '',
    images: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (key === 'images') {
        value.forEach(file => formData.append('images', file));
      } else {
        formData.append(key, value);
      }
    });

    try {
      await createRepairReport(formData).unwrap();
      alert('Report created successfully!');
    } catch (err) {
      console.error('Failed to create report:', err);
    }
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }
    setImageError("");
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const WorkOrder = [
    { value: "pending", label: "Pending" },
    { value: "In progress", label: "In progress" },
    { value: "completed", label: "Completed" }

  ];

  return (
    <div className="TModal-modal-overlay">
      <div className="TModal-modal-content">
        <div className="TModal-modal-header">
          <h2 className="TModal-form-h">Work Order Details</h2>
          <button className="TModal-close-btn" onClick={onClose}>
            <IoIosCloseCircle style={{ color: "#897463", width: "20px", height: "20px" }} />
          </button>
        </div>

        <form className="TModal-repair-form" onSubmit={handleSubmit}>
          <div className="TModal-content-field">
            <label>Asset Name:</label>
            <input type="text" value={order.repairInfo.assetName} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Time:</label>
            <div className="TModal-time-inputs">
              <input className="TModal-WorkOTime" type="text" value={order.startTime || "N/A"} readOnly />
              <input className="TModal-WorkOTime" type="text" value={order.startTime || "N/A"} readOnly />
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Date:</label>
            <input type="text" value={order.reportingDate || "N/A"} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Area:</label>
            <input type="text" value={order.repairInfo.area || "N/A"} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Description:</label>
            <textarea value={order.repairInfo.description || "No description"} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Total Cost:</label>
            <input type="text" value={`$${order.totalCost || 0}`} readOnly />
          </div>

          {/* Display Multiple Asset Images */}
          <div className="TModal-content-field">
            <label>Asset Images:</label>
            <div className="TModal-profile-img">
              {Array.isArray(order.repairInfo.images) && order.repairInfo.images.length > 0 ? (
                order.repairInfo.images.map((imgSrc, index) => (
                  <img key={index} src={imgSrc} alt={`Work Order ${index + 1}`} className="TModal-modal-image" />
                ))
              ) : order.repairInfo.images ? (
                // If `imageUrl` is a string, display it as a single image
                <img src={order.repairInfo.images} alt="Work Order" className="TModal-modal-image" />
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
              value={WorkOrder.find((option) => option.value === selectedWorkStatus)}
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
            <label>Parts Used:</label>
            <input type="text" value={formState.partsUsed}
              onChange={(e) =>
                setFormState({ ...formState, partsUsed: e.target.value })
              }
            />
          </div>

          <div className="TModal-content-field">
            <label>Repaired Images:</label>
            <div className="TModal-profile-img">
              <input type="file" accept="image/*" multiple id="imageUpload" onChange={handleImageUpload} style={{ display: "none" }} />
              {imageError && <p className="error-text">{imageError}</p>}
              <div className="TModel-multiupload">
                {images.map((imgSrc, index) => (
                  <div key={index} className="mr-image-wrapper">
                    <img src={imgSrc} alt={`Uploaded Preview ${index}`} className="mr-upload-preview" />
                    <button type="button" className="mr-remove-btn" onClick={() => removeImage(index)}>×</button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div className="mr-upload-box" onClick={() => document.getElementById("imageUpload").click()}>
                    <RiImageAddLine className="mr-upload-icon" />
                    <p className="mr-pimg">Upload Images</p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
              {/* Render only if team members exist */}
              {teamMembers.length > 0 && (
                <div className="TModal-team-list">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="TModal-team-member">
                      {member}{" "}
                      <IoMdCloseCircle onClick={() => handleRemoveMember(index)} style={{ color: "black" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Additional Information:</label>
            <textarea placeholder="Enter any additional information"></textarea>
          </div>

          <div className="TModal-modal-buttons">
            <button type="submit" className="TModal-accept-btn">Done</button>
          </div>
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
  const { data: technicianSchedules } = useGetSchedulesByTechnicianEmailQuery(email);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (technicianSchedules && technicianSchedules.length) {
        const repairPromises = technicianSchedules.map(async (schedule) => {
          try {
            const repair = await dispatch(
              maintenanceApiSlice.endpoints.getRepairById.initiate(schedule?.repairID)
            ).unwrap();

            return {
              ...schedule,
              repairInfo: repair, // attach the repair detail here
            };
          } catch (err) {
            console.error(`❌ Error fetching repair for ID ${schedule?.repairID}:`, err);
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

  console.log("Dataaa", data)

  const uniquePriorities = [
    { value: "", label: "All Priorities" },
    ...Array.from(
      new Set(data.map((item) => item.repairInfo.priority?.toLowerCase()).filter(Boolean))
    ).map((priority) => ({
      value: priority,
      label: priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : ""

    })),
  ];

  // Filtering data based on search and priority selection and work status
  // Helper function to recursively search through nested objects
  const searchRecursively = (obj, searchTerm) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj && obj.toString().toLowerCase().includes(searchTerm?.toLowerCase() || '');
    }

    // Check all values in the object (including nested objects)
    return Object.values(obj).some((value) => searchRecursively(value, searchTerm));
  };

  const filteredData = (data && data.length) ? data.filter((item) => {
    // Match search term with any field at any level in the object
    const matchesSearch = searchRecursively(item, searchTerm);

    const matchesPriority =
      selectedPriority === "" ||
      item.repairInfo.priority?.toLowerCase() === selectedPriority.toLowerCase();

    const matchesWorkStatus =
      selectedWorkStatus === "" ||
      item.repairInfo.status?.toLowerCase() === selectedWorkStatus.toLowerCase();

    return matchesSearch && matchesPriority && matchesWorkStatus;
  }) : [];

  return (
    <div className="work-orders-container">
      <div className="WorkOrder-UpperDiv">
        <p className="WorkOrder-Greeting">Good morning, Tenzin</p>
        <h2 className="WorkOrder-header">Today's Work</h2>
        <MdWorkHistory className="WorkOrder-icon" />
        <button className="WorkOrder-button">View my work</button>
      </div>

      <div className="WorkOrder-filter-section">
        <p className="WorkOrder-label">Recent Work Orders</p>

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
