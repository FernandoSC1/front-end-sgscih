// components/painel/UsoAntimicrobianos.js
import React, { useState, useEffect } from 'react';

const UsoAntimicrobianos = ({ setCurrentPage, setSelectedPacienteId }) => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/painel/uso-antimicrobianos');
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados do servidor.');
                }
                const data = await response.json();
                setPacientes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDados();
    }, []);

    const handlePacienteClick = (pacienteId) => {
        setSelectedPacienteId(pacienteId);
        setCurrentPage('pacienteDetail');
    };

    if (loading) return <p className="loading-message">Carregando pacientes...</p>;
    if (error) return <p className="error-message">Erro: {error}</p>;

    return (
        <div className="table-container">
            <h3>Pacientes em Uso de Antimicrobianos</h3>
            {pacientes.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nº Zero Dia</th>
                            <th>Nome do Paciente</th>
                            <th>Antimicrobianos em Uso (Duração)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientes.map((paciente) => (
                            <tr key={paciente._id}>
                                <td>
                                    <button onClick={() => handlePacienteClick(paciente._id)} className="link-button">
                                        {paciente.numeroZeroDia}
                                    </button>
                                </td>
                                <td>{paciente.nome}</td>
                                <td>
                                    <ul className="painel-data-list">
                                        {paciente.antimicrobianos.map(atm => (
                                            <li key={atm._id} className={atm.alertaUsoProlongado ? 'alerta-prolongado' : ''}>
                                                {atm.nomeMedicamento} ({atm.diasDeUso} dias)
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-data-message">Nenhum paciente em uso de antimicrobianos no momento.</p>
            )}
        </div>
    );
};

export default UsoAntimicrobianos;
