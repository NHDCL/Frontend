import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import "./css/WorkOrders.css";

const TWorkOrderCard = ({ title, dueDate, location,  priority, onView  }) => {
  return (
    <div className="work-order-card">
      <h3 className="work-order-card-title">{title}</h3>
      <p className="work-order-card-info"><FaCalendarAlt className="work-order-card-icon" /> Due {dueDate}</p>
      <p className="work-order-card-info"><FaMapMarkerAlt className="work-order-card-icon" /> {location}</p>
      <span className={`work-order-card-status ${ priority.toLowerCase()}`}>
        <FaExclamationTriangle className="work-order-card-status-icon" /> { priority}
      </span>
      <button className="work-order-card-view-button" onClick={onView}>View</button>
    </div>
  );
};

export default TWorkOrderCard;


