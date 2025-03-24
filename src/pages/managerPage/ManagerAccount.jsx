import React, {useState} from "react"
import './css/MAccount.css'
import img from '../../assets/images/pp.png'

const ManagerAccount = () => {
    const [profile, setProfile] = useState({
        name: "Tenzin Om",
        email: "omtenzin@gmail.com",
        academy: "Khotokha Gyalsung Academy",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        image: img, // Default image
      });
    
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
    
      return (
        <div className="profile-container">
          <div className="profile-card">
            {/* Left Section */}
            <div className="profile-left">
              <img src={profile.image} alt="Profile" className="profile-image" />
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
              <p>{profile.academy}</p>
            </div>
    
            {/* Right Section */}
            <div className="profile-right">
              <h3>Edit Your Profile Detail</h3>
              <input className="profile-input" type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
              <input className="profile-input" type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Email" />
              <input className="profile-input" type="text" name="academy" value={profile.academy} onChange={handleChange} placeholder="Academy" />
              <input className="profile-input" type="password" name="oldPassword" placeholder="Old Password" onChange={handleChange} />
              <input className="profile-input" type="password" name="newPassword" placeholder="New Password" onChange={handleChange} />
              <input  className="profile-input" type="password" name="confirmPassword" placeholder="Re-enter New Password" onChange={handleChange} />
              <label className="upload-label">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                Click Here to Upload Image
              </label>
              <button className="update-button">Update</button>
            </div>
          </div>
        </div>
      );
    }
  
  export default ManagerAccount;