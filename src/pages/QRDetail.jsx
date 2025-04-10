import React, { useState } from "react";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import "./css/QRDetail.css";
import { RiImageAddLine } from "react-icons/ri";

const QRDetail = () => {
  const [images, setImages] = useState([]); // Change to array for multiple images
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
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

  return (
    <div>
      <Header />
      <div className="qrcontainer">
        <div className="card asset-info">
          <h3 className="section-title">Asset Information</h3>
          <img
            src="https://i.imgur.com/8Km9tLL.jpg"
            alt="Asset"
            className="asset-image"
          />
          <div className="asset_detail">
            <div className="pp">
              <p className="p1">Asset Name: </p>
              <p className="p2"> Table</p>
            </div>
            <div className="pp">
              <p className="p1">Asset Code: </p>
              <p className="p2">NHDCL-22-2003</p>
            </div>
            <div className="pp">
              <p className="p1">Area: </p>
              <p className="p2">Ground</p>
            </div>
            <div className="pp">
              <p className="p1">Location: </p>
              <p className="p2">Gyalpozhig</p>
            </div>
            <div className="pp">
              <p className="p1">Category: </p>
              <p className="p2">Furniture & Fixture</p>
            </div>
          </div>
        </div>

        <div className="card report-form">
          <h4 className="form-title">
            Report an asset only if an asset is found damaged
          </h4>
          <form>
            <input type="text" placeholder="Your Name" />
            <input type="tel" placeholder="Phone Number" />
            <input type="text" placeholder="Priority" />
            <textarea placeholder="Description"></textarea>

            {/* <div className="upload-box">
              <label htmlFor="upload-image">Upload Image</label>
              <input type="file" id="upload-image" accept="image/*" />
            </div> */}

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
                    type="button"
                    className="mr-remove-btn"
                    onClick={() => removeImage(index)}
                    style={{alignSelf:"center"}}
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
