import React, { useState, useEffect } from "react";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import "./css/QRDetail.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select"; // Make sure to install this with: npm install react-select
import { useParams } from "react-router-dom";
import { useGetAssetByAssetCodeQuery } from "../slices/assetApiSlice";
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
    isLoading,
    error,
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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.priority) newErrors.priority = "Please select a priority.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, priority: selectedOption?.value || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    requestData.append("assetCode", asset?.assetCode || ""); // Handle assetCode as fallback too

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
      const res = await postRepairRequest(requestData).unwrap();
      console.log(res);
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
              onChange={handleChange}
              placeholder="Your Name"
            />
            {errors.name && <div className="qr-error-text">{errors.name}</div>}

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
            {errors.phone && (
              <div className="qr-error-text">{errors.phone}</div>
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
            />
            {errors.email && (
              <div className="qr-error-text">{errors.email}</div>
            )}

            <Select
              classNamePrefix="customm-select-department"
              name="priority"
              options={priorities}
              value={priorities.find((p) => p.value === formData.priority)}
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
              onChange={handleChange}
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
