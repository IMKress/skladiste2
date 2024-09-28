import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Table, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { IzdatnicaArtikliModal } from './modals'; // Import modal

function Izdatnice() {
    const [artikli, setArtikli] = useState([]);
    const [jmjOptions, setJmjOptions] = useState([]);
    const [kategorijeOptions, setKategorijeOptions] = useState([]);
    const [selectedArtikl, setSelectedArtikl] = useState('');
    const [kolicina, setKolicina] = useState('');
    const [cijena, setCijena] = useState('');
    const [datumIzdatnice, setDatumIzdatnice] = useState(new Date());
    const [dodaniArtikli, setDodaniArtikli] = useState([]);
    const [ukupnaCijena, setUkupnaCijena] = useState(0);
    const [ukupniZbrojCijena, setUkupniZbrojCijena] = useState(0);
    const [dokumentId, setDokumentId] = useState('');
    const [raspolozivaKolicina, setRaspolozivaKolicina] = useState(0);
    const [prosjekCijena, setProsjekCijena] = useState(0);
    const [tipDokumenta, setTipDokumenta] = useState(''); // Add state for document type
    const [modalShow, setModalShow] = useState(false);

    const [userDetails, setUserDetails] = useState({ username: '', roles: [], UserId: "" });

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('Username');
        const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');
        const UserId = sessionStorage.getItem('UserId');

        if (token) {
            setUserDetails({ username, roles, UserId });
        }
    }, []);

    // Function to fetch last document ID
    const getLastDokId = async () => {
        const response = await axios.get('https://localhost:5001/api/home/joined_dokument_tip');
        const existingIds = response.data.map(item => item.dokumentId);
        return existingIds.length > 0 ? existingIds.slice(-1)[0] : 0;
    };

    // Fetch document ID on component mount
    useEffect(() => {
        const fetchLastId = async () => {
            const lastId = await getLastDokId();
            setDokumentId(lastId + 1);
        };

        fetchLastId();
    }, []);

    // Fetch articles and categories
    useEffect(() => {
        const fetchArtikli = async () => {
            try {
                const response = await axios({
                    method: 'get',
                    url: "https://localhost:5001/api/home/artikli_db",
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });
                setArtikli(response.data);
                const uniqueJmj = [...new Set(response.data.map(art => art.artiklJmj))];
                setJmjOptions(uniqueJmj);
            } catch (error) {
                console.error(error);
                alert("Greška prilikom učitavanja podataka");
            }
        };

        fetchArtikli();
    }, []);

    useEffect(() => {
        const fetchKategorije = async () => {
            try {
                const response = await axios({
                    method: 'get',
                    url: "https://localhost:5001/api/home/kategorije",
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });
                setKategorijeOptions(response.data);
            } catch (error) {
                console.error(error);
                alert("Greška prilikom učitavanja podataka");
            }
        };

        fetchKategorije();
    }, []);

    // Calculate the available quantity based on the document type
    useEffect(() => {
        const calculateRaspolozivaKolicina = async () => {
            if (selectedArtikl) {
                try {
                    const response = await axios.get(`https://localhost:5001/api/home/joined_artikls_db`);
                    const artikliData = response.data.filter(a => a.artiklId === parseInt(selectedArtikl));

                    let ukupnaKolicina = 0;
                    artikliData.forEach(artikl => {
                        if (artikl.tipDokumenta === 'Primka') {
                            ukupnaKolicina += artikl.kolicina;
                        } else if (artikl.tipDokumenta === 'Izdatnica') {
                            ukupnaKolicina -= artikl.kolicina;
                        }
                    });

                    setRaspolozivaKolicina(ukupnaKolicina);
                } catch (error) {
                    console.error(error);
                    alert("Greška prilikom učitavanja podataka");
                }
            }
        };

        calculateRaspolozivaKolicina();
    }, [selectedArtikl, tipDokumenta]);

    // Calculate the average price for the selected item based on receipts only
    useEffect(() => {
        const calculateProsjekCijena = async () => {
            if (selectedArtikl) {
                try {
                    const response = await axios.get(`https://localhost:5001/api/home/joined_artikls_db`);
                    const artikliData = response.data.filter(a => a.artiklId === parseInt(selectedArtikl) && a.tipDokumenta === 'Primka');

                    if (artikliData.length > 0) {
                        const totalCijena = artikliData.reduce((acc, artikl) => acc + artikl.cijena, 0);
                        setProsjekCijena(totalCijena / artikliData.length);
                    } else {
                        setProsjekCijena(0);
                    }
                } catch (error) {
                    console.error(error);
                    alert("Greška prilikom učitavanja podataka");
                }
            }
        };

        calculateProsjekCijena();
    }, [selectedArtikl]);

    useEffect(() => {
        if (kolicina && cijena) {
            if (kolicina > raspolozivaKolicina) {
                alert("Količina ne može biti veća od raspoložive količine.");
                setKolicina(raspolozivaKolicina);
            }
            setUkupnaCijena(kolicina * cijena);
        } else {
            setUkupnaCijena(0);
        }
    }, [kolicina, cijena, raspolozivaKolicina]);

    useEffect(() => {
        const zbrojCijena = dodaniArtikli.reduce((acc, artikl) => acc + artikl.ukupnaCijena, 0);
        setUkupniZbrojCijena(zbrojCijena);
    }, [dodaniArtikli]);

    const handleAddArtikl = () => {
        if (selectedArtikl && kolicina && cijena) {
            const artikl = artikli.find(a => a.artiklId === parseInt(selectedArtikl));
            const noviArtikl = {
                redniBroj: dodaniArtikli.length + 1,
                artiklId: artikl.artiklId,
                artiklNaziv: artikl.artiklNaziv,
                kolicina: kolicina,
                cijena: cijena,
                ukupnaCijena: kolicina * cijena
            };

            setDodaniArtikli([...dodaniArtikli, noviArtikl]);
            resetForm();
        }
    };

    const handleRemoveArtikl = (redniBroj) => {
        const noviArtikli = dodaniArtikli.filter(artikl => artikl.redniBroj !== redniBroj)
            .map((artikl, index) => ({
                ...artikl,
                redniBroj: index + 1
            }));
        setDodaniArtikli(noviArtikli);
    };

    const resetForm = () => {
        setSelectedArtikl('');
        setKolicina('');
        setCijena('');
        setUkupnaCijena(0);
    };

    const resetFormAfterAdd = async () => {
        setSelectedArtikl('');
        setKolicina('');
        setDodaniArtikli([]);
        setCijena('');
        setUkupnaCijena(0);
        const lastId = await getLastDokId();
        setDokumentId(lastId + 1);
        setDatumIzdatnice(new Date())
    };

    return (
        <Container className="mt-5">
            <Card className="form-card">
                <Card.Body>
                    <div className="text-center mb-3">
                        <h3>IZDATNICA: {dokumentId}</h3>
                    </div>
                    <h2 className="text-center">Kreiraj Izdatnicu</h2>
                    <Form>
                        <Form.Group controlId="artiklSelect">
                            <Form.Label>Odaberi Artikl</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedArtikl}
                                onChange={(e) => setSelectedArtikl(e.target.value)}
                            >
                                <option value="">Odaberi...</option>
                                {artikli.map((artikl) => (
                                    <option key={artikl.artiklId} value={artikl.artiklId}>
                                        {artikl.artiklNaziv} ({artikl.artiklJmj})
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="kolicinaInput">
                                    <Form.Label>Unesi Količinu</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Unesi količinu"
                                        value={kolicina}
                                        onChange={(e) => setKolicina(e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        Raspoloživa Količina: {raspolozivaKolicina}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="cijenaInput">
                                    <Form.Label>Unesi Cijenu</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Unesi cijenu"
                                        value={cijena}
                                        onChange={(e) => setCijena(e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        Prosjek Cijena: {prosjekCijena.toFixed(2)} €
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="ukupnaCijenaDisplay">
                                    <Form.Label>Ukupna Cijena</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={ukupnaCijena.toFixed(2)}
                                        readOnly
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-between mt-3">
                            <Button variant="primary" onClick={handleAddArtikl} className="mr-2">
                                Dodaj Artikl
                            </Button>
                            <Button variant="secondary" onClick={resetForm}>
                                Odustani
                            </Button>
                        </div>

                        <div className="d-flex justify-content-center mt-4">
                            <Button
                                variant="info"
                                onClick={() => setModalShow(true)}
                                disabled={dodaniArtikli.length === 0} // Disable if table is empty
                            >
                                Pregledaj artikle i napravi izdatnicu
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <h3 className="mt-4">Dodani Artikli</h3>
            <Table striped bordered hover variant="secondary">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Naziv Artikla</th>
                        <th>Količina</th>
                        <th>Cijena</th>
                        <th>Ukupna Cijena</th>
                        <th>/</th>
                    </tr>
                </thead>
                <tbody>
                    {dodaniArtikli.map((artikl, index) => (
                        <tr key={index}>
                            <td>{artikl.redniBroj}</td>
                            <td>{artikl.artiklId}</td>
                            <td>{artikl.artiklNaziv}</td>
                            <td>{artikl.kolicina}</td>
                            <td>{artikl.cijena}</td>
                            <td>{artikl.ukupnaCijena.toFixed(2)} €</td>
                            <td>
                                <Button variant="danger" onClick={() => handleRemoveArtikl(artikl.redniBroj)}>
                                    Obriši
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="5" className="text-right"><strong>Ukupno:</strong></td>
                        <td><strong>{ukupniZbrojCijena.toFixed(2)} €</strong></td>
                        <td></td>
                    </tr>
                </tbody>
            </Table>

            <div className="total-price-footer">
                <h4>Ukupan Zbroj Cijena: {ukupniZbrojCijena.toFixed(2)} €</h4>
            </div>

            <IzdatnicaArtikliModal
                show={modalShow}
                handleClose={() => setModalShow(false)}
                dodaniArtikli={dodaniArtikli}
                datumIzdatnice={datumIzdatnice}
                setDatumIzdatnice={setDatumIzdatnice} // Fix the prop name here
                dokumentId={dokumentId}
                resetForm={resetFormAfterAdd}
                UserId={userDetails.UserId}
            />
        </Container>
    );
}

export default Izdatnice;
