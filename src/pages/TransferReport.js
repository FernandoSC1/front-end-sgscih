import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import MessageBox from '../components/MessageBox'; // Importação corrigida
import { formatDate } from '../utils/formatters'; // Importação corrigida

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const TransferReport = ({ setCurrentPage }) => {
  const [numeroZeroDia, setNumeroZeroDia] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setReportData(null); // Limpa o relatório anterior

    if (!numeroZeroDia) {
      setMessage('Por favor, insira o Número Zero Dia.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/relatorios/transferencia/numeroZeroDia/${numeroZeroDia}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar relatório de transferência.');
      }
      const data = await response.json();
      setReportData(data);
      setMessage('Relatório gerado com sucesso!');
      setMessageType('success');
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      setMessage(`Erro: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = () => {
    if (!reportData) {
      setMessage('Nenhum relatório para gerar PDF.');
      setMessageType('error');
      return;
    }

    const reportContent = document.getElementById('report-content');
    if (!reportContent) {
      setMessage('Conteúdo do relatório não encontrado para gerar PDF.');
      setMessageType('error');
      return;
    }

    html2canvas(reportContent, {
      scale: 3,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const marginLeft = 12;
      const marginRight = 8;
      const marginTop = 5;
      const marginBottom = 10;

      const pdfPageWidth = pdf.internal.pageSize.width;
      const pdfPageHeight = pdf.internal.pageSize.height;

      const contentPrintableWidth = pdfPageWidth - marginLeft - marginRight;
      const scaledCanvasHeight = canvas.height * (contentPrintableWidth / canvas.width);

      let heightLeft = scaledCanvasHeight;
      let pageNum = 1;
      const contentHeightPerPage = pdfPageHeight - marginTop - marginBottom;
      const totalPages = Math.ceil(scaledCanvasHeight / contentHeightPerPage);

      // Adiciona a primeira página
      pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, contentPrintableWidth, scaledCanvasHeight);
      pdf.setFontSize(10);
      pdf.text(`Página ${pageNum} de ${totalPages}`, pdfPageWidth / 2, pdfPageHeight - marginBottom + 5, { align: 'center' });

      heightLeft -= contentHeightPerPage;

      while (heightLeft > 0) {
        pdf.addPage();
        pageNum++;

        const currentSliceY = scaledCanvasHeight - heightLeft - contentHeightPerPage;
        let position = -currentSliceY;

        // Adiciona a imagem para a página atual
        pdf.addImage(imgData, 'PNG', marginLeft, marginTop + position, contentPrintableWidth, scaledCanvasHeight);

        // Adiciona o número da página para as páginas subsequentes
        pdf.text(`Página ${pageNum} de ${totalPages}`, pdfPageWidth / 2, pdfPageHeight - marginBottom + 5, { align: 'center' });
        heightLeft -= contentHeightPerPage;
      }

      pdf.save(`${reportData.paciente.nome} - ${reportData.paciente.numeroZeroDia}.pdf`);
      setMessage('PDF gerado com sucesso!');
      setMessageType('success');
    }).catch(error => {
      console.error('Erro ao gerar PDF:', error);
      setMessage(`Erro ao gerar PDF: ${error.message}`);
      setMessageType('error');
    });
  };

  return (
    <div className="container">
      <h2 className="page-title">Gerar Relatório de Transferência</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Número Zero Dia do Paciente"
          value={numeroZeroDia}
          onChange={(e) => setNumeroZeroDia(e.target.value)}
          className="text-input"
          required
        />
        <button type="submit" disabled={loading} className="button primary-button">
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </form>

      {reportData && (
        <div id="report-content" className="report-container">
          <div className='report-div-img'>
            <img className='report-img' src="/logo_tripla.png" alt="Logo" /> {/* Caminho da imagem ajustado */}
            <p className='report-p-img'></p>
          </div>
          <h4 className='report-title'>RELATÓRIO SCIH</h4>
          <h3 className="section-title">Dados do Paciente:</h3>
          <div className="report-details">
            <p><strong>Nome:</strong> {reportData.paciente.nome}</p>
            <p><strong>Número Zero Dia:</strong> {reportData.paciente.numeroZeroDia}</p>
            <p><strong>Data de Nascimento:</strong> {formatDate(reportData.paciente.dataNascimento)}</p>
            <p><strong>Data de Admissão:</strong> {formatDate(reportData.paciente.dataAdmissao)}</p>
            <p><strong>Data de Alta:</strong> {reportData.paciente.dataAlta ? formatDate(reportData.paciente.dataAlta) : 'Não informada'}</p>
            <p><strong>Leito:</strong> {reportData.paciente.leito}</p>
            <p><strong>Setor:</strong> {reportData.paciente.setor}</p>
          </div>

          <h4 className="sub-section-title">Dispositivos</h4>
          {reportData.dispositivos.length === 0 ? (
            <p className="no-data-message">Nenhum dispositivo registrado.</p>
          ) : (
            <ul className="report-list">
              {reportData.dispositivos.map((dispositivo, index) => (
                <li key={index} className="report-item">
                  {Object.keys(dispositivo).filter(key => key !== '_id' && key !== 'pacienteId' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt').map(deviceType => (
                    dispositivo[deviceType] && (dispositivo[deviceType].dataInsercao || dispositivo[deviceType].dataRemocao) && (
                      <span key={deviceType}>
                        <strong className="item-label">{deviceType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> Inserção: {formatDate(dispositivo[deviceType].dataInsercao)}, Remoção: {formatDate(dispositivo[deviceType].dataRemocao)}
                        <br/>
                      </span>
                    )
                  ))}
                </li>
              ))}
            </ul>
          )}
          <h4 className="sub-section-title">Culturas</h4>
          {reportData.culturas.length === 0 ? (
            <p className="no-data-message">Nenhuma cultura registrada.</p>
          ) : (
            <ul className="report-list">
              {reportData.culturas.map((cultura, index) => (
                <li key={index} className="report-item">
                  <strong className="item-label">Tipo:</strong> {cultura.tipoCultura}, <strong className="item-label">Data da Coleta:</strong> {formatDate(cultura.dataColeta)}, <strong className="item-label">Data do Resultado:</strong> {formatDate(cultura.dataResultado) || 'N/A'}, <strong className="item-label">Resultado:</strong> {cultura.resultado || 'N/A'}
                </li>
              ))}
            </ul>
          )}

          <h4 className="sub-section-title">Antimicrobianos</h4>
          {reportData.antimicrobianos.length === 0 ? (
            <p className="no-data-message">Nenhum antimicrobiano registrado.</p>
          ) : (
            <ul className="report-list">
              {reportData.antimicrobianos.map((antimicrobiano, index) => (
                <li key={index} className="report-item">
                  <strong className="item-label">Medicamento:</strong> {antimicrobiano.nomeMedicamento}, <strong className="item-label">Início:</strong> {formatDate(antimicrobiano.inicioTratamento)}, <strong className="item-label">Fim:</strong> {antimicrobiano.fimTratamento ? formatDate(antimicrobiano.fimTratamento) : 'Em andamento'}, <strong className="item-label">Troca:</strong> {antimicrobiano.houveTroca ? 'Sim' : 'Não'}, <strong className="item-label">Prorrogação:</strong> {antimicrobiano.prorrogacaoPrescricao ? 'Sim' : 'Não'}
                </li>
              ))}
            </ul>
          )}
          <p className='report-assinatura'>
            <br/>
            <br/>
            <br/>
            <div className='report-div-img'>
              <img className='report-assinatura-img' src="/assinatura.png" alt="Assinatura" /> {/* Caminho da imagem ajustado */}
            </div>
            Fernando da Silva Costa <br/>
            Coren-MA 416494 <br/>
            Coordenação do SCIH
          </p>
        </div>
      )}
      {reportData && (
        <div className="button-group report-actions">
          <button onClick={generatePdf} className="button primary-button">
            Gerar PDF do Relatório
          </button>
        </div>
      )}
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default TransferReport;