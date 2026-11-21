import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ItemCalculado } from '../types';
import { formatNumero } from './calculator';

interface GerarPdfParams {
  pedidoId?: string;
  acabamento?: string;
  dataEmissao?: string;
  quantidadePecas: number;
  pecasPorPack?: number;
  quantidadePacks?: number;
  itens: ItemCalculado[];
  autoOpen?: boolean;
}

export function gerarChecklistPDF({
  pedidoId,
  acabamento,
  dataEmissao,
  itens,
  autoOpen = true,
}: GerarPdfParams): { blobUrl: string; open: () => void } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Título Principal do Cabeçalho (sem formato de tabela)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('Checklist de Insumos', pageWidth / 2, 22, { align: 'center' });

  // Informações destacadas do cabeçalho: somente Referência e Acabamento
  const infoY = 37;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  const labelRef = 'Referência: ';
  doc.text(labelRef, 14, infoY);
  const labelRefWidth = doc.getTextWidth(labelRef);

  const refText = pedidoId?.trim() ? pedidoId.trim() : 'Não informada';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(refText, 14 + labelRefWidth, infoY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  const labelAcab = 'Acabamento: ';
  doc.text(labelAcab, 108, infoY);
  const labelAcabWidth = doc.getTextWidth(labelAcab);

  const acabamentoText = acabamento?.trim() ? acabamento.trim() : 'Não informado';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(acabamentoText, 108 + labelAcabWidth, infoY);

  // Linha divisória sutil abaixo do cabeçalho
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 44, pageWidth - 14, 44);

  // Tabela de Itens (somente Código, Insumo e Separar)
  const tableData = itens.map((item) => {
    const isPack = item.insumo.baseCalculo === 'pack';
    const tagBase = isPack ? ' (por pack)' : '';
    const codigoInsumo = item.insumo.codigo?.trim() ? item.insumo.codigo.trim() : '—';
    const nomeInsumo = `${item.insumo.nome}${tagBase}`;

    const tipoEmbalagemPlural =
      item.calculo.quantidadeEmbalagens === 1
        ? item.insumo.tipoEmbalagem.toLowerCase()
        : `${item.insumo.tipoEmbalagem.toLowerCase()}s`;
    const separar = `${formatNumero(item.calculo.quantidadeEmbalagens)} ${tipoEmbalagemPlural} (${formatNumero(item.calculo.quantidadeSeparada)} ${item.insumo.unidade})`;

    return [
      codigoInsumo,
      nomeInsumo,
      separar,
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [['Código', 'Insumo', 'Separar']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 12,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
      cellPadding: 5.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontSize: 13,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 5.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 42, fontStyle: 'bold', fontSize: 12 },
      1: { halign: 'left', cellWidth: 70, fontStyle: 'bold', fontSize: 12 },
      2: { halign: 'right', fontStyle: 'bold', fontSize: 12.5 },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 0) {
        data.cell.styles.halign = 'center';
      }
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right';
      }
    },
  });

  // Posição vertical após a tabela
  // @ts-expect-error lastAutoTable está disponível no objeto doc via jspdf-autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 130;

  // Altura necessária para o rodapé (3 assinaturas + observações) ~ 54mm
  let rodapeY = Math.max(finalY + 8, 215);

  if (rodapeY + 54 > 285) {
    if (finalY + 54 > 285) {
      doc.addPage();
      rodapeY = 30;
    } else {
      rodapeY = 285 - 54;
    }
  }

  // Formatação automática da data de geração do PDF
  const dataDoc = dataEmissao ? new Date(dataEmissao) : new Date();
  const dia = String(dataDoc.getDate()).padStart(2, '0');
  const mes = String(dataDoc.getMonth() + 1).padStart(2, '0');
  const ano = dataDoc.getFullYear();
  const dataAutomatica = `${dia}/${mes}/${ano}`;

  // Configuração para as assinaturas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  const colAssinaturaInicio = 46;
  const colAssinaturaFim = 132;
  const colDataX = 138;

  // 1. Assinatura do Conferente (com data gerada automaticamente)
  const yConferente = rodapeY;
  doc.text('Conferente:', 18, yConferente);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(colAssinaturaInicio, yConferente, colAssinaturaFim, yConferente);
  doc.text(`Data: ${dataAutomatica}`, colDataX, yConferente);

  // 2. Assinatura do Motorista
  const yMotorista = rodapeY + 11;
  doc.text('Motorista:', 18, yMotorista);
  doc.line(colAssinaturaInicio, yMotorista, colAssinaturaFim, yMotorista);
  doc.text('Data: _____ / _____ / _________', colDataX, yMotorista);

  // 3. Assinatura do Acabamento
  const yAcabamento = rodapeY + 22;
  doc.text('Acabamento:', 18, yAcabamento);
  doc.line(colAssinaturaInicio, yAcabamento, colAssinaturaFim, yAcabamento);
  doc.text('Data: _____ / _____ / _________', colDataX, yAcabamento);

  // Observações
  const obsY = rodapeY + 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('Observações:', 18, obsY);

  doc.setDrawColor(226, 232, 240);
  doc.line(18, obsY + 8, pageWidth - 18, obsY + 8);
  doc.line(18, obsY + 16, pageWidth - 18, obsY + 16);

  // Define o título do documento e abre diretamente no navegador (se autoOpen for true)
  const tituloDoc = `Checklist - ${pedidoId?.trim() ? pedidoId.trim() : 'Pedido'}`;
  doc.setProperties({ title: tituloDoc });

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const open = () => {
    window.open(blobUrl, '_blank');
  };

  if (autoOpen) {
    open();
  }

  return { blobUrl, open };
}
