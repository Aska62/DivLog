import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Header({ currentPage }) {
  const auth = getAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Use firebase auth to sign out
  const onLogout = () => {
    auth.signOut();
    navigate('/sign-in');
  }

  return (
    <header className='header'>
      <div className='header_logo-container' onClick={() => navigate('/')}>
        <div className="logo header_goggle header_goggle_pc"></div>
        <h1 className='logo header_logo'>DivLog</h1>
      </div>
      <ul className='navbar-container'>
        <li
          className={`navbar-item navbar-item_home ${currentPage === 'home' ? 'navbar_current-page':''}`}
          onClick={() => navigate('/')}
        >Home</li>
        <li
          className={`navbar-item navbar-item_logs ${currentPage === 'logs' ? 'navbar_current-page':''}`}
          onClick={() => navigate('/logs')}
        >Logs</li>
        <li
          className={`navbar-item navbar-item_plans ${currentPage === 'plans' ? 'navbar_current-page':''}`}

          onClick={() => navigate('/plans')}
        >Plans</li>
        <li
          className={`navbar-item navbar-item_profile ${currentPage === 'profile' ? 'navbar_current-page':''}`}

          onClick={() => navigate('/profile')}
        >Profile</li>
        <li><FaIcon icon={faArrowRightFromBracket} className="navbar-item" onClick={onLogout} /></li>
      </ul>

      <div className="mob-menu-opener" onClick={()=>setMenuOpen(true)}>
        <div className="logo header_goggle menu-opener_logo"></div>
      </div>
      <ul className={`mob-menu-container ${menuOpen ? 'mob-menu-container_open' : ''}`}>
        <li className="cross-box" onClick={()=>setMenuOpen(false)}>
          <div className="cross cross_left"></div>
          <div className="cross cross_right"></div>
        </li>
        <li
          className={`menu-item menu-item_home decor-font ${currentPage === 'home' ? 'menu-item_current-page':''}`}
          onClick={() => navigate('/')}
        >Home</li>
        <li
          className={`menu-item menu-item_logs decor-font ${currentPage === 'logs' ? 'menu-item_current-page':''}`}
          onClick={() => navigate('/logs')}
        >Logs</li>
        <li
          className={`menu-item menu-item_plans decor-font ${currentPage === 'plans' ? 'menu-item_current-page':''}`}

          onClick={() => navigate('/plans')}
        >Plans</li>
        <li
          className={`menu-item menu-item_profile decor-font ${currentPage === 'profile' ? 'menu-item_current-page':''}`}

          onClick={() => navigate('/profile')}
        >Profile</li>
        <li className="menu-item menu-item_logout decor-font" onClick={onLogout}>Logout</li>
      </ul>
    </header>
  )
}

export default Header