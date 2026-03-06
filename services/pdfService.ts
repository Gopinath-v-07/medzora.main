import { MedicalRecord } from '../types';

// This assumes jspdf and jspdf-autotable are loaded from a CDN.
// We are augmenting the global scope to add type definitions for them.
declare global {
    interface Window {
        jspdf: {
            jsPDF: new (options?: any) => jsPDF;
        };
    }
    // This is a common pattern for extending ambient types from libraries loaded via script tags
    // eslint-disable-next-line no-unused-vars
    interface jsPDF {
        autoTable: (options: any) => jsPDF; // Note: return type is jsPDF for chaining
        lastAutoTable: {
            finalY: number;
        };
        // FIX: Add missing properties to jsPDF interface to resolve TypeScript errors.
        setFontSize: (size: number) => jsPDF;
        setFont: (fontName: string, fontStyle?: string) => jsPDF;
        text: (
            text: string | string[],
            x: number,
            y: number,
            options?: any
        ) => jsPDF;
        internal: {
            pageSize: {
                getWidth: () => number;
                getHeight: () => number;
            };
        };
        setTextColor: (ch1: number | string, ch2?: number, ch3?: number) => jsPDF;
        save: (filename: string) => void;
    }
}

export const generateReportPDF = (record: MedicalRecord) => {
    if (!record.aiReport || !record.patientData || !record.verifiedDate || !record.verifiedBy) {
        alert("Cannot generate PDF: Missing required report data.");
        console.error("Cannot generate PDF: Missing required record data.", record);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const primaryColor = [2, 132, 199]; // sky-600
    const accentColor = [224, 242, 254]; // sky-100

    // 1. Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Medzora', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80); // Darker text color
    doc.text('Verified Medical Report', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // 2. Report Details
    doc.autoTable({
        startY: 40,
        head: [['Report ID', 'Date Verified', 'Verified By']],
        body: [[
            record.id.substring(4, 10), // Shorten for aesthetics
            new Date(record.verifiedDate).toLocaleString(),
            record.verifiedBy,
        ]],
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
    });

    const finalYAfterTable = doc.lastAutoTable.finalY;

    // 3. Patient Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 14, finalYAfterTable + 15);

    const medicalHistoryDisplay = record.patientData.medicalHistoryFileName
        ? `File uploaded: ${record.patientData.medicalHistoryFileName}`
        : record.patientData.medicalHistory || 'N/A';

    doc.autoTable({
        startY: finalYAfterTable + 20,
        body: [
            ['Patient ID', record.patientData.id],
            ['Name', record.patientData.name],
            ['Email', record.patientData.email],
            ['Age', record.patientData.age],
            ['Gender', record.patientData.gender],
            ['Symptoms Reported', [...record.patientData.symptoms, record.patientData.otherSymptoms].filter(s => s).join(', ')],
            ['Past Medical History', medicalHistoryDisplay],
            ['Current Medications', record.patientData.currentMedications || 'N/A'],
        ],
        theme: 'grid',
        columnStyles: { 0: { fontStyle: 'bold', fillColor: accentColor } },
    });

    const finalYAfterPatientTable = doc.lastAutoTable.finalY;

    // 4. Doctor's Assessment
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Doctor's Assessment", 14, finalYAfterPatientTable + 15);
    doc.autoTable({
        startY: finalYAfterPatientTable + 20,
        body: [
            ['Diagnosis', record.aiReport.diagnosis],
            ['Severity', record.aiReport.severity],
            ['Recommended Medications', record.aiReport.medication],
            ['Diet Plan', record.aiReport.dietPlan],
            ["Doctor's Notes", record.doctorNotes || 'N/A'],
        ],
        theme: 'grid',
        columnStyles: { 0: { fontStyle: 'bold', fillColor: accentColor } },
    });

    // 5. Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Disclaimer: This is a verified medical report. Please follow the doctor\'s advice.', 14, pageHeight - 10);

    // Save the PDF
    doc.save(`Medzora_Report_${record.id}.pdf`);
};