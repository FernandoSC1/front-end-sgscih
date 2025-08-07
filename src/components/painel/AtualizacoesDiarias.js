// components/painel/AtualizacoesDiarias.js
import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const AtualizacoesDiarias = ({ setCurrentPage, setSelectedPacienteId }) => {
    const [atualizacoes, setAtualizacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAtualizacoes = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/painel/atualizacoes`);
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados do servidor.');
                }
                const data = await response.json();
                setAtualizacoes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAtualizacoes();
    }, []);

    const handlePacienteClick = (pacienteId) => {
        setSelectedPacienteId(pacienteId);
        setCurrentPage('pacienteDetail');
    };

    if (loading) return <p className="loading-message">Carregando atualizações...</p>;
    if (error) return <p className="error-message">Erro: {error}</p>;

    return (
        <div className="table-container">
            <h3>Atualizações Realizadas Hoje</h3>
            {atualizacoes.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nº Zero Dia</th>
                            <th>Nome do Paciente</th>
                            <th>Dispositivos</th>
                            <th>Culturas</th>
                            <th>Antimicrobianos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {atualizacoes.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <button onClick={() => handlePacienteClick(item._id)} className="link-button">
                                        {item.numeroZeroDia}
                                    </button>
                                </td>
                                <td>{item.nome}</td>
                                <td>{item.alteracaoDispositivo ? 'Sim' : 'Não'}</td>
                                <td>{item.alteracaoCultura ? 'Sim' : 'Não'}</td>
                                <td>{item.alteracaoAntimicrobiano ? 'Sim' : 'Não'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-data-message">Nenhuma atualização registrada hoje.</p>
            )}
        </div>
    );
};

export default AtualizacoesDiarias;
