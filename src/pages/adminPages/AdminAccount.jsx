import React, { useState, useEffect } from "react";
import "./../managerPage/css/MAccount.css";
import img from "../../assets/images/pp.png";
import { RiImageAddLine } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const AdminAccount = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    academy: "", // Keep academy but don't update it
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    image: img, // Default image
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const token = sessionStorage.getItem("token"); // 🔑 Retrieve token

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/manager/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 🔐 Attach token
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfile((prevProfile) => ({
          ...prevProfile,
          name: data.name, // Retrieved name
          email: data.email, // Retrieved email
          academy: prevProfile.academy, // Keep academy value as is, not updated from the backend
        }));
      } catch (error) {
        console.error("Failed to fetch profile data:", error.message);
        alert("Failed to load profile data.");
      }
    };

    fetchProfileData();
  }, [token]); // The useEffect hook will run when the component mounts or when the token changes

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!profile.name.trim()) newErrors.name = "Name is required";
    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/manager/update-profile",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 🔐 Attach token
            },
            body: JSON.stringify(profile),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        const data = await response.json();
        alert("Profile Updated Successfully!");
        console.log("Updated Profile (from server):", data);
      } catch (error) {
        console.error("Update failed:", error.message);
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-left">
          <img src={profile.image} alt="Profile" className="profile-image" />
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <p>{profile.academy}</p> {/* Academy displayed but not editable */}
        </div>

        <div className="profile-right">
          <h3>Edit Your Profile Details</h3>
          {/* Name is editable */}
          <input
            className="profile-input"
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          {/* Email is editable */}
          <input
            className="profile-input"
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          {/* Academy is not editable */}
          <input
            className="profile-input"
            type="text"
            name="academy"
            value={profile.academy}
            disabled // Academy is read-only
            placeholder="Academy"
          />
          {errors.academy && <p className="error-text">{errors.academy}</p>}

          {/* Password fields */}
          {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
            <div className="password-container" key={field}>
              <input
                className="profile-input"
                type={showPassword[field] ? "text" : "password"}
                name={field}
                value={profile[field]}
                placeholder={
                  field === "oldPassword"
                    ? "Old Password"
                    : field === "newPassword"
                    ? "New Password"
                    : "Re-enter New Password"
                }
                onChange={handleChange}
              />
              <span
                className="profile-password-toggle"
                onClick={() => togglePasswordVisibility(field)}
              >
                {showPassword[field] ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
              {errors[field] && <p className="error-text">{errors[field]}</p>}
            </div>
          ))}

          <label className="profile-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="profile-hidden"
            />
            <RiImageAddLine className="profile-upload-icon" />
            <p style={{ marginBottom: "4px" }}>Upload Image</p>
          </label>

          <button className="profile-update-button" onClick={handleSubmit}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;
