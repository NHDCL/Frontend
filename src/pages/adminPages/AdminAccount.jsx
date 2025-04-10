import React, { useState, useEffect, useRef } from "react";
import "./../managerPage/css/MAccount.css";
import { RiImageAddLine } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import img from "../../assets/images/defaultImage.png";
import {
  useGetUserByEmailQuery,
  useUpdateUserImageMutation,
  useChangePasswordMutation,
} from "../../slices/userApiSlice";
import Swal from "sweetalert2";

const selectUserInfo = (state) => state.auth.userInfo || {};
const getUserEmail = createSelector(
  selectUserInfo,
  (userInfo) => userInfo?.user?.username || ""
);

const AdminAccount = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    image: img,
    imageFile: null,
  });

  const [isNewImageSelected, setIsNewImageSelected] = useState(false); // 👈 new flag
  const originalImageRef = useRef(img);
  const email = useSelector(getUserEmail);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const { data, error, refetch } = useGetUserByEmailQuery(email);
  const [updateUserProfile, { isLoading: isImageLoading }] =
    useUpdateUserImageMutation();
  const [updateUserPassword, { isLoading: isPasswordLoading }] =
    useChangePasswordMutation();

  useEffect(() => {
    if (data) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image || img,
      }));
      originalImageRef.current = data.user.image || img;
    }

    if (error) {
      console.error("Failed to fetch profile data:", error);
      Swal.fire("Error", "Failed to load profile data.", "error");
    }
  }, [data, error]);

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
        setProfile((prev) => ({
          ...prev,
          image: reader.result,
          imageFile: file,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setIsNewImageSelected(true); // 👈 show update button
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const { name, email, oldPassword, newPassword, confirmPassword } = profile;

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) newErrors.oldPassword = "Old password is required";
      if (newPassword.length < 6)
        newErrors.newPassword = "Password must be at least 6 characters";
      if (newPassword !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      let madeChanges = false;

      if (
        profile.oldPassword &&
        profile.newPassword &&
        profile.newPassword === profile.confirmPassword
      ) {
        madeChanges = true;
        try {
          const res = await updateUserPassword({
            email: profile.email,
            oldPassword: profile.oldPassword,
            newPassword: profile.newPassword,
          }).unwrap();
          Swal.fire("Success", "Password Updated Successfully!", "success");
          setProfile((prev) => ({
            ...prev,
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        } catch (error) {
          console.error("Password update failed:", error.message);
          Swal.fire(
            "Password Update Failed",
            error?.data?.message || "Something went wrong.",
            "error"
          );
        }
      }

      if (!madeChanges) {
        Swal.fire("Info", "No changes detected to update.", "info");
      }
    } else {
      Swal.fire(
        "Validation Error",
        "Please correct the errors in the form.",
        "warning"
      );
    }
  };

  const handleImageUpdate = async () => {
    if (profile.imageFile && profile.imageFile !== originalImageRef.current) {
      try {
        const response = await updateUserProfile({
          email: profile.email,
          image: profile.imageFile,
        }).unwrap();
        Swal.fire("Success", "Profile Image Updated Successfully!", "success");
        originalImageRef.current = profile.imageFile;
        setIsNewImageSelected(false); // 👈 hide update button
        // Refetch the profile data to update the image
        refetch();
      } catch (error) {
        console.error("Image update failed:", error.message);
        Swal.fire(
          "Image Update Failed",
          error?.data?.message || "Something went wrong.",
          "error"
        );
      }
    } else {
      Swal.fire("Info", "Please select a new image to update.", "info");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-left">
          <div className="profile-image-wrapper">
            <img src={profile.image} alt="Profile" className="profile-image" />
            <label className="profile-camera-icon">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="profile-hidden"
              />
              <RiImageAddLine />
            </label>
          </div>

          {/* Only show button if new image is selected */}
          {isNewImageSelected && (
            <button
              className="profile-update-button"
              onClick={handleImageUpdate}
              disabled={isImageLoading}
            >
              {isImageLoading ? "Updating..." : "Update Image"}
            </button>
          )}
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

          <button
            className="profile-update-button"
            onClick={handleSubmit}
            disabled={isPasswordLoading}
          >
            {isPasswordLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;
