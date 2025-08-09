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
                    setIsPacienteFound(true); // Bloqueia os campos do paciente
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
            setCurrentPage('painelGestao');
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            alert(error.response?.data?.message || 'Erro ao enviar o formulário.');
        }
    };

    const handleVoltar = () => {
        setSelectedIrasId(null);
        // Alterado para corresponder à navegação das outras páginas
        setCurrentPage('pacienteList');
    };

    return (
        <div className="container">
            <div className="painel-header">
                <button onClick={handleVoltar} className="button secondary-button">
                    Voltar
                </button>
            </div>
            
        <h2 className="page-title">{isEditMode ? 'Detalhes da Investigação' : 'Formulário de Investigação de IRAS'}</h2>

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

                {/* Seção de Internação */}
                <div className="form-section">
                    <h3>Internação</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="unidadeInternacao">6. Unidade de internação:</label>
                            <select className="form-select" id="unidadeInternacao" name="unidadeInternacao" value={formData.unidadeInternacao} onChange={handleChange} disabled={isPacienteFound}>
                                <option value="">Selecione</option>
                                <option value="Clinica Medica">Clinica Medica</option>
                                <option value="Clinica Cirúrgica">Clinica Cirúrgica</option>
                                <option value="Clinica Ortopédica">Clinica Ortopédica</option>
                                <option value="Ginecologia/Obstetrícia">Ginecologia/Obstetrícia</option>
                                <option value="Clínica Pediátrica">Clínica Pediátrica</option>
                                <option value="Neonatologia">Neonatologia</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        {formData.unidadeInternacao === 'Outros' && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="outraUnidade">Especifique a unidade de internação:</label>
                                <input className="form-input" type="text" id="outraUnidade" name="outraUnidade" value={formData.outraUnidade} onChange={handleChange} disabled={isPacienteFound} />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="leito">6.1. Leito:</label>
                            <input className="form-input" type="text" id="leito" name="leito" value={formData.leito} onChange={handleChange} disabled={isPacienteFound} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="profissionalSolicitante">7. Profissional solicitante pela internação:</label>
                            <input className="form-input" type="text" id="profissionalSolicitante" name="profissionalSolicitante" value={formData.profissionalSolicitante} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="diagnostico">8. Diagnóstico no momento da internação:</label>
                            <textarea className="form-textarea" id="diagnostico" name="diagnostico" rows="3" value={formData.diagnostico} onChange={handleChange}></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="encaminhado">9. Paciente encaminhado de alguma outra instituição?</label>
                            <select className="form-select" id="encaminhado" name="encaminhado" value={formData.encaminhado} onChange={handleChange}>
                                <option value="">Selecione</option>
                                <option value="sim">Sim</option>
                                <option value="não">Não</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção de Sinais e Sintomas */}
                <div className="form-section">
                    <h3>Sinais e Sintomas</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="dataPrimeiroSinal">10. Data do aparecimento do primeiro sinal ou sintoma de infecção:</label>
                            <input className="form-input" type="date" id="dataPrimeiroSinal" name="dataPrimeiroSinal" value={formData.dataPrimeiroSinal} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">11. Sinais e sintomas existentes:</label>
                            <div className="form-checkbox-group">
                                {['dor', 'edema', 'secreção purulenta', 'calor', 'hipertermia', 'rubor', 'outros'].map(sinal => (
                                    <label key={sinal} className="form-sub-label">
                                        <input type="checkbox" name="sinaisSintomas" value={sinal} checked={formData.sinaisSintomas.includes(sinal)} onChange={handleChange} /> {sinal}
                                    </label>
                                ))}
                            </div>
                            {formData.sinaisSintomas.includes('outros') && (
                                <input className="form-input" type="text" name="outrosSinais" placeholder="Especifique outros sinais e sintomas" value={formData.outrosSinais} onChange={handleChange} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Seção de Procedimentos */}
                <div className="form-section">
                    <h3>Procedimentos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="procedimentoInvasivo">12. Paciente foi submetido à algum procedimento invasivo?</label>
                            <select className="form-select" id="procedimentoInvasivo" name="procedimentoInvasivo" value={formData.procedimentoInvasivo} onChange={handleChange}>
                                <option value="">Selecione</option>
                                <option value="sim">Sim</option>
                                <option value="não">Não</option>
                            </select>
                        </div>
                        {formData.procedimentoInvasivo === 'sim' && (
                            <div className="form-nested-section">
                                <p>Se sim, qual(ais) procedimentos?</p>
                                <div className="form-checkbox-group">
                                    {['intubação endotraqueal', 'ventilação mecânica', 'cateterismo vesical', 'procedimento cirúrgico', 'aspiração de vias aéreas', 'acesso venosa central', 'pequena cirurgia', 'drenagem torácica', 'outros'].map(proc => (
                                        <label key={proc} className="form-sub-label">
                                            <input type="checkbox" name="procedimentos" value={proc} checked={formData.procedimentos.includes(proc)} onChange={handleChange} /> {proc}
                                        </label>
                                    ))}
                                </div>

                                {formData.procedimentos.includes('procedimento cirúrgico') && (
                                    <div className="form-nested-section">
                                        <p>Se submetido a procedimento cirúrgico, descrever qual(ais)?</p>
                                        <textarea className="form-textarea" name="procedimentoCirurgicoDescricao" rows="2" value={formData.procedimentoCirurgicoDescricao} onChange={handleChange}></textarea>
                                    </div>
                                )}
                                {formData.procedimentos.includes('outros') && (
                                    <input className="form-input" type="text" name="outrosProcedimentos" placeholder="Especifique outros procedimentos" value={formData.outrosProcedimentos} onChange={handleChange} />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção de Exames */}
                <div className="form-section">
                    <h3>Exames</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">13. Exames aos quais o paciente foi submetido:</label>
                            <div className="form-checkbox-group">
                                {['hemograma', 'eas', 'coleta para cultura', 'outros'].map(exame => (
                                    <label key={exame} className="form-sub-label">
                                        <input type="checkbox" name="exames" value={exame} checked={formData.exames.includes(exame)} onChange={handleChange} /> {exame}
                                    </label>
                                ))}
                            </div>
                            {formData.exames.includes('outros') && (
                                <input className="form-input" type="text" name="outrosExames" placeholder="Especifique outros exames" value={formData.outrosExames} onChange={handleChange} />
                            )}
                        </div>
                        {formData.exames.includes('coleta para cultura') && (
                            <div className="form-nested-section">
                                <p>Se sim para cultura, qual material coletado?</p>
                                <input className="form-input" type="text" name="materialColetado" value={formData.materialColetado} onChange={handleChange} />
                                <p>Microrganismo identificado na cultura:</p>
                                <input className="form-input" type="text" name="microrganismo" value={formData.microrganismo} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção de Antimicrobiano */}
                <div className="form-section">
                    <h3>Antimicrobiano</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="usoAntimicrobiano">14. Paciente já em uso de antimicrobiano?</label>
                            <select className="form-select" id="usoAntimicrobiano" name="usoAntimicrobiano" value={formData.usoAntimicrobiano} onChange={handleChange}>
                                <option value="">Selecione</option>
                                <option value="sim">Sim</option>
                                <option value="não">Não</option>
                            </select>
                        </div>
                        {formData.usoAntimicrobiano === 'sim' && (
                            <div className="form-nested-section">
                                <p>Se sim, qual?</p>
                                <textarea className="form-textarea" name="antimicrobianoUsado" rows="2" value={formData.antimicrobianoUsado} onChange={handleChange}></textarea>
                            </div>
                        )}
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="mudancaAntimicrobiano">15. Realizada alguma mudança na prescrição de antimicrobiano do paciente após a realização de exames?</label>
                            <select className="form-select" id="mudancaAntimicrobiano" name="mudancaAntimicrobiano" value={formData.mudancaAntimicrobiano} onChange={handleChange}>
                                <option value="">Selecione</option>
                                <option value="sim">Sim</option>
                                <option value="não">Não</option>
                            </select>
                        </div>
                        {formData.mudancaAntimicrobiano === 'sim' && (
                            <div className="form-nested-section">
                                <p>Se sim, qual?</p>
                                <textarea className="form-textarea" name="novaPrescricao" rows="2" value={formData.novaPrescricao} onChange={handleChange}></textarea>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="observacoes">Observações importantes:</label>
                    <textarea className="form-textarea" id="observacoes" name="observacoes" rows="4" value={formData.observacoes} onChange={handleChange}></textarea>
                </div>

                <button className="primary-button" type="submit">
                    {isEditMode ? 'Atualizar' : 'Enviar Formulário'}
                </button>
            </form>
        </div>
    );
};

export default FormularioIRAS;
