// App.js
import React, { useState, useEffect } from 'react';
import './index.css';

import PacienteList from './pages/PacienteList';
import PacienteForm from './pages/PacienteForm';
import PacienteDetail from './pages/PacienteDetail';
import TransferReport from './pages/TransferReport';
import FormularioIRAS from './pages/FormularioIRAS';
import PainelGestao from './pages/PainelGestao';
import Login from './login/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        JSON.parse(localStorage.getItem('isLoggedIn')) || false
    );
    const [currentPage, setCurrentPage] = useState(
        localStorage.getItem('currentPage') || 'pacienteList'
    );
    const [selectedPacienteId, setSelectedPacienteId] = useState(
        JSON.parse(localStorage.getItem('selectedPacienteId')) || null
    );
    const [selectedIrasId, setSelectedIrasId] = useState(
        JSON.parse(localStorage.getItem('selectedIrasId')) || null
    );

    useEffect(() => {
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && currentPage !== 'welcome') {
            localStorage.setItem('currentPage', currentPage);
            localStorage.setItem('selectedPacienteId', JSON.stringify(selectedPacienteId));
            localStorage.setItem('selectedIrasId', JSON.stringify(selectedIrasId));
        } else if (!isLoggedIn) {
            localStorage.removeItem('currentPage');
            localStorage.removeItem('selectedPacienteId');
            localStorage.removeItem('selectedIrasId');
        }
    }, [currentPage, selectedPacienteId, selectedIrasId, isLoggedIn]);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setCurrentPage('welcome'); 
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentPage(null);
        localStorage.removeItem('currentPage');
        localStorage.removeItem('selectedPacienteId');
        localStorage.removeItem('selectedIrasId');
    };

    const handlePatientsButtonClick = () => {
        setCurrentPage('pacienteList');
        setSelectedPacienteId(null);
    };

    const pagesWithoutHeader = ['welcome', 'pacienteList', 'painelGestao', 'pacienteDetail', 'pacienteForm', 'irasForm', 'transferReport'];

    const renderPage = () => {
        switch (currentPage) {
            case 'welcome':
                return (
                    <div className="container welcome-container">
                        <h2 className="page-title">Bem-vindo ao Sistema!</h2>
                        <img src="/logo_scih.png" alt="Logo SCIH" className="welcome-logo" />
                    </div>
                );
            case 'pacienteList':
                return <PacienteList setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
            case 'pacienteForm':
                return <PacienteForm setCurrentPage={setCurrentPage} selectedPacienteId={selectedPacienteId} setSelectedPacienteId={setSelectedPacienteId} />;
            case 'pacienteDetail':
                return <PacienteDetail setCurrentPage={setCurrentPage} selectedPacienteId={selectedPacienteId} setSelectedPacienteId={setSelectedPacienteId} />;
            case 'transferReport':
                return <TransferReport setCurrentPage={setCurrentPage} />;
            case 'irasForm':
                return <FormularioIRAS setCurrentPage={setCurrentPage} selectedIrasId={selectedIrasId} setSelectedIrasId={setSelectedIrasId} />;
            case 'painelGestao':
                // A correção está aqui, garantindo que a função é passada
                return <PainelGestao setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} setSelectedIrasId={setSelectedIrasId} />;
            default:
                return <PacienteList setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="container welcome-section">
                <h2 className="page-title">Sistema de Gerenciamento SCIH</h2>
                <Login onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    return (
        <div className="app-container">
            {currentPage === 'welcome' && (
                <header className="app-header">
                    <h1 className="app-title">Sistema de Gerenciamento SCIH</h1>
                    <nav className="main-nav">
                        <button onClick={() => { setCurrentPage('painelGestao'); setSelectedPacienteId(null); }} className="nav-button">Painel de Gestão</button>
                        <button onClick={handlePatientsButtonClick} className="nav-button">Pacientes</button>
                        <button onClick={() => { setCurrentPage('pacienteForm'); setSelectedPacienteId(null); }} className="nav-button">Novo Paciente</button>
                        <button onClick={() => { setCurrentPage('transferReport'); setSelectedPacienteId(null); }} className="nav-button">Relatório de Transferência</button>
                        <button onClick={() => { setCurrentPage('irasForm'); setSelectedIrasId(null); }} className="nav-button">Formulário de IRAS</button>
                        <button onClick={handleLogout} className="nav-button-logout-button">Sair</button>
                    </nav>
                </header>
            )}
            <main className="app-main">
                {renderPage()}
            </main>
            <footer className="footer">
                <p className='footer-box'>Desenvolvido por: Fernando da Silva Costa</p>
                <p className='footer-box'>Versão: 1.0.0</p>
            </footer>
        </div>
    );
}

export default App;
