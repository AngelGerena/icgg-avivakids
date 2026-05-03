import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

interface ExportChild {
  id: string;
  full_name: string;
  unique_number: string;
  dob: string;
  room: string;
  photo_url?: string;
  checked_in_today: boolean;
  check_in_time?: string;
  parents?: Array<{
    primary_name: string;
    primary_phone: string;
    primary_email: string;
    secondary_name?: string;
    secondary_phone?: string;
    secondary_email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>;
  intake_forms?: {
    allergies?: string[];
    medical_conditions?: string;
    special_needs?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medications?: string;
    doctor_name?: string;
    doctor_phone?: string;
    authorized_pickups?: string[];
  };
}

export const exportToPDF = async (children: ExportChild[], includeQR: boolean = true) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ICGG Aviva Kids - Complete Records', pageWidth / 2, 20, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 28, { align: 'center' });
  pdf.text(`Total Children: ${children.length}`, pageWidth / 2, 34, { align: 'center' });

  pdf.setFontSize(8);
  pdf.setTextColor(150, 100, 0);
  pdf.setFont('helvetica', 'bold');
  const disclaimerLine1 = 'CONFIDENCIAL: Esta información es confidencial y será utilizada únicamente para el cuidado del menor.';
  pdf.text(disclaimerLine1, pageWidth / 2, 40, { align: 'center', maxWidth: pageWidth - 30 });

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const legalText = 'Protected under Florida law. Access restricted to authorized ministry personnel only. Not to be shared without consent.';
  pdf.text(legalText, pageWidth / 2, 44, { align: 'center', maxWidth: pageWidth - 30 });

  pdf.setTextColor(0, 0, 0);

