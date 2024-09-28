import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, ModalHeader } from 'react-bootstrap'; // Import Form
import DatePicker from 'react-datepicker';
import axios from 'axios';
import format from 'date-fns/format';



// Modal za dodavanje artikla
export function AddArtiklModal({ show, handleClose, handleSave, jmjOptions, kategorijeOptions }) {
    const [newArtikl, setNewArtikl] = useState({
        artiklNaziv: '',
        artiklJmj: '',
        novaJmj: '',  // Polje za unos nove JMJ
        kategorijaId: ''
    });

    // Funkcija za promjenu stanja unutar forme
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewArtikl(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Funkcija za spremanje novog artikla
    const handleSaveClick = async () => {
        try {
            await axios.post('https://localhost:5001/api/home/add_artikl', {
                ArtiklNaziv: newArtikl.artiklNaziv,
                ArtiklJmj: newArtikl.artiklJmj === "other" ? newArtikl.novaJmj : newArtikl.artiklJmj, // Koristi novu JMJ ako je odabrana
                KategorijaId: parseInt(newArtikl.kategorijaId)
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            handleSave(newArtikl);
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Greška prilikom dodavanja artikla');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Dodaj novi Artikl</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formArtiklNaziv">
                        <Form.Label>Naziv artikla</Form.Label>
                        <Form.Control
                            type="text"
                            name="artiklNaziv"
                            value={newArtikl.artiklNaziv}
                            onChange={handleInputChange}
                            placeholder="Unesite naziv artikla"
                        />
                    </Form.Group>

                    <Form.Group controlId="formArtiklJmj" className="mt-3">
                        <Form.Label>Jedinicna mjerna jedinica (JMJ)</Form.Label>
                        <Form.Control
                            as="select"
                            name="artiklJmj"
                            value={newArtikl.artiklJmj}
                            onChange={handleInputChange}
                        >
                            <option value="">Odaberite JMJ</option>
                            {jmjOptions.map((jmj, index) => (
                                <option key={index} value={jmj}>
                                    {jmj}
                                </option>
                            ))}
                            <option value="other">Unesite novu JMJ</option>
                        </Form.Control>
                        {newArtikl.artiklJmj === "other" && (
                            <Form.Control
                                type="text"
                                name="novaJmj"
                                value={newArtikl.novaJmj}
                                onChange={handleInputChange}
                                placeholder="Unesite novu JMJ"
                                className="mt-2"
                            />
                        )}
                    </Form.Group>

                    <Form.Group controlId="formKategorijaId" className="mt-3">
                        <Form.Label>Kategorija</Form.Label>
                        <Form.Control
                            as="select"
                            name="kategorijaId"
                            value={newArtikl.kategorijaId}
                            onChange={handleInputChange}
                        >
                            <option value="">Odaberite kategoriju</option>
                            {kategorijeOptions.map((kategorija, index) => (
                                <option key={index} value={kategorija.kategorijaId}>
                                    {kategorija.kategorijaNaziv}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Odustani
                </Button>
                <Button variant="primary" onClick={handleSaveClick}>
                    Dodaj Artikl
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function AddKategorijaModal({ show, handleClose, handleSave }) {
    const [kategorijaNaziv, setKategorijaNaziv] = useState('');

    const handleAdd = () => {
        // Send the entered category name to the parent component's handler
        handleSave(kategorijaNaziv);
        setKategorijaNaziv(''); // Clear the input after saving
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Dodaj Kategoriju</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formKategorijaNaziv">
                        <Form.Label>Naziv Kategorije</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Unesi naziv kategorije"
                            value={kategorijaNaziv}
                            onChange={(e) => setKategorijaNaziv(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Odustani
                </Button>
                <Button variant="primary" onClick={handleAdd}>
                    Dodaj
                </Button>
            </Modal.Footer>
        </Modal>
    );
}


// InfoArtiklModal component


// Main InfoArtiklModal component
export function InfoArtiklModal({ show, handleClose, artiklData, artiklName, kolicinaUlaz, kolicinaIzlaz, iznosUlaz, iznosIzlaz, artiklId, jmjOptions, kategorijeOptions, artJmj, artKat }) {
    // State to store the search term
    const [searchTerm, setSearchTerm] = useState('');

    // State to control the Edit Modal visibility
    const [showEditModal, setShowEditModal] = useState(false);

    // Function to handle search term input
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        console.log(jmjOptions)
    };
    const [userDetails, setUserDetails] = useState({ username: '', roles: [] });

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('Username');
        const roles = JSON.parse(sessionStorage.getItem('Role') || '[]');

        if (token) {
            setUserDetails({ username, roles });
        }
    }, []);
    

    const filteredArtiklData = artiklData.filter((item) => {
        return (
            item.dokumentId.toString().includes(searchTerm) ||
            new Date(item.datumDokumenta).toLocaleDateString().includes(searchTerm) ||
            item.tipDokumenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kolicina.toString().includes(searchTerm) ||
            item.trenutnaKolicina?.toString().includes(searchTerm) || 
            item.cijena.toFixed(2).includes(searchTerm)
        );
    });

    const handleShowEditModal = () => setShowEditModal(true);

    const handleCloseEditModal = () => setShowEditModal(false);
    const handleDeleteArtikl = () => {

        axios.delete(`https://localhost:5001/api/home/delete_artikl/${artiklId}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        })
            .then(() => {
                alert(`Artikl with ID ${artiklId} has been successfully deleted.`);
            })
            .catch(error => {
                console.error("Greška prilikom brisanja artikla:", error);
                alert("Greška prilikom brisanja artikla");
            });
    };
    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalji Artikla: {artiklName}</Modal.Title>

                </Modal.Header>
                <Modal.Body>
                    {userDetails.roles.includes('Administrator') && (
                        <>
                            <Button
                                variant="danger"
                                onClick={handleDeleteArtikl}
                                style={{ display: 'inline-block', marginRight: '10px', marginBottom: '10px' }}
                            >
                                Obriši
                            </Button>

                        </>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleShowEditModal}
                        style={{ display: 'inline-block', marginRight: '10px', marginBottom: '10px' }}
                    >
                        Edit
                    </Button>
                    {/* Search Input */}
                    <Form.Group>
                        <Form.Label>Naziv Artikla: {artiklName}</Form.Label>

                    </Form.Group>


                    {/* Data Labels in New Rows */}
                    <Form.Group > {/* mb-3 adds margin-bottom */}
                        <Form.Label>Količina ulaz: {kolicinaUlaz}</Form.Label>
                    </Form.Group>

                    <Form.Group >
                        <Form.Label>Količina izlaz: {kolicinaIzlaz}</Form.Label>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Iznos ulaz: {iznosUlaz}</Form.Label>
                    </Form.Group>

                    <Form.Group >
                        <Form.Label>Iznos izlaz: {iznosIzlaz}</Form.Label>
                    </Form.Group>
                    <Form.Group controlId="searchArtikl">

                        <Form.Label>Pretraži</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Pretraži po Dokument ID, Datum, Tip, Količina..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </Form.Group>

                    {/* Table */}
                    <Table striped bordered hover className="mt-3">
                        <thead>
                            <tr>
                                <th>Dokument ID</th>
                                <th>Datum Dokumenta</th>
                                <th>Tip Dokumenta</th>
                                <th>Količina</th>
                                <th>Trenutna Količina</th>
                                <th>Cijena</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArtiklData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.dokumentId}</td>
                                    <td>{new Date(item.datumDokumenta).toLocaleDateString()}</td>
                                    <td>{item.tipDokumenta}</td>
                                    <td>{item.kolicina}</td>
                                    <td>{item.tipDokumenta === "Primka" ? item.trenutnaKolicina : ""}</td>
                                    <td>{item.cijena.toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Zatvori
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Render the Edit Modal */}
            {showEditModal && (
                <EditModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal}
                    jmjOptions={jmjOptions}
                    kategorijeOptions={kategorijeOptions}
                    artiklName={artiklName}
                    artJmj={artJmj}
                    artKat={artKat}
                    artiklId={artiklId}
                // Pass any required props to EditModal here
                />
            )}
        </>
    );
}



function EditModal({ show, handleClose, jmjOptions, artiklName, artJmj, artKat, artiklId }) {
    // States for form fields
    const [newName, setNewName] = useState('');
    const [jmj, setJmj] = useState('');
    const [novaJmj, setNovaJmj] = useState('');
    const [category, setCategory] = useState('');
    const [kategorijeOptions, setKategorijeOptions] = useState([]);

    // Fetch categories when the modal opens
    useEffect(() => {
        axios.get('https://localhost:5001/api/home/kategorije')
            .then(response => {
                setKategorijeOptions(response.data);

                // Set default category based on artKat
                const defaultCategory = response.data.find(cat => cat.kategorijaNaziv === artKat);
                if (defaultCategory) {
                    setCategory(defaultCategory.kategorijaId);
                } else {
                    setCategory(''); // Or handle case where category is not found
                }
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, [artKat]);

    // Reset states when modal opens
    useEffect(() => {
        setNewName(artiklName || '');
        setJmj(artJmj || '');
        setNovaJmj('');
        // Ensure category is updated based on fetched options
    }, [show, artiklName, artJmj, artKat]);

    const handleJmjChange = (e) => {
        const value = e.target.value;
        setJmj(value);
        if (value === "other") {
            setNovaJmj('');
        }
    };

    const handleSaveChanges = async () => {
        // Ensure newName is not empty
        if (!newName.trim()) {
            alert("Naziv artikla ne može biti prazan");
            return;
        }

        // Determine final JMJ value
        const finalJmj = jmj === "other" ? novaJmj : jmj;

        // Prepare data to send
        const dataToUpdate = {
            ArtiklNaziv: newName,
            ArtiklJmj: finalJmj || artJmj,
            KategorijaId: category ? parseInt(category) : parseInt(artKat)
        };

        // Check if there's any change before making API call
        if (dataToUpdate.ArtiklNaziv === artiklName &&
            dataToUpdate.ArtiklJmj === artJmj &&
            dataToUpdate.KategorijaId === parseInt(artKat)) {
            alert('Nema izmjena');
            return;
        }

        try {
            await axios.put(`https://localhost:5001/api/home/update_artikl/${artiklId}`, dataToUpdate, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            console.log("Saved Changes:", dataToUpdate);
            handleClose(); // Close the modal
        } catch (error) {
            console.error(error);
            alert('Greška prilikom spremanja izmjena');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Artikl</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="editNewName">
                        <Form.Label>Novo ime:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={artiklName}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="editJmj" className="mt-3">
                        <Form.Label>JMJ (Jedinična Mjerna Jedinica)</Form.Label>
                        <Form.Control
                            as="select"
                            value={jmj}
                            onChange={handleJmjChange}
                        >
                            <option value="">{artJmj}</option>
                            {jmjOptions.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                            <option value="other">Unesi novu JMJ</option>
                        </Form.Control>
                        {jmj === "other" && (
                            <Form.Control
                                type="text"
                                value={novaJmj}
                                onChange={(e) => setNovaJmj(e.target.value)}
                                placeholder="Unesi novu JMJ"
                                className="mt-2"
                            />
                        )}
                    </Form.Group>

                    <Form.Group controlId="editCategory" className="mt-3">
                        <Form.Label>Kategorija</Form.Label>
                        <Form.Control
                            as="select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Odaberite kategoriju</option>
                            {kategorijeOptions.map((option, index) => (
                                <option key={index} value={option.kategorijaId}>
                                    {option.kategorijaNaziv}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

// DatumArtikliModal component
export const DatumArtikliModal = ({ show, handleClose, dokumentId, datumPrimke, setDatumPrimke, dodaniArtikli, resetForm, UserId }) => {
    const ukupniZbrojCijena = dodaniArtikli.reduce((acc, artikl) => acc + artikl.ukupnaCijena, 0);



    // Helper function to format date for API as mm.dd.yyyy
    const formatDateForAPI = (date) => {
        return format(date, 'MM.dd.yyyy');
    };

    const handleCreatePrimka = async () => {
        const formattedDate = formatDateForAPI(datumPrimke); // Format date as MM.dd.yyyy for API

        const dokumentBody = {
            DokumentId: 0,
            DatumDokumenta: formattedDate, // Use the formatted date here
            TipDokumentaId: 1, // Assuming a fixed TipDokumentaId; change if needed
            ZaposlenikId: UserId
        };
        try {
            const createDokumentResponse = await axios.post('https://localhost:5001/api/home/add_dokument', dokumentBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (createDokumentResponse.status === 200) {
                for (const artikl of dodaniArtikli) {
                    const artiklDokBody = {
                        id: 0,
                        DokumentId: dokumentId, // Use the ID of the created dokument
                        RbArtikla: artikl.redniBroj,
                        Kolicina: artikl.kolicina,
                        Cijena: artikl.cijena,
                        UkupnaCijena: artikl.ukupnaCijena,
                        ArtiklId: artikl.artiklId,
                        TrenutnaKolicina: artikl.kolicina,
                    };

                    const createArtiklDokResponse = await axios.post('https://localhost:5001/api/home/add_artDok', artiklDokBody, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (createArtiklDokResponse.status !== 200) {
                        alert('Greška prilikom stvaranja artikl dokumenta!');
                        return;
                    }
                }

                alert('Primka i artikli uspješno kreirani!');
                resetForm();
                handleClose();
            } else {
                alert('Greška prilikom stvaranja primke!');
            }
        } catch (error) {
            alert('Došlo je do greške!');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Unesi Datum Primke i Artikle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formDatumPrimke">
                    <Form.Label>Datum Primke</Form.Label>
                    <DatePicker
                        selected={datumPrimke}
                        onChange={(date) => setDatumPrimke(date)}
                        dateFormat="dd.MM.yyyy" // Display format (dd.MM.yyyy)
                        className="form-control"
                    />
                </Form.Group>
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Artikl ID</th>
                            <th>Naziv Artikla</th>
                            <th>Količina</th>
                            <th>Cijena</th>
                            <th>Ukupna Cijena</th>
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
                                <td>{artikl.ukupnaCijena.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="5" className="text-right"><strong>Ukupno:</strong></td>
                            <td><strong>{ukupniZbrojCijena.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zatvori
                </Button>
                <Button variant="primary" onClick={handleCreatePrimka}>
                    Kreiraj Primku
                </Button>
            </Modal.Footer>
        </Modal>
    );
};



export function DokumentInfoModal({ show, handleClose, dokument }) {
    const [artikli, setArtikli] = useState([]);
    const [username, setUsername] = useState(''); // Add state to store username

    useEffect(() => {
        if (dokument && dokument.dokumentId) {
            // Fetch artikli based on dokumentId
            axios({
                method: 'get',
                url: `https://localhost:5001/api/home/joined_artikls_db`,
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            })
                .then(response => {
                    const filteredArtikli = response.data.filter(art => art.dokumentId === dokument.dokumentId);
                    setArtikli(filteredArtikli);
                })
                .catch(error => {
                    console.error("Greška prilikom učitavanja artikala:", error);
                    alert("Greška prilikom učitavanja artikala");
                });

            // Fetch the username based on zaposlenikId
            if (dokument.zaposlenikId) {
                axios({
                    method: 'get',
                    url: `https://localhost:5001/api/home/username/${dokument.zaposlenikId}`,
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                })
                    .then(response => {
                        setUsername(response.data.userName); // Set the username from the response
                    })
                    .catch(error => {
                        console.error("Greška prilikom učitavanja korisničkog imena:", error);
                        alert("Greška prilikom učitavanja korisničkog imena");
                    });
            }
        }
    }, [dokument]);

    const ukupnaKolicina = artikli.reduce((acc, art) => acc + art.kolicina, 0);
    const ukupnaCijena = artikli.reduce((acc, art) => acc + art.ukupnaCijena, 0);
    const ukupnaTrenutnaCijena = artikli.reduce((acc, art) => acc + (art.trenutnaKolicina * art.cijena), 0);

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Detalji Dokumenta</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <p><strong>Dokument ID:</strong> {dokument.dokumentId}</p>
                <p><strong>Tip Dokumenta:</strong> {dokument.tipDokumenta}</p>
                <p><strong>Datum Dokumenta:</strong> {new Date(dokument.datumDokumenta).toLocaleDateString()}</p>

                {/* Display the username instead of zaposlenikId */}
                <p><strong>Dokument napravio:</strong> {username || dokument.zaposlenikId}</p>

                <h5 className="mt-4">Artikli u dokumentu:</h5>
                {artikli.length > 0 ? (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Artikl ID</th>
                                <th>Naziv Artikla</th>
                                <th>JMJ</th>
                                <th>Količina</th>
                                <th>Cijena  (€)</th>
                                <th>Ukupna Cijena  (€)</th>
                                {dokument.tipDokumenta === 'Primka' && (
                                    <>
                                        <th>Trenutna Količina</th>
                                        <th>Trenutna Cijena  (€)</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {artikli.map((artikl, index) => (
                                <tr key={index}>
                                    <td>{artikl.artiklId}</td>
                                    <td>{artikl.artiklNaziv}</td>
                                    <td>{artikl.artiklJmj}</td>
                                    <td>{artikl.kolicina}</td>
                                    <td>{artikl.cijena.toFixed(2)}</td>
                                    <td>{artikl.ukupnaCijena.toFixed(2)}</td>
                                    {dokument.tipDokumenta === 'Primka' && (
                                        <>
                                            <td>{artikl.trenutnaKolicina}</td>
                                            <td>{(artikl.trenutnaKolicina * artikl.cijena).toFixed(2)}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={dokument.tipDokumenta === 'Primka' ? 5 : 4}><strong>Ukupno:</strong></td>
                                <td><strong>{ukupnaKolicina}</strong></td>
                                <td><strong>{ukupnaCijena.toFixed(2)} €</strong></td>
                                {dokument.tipDokumenta === 'Primka' && (
                                    <>

                                        <td><strong>{ukupnaTrenutnaCijena.toFixed(2)} €</strong></td>
                                    </>
                                )}
                            </tr>
                        </tbody>
                    </Table>
                ) : (
                    <p>Nema artikala za ovaj dokument.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zatvori
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export const IzdatnicaArtikliModal = ({ show, handleClose, dodaniArtikli, datumIzdatnice, setDatumIzdatnice, dokumentId, resetForm, UserId }) => {
    const ukupniZbrojCijena = dodaniArtikli.reduce((acc, artikl) => acc + artikl.ukupnaCijena, 0);

    // Helper function to format date for API as MM.dd.yyyy
    const formatDateForAPI = (date) => {
        return format(date, 'MM.dd.yyyy');
    };

    const handleButtonClick = () => {
        FIFOalg();
        handleCreateIzdatnica();
    };

    const handleCreateIzdatnica = async () => {
        const formattedDate = formatDateForAPI(datumIzdatnice); // Format date as MM.dd.yyyy for API

        const dokumentBody = {
            DokumentId: 0,
            DatumDokumenta: formattedDate, // Use the formatted date here
            TipDokumentaId: 2,
            ZaposlenikId: UserId
        };

        try {
            const createDokumentResponse = await axios.post('https://localhost:5001/api/home/add_dokument', dokumentBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (createDokumentResponse.status === 200) {
                // Create artikl documents
                for (const artikl of dodaniArtikli) {
                    const artiklDokBody = {
                        id: 0,
                        DokumentId: dokumentId, // Use the ID of the created dokument
                        RbArtikla: artikl.redniBroj,
                        Kolicina: artikl.kolicina,
                        Cijena: artikl.cijena,
                        UkupnaCijena: artikl.ukupnaCijena,
                        ArtiklId: artikl.artiklId,
                        TrenutnaKolicina: 0,
                    };

                    const createArtiklDokResponse = await axios.post('https://localhost:5001/api/home/add_artDok', artiklDokBody, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (createArtiklDokResponse.status !== 200) {
                        console.error('Error creating artikl dokument', createArtiklDokResponse.data);
                        alert('Greška prilikom stvaranja artikl dokumenta!');
                        return;
                    }
                }

                alert('Izdatnica i artikli uspješno kreirani!');
                resetForm();
                handleClose();
            } else {
                console.error('Error creating dokument', createDokumentResponse.data);
                alert('Greška prilikom stvaranja izdatnice!');
            }
        } catch (error) {
            console.error('Error during API calls', error);
            alert('Došlo je do greške!');
        }
    };

    // Function to update the quantity
    async function updateTrenutnaKolicina(artiklId, dokumentId, newKolicina) {
        try {
            const response = await axios.post('https://localhost:5001/api/home/UpdateTrenutnaKolicina', {
                ArtiklId: artiklId,
                DokumentId: dokumentId,
                NewKolicina: newKolicina
            });

            console.log('Success:', response.data);
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    // FIFO Algorithm function
    const FIFOalg = () => {
        dodaniArtikli.forEach(art => {
            axios.get(`https://localhost:5001/api/home/FIFO_list/${art.artiklId}`)
                .then(response => {
                    const dataList = response.data;
                    let remainingQuantity = art.kolicina; // Quantity we need to deduct

                    for (let i = 0; i < dataList.length && remainingQuantity > 0; i++) {
                        let stockEntry = dataList[i];

                        if (stockEntry.trenutnaKolicina >= remainingQuantity) {
                            // Subtract the needed quantity from this stock entry
                            stockEntry.trenutnaKolicina -= remainingQuantity;
                            remainingQuantity = 0; // All quantity has been deducted
                        } else {
                            // Deduct whatever is left in this stock entry and continue
                            remainingQuantity -= stockEntry.trenutnaKolicina;
                            stockEntry.trenutnaKolicina = 0; // Deplete this stock entry
                        }
                    }

                    // Update each stock entry with the new quantity
                    dataList.forEach(stockEntry => {
                        updateTrenutnaKolicina(stockEntry.artiklId, stockEntry.dokumentId, stockEntry.trenutnaKolicina);
                    });

                    if (remainingQuantity > 0) {
                        console.warn(`Not enough stock to fulfill ${art.artiklNaziv} (ID: ${art.artiklId}). Remaining: ${remainingQuantity}`);
                        alert(`Nedovoljna količina za artikl ${art.artiklNaziv}. Preostalo za izdat: ${remainingQuantity}`);
                    }
                })
                .catch(error => {
                    console.error('Error fetching FIFO list:', error);
                });
        });
    };


    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Izdatnica Artikli Modal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formDatumIzdatnice">
                    <Form.Label>Datum Izdatnice</Form.Label>
                    <DatePicker
                        selected={datumIzdatnice}
                        onChange={(date) => setDatumIzdatnice(date)}
                        dateFormat="dd.MM.yyyy" // Display format (dd.MM.yyyy)
                        className="form-control"
                    />
                </Form.Group>
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Artikl ID</th>
                            <th>Naziv Artikla</th>
                            <th>Količina</th>
                            <th>Cijena</th>
                            <th>Ukupna Cijena</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dodaniArtikli.map((artikl) => (
                            <tr key={artikl.redniBroj}>
                                <td>{artikl.redniBroj}</td>
                                <td>{artikl.artiklId}</td>
                                <td>{artikl.artiklNaziv}</td>
                                <td>{artikl.kolicina}</td>
                                <td>{artikl.cijena}</td>
                                <td>{artikl.ukupnaCijena.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="5" className="text-right"><strong>Ukupno:</strong></td>
                            <td><strong>{ukupniZbrojCijena.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zatvori
                </Button>
                <Button variant="primary" onClick={handleButtonClick}>
                    Napravi izdatnicu
                </Button>
            </Modal.Footer>
        </Modal>
    );
};



export function InfoModal({ show, handleClose, userId, onUpdate }) {
    const [editedUserName, setEditedUserName] = useState('');
    const [editedFirstName, setEditedFirstName] = useState('');
    const [editedLastName, setEditedLastName] = useState('');
    const [originalUserName, setOriginalUserName] = useState('');
    const [originalFirstName, setOriginalFirstName] = useState('');
    const [originalLastName, setOriginalLastName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [documents, setDocuments] = useState([]);

    // Fetch user details when modal opens
    useEffect(() => {
        if (show && userId) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`https://localhost:5001/api/home/username/${userId}`);
                    const { userName, firstName, lastName } = response.data;
                    setOriginalUserName(userName);
                    setOriginalFirstName(firstName);
                    setOriginalLastName(lastName);
                    setEditedUserName(userName);
                    setEditedFirstName(firstName);
                    setEditedLastName(lastName);
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            };

            const fetchDocuments = async () => {
                try {
                    const response = await axios.get('https://localhost:5001/api/home/joined_dokument_tip');
                    const userDocuments = response.data.filter(doc => doc.zaposlenikId === userId);
                    setDocuments(userDocuments);
                } catch (error) {
                    console.error('Error fetching documents:', error);
                }
            };

            fetchUserDetails();
            fetchDocuments();
        } else {
            // Reset state when modal is closed
            setEditedUserName('');
            setEditedFirstName('');
            setEditedLastName('');
            setIsEditing(false);
            setDocuments([]);
        }
    }, [show, userId]);

    // Handle API call to update user
    const handleEditUser = async () => {
        try {
            const response = await axios.put(`https://localhost:5001/api/home/update-user/${userId}`, {
                FirstName: editedFirstName || originalFirstName,
                LastName: editedLastName || originalLastName,
                UserName: editedUserName || originalUserName
            });

            if (response.status === 200) {
                alert("User updated successfully!");
                onUpdate();  // To refresh data after update
                handleClose();
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    };

    // Handle API call to delete user
    const handleDeleteUser = async () => {
        try {
            const response = await axios.delete(`https://localhost:5001/api/home/delete-user/${userId}`);
            if (response.status === 200) {
                alert("User deleted successfully!");
                onUpdate();  // To refresh data after deletion
                handleClose();
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} onExited={() => setIsEditing(false)}>
            <Modal.Header closeButton>
                <Modal.Title>User Info</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isEditing ? (
                    <Form>
                        <Form.Group controlId="editUserName">
                            <Form.Label>User Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editedUserName}
                                placeholder={originalUserName}
                                onChange={(e) => setEditedUserName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="editFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editedFirstName}
                                placeholder={originalFirstName}
                                onChange={(e) => setEditedFirstName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="editLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editedLastName}
                                placeholder={originalLastName}
                                onChange={(e) => setEditedLastName(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                ) : (
                    <div>
                        <p><strong>User Name:</strong> {originalUserName}</p>
                        <p><strong>First Name:</strong> {originalFirstName}</p>
                        <p><strong>Last Name:</strong> {originalLastName}</p>
                    </div>
                )}

                {/* Documents Table */}
                <h5>Documents</h5>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Document ID</th>
                            <th>Document Type</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.dokumentId}>
                                <td>{doc.dokumentId}</td>
                                <td>{doc.tipDokumenta}</td>
                                <td>{new Date(doc.datumDokumenta).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                {isEditing ? (
                    <Button variant="success" onClick={handleEditUser}>
                        Save Changes
                    </Button>
                ) : (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                )}
                <Button variant="danger" onClick={handleDeleteUser}>
                    Delete
                </Button>
                <Button variant="secondary" onClick={() => {
                    setIsEditing(false);  // Ensure editing mode is reset
                    handleClose();
                }}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function AddEmployeeModal({ show, handleClose, onAdd }) {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Zaposlenik');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');

    // Helper function for password validation
    const isPasswordValid = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@.,]/.test(password);
        return hasUpperCase && hasNumber && hasSpecialChar;
    };

    // Handle API call to add a new user
    const handleAddUser = async () => {
        // Reset errors
        setPasswordError('');
        setFormError('');

        // Check if any field is empty
        if (!userName || !email || !password || !confirmPassword) {
            setFormError('All fields are required.');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        if (!isPasswordValid(password)) {
            setPasswordError('Password must contain at least one uppercase letter, one number, and one special character.');
            return;
        }

        try {
            const response = await axios.post('https://localhost:5001/api/auth/register', {
                Username: userName,
                Email: email,
                Password: password,
                Role: role
            });

            if (response.status === 201) {
                alert("User added successfully!");
                onAdd();  // To refresh data after addition
                handleClose(); // Close the modal
                // Clear form after closing modal
                setUserName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRole('Zaposlenik');
            }
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Failed to add user.");
        }
    };

    return (
        <Modal show={show} onHide={() => {
            handleClose();
            // Clear form when closing the modal
            setUserName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('Zaposlenik');
        }}>
            <Modal.Header closeButton>
                <Modal.Title>Add Employee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formUserName">
                        <Form.Label>Korisničko ime:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="mb-3"  // Add margin-bottom for spacing
                        />
                    </Form.Group>
                    <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-3"  // Add margin-bottom for spacing
                        />
                    </Form.Group>
                    <Form.Group controlId="formPassword">
                        <Form.Label>Lozinka:</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Unesi lozinku"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-3"  // Add margin-bottom for spacing
                        />
                    </Form.Group>
                    <Form.Group controlId="formConfirmPassword">
                        <Form.Label>Potvrda lozinke:</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Potvrdi lozinku"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mb-3"  // Add margin-bottom for spacing
                        />
                        {passwordError && <Form.Text className="text-danger">{passwordError}</Form.Text>}
                        {formError && <Form.Text className="text-danger">{formError}</Form.Text>}
                    </Form.Group>
                    <Form.Group controlId="formRole">
                        <Form.Label>Uloga:</Form.Label>
                        <Form.Control
                            as="select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Zaposlenik">Zaposlenik</option>
                            <option value="Administrator">Administrator</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {
                    handleClose();
                    // Clear form when closing the modal
                    setUserName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setRole('Zaposlenik');
                }}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddUser}>
                    Add User
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
