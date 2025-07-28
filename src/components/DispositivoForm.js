import React, { useState, useEffect } from 'react';
import MessageBox from './MessageBox'; // Importação corrigida (irmão de componente)
import { formatDateForInput } from '../utils/formatters'; // Importação corrigida (sobe um nível para utils)

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const DispositivoForm = ({ pacienteId, onSave, onCancel, dispositivoToEdit }) => {
  const [dispositivo, setDispositivo] = useState({
    cateterVenosoCentral: { dataInsercao: '', dataRemocao: '' },
    sondaVesicalDemora: { dataInsercao: '', dataRemocao: '' },
    acessoVenosoPeriferico: { dataInsercao: '', dataRemocao: '' },
    tuboOroTraqueal: { dataInsercao: '', dataRemocao: '' },
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditMode = !!dispositivoToEdit;

  useEffect(() => {
    if (dispositivoToEdit) {
      const formattedDispositivo = {};
      for (const key in dispositivoToEdit) {
        if (typeof dispositivoToEdit[key] === 'object' && dispositivoToEdit[key] !== null) {
          formattedDispositivo[key] = {
            dataInsercao: formatDateForInput(dispositivoToEdit[key].dataInsercao),
            dataRemocao: formatDateForInput(dispositivoToEdit[key].dataRemocao),
          };
        }
      }
      setDispositivo(formattedDispositivo);
    } else {
      setDispositivo({
        cateterVenosoCentral: { dataInsercao: '', dataRemocao: '' },
        sondaVesicalDemora: { dataInsercao: '', dataRemocao: '' },
        acessoVenosoPeriferico: { dataInsercao: '', dataRemocao: '' },
        tuboOroTraqueal: { dataInsercao: '', dataRemocao: '' },
      });
    }
  }, [dispositivoToEdit]);

  const handleChange = (e, type, field) => {
    const { value } = e.target;
    setDispositivo((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode
        ? `${API_BASE_URL}/dispositivos/${dispositivoToEdit._id}`
        : `${API_BASE_URL}/dispositivos`;

      const payload = { ...dispositivo, pacienteId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} dispositivo.`);
      }

      setMessage(`Dispositivo ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`);
      setMessageType('success');
      onSave();
    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} dispositivo:`, error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const deviceTypes = [
    { key: 'cateterVenosoCentral', label: 'Cateter Venoso Central' },
    { key: 'sondaVesicalDemora', label: 'Sonda Vesical de Demora' },
    { key: 'acessoVenosoPeriferico', label: 'Acesso Venoso Periférico' },
    { key: 'tuboOroTraqueal', label: 'Tubo Orotraqueal' },
  ];

  return (
    <div className="form-section sub-form">
      <h3 className="section-title sub-form-title">
        {isEditMode ? 'Editar Dispositivo' : 'Adicionar Dispositivo'}
      </h3>
      <form onSubmit={handleSubmit} className="data-form">
        {deviceTypes.map((device) => (
          <fieldset key={device.key} className="form-fieldset">
            <legend>{device.label}</legend>
            <div className="form-group">
              <label htmlFor={`${device.key}-dataInsercao`}>Data Inserção:</label>
              <input
                type="date"
                id={`${device.key}-dataInsercao`}
                name="dataInsercao"
                value={dispositivo[device.key]?.dataInsercao || ''}
                onChange={(e) => handleChange(e, device.key, 'dataInsercao')}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`${device.key}-dataRemocao`}>Data Remoção:</label>
              <input
                type="date"
                id={`${device.key}-dataRemocao`}
                name="dataRemocao"
                value={dispositivo[device.key]?.dataRemocao || ''}
                onChange={(e) => handleChange(e, device.key, 'dataRemocao')}
              />
            </div>
          </fieldset>
        ))}
        <div className="button-group form-actions">
          <button type="button" onClick={onCancel} className="button secondary-button">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="button primary-button">
            {loading ? (isEditMode ? 'Atualizando...' : 'Adicionando...') : (isEditMode ? 'Atualizar' : 'Adicionar')} Dispositivo
          </button>
        </div>
      </form>
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default DispositivoForm;