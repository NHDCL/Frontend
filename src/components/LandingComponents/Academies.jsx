import React, { useEffect } from "react";
import "../../pages/css/Academies.css";
import { useGetAcademyQuery } from "./../../slices/userApiSlice";
import Swal from "sweetalert2";

const Academies = () => {
  const { data: academies, isLoading, error } = useGetAcademyQuery();
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to Load Academies",
        text: "Unable to load academies. Please try again later.",
      });
    }
  }, [error]);

  return (
    <div className="bento-container">
      <div className="atitlediv">
        <h1 className="title">Gyalsung Academies</h1>
        <hr className="a_hr1" />
        <hr className="a_hr2" />
        <hr className="a_hr3" />
      </div>
      <div className="bento-grid">
        {isLoading ? (
          <p>Loading academies...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error fetching academies</p>
        ) : (
          academies?.map((academy, index) => (
            <div
              key={academy.academyId}
              className={`bento-item item-${index % 5}`}
              style={{
                backgroundImage: `url(${academy.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div className="aname">
                <h1>{academy.name}</h1>
                <p>{academy.location}</p>
              </div>
              <div className="overlay">
                <p className="adescription">{academy.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Academies;
