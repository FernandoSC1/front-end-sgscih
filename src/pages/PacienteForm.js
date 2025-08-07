import React, { useState, useEffect } from 'react';
import MessageBox from '../components/MessageBox';
import { formatDateForInput } from '../utils/formatters';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Aceita a nova prop onMultiResultSearch
const PacienteForm = ({ setCurrentPage, selectedPacienteId, setSelectedPacienteId, onMultiResultSearch }) => { 
  // ... (estados existentes inalterados) ...
  const [paciente, setPaciente] = useState({
    nome: '',
    numeroZeroDia: '',
    dataNascimento: '',
    dataAdmissao: '',
    dataAlta: '',
    leito: '',
    setor: '',
    sexo: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [leitoError, setLeitoError] = useState(''); // <-- NOVO ESTADO

  useEffect(() => {
    if (selectedPacienteId) {
      setIsEditMode(true);
      fetchPacienteDetails(selectedPacienteId);
      // Ao carregar um paciente selecionado, trava os campos por padrão
      setIsLocked(true); 
    } else {
      // ... (lógica else inalterada) ...
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
      
      // CORREÇÃO APLICADA AQUI:
      // Usamos a forma de callback do setPaciente para garantir que estamos
      // mesclando os dados recebidos com a estrutura completa do estado anterior.
      // Isso garante que o campo 'sexo' sempre exista no estado, mesmo que venha vazio do BD.
      setPaciente(prevState => ({
        ...prevState, // Começa com a estrutura completa do estado (com nome, sexo, leito, etc.)
        ...data,      // Sobrescreve com os dados recebidos do banco de dados
        
        // Formata as datas que sempre vêm do banco
        dataNascimento: formatDateForInput(data.dataNascimento),
        dataAdmissao: formatDateForInput(data.dataAdmissao),
        dataAlta: data.dataAlta ? formatDateForInput(data.dataAlta) : '', // Previne erro se a data de alta for nula
      }));

    } catch (error) {
      console.error('Erro ao buscar detalhes do paciente:', error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DE BUSCA ATUALIZADA para usar a rota existente GET /api/pacientes
  const handleSearch = async () => {
    const { nome, numeroZeroDia } = paciente;
    if (!nome.trim() && !numeroZeroDia.trim()) {
      setMessage('Por favor, preencha o campo "Nome" ou "Número Zero Dia" para buscar.');
      setMessageType('info');
      return;
    }

    setLoading(true);
    setMessage('');
    
    const searchTerm = numeroZeroDia.trim() || nome.trim();
    const searchField = numeroZeroDia.trim() ? 'numeroZeroDia' : 'nome';
    const url = `${API_BASE_URL}/pacientes?${searchField}=${searchTerm}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar paciente.');
      }
      
      // CAMINHO 1: Nenhum resultado encontrado
      if (data.length === 0) {
        setMessage('Paciente não encontrado. Prossiga para criar um novo cadastro.');
        setMessageType('info');
        setIsLocked(false);
      } 
      // CAMINHO 2: Exatamente um resultado encontrado
      else if (data.length === 1) {
        const foundPaciente = data[0];
        setPaciente({
          ...foundPaciente,
          dataNascimento: formatDateForInput(foundPaciente.dataNascimento),
          dataAdmissao: formatDateForInput(foundPaciente.dataAdmissao),
          dataAlta: formatDateForInput(foundPaciente.dataAlta),
        });
        setSelectedPacienteId(foundPaciente._id);
        setIsLocked(true); 
        setIsEditMode(true);
        setMessage('Paciente encontrado. Os campos foram preenchidos e travados.');
        setMessageType('success');
      } 
      // CAMINHO 3: Múltiplos resultados encontrados
      else {
        // Chama a função do App.js para mudar para a lista de pacientes
        onMultiResultSearch({ [searchField]: searchTerm });
      }

    } catch (error) {
      // ... (lógica de erro inalterada) ...
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({ ...prev, [name]: value }));
  };
  
const handleLeitoBlur = async (e) => {
    const leitoValue = e.target.value;

    // Se o campo estiver vazio, limpa o erro e sai
    if (!leitoValue.trim()) {
        setLeitoError('');
        return;
    }

    try {
        // Constrói a URL para a verificação
        let url = `${API_BASE_URL}/pacientes/leito/verificar?leito=${leitoValue.trim()}`;

        // Se estivermos editando, envia o ID do paciente atual para ignorá-lo na busca
        if (selectedPacienteId) {
            url += `&pacienteId=${selectedPacienteId}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (!result.disponivel) {
            // Leito ocupado, define a mensagem de erro
            setLeitoError(`Leito ${leitoValue} já ocupado por: ${result.paciente.nome}`);
        } else {
            // Leito disponível, limpa qualquer erro anterior
            setLeitoError('');
        }
    } catch (error) {
        console.error('Erro ao verificar disponibilidade do leito:', error);
        // Opcional: informar o usuário sobre falha na verificação
        setLeitoError('Não foi possível verificar o leito. Tente novamente.');
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificação de segurança adicional
    if (leitoError) {
        setMessage('O número do leito informado já está em uso. Por favor, corrija.');
        setMessageType('error');
        return;
    }

    if (isLocked) {
      setIsLocked(false);
      setMessage('Campos habilitados para edição. Faça as alterações e clique em "Atualizar Paciente".');
      setMessageType('info');
      return;
    }
    console.log('OBJETO ENVIADO PELO FRONTEND:', paciente);
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
        setSelectedPacienteId(isEditMode ? selectedPacienteId : result._id);
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

  if (loading && isEditMode && !selectedPacienteId) return <div className="loading-message">Carregando dados do paciente para edição...</div>;

  return (
    <div className="container">
      <div className="painel-header">
                <button
                    onClick={() => {
                        setCurrentPage('pacienteList');
                        setSelectedPacienteId(null); // Limpa o ID ao voltar
                    }}
                    className="button secondary-button"
                >
                    Voltar
                </button>
            </div>
      <h2 className="page-title">
        {isEditMode ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
      </h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input type="text" id="nome" name="nome" value={paciente.nome} onChange={handleChange} required disabled={isLocked} />
        </div>
        
        <div className="form-group">
            <label htmlFor="numeroZeroDia">Número Zero Dia:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                    type="text" 
                    id="numeroZeroDia" 
                    name="numeroZeroDia" 
                    value={paciente.numeroZeroDia} 
                    onChange={handleChange} 
                    required 
                    disabled={isLocked}
                    style={{ flex: 1 }}
                />
                <button 
                    type="button" 
                    onClick={handleSearch} 
                    disabled={loading || isLocked} 
                    className="button secondary-button"
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="sexo">Sexo:</label>
          <select id="sexo" name="sexo" value={paciente.sexo} onChange={handleChange} required disabled={isLocked}>
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dataNascimento">Data de Nascimento:</label>
          <input type="date" id="dataNascimento" name="dataNascimento" value={paciente.dataNascimento} onChange={handleChange} required disabled={isLocked} />
        </div>
        <div className="form-group">
          <label htmlFor="dataAdmissao">Data de Admissão:</label>
          <input type="date" id="dataAdmissao" name="dataAdmissao" value={paciente.dataAdmissao} onChange={handleChange} required disabled={isLocked} />
        </div>
        <div className="form-group">
          <label htmlFor="dataAlta">Data de Alta (Opcional):</label>
          <input type="date" id="dataAlta" name="dataAlta" value={paciente.dataAlta} onChange={handleChange} disabled={isLocked} />
        </div>
        <div className="form-group">
          <label htmlFor="leito">Leito:</label>
          <input type="text" id="leito" name="leito" value={paciente.leito} onChange={handleChange} onBlur={handleLeitoBlur} required disabled={isLocked} />
          {/* Mostra a mensagem de erro, se houver */}
          {leitoError && <p style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>{leitoError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="setor">Setor:</label>
          <input type="text" id="setor" name="setor" value={paciente.setor} onChange={handleChange} required disabled={isLocked} />
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
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            // Desabilita o botão se houver erro no leito
            disabled={loading || !!leitoError} 
            className="button primary-button"
          >
            {loading 
                ? (isLocked ? 'Buscando...' : (isEditMode ? 'Atualizando...' : 'Adicionando...'))
                : (isLocked ? 'Habilitar Edição' : (isEditMode ? 'Atualizar' : 'Adicionar')) + ' Paciente'
            }
          </button>
        </div>
      </form>
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default PacienteForm;