  let yPosition = 52;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setDrawColor(206, 147, 216);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 0.5, 'F');
    yPosition += 5;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(126, 87, 194);
    pdf.text(`${child.full_name}`, margin, yPosition);

    pdf.setFontSize(12);
    pdf.setTextColor(88, 166, 255);
    pdf.text(`#${child.unique_number}`, pageWidth - margin - 30, yPosition, { align: 'right' });
    yPosition += 8;

    if (includeQR) {
      try {
        const qrDataUrl = await QRCode.toDataURL(
          JSON.stringify({ childNumber: child.unique_number, childId: child.id }),
          { width: 200, margin: 1 }
        );
        pdf.addImage(qrDataUrl, 'PNG', pageWidth - margin - 25, yPosition, 20, 20);
      } catch (error) {
        console.error('QR generation error:', error);
      }
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);

    pdf.text('Child Information', margin, yPosition);
    yPosition += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date of Birth: ${new Date(child.dob + 'T12:00:00').toLocaleDateString()}`, margin + 5, yPosition);
    yPosition += 5;
    pdf.text(`Room/Class: ${child.room}`, margin + 5, yPosition);
    yPosition += 5;

    if (child.checked_in_today && child.check_in_time) {
      pdf.setTextColor(0, 150, 0);
      pdf.text(`✓ Checked in today at ${new Date(child.check_in_time).toLocaleTimeString()}`, margin + 5, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 5;
    }
    yPosition += 3;

    if (child.parents && child.parents[0]) {
      const parent = child.parents[0];

      pdf.setFont('helvetica', 'bold');
      pdf.text('Parent/Guardian Information', margin, yPosition);
      yPosition += 5;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Primary Contact: ${parent.primary_name}`, margin + 5, yPosition);
      yPosition += 5;
      pdf.text(`Phone: ${parent.primary_phone}`, margin + 5, yPosition);
      yPosition += 5;
      pdf.text(`Email: ${parent.primary_email || 'N/A'}`, margin + 5, yPosition);
      yPosition += 5;

      if (parent.address) {
        const fullAddress = `${parent.address}, ${parent.city || ''} ${parent.state || ''} ${parent.zip || ''}`.trim();
        pdf.text(`Address: ${fullAddress}`, margin + 5, yPosition);
        yPosition += 5;
      }

      if (parent.secondary_name) {
        yPosition += 2;
        pdf.text(`Secondary Contact: ${parent.secondary_name}`, margin + 5, yPosition);
        yPosition += 5;
        if (parent.secondary_phone) {
          pdf.text(`Phone: ${parent.secondary_phone}`, margin + 5, yPosition);
          yPosition += 5;
        }
        if (parent.secondary_email) {
          pdf.text(`Email: ${parent.secondary_email}`, margin + 5, yPosition);
          yPosition += 5;
        }
      }
      yPosition += 3;
    }

    if (child.intake_forms) {
      const intake = child.intake_forms;

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(239, 83, 80);
      pdf.text('Medical & Emergency Information', margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 5;

      pdf.setFont('helvetica', 'normal');

      if (intake.allergies && intake.allergies.length > 0) {
        pdf.text(`Allergies: ${intake.allergies.join(', ')}`, margin + 5, yPosition);
        yPosition += 5;
      } else {
        pdf.text('Allergies: None', margin + 5, yPosition);
        yPosition += 5;
      }

      if (intake.medical_conditions) {
        pdf.text(`Medical Conditions: ${intake.medical_conditions}`, margin + 5, yPosition);
        yPosition += 5;
      }

      if (intake.medications) {
        pdf.text(`Medications: ${intake.medications}`, margin + 5, yPosition);
        yPosition += 5;
      }

      if (intake.special_needs) {
        pdf.text(`Special Needs: ${intake.special_needs}`, margin + 5, yPosition);
        yPosition += 5;
      }

      if (intake.emergency_contact_name) {
        yPosition += 2;
        pdf.text(`Emergency Contact: ${intake.emergency_contact_name}`, margin + 5, yPosition);
        yPosition += 5;
        if (intake.emergency_contact_phone) {
          pdf.text(`Emergency Phone: ${intake.emergency_contact_phone}`, margin + 5, yPosition);
          yPosition += 5;
        }
      }

      if (intake.doctor_name) {
        pdf.text(`Doctor: ${intake.doctor_name}`, margin + 5, yPosition);
        yPosition += 5;
        if (intake.doctor_phone) {
          pdf.text(`Doctor Phone: ${intake.doctor_phone}`, margin + 5, yPosition);
          yPosition += 5;
        }
      }

      if (intake.authorized_pickups && intake.authorized_pickups.length > 0) {
        yPosition += 2;
        pdf.text(`Authorized Pickups: ${intake.authorized_pickups.join(', ')}`, margin + 5, yPosition);
        yPosition += 5;
      }
    }

    yPosition += 8;
  }

  pdf.save(`children-records-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (children: ExportChild[]) => {
  const workbook = XLSX.utils.book_new();

  const childrenData = children.map(child => {
    const parent = child.parents && child.parents[0];
    const intake = child.intake_forms;

    return {
      'Child Name': child.full_name,
      'Child Number': child.unique_number,
      'Date of Birth': new Date(child.dob + 'T12:00:00').toLocaleDateString(),
      'Room/Class': child.room,
      'Checked In Today': child.checked_in_today ? 'Yes' : 'No',
      'Check-in Time': child.check_in_time ? new Date(child.check_in_time).toLocaleTimeString() : 'N/A',

      'Primary Contact Name': parent?.primary_name || '',
      'Primary Phone': parent?.primary_phone || '',
      'Primary Email': parent?.primary_email || '',
      'Secondary Contact Name': parent?.secondary_name || '',
      'Secondary Phone': parent?.secondary_phone || '',
      'Secondary Email': parent?.secondary_email || '',
      'Address': parent?.address || '',
      'City': parent?.city || '',
      'State': parent?.state || '',
      'ZIP': parent?.zip || '',

      'Allergies': intake?.allergies?.join(', ') || 'None',
      'Medical Conditions': intake?.medical_conditions || 'None',
      'Medications': intake?.medications || 'None',
      'Special Needs': intake?.special_needs || 'None',
      'Emergency Contact': intake?.emergency_contact_name || '',
      'Emergency Phone': intake?.emergency_contact_phone || '',
      'Doctor Name': intake?.doctor_name || '',
      'Doctor Phone': intake?.doctor_phone || '',
      'Authorized Pickups': intake?.authorized_pickups?.join(', ') || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(childrenData);

  const colWidths = [
    { wch: 20 }, // Child Name
    { wch: 12 }, // Child Number
    { wch: 12 }, // DOB
    { wch: 12 }, // Room
    { wch: 12 }, // Checked In
    { wch: 12 }, // Check-in Time
    { wch: 20 }, // Primary Contact
    { wch: 15 }, // Primary Phone
    { wch: 25 }, // Primary Email
    { wch: 20 }, // Secondary Contact
    { wch: 15 }, // Secondary Phone
    { wch: 25 }, // Secondary Email
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 8 },  // State
    { wch: 10 }, // ZIP
    { wch: 30 }, // Allergies
    { wch: 30 }, // Medical Conditions
    { wch: 30 }, // Medications
    { wch: 30 }, // Special Needs
    { wch: 20 }, // Emergency Contact
    { wch: 15 }, // Emergency Phone
    { wch: 20 }, // Doctor Name
    { wch: 15 }, // Doctor Phone
    { wch: 40 }, // Authorized Pickups
  ];

  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Children Records');

  XLSX.writeFile(workbook, `children-records-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportSummaryTable = (children: ExportChild[]) => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ICGG Aviva Kids - Summary Report', 15, 15);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);
  pdf.text(`Total Children: ${children.length}`, 15, 27);

  pdf.setFontSize(7);
  pdf.setTextColor(150, 100, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONFIDENCIAL: Esta informacion es confidencial y sera utilizada unicamente para el cuidado del menor.', 15, 33);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');

  const tableData = children.map(child => {
    const parent = child.parents && child.parents[0];
    const intake = child.intake_forms;

    return [
      child.full_name,
      child.unique_number,
      new Date(child.dob + 'T12:00:00').toLocaleDateString(),
      child.room,
      parent?.primary_name || '',
      parent?.primary_phone || '',
      intake?.allergies?.join(', ') || 'Ninguna',
      child.checked_in_today ? 'Si' : 'No',
    ];
  });

  autoTable(pdf, {
    startY: 38,
    head: [['Nombre', 'Numero', 'Fecha Nac.', 'Sala', 'Padre/Madre', 'Telefono', 'Alergias', 'Presente']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [126, 87, 194], fontSize: 9, fontStyle: 'bold', textColor: 255 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 18 },
      2: { cellWidth: 24 },
      3: { cellWidth: 28 },
      4: { cellWidth: 38 },
      5: { cellWidth: 30 },
      6: { cellWidth: 50 },
      7: { cellWidth: 18, halign: 'center' },
    },
  });

  pdf.save(`children-summary-${new Date().toISOString().split('T')[0]}.pdf`);
};
