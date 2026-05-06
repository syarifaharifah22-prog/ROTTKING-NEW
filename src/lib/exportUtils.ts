
import { Sale } from '../types';
import { format, parseISO } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from 'docx';

// Extend jsPDF with autotable types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}

export interface ExportSummary {
  total: number;
  profitSharing?: {
    modal: number;
    pengelola: number;
    pemilik: number;
  };
}

export const exportToExcel = (data: Sale[], fileName: string, summary?: ExportSummary) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      ID: item.id,
      Tanggal: format(parseISO(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
      Menu: item.items && item.items.length > 0 
        ? item.items.map(i => i.menu_name).join(', ') 
        : item.menu_name || 'No Items',
      Jumlah: item.items && item.items.length > 0
        ? item.items.reduce((acc, i) => acc + i.quantity, 0)
        : item.quantity || 0,
      'Total Harga': item.total_price,
      Bayar: item.payment_amount,
      Kembali: item.change_amount,
    }))
  );

  // Add summary to Excel if available
  if (summary) {
    const summaryData = [
      [],
      ['RINGKASAN LAPORAN'],
      ['Grand Total', summary.total],
    ];

    if (summary.profitSharing) {
      summaryData.push(
        ['BAGI HASIL (50/30/20)'],
        ['Modal (50%)', summary.profitSharing.modal],
        ['Pengelola (30%)', summary.profitSharing.pengelola],
        ['Pemilik (20%)', summary.profitSharing.pemilik]
      );
    }
    XLSX.utils.sheet_add_aoa(worksheet, summaryData, { origin: -1 });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjualan');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${fileName}.xlsx`);
};

export const exportToPDF = (data: Sale[], title: string, fileName: string, summary?: ExportSummary) => {
  const doc = new jsPDF();
  
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, 14, 22);

  const tableData = data.map((item, index) => [
    index + 1,
    format(parseISO(item.created_at), 'dd/MM/yy HH:mm'),
    item.items && item.items.length > 0 
      ? item.items.map(i => i.menu_name).join(', ') 
      : item.menu_name || 'No Items',
    item.items && item.items.length > 0
      ? item.items.reduce((acc, i) => acc + i.quantity, 0)
      : item.quantity || 0,
    `Rp ${item.total_price.toLocaleString('id-ID')}`
  ]);

  doc.autoTable({
    startY: 30,
    head: [['No', 'Waktu', 'Menu', 'Qty', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillStyle: '#3D2B1F' },
    styles: { fontSize: 8 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`GRAND TOTAL: Rp ${summary?.total.toLocaleString('id-ID') || data.reduce((acc, curr) => acc + curr.total_price, 0).toLocaleString('id-ID')}`, 14, finalY);

  if (summary?.profitSharing) {
    const py = finalY + 15;
    doc.setFontSize(11);
    doc.text('BAGI HASIL (50% | 30% | 20%):', 14, py);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`- Modal (50%): Rp ${summary.profitSharing.modal.toLocaleString('id-ID')}`, 14, py + 7);
    doc.text(`- Pengelola (30%): Rp ${summary.profitSharing.pengelola.toLocaleString('id-ID')}`, 14, py + 14);
    doc.text(`- Pemilik (20%): Rp ${summary.profitSharing.pemilik.toLocaleString('id-ID')}`, 14, py + 21);
  }

  doc.save(`${fileName}.pdf`);
};

export const exportToWord = async (data: Sale[], title: string, fileName: string, summary?: ExportSummary) => {
  const tableRows = data.map((item, index) => 
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString(), size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: format(parseISO(item.created_at), 'dd/MM/yy HH:mm'), size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ 
          text: item.items && item.items.length > 0 
            ? item.items.map(i => i.menu_name).join(', ') 
            : item.menu_name || 'No Items', 
          size: 18 
        })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ 
          text: (item.items && item.items.length > 0
            ? item.items.reduce((acc, i) => acc + i.quantity, 0)
            : item.quantity || 0).toString(), 
          size: 18 
        })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Rp ${item.total_price.toLocaleString('id-ID')}`, size: 18 })] })] }),
      ],
    })
  );

  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true, size: 18 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Waktu", bold: true, size: 18 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Menu", bold: true, size: 18 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qty", bold: true, size: 18 })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, size: 18 })] })] }),
    ],
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...tableRows],
  });

  const sections: any[] = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 28 })],
      spacing: { after: 150 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, size: 20 })],
      spacing: { after: 300 }
    }),
    table,
    new Paragraph({
      children: [new TextRun({ text: `\nGRAND TOTAL: Rp ${(summary?.total || 0).toLocaleString('id-ID')}`, bold: true, size: 24 })],
      spacing: { before: 300 }
    }),
  ];

  if (summary?.profitSharing) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "\nRINGKASAN BAGI HASIL (50% | 30% | 20%)", bold: true, size: 22 })],
        spacing: { before: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: `Modal (50%): Rp ${summary.profitSharing.modal.toLocaleString('id-ID')}`, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: `Pengelola (30%): Rp ${summary.profitSharing.pengelola.toLocaleString('id-ID')}`, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: `Pemilik (20%): Rp ${summary.profitSharing.pemilik.toLocaleString('id-ID')}`, size: 20 })] })
    );
  }

  const doc = new Document({
    sections: [{
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
};
