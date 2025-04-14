import React, { useState } from "react";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import "./css/QRDetail.css";
import { RiImageAddLine } from "react-icons/ri";
import Select from "react-select"; // Make sure to install this with: npm install react-select

const priorities = [
  { value: "Immediate", label: "Immediate (Within 24 hours)" },
  { value: "High", label: "High (Within 1-2 days)" },
  { value: "Moderate", label: "Moderate (Within 1 week)" },
  { value: "Low", label: "Low (More than a week)" },
];

const QRDetail = () => {
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    priority: "",
    description: "",
  });

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
    setImages(images.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, priority: selectedOption?.value || "" }));
  };

  return (
    <div>
      <Header />
      <div className="qrcontainer">
        <div className="card report-form">
          <div className="asset-info">
            <h3 className="section-title" style={{ textAlign: "start" }}>Asset Information</h3>
            <div className="asset_detail">
              <div className="pp"><p className="p1">Asset Name:</p><p className="p2">Table</p></div>
              <div className="pp"><p className="p1">Asset Code:</p><p className="p2">NHDCL-22-2003</p></div>
              <div className="pp"><p className="p1">Area:</p><p className="p2">Ground</p></div>
              <div className="pp"><p className="p1">Location:</p><p className="p2">Gyalpozhig</p></div>
              <div className="pp"><p className="p1">Category:</p><p className="p2">Furniture & Fixture</p></div>
            </div>
          </div>

          <h4 className="form-title">Report an asset only if an asset is found damaged</h4>
          <form>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
            />
            <Select
              classNamePrefix="customm-select-department"
              name="priority"
              options={priorities}
              value={priorities.find((p) => p.value === formData.priority)}
              onChange={handlePriorityChange}
              placeholder="Select Priority"
              isClearable
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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
                  <img
                    src={imgSrc}
                    alt={`Uploaded Preview ${index}`}
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

            <button className="button" type="submit">Report</button>
          </form>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default QRDetail;
