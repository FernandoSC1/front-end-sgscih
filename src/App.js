// App.js
import React, { useState, useEffect } from 'react';
import './index.css';

// Importações das "páginas"
import PacienteList from './pages/PacienteList';
import PacienteForm from './pages/PacienteForm';
import PacienteDetail from './pages/PacienteDetail';
import TransferReport from './pages/TransferReport';
import FormularioIRAS from './pages/FormularioIRAS'; // Novo import

// Importação do componente de Login
import Login from './login/Login';

function App() {
  // Use o useEffect para carregar o estado do localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    JSON.parse(localStorage.getItem('isLoggedIn')) || false
  );
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);

  // Use useEffect para salvar o estado no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('pacienteList');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Opcional: Redirecionar para a tela de login
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
      case 'irasForm': // Novo case para o formulário de IRAS
        return <FormularioIRAS setCurrentPage={setCurrentPage} />;
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
          {/* Novo botão para o Formulário de IRAS */}
          <button onClick={() => { setCurrentPage('irasForm'); setSelectedPacienteId(null); }} className="nav-button">
            Formulário de IRAS
          </button>
          {/* Botão de Sair adicionado aqui */}
          <button onClick={handleLogout} className="nav-button-logout-button">
            Sair
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
