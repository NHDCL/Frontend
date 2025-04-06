import React, { useState } from "react";
import WorkOrderCard from "./TWorkOrderCard";
import "./css/Thome.css";
import "./css/TModalOverlay.css";
import "./../managerPage/css/dropdown.css";
import Select from "react-select";
import { IoIosCloseCircle } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { RiImageAddLine } from "react-icons/ri";


const WorkOrderModal = ({ order, onClose, data = [] }) => {
  const [teamMembers, setTeamMembers] = useState(order.teamMembers || []);
  const [newMember, setNewMember] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState("");
  const [images, setImages] = useState([]); // Allow multiple images
  const [imageError, setImageError] = useState("");

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
  const uniqueWorkStatuses = [
    { value: "", label: "All Work status" },
    ...Array.from(new Set(data.map((item) => item.workstatus))).map(
      (status) => ({
        value: status,
        label: status,
      })
    ),
  ];
  console.log(uniqueWorkStatuses); // Log the array to verify

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
            <input type="text" value={order.title} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Time:</label>
            <div className="TModal-time-inputs">
              <input
                className="TModal-WorkOTime"
                type="text"
                value={order.time.start}
                readOnly
              />
              <input
                className="TModal-WorkOTime"
                type="text"
                value={order.time.end}
                readOnly
              />
            </div>
          </div>

          <div className="TModal-content-field">
            <label>Date:</label>
            <input type="text" value={order.dueDate} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Area:</label>
            <input type="text" value={order.location} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Parts Used:</label>
            <input type="text" value={order.partsUsed.join(", ")} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Description:</label>
            <textarea value={order.description} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Total Cost:</label>
            <input type="text" value={`$${order.totalCost}`} readOnly />
          </div>

          <div className="TModal-content-field">
            <label>Asset Images:</label>
            <div className="TModal-profile-img">
              {Array.isArray(order.imageUrl) && order.imageUrl.length > 0 ? (
                order.imageUrl.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`Work Order ${index + 1}`}
                    className="TModal-modal-image"
                  />
                ))
              ) : order.imageUrl ? (
                // If `imageUrl` is a string, display it as a single image
                <img
                  src={order.imageUrl}
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
            {/* Work Status Dropdown */}
            <Select
              classNamePrefix="customm-select-workstatus"
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
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [data] = useState([
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",    
      location: "Block-k-203",
      priority: "Immediate",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl: [
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      ],
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Minor",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Major",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
    {
      id: 1,
      title: "Chair Repair",
      dueDate: "Apr 23, 2025",
      location: "Block-k-203",
      priority: "Minor",
      time: { start: "07:00 AM", end: "09:00 AM" },
      partsUsed: ["Milwaukee", "Ingersoll Rand", "Ryobi"],
      description: "The chair leg is broken and needs replacement.",
      totalCost: 400,
      imageUrl:
        "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
      status: "Pending",
      teamMembers: ["12210010.gcit@rub.edu.bt", "12210011.gcit@rub.edu.bt"],
      additionalInfo: "",
    },
  ]);

  const uniquePriorities = [
    { value: null, label: "All Priorities" },
    ...Array.from(new Set(data.map((item) => item.priority))).map(
      (priority) => ({
        value: priority,
        label: priority,
      })
    ),
  ];

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item)
      .map((value) => value.toString().toLowerCase())
      .some((text) => text.includes(searchTerm.toLowerCase()));

    const matchesPriority =
      !selectedPriority || item.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="work-orders-container">
      <div className="WorkOrder-filter-section">
        <Select
          classNamePrefix="custom-select"
          className="priority-dropdown"
          options={uniquePriorities}
          value={uniquePriorities.find(
            (option) => option.value === selectedPriority
          )}
          onChange={(selectedOption) =>
            setSelectedPriority(selectedOption ? selectedOption.value : null)
          }
          isClearable
          isSearchable={false}
        />
      </div>

      <div className="work-orders-grid">
        {filteredData.map((order) => (
          <WorkOrderCard
            key={order.id}
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
