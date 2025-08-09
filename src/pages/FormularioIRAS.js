import React, { useState, useEffect } from 'react';
import axios from 'axios';

// NOVO: Recebe selectedIrasId e setSelectedIrasId
const FormularioIRAS = ({ setCurrentPage, selectedIrasId, setSelectedIrasId }) => {
    const initialState = {
        nomePaciente: '', numeroRegistro: '', dataAdmissao: '', idade: '',
        sexo: '', unidadeInternacao: '', outraUnidade: '', leito: '',
        profissionalSolicitante: '', diagnostico: '', encaminhado: '',
        dataPrimeiroSinal: '', sinaisSintomas: [], outrosSinais: '',
        procedimentoInvasivo: '', procedimentos: [], outrosProcedimentos: '',
        procedimentoCirurgicoDescricao: '', exames: [], outrosExames: '',
        materialColetado: '', microrganismo: '', usoAntimicrobiano: '',
        antimicrobianoUsado: '', mudancaAntimicrobiano: '', novaPrescricao: '',
        observacoes: '',
    };
    const [formData, setFormData] = useState(initialState);
    const [isPacienteFound, setIsPacienteFound] = useState(false);
    // NOVO: Estado para controlar se o formulário está em modo de edição
    const [isEditMode, setIsEditMode] = useState(false);
    const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    // NOVO: useEffect para buscar dados da investigação quando em modo de edição
    useEffect(() => {
        const fetchInvestigationData = async () => {
            if (selectedIrasId) {
                setIsEditMode(true);
                try {
                    const response = await axios.get(`${API_URL}/api/investigacao-iras/id/${selectedIrasId}`);
                    const data = response.data;
                    
                    // Formata as datas para o formato yyyy-MM-dd que o input[type=date] espera
                    if (data.dataAdmissao) data.dataAdmissao = new Date(data.dataAdmissao).toISOString().split('T')[0];
                    if (data.dataPrimeiroSinal) data.dataPrimeiroSinal = new Date(data.dataPrimeiroSinal).toISOString().split('T')[0];

                    setFormData(data);
                    setIsPacienteFound(true); // Bloqueia os campos do paciente
                } catch (error) {
                    console.error("Erro ao buscar dados da investigação:", error);
                    alert("Falha ao carregar os dados da investigação.");
                }
            } else {
                // Reseta o formulário para um novo registro
                setIsEditMode(false);
                setFormData(initialState);
                setIsPacienteFound(false);
            }
        };

        fetchInvestigationData();
    }, [selectedIrasId, API_URL]);

    const searchPatientData = async () => {
        // ... (lógica de busca de paciente permanece a mesma)
    };

    const handleChange = (e) => {
        // ... (lógica de handleChange permanece a mesma)
    };

    // ALTERADO: handleSubmit agora lida com POST (criar) e PUT (atualizar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // Atualiza um registro existente
                await axios.put(`${API_URL}/api/investigacao-iras/${selectedIrasId}`, formData);
                alert('Formulário de IRAS atualizado com sucesso!');
            } else {
                // Cria um novo registro
                await axios.post(`${API_URL}/api/investigacao-iras`, formData);
                alert('Formulário de IRAS salvo com sucesso!');
            }
            setSelectedIrasId(null); // Limpa o ID após a operação
            setCurrentPage('pacienteList');
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Erro ao enviar o formulário. Por favor, tente novamente.');
            }
        }
    };

    const handleVoltar = () => {
        setSelectedIrasId(null); // Limpa o ID ao voltar
        setCurrentPage('painelGestao'); // Volta para o painel de onde veio
    };

    return (
        <div className="container">
            <div className="painel-header">
                {/* ALTERADO: Título dinâmico */}
                <h2 className="page-title">{isEditMode ? 'Detalhes da Investigação' : 'Formulário de Investigação de IRAS'}</h2>
                <button onClick={handleVoltar} className="button secondary-button">
                    Voltar
                </button>
            </div>
            <form onSubmit={handleSubmit} className="data-form">
                {/* ... (resto do seu formulário JSX) ... */}
                
                {/* ALTERADO: Texto do botão dinâmico */}
                <button className="primary-button" type="submit">
                    {isEditMode ? 'Atualizar Formulário' : 'Enviar Formulário'}
                </button>
            </form>
        </div>
    );
};

export default FormularioIRAS;
