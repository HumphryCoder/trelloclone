import './header.css';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import App from './App';
import { useEffect, useState } from 'react';

function header() {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  function handleLogout() {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('userEmail', '');
    localStorage.setItem('userId', '');
    setUserEmail('');
    setUserId('');
    setIsLoggedIn(false);

  }

  useEffect(() => {
    console.log(userEmail);
    console.log(userId);


    document.body.classList.add('header-page'); 
        return () => {
            document.body.classList.remove('header-page');
        };

  }, []); 
  return (
    <>

      <div className='navbar'>
       <Link to={"/homepage"}><h1>NestFlow</h1></Link> 
        <ul>
          {isLoggedIn ? (
            <li className='products'><Link to="/management">Products</Link></li>
          ) : (
            <li className='products'><Link to="/login">Products</Link></li>
          )}
          {!isLoggedIn && (
            <li className='login'><Link to="/login">Log in</Link></li>
          )}

          {isLoggedIn && (
           <li className='logout'><Link to="/homepage" onClick={handleLogout}>Log out</Link></li>
          )}

        </ul>
      </div>


    </>
  );
}

export default header