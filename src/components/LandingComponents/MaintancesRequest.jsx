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
  console.log("formdata",formData)

  const [postRepairRequest, { isLoading: requesting }] = usePostRepairRequestMutation();
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

  // console.log("dt", formData);

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
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.assetName.trim())
      newErrors.assetName = "Asset name is required.";
    if (!formData.academy) newErrors.academy = "Please select an academy.";
    if (!formData.area) newErrors.area = "Please select an area.";
    if (!formData.priority) newErrors.priority = "Please select a priority.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      showCancelButton: true,
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
        academyId:"",

      });
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

            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleInputChange}
              className="mr-input"
              placeholder="Enter asset name"
            />
            {errors.assetName && (
              <p className="error-text">{errors.assetName}</p>
            )}

            <Select
              classNamePrefix="customm-select-department"
              name="academy"
              onChange={(selectedOption) =>
                setFormData({
                  ...formData,
                  academy: selectedOption ? selectedOption.value : "",
                  academyId: selectedOption ? selectedOption.value : "",
                  area: "",
                })
              }
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
              isSearchable={false}
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

            <button disabled={requesting}
style={{backgroundColor:"#897463"}} type="submit" className="mr-submit-btn">
              {requesting ? "Requesting..." : "Request"}{" "}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequest;
