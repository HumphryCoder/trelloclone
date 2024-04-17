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
       
        </>
    );
}

export default homepage