import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home({currentPage}) {
  const navigate = useNavigate();
  const auth = getAuth();

  return (
    <>
      <Header currentPage={currentPage} />
      <section className="main-image-container">
        <div className="main-image"></div>
        <div className="main-image_cover">
          <p className="main-image_lead">Dive As You Live.</p>
          <p className="main-image_credit">
            Photo by <a href="https://unsplash.com/@jetlag?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">David Troeger</a> on <a href="https://unsplash.com/photos/water-with-bubbles-jR77eUDa350?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a>
          </p>
        </div>
      </section>
      <section className="home-menu-list">
        <ul className="home-menu_box">
          <li className="home-menu home-menu_profile" onClick={() => navigate('/profile')}>
            Profile
          </li>
          <li className="home-menu home-menu_plans" onClick={() => navigate('/plans')}>
            Plans
          </li>
          <li className="home-menu home-menu_logs" onClick={() => navigate('/logs')}>
            Logs
          </li>
        </ul>
      </section>
      <Footer/>
    </>
  )
}

export default Home