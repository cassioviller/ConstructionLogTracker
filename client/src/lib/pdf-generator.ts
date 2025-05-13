import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { RDO, Workforce, Equipment, Activity, Occurrence } from '@shared/schema';

// Add the autotable plugin to the jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface GeneratePDFOptions {
  rdo: RDO;
  workforce: Workforce[];
  equipment: Equipment[];
  activities: Activity[];
  occurrences: Occurrence[];
  companyName?: string;
  companyLogo?: string;
  projectName: string;
  projectLocation: string;
  projectClient: string;
  userName: string;
  userRole: string;
  photoUrls?: { url: string; caption?: string }[];
}

// Helper to translate status values
const translateStatus = (status: string) => {
  switch (status) {
    case 'in_progress': return 'Em andamento';
    case 'completed': return 'Concluído';
    case 'pending': return 'Pendente';
    default: return status;
  };
};

// Helper to translate weather values
const translateWeather = (weather: string) => {
  switch (weather) {
    case 'ensolarado': return 'Ensolarado';
    case 'nublado': return 'Nublado';
    case 'chuvoso': return 'Chuvoso';
    case 'ventoso': return 'Ventoso';
    case 'limpo': return 'Limpo (Noite)';
    default: return weather;
  };
};

// Main function to generate PDF
export const generateRDOPDF = async (options: GeneratePDFOptions): Promise<Blob> => {
  const {
    rdo,
    workforce,
    equipment,
    activities,
    occurrences,
    companyName,
    companyLogo,
    projectName,
    projectLocation,
    projectClient,
    userName,
    userRole,
    photoUrls,
  } = options;

  // Create new PDF document in portrait, A4 format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set default font
  doc.setFont('helvetica');

  // Add company header
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 153); // Primary color

  if (companyLogo) {
    try {
      // Add company logo if available
      doc.addImage(companyLogo, 'JPEG', 10, 10, 30, 20);
      doc.text(companyName || 'Meu Diário de Obra Pro', 45, 20);
    } catch (e) {
      // If image loading fails, just show company name
      doc.text(companyName || 'Meu Diário de Obra Pro', 10, 20);
    }
  } else {
    doc.text(companyName || 'Meu Diário de Obra Pro', 10, 20);
  }

  // Add RDO title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`RELATÓRIO DIÁRIO DE OBRA - RDO #${rdo.reportNumber}`, 10, 40);

  // Add project info
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  
  doc.text(`Projeto: ${projectName}`, 10, 50);
  doc.text(`Cliente: ${projectClient}`, 10, 55);
  doc.text(`Local: ${projectLocation}`, 10, 60);
  doc.text(`Data: ${new Date(rdo.date).toLocaleDateString('pt-BR')}`, 150, 50);
  doc.text(`Responsável: ${userName}`, 150, 55);
  doc.text(`Função: ${userRole}`, 150, 60);

  let yPosition = 70;

  // Add weather section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('CONDIÇÕES CLIMÁTICAS', 10, yPosition);
  
  yPosition += 5;
  
  doc.setFontSize(10);
  doc.autoTable({
    startY: yPosition,
    head: [['Período', 'Condição', 'Observações']],
    body: [
      ['Manhã', translateWeather(rdo.weatherMorning), ''],
      ['Tarde', translateWeather(rdo.weatherAfternoon), ''],
      ['Noite', translateWeather(rdo.weatherNight), ''],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
    margin: { left: 10, right: 10 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  if (rdo.weatherNotes) {
    doc.text('Observações climáticas:', 10, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(rdo.weatherNotes, 10, yPosition, { maxWidth: 180 });
    yPosition += 10;
  }

  // Add workforce section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('MÃO DE OBRA', 10, yPosition);
  
  yPosition += 5;
  
  if (workforce.length > 0) {
    const workforceData = workforce.map(w => [
      w.role,
      w.quantity.toString(),
      w.startTime && w.endTime ? `${w.startTime} - ${w.endTime}` : '-',
      w.notes || '-'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Função', 'Qtd.', 'Horário', 'Observações']],
      body: workforceData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.text('Nenhuma mão de obra registrada.', 10, yPosition + 5);
    yPosition += 15;
  }

  // Add equipment section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('EQUIPAMENTOS', 10, yPosition);
  
  yPosition += 5;
  
  if (equipment.length > 0) {
    const equipmentData = equipment.map(e => [
      e.name,
      e.quantity.toString(),
      e.hoursUsed ? e.hoursUsed.toString() : '-',
      e.notes || '-'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Equipamento', 'Qtd.', 'Horas Uso', 'Observações']],
      body: equipmentData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.text('Nenhum equipamento registrado.', 10, yPosition + 5);
    yPosition += 15;
  }

  // Check if we need a new page for activities
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Add activities section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('ATIVIDADES EXECUTADAS', 10, yPosition);
  
  yPosition += 5;
  
  if (activities.length > 0) {
    const activitiesData = activities.map(a => [
      a.description,
      `${a.completionPercentage}%`,
      translateStatus(a.status)
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Descrição', 'Conclusão', 'Status']],
      body: activitiesData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 50, halign: 'center' }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.text('Nenhuma atividade registrada.', 10, yPosition + 5);
    yPosition += 15;
  }

  // Check if we need a new page for occurrences
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Add occurrences section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('OCORRÊNCIAS', 10, yPosition);
  
  yPosition += 5;
  
  if (occurrences.length > 0) {
    const occurrencesData = occurrences.map(o => [
      o.title,
      o.description,
      o.time || '-',
      o.tags?.join(', ') || '-'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Título', 'Descrição', 'Horário', 'Tags']],
      body: occurrencesData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20 },
        3: { cellWidth: 40 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.text('Nenhuma ocorrência registrada.', 10, yPosition + 5);
    yPosition += 15;
  }

  // Add photos if available
  if (photoUrls && photoUrls.length > 0) {
    // Start a new page for photos
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('REGISTRO FOTOGRÁFICO', 10, yPosition);
    
    yPosition += 10;
    
    // Layout: 2 photos per row, with captions
    const photoWidth = 85; // mm
    const photoHeight = 60; // mm
    let xPosition = 10;
    
    for (let i = 0; i < photoUrls.length; i++) {
      const photo = photoUrls[i];
      
      // Check if we need a new page or new row
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
        xPosition = 10;
      }
      
      if (xPosition > 100) {
        xPosition = 10;
        yPosition += photoHeight + 20; // Photo height plus caption space
      }
      
      try {
        // Add the photo
        doc.addImage(photo.url, 'JPEG', xPosition, yPosition, photoWidth, photoHeight);
        
        // Add caption
        doc.setFontSize(8);
        doc.text(photo.caption || 'Sem legenda', xPosition, yPosition + photoHeight + 5, { 
          maxWidth: photoWidth 
        });
        
        xPosition += photoWidth + 10; // Move to next photo position
      } catch (e) {
        console.error('Failed to add image to PDF:', e);
        // If image fails, add a placeholder
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(240, 240, 240);
        doc.rect(xPosition, yPosition, photoWidth, photoHeight, 'FD');
        doc.setFontSize(10);
        doc.text('Imagem não disponível', xPosition + photoWidth/2, yPosition + photoHeight/2, { 
          align: 'center' 
        });
        
        // Add caption
        doc.setFontSize(8);
        doc.text(photo.caption || 'Sem legenda', xPosition, yPosition + photoHeight + 5, { 
          maxWidth: photoWidth 
        });
        
        xPosition += photoWidth + 10; // Move to next photo position
      }
    }
  }

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const today = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em ${today} | Meu Diário de Obra Pro | Página ${i} de ${pageCount}`, 10, 290);
  }

  // Return the PDF as a blob
  return doc.output('blob');
};

export default generateRDOPDF;
