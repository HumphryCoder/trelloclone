import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios'
import './signup.css';
import Header from "./header";

function Signup() {

    const [loggedIn, setLoggedIn] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {

        document.body.classList.add('signup-page');
        return () => {
            document.body.classList.remove('signup-page');
        };

    }, []); // Add userEmail to the dependency array

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/signup', formData);

            console.log(response.data);

                setLoggedIn(true);
                console.log("is signed up");
            

        } catch (error) {
            console.error('Error:', error);

        }
    };

    if (loggedIn) {
        return <Navigate to="/login" />;
    }
    return (
        <>
        <Header />
        <div className="signup-container">


            <form onSubmit={handleSubmit} className="signup-form">

            <div className="intro-element">
                <p>welcome to NestFlow</p>
                <h1>Create your</h1>
                <h2>Account</h2>
            </div>
                <label className="emailSignup" htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                <label className="passwordSignup" htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                <button className="signup-element" type="submit">Sign up</button>
            </form>
        </div>
        </>
    );
}

export default Signup;