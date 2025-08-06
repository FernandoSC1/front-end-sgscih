// App.js
import React, { useState, useEffect } from 'react';
import './index.css';

// Importações das "páginas"
import PacienteList from './pages/PacienteList';
import PacienteForm from './pages/PacienteForm';
import PacienteDetail from './pages/PacienteDetail';
import TransferReport from './pages/TransferReport';
import FormularioIRAS from './pages/FormularioIRAS';

// Importação do componente de Login
import Login from './login/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    JSON.parse(localStorage.getItem('isLoggedIn')) || false
  );
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);

  // NOVO ESTADO: Guarda os parâmetros de busca para passar do Form para a List
  const [searchParamsForList, setSearchParamsForList] = useState(null);

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
  
  // NOVA FUNÇÃO: Chamada pelo PacienteForm quando a busca retorna múltiplos resultados
  const handleMultiResultSearch = (searchParams) => {
    setSearchParamsForList(searchParams); // Guarda o termo da busca
    setCurrentPage('pacienteList');      // Muda para a página da lista
  };

  const handlePatientsButtonClick = () => {
    setCurrentPage('pacienteList');
    setSelectedPacienteId(null);
    setSearchParamsForList(null); // Limpa a busca ao clicar no botão principal de pacientes
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'pacienteList':
        return (
          <PacienteList 
            setCurrentPage={setCurrentPage} 
            setSelectedPacienteId={setSelectedPacienteId}
            // Props novas para o modo de seleção
            searchParams={searchParamsForList}
            setSearchParams={setSearchParamsForList}
          />
        );
      case 'pacienteForm':
        return (
          <PacienteForm
            setCurrentPage={setCurrentPage}
            selectedPacienteId={selectedPacienteId}
            setSelectedPacienteId={setSelectedPacienteId}
            // Prop nova para lidar com múltiplos resultados
            onMultiResultSearch={handleMultiResultSearch}
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
      default:
        return (
          <PacienteList 
            setCurrentPage={setCurrentPage} 
            setSelectedPacienteId={setSelectedPacienteId} 
            searchParams={searchParamsForList}
            setSearchParams={setSearchParamsForList}
          />
        );
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
          <button onClick={() => { setCurrentPage('pacienteForm'); setSelectedPacienteId(null); setSearchParamsForList(null); }} className="nav-button">
            Novo Paciente
          </button>
          {/* ... demais botões ... */}
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
      <main className="app-main">
        {renderPage()}
      </main>
      <footer className='footer-page'>
        <p>Desenvolvido por: Fernando da Silva Costa</p>
        <p>Versão: 1.0.0</p>
      </footer>
    </div>
  );
}

export default App;