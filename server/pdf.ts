import { Rdo, Project, WorkforceItem, EquipmentItem, ActivityItem, OccurrenceItem, CommentItem, PhotoItem } from "@shared/schema";
import PDFDocument from 'pdfkit';
import { storage } from './storage';

// Função para gerar um PDF profissional para o RDO
export async function generatePdfRdo(rdo: Rdo, project: Project): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar as fotos relacionadas ao RDO
      const photos = await storage.getPhotosByRdoId(rdo.id);
      
      // Criação do documento PDF com configurações para Português do Brasil
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `RDO #${rdo.number} - ${project.name}`,
          Author: 'Diário de Obra Pro',
          Subject: 'Relatório Diário de Obra',
          Keywords: 'RDO, construção, obra, relatório',
          CreationDate: new Date(),
          Language: 'pt-BR'
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

      // ======================
      // CABEÇALHO DO DOCUMENTO
      // ======================
      
      // Caso exista um logo, adicionar aqui
      // doc.image('path/to/logo.png', 50, 45, { width: 50 });
      
      // Título principal com o número do RDO em destaque
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#333333')
        .text(`RELATÓRIO DIÁRIO DE OBRA - RDO #${rdo.number}`, { align: 'center' });
      
      doc.moveDown(0.5);
      
      // Informações do projeto e RDO em um box destacado
      doc.rect(50, doc.y, 495, 80)
        .fillAndStroke('#f8f9fa', '#dee2e6');
        
      doc.fillColor('#333333').fontSize(12);
      // Número do RDO em destaque com tamanho maior e cor diferente
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#2563eb')
        .text(`Relatório Nº ${rdo.number}`, 70, doc.y + 15);
      doc.font('Helvetica').fontSize(12).fillColor('#333333')
        .text(`Data: ${new Date(rdo.date).toLocaleDateString('pt-BR')}`, 350, doc.y - 12);
      
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').text('Projeto:', 70, doc.y);
      doc.font('Helvetica').text(project.name, 130, doc.y - 12);
      
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').text('Cliente:', 70, doc.y);
      doc.font('Helvetica').text(project.client, 130, doc.y - 12);
      
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').text('Local:', 70, doc.y);
      doc.font('Helvetica').text(project.location, 130, doc.y - 12);
      
      // Responsável pelo relatório
      if (rdo.responsible) {
        doc.moveDown(0.4);
        doc.font('Helvetica-Bold').text('Responsável:', 70, doc.y);
        doc.font('Helvetica').text(`${rdo.responsible.name} - ${rdo.responsible.jobTitle}`, 150, doc.y - 12);
      }
      
      doc.moveDown(2);
      
      // ======================
      // CONDIÇÕES CLIMÁTICAS
      // ======================
      addSectionTitle(doc, 'CONDIÇÕES CLIMÁTICAS');
      
      // Tabela com condições climáticas
      const weatherIcons: Record<string, string> = {
        'sunny': '☀️',
        'partlycloudy': '⛅',
        'cloudy': '☁️',
        'rainy': '🌧️',
        'stormy': '⛈️',
        'snowy': '❄️',
        'foggy': '🌫️',
        'windy': '💨'
      };
      
      // Tradução das condições climáticas
      const weatherTranslations: Record<string, string> = {
        'sunny': 'Ensolarado',
        'partlycloudy': 'Parcialmente Nublado',
        'cloudy': 'Nublado',
        'rainy': 'Chuvoso',
        'stormy': 'Tempestuoso',
        'snowy': 'Neve',
        'foggy': 'Neblina',
        'windy': 'Ventoso'
      };
      
      // Cria tabela para condições climáticas
      const weatherWidth = 495;
      const colWidth = weatherWidth / 3;
      
      // Cabeçalho da tabela
      doc.font('Helvetica-Bold').fontSize(10);
      doc.rect(50, doc.y, weatherWidth, 20).fillAndStroke('#e9ecef', '#dee2e6');
      doc.fillColor('#333333');
      doc.text('Manhã', 50, doc.y - 16, { width: colWidth, align: 'center' });
      doc.text('Tarde', 50 + colWidth, doc.y - 16, { width: colWidth, align: 'center' });
      doc.text('Noite', 50 + colWidth * 2, doc.y - 16, { width: colWidth, align: 'center' });
      
      // Linha da tabela
      doc.rect(50, doc.y, weatherWidth, 30).stroke('#dee2e6');
      
      // Conteúdo das células
      doc.font('Helvetica').fontSize(10);
      const weatherY = doc.y + 10;
      
      const morningIcon = weatherIcons[rdo.weatherMorning] || '';
      const afternoonIcon = weatherIcons[rdo.weatherAfternoon] || '';
      const nightIcon = weatherIcons[rdo.weatherNight] || '';
      
      const morningText = weatherTranslations[rdo.weatherMorning] || rdo.weatherMorning;
      const afternoonText = weatherTranslations[rdo.weatherAfternoon] || rdo.weatherAfternoon;
      const nightText = weatherTranslations[rdo.weatherNight] || rdo.weatherNight;
      
      doc.text(`${morningIcon} ${morningText}`, 50, weatherY, { width: colWidth, align: 'center' });
      doc.text(`${afternoonIcon} ${afternoonText}`, 50 + colWidth, weatherY, { width: colWidth, align: 'center' });
      doc.text(`${nightIcon} ${nightText}`, 50 + colWidth * 2, weatherY, { width: colWidth, align: 'center' });
      
      doc.moveDown(2);
      
      // Observações sobre o clima
      if (rdo.weatherNotes) {
        doc.font('Helvetica-Bold').fontSize(10).text('Observações sobre o clima:');
        doc.font('Helvetica').fontSize(10).text(rdo.weatherNotes);
        doc.moveDown(1);
      }
      
      // ======================
      // MÃO DE OBRA
      // ======================
      if (Array.isArray(rdo.workforce) && rdo.workforce.length > 0) {
        addSectionTitle(doc, 'MÃO DE OBRA');
        
        // Adicionar tabela de mão de obra
        doc.font('Helvetica-Bold').fontSize(9);
        
        // Cabeçalho da tabela
        const headers = ['Função', 'Quantidade', 'Horário', 'Observações'];
        const colWidths = [150, 80, 120, 145];
        
        let y = doc.y;
        doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
        
        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        
        // Linhas da tabela
        doc.font('Helvetica').fontSize(9);
        
        (rdo.workforce as WorkforceItem[]).forEach((item, index) => {
          y += 20;
          
          // Se estiver próximo do fim da página, adicionar nova página
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            // Repetir o cabeçalho na nova página
            doc.font('Helvetica-Bold').fontSize(9);
            doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
            
            x = 50;
            headers.forEach((header, i) => {
              doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
              x += colWidths[i];
            });
            
            doc.font('Helvetica').fontSize(9);
            y += 20;
          }
          
          // Alternância de cores nas linhas
          if (index % 2 === 0) {
            doc.rect(50, y, 495, 20).fillAndStroke('#f8f9fa', '#dee2e6');
          } else {
            doc.rect(50, y, 495, 20).stroke('#dee2e6');
          }
          
          x = 50;
          doc.text(item.role, x + 5, y + 6, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(item.quantity.toString(), x + 5, y + 6, { width: colWidths[1] });
          x += colWidths[1];
          
          doc.text(`${item.startTime} - ${item.endTime}`, x + 5, y + 6, { width: colWidths[2] });
          x += colWidths[2];
          
          doc.text(item.notes || '-', x + 5, y + 6, { width: colWidths[3] });
        });
        
        doc.moveDown(2);
      }
      
      // ======================
      // EQUIPAMENTOS
      // ======================
      if (Array.isArray(rdo.equipment) && rdo.equipment.length > 0) {
        addSectionTitle(doc, 'EQUIPAMENTOS');
        
        // Adicionar tabela de equipamentos
        doc.font('Helvetica-Bold').fontSize(9);
        
        // Cabeçalho da tabela
        const headers = ['Equipamento', 'Quantidade', 'Horas', 'Observações'];
        const colWidths = [180, 80, 80, 155];
        
        let y = doc.y;
        doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
        
        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        
        // Linhas da tabela
        doc.font('Helvetica').fontSize(9);
        
        (rdo.equipment as EquipmentItem[]).forEach((item, index) => {
          y += 20;
          
          // Se estiver próximo do fim da página, adicionar nova página
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            // Repetir o cabeçalho na nova página
            doc.font('Helvetica-Bold').fontSize(9);
            doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
            
            x = 50;
            headers.forEach((header, i) => {
              doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
              x += colWidths[i];
            });
            
            doc.font('Helvetica').fontSize(9);
            y += 20;
          }
          
          // Alternância de cores nas linhas
          if (index % 2 === 0) {
            doc.rect(50, y, 495, 20).fillAndStroke('#f8f9fa', '#dee2e6');
          } else {
            doc.rect(50, y, 495, 20).stroke('#dee2e6');
          }
          
          x = 50;
          doc.text(item.name, x + 5, y + 6, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(item.quantity.toString(), x + 5, y + 6, { width: colWidths[1] });
          x += colWidths[1];
          
          doc.text(item.hours.toString(), x + 5, y + 6, { width: colWidths[2] });
          x += colWidths[2];
          
          doc.text(item.notes || '-', x + 5, y + 6, { width: colWidths[3] });
        });
        
        doc.moveDown(2);
      }
      
      // ======================
      // ATIVIDADES EXECUTADAS
      // ======================
      if (Array.isArray(rdo.activities) && rdo.activities.length > 0) {
        addSectionTitle(doc, 'ATIVIDADES EXECUTADAS');
        
        // Adicionar tabela de atividades
        doc.font('Helvetica-Bold').fontSize(9);
        
        // Cabeçalho da tabela
        const headers = ['Descrição', 'Conclusão (%)', 'Observações'];
        const colWidths = [280, 80, 135];
        
        let y = doc.y;
        doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
        
        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        
        // Linhas da tabela
        doc.font('Helvetica').fontSize(9);
        
        (rdo.activities as ActivityItem[]).forEach((item, index) => {
          y += 20;
          
          // Se estiver próximo do fim da página, adicionar nova página
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            // Repetir o cabeçalho na nova página
            doc.font('Helvetica-Bold').fontSize(9);
            doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
            
            x = 50;
            headers.forEach((header, i) => {
              doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
              x += colWidths[i];
            });
            
            doc.font('Helvetica').fontSize(9);
            y += 20;
          }
          
          // Alternância de cores nas linhas
          if (index % 2 === 0) {
            doc.rect(50, y, 495, 20).fillAndStroke('#f8f9fa', '#dee2e6');
          } else {
            doc.rect(50, y, 495, 20).stroke('#dee2e6');
          }
          
          x = 50;
          doc.text(item.description, x + 5, y + 6, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(`${item.completion}%`, x + 5, y + 6, { width: colWidths[1] });
          x += colWidths[1];
          
          doc.text(item.notes || '-', x + 5, y + 6, { width: colWidths[2] });
        });
        
        doc.moveDown(2);
      }
      
      // ======================
      // OCORRÊNCIAS
      // ======================
      if (Array.isArray(rdo.occurrences) && rdo.occurrences.length > 0) {
        addSectionTitle(doc, 'OCORRÊNCIAS');
        
        // Adicionar tabela de ocorrências
        doc.font('Helvetica-Bold').fontSize(9);
        
        // Cabeçalho da tabela
        const headers = ['Título', 'Descrição', 'Horário', 'Tags'];
        const colWidths = [120, 235, 60, 80];
        
        let y = doc.y;
        doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
        
        let x = 50;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        
        // Linhas da tabela
        doc.font('Helvetica').fontSize(9);
        
        (rdo.occurrences as OccurrenceItem[]).forEach((item, index) => {
          // Calcular altura necessária para a descrição
          const descriptionLines = Math.ceil(doc.widthOfString(item.description) / (colWidths[1] - 10)) || 1;
          const rowHeight = Math.max(20, descriptionLines * 12);
          
          y += rowHeight;
          
          // Se estiver próximo do fim da página, adicionar nova página
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            // Repetir o cabeçalho na nova página
            doc.font('Helvetica-Bold').fontSize(9);
            doc.rect(50, y, 495, 20).fillAndStroke('#e9ecef', '#dee2e6');
            
            x = 50;
            headers.forEach((header, i) => {
              doc.text(header, x + 5, y + 6, { width: colWidths[i], align: 'left' });
              x += colWidths[i];
            });
            
            doc.font('Helvetica').fontSize(9);
            y += rowHeight;
          }
          
          // Alternância de cores nas linhas
          if (index % 2 === 0) {
            doc.rect(50, y - rowHeight, 495, rowHeight).fillAndStroke('#f8f9fa', '#dee2e6');
          } else {
            doc.rect(50, y - rowHeight, 495, rowHeight).stroke('#dee2e6');
          }
          
          x = 50;
          doc.text(item.title, x + 5, y - rowHeight + 6, { width: colWidths[0] });
          x += colWidths[0];
          
          doc.text(item.description, x + 5, y - rowHeight + 6, { width: colWidths[1] });
          x += colWidths[1];
          
          doc.text(item.time, x + 5, y - rowHeight + 6, { width: colWidths[2] });
          x += colWidths[2];
          
          // Exibir tags como lista
          const tagsText = Array.isArray(item.tags) ? item.tags.join(', ') : '';
          doc.text(tagsText, x + 5, y - rowHeight + 6, { width: colWidths[3] });
        });
        
        doc.moveDown(2);
      }
      
      // ======================
      // REGISTRO FOTOGRÁFICO
      // ======================
      if (Array.isArray(photos) && photos.length > 0) {
        addSectionTitle(doc, 'REGISTRO FOTOGRÁFICO');
        
        // Como não podemos carregar imagens externas aqui, vamos apenas listar os nomes/URLs das fotos
        doc.font('Helvetica').fontSize(10);
        doc.text('FOTOS DISPONÍVEIS NO SISTEMA:', { underline: true });
        
        photos.forEach((photo, index) => {
          const caption = photo.caption || 'Sem legenda';
          const userName = photo.userName ? ` (por ${photo.userName})` : '';
          doc.text(`Foto ${index + 1}: ${caption}${userName}`);
        });
        
        doc.moveDown(1);
      }
      
      // ======================
      // COMENTÁRIOS
      // ======================
      if (Array.isArray(rdo.comments) && rdo.comments.length > 0) {
        addSectionTitle(doc, 'COMENTÁRIOS');
        
        (rdo.comments as CommentItem[]).forEach((comment, index) => {
          doc.font('Helvetica-Bold').fontSize(10).text(`Comentário ${index + 1}:`);
          
          // Se o comentário tiver informações de usuário
          if (comment.createdBy) {
            doc.font('Helvetica-Oblique').fontSize(9)
              .text(`Por: ${comment.createdBy.name} (${comment.createdBy.jobTitle}) - ${formatDate(comment.createdAt)}`);
          }
          
          doc.font('Helvetica').fontSize(10).text(comment.text);
          doc.moveDown(0.5);
        });
      }
      
      // Rodapé com data e numeração de página
      const totalPages = doc.bufferedPageCount;
      
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        
        // Linha separadora do rodapé
        doc.moveTo(50, 780).lineTo(545, 780).stroke('#dee2e6');
        
        // Data de emissão e numeração de página
        doc.font('Helvetica').fontSize(8).fillColor('#666666')
          .text(
            `Emitido em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
            50, 790
          )
          .text(
            `Página ${i + 1} de ${totalPages}`,
            545, 790, { align: 'right' }
          );
      }
      
      // Finaliza o documento
      doc.end();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return Buffer.from(`Erro ao gerar PDF: ${error}`);
    }
  });
}

// Função auxiliar para adicionar títulos de seção
function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#333333');
  doc.rect(50, doc.y, 495, 22).fillAndStroke('#e9ecef', '#dee2e6');
  doc.text(title, 60, doc.y - 16);
  doc.moveDown(0.5);
}

// Função auxiliar para formatar datas
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  } catch (e) {
    return dateStr || '';
  }
}
