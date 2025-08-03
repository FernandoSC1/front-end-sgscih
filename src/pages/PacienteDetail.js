import React, { useState, useEffect } from 'react';
import MessageBox from '../components/MessageBox'; // Importação corrigida
import DispositivoForm from '../components/DispositivoForm'; // Importação corrigida
import CulturaForm from '../components/CulturaForm'; // Importação corrigida
import AntimicrobianoForm from '../components/AntimicrobianoForm'; // Importação corrigida
import { formatDate } from '../utils/formatters'; // Importação corrigida

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PacienteDetail = ({ setCurrentPage, selectedPacienteId, setSelectedPacienteId }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const [showAddDispositivoForm, setShowAddDispositivoForm] = useState(false);
  const [editDispositivo, setEditDispositivo] = useState(null);
  const [showAddCulturaForm, setShowAddCulturaForm] = useState(false);
  const [editCultura, setEditCultura] = useState(null);
  const [showAddAntimicrobianoForm, setShowAddAntimicrobianoForm] = useState(false);
  const [editAntimicrobiano, setEditAntimicrobiano] = useState(null);

  useEffect(() => {
    if (selectedPacienteId) {
      fetchReportData(selectedPacienteId);
    }
  }, [selectedPacienteId]);

  const fetchReportData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/relatorios/transferencia/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados do paciente: ${response.statusText}`);
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    setMessage('');
    setMessageType('');
    const confirmed = window.confirm(`Tem certeza que deseja excluir este ${type}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${type}s/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao excluir ${type}.`);
      }
      setMessage(`${type} excluído com sucesso!`);
      setMessageType('success');
      fetchReportData(selectedPacienteId);
    } catch (error) {
      console.error(`Erro ao excluir ${type}:`, error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDispositivo = () => {
    setShowAddDispositivoForm(false);
    setEditDispositivo(null);
    fetchReportData(selectedPacienteId);
  };

  const handleSaveCultura = () => {
    setShowAddCulturaForm(false);
    setEditCultura(null);
    fetchReportData(selectedPacienteId);
  };

  const handleSaveAntimicrobiano = () => {
    setShowAddAntimicrobianoForm(false);
    setEditAntimicrobiano(null);
    fetchReportData(selectedPacienteId);
  };

  if (loading) return <div className="loading-message">Carregando detalhes do paciente...</div>;
  if (!reportData) return <div className="error-message">Paciente não encontrado ou erro ao carregar dados.</div>;

  const { paciente, dispositivos, culturas, antimicrobianos } = reportData;

  return (
    <div className="container">
      <h2 className="page-title">Paciente: {paciente.nome}</h2>

      <div className="button-group top-buttons">
        <button onClick={() => { setSelectedPacienteId(null); setCurrentPage('pacienteList'); }} className="button secondary-button">
          Voltar
        </button>
        <button onClick={() => { setSelectedPacienteId(paciente._id); setCurrentPage('pacienteForm'); }} className="button primary-button">
          Editar Dados
        </button>
      </div>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          Informações Gerais
        </button>
        <button className={`tab-button ${activeTab === 'dispositivos' ? 'active' : ''}`} onClick={() => setActiveTab('dispositivos')}>
          Dispositivos
        </button>
        <button className={`tab-button ${activeTab === 'culturas' ? 'active' : ''}`} onClick={() => setActiveTab('culturas')}>
          Culturas
        </button>
        <button className={`tab-button ${activeTab === 'antimicrobianos' ? 'active' : ''}`} onClick={() => setActiveTab('antimicrobianos')}>
          Antimicrobianos
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="content-section info-section">
          <h3 className="section-title">Informações do Paciente</h3>
          <p><strong>Nome:</strong> {paciente.nome}</p>
          <p><strong>Número Zero Dia:</strong> {paciente.numeroZeroDia}</p>
          <p><strong>Data de Nascimento:</strong> {formatDate(paciente.dataNascimento)}</p>
          <p><strong>Data de Admissão:</strong> {formatDate(paciente.dataAdmissao)}</p>
          <p><strong>Data de Alta:</strong> {paciente.dataAlta ? formatDate(paciente.dataAlta) : 'Não informada'}</p>
          <p><strong>Leito:</strong> {paciente.leito}</p>
          <p><strong>Setor:</strong> {paciente.setor}</p>
        </div>
      )}

      {activeTab === 'dispositivos' && (
        <div className="content-section">
          <div className="section-header">
            <h3 className="section-title">Dispositivos</h3>
            <button onClick={() => { setShowAddDispositivoForm(true); setEditDispositivo(null); }} className="button add-button">
              Adicionar Dispositivo
            </button>
          </div>
          {showAddDispositivoForm && (
            <DispositivoForm
              pacienteId={paciente._id}
              onSave={handleSaveDispositivo}
              onCancel={() => { setShowAddDispositivoForm(false); setEditDispositivo(null); }}
              dispositivoToEdit={editDispositivo}
            />
          )}
          {dispositivos.length === 0 ? (
            <p className="no-data-message">Nenhum dispositivo registrado.</p>
          ) : (
            <div className="data-list">
              {dispositivos.map((dispositivo) => (
                <div key={dispositivo._id} className="data-item">
                  {Object.keys(dispositivo).filter(key => key !== '_id' && key !== 'pacienteId' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt').map(deviceType => (
                    dispositivo[deviceType] && (dispositivo[deviceType].dataInsercao || dispositivo[deviceType].dataRemocao) && (
                      <div key={deviceType} className="device-type-info">
                        <p className="device-label">{deviceType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</p>
                        <p className="device-dates">
                          Inserção: {formatDate(dispositivo[deviceType].dataInsercao)}
                           -- Remoção: {formatDate(dispositivo[deviceType].dataRemocao)}
                        </p>
                      </div>
                    )
                  ))}
                  <div className="item-actions">
                    <button onClick={() => { setEditDispositivo(dispositivo); setShowAddDispositivoForm(true); }} className="button edit-button">
                      Editar
                    </button>
                    <button onClick={() => handleDelete('dispositivo', dispositivo._id)} className="button delete-button">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'culturas' && (
        <div className="content-section">
          <div className="section-header">
            <h3 className="section-title">Culturas</h3>
            <button onClick={() => { setShowAddCulturaForm(true); setEditCultura(null); }} className="button add-button">
              Adicionar Cultura
            </button>
          </div>
          {showAddCulturaForm && (
            <CulturaForm
              pacienteId={paciente._id}
              onSave={handleSaveCultura}
              onCancel={() => { setShowAddCulturaForm(false); setEditCultura(null); }}
              culturaToEdit={editCultura}
            />
          )}
          {culturas.length === 0 ? (
            <p className="no-data-message">Nenhuma cultura registrada.</p>
          ) : (
            <ul className="report-list">
              {culturas.map((cultura) => (
                <li key={cultura._id} className="data-item">
                  <p><strong>Tipo:</strong> {cultura.tipoCultura} 
                    <strong> -- Data da Coleta:</strong> {formatDate(cultura.dataColeta)} 
                    <strong> -- Data do Resultado:</strong> {formatDate(cultura.dataResultado) || 'N/A'}
                    <strong> -- Resultado:</strong> {cultura.resultado || 'N/A'}
                  </p>
                  <div className="item-actions">
                    <button onClick={() => { setEditCultura(cultura); setShowAddCulturaForm(true); }} className="button edit-button">
                      Editar
                    </button>
                    <button onClick={() => handleDelete('cultura', cultura._id)} className="button delete-button">
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'antimicrobianos' && (
        <div className="content-section">
          <div className="section-header">
            <h3 className="section-title">Antimicrobianos</h3>
            <button onClick={() => { setShowAddAntimicrobianoForm(true); setEditAntimicrobiano(null); }} className="button add-button">
              Adicionar Antimicrobiano
            </button>
          </div>
          {showAddAntimicrobianoForm && (
            <AntimicrobianoForm
              pacienteId={paciente._id}
              onSave={handleSaveAntimicrobiano}
              onCancel={() => { setShowAddAntimicrobianoForm(false); setEditAntimicrobiano(null); }}
              antimicrobianoToEdit={editAntimicrobiano}
            />
          )}
          {antimicrobianos.length === 0 ? (
            <p className="no-data-message">Nenhum antimicrobiano registrado.</p>
          ) : (
            <ul className="report-list">
              {antimicrobianos.map((antimicrobiano) => (
                <li key={antimicrobiano._id} className="data-item">
                  <p><strong>Medicamento:</strong> {antimicrobiano.nomeMedicamento}
                    <strong> -- Início:</strong> {formatDate(antimicrobiano.inicioTratamento)}
                    <strong> -- Fim:</strong> {antimicrobiano.fimTratamento ? formatDate(antimicrobiano.fimTratamento) : 'Em andamento'}
                    <strong> -- Houve Troca:</strong> {antimicrobiano.houveTroca ? 'Sim' : 'Não'}
                    <strong> -- Prorrogação:</strong> {antimicrobiano.prorrogacaoPrescricao ? 'Sim' : 'Não'}</p>
                  <div className="item-actions">
                    <button onClick={() => { setEditAntimicrobiano(antimicrobiano); setShowAddAntimicrobianoForm(true); }} className="button edit-button">
                      Editar
                    </button>
                    <button onClick={() => handleDelete('antimicrobiano', antimicrobiano._id)} className="button delete-button">
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default PacienteDetail;