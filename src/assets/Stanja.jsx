import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Container } from 'react-bootstrap';
import axios from 'axios';
import { AddArtiklModal, InfoArtiklModal, AddKategorijaModal } from './modals';

function Stanja() {
    const [artikli, setArtikli] = useState([]);
    const [jmjOptions, setJmjOptions] = useState([]);
    const [kategorijeOptions, setKategorijeOptions] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showAddKategorijaModal, setShowAddKategorijaModal] = useState(false); // State for category modal
    const [selectedArtiklData, setSelectedArtiklData] = useState([]);
    const [selectedArtiklName, setSelectedArtiklName] = useState('');
    const [selectedArtiklKolicinaUlaz, setselectedArtiklKolicinaUlaz] = useState('');
    const [selectedArtiklKolicinaIzlaz, setselectedArtiklKolicinaIzlaz] = useState('');
    const [selectedArtiklIznosUlaz, setselectedArtiklIznosUlaz] = useState('');
    const [selectedArtiklIznosIzlaz, setselectedArtiklIznosIzlaz] = useState('');
    const [selectedArtiklJMJ, setselectedArtiklJMJ] = useState('');
    const [selectedArtiklKategorija, setselectedArtiklKategorija] = useState('');
    const [selectedArtiklId, setSelectedArtiklId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userDetails, setUserDetails] = useState({ username: '', roles: [] });

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('Username');
        const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');

        if (token) {
            setUserDetails({ username, roles });
        }
    }, []);


    // Fetch Data logic (as you had before)
    const fetchData = async () => {
        try {
            const [artikliResponse, kategorijeResponse, joinedArtikliResponse] = await Promise.all([
                axios.get('https://localhost:5001/api/home/artikli_db', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }),
                axios.get('https://localhost:5001/api/home/kategorije', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }),
                axios.get('https://localhost:5001/api/home/joined_artikls_db', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }),
            ]);

            const artikliData = artikliResponse.data;
            const kategorijeData = kategorijeResponse.data;
            const joinedArtikliData = joinedArtikliResponse.data;

            setArtikli(artikliData);
            setKategorijeOptions(kategorijeData);

            const artiklKolicine = joinedArtikliData.reduce((acc, curr) => {
                if (!acc[curr.artiklId]) {
                    acc[curr.artiklId] = { ulaz: 0, izlaz: 0, iznosUlaz: 0, iznosIzlaz: 0, cijena: curr.cijena };
                }
                if (curr.tipDokumenta === 'Primka') {
                    acc[curr.artiklId].ulaz += curr.kolicina;
                    acc[curr.artiklId].iznosUlaz += curr.ukupnaCijena;
                } else if (curr.tipDokumenta === 'Izdatnica') {
                    acc[curr.artiklId].izlaz += curr.kolicina;
                    acc[curr.artiklId].iznosIzlaz += curr.ukupnaCijena;
                }
                return acc;
            }, {});

            setArtikli((prevArtikli) =>
                prevArtikli.map((art) => ({
                    ...art,
                    kolicinaUlaz: artiklKolicine[art.artiklId]?.ulaz || 0,
                    kolicinaIzlaz: artiklKolicine[art.artiklId]?.izlaz || 0,
                    iznosUlaz: artiklKolicine[art.artiklId]?.iznosUlaz || 0,
                    iznosIzlaz: artiklKolicine[art.artiklId]?.iznosIzlaz || 0,
                    cijena: artiklKolicine[art.artiklId]?.cijena || 0,
                    stanje: (artiklKolicine[art.artiklId]?.ulaz || 0) - (artiklKolicine[art.artiklId]?.izlaz || 0),
                    stanjeCijena: (artiklKolicine[art.artiklId]?.cijena || 0) * ((artiklKolicine[art.artiklId]?.ulaz || 0) - (artiklKolicine[art.artiklId]?.izlaz || 0))
                }))
            );

            const uniqueJmj = [...new Set(artikliData.map((art) => art.artiklJmj))];
            setJmjOptions(uniqueJmj);

        } catch (error) {
            console.error(error);
            alert('Greška prilikom učitavanja podataka');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!showInfoModal) {
            fetchData();
        }
    }, [showInfoModal]);

    // Add Kategorija handler
    const handleAddKategorija = async (kategorijaNaziv) => {
        try {
            await axios.post(
                'https://localhost:5001/api/home/add_kategorija',
                { kategorijaNaziv },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }
            );
            alert(`Kategorija "${kategorijaNaziv}" je uspješno dodana.`);
            setShowAddKategorijaModal(false); // Close the modal after success
            fetchData(); // Refresh data to show new category
        } catch (error) {
            console.error('Greška prilikom dodavanja kategorije:', error);
            alert('Greška prilikom dodavanja kategorije');
        }
    };

    const handleAddArtikl = (newArtikl) => {
        setArtikli([...artikli, { ...newArtikl, artiklId: artikli.length + 1001 }]);
    };

    const handleShowInfo = async (artiklId, kolicinaUlaz, kolicinaIzlaz, iznosUlaz, iznosIzlaz, artiklJmj, artiklKategorija) => {
        try {
            const response = await axios.get('https://localhost:5001/api/home/joined_artikls_db', {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            const filteredArtiklData = response.data.filter((item) => item.artiklId === artiklId);
            const selectedArtikl = artikli.find(art => art.artiklId === artiklId);

            setSelectedArtiklData(filteredArtiklData);
            setSelectedArtiklName(selectedArtikl ? selectedArtikl.artiklNaziv : '');
            setselectedArtiklKolicinaUlaz(kolicinaUlaz);
            setselectedArtiklKolicinaIzlaz(kolicinaIzlaz);
            setselectedArtiklIznosUlaz(iznosUlaz);
            setselectedArtiklIznosIzlaz(iznosIzlaz);
            setSelectedArtiklId(artiklId);
            setselectedArtiklJMJ(artiklJmj);
            setselectedArtiklKategorija(artiklKategorija);
            setShowInfoModal(true);
        } catch (error) {
            console.error(error);
            alert('Greška prilikom učitavanja podataka');
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDeleteArtikl = async (artiklId) => {
        try {
            await axios.delete(`https://localhost:5001/api/home/delete_artikl/${artiklId}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            alert(`Artikl with ID ${artiklId} has been successfully deleted.`);
            setShowInfoModal(false); // Close the modal
            fetchData(); // Refresh the list after deletion
        } catch (error) {
            console.error("Greška prilikom brisanja artikla:", error);
            alert("Greška prilikom brisanja artikla");
        }
    };

    const filteredArtikli = artikli.filter((art) =>
        art.artiklId.toString().includes(searchTerm) ||
        art.artiklNaziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.artiklJmj.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.kategorijaNaziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.kolicinaUlaz !== undefined && art.kolicinaUlaz.toString().includes(searchTerm))
    );

    const stanjaFix = (stanje) => {
        return stanje ? stanje : 0;
    };

    return (
        <Container>
            {userDetails.roles.includes('Administrator') && (
                <>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddModal(true)}
                        className="small-button-Stanja"
                        size="sm"
                    >
                        Dodaj Artikl
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddKategorijaModal(true)}
                        className="small-button-Stanja ml-2"
                        size="sm"
                        style={{ display: 'inline-block', marginLeft: '10px' }} // Add this for visibility check
                    >
                        Dodaj Kategoriju
                    </Button>

                </>
            )}


            {/* Search Input */}
            <Form.Group controlId="searchArtikl" className="mt-3" style={{ width: '100%' }}>
                <Form.Control
                    type="text"
                    placeholder="Pretraži po Šifri, Nazivu, Jmj, Kategoriji ili Količini..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ width: '100%' }}
                />
            </Form.Group>

            <Table className="centered-table mt-3" striped bordered hover variant="dark" style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Šifra</th>
                        <th>Naziv artikla</th>
                        <th>Jedinična mjerna jedinica</th>
                        <th>Kategorija</th>
                        <th>Stanje</th> {/* New "Stanje" column */}
                        <th>Stanje Cijena</th> {/* Added Stanje Cijena column */}
                        <th>Info</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredArtikli.map((art) => (
                        <tr key={art.artiklId}>
                            <td>{art.artiklId}</td>
                            <td>{art.artiklNaziv}</td>
                            <td>{art.artiklJmj}</td>
                            <td>{art.kategorijaNaziv}</td>
                            <td>{art.stanje}</td> {/* Display calculated "Stanje" */}
                            <td>{stanjaFix(art.stanjeCijena).toFixed(2)} kn</td>
                            <td>
                                <Button
                                    variant="info"
                                    onClick={() => handleShowInfo(art.artiklId, art.kolicinaUlaz, art.kolicinaIzlaz, art.iznosUlaz, art.iznosIzlaz, art.artiklJmj, art.kategorijaNaziv)}
                                    size="sm"

                                >
                                    Prikaz
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <AddArtiklModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                handleSave={handleAddArtikl}
                jmjOptions={jmjOptions}
                kategorijeOptions={kategorijeOptions}
            />

            <InfoArtiklModal
                show={showInfoModal}
                handleClose={() => setShowInfoModal(false)}
                artiklData={selectedArtiklData}
                artiklName={selectedArtiklName}
                kolicinaUlaz={selectedArtiklKolicinaUlaz}
                kolicinaIzlaz={selectedArtiklKolicinaIzlaz}
                iznosUlaz={selectedArtiklIznosUlaz}
                iznosIzlaz={selectedArtiklIznosIzlaz}
                artiklId={selectedArtiklId}
                handleDeleteArtikl={handleDeleteArtikl}
                jmjOptions={jmjOptions}
                kategorijeOptions={kategorijeOptions}
                artJmj={selectedArtiklJMJ}
                artKat={selectedArtiklKategorija}
            />

            <AddKategorijaModal
                show={showAddKategorijaModal} // Modal visibility state
                handleClose={() => setShowAddKategorijaModal(false)} // Close handler
                handleSave={handleAddKategorija} // Save handler
            />
        </Container>
    );
}

export default Stanja;
