import { Rdo, Project, WorkforceItem, EquipmentItem, ActivityItem, OccurrenceItem, CommentItem } from "@shared/schema";
import PDFDocument from 'pdfkit';
import { storage } from './storage';

// Função para gerar um PDF simples e organizado para o RDO
export async function generatePdfRdo(rdo: Rdo, project: Project): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar as fotos relacionadas ao RDO
      const photos = await storage.getPhotosByRdoId(rdo.id);
      
      // Criação do documento PDF com configurações simples
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `RDO #${rdo.number} - ${project.name}`,
          Author: 'Diário de Obra Pro',
          Subject: 'Relatório Diário de Obra',
          Keywords: 'RDO, construção, obra, relatório',
          CreationDate: new Date()
        }
      });

      // Array para receber os chunks de dados
      const chunks: Buffer[] = [];
      
      // Coleta o conteúdo do PDF em chunks
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      // Finaliza o documento e resolve com um Buffer contendo o PDF
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      
      // Em caso de erro, rejeitar a promessa
      doc.on('error', (err) => {
        reject(err);
      });

      //=======================
      // CABEÇALHO DO DOCUMENTO
      //=======================
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .text('RELATÓRIO DIÁRIO DE OBRA', { align: 'center' })
         .moveDown(0.5);
      
      doc.fontSize(14)
         .text(`RDO Nº ${rdo.number}`, { align: 'center' })
         .moveDown(1);

      // Informações básicas em formato de tabela simples
      const infoTable = [
        ['Projeto:', project.name],
        ['Cliente:', project.client],
        ['Local:', project.location],
        ['Data:', formatDate(rdo.date)]
      ];

      // Criar tabela de informações básicas
      doc.font('Helvetica-Bold').fontSize(11);
      infoTable.forEach(row => {
        doc.font('Helvetica-Bold').text(row[0], 50, doc.y, { continued: true, width: 150 });
        doc.font('Helvetica').text(row[1], { width: 350 }).moveDown(0.5);
      });
      
      doc.moveDown(1);
      
      //=======================
      // CONDIÇÕES CLIMÁTICAS
      //=======================
      addSectionTitle(doc, 'CONDIÇÕES CLIMÁTICAS');
      
      // Tradução das condições climáticas
      const weatherTranslations: Record<string, string> = {
        'sunny': 'Ensolarado',
        'partlycloudy': 'Parcialmente Nublado',
        'cloudy': 'Nublado',
        'rainy': 'Chuvoso',
        'stormy': 'Tempestuoso',
        'snowy': 'Neve',
        'foggy': 'Neblina',
        'windy': 'Ventoso',
        'clear': 'Céu Limpo'
      };
      
      const weatherTable = [
        ['Manhã', weatherTranslations[rdo.weatherMorning] || rdo.weatherMorning],
        ['Tarde', weatherTranslations[rdo.weatherAfternoon] || rdo.weatherAfternoon],
        ['Noite', weatherTranslations[rdo.weatherNight] || rdo.weatherNight]
      ];
      
      // Criar tabela de clima
      doc.font('Helvetica').fontSize(10);
      weatherTable.forEach(row => {
        doc.font('Helvetica-Bold').text(row[0], 50, doc.y, { continued: true, width: 80 });
        doc.font('Helvetica').text(row[1], { width: 400 }).moveDown(0.5);
      });
      
      // Observações sobre o clima
      if (rdo.weatherNotes) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Observações sobre o clima:');
        doc.font('Helvetica').text(rdo.weatherNotes).moveDown(0.5);
      }
      
      doc.moveDown(1);
      
      //=======================
      // MÃO DE OBRA
      //=======================
      if (Array.isArray(rdo.workforce) && rdo.workforce.length > 0) {
        addSectionTitle(doc, 'MÃO DE OBRA');
        
        // Cabeçalho da tabela
        const headers = ['Função', 'Horário', 'Observações'];
        const colWidths = [180, 120, 195];
        
        // Desenhar cabeçalho da tabela
        let x = 50;
        let y = doc.y;
        
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((header, i) => {
          doc.text(header, x, y, { width: colWidths[i] });
          x += colWidths[i];
        });
        
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10);
        
        // Desenhar linhas da tabela
        (rdo.workforce as WorkforceItem[]).forEach(item => {
          x = 50;
          doc.text(item.role, x, doc.y, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(`${item.startTime} - ${item.endTime}`, x, doc.y, { width: colWidths[1] });
          x += colWidths[1];
          
          doc.text(item.notes || '-', x, doc.y, { width: colWidths[2] });
          
          doc.moveDown(0.5);
        });
        
        doc.moveDown(1);
      }
      
      //=======================
      // EQUIPAMENTOS
      //=======================
      if (Array.isArray(rdo.equipment) && rdo.equipment.length > 0) {
        addSectionTitle(doc, 'EQUIPAMENTOS');
        
        // Cabeçalho da tabela
        const headers = ['Equipamento', 'Quantidade', 'Horas', 'Observações'];
        const colWidths = [180, 80, 80, 155];
        
        // Desenhar cabeçalho da tabela
        let x = 50;
        let y = doc.y;
        
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((header, i) => {
          doc.text(header, x, y, { width: colWidths[i] });
          x += colWidths[i];
        });
        
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10);
        
        // Desenhar linhas da tabela
        (rdo.equipment as EquipmentItem[]).forEach(item => {
          x = 50;
          doc.text(item.name, x, doc.y, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(item.quantity.toString(), x, doc.y, { width: colWidths[1], align: 'center' });
          x += colWidths[1];
          
          doc.text(item.hours.toString(), x, doc.y, { width: colWidths[2], align: 'center' });
          x += colWidths[2];
          
          doc.text(item.notes || '-', x, doc.y, { width: colWidths[3] });
          
          doc.moveDown(0.5);
        });
        
        doc.moveDown(1);
      }
      
      //=======================
      // ATIVIDADES EXECUTADAS
      //=======================
      if (Array.isArray(rdo.activities) && rdo.activities.length > 0) {
        addSectionTitle(doc, 'ATIVIDADES EXECUTADAS');
        
        // Cabeçalho da tabela
        const headers = ['Descrição', 'Conclusão (%)', 'Observações'];
        const colWidths = [280, 80, 135];
        
        // Desenhar cabeçalho da tabela
        let x = 50;
        let y = doc.y;
        
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((header, i) => {
          doc.text(header, x, y, { width: colWidths[i] });
          x += colWidths[i];
        });
        
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10);
        
        // Desenhar linhas da tabela
        (rdo.activities as ActivityItem[]).forEach(item => {
          x = 50;
          doc.text(item.description, x, doc.y, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(item.completion.toString() + '%', x, doc.y, { width: colWidths[1], align: 'center' });
          x += colWidths[1];
          
          doc.text(item.notes || '-', x, doc.y, { width: colWidths[2] });
          
          doc.moveDown(0.5);
        });
        
        doc.moveDown(1);
      }
      
      //=======================
      // OCORRÊNCIAS
      //=======================
      if (Array.isArray(rdo.occurrences) && rdo.occurrences.length > 0) {
        addSectionTitle(doc, 'OCORRÊNCIAS');
        
        // Cabeçalho da tabela
        const headers = ['Título', 'Horário', 'Descrição'];
        const colWidths = [170, 80, 245];
        
        // Desenhar cabeçalho da tabela
        let x = 50;
        let y = doc.y;
        
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((header, i) => {
          doc.text(header, x, y, { width: colWidths[i] });
          x += colWidths[i];
        });
        
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10);
        
        // Desenhar linhas da tabela
        (rdo.occurrences as OccurrenceItem[]).forEach(item => {
          x = 50;
          doc.text(item.title, x, doc.y, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(item.time || '-', x, doc.y, { width: colWidths[1], align: 'center' });
          x += colWidths[1];
          
          doc.text(item.description || '-', x, doc.y, { width: colWidths[2] });
          
          doc.moveDown(0.5);
        });
        
        doc.moveDown(1);
      }
      
      //=======================
      // COMENTÁRIOS
      //=======================
      if (Array.isArray(rdo.comments) && rdo.comments.length > 0) {
        addSectionTitle(doc, 'COMENTÁRIOS');
        
        doc.font('Helvetica').fontSize(10);
        
        (rdo.comments as CommentItem[]).forEach(comment => {
          doc.font('Helvetica-Bold').text(`${comment.createdBy?.name || 'Usuário'} (${formatDate(comment.createdAt)}):`, 50, doc.y);
          doc.font('Helvetica').text(comment.text, 50, doc.y).moveDown(0.5);
        });
        
        doc.moveDown(1);
      }
      
      //=======================
      // FOTOS
      //=======================
      if (photos && photos.length > 0) {
        addSectionTitle(doc, 'FOTOS');
        
        doc.font('Helvetica').fontSize(10);
        
        // Apenas listamos as fotos disponíveis (sem imagens)
        doc.text(`Total de ${photos.length} foto(s) registrada(s). As imagens podem ser visualizadas na versão online.`);

        photos.forEach((photo, index) => {
          const photoNum = index + 1;
          doc.text(`Foto ${photoNum}: ${photo.caption || 'Sem legenda'}`);
        });
      }
      
      // Finaliza o documento
      doc.end();
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      reject(error);
    }
  });
}

// Função auxiliar para adicionar títulos de seção
function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor('#333333')
     .text(title, { underline: true })
     .moveDown(0.5);
}

// Função auxiliar para formatar datas
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  
  const date = new Date(dateStr);
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}