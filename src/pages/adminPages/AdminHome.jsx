import React, { useEffect } from "react";
import MaintenanceGraphs from "../../components/graph/MaintenanceGraphs";
import { useGetAcademyQuery } from "./../../slices/userApiSlice";
import Swal from "sweetalert2";
import { useGetRepairRequestQuery } from "../../slices/maintenanceApiSlice";

const AdminHome = () => {
  const { data: academies, error } = useGetAcademyQuery();
  const { data: repairRequest } = useGetRepairRequestQuery();

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to fetch academies.",
      });
    }
  }, [error]);
  console.log("localStorage",repairRequest)

  const totalRepair = repairRequest?.filter((req) => req.accept === true);

  const totalResolvedRepair = totalRepair?.filter(
    (req) => req.status === "Completed"
  );
  const totalUnResolvedRepair = totalRepair?.filter(
    (req) => req.status === "Pending" || req.status === "In Progress"
  );
  console.log("debugger",totalUnResolvedRepair)
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
            <p className="count">{totalRepair?.length || 0}</p>
          </div>
        </div>
        <div className="cardCount cardCount1">
          <div className="CardContent">
            <h3 className="cardTitle">Total Resolved Requests</h3>
            <p className="count">{totalResolvedRepair?.length || 0}</p>
          </div>
        </div>
        {/* <div className="cardCount">
          <div className="CardContent">
            <h3 className="cardTitle">Total Unresolved Requests</h3>
            <p className="count">{totalUnResolvedRepair?.length || 0}</p>
          </div>
        </div> */}
      </div>
      <div>
        <MaintenanceGraphs />
      </div>
    </div>
  );
};

export default AdminHome;
