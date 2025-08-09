// pages/PainelGestao.js
import React, { useState } from 'react';
import AtualizacoesDiarias from '../components/painel/AtualizacoesDiarias';
import UsoAntimicrobianos from '../components/painel/UsoAntimicrobianos';
import InvestigacoesAtivas from '../components/painel/InvestigacoesAtivas';

const PainelGestao = ({ setCurrentPage, setSelectedPacienteId, setSelectedIrasId }) => {
    // DEBUG: Adicionado para verificar se a prop está a ser recebida
    console.log('A função setSelectedIrasId é do tipo:', typeof setSelectedIrasId);

    const [activeTab, setActiveTab] = useState('atualizacoes');

    const renderContent = () => {
        switch (activeTab) {
            case 'atualizacoes':
                return <AtualizacoesDiarias setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
            case 'usoAtm':
                return <UsoAntimicrobianos setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
            case 'investigacoes':
                // A função é passada como prop para InvestigacoesAtivas
                return <InvestigacoesAtivas setCurrentPage={setCurrentPage} setSelectedIrasId={setSelectedIrasId} />;
            default:
                return <AtualizacoesDiarias setCurrentPage={setCurrentPage} setSelectedPacienteId={setSelectedPacienteId} />;
        }
    };

    return (
        <div className="container">
            <div className="painel-header">
                <h2 className="page-title">Painel de Gestão</h2>
                <button
                    onClick={() => setCurrentPage('pacienteList')}
                    className="button secondary-button"
                >
                    Voltar
                </button>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'atualizacoes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('atualizacoes')}
                >
                    Atualizações do Dia
                </button>
                <button
                    className={`tab-button ${activeTab === 'usoAtm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('usoAtm')}
                >
                    Uso de Antimicrobianos
                </button>
                <button
                    className={`tab-button ${activeTab === 'investigacoes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('investigacoes')}
                >
                    Investigações de IRAS
                </button>
            </div>
            <div className="content-section">
                {renderContent()}
            </div>
        </div>
    );
};

export default PainelGestao;
