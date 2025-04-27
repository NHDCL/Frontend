import React, { useState, useEffect } from "react";
import MaintenanceCard from "./TMaintenanceCard";
import "./css/Thome.css";
import "./css/TModalOverlay.css";
import "./../managerPage/css/dropdown.css";
import Select from "react-select";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { RiImageAddLine } from "react-icons/ri";

import { useGetMaintenanceByTechnicianEmailQuery, useCreateRepairReportMutation, useUpdatePreventiveMaintenanceMutation } from "../../slices/maintenanceApiSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { assetApiSlice } from "../../slices/assetApiSlice";
import {
  useGetUserByEmailQuery,
  useGetUsersQuery,
} from "../../slices/userApiSlice";
import { createSelector } from "reselect";
import Swal from "sweetalert2";

const WorkOrderModal = ({ order, onClose, data = [] }) => {
  const [teamMembers, setTeamMembers] = useState(order.teamMembers || []);
  const [newMember, setNewMember] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState(order.status || "");
  const [images, setImages] = useState([]); // Allow multiple images
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(true);


  const [updateMaintenanceById, { isLoading, error }] = useUpdatePreventiveMaintenanceMutation();

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
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Extract unique work statuses from data
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
            <IoIosCloseCircle
              style={{ color: "#897463", width: "20px", height: "20px" }}
            />
          </button>
        </div>
        <form className="TModal-repair-form">
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
            <label>Parts Used:</label>
            <input type="text" />
          </div>

          <div className="TModal-content-field">
            <label>Total Cost:</label>
            <input type="text" value={`$${order.totalCost}`} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Work Status:</label>
            {/* Work Status Dropdown */}
            <Select
              classNamePrefix="customm-select-workstatus"
              className="Wworkstatus-dropdown"
              options={WorkOrder}
              value={WorkOrder.find((option) => option.value === selectedWorkStatus)}
              onChange={async (selectedOption) => {
                const newStatus = selectedOption ? selectedOption.value : "";
                setSelectedWorkStatus(newStatus);
                console.log("🟡 Selected Status:", newStatus); // ✅ Log selected value
                console.log("🛠 Repair ID:", order.maintenanceID);

                // ⚡ Update status inside repairInfo
                try {
                  const response = await updateMaintenanceById({
                    id: order.maintenanceID, // use correct repairID from `order`
                    maintenance: { status: newStatus }, // this updates repairInfo.status
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
            <label>Repaired Images:</label>
            <div className="TModal-profile-img">
              <input
                type="file"
                accept="image/*"
                multiple
                id="imageUpload"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              {imageError && <p className="error-text">{imageError}</p>}
              <div className="TModel-multiupload">
                {images.map((imgSrc, index) => (
                  <div key={index} className="mr-image-wrapper">
                    <img
                      src={imgSrc}
                      alt={`Uploaded Preview ${index}`}
                      className="mr-upload-preview"
                    />
                    <button
                      type="button"
                      className="mr-remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div
                    className="mr-upload-box"
                    onClick={() =>
                      document.getElementById("imageUpload").click()
                    }
                  >
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
              {teamMembers.length > 0 && (
                <div className="TModal-team-list">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="TModal-team-member">
                      {member}{" "}
                      <IoMdCloseCircle
                        onClick={() => handleRemoveMember(index)}
                        style={{ color: "black" }}
                      />
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
            <button type="submit" className="TModal-accept-btn">
              Done
            </button>
          </div>
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
    (userInfo) => userInfo?.user?.username || ""
  );
  const [data, setData] = useState([]);

  const email = useSelector(getUserEmail);
  const { data: technicianSchedules } = useGetMaintenanceByTechnicianEmailQuery(email);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
  
    const fetchRepairDetails = async () => {
      if (technicianSchedules?.length) {
        const assetPromises = technicianSchedules.map(async (schedule) => {
          try {
            const Asset = await dispatch(
              assetApiSlice.endpoints.getAssetByAssetCode.initiate(schedule.assetCode, {
                forceRefetch: true,
              })
            ).unwrap();
  
            return {
              ...schedule,
              asset_Details: Asset,
            };
          } catch (err) {
            console.error(`❌ Error fetching repair for ID ${schedule?.assetCode}:`, err);
            return null;
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
  

  console.log("Dataaa", data)

  const uniqueWorkStatuses = [
    { value: null, label: "All Workstatus" },
    ...Array.from(new Set(data.map((item) => item.status))).map(
      (priority) => ({
        value: priority,
        label: priority,
      })
    ),
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
        />
      )}
    </div>
  );
};

export default TechnicianMSchedule;
