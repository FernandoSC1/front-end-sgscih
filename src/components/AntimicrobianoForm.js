import React, { useState, useEffect } from 'react';
import MessageBox from './MessageBox'; // Importação corrigida (irmão de componente)
import { formatDateForInput } from '../utils/formatters'; // Importação corrigida (sobe um nível para utils)

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const AntimicrobianoForm = ({ pacienteId, onSave, onCancel, antimicrobianoToEdit }) => {
  const [antimicrobiano, setAntimicrobiano] = useState({
    nomeMedicamento: '',
    inicioTratamento: '',
    fimTratamento: '',
    houveTroca: false,
    prorrogacaoPrescricao: false,
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditMode = !!antimicrobianoToEdit;

  useEffect(() => {
    if (antimicrobianoToEdit) {
      setAntimicrobiano({
        ...antimicrobianoToEdit,
        inicioTratamento: formatDateForInput(antimicrobianoToEdit.inicioTratamento),
        fimTratamento: formatDateForInput(antimicrobianoToEdit.fimTratamento),
      });
    } else {
      setAntimicrobiano({
        nomeMedicamento: '',
        inicioTratamento: '',
        fimTratamento: '',
        houveTroca: false,
        prorrogacaoPrescricao: false,
      });
    }
  }, [antimicrobianoToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAntimicrobiano((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode
        ? `${API_BASE_URL}/antimicrobianos/${antimicrobianoToEdit._id}`
        : `${API_BASE_URL}/antimicrobianos`;

      const payload = { ...antimicrobiano, pacienteId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} antimicrobiano.`);
      }

      setMessage(`Antimicrobiano ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`);
      setMessageType('success');
      onSave();
    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} antimicrobiano:`, error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section sub-form">
      <h3 className="section-title sub-form-title">
        {isEditMode ? 'Editar Antimicrobiano' : 'Adicionar Antimicrobiano'}
      </h3>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-group">
          <label htmlFor="nomeMedicamento">Nome do Medicamento:</label>
          <input type="text" id="nomeMedicamento" name="nomeMedicamento" value={antimicrobiano.nomeMedicamento} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="inicioTratamento">Início do Tratamento:</label>
          <input type="date" id="inicioTratamento" name="inicioTratamento" value={antimicrobiano.inicioTratamento} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="fimTratamento">Fim do Tratamento (Opcional):</label>
          <input type="date" id="fimTratamento" name="fimTratamento" value={antimicrobiano.fimTratamento} onChange={handleChange} />
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="houveTroca" name="houveTroca" checked={antimicrobiano.houveTroca} onChange={handleChange} />
          <label htmlFor="houveTroca">Houve Troca?</label>
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="prorrogacaoPrescricao" name="prorrogacaoPrescricao" checked={antimicrobiano.prorrogacaoPrescricao} onChange={handleChange} />
          <label htmlFor="prorrogacaoPrescricao">Prorrogação de Prescrição?</label>
        </div>
        <div className="button-group form-actions">
          <button type="button" onClick={onCancel} className="button secondary-button">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="button primary-button">
            {loading ? (isEditMode ? 'Atualizando...' : 'Adicionando...') : (isEditMode ? 'Atualizar' : 'Adicionar')} Antimicrobiano
          </button>
        </div>
      </form>
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default AntimicrobianoForm;