import React, { useState, useEffect } from 'react';
import MessageBox from '../components/MessageBox';
import { formatDateForInput } from '../utils/formatters';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PacienteForm = ({ setCurrentPage, selectedPacienteId, setSelectedPacienteId }) => {
  const [paciente, setPaciente] = useState({
    nome: '',
    numeroZeroDia: '',
    dataNascimento: '',
    dataAdmissao: '',
    dataAlta: '',
    leito: '',
    setor: '',
    sexo: '', // NOVO CAMPO: Adicionado ao estado inicial
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPacienteId) {
      setIsEditMode(true);
      fetchPacienteDetails(selectedPacienteId);
    } else {
      setIsEditMode(false);
      setPaciente({
        nome: '',
        numeroZeroDia: '',
        dataNascimento: '',
        dataAdmissao: '',
        dataAlta: '',
        leito: '',
        setor: '',
        sexo: '', // NOVO CAMPO: Limpado para novos cadastros
      });
    }
  }, [selectedPacienteId]);

  const fetchPacienteDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar paciente: ${response.statusText}`);
      }
      const data = await response.json();
      setPaciente({
        ...data,
        dataNascimento: formatDateForInput(data.dataNascimento),
        dataAdmissao: formatDateForInput(data.dataAdmissao),
        dataAlta: formatDateForInput(data.dataAlta),
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes do paciente:', error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `${API_BASE_URL}/pacientes/${selectedPacienteId}` : `${API_BASE_URL}/pacientes`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paciente),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} paciente.`);
      }

      const result = await response.json(); 
      setMessage(`Paciente ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
      setMessageType('success');
      
      setTimeout(() => {
        if (isEditMode) {
          setSelectedPacienteId(selectedPacienteId); 
        } else {
          setSelectedPacienteId(result._id);
        }
        setCurrentPage('pacienteDetail'); 
      }, 1500);

    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} paciente:`, error);
      if (error.message.includes('E11000 duplicate key error')) {
        setMessage('Erro: O Número Zero Dia informado já está em uso. Por favor, insira um valor único.');
      } else {
        setMessage(`Erro: ${error.message}`);
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className="loading-message">Carregando dados do paciente para edição...</div>;

  return (
    <div className="container">
      <h2 className="page-title">
        {isEditMode ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
      </h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input type="text" id="nome" name="nome" value={paciente.nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="numeroZeroDia">Número Zero Dia:</label>
          <input type="text" id="numeroZeroDia" name="numeroZeroDia" value={paciente.numeroZeroDia} onChange={handleChange} required />
        </div>
        {/* NOVO CAMPO: Adicionado o campo de seleção para o sexo */}
        <div className="form-group">
          <label htmlFor="sexo">Sexo:</label>
          <select id="sexo" name="sexo" value={paciente.sexo} onChange={handleChange} required>
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dataNascimento">Data de Nascimento:</label>
          <input type="date" id="dataNascimento" name="dataNascimento" value={paciente.dataNascimento} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="dataAdmissao">Data de Admissão:</label>
          <input type="date" id="dataAdmissao" name="dataAdmissao" value={paciente.dataAdmissao} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="dataAlta">Data de Alta (Opcional):</label>
          <input type="date" id="dataAlta" name="dataAlta" value={paciente.dataAlta} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="leito">Leito:</label>
          <input type="text" id="leito" name="leito" value={paciente.leito} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="setor">Setor:</label>
          <input type="text" id="setor" name="setor" value={paciente.setor} onChange={handleChange} required />
        </div>
        <div className="button-group form-actions">
          <button 
            type="button" 
            onClick={() => { 
              if (isEditMode && selectedPacienteId) {
                setCurrentPage('pacienteDetail'); 
              } else {
                setCurrentPage('pacienteList'); 
                setSelectedPacienteId(null);
              }
            }} 
            className="button secondary-button"
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="button primary-button">
            {loading ? (isEditMode ? 'Atualizando...' : 'Adicionando...') : (isEditMode ? 'Atualizar' : 'Adicionar')} Paciente
          </button>
        </div>
      </form>
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default PacienteForm;