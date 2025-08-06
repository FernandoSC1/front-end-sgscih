import React, { useState, useEffect, useCallback } from 'react';
import MessageBox from '../components/MessageBox';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PacienteList = ({ setCurrentPage, setSelectedPacienteId, searchParams, setSearchParams }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTermNome, setSearchTermNome] = useState('');
  const [searchTermNumeroZeroDia, setSearchTermTermNumeroZeroDia] = useState('');
  const [admissionDateStart, setAdmissionDateStart] = useState('');
  const [admissionDateEnd, setAdmissionDateEnd] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('');
  const [searchTermSetor, setSearchTermSetor] = useState('');

  const isSelectionMode = !!searchParams;

  const fetchPacientes = useCallback(async (filters = {}, ignoreEmptyFilters = false) => {
    const hasAnyFilter = Object.values(filters).some(value => {
        if (typeof value === 'string') return value.trim() !== '';
        return value;
    });

    if (!hasAnyFilter && !ignoreEmptyFilters) {
        setMessage('Por favor, forneça pelo menos um critério para aplicar o filtro.');
        setMessageType('info');
        setPacientes([]);
        setLoading(false);
        setHasSearched(false);
        return;
    }

    try {
        setLoading(true);
        setMessage('');
        setMessageType('');
        setHasSearched(true);

        const queryParams = new URLSearchParams();
        if (filters.nome) queryParams.append('nome', filters.nome);
        if (filters.numeroZeroDia) queryParams.append('numeroZeroDia', filters.numeroZeroDia);
        if (filters.admissionDateStart) queryParams.append('dataAdmissaoInicio', filters.admissionDateStart);
        if (filters.admissionDateEnd) queryParams.append('dataAdmissaoFim', filters.admissionDateEnd);
        if (filters.status && filters.status !== '') queryParams.append('status', filters.status);
        if (filters.setor) queryParams.append('setor', filters.setor);

        const url = `${API_BASE_URL}/pacientes?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao buscar pacientes: ${response.statusText}`);
        }
        const data = await response.json();
        setPacientes(data);
        if (data.length === 0) {
            setMessage('Nenhum paciente encontrado com os filtros aplicados.');
            setMessageType('info');
        } else {
            setMessage('');
        }
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        setMessage(`Erro: ${error.message}`);
        setMessageType('error');
        setPacientes([]);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams) {
      setSearchTermNome(searchParams.nome || '');
      setSearchTermTermNumeroZeroDia(searchParams.numeroZeroDia || '');
      fetchPacientes(searchParams);
    }
  }, [searchParams, fetchPacientes]);

  const handleApplyFilters = () => {
    if (typeof setSearchParams === 'function') {
      setSearchParams(null);
    }
    fetchPacientes({
      nome: searchTermNome,
      numeroZeroDia: searchTermNumeroZeroDia,
      admissionDateStart: admissionDateStart,
      admissionDateEnd: admissionDateEnd,
      status: patientStatusFilter,
      setor: searchTermSetor,
    });
  };

  const handleListAllPatients = () => {
    if (typeof setSearchParams === 'function') {
        setSearchParams(null);
    }
    setSearchTermNome('');
    setSearchTermTermNumeroZeroDia('');
    setAdmissionDateStart('');
    setAdmissionDateEnd('');
    setPatientStatusFilter('');
    setSearchTermSetor('');
    fetchPacientes({}, true);
  };

  const handleActionClick = (pacienteId) => {
    if (isSelectionMode) {
      setSelectedPacienteId(pacienteId);
      setCurrentPage('pacienteForm');
      if (typeof setSearchParams === 'function') {
        setSearchParams(null); 
      }
    } else {
      setSelectedPacienteId(pacienteId);
      setCurrentPage('pacienteDetail');
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">
        {isSelectionMode ? 'Selecione um Paciente' : 'Todos os Pacientes Cadastrados'}
      </h2>
      
      {/* A seção de filtros permanece inalterada e no mesmo lugar */}
      <div className="filter-section">
        <div className="filter-group">
            <div className="form-group">
                <label htmlFor="searchNome">Pesquisar por Nome:</label>
                <input
                    type="text"
                    id="searchNome"
                    value={searchTermNome}
                    onChange={(e) => setSearchTermNome(e.target.value)}
                    placeholder="Nome do paciente"
                />
            </div>
        </div>
        <div className="filter-group">
            <div className="form-group">
                <label htmlFor="searchNumeroZeroDia">Zero Dia:</label>
                <input
                    type="text"
                    id="searchNumeroZeroDia"
                    value={searchTermNumeroZeroDia}
                    onChange={(e) => setSearchTermTermNumeroZeroDia(e.target.value)}
                    placeholder="Número Zero Dia"
                />
            </div>
        </div>
        <div className="filter-group date-filter-group">
            <div className="form-group">
                <label htmlFor="admissionDateStart">Data Admissão (Início):</label>
                <input
                    type="date"
                    id="admissionDateStart"
                    value={admissionDateStart}
                    onChange={(e) => setAdmissionDateStart(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="admissionDateEnd">Data Admissão (Fim):</label>
                <input
                    type="date"
                    id="admissionDateEnd"
                    value={admissionDateEnd}
                    onChange={(e) => setAdmissionDateEnd(e.target.value)}
                />
            </div>
        </div>
        <div className="filter-group">
            <div className="form-group">
                <label htmlFor="patientStatusFilter">Status do Paciente:</label>
                <select
                    id="patientStatusFilter"
                    value={patientStatusFilter}
                    onChange={(e) => setPatientStatusFilter(e.target.value)}
                >
                    <option value="">Selecione um status</option>
                    <option value="internado">Internado</option>
                    <option value="alta">Com Alta</option>
                </select>
            </div>
        </div>
        <div className="filter-group">
            <div className="form-group">
                <label htmlFor="searchTermSetor">Filtrar por Setor:</label>
                <input
                    type="text"
                    id="searchTermSetor"
                    value={searchTermSetor}
                    onChange={(e) => setSearchTermSetor(e.target.value)}
                    placeholder="Ex: UTI, Enfermaria"
                />
            </div>
        </div>
        <div className="button-group full-width-button">
            <button onClick={handleApplyFilters} className="button primary-button" disabled={loading}>
                {loading ? 'Aplicando Filtros...' : 'Aplicar Filtros'}
            </button>
            <button onClick={handleListAllPatients} className="button secondary-button" disabled={loading}>
                Exibir Todos
            </button>
        </div>
      </div>

      {/* MENSAGEM DE SELEÇÃO MOVIDA PARA CÁ */}
      {isSelectionMode && !loading && (
          <p className="no-data-message" style={{color: '#4a00e0', fontWeight: 'bold', border: '1px solid #e0e0e0', borderRadius: '8px'}}>
              Múltiplos pacientes encontrados. Por favor, selecione o paciente correto para continuar.
          </p>
      )}

      {loading && <div className="loading-message">Carregando pacientes...</div>}
      
      {!hasSearched && !isSelectionMode && !loading && (
          <p className="no-data-message info">Use os filtros ou clique em "Exibir Todos" para listar os pacientes.</p>
      )}

      {hasSearched && !loading && pacientes.length === 0 && (
          <p className={`no-data-message ${messageType}`}>
              {message || 'Nenhum paciente encontrado com os filtros aplicados.'}
          </p>
      )}

      {!loading && pacientes.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zero Dia</th>
                <th>Nome</th>
                <th>Setor</th>
                <th>Leito</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente._id}>
                  <td>{paciente.numeroZeroDia}</td>
                  <td>{paciente.nome}</td>
                  <td>{paciente.setor}</td>
                  <td>{paciente.leito}</td>
                  <td>
                    <button onClick={() => handleActionClick(paciente._id)} className="button action-button">
                      {isSelectionMode ? 'Selecionar' : 'Ver Detalhes'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default PacienteList;