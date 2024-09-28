import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Pocetna() {
    const baseURL = "https://localhost:5001/api/home/artikli_db";
    const [artikli, setArtikli] = useState([]);
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userDetails, setUserDetails] = useState({ username: '', roles: [] });

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('Username');
        const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');

        if (token) {
            setIsAuthenticated(true);
            setUserDetails({ username, roles });
        }
    }, []);

    useEffect(() => {
        console.log(userDetails);
    }, [userDetails]); // This effect runs whenever userDetails is updated

    useEffect(() => {
        axios({
            method: 'get',
            url: baseURL,
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        }).then(response => {
            setArtikli(response.data);
        }).catch(error => {
            console.error(error);
            alert("Greška prilikom učitavanja podataka");
        });
    }, []);

    const handleButtonClickArtikli = () => {
        navigate('/stanja');
    };

    const handleButtonClickDokumenti = () => {
        navigate('/dokumenti'); // Ensure this path matches exactly
    };
    const handleButtonClickNovaPrimka = () => {
        navigate('/primka'); // Ensure this path matches exactly
    };
    const handleButtonClickNovaIzdatnica = () => {
        navigate('/Izdatnica'); // Ensure this path matches exactly
    }; const handleButtonClickStatistika = () => {
        navigate('/Statistika'); // Ensure this path matches exactly
    };
    const handleButtonClickZaposlenici = () => {
        navigate('/Zaposlenici'); // Ensure this path matches exactly
    };

    return (
        <div className="App">
            <header className="App-header">
                {isAuthenticated && userDetails.roles && (
                    <>
                        {userDetails.roles.includes('Administrator') && (
                            <>
                                <div className="button-container">
                                    <button className="large-button" onClick={handleButtonClickArtikli}>ARTIKLI</button>
                                    <button className="large-button" onClick={handleButtonClickDokumenti}>Dokumenti</button>
                                    <button className="large-button" onClick={handleButtonClickStatistika}>Statistika</button>
                                </div>
                                <div className="button-container">
                                    <button className="large-button" onClick={handleButtonClickNovaPrimka}>Nova Primka</button>
                                    <button className="large-button" onClick={handleButtonClickNovaIzdatnica}>Nova Izdatnica</button>
                                    <button className="large-button" onClick={handleButtonClickZaposlenici}>Zaposlenici</button>
                                </div>

                            </>
                        )}
                        {userDetails.roles.includes('Zaposlenik') && !userDetails.roles.includes('Administrator') && (
                            <>
                                <div className="button-container">
                                    <button className="large-button" onClick={handleButtonClickArtikli}>ARTIKLI</button>
                                    <button className="large-button" onClick={handleButtonClickDokumenti}>Dokumenti</button>
                                
                                </div>
                                <div className="button-container">
                                    <button className="large-button" onClick={handleButtonClickNovaPrimka}>Nova Primka</button>
                                    <button className="large-button" onClick={handleButtonClickNovaIzdatnica}>Nova Izdatnica</button>
                           
                                </div>
                            </>
                        )}
                    </>
                )}




            </header>
        </div>
    );
}



export default Pocetna;
