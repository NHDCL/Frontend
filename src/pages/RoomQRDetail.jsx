import React, { useEffect, useState } from "react";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import "./css/QRDetail.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select";
import { useGetAcademyByIdQuery } from "../slices/userApiSlice";
import { useGetAssetByAssetCodeQuery } from "../slices/assetApiSlice";
import { usePostRepairRequestMutation } from "../slices/maintenanceApiSlice";
import Swal from "sweetalert2";
import { useParams, useLocation } from "react-router-dom";

const priorities = [
  { value: "Immediate", label: "Immediate (Within 24 hours)" },
  { value: "High", label: "High (Within 1-2 days)" },
  { value: "Moderate", label: "Moderate (Within 1 week)" },
  { value: "Low", label: "Low (More than a week)" },
];

const RoomQRDetail = () => {
  const { assetCode } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const floor = queryParams.get("floor"); // Get the 'floor' parameter
  const room = queryParams.get("room");
  const {
    data: asset,
    isLoading,
    error,
  } = useGetAssetByAssetCodeQuery(assetCode);
  const [postRepairRequest, { isLoading: requesting }] =
    usePostRepairRequestMutation();
  const [formData, setFormData] = useState({
    assetName: "",
    name: "",
    phoneNumber: "",
    email: "",
    priority: "",
    assetCode: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.assetName.trim())
      newErrors.assetName = "Name of the asset is required.";
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.priority) newErrors.priority = "Please select a priority.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading room details...",
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

    const { assetName, name, phoneNumber, email, priority, description } =
      formData;

    const requestData = new FormData();
    requestData.append("name", name.trim());
    requestData.append("phoneNumber", phoneNumber.trim());
    requestData.append("email", email.trim());
    requestData.append("priority", priority.trim());
    requestData.append("status", "Pending");
    requestData.append(
      "area",
      `${asset?.title || ""} - ${floor || ""} - ${room || ""}`
    );
    requestData.append("description", description.trim());
    requestData.append("assetName", assetName.trim()); // Ensure assetName is not undefined
    requestData.append("scheduled", "false");

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
      console.log(requestData);
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
        assetName: "",
        name: "",
        phoneNumber: "",
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
            <h3 className="section-title">Room Information</h3>
            <div className="asset_detail">
              <div className="pp">
                <p className="p1">Block:</p>
                <p className="p2">{asset?.title}</p>
              </div>
              <div className="pp">
                <p className="p1">Floor:</p>
                <p className="p2">{floor}</p>
              </div>
              <div className="pp">
                <p className="p1">Room:</p>
                <p className="p2">{room}</p>
              </div>
              <div className="pp">
                <p className="p1">Location:</p>
                <p className="p2">Gyalpozhig</p>
              </div>
            </div>
          </div>

          <h4 className="form-title">
            Report a room only if an asset is found damaged
          </h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              placeholder="Name of the asset"
            />
            {errors.assetName && (
              <div className="qr-error-text">{errors.assetName}</div>
            )}

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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
            />
            {errors.phoneNumber && (
              <div className="qr-error-text">{errors.phoneNumber}</div>
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
            {imageError && <div className="qr-error-text">{imageError}</div>}

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
                    type="button"
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

export default RoomQRDetail;
