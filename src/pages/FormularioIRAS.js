import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    const [isEditMode, setIsEditMode] = useState(false);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchInvestigationData = async () => {
            if (selectedIrasId) {
                setIsEditMode(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/investigacao-iras/id/${selectedIrasId}`);
                    const data = response.data;
                    
                    if (data.dataAdmissao) data.dataAdmissao = new Date(data.dataAdmissao).toISOString().split('T')[0];
                    if (data.dataPrimeiroSinal) data.dataPrimeiroSinal = new Date(data.dataPrimeiroSinal).toISOString().split('T')[0];

                    setFormData(data);
                    setIsPacienteFound(true);
                } catch (error) {
                    console.error("Erro ao buscar dados da investigação:", error);
                    alert("Falha ao carregar os dados da investigação.");
                }
            } else {
                setIsEditMode(false);
                setFormData(initialState);
                setIsPacienteFound(false);
            }
        };

        fetchInvestigationData();
    }, [selectedIrasId, API_BASE_URL]);

    const searchPatientData = async () => {
        const numero = formData.numeroRegistro;
        if (!numero) {
            alert('Por favor, insira o Número Zero Dia para buscar o paciente.');
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pacientes/numeroZeroDia/${numero}`);
            const { nome, dataAdmissao, dataNascimento, leito, setor, sexo } = response.data;
            const birthDate = new Date(dataNascimento);
            const ageInMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageInMs);
            const idadeCalculada = Math.abs(ageDate.getUTCFullYear() - 1970);
            setFormData(prevData => ({
                ...prevData,
                nomePaciente: nome,
                dataAdmissao: new Date(dataAdmissao).toISOString().split('T')[0],
                idade: idadeCalculada,
                sexo: sexo,
                unidadeInternacao: setor,
                leito: leito,
            }));
            setIsPacienteFound(true);
            alert('Paciente encontrado com sucesso! Os dados foram preenchidos automaticamente.');
        } catch (error) {
            alert('Paciente não encontrado. Por favor, preencha os dados manualmente.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const newArray = checked
                ? [...formData[name], value]
                : formData[name].filter(item => item !== value);
            setFormData({ ...formData, [name]: newArray });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/api/investigacao-iras/${selectedIrasId}`, formData);
                alert('Formulário de IRAS atualizado com sucesso!');
            } else {
                await axios.post(`${API_BASE_URL}/api/investigacao-iras`, formData);
                alert('Formulário de IRAS salvo com sucesso!');
            }
            setSelectedIrasId(null);
            setCurrentPage('painelGestao'); // Volta para o painel após a operação
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            alert(error.response?.data?.message || 'Erro ao enviar o formulário.');
        }
    };

    const handleVoltar = () => {
        setSelectedIrasId(null);
        setCurrentPage('painelGestao');
    };

    return (
        <div className="container">
            <div className="painel-header">
                <h2 className="page-title">{isEditMode ? 'Detalhes da Investigação' : 'Formulário de Investigação de IRAS'}</h2>
                <button onClick={handleVoltar} className="button secondary-button">
                    Voltar
                </button>
            </div>
            <form onSubmit={handleSubmit} className="data-form">
                {/* Seção de Dados do Paciente */}
                <div className="form-section">
                    <h3>Dados do Paciente</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="numeroRegistro">2. Nº Zero Dia:</label>
                            <div className="search-container">
                                <input className="form-input" type="text" id="numeroRegistro" name="numeroRegistro" value={formData.numeroRegistro} onChange={handleChange} required disabled={isEditMode} />
                                <button type="button" onClick={searchPatientData} className="secondary-button" disabled={isEditMode}>
                                    Buscar
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="nomePaciente">1. Nome do Paciente:</label>
                            <input className="form-input" type="text" id="nomePaciente" name="nomePaciente" value={formData.nomePaciente} onChange={handleChange} required disabled={isPacienteFound} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="dataAdmissao">3. Data de admissão:</label>
                            <input className="form-input" type="date" id="dataAdmissao" name="dataAdmissao" value={formData.dataAdmissao} onChange={handleChange} disabled={isPacienteFound} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="idade">4. Idade:</label>
                            <input className="form-input" type="number" id="idade" name="idade" value={formData.idade} onChange={handleChange} disabled={isPacienteFound} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="sexo">5. Sexo:</label>
                            <select className="form-select" id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} disabled={isPacienteFound}>
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* ... (resto do seu formulário JSX) ... */}
                <button className="primary-button" type="submit">
                    {isEditMode ? 'Atualizar' : 'Enviar Formulário'}
                </button>
            </form>
        </div>
    );
};

export default FormularioIRAS;
