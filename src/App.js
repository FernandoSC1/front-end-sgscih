import React, { useState } from 'react';
import './index.css'; // O CSS global continua aqui

// Importações das "páginas"
import PacienteList from './pages/PacienteList';
import PacienteForm from './pages/PacienteForm';
import PacienteDetail from './pages/PacienteDetail';
import TransferReport from './pages/TransferReport';

function App() {
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);

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
      default:
        // Página inicial ou um placeholder
        return (
          <div className="container welcome-section">
            <h2 className="page-title">Bem-vindo</h2>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Sistema de Gerenciamento SCIH</h1>
        <nav className="main-nav">
          <button onClick={handlePatientsButtonClick} className="nav-button">
            Pacientes
          </button>
          <button onClick={() => { setCurrentPage('pacienteForm'); setSelectedPacienteId(null); }} className="nav-button">
            Novo Paciente
          </button>
          <button onClick={() => { setCurrentPage('transferReport'); setSelectedPacienteId(null); }} className="nav-button">
            Relatório de Transferência
          </button>
        </nav>
      </header>
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;