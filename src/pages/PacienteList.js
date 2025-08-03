import React, { useState, useEffect, useCallback } from 'react'; // useMemo não é mais necessário
import MessageBox from '../components/MessageBox';
import { formatDate } from '../utils/formatters'; // Correção do import, se ainda não o fez

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PacienteList = ({ setCurrentPage, setSelectedPacienteId }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Indica se alguma busca foi realizada

  // Estados para os termos de busca (todos agora são filtros de backend)
  const [searchTermNome, setSearchTermNome] = useState('');
  const [searchTermNumeroZeroDia, setSearchTermTermNumeroZeroDia] = useState('');
  const [admissionDateStart, setAdmissionDateStart] = useState('');
  const [admissionDateEnd, setAdmissionDateEnd] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('');
  const [searchTermSetor, setSearchTermSetor] = useState(''); // Filtro de Setor para o backend

  // Função para buscar pacientes da API com base nos filtros
  const fetchPacientes = useCallback(async (filters = {}, ignoreEmptyFilters = false) => {
    // Verifica se algum filtro foi realmente aplicado para decidir se deve fazer a requisição,
    // a menos que ignoreEmptyFilters seja true (para "Exibir Todos")
    const hasAnyFilter = Object.values(filters).some(value => {
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return value;
    });

    if (!hasAnyFilter && !ignoreEmptyFilters) {
      setMessage('Por favor, forneça pelo menos um critério para aplicar o filtro.');
      setMessageType('info');
      setPacientes([]); // Limpa a lista de pacientes
      setLoading(false);
      setHasSearched(false); // Reinicia o estado de busca para exibir a mensagem inicial
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setMessageType('');
      setHasSearched(true); // Define que uma busca foi iniciada

      const queryParams = new URLSearchParams();
      if (filters.nome) queryParams.append('nome', filters.nome);
      if (filters.numeroZeroDia) queryParams.append('numeroZeroDia', filters.numeroZeroDia);
      if (filters.admissionDateStart) queryParams.append('dataAdmissaoInicio', filters.admissionDateStart);
      if (filters.admissionDateEnd) queryParams.append('dataAdmissaoFim', filters.admissionDateEnd);
      if (filters.status && filters.status !== '') {
        queryParams.append('status', filters.status);
      }
      // Adicionando o filtro de setor aos queryParams para o backend
      if (filters.setor) {
        queryParams.append('setor', filters.setor);
      }

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
        setMessage(''); // Limpa a mensagem se pacientes forem encontrados
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
      setPacientes([]); // Limpa a lista em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler para aplicar os filtros de busca no backend
  const handleApplyFilters = () => {
    fetchPacientes({
      nome: searchTermNome,
      numeroZeroDia: searchTermNumeroZeroDia,
      admissionDateStart: admissionDateStart,
      admissionDateEnd: admissionDateEnd,
      status: patientStatusFilter,
      setor: searchTermSetor, // Inclui o termo de busca por setor
    });
  };

  // Handler para listar todos os pacientes (limpa filtros e busca todos no backend)
  const handleListAllPatients = () => {
    setSearchTermNome('');
    setSearchTermTermNumeroZeroDia('');
    setAdmissionDateStart('');
    setAdmissionDateEnd('');
    setPatientStatusFilter('');
    setSearchTermSetor(''); // Limpa o termo de busca por setor
    fetchPacientes({}, true); // O 'true' ignora a validação de filtros vazios
  };

  // Handler para visualizar detalhes de um paciente
  const handleViewDetails = (pacienteId) => {
    setSelectedPacienteId(pacienteId);
    setCurrentPage('pacienteDetail');
  };

  return (
    <div className="container">
      <h2 className="page-title">Todos os Pacientes Cadastrados</h2>

      <div className="filter-section">
        {/* Filtro por Nome */}
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

        {/* Filtro por Zero Dia */}
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

        {/* Filtro por Data de Admissão */}
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

        {/* Filtro por Status do Paciente */}
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

        {/* Filtro por Setor (agora faz parte dos filtros de backend) */}
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

        {/* Botões de Ação */}
        <div className="button-group full-width-button">
          <button onClick={handleApplyFilters} className="button primary-button" disabled={loading}>
            {loading ? 'Aplicando Filtros...' : 'Aplicar Filtros'}
          </button>
          <button onClick={handleListAllPatients} className="button secondary-button" disabled={loading}>
            Exibir Todos
          </button>
        </div>
      </div>

      {/* Mensagem inicial antes de qualquer busca */}
      {!hasSearched && !loading && (
        <p className="no-data-message info">Use os filtros ou clique em "Exibir Todos" para listar os pacientes.</p>
      )}

      {/* Mensagem de carregamento */}
      {loading && <div className="loading-message">Carregando pacientes...</div>}

      {/* Mensagem de nenhum paciente encontrado (após uma busca e se a lista estiver vazia) */}
      {hasSearched && !loading && pacientes.length === 0 && (
          <p className={`no-data-message ${messageType}`}>
              {message || 'Nenhum paciente encontrado com os filtros aplicados.'}
          </p>
      )}

      {/* Tabela de Pacientes (só mostra se não estiver carregando e houver pacientes) */}
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
                    <button onClick={() => handleViewDetails(paciente._id)} className="button action-button">
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Componente MessageBox para exibir mensagens de erro/sucesso */}
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default PacienteList;