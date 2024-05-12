import './homepage.css';
import Header from "./header"
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import App from "./App";
import { useEffect, useState } from 'react';

function homepage() {

    useEffect(() => {
        document.body.classList.add('home-page'); 
        return () => {
            document.body.classList.remove('home-page');
        };
    },[]);
  
    return (
        <>
   
      <Header />
      <div className='heropage-container'>
        <div className='hero-text'>
           <h1 className='hero-h1'>Mastering the Art of Goal Attainment</h1>
           <h2 className='hero-h2'>because success is a journey, not a destination.</h2>
        </div>
      </div>
       
        </>
    );
}

export default homepage