import React, { useState } from "react";
import "./../adminPages/css/AdminAcademies.css";
import pt from "../../assets/images/pemathang.jpeg";
import kk from "../../assets/images/khotokha.jpeg";
import jl from "../../assets/images/jamtsholing.jpeg";
import tt from "../../assets/images/taraythang.jpeg";
import gz from "../../assets/images/gyalpozhing.jpeg";

const initialAcademies = [
  {
    name: "Pemathang",
    location: "Samdrup Jongkhar",
    image: pt,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Khotokha",
    location: "Wangduephodrang",
    image: kk,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Jamtsholing",
    location: "Samtse",
    image: jl,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Taraythang",
    location: "Sarpang",
    image: tt,
    description: "A residential academy fostering Bhutanese youth development.",
  },
  {
    name: "Gyalpozhing",
    location: "Mongar",
    image: gz,
    description: "A residential academy fostering Bhutanese youth development.",
  },
];

const SAdminAcademies = () => {
  const [academies] = useState(initialAcademies);

  return (
    <div className="AdminA-container">
      <div className="AdminA-bento-grid">
        {academies.map((academy, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default SAdminAcademies;
