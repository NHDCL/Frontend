import React from "react";
import "./../../pages/css/MaintenanceRequest.css";

const MaintenanceRequest = () => {
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
            <h1 className="mr_p">Please complete the maintenance request form to report any issues with the facility.</h1>
        </div>


        <div className="mr_form">
            <form className="custom-form">
                <div className="input-group">
                <input required type="text" name="name" autoComplete="off" className="input" />
                <label className="user-label">Name</label>
                </div>

                <div className="input-group">
                <input required type="text" name="phone" autoComplete="off" className="input" />
                <label className="user-label">Phone Number</label>
                </div>

                <div className="input-group">
                <input required type="text" name="asset" autoComplete="off" className="input" />
                <label className="user-label">Asset Name</label>
                </div>

                <div className="input-group">
                <select required className="input">
                    <option value="" disabled selected></option>
                    <option>Pemathang</option>
                    <option>Khotokha</option>
                    <option>Jamtsholing</option>
                    <option>Taraythang</option>
                    <option>Gyalpozhing</option>
                </select>
                <label className="user-label">Academy</label>
                </div>

                <div className="input-group">
                <select required className="input">
                    <option value="" disabled selected></option>
                    <option>Block A</option>
                    <option>ground</option>
                    <option>Footpath</option>
                    <option>Room1</option>
                </select>
                <label className="user-label">Area</label>
                </div>

                <div className="input-group">
                <select required className="input">
                    <option value="" disabled selected></option>
                    <option>Major</option>
                    <option>Minor</option>
                </select>
                <label className="user-label">Priority</label>
                </div>

                <div className="input-group">
                <textarea required className="input"></textarea>
                <label className="user-label">Description</label>
                </div>

                <div className="upload-box">
                <span className="upload-icon">📷</span>
                <p>Click Here to Upload Image</p>
                </div>

                <button type="submit" className="submit-btn">Request</button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequest;