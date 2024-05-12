import './header.css';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import App from './App';
import { useEffect, useState } from 'react';
import { motion, useAnimation, cubicBezier, easeInOut } from "framer-motion"

function header() {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const controls = useAnimation();
  const itemsControls = useAnimation();

  useEffect(() => {
    controls.start({
        scaleX: [0.07, 1],
        scaleY: [0.3, 1],
        transition: {
            duration: 0.25,
            type: "spring",
            bounce: 1,
            damping: 15,
        },
    }).then(() => {
        itemsControls.start({
            opacity: [0,1],
            transition: { duration: 0.2, ease: 'easeInOut' },
        });
    });
}, []); 

  useEffect(() => {
    console.log(userEmail);
    console.log(userId);


    document.body.classList.add('header-page');
    return () => {
      document.body.classList.remove('header-page');
    };

    

  }, []);

  function handleLogout() {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('userEmail', '');
    localStorage.setItem('userId', '');
    setUserEmail('');
    setUserId('');
    setIsLoggedIn(false);

  }
  return (
    <>
      <Link to='/homepage'>
        <h1 className='company-title'>NestFlow</h1>
      </Link>
      <div className='dynamicDock-container'>
        <motion.div
          className='dynamicDock'
          animate={controls}
          transition={{ ease: "anticipate" }}
        >
            <ul>
            {isLoggedIn ? (
              <motion.li
                className='products'
                animate={itemsControls}
                whileHover={{scale: 1.1}}
              ><Link to="/management">Services</Link>
              </motion.li>
            ) : (
              <motion.li
                className='products'
                animate={itemsControls}
                whileHover={{scale: 1.1}}
              ><Link to="/login">Services</Link>
              </motion.li>
            )}
            <li className='plans-container'>Plans</li>
            {!isLoggedIn ? (
              <motion.button
                className='login-btn'
                animate={itemsControls}
                whileHover={{ scale: 1.1 }}
              >
                <Link to="/login">Log In</Link>
              </motion.button>
            ) : (
                <motion.button
                  className='login-btn'
                  animate={itemsControls}
                  whileHover={{ scale: 1.1 }}
                >
                  <Link to="/homepage" onClick={handleLogout}>Log out</Link>
                </motion.button>
              )}
          </ul>
        </motion.div>
      </div>
    </>
  );
}

export default header