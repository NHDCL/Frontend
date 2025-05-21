import React, { useState, useEffect } from "react";
import "./css/AdminAcademies.css";
import { RiDeleteBin6Line, RiImageAddLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { MdAddCircle } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import {
  useGetAcademyQuery,
  usePostAcademyMutation,
  useUpdateAcademyMutation,
  useDeleteAcademyMutation,
} from "./../../slices/userApiSlice";
import Swal from "sweetalert2";

const AdminAcademies = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newAcademy, setNewAcademy] = useState({
    name: "",
    location: "",
    description: "",
    image: "",
    imagePreview: "", // added for preview
  });

  const [currentAcademy, setCurrentAcademy] = useState({
    name: "",
    location: "",
    description: "",
    image: "",
  });

  const { data: academies, isLoading, error, refetch } = useGetAcademyQuery();
  const [addAcademy, { isLoading: isAddingLoading }] = usePostAcademyMutation();
  const [updateAcademy, { isLoading: isSavingLoading }] =
    useUpdateAcademyMutation();
  const [deleteAcademy] = useDeleteAcademyMutation();

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: "Loading academies...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to fetch academies.",
      });
    }
  }, [error]);

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (isEdit) {
        setCurrentAcademy((prev) => ({
          ...prev,
          image: file,
          imagePreview: preview,
        }));
      } else {
        setNewAcademy((prev) => ({
          ...prev,
          image: file,
          imagePreview: preview,
        }));
      }
    }
  };

  const handleAdd = async () => {
    const { name, location, description, image } = newAcademy;

    if (!name.trim() || !location.trim() || !description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Please fill in all fields",
        text: "Name, Location, and Description are required.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("location", location.trim());
    formData.append("description", description.trim());

    if (image) {
      formData.append("image", image);
    }

    try {
      await addAcademy(formData).unwrap();

      Swal.fire({
        icon: "success",
        title: "Academy added!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      setShowModal(false);
      setNewAcademy({
        name: "",
        location: "",
        description: "",
        image: "",
        imagePreview: "",
      });

      refetch();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to add academy",
        text: err?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleEdit = async () => {
    try {
      const { academyId, name, location, description, image } = currentAcademy;

      await updateAcademy({
        academyId,
        name,
        location,
        description,
        image, // this is a File object now
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Academy updated!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      setShowEditModal(false);
      refetch();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to update academy",
        text: err?.data?.message || err?.error || "Something went wrong.",
      });
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Academy?",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAcademy(id).unwrap(); // Use id directly
          refetch();
          Swal.fire({
            icon: "success",
            title: "Academy deleted successfully.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: err?.data?.message || err.error || "Something went wrong.",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  return (
    <div className="AdminA-container">
      <div className="AdminA-addA" onClick={() => setShowModal(true)}>
        <MdAddCircle style={{ fontSize: "20px" }} />
        <button style={{ color: "white" }}>Add Academy</button>
      </div>

      <div className="AdminA-bento-grid">
        {error ? (
          <p style={{ color: "red" }}>Error fetching academies</p>
        ) : (
          academies?.map((academy, index) => (
            <div
              key={academy.academyId}
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
                    setCurrentAcademy({
                      academyId: academy.academyId,
                      name: academy.name,
                      location: academy.location,
                      description: academy.description,
                      image: academy.image, // this is where new File will go (if uploaded)
                      imagePreview: academy.image, // keep the current image for preview
                    });
                    setShowEditModal(true);
                  }}
                />
                <RiDeleteBin6Line
                  style={{ color: "red", fontSize: "24px", cursor: "pointer" }}
                  onClick={() => handleDelete(academy.academyId)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="AdminA-modal-overlay">
          <div className="AdminA-modal-content">
            <div className="AdminA_close">
              <h2>Add Academy</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewAcademy({
                    name: "",
                    location: "",
                    description: "",
                    image: "",
                    imagePreview: "",
                  });
                }}
                className="AdminA-close-btn"
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
                />
              </button>
            </div>

            <input
              type="text"
              placeholder="Name"
              value={newAcademy.name}
              onChange={(e) =>
                setNewAcademy({
                  ...newAcademy,
                  name: e.target.value.trimStart(),
                })
              }
            />
            <input
              type="text"
              placeholder="Location"
              value={newAcademy.location}
              onChange={(e) =>
                setNewAcademy({
                  ...newAcademy,
                  location: e.target.value.trimStart(),
                })
              }
            />
            <textarea
              placeholder="Description"
              value={newAcademy.description}
              onChange={(e) =>
                setNewAcademy({
                  ...newAcademy,
                  description: e.target.value.trimStart(),
                })
              }
            />

            {/* Upload Button - FIXED THIS SECTION */}
            <label className="AdminA-profile-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                className="AdminA-profile-hidden"
              />

              <div className="AdminA-profile-upload-icon">
                {newAcademy.imagePreview ? (
                  <img
                    src={newAcademy.imagePreview}
                    alt="Academy preview"
                    className="AdminA-profile-image"
                  />
                ) : (
                  <>
                    <p style={{ fontSize: "14px", fontWeight: "500" }}>
                      Upload Image
                    </p>
                    <RiImageAddLine />
                  </>
                )}
              </div>
            </label>

            <button
              className="AdminA-add"
              onClick={handleAdd}
              disabled={
                !newAcademy.name ||
                !newAcademy.location ||
                !newAcademy.description
              }
            >
              {isAddingLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="AdminA-modal-overlay">
          <div className="AdminA-modal-content">
            <div className="AdminA_close">
              <h2>Edit Academy</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="AdminA-close-btn"
              >
                <IoIosCloseCircle
                  style={{ color: "#897463", width: "20px", height: "20px" }}
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
                onChange={(e) => handleImageUpload(e, true)}
                className="AdminA-profile-hidden"
              />
              <div className="AdminA-profile-upload-icon">
                {/* <img src={currentAcademy.image} alt="Current" className="AdminA-profile-image" /> */}
                <img
                  src={currentAcademy.imagePreview || currentAcademy.image}
                  alt="Current"
                  className="AdminA-profile-image"
                />

                <RiImageAddLine />
              </div>
            </label>
            <button
              className="AdminA-add"
              onClick={handleEdit}
              disabled={isSavingLoading}
            >
              {isSavingLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademies;
