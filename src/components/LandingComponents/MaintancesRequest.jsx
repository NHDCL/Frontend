import React, { useState, useEffect } from "react";
import "./../../pages/css/MaintenanceRequest.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select";
import Swal from "sweetalert2";
import { usePostRepairRequestMutation } from "./../../slices/maintenanceApiSlice";
import { useGetAcademyQuery } from "./../../slices/userApiSlice";
import { useGetAssetQuery } from "./../../slices/assetApiSlice";

const priorities = [
  { value: "Immediate", label: "Immediate (Within 24 hours)" },
  { value: "High", label: "High (Within 1-2 days)" },
  { value: "Moderate", label: "Moderate (Within 1 week)" },
  { value: "Low", label: "Low (More than a week)" },
];

const MaintenanceRequest = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    priority: "",
    academy: "",
    area: "",
    description: "",
    assetName: "",
    scheduled: false,
    assetCode: "",
    images: [],
    status: "Pending",
    // academyId:"",
  });
  // console.log("formdata", formData);

  const [postRepairRequest, { isLoading: requesting }] =
    usePostRepairRequestMutation();
  const { data: academies = [], isLoading, error } = useGetAcademyQuery();
  const { data: assets = [], error1 } = useGetAssetQuery();

  const [areaList, setAreaList] = useState([]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to fetch academies.",
      });
    }
  }, [error]);

  useEffect(() => {
    if (error1) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to fetch asset.",
      });
    }
  }, [error1]);

  useEffect(() => {
    if (formData.academy && assets.length > 0) {
      const matchedAssets = assets.filter(
        (asset) => asset.academyID === formData.academy
      );

      const filteredAreas = matchedAssets
        .map((asset) => asset.assetArea)
        .filter((area, index, self) => area && self.indexOf(area) === index);

      setAreaList(filteredAreas);
    } else {
      setAreaList([]);
    }
  }, [formData.academy, assets]);

  // Field validation functions
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^(17|77)\d{6}$/;
    if (!phoneNumber.trim()) return "Phone number is required.";
    if (!phoneRegex.test(phoneNumber))
      return "Phone must start with 17 or 77 and be 8 digits.";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required.";
    if (!emailRegex.test(email)) return "Enter a valid email address.";
    return "";
  };

  const validateName = (name) => {
    if (!name.trim()) return "Name is required.";
    return "";
  };

  const validateAssetName = (assetName) => {
    if (!assetName.trim()) return "Asset name is required.";
    return "";
  };

  const validateDescription = (description) => {
    if (!description.trim()) return "Description is required.";
    return "";
  };

  const handleInputChange = (e, field) => {
    const { name, value } = e.target || {};

    if (field) {
      setFormData({ ...formData, [field]: e.value });

      // Validate field after selection
      if (field === "priority") {
        setErrors({
          ...errors,
          priority: e.value ? "" : "Please select a priority.",
        });
      } else if (field === "area") {
        setErrors({ ...errors, area: e.value ? "" : "Please select an area." });
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // Validate in real-time as user types
      if (name === "phoneNumber") {
        setErrors({ ...errors, phoneNumber: validatePhoneNumber(value) });
      } else if (name === "email") {
        setErrors({ ...errors, email: validateEmail(value) });
      } else if (name === "name") {
        setErrors({ ...errors, name: validateName(value) });
      } else if (name === "assetName") {
        setErrors({ ...errors, assetName: validateAssetName(value) });
      } else if (name === "description") {
        setErrors({ ...errors, description: validateDescription(value) });
      }
    }
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

  const validateForm = () => {
    let newErrors = {};

    newErrors.name = validateName(formData.name);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    newErrors.email = validateEmail(formData.email);
    newErrors.assetName = validateAssetName(formData.assetName);
    newErrors.academy = formData.academy ? "" : "Please select an academy.";
    newErrors.area = formData.area ? "" : "Please select an area.";
    newErrors.priority = formData.priority ? "" : "Please select a priority.";
    newErrors.description = validateDescription(formData.description);

    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // Handle academy selection
  const handleAcademyChange = (selectedOption) => {
    setFormData({
      ...formData,
      academy: selectedOption ? selectedOption.value : "",
      academyId: selectedOption ? selectedOption.value : "",
      area: "",
    });

    setErrors({
      ...errors,
      academy: selectedOption ? "" : "Please select an academy.",
    });
  };

  const isFormComplete = () => {
    // Check if any required field is empty
    return (
      formData.name.trim() !== "" &&
      validatePhoneNumber(formData.phoneNumber) === "" &&
      validateEmail(formData.email) === "" &&
      formData.assetName.trim() !== "" &&
      formData.academy !== "" &&
      formData.area !== "" &&
      formData.priority !== "" &&
      formData.description.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if form is empty without setting error messages
    if (!isFormComplete()) {
      // Show simple SweetAlert for empty form
      Swal.fire({
        icon: "warning",
        title: "Form Incomplete",
        text: "Please fill in all required fields to submit the request.",
        confirmButtonColor: "#305845",
      });
      return;
    }

    // Now validate with error messages for any remaining issues
    if (!validateForm()) return;

    const {
      name,
      phoneNumber,
      email,
      priority,
      status,
      area,
      description,
      assetName,
      academy,
    } = formData;

    const requestData = new FormData();
    requestData.append("name", name.trim());
    requestData.append("phoneNumber", phoneNumber.trim());
    requestData.append("email", email.trim());
    requestData.append("priority", priority.trim());
    requestData.append("status", status || "Pending");
    requestData.append("area", area);
    requestData.append("description", description.trim());
    requestData.append("assetName", assetName.trim());
    requestData.append("scheduled", "false");
    requestData.append("assetCode", ""); // null as empty string

    images.forEach((imageFile) => {
      requestData.append("images", imageFile);
    });
    requestData.append("academyId", academy.trim());

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to send this repair request?",
      icon: "question",
      color: "#305845",
      showCancelButton: true,
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
    });

    if (!result.isConfirmed) return;

    try {
      await postRepairRequest(requestData).unwrap();

      Swal.fire({
        icon: "success",
        title: "Repair Request Sent!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        priority: "",
        status: "Pending",
        academy: "",
        area: "",
        description: "",
        assetName: "",
        scheduled: false,
        assetCode: "",
        images: [],
        academyId: "",
      });
      setImages([]);
      setErrors({});
    } catch (err) {
      console.error("Error sending request", err);
      Swal.fire({
        icon: "error",
        title: "Failed to send Repair Request",
        text: err?.data?.message || "Something went wrong.",
      });
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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="error-text">{errors.phoneNumber}</p>
            )}

            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter your email"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}

            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter asset name"
              onBlur={() =>
                setErrors({
                  ...errors,
                  assetName: validateAssetName(formData.assetName),
                })
              }
            />
            {errors.assetName && (
              <p className="error-text">{errors.assetName}</p>
            )}

            <Select
              classNamePrefix="customm-select-department"
              name="academy"
              onChange={handleAcademyChange}
              options={academies.map((a) => ({
                value: a.academyId,
                label: a.name,
              }))}
              isLoading={isLoading}
              isClearable
              isSearchable={false}
              placeholder="Select Academy"
            />
            {errors.academy && <p className="error-text">{errors.academy}</p>}

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
              options={areaList.map((area) => ({
                value: area,
                label: area,
              }))}
              placeholder="Select Area"
              isClearable
              isSearchable={true}
            />
            {errors.area && <p className="error-text">{errors.area}</p>}

            <Select
              classNamePrefix="customm-select-department"
              name="priority"
              value={
                formData.priority
                  ? priorities.find((p) => p.value === formData.priority)
                  : null
              }
              onChange={(selectedOption) =>
                handleInputChange(selectedOption, "priority")
              }
              options={priorities}
              placeholder="Select Priority"
              isClearable
              isSearchable={false}
            />
            {errors.priority && <p className="error-text">{errors.priority}</p>}

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter a brief description"
              onBlur={() =>
                setErrors({
                  ...errors,
                  description: validateDescription(formData.description),
                })
              }
            />
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}

            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <div className="mr-upload-box-img">
              {imageError && <p className="error-text">{imageError}</p>}
              {images.map((imgFile, index) => (
                <div key={index} className="mr-image-wrapper">
                  <img
                    src={URL.createObjectURL(imgFile)}
                    alt={`Preview ${index}`}
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
                  onClick={() => document.getElementById("imageUpload").click()}
                >
                  <RiImageAddLine className="mr-upload-icon" />
                  <p className="mr-pimg">Upload Images</p>
                </div>
              )}
            </div>

            <button
              disabled={requesting}
              style={{ backgroundColor: "#897463" }}
              type="submit"
              className="mr-submit-btn"
            >
              {requesting ? "Requesting..." : "Request"}{" "}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequest;
