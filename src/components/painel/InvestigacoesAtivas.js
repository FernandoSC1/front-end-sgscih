// components/painel/InvestigacoesAtivas.js
import React, { useState, useEffect } from 'react';

const InvestigacoesAtivas = ({ setCurrentPage, setSelectedPacienteId }) => {
    const [investigacoes, setInvestigacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvestigacoes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/painel/investigacoes');
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados do servidor.');
                }
                const data = await response.json();
                setInvestigacoes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestigacoes();
    }, []);

    const handlePacienteClick = (pacienteId) => {
        setSelectedPacienteId(pacienteId);
        setCurrentPage('pacienteDetail');
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (loading) return <p className="loading-message">Carregando investigações...</p>;
    if (error) return <p className="error-message">Erro: {error}</p>;

    return (
        <div className="table-container">
            <h3>Pacientes em Investigação de IRAS</h3>
            {investigacoes.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nº Zero Dia</th>
                            <th>Nome do Paciente</th>
                            <th>Data Início Sintomas</th>
                            <th>Sinais e Sintomas</th>
                            <th>Resultados de Culturas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {investigacoes.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <button onClick={() => handlePacienteClick(item.pacienteInfo._id)} className="link-button">
                                        {item.pacienteInfo.numeroZeroDia}
                                    </button>
                                </td>
                                <td>{item.pacienteInfo.nome}</td>
                                <td>{formatDate(item.dataPrimeiroSinal)}</td>
                                <td>{item.sinaisSintomas.join(', ')}</td>
                                <td>
                                    {item.culturasRelacionadas.length > 0 ? (
                                        <ul className="painel-data-list">
                                            {item.culturasRelacionadas.map(c => (
                                                <li key={c._id}>
                                                    {c.tipoCultura}: {c.resultado || 'Aguardando'}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : 'Nenhuma cultura associada'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-data-message">Nenhum paciente em investigação no momento.</p>
            )}
        </div>
    );
};

export default InvestigacoesAtivas;
