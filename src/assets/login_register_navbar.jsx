import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function Navigacija() {
  const [userDetails, setUserDetails] = useState({ username: '', roles: [], UserId: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('Username');
    const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');
    const UserId = sessionStorage.getItem('UserId');

    if (token) {
      setUserDetails({ username, roles, UserId });
    }
    console.log(username)

    const validateToken = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('https://localhost:5001/api/home/artikli_db', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setIsLoggedIn(true);
          console.log("Token is valid:", response.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          setIsLoggedIn(false);
          navigate('/'); // Redirect to login page if token validation fails
        }
      } else {
        navigate('/'); // Redirect to login if no token is found
      }
    };

    validateToken();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('Username'); // Optionally clear the username as well
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/Pocetna">
          <FontAwesomeIcon icon={faWarehouse} /> Skladište
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* You can place additional links or components here */}
          </Nav>
          <Nav className="ml-auto">
            {isLoggedIn ? (
              <>
                <Navbar.Text className="text-white me-3">
                  {userDetails.username ? `Trenutni račun: ${userDetails.username}` : 'Welcome'}
                </Navbar.Text>
                <Button variant="danger" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigacija;
