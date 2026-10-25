import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a clean, official-looking government scheme application form PDF directly in the browser.
 * @param {Object} formData - The scheme and applicant information.
 */
export const generateClientPDF = (formData) => {
  try {
    const rawData = formData || {};
    const data = (rawData.data && typeof rawData.data === 'object') ? rawData.data : rawData;
    const schemeName = rawData.schemeName || data.schemeName || rawData.scheme || data.scheme || 'Government Welfare Scheme';

    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    const appId = `APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // 1. Top Decorative Emerald Bar
    doc.setFillColor(5, 150, 105); // #059669
    doc.rect(0, 0, pageWidth, 4, 'F');

    // 2. Header Banner Background
    doc.setFillColor(248, 250, 252); // #f8fafc
    doc.rect(0, 4, pageWidth, 28, 'F');

    // Header Titles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text('Government of India / State Welfare Portal', pageWidth / 2, 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // #475569
    doc.text('Citizen Application & Registration Form', pageWidth / 2, 23, { align: 'center' });

    // 3. Scheme Banner Box
    doc.setFillColor(239, 246, 255); // #eff6ff
    doc.setDrawColor(191, 219, 254); // #bfdbfe
    doc.roundedRect(margin, 36, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 64, 175); // #1e40af
    doc.text(`Scheme: ${schemeName}`, margin + 5, 43.5, { maxWidth: contentWidth - 10 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text(`Application Ref: ${appId}   |   Date Generated: ${today}`, margin + 5, 50);

    // 4. Section 1: Applicant Details
    let currentY = 62;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. APPLICANT DETAILS', margin, currentY);

    doc.setDrawColor(203, 213, 225); // #cbd5e1
    doc.setLineWidth(0.4);
    doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
    currentY += 6;

    // Build fields list
    const fields = [
      { label: 'Full Name', value: data.name || data.fullName || data.applicantName || 'Not Specified' },
      { label: 'Age / DOB', value: data.age ? (String(data.age).includes('year') ? data.age : `${data.age} years`) : (data.dob || 'Not Specified') },
      { label: 'Gender', value: data.gender || 'Not Specified' },
      { label: 'Mobile Number', value: data.phone || data.mobile || data.contact || 'Not Specified' },
      { label: 'Aadhaar / ID No.', value: data.aadhaar || data.aadhar || data.idNumber || 'Not Specified' },
      { label: 'Annual Income', value: data.income ? (String(data.income).startsWith('₹') ? data.income : `₹ ${data.income}`) : 'Not Specified' },
      { label: 'Occupation / Category', value: [data.occupation, data.category].filter(Boolean).join(' / ') || 'Not Specified' },
      { label: 'Residential Address', value: [data.address, data.district, data.state, data.pincode].filter(Boolean).join(', ') || 'Not Specified' }
    ];

    const rowHeight = 9.5;
    const labelColWidth = 48;

    fields.forEach((field) => {
      // Row border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240); // #e2e8f0
      doc.roundedRect(margin, currentY, contentWidth, rowHeight, 1, 1, 'FD');

      // Label background
      doc.setFillColor(241, 245, 249); // #f1f5f9
      doc.rect(margin, currentY, labelColWidth, rowHeight, 'F');

      // Vertical separator
      doc.line(margin + labelColWidth, currentY, margin + labelColWidth, currentY + rowHeight);

      // Label text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // #334155
      doc.text(field.label, margin + 3.5, currentY + 6);

      // Value text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42); // #0f172a
      doc.text(String(field.value), margin + labelColWidth + 3.5, currentY + 6, {
        maxWidth: contentWidth - labelColWidth - 7
      });

      currentY += rowHeight + 1.8;
    });

    currentY += 4;

    // 5. Section 2: Applicant Declaration
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. APPLICANT DECLARATION', margin, currentY);

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
    currentY += 5;

    // Declaration box
    const declHeight = 22;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, declHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const declText = 'I hereby declare that all the information and details provided by me in this application are true, complete, and correct to the best of my knowledge and belief. I understand that in the event of any information being found false, fraudulent, or incorrect at any stage, my application/registration shall stand cancelled and I may be liable for appropriate legal action as per applicable government rules.';
    doc.text(declText, margin + 4, currentY + 5, { maxWidth: contentWidth - 8, align: 'justify', lineHeightFactor: 1.35 });

    currentY += declHeight + 6;

    // 6. Filing Details & Signature
    const boxWidth = (contentWidth - 8) / 2;
    const boxHeight = 26;

    // Left Box: Place & Date
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, boxWidth, boxHeight, 1.5, 1.5, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Application Filing Details', margin + 4, currentY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Date: ${today}`, margin + 4, currentY + 13);
    doc.text('Place: __________________________', margin + 4, currentY + 20);

    // Right Box: Signature
    const rightBoxX = margin + boxWidth + 8;
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(rightBoxX, currentY, boxWidth, boxHeight, 1.5, 1.5, 'D');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('(Affix Signature / Thumb Impression below)', rightBoxX + (boxWidth / 2), currentY + 5.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Signature of Applicant', rightBoxX + (boxWidth / 2), currentY + 21, { align: 'center' });

    // 7. Footer Notice
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const footerText = 'Note: This is an auto-generated pre-filled application form via PolicyPilot Citizen Welfare Assistant. Please submit this form along with required original document photocopies at your nearest Taluk Office, CSC, or designated E-Seva Centre.';
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { maxWidth: contentWidth, align: 'center' });

    // Trigger save
    const cleanScheme = schemeName.replace(/[^a-zA-Z0-9_\s-]/g, '').trim().replace(/\s+/g, '_') || 'Application';
    doc.save(`Application_${cleanScheme}.pdf`);
    return true;
  } catch (error) {
    console.error('Client PDF generation error:', error);
    return false;
  }
};
