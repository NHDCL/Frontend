import React, { useEffect } from "react";
import MaintenanceGraphs from "../../components/graph/MaintenanceGraphs";
import { useGetAcademyQuery } from "./../../slices/userApiSlice";
import Swal from "sweetalert2";

const AdminHome = () => {
  const { data: academies, error } = useGetAcademyQuery();

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to fetch academies.",
      });
    }
  }, [error]);

  return (
    <div>
      <div className="cardwrap">
        {/* Card counts */}
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Registered Academies</h3>
            <p className="count">{academies?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Maintenance Request</h3>
            <p className="count">45</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Resolved Requests</h3>
            <p className="count">56</p>
          </div>
        </div>
        <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Unresolved Requests</h3>
            <p className="count">78</p>
          </div>
        </div>
      </div>
      <div>
        <MaintenanceGraphs />
      </div>
    </div>
  );
};

export default AdminHome;
