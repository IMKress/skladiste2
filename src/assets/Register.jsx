import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LogINApiQuery(registerArray, navigate) {
    const baseUrl = "https://localhost:5001/api/auth/register";
    axios({
        method: 'post',
        url: baseUrl,
        headers: {},
        data: {
            username: registerArray.username,
            email: registerArray.email,
            password: registerArray.password,
        }
    }).then(response => {
        console.log('Token:', response.data.token);
        navigate('/');



    }).catch(error => {
        //console.error(error);
        alert("Greška prilikom registracije")

    });
}

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const registerArray = {
            username: username,
            email: email,
            password: password
        };
        LogINApiQuery(registerArray, navigate);
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label><br />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label><br />
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label><br />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default RegisterForm;
