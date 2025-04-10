import React, { useEffect } from "react";
import "./../adminPages/css/AdminAcademies.css";
import { useGetAcademyQuery } from "./../../slices/userApiSlice";
import Swal from "sweetalert2";

const SAdminAcademies = () => {
  const { data: academies, isLoading, error } = useGetAcademyQuery();
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
    <div className="AdminA-container">
      <div className="AdminA-bento-grid">
        {isLoading ? (
          <p>Loading academies...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error fetching academies</p>
        ) : (
          academies?.map((academy, index) => (
            <div
              key={index}
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
              <div className="SuperA-overlay">
                <p className="SuperA-adescription">{academy.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SAdminAcademies;
