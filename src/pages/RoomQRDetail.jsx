import React, { useEffect, useState } from "react";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import "./css/QRDetail.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select";
import { useGetAcademyQuery } from "../slices/userApiSlice";
import { useGetAssetQuery } from "../slices/assetApiSlice";
import Swal from "sweetalert2";

const priorities = [
  { value: "Immediate", label: "Immediate (Within 24 hours)" },
  { value: "High", label: "High (Within 1-2 days)" },
  { value: "Moderate", label: "Moderate (Within 1 week)" },
  { value: "Low", label: "Low (More than a week)" },
];

const RoomQRDetail = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    priority: "",
    academyId: "",
    assetCode: "",
    assetName: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState({});

  const { data: academies = [] } = useGetAcademyQuery();
  const { data: assets = [] } = useGetAssetQuery();

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
    const fileUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...fileUrls]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation and post logic here
    Swal.fire({
      icon: "success",
      title: "Report Submitted!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const assetCodeOptions = [...new Set(assets.map((a) => a.assetCode))].map(
    (code) => ({ value: code, label: code })
  );

  const assetNameOptions = [...new Set(assets.map((a) => a.assetName))].map(
    (name) => ({ value: name, label: name })
  );

  return (
    <div>
      <Header />
      <div className="qrcontainer">
        <div className="card report-form">
          <div className="asset-info">
            <h3 className="section-title">Room Information</h3>
            <div className="asset_detail">
              <div className="pp"><p className="p1">Block:</p><p className="p2">Block A</p></div>
              <div className="pp"><p className="p1">Floor:</p><p className="p2">Second Floor</p></div>
              <div className="pp"><p className="p1">Room:</p><p className="p2">301</p></div>
              <div className="pp"><p className="p1">Location:</p><p className="p2">Gyalpozhig</p></div>
            </div>
          </div>

          <h4 className="form-title">Report a room only if an asset is found damaged</h4>
          <form onSubmit={handleSubmit}>
            <Select
              classNamePrefix="customm-select-department"
              name="academyId"
              onChange={(option) => handleInputChange(option, "academyId")}
              options={academies.map((a) => ({
                value: a.academyId,
                label: a.name,
              }))}
              placeholder="Select Academy"
              isClearable
            />
            <Select
              classNamePrefix="customm-select-department"
              name="assetCode"
              onChange={(option) => handleInputChange(option, "assetCode")}
              options={assetCodeOptions}
              placeholder="Select Asset Code"
              isClearable
            />
            <Select
              classNamePrefix="customm-select-department"
              name="assetName"
              onChange={(option) => handleInputChange(option, "assetName")}
              options={assetNameOptions}
              placeholder="Select Asset Name"
              isClearable
            />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
            />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
            />
            <Select
              classNamePrefix="customm-select-department"
              name="priority"
              onChange={(option) => handleInputChange(option, "priority")}
              options={priorities}
              placeholder="Select Priority"
              isClearable
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
            ></textarea>

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
              {images.map((imgSrc, index) => (
                <div key={index} className="mr-image-wrapper">
                  <img src={imgSrc} alt={`Preview ${index}`} className="mr-upload-preview" />
                  <div
                    type="button"
                    className="mr-remove-btn"
                    onClick={() => removeImage(index)}
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
            <button className="button" type="submit">
              Report
            </button>
          </form>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default RoomQRDetail;
