import React, { useState, useEffect } from "react";
import axios from "axios";

function Ulazi() {
    const baseURL = "https://localhost:5001/api/home/artikli_ulaz_db";
    const [artikli, setArtikli] = useState([]);
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

    return (
        <table className="table">
            <thead>
                <tr>
                    <th scope="col">Sifra</th>
                    <th scope="col">kolicina</th>
                    <th scope="col">cijena</th>
                </tr>
            </thead>
            <tbody>
                {
                    artikli.map((art, index) => (
                        <tr key={index}>
                            <td>{art.id}</td>
                            <td>{art.kolicinaUlaz}</td>
                            <td>{art.iznosUlaz}</td>
                            
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default Ulazi;
