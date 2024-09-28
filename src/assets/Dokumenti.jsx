import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import { Button, Form } from 'react-bootstrap'; // Import Bootstrap Form
import { DokumentInfoModal } from './modals'; // Import the DokumentInfoModal from modals.jsx

function Dokumenti() {
    const baseURL = "https://localhost:5001/api/home/joined_dokument_tip";
    const [artikli, setArtikli] = useState([]);
    const [filteredArtikli, setFilteredArtikli] = useState([]);
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [selectedDokument, setSelectedDokument] = useState(null); // State for selected dokument data
    const [filterType, setFilterType] = useState("all"); // State for filter type
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    useEffect(() => {
        axios({
            method: 'get',
            url: baseURL,
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        }).then(response => {
            setArtikli(response.data);
            setFilteredArtikli(response.data); // Initialize filteredArtikli
        }).catch(error => {
            console.error(error);
            alert("Greška prilikom učitavanja podataka");
        });
    }, []);

    useEffect(() => {
        let filtered = artikli;

        // Filter by document type
        if (filterType !== "all") {
            filtered = filtered.filter(art => art.tipDokumenta === filterType);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(art =>
                art.dokumentId.toString().includes(searchTerm) ||
                art.tipDokumenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                new Date(art.datumDokumenta).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).includes(searchTerm)
            );
        }

        setFilteredArtikli(filtered);
    }, [filterType, searchTerm, artikli]);

    // Function to handle modal open with selected dokument data
    const handleShowModal = (dokument) => {
        setSelectedDokument(dokument);
        setShowModal(true);
    };

    // Function to handle modal close
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDokument(null); // Clear selected dokument data when modal is closed
    };

    return (
        <>
            {/* Filter Buttons */}
            <div className="d-flex justify-content-center mt-4">
                <Button
                    variant={filterType === "all" ? "dark" : "secondary"}
                    onClick={() => setFilterType("all")}
                >
                    Sve
                </Button>
                <Button
                    variant={filterType === "Primka" ? "dark" : "secondary"}
                    onClick={() => setFilterType("Primka")}
                    className="mr-2"
                >
                    Primke
                </Button>
                <Button
                    variant={filterType === "Izdatnica" ? "dark" : "secondary"}
                    onClick={() => setFilterType("Izdatnica")}
                >
                    Izdatnice
                </Button>
            </div>

            {/* Search Input */}
            <Form.Group controlId="searchDokument" className="mt-3" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Form.Control
                    type="text"
                    placeholder="Pretraži po Šifri ili Nazivu..."
                    value={searchTerm}
                    
                    style={{ width: '80%' }} // Adjust width as needed
                />
            </Form.Group>


            <Table className="centered-table mt-3" striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th scope="col">Id dokumenta</th>
                        <th scope="col">Tip dokumenta</th>
                        <th scope="col">Datum dokumenta</th>
                        <th scope="col">Info</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredArtikli.map((art, index) => (
                            <tr key={index}>
                                <td>{art.dokumentId}</td>
                                <td>{art.tipDokumenta}</td>
                                <td>{new Date(art.datumDokumenta).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                <td>
                                    <Button
                                        variant="info"
                                        onClick={() => handleShowModal(art)}
                                        size="sm"

                                    >
                                        Detalji
                                    </Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

            {/* Render the modal */}
            {selectedDokument && (
                <DokumentInfoModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    dokument={selectedDokument}
                />
            )}
        </>
    );
}

export default Dokumenti;
