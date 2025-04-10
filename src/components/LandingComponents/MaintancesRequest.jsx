import React, { useState } from "react";
import "./../../pages/css/MaintenanceRequest.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select";

const academies = [
  "Pemathang",
  "Khotokha",
  "Jamtsholing",
  "Taraythang",
  "Gyalpozhing",
];
const areaOptions = {
  Pemathang: ["Block A", "Ground", "Footpath", "Room1"],
  Khotokha: ["Library", "Canteen", "Lab"],
  Jamtsholing: ["Main Hall", "Office", "Hostel"],
  Taraythang: ["Parking", "Garden", "Playground"],
  Gyalpozhing: ["Block B", "Corridor", "Stairs"],
};
const priorities = ["Immediate(Within 24 hours)", "High(Within 1-2 days)", "Moderate(Within 1 week)", "Low(More than a week)"];

const MaintenanceRequest = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    asset: "",
    academy: "",
    area: "",
    priority: "",
    description: "",
  });

  const [images, setImages] = useState([]); // Change to array for multiple images
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  const handleInputChange = (e, field) => {
    if (field) {
      setFormData({ ...formData, [field]: e.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
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

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index)); // Remove image by index
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.asset.trim()) newErrors.asset = "Asset name is required.";
    if (!formData.academy) newErrors.academy = "Please select an academy.";
    if (!formData.area) newErrors.area = "Please select an area.";
    if (!formData.priority) newErrors.priority = "Please select a priority.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Form submitted successfully! 🎉");
    }
  };

  return (
    <div className="mr-container">
      <div className="mrtitlediv">
        <h1 className="mr_title">Maintenance Request</h1>
        <hr className="mr_hr1" />
        <hr className="mr_hr2" />
        <hr className="mr_hr3" />
      </div>

      <div className="mr_formouter">
        <div className="mr_img">
          <h1 className="mr_p">
            Please complete the maintenance request form to report any issues
            with the facility.
          </h1>
        </div>

        <div className="mr_form">
          <form className="mr-custom-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter your name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}

            <input
              type="text"
              name="asset"
              value={formData.asset}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter asset name"
            />
            {errors.asset && <p className="error-text">{errors.asset}</p>}

            <Select
              classNamePrefix="customm-select-department"
              name="academy"
              value={
                formData.academy
                  ? { value: formData.academy, label: formData.academy }
                  : null
              }
              onChange={(selectedOption) =>
                handleInputChange(selectedOption, "academy")
              }
              options={academies.map((academy) => ({
                value: academy,
                label: academy,
              }))}
              isClearable
              isSearchable={false}
              placeholder="Select Academy"
            />
            {errors.academy && <p className="error-text">{errors.academy}</p>}

            {/* Area Selection (Filtered by Selected Academy) */}
            <Select
              classNamePrefix="customm-select-department"
              name="area"
              value={
                formData.area
                  ? { value: formData.area, label: formData.area }
                  : null
              }
              onChange={(selectedOption) =>
                handleInputChange(selectedOption, "area")
              }
              options={
                formData.academy
                  ? areaOptions[formData.academy].map((area) => ({
                      value: area,
                      label: area,
                    }))
                  : []
              }
              isClearable
              isSearchable={false}
              placeholder="Select Area"
              isDisabled={!formData.academy} // Disable if no academy is selected
            />
            {errors.area && <p className="error-text">{errors.area}</p>}

            <Select
              classNamePrefix="customm-select-department"
              name="priority"
              value={
                priorities.find((priority) => priority === formData.priority)
                  ? { value: formData.priority, label: formData.priority }
                  : null
              }
              onChange={(selectedOption) =>
                handleInputChange(selectedOption, "priority")
              }
              options={priorities.map((priority) => ({
                value: priority,
                label: priority,
              }))}
              isClearable
              isSearchable={false}
              placeholder="Select Priority"
            />
            {errors.priority && <p className="error-text">{errors.priority}</p>}

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter a brief description"
            />
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}

<input type="file" accept="image/*" id="imageUpload" multiple onChange={handleImageUpload} style={{ display: "none" }} />
            <div className="mr-upload-box-img">
              {imageError && <p className="error-text">{imageError}</p>}
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

            <button type="submit" className="mr-submit-btn">
              Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequest;
