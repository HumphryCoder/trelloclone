import './login.css';
import Header from './header';
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import axios from "axios";

function login() {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userId', userId);

        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, [userEmail, userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/login', formData);

            if (response.status == 200) {
                console.log(response.data.id);
                setUserEmail(formData.email);
                setUserId(response.data.id);
                console.log("good response");
                console.log(formData.email);
                localStorage.setItem('isLoggedIn', 'true');

            } else if (response.status != 200) {
                console.log("error bad response");
            }

            console.log(response.data);

        } catch (error) {
            console.error('Error:', error);

        }
    };

    if (isLoggedIn) {
        return <Navigate to="/homepage" />;
    }

    return (
        <>
            <div className='login-bg'>
                <div className="login-container">


                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="welcome-element">
                            <p>welcome to NestFlow</p>
                            <h1>Log into your</h1>
                            <h2>Account</h2>
                        </div>

                        <label className="emailLabel" htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={FormData.email} onChange={handleChange} />
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={FormData.password} onChange={handleChange} />
                        <button className="login-element" type="submit">Log in</button>
                        <div className="signup-element-link">
                            <Link to="/signup">Signup</Link>
                        </div>
                    </form>




                </div>
            </div>

        </>
    );
}

export default login