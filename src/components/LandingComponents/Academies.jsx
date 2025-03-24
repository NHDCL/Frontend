import React from "react";
import "../../pages/css/Academies.css";
import pt from "../../assets/images/pemathang.jpeg";
import kk from "../../assets/images/khotokha.jpeg";
import jl from "../../assets/images/jamtsholing.jpeg";
import tt from "../../assets/images/taraythang.jpeg";
import gz from "../../assets/images/gyalpozhing.jpeg";

const academies = [
  { name: "Pemathang", location: "Samdrup Jongkhar", image: pt, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries." },
  { name: "Khotokha", location: "Wangduephodrang", image: kk, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries."  },
  { name: "Jamtsholing", location: "Samtse", image: jl, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries."  },
  { name: "Taraythang", location: "Sarpang", image: tt, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries."  },
  // { name: "Taraythang", location: "Sarpang", image: tt, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries."  },
  { name: "Gyalpozhing", location: "Mongar", image: gz, Description: "​The Khotokha Gyalsung Academy, located in Wangdue Phodrang's Ruebisa Gewog, is a fully residential institution dedicated to the holistic development of Bhutanese youth. The academy offers comfortable living spaces and nutritious meals, fostering camaraderie among cadets from across the nation. Emphasizing both physical and mental well-being, the institution implements progressive training curricula, mandatory hydration protocols, and ensures adequate rest to prevent injuries."  }
];

const Academies = () => {
  return (
    <div className="bento-container">
      <div className="atitlediv">
        <h1 className="title">Gyalsung Academies</h1>
        <hr className="a_hr1" />
        <hr className="a_hr2" />
        <hr className="a_hr3" />
      </div>
      <div className="bento-grid">
        {academies.map((academy, index) => (
          <div key={index} className={`bento-item item-${index % 5}`} style={{
            backgroundImage: `url(${academy.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative"
          }}>
            <div className="aname">
              <h1>{academy.name}</h1>
              <p>{academy.location}</p> 
            </div>
            <div className="overlay">
              <p className="adescription">{academy.Description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academies;