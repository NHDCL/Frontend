import React from 'react'
import { FaCalendarAlt, FaMapMarkerAlt, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import './css/Thome.css'

const workOrders = [
    { id: 1, title: "Replace filter for HVAC", dueDate: "Nov 5, 2025", location: "Block N, Gyalpozhing", status: "Minor" },
    { id: 2, title: "Replace filter for HVAC", dueDate: "Nov 5, 2025", location: "Block N, Gyalpozhing", status: "Minor" },
    { id: 3, title: "Replace filter for HVAC", dueDate: "Nov 5, 2025", location: "Block N, Gyalpozhing", status: "Minor" },
    { id: 4, title: "Replace filter for HVAC", dueDate: "Nov 5, 2025", location: "Block N, Gyalpozhing", status: "Major" },
    { id: 5, title: "Replace filter for HVAC", dueDate: "Nov 5, 2025", location: "Block N, Gyalpozhing", status: "Major" },
  ];
  
const WorkOrderCard = ({ title, dueDate, location, status }) => {
    return (
      <div className="work-order-card">
        <h3 className="title"><FaClipboardList className="icon" /> {title}</h3>
        <p className="info"><FaCalendarAlt className="icon" /> Due {dueDate}</p>
        <p className="info"><FaMapMarkerAlt className="icon" /> {location}</p>
        <span className={`status ${status.toLowerCase()}`}>
          <FaExclamationTriangle className="status-icon" /> {status}
        </span>
        <button className="view-button">View</button>
      </div>
    );
  };

const TechnicianHome=()=>{
   return (
    <div className="work-orders-container">
      <h2 className="header">Today's Work</h2>
      <button className="my-work-button">View my work</button>
      <div className="filter-section">
        <label>All work orders</label>
        <select className="filter-dropdown">
          <option>Work Status</option>
        </select>
      </div>
      <div className="work-orders-grid">
        {workOrders.map((order) => (
          <WorkOrderCard key={order.id} {...order} />
        ))}
      </div>
    </div>
  );
};

export default TechnicianHome