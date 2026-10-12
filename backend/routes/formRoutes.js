import express from 'express';
import PDFDocument from 'pdfkit';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/generate', async (req, res) => {
  try {
    const { schemeName, data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Application_${schemeName ? schemeName.replace(/\s+/g, '_') : 'Form'}.pdf`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // --- Draw PDF Content ---
    
    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#f0f4f8');
    doc.fillColor('#1a202c')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Government Scheme Application Form', 0, 40, { align: 'center' });
       
    doc.moveDown(2);

    // Scheme Name
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#2d3748')
       .text(`Scheme: ${schemeName || 'General Welfare Scheme'}`, 50, 120);
       
    doc.moveTo(50, 145).lineTo(550, 145).strokeColor('#e2e8f0').stroke();
    
    doc.moveDown(2);

    // Form Data Sections
    const startY = 170;
    const lineSpacing = 30;
    
    const fields = [
      { label: 'Full Name', value: data.name },
      { label: 'Age', value: data.age },
      { label: 'Address', value: data.address },
      { label: 'Aadhaar Number', value: data.aadhaar },
      { label: 'Annual Income', value: data.income },
    ];

    doc.fontSize(12).font('Helvetica');
    
    fields.forEach((field, i) => {
      const y = startY + (i * lineSpacing);
      
      // Label
      doc.font('Helvetica-Bold')
         .fillColor('#4a5568')
         .text(`${field.label}:`, 50, y);
         
      // Value Box
      doc.rect(170, y - 5, 380, 20)
         .fillAndStroke('#f7fafc', '#cbd5e0');
         
      // Value Text
      doc.font('Helvetica')
         .fillColor('#1a202c')
         .text(field.value || 'N/A', 175, y - 1);
    });
    
    // Declaration section
    const declarationY = startY + (fields.length * lineSpacing) + 50;
    
    doc.font('Helvetica-Bold')
       .fillColor('#2d3748')
       .text('Declaration', 50, declarationY);
       
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#4a5568')
       .text('I hereby declare that all the information provided above is true and correct to the best of my knowledge.', 50, declarationY + 20, { width: 500, align: 'justify' });

    // Signature section
    doc.rect(50, declarationY + 80, 200, 50).stroke();
    doc.text('Applicant Signature', 100, declarationY + 140);
    
    doc.text('Date: _______________', 350, declarationY + 120);

    // Finalize PDF file
    doc.end();

  } catch (err) {
    console.error("Error generating PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
});

export default router;
