import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';

interface ContractData {
  title: string;
  contractNumber: string;
  content: string;
  signatures?: {
    name: string;
    role: string;
    signedAt: string;
    signature: string; // base64 image
  }[];
  metadata?: {
    createdAt: string;
    validUntil?: string;
    restaurantName?: string;
    restaurantAddress?: string;
  };
}

export async function generateContractPDF(data: ContractData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add first page
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  let yPosition = height - 50;
  const margin = 50;
  const lineHeight = 20;
  const fontSize = 11;
  const titleFontSize = 18;
  
  // Add logo placeholder (you can replace with actual logo)
  page.drawText('ORIIDO', {
    x: margin,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(1, 0.42, 0.21), // #FF6B35 in RGB
  });
  
  yPosition -= 40;
  
  // Add contract number
  page.drawText(`Vertragsnummer: ${data.contractNumber}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  yPosition -= 30;
  
  // Add title
  page.drawText(data.title, {
    x: margin,
    y: yPosition,
    size: titleFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  
  // Add metadata if available
  if (data.metadata) {
    if (data.metadata.restaurantName) {
      page.drawText(`Restaurant: ${data.metadata.restaurantName}`, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= lineHeight;
    }
    
    if (data.metadata.restaurantAddress) {
      page.drawText(`Adresse: ${data.metadata.restaurantAddress}`, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= lineHeight;
    }
    
    page.drawText(`Datum: ${new Date(data.metadata.createdAt).toLocaleDateString('de-DE')}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= lineHeight;
    
    if (data.metadata.validUntil) {
      page.drawText(`Gültig bis: ${new Date(data.metadata.validUntil).toLocaleDateString('de-DE')}`, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= lineHeight;
    }
  }
  
  yPosition -= 20;
  
  // Add content with word wrapping
  const contentLines = wrapText(data.content, helveticaFont, fontSize, width - 2 * margin);
  
  for (const line of contentLines) {
    if (yPosition < 100) {
      // Add new page if needed
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= lineHeight;
  }
  
  // Add signatures if available
  if (data.signatures && data.signatures.length > 0) {
    // Ensure we have enough space for signatures
    if (yPosition < 200) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    
    yPosition -= 40;
    
    page.drawText('Unterschriften', {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    for (const sig of data.signatures) {
      // Add signature image if available
      if (sig.signature) {
        try {
          const signatureImage = await pdfDoc.embedPng(sig.signature.replace('data:image/png;base64,', ''));
          const signatureDims = signatureImage.scale(0.3);
          
          page.drawImage(signatureImage, {
            x: margin,
            y: yPosition - signatureDims.height,
            width: signatureDims.width,
            height: signatureDims.height,
          });
          
          yPosition -= signatureDims.height + 10;
        } catch (e) {
          console.error('Error embedding signature:', e);
        }
      }
      
      // Add signature info
      page.drawText(`${sig.name} (${sig.role})`, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= lineHeight;
      
      page.drawText(`Unterzeichnet am: ${new Date(sig.signedAt).toLocaleString('de-DE')}`, {
        x: margin,
        y: yPosition,
        size: 9,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      yPosition -= 40;
    }
  }
  
  // Add footer to all pages
  const pages = pdfDoc.getPages();
  pages.forEach((p, idx) => {
    p.drawText(`Seite ${idx + 1} von ${pages.length}`, {
      x: width / 2 - 30,
      y: 30,
      size: 9,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    p.drawText('Erstellt mit Oriido Digital', {
      x: margin,
      y: 30,
      size: 9,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Handle line breaks in original text
  const finalLines: string[] = [];
  for (const line of lines) {
    const subLines = line.split('\n');
    finalLines.push(...subLines);
  }
  
  return finalLines;
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  // Create a new Uint8Array to ensure compatibility
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}