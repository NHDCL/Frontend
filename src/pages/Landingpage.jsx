import React, { useEffect, useState } from "react";
import "./css/landingpage.css";
import Header from "../components/LandingComponents/Header";
import Academies from "../components/LandingComponents/Academies";
import MaintenanceRequest from "../components/LandingComponents/MaintancesRequest";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useGetAcademyQuery } from "./../slices/userApiSlice";
import Swal from "sweetalert2";
import slider01 from "./../assets/images/khotokha.jpeg";
import slider02 from './../assets/images/gyalpozhing.jpeg';
import slider03 from './../assets/images/landingBG.png';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";

const Landingpage = () => {
  const navigate = useNavigate();
  const { data: academies, isLoading, error, refetch } = useGetAcademyQuery();
  const [academyList, setAcademyList] = useState([]);

  const handleGetStarted = () => {
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (error) {
      const errorMessage =
        error?.data?.message ||
        "Unable to load academies. Please try again later.";
      Swal.fire({
        icon: "error",
        title: "Failed to Load Academies",
        text: errorMessage,
      });
      return; // Skip setting academies if there's an error
    }

    if (academies && Array.isArray(academies)) {
      setAcademyList(academies);
    }
  }, [error, academies]);


  const images = [slider01, slider02, slider03];
  const totalSlides = images.length;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const autoplayInterval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(autoplayInterval);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + totalSlides) % totalSlides);
  };

  return (
    <div>
      <Header />
      <div style={{ height: '100vw',minHeight:"60vh",maxHeight:"100vh", position:"relative" }}>
      <div className='heroBanner-slider'>
        <img className='slider-image' src={images[currentSlide]} alt={`slider-0${currentSlide + 1}`} />
      </div>
      <div className='contentOuter'>
       
      <div style={{ marginTop: "clamp(3rem, 20vh, 10rem)" }}>
            <h1 className='slider-content'>Efficient Facility Management for Gyalsung </h1>
          <h3 className="slider-content1">
            Streamline facility maintenance, requests, and tracking
            effortlessly.
          </h3>
          <Link to="/login">
            {/* <p className="lp">Get Started</p> */}
              <button className='startBtn'>Get Started</button>

          </Link>
        </div>
        
      </div>
      <div className='buttonNextPrev'>
        <button className="prev pt-2 px-3" onClick={prevSlide}>
          <FaArrowAltCircleLeft size='lg' color='#897463'/>
        </button>
        <div className='ms-auto d-flex flex-row'>
          {images.map((_, index) => (
            <button key={index} type='button' className={`slider-indicator p-0 m-0 ${index === currentSlide ? 'indicator-active' : ''}`} onClick={() => setCurrentSlide(index)}></button>
          ))}
        </div>
        <button className="next pt-2 px-3" onClick={nextSlide}>
          <FaArrowAltCircleRight size="lg" color='#897463'/>
        </button>
      </div>
    </div>
      <div className="llowercontainer">
        <div>
          <Academies />
        </div>
        <div>
          <MaintenanceRequest />
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};
export default Landingpage;
