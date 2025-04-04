import React, { useEffect, useRef } from "react";
import homeimg2 from "../images/ai-text-generator.jpg"; 
import '../styles/HomePage.css';
import FeaturesPage from "./FeaturesPage";
import AboutPage from "./AboutPage";

const HomePage = () => {
  const textRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          textRef.current.classList.add('animate-in');
        }
      },
      {
        threshold: 0.1
      }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, []);

  return (
    <>
      <section id="home" className="home-section">
        <div className="image-container">
          <img src={homeimg2} alt="Home Page" />
          <div className="overlay"></div>
        </div>
        <div className="home-text" ref={textRef}>
          <h1>Your Complete Writing Solution</h1>
          <p>
            Empower your writing journey with TextCraft, where every word counts and creativity flows effortlessly!
          </p>
          <div className="button-container">
            <a href="/features" className="explore-button">Explore Features</a>
            <a href="/" className="try-button">Try TextCraft</a>
          </div>
        </div>
      </section>
      <FeaturesPage />
      <AboutPage />
    </>
  );
};

export default HomePage;