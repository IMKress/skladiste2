import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function LogINApiQuery(loginArray, navigate, setLoginError) {
    const baseUrl = "https://localhost:5001/api/auth/login";
    axios({
        method: 'post',
        url: baseUrl,
        headers: {},
        data: {
            username: loginArray.username,
            password: loginArray.password,
        }
    }).then(response => {
        console.log('Token:', response.data.token);
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem('Username', loginArray.username);
        sessionStorage.setItem('UserId', response.data.id);
        sessionStorage.setItem('Role', JSON.stringify(response.data.roles));

        navigate('/Pocetna');
    }).catch(error => {
        console.error(error);
        setLoginError(true);
    });
}

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const loginArray = {
            username: username,
            password: password
        };
        setLoginError(false); // Reset error state before attempting login
        LogINApiQuery(loginArray, navigate, setLoginError);
    };

    return (
        <div className="login-page-container">
            <div className="login-form">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input 
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {loginError && <p className="login-error">Greška prilikom prijave</p>}
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
