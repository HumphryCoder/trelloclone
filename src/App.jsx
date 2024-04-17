import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Homepage from "./homepage"
import Login from "./login"
import Signup from './signup'
import Management from './management'
import { useState } from 'react'
import './App.css';

function App() {



  return (
    <>
      <BrowserRouter>
        <>
          <Routes>
            <Route index element={<Homepage />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/management" element={<Management />} />
          </Routes>
        </>
      </BrowserRouter>
    </>
  )
}

export default App
