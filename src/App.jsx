import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';

import LoginForm from './Login';
import Pocetna from './assets/Pocetna';
import Navigacija from './assets/login_register_navbar';
import RegisterForm from './assets/Register';
import Stanja from './assets/Stanja';
import NoviArtikl from './assets/NoviArtikl';
import Primka from './assets/Primka';
import Dokumenti from './assets/Dokumenti';
import Izdatnice from './assets/Izdatnica';
import Statistika from './assets/Statistika';
import Zaposlenici from './assets/zaposlenici';

function App() {



  return (
    <Router>
      <Navigacija/>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/pocetna" element={<Pocetna  />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/stanja" element={<Stanja />} />
        <Route path="/noviArtikl" element={<NoviArtikl />} />
        <Route path="/primka" element={<Primka />} />
        <Route path="/dokumenti" element={<Dokumenti />} /> {/* Corrected path */}
        <Route path="/izdatnica" element={<Izdatnice />} /> {/* Corrected path */}
        <Route path="/statistika" element={<Statistika />} /> {/* Corrected path */}
        <Route path="/zaposlenici" element={<Zaposlenici />} />


      </Routes>
    </Router>
  );
}

export default App;
