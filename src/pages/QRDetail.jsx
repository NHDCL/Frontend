import React, { useState, useEffect } from "react";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import "./css/QRDetail.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select"; // Make sure to install this with: npm install react-select
import { useParams } from "react-router-dom";
import {
  useGetAssetByAssetCodeQuery,
} from "../slices/assetApiSlice";
import { useGetAcademyByIdQuery } from "../slices/userApiSlice";
import { usePostRepairRequestMutation } from "../slices/maintenanceApiSlice";
import Swal from "sweetalert2";
const priorities = [
  { value: "Immediate", label: "Immediate (Within 24 hours)" },
  { value: "High", label: "High (Within 1-2 days)" },
  { value: "Moderate", label: "Moderate (Within 1 week)" },
  { value: "Low", label: "Low (More than a week)" },
];

const QRDetail = () => {
  const { assetCode } = useParams();
  const {
    data: asset,
    isLoading
  } = useGetAssetByAssetCodeQuery(assetCode);
  const { data: academy } = useGetAcademyByIdQuery(asset?.academyID, {
    skip: !asset?.academyID, // Skip this query until asset is loaded and academyID is available
  });
  const [postRepairRequest, { isLoading: requesting }] =
    usePostRepairRequestMutation();
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    priority: "",
    description: "",
    email: "",
  });

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading asset details...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }
    setImageError("");
    setImages((prevImages) => [...prevImages, ...files]); // Store the files themselves, not URLs
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePriorityChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, priority: selectedOption?.value || "" }));
  };

  const validateName = (name) => {
    if (!name.trim()) return "Name is required.";
    return "";
  };

  const validateDescription = (description) => {
    if (!description.trim()) return "Description is required.";
    return "";
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(17|77)\d{6}$/;
    if (!phone.trim()) return "Phone number is required.";
    if (!phoneRegex.test(phone))
      return "Phone must start with 17 or 77 and be 8 digits.";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required.";
    if (!emailRegex.test(email)) return "Enter a valid email address.";
    return "";
  };

  const isFormComplete = () => {
    // Check if any required field is empty
    return (
      formData.name.trim() !== "" &&
      validatePhoneNumber(formData.phone) === "" &&
      validateEmail(formData.email) === "" &&
      formData.priority !== "" &&
      formData.description.trim() !== ""
    );
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
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // Validate in real-time as user types - FIX THE ERROR KEYS HERE
      if (name === "phone") {
        setErrors({ ...errors, phone: validatePhoneNumber(value) }); // Changed from phoneNumber to phone
      } else if (name === "email") {
        setErrors({ ...errors, email: validateEmail(value) });
      } else if (name === "name") {
        setErrors({ ...errors, name: validateName(value) });
      } else if (name === "description") {
        setErrors({ ...errors, description: validateDescription(value) });
      }
    }
  };

  // 2. Fix the validateForm function to match the field names
  const validateForm = () => {
    let newErrors = {};

    newErrors.name = validateName(formData.name);
    newErrors.phone = validatePhoneNumber(formData.phone); // Changed from phoneNumber to phone
    newErrors.email = validateEmail(formData.email);
    newErrors.priority = formData.priority ? "" : "Please select a priority.";
    newErrors.description = validateDescription(formData.description);

    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const { name, phone, email, priority, description } = formData;

    const requestData = new FormData();
    requestData.append("name", name.trim());
    requestData.append("phoneNumber", phone.trim());
    requestData.append("email", email.trim());
    requestData.append("priority", priority.trim());
    requestData.append("status", "Pending");
    requestData.append("area", asset?.assetArea || ""); // Use fallback value if assetArea is missing
    requestData.append("description", description.trim());
    requestData.append("assetName", asset?.title || ""); // Ensure assetName is not undefined
    requestData.append("scheduled", "false");
    requestData.append("assetCode", asset?.assetCode || "");

    images.forEach((imageFile) => {
      requestData.append("images", imageFile); // imageFile is the actual file
    });

    requestData.append("academyId", asset?.academyID || "");

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to send this repair request?",
      icon: "warning",
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
        phone: "",
        email: "",
        priority: null,
        description: "",
      });
      setErrors({});
      setImages([]);
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
    <div>
      <Header />
      <div className="qrcontainer">
        <div className="card report-form">
          <div className="asset-info">
            <h3 className="section-title" style={{ textAlign: "start" }}>
              Asset Information
            </h3>
            {/* {isLoading ? (
              <p>Loading asset...</p>
            ) : error ? (
              <p>
                Error loading asset:{" "}
                {error?.data?.message || error?.error || "Unknown error"}
              </p>
            ) : ( */}
            <div className="asset_detail">
              <div className="pp">
                <p className="p1">Asset Name:</p>
                <p className="p2">{asset?.title}</p>
              </div>
              <div className="pp">
                <p className="p1">Asset Code:</p>
                <p className="p2">{asset?.assetCode}</p>
              </div>
              <div className="pp">
                <p className="p1">Area:</p>
                <p className="p2">{asset?.assetArea}</p>
              </div>
              <div className="pp">
                <p className="p1">Location:</p>
                <p className="p2">{academy?.name || "Not specified"}</p>
              </div>
              <div className="pp">
                <p className="p1">Category:</p>
                <p className="p2">{asset?.categoryDetails?.name}</p>
              </div>
            </div>
            {/* )} */}
          </div>

          <h4 className="form-title">
            Report an asset only if an asset is found damaged
          </h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
            />
            {errors.name && <div className="qr-error-text">{errors.name}</div>}

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
            {errors.phone && (
              <div className="qr-error-text">{errors.phone}</div>
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
            />
            {errors.email && (
              <div className="qr-error-text">{errors.email}</div>
            )}

            <Select
              classNamePrefix="customm-select-department"
              name="priority"
              options={priorities}
              value={formData.priority ? priorities.find(p => p.value === formData.priority) : null}
              onChange={handlePriorityChange}
              placeholder="Select Priority"
              isClearable
            />
            {errors.priority && (
              <div className="qr-error-text">{errors.priority}</div>
            )}

            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
            />
            {errors.description && (
              <div className="qr-error-text">{errors.description}</div>
            )}

            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            {imageError && <div className="qr-qr-error-text">{imageError}</div>}

            <div className="mr-upload-box-img">
              {imageError && <p className="error-text">{imageError}</p>}
              {images.map((imgFile, index) => (
                <div key={index} className="mr-image-wrapper">
                  <img
                    src={URL.createObjectURL(imgFile)}
                    alt={`Preview ${index}`}
                    className="mr-upload-preview"
                  />
                  <div
                    className="mr-remove-btn"
                    onClick={() => removeImage(index)}
                    style={{ alignSelf: "center" }}
                  >
                    ×
                  </div>
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

            <button className="button" type="submit" disabled={requesting}>
              {requesting ? "Sending..." : "Report"}
            </button>
          </form>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default QRDetail;
