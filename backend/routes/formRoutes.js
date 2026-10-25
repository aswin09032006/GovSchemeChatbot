import express from 'express';
import PDFDocument from 'pdfkit';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Optional authentication: extracts user if valid token exists, but doesn't block download if missing
router.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gov_scheme_chatbot_jwt_super_secret_key_2026_secure');
      req.user = decoded;
    } catch {
      // Continue even if token is expired or signed by another instance
    }
  }
  next();
});

router.post('/generate', async (req, res) => {
  try {
    const rawBody = req.body || {};
    // Extract nested or flat form data flexibly
    const data = (rawBody.data && typeof rawBody.data === 'object') ? rawBody.data : rawBody;
    const schemeName = rawBody.schemeName || data.schemeName || rawBody.scheme || data.scheme || 'Government Welfare Scheme';

    if (!data || (typeof data !== 'object')) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    const appId = `APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    // Set response headers for PDF download
    const cleanSchemeName = schemeName.replace(/[^a-zA-Z0-9_\s-]/g, '').trim().replace(/\s+/g, '_') || 'Application';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Application_${cleanSchemeName}.pdf"`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // --- Draw PDF Content ---
    const pageWidth = doc.page.width;
    
    // Top Decorative Bar
    doc.rect(0, 0, pageWidth, 8).fill('#059669'); // Emerald green accent
    
    // Header Banner
    doc.rect(0, 8, pageWidth, 80).fill('#f8fafc');
    doc.fillColor('#0f172a')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('Government of India / State Welfare Portal', 40, 24, { align: 'center' });
    
    doc.fillColor('#475569')
       .fontSize(11)
       .font('Helvetica')
       .text('Citizen Application & Registration Form', 40, 52, { align: 'center' });

    // Scheme Name Banner
    doc.roundedRect(40, 105, pageWidth - 80, 50, 6)
       .fillAndStroke('#eff6ff', '#bfdbfe');
       
    doc.fillColor('#1e40af')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`Scheme: ${schemeName}`, 55, 116, { width: pageWidth - 110 });
       
    doc.fillColor('#64748b')
       .fontSize(9)
       .font('Helvetica')
       .text(`Application Ref: ${appId}   |   Date Generated: ${today}`, 55, 137);

    // Section Title: Applicant Details
    let currentY = 175;
    doc.fillColor('#0f172a')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('1. APPLICANT DETAILS', 40, currentY);
       
    doc.moveTo(40, currentY + 16).lineTo(pageWidth - 40, currentY + 16).strokeColor('#cbd5e1').stroke();
    currentY += 28;

    // Build fields list
    const fields = [
      { label: 'Full Name', value: data.name || data.fullName || data.applicantName || 'Not Specified' },
      { label: 'Age / DOB', value: data.age ? `${data.age} years` : (data.dob || 'Not Specified') },
      { label: 'Gender', value: data.gender || 'Not Specified' },
      { label: 'Mobile Number', value: data.phone || data.mobile || data.contact || 'Not Specified' },
      { label: 'Aadhaar / ID No.', value: data.aadhaar || data.aadhar || data.idNumber || 'Not Specified' },
      { label: 'Annual Family Income', value: data.income ? (data.income.toString().startsWith('₹') ? data.income : `₹ ${data.income}`) : 'Not Specified' },
      { label: 'Occupation / Category', value: [data.occupation, data.category].filter(Boolean).join(' / ') || 'Not Specified' },
      { label: 'Residential Address', value: [data.address, data.district, data.state, data.pincode].filter(Boolean).join(', ') || 'Not Specified' }
    ];

    // Filter fields to those relevant
    fields.forEach((field) => {
      // Row box
      doc.roundedRect(40, currentY, pageWidth - 80, 26, 3)
         .fillAndStroke('#ffffff', '#e2e8f0');

      // Label background
      doc.roundedRect(40, currentY, 150, 26, 3)
         .fill('#f1f5f9');

      // Label text
      doc.font('Helvetica-Bold')
         .fontSize(9.5)
         .fillColor('#334155')
         .text(field.label, 50, currentY + 7);

      // Value text
      doc.font('Helvetica')
         .fontSize(9.5)
         .fillColor('#0f172a')
         .text(String(field.value), 200, currentY + 7, { width: pageWidth - 250, ellipsis: true });

      currentY += 32;
    });

    currentY += 15;

    // Declaration section
    doc.fillColor('#0f172a')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('2. APPLICANT DECLARATION', 40, currentY);
       
    doc.moveTo(40, currentY + 16).lineTo(pageWidth - 40, currentY + 16).strokeColor('#cbd5e1').stroke();
    currentY += 26;

    doc.roundedRect(40, currentY, pageWidth - 80, 52, 4)
       .fillAndStroke('#f8fafc', '#e2e8f0');

    doc.font('Helvetica')
       .fontSize(8.5)
       .fillColor('#475568')
       .text(
         'I hereby declare that all the information and details provided by me in this application are true, complete, and correct to the best of my knowledge and belief. I understand that in the event of any information being found false, fraudulent, or incorrect at any stage, my application/registration shall stand cancelled and I may be liable for appropriate legal action as per applicable government rules.',
         50,
         currentY + 8,
         { width: pageWidth - 100, align: 'justify', lineGap: 2 }
       );

    currentY += 75;

    // Signatures and Dates
    // Left Box: Date & Place
    doc.roundedRect(40, currentY, 200, 70, 4).strokeColor('#cbd5e1').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text('Application Filing Details', 50, currentY + 10);
    doc.font('Helvetica').fontSize(9).fillColor('#475568')
       .text(`Date: ${today}`, 50, currentY + 30)
       .text('Place: _________________________', 50, currentY + 48);

    // Right Box: Signature / Thumb Impression
    doc.roundedRect(pageWidth - 240, currentY, 200, 70, 4).strokeColor('#cbd5e1').stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('#94a3b8').text('(Affix Signature / Thumb Impression below)', pageWidth - 235, currentY + 8, { align: 'center', width: 190 });
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text('Signature of Applicant', pageWidth - 235, currentY + 52, { align: 'center', width: 190 });

    // Footer notice
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#94a3b8')
       .text('Note: This is an auto-generated pre-filled application form via PolicyPilot Citizen Welfare Assistant. Please submit this form along with required original document photocopies at your nearest Taluk Office, CSC, or designated E-Seva Centre.', 40, doc.page.height - 45, { width: pageWidth - 80, align: 'center' });

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
