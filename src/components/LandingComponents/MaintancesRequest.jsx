import React, { useState } from "react";
import "./../../pages/css/MaintenanceRequest.css";
import { RiImageAddLine } from "react-icons/ri";

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

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.asset.trim()) newErrors.asset = "Asset name is required.";
    if (!formData.academy) newErrors.academy = "Please select an academy.";
    if (!formData.area) newErrors.area = "Please select an area.";
    if (!formData.priority) newErrors.priority = "Please select a priority.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";

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
            Please complete the maintenance request form to report any issues with the facility.
          </h1>
        </div>

        <div className="mr_form">
          <form className="mr-custom-form" onSubmit={handleSubmit}>
            {/* Name Input */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              autoComplete="off"
              className="mr-input"
              placeholder="Enter your name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}

            {/* Phone Input */}
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              autoComplete="off"
              className="mr-input"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}

            {/* Asset Name Input */}
            <input
              type="text"
              name="asset"
              value={formData.asset}
              onChange={handleInputChange}
              autoComplete="off"
              className="mr-input"
              placeholder="Enter asset name"
            />
            {errors.asset && <p className="error-text">{errors.asset}</p>}

            {/* Academy Dropdown */}
            <select
              name="academy"
              value={formData.academy}
              onChange={handleInputChange}
              className="mr-input"
            >
              <option value="" disabled>Select Academy</option>
              <option value="Pemathang">Pemathang</option>
              <option value="Khotokha">Khotokha</option>
              <option value="Jamtsholing">Jamtsholing</option>
              <option value="Taraythang">Taraythang</option>
              <option value="Gyalpozhing">Gyalpozhing</option>
            </select>
            {errors.academy && <p className="error-text">{errors.academy}</p>}

            {/* Area Dropdown */}
            <select
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="mr-input"
            >
              <option value="" disabled>Select Area</option>
              <option value="Block A">Block A</option>
              <option value="Ground">Ground</option>
              <option value="Footpath">Footpath</option>
              <option value="Room1">Room1</option>
            </select>
            {errors.area && <p className="error-text">{errors.area}</p>}

            {/* Priority Dropdown */}
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="mr-input"
            >
              <option value="" disabled>Select Priority</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
            {errors.priority && <p className="error-text">{errors.priority}</p>}

            {/* Description Textarea */}
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter a brief description"
            />
            {errors.description && <p className="error-text">{errors.description}</p>}

            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <div className="mr-upload-box" onClick={() => document.getElementById("imageUpload").click()}>
              {image ? (
                <img src={image} alt="Uploaded Preview" className="mr-upload-preview" />
              ) : (
                <>
                  <RiImageAddLine className="mr-upload-icon" />
                  <p className=".mr-pimg">Upload Image</p>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="mr-submit-btn">Request</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequest;
