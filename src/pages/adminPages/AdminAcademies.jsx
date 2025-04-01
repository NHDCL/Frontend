import React, { useState } from "react";
import "./css/AdminAcademies.css";
import pt from "../../assets/images/pemathang.jpeg";
import kk from "../../assets/images/khotokha.jpeg";
import jl from "../../assets/images/jamtsholing.jpeg";
import tt from "../../assets/images/taraythang.jpeg";
import gz from "../../assets/images/gyalpozhing.jpeg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { MdAddCircle } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";


const initialAcademies = [
  {
    name: "Pemathang",
    location: "Samdrup Jongkhar",
    image: pt,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Khotokha",
    location: "Wangduephodrang",
    image: kk,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Jamtsholing",
    location: "Samtse",
    image: jl,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Taraythang",
    location: "Sarpang",
    image: tt,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Gyalpozhing",
    location: "Mongar",
    image: gz,
    description: "A residential academy fostering Bhutanese youth development.",
  },
];

const AdminAcademies = () => {
  const [academies, setAcademies] = useState(initialAcademies);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAcademy, setCurrentAcademy] = useState({
    image: "https://example.com/your-existing-image.jpg", // URL or path to existing image
  });
  const [newAcademy, setNewAcademy] = useState({
    name: "",
    location: "",
    description: "",
    image: null,
  });

  const handleAdd = () => {
    setAcademies([
      ...academies,
      { ...newAcademy, image: newAcademy.image || pt },
    ]);
    setShowModal(false);
    setNewAcademy({ name: "", location: "", description: "", image: null });
  };

  const handleEdit = () => {
    setAcademies(
      academies.map((academy) =>
        academy.name === currentAcademy.name ? currentAcademy : academy
      )
    );
    setShowEditModal(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCurrentAcademy({ ...currentAcademy, image: imageUrl });
    }
  };

  return (
    <div className="AdminA-container">
      <div className="AdminA-addA" onClick={() => setShowModal(true)}>
        <MdAddCircle style={{ fontSize: "20px" }} />
        <button style={{ color: "white" }}> Add Academy</button>
      </div>

      <div className="AdminA-bento-grid">
        {academies.map((academy, index) => (
          <div
            key={index}
            className={`AdminA-bento-item AdminA-item-${index % 5}`}
            style={{
              backgroundImage: `url(${academy.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div className="AdminA-aname">
              <h1>{academy.name}</h1>
              <p>{academy.location}</p>
            </div>
            <div className="AdminA-overlay">
              <FiEdit
                style={{ fontSize: "24px", cursor: "pointer" }}
                onClick={() => {
                  setCurrentAcademy(academy);
                  setShowEditModal(true);
                }}
              />
              <RiDeleteBin6Line
                style={{ color: "red", fontSize: "24px", cursor: "pointer" }}
                onClick={() =>
                  setAcademies(academies.filter((a) => a !== academy))
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Academy Modal */}
      {showModal && (
        <div className="AdminA-modal-overlay">
          <div className="AdminA-modal-content">
            <div className="AdminA_close">
            <h2>Add Academy</h2>
            <button className="AdminA-close-btn" onClick={() => setShowModal(false)}>
              <IoIosCloseCircle
                style={{ color: "#897463", width: "20px", height: "20px", marginRight:"-120px" }}
              />
            </button>
            </div>
            <input
              type="text"
              placeholder="Name"
              value={newAcademy.name}
              onChange={(e) =>
                setNewAcademy({ ...newAcademy, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Location"
              value={newAcademy.location}
              onChange={(e) =>
                setNewAcademy({ ...newAcademy, location: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              value={newAcademy.description}
              onChange={(e) =>
                setNewAcademy({ ...newAcademy, description: e.target.value })
              }
            />
            <label className="AdminA-profile-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="AdminA-profile-hidden"
              />
              <RiImageAddLine className="AdminA-profile-upload-icon" />
              <p style={{ marginBottom: "4px" }}>Upload Image</p>
            </label>

            <button className="AdminA-add" onClick={handleAdd}>
              Add
            </button>
            {/* <button onClick={() => setShowModal(false)} className="cancel">Cancel</button> */}
          </div>
        </div>
      )}

      {/* Edit Academy Modal */}
      {showEditModal && (
        <div className="AdminA-modal-overlay">
          <div className="AdminA-modal-content">
          <div className="AdminA_close">
          <h2>Edit Academy</h2>
            <button className="AdminA-close-btn" onClick={() => setShowEditModal(false)}>
              <IoIosCloseCircle
                style={{ color: "#897463", width: "20px", height: "20px", marginRight:"-120px" }}
              />
            </button>
          </div>
            <input
              type="text"
              value={currentAcademy.name}
              onChange={(e) =>
                setCurrentAcademy({ ...currentAcademy, name: e.target.value })
              }
            />
            <input
              type="text"
              value={currentAcademy.location}
              onChange={(e) =>
                setCurrentAcademy({
                  ...currentAcademy,
                  location: e.target.value,
                })
              }
            />
            <textarea
              value={currentAcademy.description}
              onChange={(e) =>
                setCurrentAcademy({
                  ...currentAcademy,
                  description: e.target.value,
                })
              }
            />
           <label className="AdminA-profile-upload-label">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="AdminA-profile-hidden"
        />
        <div className="AdminA-profile-upload-icon">
          {/* Show existing image if available */}
          <img
            src={currentAcademy.image}
            alt="Current Profile"
            className="AdminA-profile-image"
          />
          <RiImageAddLine />
          {/* <p style={{ marginBottom: "4px" }}>Upload Image</p> */}
        </div>
      </label>
            <button className="AdminA-add" onClick={handleEdit}>Save</button>
            {/* <button onClick={() => setShowEditModal(false)} className="cancel">
              Cancel
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademies;
