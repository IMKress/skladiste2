import React, { useState,useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';

function dodavanjeQuery(artiklArray) {
    const baseUrl = "https://localhost:5001/api/home/addArtikl";
    axios({
        method: 'post',
        url: baseUrl,
        headers: {},
        data: {
            nazivArtikla: artiklArray.nazivArtikla,
            jmj: artiklArray.jmj,
            cijena: parseFloat(artiklArray.cijena),
            kategorija: artiklArray.kategorija
        }
    }).then(response => {
        alert("Artikl je dodan");
        console.log(artiklArray)
    }).catch(error => {
        console.error(error);
        console.log(artiklArray);
    });
}

function NoviArtikl() {
    const [nazivArtikla, setNaziv] = useState('');
    const [jmj, setJmj] = useState('kg');
    const [kategorija, setKategorija] = useState('');
    const [cijena, setCijena] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const artArray = {
            nazivArtikla: nazivArtikla,
            jmj: jmj,
            kategorija: kategorija,
            cijena: cijena
        };
        dodavanjeQuery(artArray);
    };

    return (
        <div className="login-container">
            <Container className="form">
                <h2>Unos Artikla</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formItemName">
                        <Form.Label>Naziv artikla</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Unesite naziv artikla"
                            value={nazivArtikla}
                            onChange={(e) => setNaziv(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formUnit">
                        <Form.Label>Jedinična mjera</Form.Label>
                        <Form.Control
                            as="select"
                            value={jmj}
                            onChange={(e) => setJmj(e.target.value)}
                        >
                            <option value="kg">Kg</option>
                            <option value="g">g</option>
                            <option value="kom">kom</option>
                            <option value="m">m</option>
                            <option value="m³">m³</option>
                            <option value="m²">m²</option>

                            <option value="l">L</option>
                            <option value="ml">ml</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formCategory">
                        <Form.Label>Kategorija</Form.Label>
                        <Form.Control
                            as="select"
                            value={kategorija}
                            onChange={(e) => setKategorija(e.target.value)}
                        >
                            {/* Dodaj opcije za kategoriju ovde */}
                            <option value="">Izaberite kategoriju</option>
                            <option value="Građevinski materijal">Građevinski materijal</option>
                            <option value="Ventilacija">Ventilacija</option>
                            <option value="Izolacija">Izolacija</option>
                            <option value="Vodoinstalacije">Vodoinstalacije</option>
                            <option value="Građevinski pribor">Građevinski pribor</option>
                            <option value="Podne obloge">Podne obloge</option>
                            <option value="Boje i premazi">Boje i premazi</option>
                            <option value="Električni materija">Električni materijal</option>
                        </Form.Control>
                    </Form.Group>


                    <Form.Group controlId="formPrice">
                        <Form.Label>Cijena u eurima</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Unesite cijenu"
                            value={cijena}
                            onChange={(e) => setCijena(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="btn">
                        Submit
                    </Button>
                </Form>
            </Container>
        </div>
    );
}

export default NoviArtikl;
