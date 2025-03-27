import React from "react";
import "./css/AdminAcademies.css";
import pt from "../../assets/images/pemathang.jpeg";
import kk from "../../assets/images/khotokha.jpeg";
import jl from "../../assets/images/jamtsholing.jpeg";
import tt from "../../assets/images/taraythang.jpeg";
import gz from "../../assets/images/gyalpozhing.jpeg";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { MdAddCircle } from "react-icons/md";

const academies = [
  {
    name: "Pemathang",
    location: "Samdrup Jongkhar",
    image: pt,
    Description:
      "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries.",
  },
  {
    name: "Khotokha",
    location: "Wangduephodrang",
    image: kk,
    Description:
      "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries.",
  },
  {
    name: "Jamtsholing",
    location: "Samtse",
    image: jl,
    Description:
      "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries.",
  },
  {
    name: "Taraythang",
    location: "Sarpang",
    image: tt,
    Description:
      "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries.",
  },
  // { name: "Taraythang", location: "Sarpang", image: tt, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries."  },
  {
    name: "Gyalpozhing",
    location: "Mongar",
    image: gz,
    Description:
      "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries.",
  },
];

const AdminAcademies = () => {
  return (
    <div className="AdminA-container">
      <div>
        <button className="AdminA-addA"><MdAddCircle style={{fontSize:"15px"}}/> Add Academy</button>
      </div>
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
            <div className="AdminA-overlay">
                    <FiEdit style={{fontSize:"24px"}}/>
                    <RiDeleteBin6Line style={{color:"red", fontSize:"24px"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAcademies;
