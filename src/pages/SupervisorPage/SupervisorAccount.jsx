import React, { useState } from "react";
import "./../managerPage/css/MAccount.css";
import img from "../../assets/images/pp.png";
import { RiImageAddLine } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const SupervisorAccount = () => {
  const [profile, setProfile] = useState({
    name: "Tenzin Om",
    email: "omtenzin@gmail.com",
    academy: "Khotokha Gyalsung Academy",
    department: "Plumbing Team",
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
    if (!profile.academy.trim()) newErrors.academy = "Academy is required";
    if (!profile.department.trim()) newErrors.department = "Department is required";

    if (!profile.oldPassword) newErrors.oldPassword = "Old password is required";

    if (profile.newPassword || profile.confirmPassword) {
      if (profile.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters";
      }
      if (profile.newPassword !== profile.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      alert("Profile Updated Successfully!");
      console.log("Updated Profile:", profile);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-left">
          <img src={profile.image} alt="Profile" className="profile-image" />
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <p>{profile.department}</p>
          <p>{profile.academy}</p>
        </div>

        <div className="profile-right">
          <h3>Edit Your Profile Details</h3>
          <input
            className="profile-input"
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <input
            className="profile-input"
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            className="profile-input"
            type="text"
            name="department"
            value={profile.department}
            onChange={handleChange}
            placeholder="Department"
          />
          {errors.department && <p className="error-text">{errors.department}</p>}

          
          <input
            className="profile-input"
            type="text"
            name="academy"
            value={profile.academy}
            onChange={handleChange}
            placeholder="Academy"
          />
          {errors.academy && <p className="error-text">{errors.academy}</p>}

          {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
            <div className="password-container" key={field}>
              <input
                className="profile-input"
                type={showPassword[field] ? "text" : "password"}
                name={field}
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
            <p style={{marginBottom:"4px"}}>Upload Image</p>
          </label>

          <button className="profile-update-button" onClick={handleSubmit}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorAccount;
