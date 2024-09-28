import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Table, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are applied

// Register components in Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Function to fetch data from an API
async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Component for displaying statistics and handling modal interactions
export function Statistika() {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [artikli, setArtikli] = useState([]);
    const [selectedArtikl, setSelectedArtikl] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [fifoChartData, setFifoChartData] = useState({ labels: [], datasets: [] });
    const [modalPriceChartData, setModalPriceChartData] = useState({ labels: [], datasets: [] });
    const [modalValueChartData, setModalValueChartData] = useState({ labels: [], datasets: [] });
    const [mainValueChartData, setMainValueChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        async function getData() {
            try {
                const data = await fetchData("https://localhost:5001/api/home/joined_artikls_db_date_order");
                const artikliData = await fetchData("https://localhost:5001/api/home/artikli_db");

                setArtikli(artikliData);

                // Process data for the quantity chart
                let kolicina = 0;
                const lKolicina = [];
                const labels = [];
                for (let i = 0; i < data.length; i++) {
                    const e = data[i];
                    if (i < data.length - 1) {
                        if (new Date(e.datumDokumenta).getTime() === new Date(data[i + 1].datumDokumenta).getTime()) {
                            kolicina += e.tipDokumenta === "Primka" ? e.kolicina : -e.kolicina;
                        } else {
                            labels.push(new Date(e.datumDokumenta).toLocaleDateString('en-GB'));
                            kolicina += e.tipDokumenta === "Primka" ? e.kolicina : -e.kolicina;
                            lKolicina.push(kolicina);
                        }
                    } else if (i === data.length - 1) {
                        labels.push(new Date(e.datumDokumenta).toLocaleDateString('en-GB'));
                        kolicina += e.tipDokumenta === "Primka" ? e.kolicina : -e.kolicina;
                        lKolicina.push(kolicina);
                    }
                }
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Količina',
                            data: lKolicina,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                });

                // Process data for the main value chart
                let valueLabels = [];
                let valueDataSet = [];
                const valuesByDate = {};

                data.forEach(e => {
                    const date = new Date(e.datumDokumenta).toLocaleDateString('en-GB');
                    if (!valuesByDate[date]) valuesByDate[date] = 0;
                    valuesByDate[date] += e.tipDokumenta === "Primka" ? e.ukupnaCijena : -e.ukupnaCijena;
                });

                Object.keys(valuesByDate).forEach(date => {
                    valueLabels.push(date);
                    valueDataSet.push(valuesByDate[date]);
                });

                setMainValueChartData({
                    labels: valueLabels,
                    datasets: [
                        {
                            label: 'Vrijednost po datumima',
                            data: valueDataSet,
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                            fill: false,
                        },
                    ],
                });

            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        }

        getData();
    }, []);

    const handleShowModal = async (artikl) => {
        setSelectedArtikl(artikl);
        setShowModal(true);

        try {
            // Use the new API call for both FIFO and price chart data
            const modalGraphData = await fetchData(`https://localhost:5001/api/home/ModalGraphInfo/${artikl.artiklId}`);

            let labels = [];
            let fifoDataSet = [];
            let pricePrimkaData = [];
            let priceIzdatnicaData = [];
            let valueDataSet = [];

            modalGraphData.forEach((item) => {
                const date = new Date(item.datumDokumenta).toLocaleDateString('en-GB');
                if (!labels.includes(date)) labels.push(date);

                // Quantity data (for the FIFO chart)
                fifoDataSet.push(item.kolicina);

                // Price data (for the price chart)
                if (item.tipDokumentaId === 1) {
                    pricePrimkaData.push(item.cijena); // Primka prices
                } else if (item.tipDokumentaId === 2) {
                    priceIzdatnicaData.push(item.cijena); // Izdatnica prices
                }

                // Value data (for the value chart in the modal)
                const value = item.tipDokumenta === 'Primka' ? item.cijena : -item.cijena;
                valueDataSet.push(value);
            });

            // Update FIFO chart data
            setFifoChartData({
                labels,
                datasets: [
                    {
                        label: 'Količina po datumima',
                        data: fifoDataSet,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            // Update price chart data
            setModalPriceChartData({
                labels,
                datasets: [
                    {
                        label: 'Primka Cijena',
                        data: pricePrimkaData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false,
                    },
                    {
                        label: 'Izdatnica Cijena',
                        data: priceIzdatnicaData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        fill: false,
                    },
                ],
            });

            // Update value chart data in the modal
            setModalValueChartData({
                labels,
                datasets: [
                    {
                        label: 'Vrijednost po datumima',
                        data: valueDataSet,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        fill: false,
                    },
                ],
            });

        } catch (error) {
            console.error('Error fetching modal graph data:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const optionsA = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white', // Legend text color
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}`;
                    }
                },
                titleColor: 'white',
                bodyColor: 'white',
                footerColor: 'white'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white', // X-axis label text color
                },
                title: {
                    display: true,
                    text: 'Datum',
                    color: 'white'
                }
            },
            y: {
                ticks: {
                    color: 'white', // Y-axis label text color
                },
                title: {
                    display: true,
                    text: 'Količina',
                    color: 'white'
                }
            },
        },
    };

    const optionsB = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'black', // Legend text color
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}`;
                    }
                },
                titleColor: 'white',
                bodyColor: 'white',
                footerColor: 'white'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'black', // X-axis label text color
                },
                title: {
                    display: true,
                    text: 'Datum',
                    color: 'black'
                }
            },
            y: {
                ticks: {
                    color: 'black', // Y-axis label text color
                },
                title: {
                    display: true,
                    text: 'Količina',
                    color: 'black'
                }
            },
        },
    };

    const optionsC = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'black', // Legend text color
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}`;
                    }
                },
                titleColor: 'black',
                bodyColor: 'black',
                footerColor: 'black'
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'black', // X-axis label text color
                },
                title: {
                    display: true,
                    text: 'Datum',
                    color: 'black'
                }
            },
            y: {
                ticks: {
                    color: 'black', // Y-axis label text color
                },
                title: {
                    display: true,
                    text: 'Vrijednost',
                    color: 'black'
                }
            },
        },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <div className='chart-container' style={{ width: '100%', height: '300px',marginLeft:"100px" }}>
                    <h2>Količina na stanju</h2>
                    <Line data={chartData} options={optionsA} />
                </div>

                <div className='chart-container' style={{ width: '100%', height: '300px', marginTop: '20px',marginLeft:"100px" }}>
                    <h2  style={{marginTop:"50px"}}>Vrijednost po datumu</h2>
                    <Line data={mainValueChartData} options={optionsA} />
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <Table className="centered-table" striped bordered hover variant="dark" style={{ width: '90%' }}>
                    <thead>
                        <tr>
                            <th>Naziv Artikla</th>
                            <th>Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {artikli.map((artikl) => (
                            <tr key={artikl.artiklId}>
                                <td>{artikl.artiklNaziv}</td>
                                <td>
                                    <Button variant="info" onClick={() => handleShowModal(artikl)}>
                                        Info
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {selectedArtikl && (
                <Modal show={showModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Detalji Artikla</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Naziv:</strong> {selectedArtikl.artiklNaziv}</p>
                        <p><strong>Jedinica mjere:</strong> {selectedArtikl.artiklJmj}</p>
                        <p><strong>Kategorija:</strong> {selectedArtikl.kategorijaNaziv}</p>
                        
                        <div className='chart-container' style={{ width: '100%', height: '300px' }}>
                            <h3 className="d-flex justify-content-center mt-3">Stanje za: "{selectedArtikl.artiklNaziv}"</h3>
                            <Line className="d-flex justify-content-center mt-3" data={fifoChartData} options={optionsB} />
                        </div>

                        <div className='chart-container' style={{ width: '100%', height: '300px', marginTop: '20px' }}>
                            <h3 className="d-flex justify-content-center mt-5">Cijena po datumu za {selectedArtikl.artiklNaziv}</h3>
                            <Line data={modalPriceChartData} options={optionsB} className="d-flex justify-content-center mt-4"/>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Zatvori
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}

export default Statistika;
