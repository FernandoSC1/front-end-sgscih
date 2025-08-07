// App.js
import React, { useState, useEffect } from 'react';
import './index.css';

// Importações das "páginas"
import PacienteList from './pages/PacienteList';
import PacienteForm from './pages/PacienteForm';
import PacienteDetail from './pages/PacienteDetail';
import TransferReport from './pages/TransferReport';
import FormularioIRAS from './pages/FormularioIRAS';
import PainelGestao from './pages/PainelGestao';

// Importação do componente de Login
import Login from './login/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        JSON.parse(localStorage.getItem('isLoggedIn')) || false
    );
    const [currentPage, setCurrentPage] = useState(null);
    const [selectedPacienteId, setSelectedPacienteId] = useState(null);

    useEffect(() => {
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    }, [isLoggedIn]);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setCurrentPage('pacienteList');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentPage(null);
    };

    const handlePatientsButtonClick = () => {
        setCurrentPage('pacienteList');
        setSelectedPacienteId(null);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'pacienteList':
                return <PacienteList setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
            case 'pacienteForm':
                return (
                    <PacienteForm
                        setCurrentPage={setCurrentPage}
                        selectedPacienteId={selectedPacienteId}
                        setSelectedPacienteId={setSelectedPacienteId}
                    />
                );
            case 'pacienteDetail':
                return (
                    <PacienteDetail
                        setCurrentPage={setCurrentPage}
                        selectedPacienteId={selectedPacienteId}
                        setSelectedPacienteId={setSelectedPacienteId}
                    />
                );
            case 'transferReport':
                return <TransferReport setCurrentPage={setCurrentPage} />;
            case 'irasForm':
                return <FormularioIRAS setCurrentPage={setCurrentPage} />;
            case 'painelGestao':
                return <PainelGestao setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
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
            {/* O cabeçalho agora só aparece se a página não for 'painelGestao' */}
            {currentPage !== 'painelGestao' && (
                <header className="app-header">
                    <h1 className="app-title">Sistema de Gerenciamento SCIH</h1>
                    <nav className="main-nav">
                        <button onClick={() => { setCurrentPage('painelGestao'); setSelectedPacienteId(null); }} className="nav-button">
                            Painel de Gestão
                        </button>
                        <button onClick={handlePatientsButtonClick} className="nav-button">
                            Pacientes
                        </button>
                        <button onClick={() => { setCurrentPage('pacienteForm'); setSelectedPacienteId(null); }} className="nav-button">
                            Novo Paciente
                        </button>
                        <button onClick={() => { setCurrentPage('transferReport'); setSelectedPacienteId(null); }} className="nav-button">
                            Relatório de Transferência
                        </button>
                        <button onClick={() => { setCurrentPage('irasForm'); setSelectedPacienteId(null); }} className="nav-button">
                            Formulário de IRAS
                        </button>
                        <button onClick={handleLogout} className="nav-button-logout-button">
                            Sair
                        </button>
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
