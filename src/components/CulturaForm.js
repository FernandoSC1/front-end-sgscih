import React, { useState, useEffect } from 'react';
import MessageBox from './MessageBox'; // Importação corrigida (irmão de componente)
import { formatDateForInput } from '../utils/formatters'; // Importação corrigida (sobe um nível para utils)

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const CulturaForm = ({ pacienteId, onSave, onCancel, culturaToEdit }) => {
  const [cultura, setCultura] = useState({
    tipoCultura: '',
    dataColeta: '',
    dataResultado: '',
    resultado: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditMode = !!culturaToEdit;

  useEffect(() => {
    if (culturaToEdit) {
      setCultura({
        ...culturaToEdit,
        dataColeta: formatDateForInput(culturaToEdit.dataColeta),
        dataResultado: formatDateForInput(culturaToEdit.dataResultado),
      });
    } else {
      setCultura({
        tipoCultura: '',
        dataColeta: '',
        dataResultado: '',
        resultado: '',
      });
    }
  }, [culturaToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCultura((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode
        ? `${API_BASE_URL}/culturas/${culturaToEdit._id}`
        : `${API_BASE_URL}/culturas`;

      const payload = { ...cultura, pacienteId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} cultura.`);
      }

      setMessage(`Cultura ${isEditMode ? 'atualizada' : 'adicionada'} com sucesso!`);
      setMessageType('success');
      onSave();
    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} cultura:`, error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section sub-form">
      <h3 className="section-title sub-form-title">
        {isEditMode ? 'Editar Cultura' : 'Adicionar Cultura'}
      </h3>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-group">
          <label htmlFor="tipoCultura">Tipo de Cultura:</label>
          <select id="tipoCultura" name="tipoCultura" value={cultura.tipoCultura} onChange={handleChange} required>
            <option value="">Selecione um tipo</option>
            <option value="hemocultura">Hemocultura</option>
            <option value="urocultura">Urocultura</option>
            <option value="culturaSecrecaoTraqueal">Cultura Secreção Traqueal</option>
            <option value="culturaPontaCateter">Cultura Ponta Cateter</option>
            <option value="culturaSwabNasal">Cultura Swab Nasal</option>
            <option value="culturaSwabAxilar">Cultura Swab Axilar</option>
            <option value="culturaSwabRetal">Cultura Swab Retal</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dataColeta">Data de Coleta:</label>
          <input type="date" id="dataColeta" name="dataColeta" value={cultura.dataColeta} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="dataResultado">Data do Resultado (Opcional):</label>
          <input type="date" id="dataResultado" name="dataResultado" value={cultura.dataResultado} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="resultado">Resultado (Opcional):</label>
          <input type="text" id="resultado" name="resultado" value={cultura.resultado} onChange={handleChange} />
        </div>
        <div className="button-group form-actions">
          <button type="button" onClick={onCancel} className="button secondary-button">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="button primary-button">
            {loading ? (isEditMode ? 'Atualizando...' : 'Adicionando...') : (isEditMode ? 'Atualizar' : 'Adicionar')} Cultura
          </button>
        </div>
      </form>
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default CulturaForm;